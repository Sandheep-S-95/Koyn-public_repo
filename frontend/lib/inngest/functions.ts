import { inngest } from "@/lib/inngest/client";
import { NEWS_SUMMARY_EMAIL_PROMPT, PERSONALIZED_WELCOME_EMAIL_PROMPT, ALERT_AI_INFERENCE_PROMPT } from "@/lib/inngest/prompts";
import { sendNewsSummaryEmail, sendWelcomeEmail, sendAlertEmail } from "@/lib/nodemailer";
import { getAllUsersForNewsEmail } from "@/lib/actions/user.actions";
import { getWatchlistSymbolsByEmail } from "@/lib/actions/watchlist.actions";
import { getNews } from "@/lib/actions/finnhub.actions";
import { getFormattedTodayDate, formatPrice } from "@/lib/utils";
import { connectToDatabase } from "@/database/mongoose";
import { Alert } from "@/database/models/alert.model";
import { Watchlist } from "@/database/models/watchlist.model";

export const sendSignUpEmail = inngest.createFunction(
    { id: 'sign-up-email', triggers: [{ event: 'app/user.created' }] },
    async ({ event, step }) => {
        const data = event.data as any;
        const userProfile = `
            - Country: ${data.country}
            - Investment goals: ${data.investmentGoals}
            - Risk tolerance: ${data.riskTolerance}
            - Preferred industry: ${data.preferredIndustry}
        `

        const prompt = PERSONALIZED_WELCOME_EMAIL_PROMPT.replace('{{userProfile}}', userProfile)

        let introText = await step.run('generate-welcome-intro', async () => {
            try {
                const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                });
                if (!res.ok) return null;
                const data = await res.json();
                return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
            } catch (e) {
                return null;
            }
        });

        await step.run('send-welcome-email', async () => {
            introText = introText || 'Thanks for joining Koyn. You now have the tools to track markets and make smarter moves.'

            const { email, name } = data;

            return await sendWelcomeEmail({ email, name, intro: introText });
        })

        return {
            success: true,
            message: 'Welcome email sent successfully'
        }
    }
)

export const sendDailyNewsSummary = inngest.createFunction(
    { id: 'daily-news-summary', triggers: [{ event: 'app/send.daily.news' }, { cron: '0 12 * * *' }] },
    async ({ step }) => {
        // Step #1: Get all users for news delivery
        const users = await step.run('get-all-users', getAllUsersForNewsEmail)

        if (!users || users.length === 0) return { success: false, message: 'No users found for news email' };

        // Step #2: For each user, get watchlist symbols -> fetch news (fallback to general)
        const results = await step.run('fetch-user-news', async () => {
            const perUser: Array<{ user: UserForNewsEmail; articles: MarketNewsArticle[] }> = [];
            for (const user of users as UserForNewsEmail[]) {
                try {
                    const symbols = await getWatchlistSymbolsByEmail(user.email);
                    let articles = await getNews(symbols, user.email);
                    // Enforce max 6 articles per user
                    articles = (articles || []).slice(0, 6);
                    // If still empty, fallback to general
                    if (!articles || articles.length === 0) {
                        articles = await getNews(undefined, user.email);
                        articles = (articles || []).slice(0, 6);
                    }
                    perUser.push({ user, articles });
                } catch (e) {
                    console.error('daily-news: error preparing user news', user.email, e);
                    perUser.push({ user, articles: [] });
                }
            }
            return perUser;
        });

        // Step #3: (placeholder) Summarize news via AI
        const userNewsSummaries: { user: UserForNewsEmail; newsContent: string | null }[] = [];

        for (const { user, articles } of results) {
            try {
                const prompt = NEWS_SUMMARY_EMAIL_PROMPT.replace('{{newsData}}', JSON.stringify(articles, null, 2));

                let newsContent = await step.run(`summarize-news-${user.email}`, async () => {
                    try {
                        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                        });
                        if (!res.ok) return null;
                        const data = await res.json();
                        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
                    } catch (e) {
                        return null;
                    }
                });

                newsContent = newsContent || 'No market news today.';

                userNewsSummaries.push({ user, newsContent });
            } catch (e) {
                console.error('Failed to summarize news for : ', user.email);
                userNewsSummaries.push({ user, newsContent: null });
            }
        }

        // Step #4: (placeholder) Send the emails
        await step.run('send-news-emails', async () => {
            await Promise.all(
                userNewsSummaries.map(async ({ user, newsContent }) => {
                    if (!newsContent) return false;

                    return await sendNewsSummaryEmail({ email: user.email, date: getFormattedTodayDate(), newsContent })
                })
            )
        })

        return { success: true, message: 'Daily news summary emails sent successfully' }
    }
)

export const checkPriceAlerts = inngest.createFunction(
    { id: 'check-price-alerts', triggers: [{ event: 'app/check.alerts' }, { cron: '*/15 * * * *' }] },
    async ({ step }) => {
        // Step 1: Get all untriggered alerts
        const alerts = await step.run('get-untriggered-alerts', async () => {
            await connectToDatabase();
            const items = await Alert.find({ isTriggered: false }).lean();
            return items.map((a) => ({
                id: String(a._id),
                userId: String(a.userId),
                symbol: String(a.symbol),
                company: String(a.company),
                alertName: String(a.alertName),
                alertType: a.alertType as 'upper' | 'lower',
                threshold: Number(a.threshold),
            }));
        });

        if (!alerts || alerts.length === 0) {
            return { success: true, message: 'No active alerts to check' };
        }

        // Step 2: Check current prices for each alert symbol
        const triggeredAlerts = await step.run('check-prices', async () => {
            const token = process.env.FINNHUB_API_KEY || process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
            if (!token) return [];

            const priceCache: Record<string, { c: number; dp: number }> = {};
            const triggered: Array<{
                id: string;
                userId: string;
                symbol: string;
                company: string;
                alertName: string;
                alertType: 'upper' | 'lower';
                threshold: number;
                currentPrice: number;
                changePercent: number;
            }> = [];

            for (const alert of alerts) {
                try {
                    let priceData = priceCache[alert.symbol];
                    if (!priceData) {
                        const url = `https://finnhub.io/api/v1/quote?symbol=${alert.symbol}&token=${token}`;
                        const res = await fetch(url, { cache: 'no-store' });
                        if (res.ok) {
                            priceData = await res.json();
                            priceCache[alert.symbol] = priceData;
                        }
                    }

                    if (!priceData || !priceData.c) continue;

                    const currentPrice = priceData.c;
                    const changePercent = priceData.dp || 0;

                    let isTriggered = false;
                    if (alert.alertType === 'upper' && currentPrice >= alert.threshold) {
                        isTriggered = true;
                    } else if (alert.alertType === 'lower' && currentPrice <= alert.threshold) {
                        isTriggered = true;
                    }

                    if (isTriggered) {
                        triggered.push({
                            ...alert,
                            currentPrice,
                            changePercent,
                        });
                    }
                } catch (e) {
                    console.error(`Error checking price for alert ${alert.id}:`, e);
                }
            }

            return triggered;
        });

        if (!triggeredAlerts || triggeredAlerts.length === 0) {
            return { success: true, message: 'No alerts triggered' };
        }

        // Step 3: Mark alerts as triggered and get user emails
        const alertsWithEmails = await step.run('mark-and-get-emails', async () => {
            await connectToDatabase();
            const db = (await connectToDatabase()).connection.db;
            if (!db) return [];

            const results: Array<{
                email: string;
                symbol: string;
                company: string;
                alertName: string;
                alertType: 'upper' | 'lower';
                threshold: number;
                currentPrice: number;
                changePercent: number;
            }> = [];

            for (const alert of triggeredAlerts) {
                try {
                    // Mark as triggered
                    await Alert.findByIdAndUpdate(alert.id, { isTriggered: true });

                    // Get user email
                    const userQuery = [];
                    if (alert.userId) {
                        userQuery.push({ id: alert.userId });
                        userQuery.push({ _id: alert.userId });
                        if (alert.userId.length === 24) {
                            userQuery.push({ _id: new (require('mongoose').Types.ObjectId)(alert.userId) });
                        }
                    }

                    const user = await db.collection('user').findOne<{ email?: string }>(
                        userQuery.length > 0 ? { $or: userQuery } : { id: alert.userId }
                    );

                    if (user?.email) {
                        results.push({
                            email: user.email,
                            symbol: alert.symbol,
                            company: alert.company,
                            alertName: alert.alertName,
                            alertType: alert.alertType,
                            threshold: alert.threshold,
                            currentPrice: alert.currentPrice,
                            changePercent: alert.changePercent,
                        });
                    }
                } catch (e) {
                    console.error(`Error processing triggered alert ${alert.id}:`, e);
                }
            }

            return results;
        });

        // Step 4: Generate AI inferences and send emails
        for (const alert of alertsWithEmails) {
            try {
                const condition = alert.alertType === 'upper' ? '>' : '<';
                const alertTypeLabel = alert.alertType === 'upper' ? 'Price Above Reached' : 'Price Below Hit';

                const prompt = ALERT_AI_INFERENCE_PROMPT
                    .replace('{{symbol}}', alert.symbol)
                    .replace('{{company}}', alert.company)
                    .replace('{{alertType}}', alert.alertType)
                    .replace('{{alertTypeLabel}}', alertTypeLabel)
                    .replace('{{condition}}', condition)
                    .replace('{{threshold}}', formatPrice(alert.threshold))
                    .replace('{{currentPrice}}', formatPrice(alert.currentPrice))
                    .replace('{{changePercent}}', String(alert.changePercent));

                let aiInference = await step.run(`alert-inference-${alert.symbol}-${Date.now()}`, async () => {
                    try {
                        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
                        });
                        if (!res.ok) return null;
                        const data = await res.json();
                        return data?.candidates?.[0]?.content?.parts?.[0]?.text || null;
                    } catch (e) {
                        return null;
                    }
                });

                aiInference = aiInference || (alert.alertType === 'upper'
                    ? `${alert.symbol} has reached your target price! This could be a good time to review your position and consider taking profits.`
                    : `${alert.symbol} dropped below your target price. This might be a good time to buy.`);

                const headingText = alert.alertType === 'upper' ? 'Opportunity Alert!' : 'Price Dropped!';

                await step.run(`send-alert-email-${alert.symbol}-${Date.now()}`, async () => {
                    return await sendAlertEmail({
                        email: alert.email,
                        symbol: alert.symbol,
                        company: alert.company,
                        alertType: alert.alertType,
                        threshold: alert.threshold,
                        currentPrice: alert.currentPrice,
                        changePercent: alert.changePercent,
                        aiInference,
                        headingText,
                    });
                });
            } catch (e) {
                console.error(`Error sending alert email for ${alert.symbol}:`, e);
            }
        }

        return {
            success: true,
            message: `Processed ${triggeredAlerts.length} triggered alerts`,
        };
    }
);
