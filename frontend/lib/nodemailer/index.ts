import nodemailer from 'nodemailer';
import {
    WELCOME_EMAIL_TEMPLATE,
    NEWS_SUMMARY_EMAIL_TEMPLATE,
    STOCK_ALERT_UPPER_EMAIL_TEMPLATE,
    STOCK_ALERT_LOWER_EMAIL_TEMPLATE,
} from "@/lib/nodemailer/templates";
import { formatPrice, formatChangePercent } from '@/lib/utils';

export const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL!,
        pass: process.env.NODEMAILER_PASSWORD!,
    }
})

export const sendWelcomeEmail = async ({ email, name, intro }: WelcomeEmailData) => {
    const htmlTemplate = WELCOME_EMAIL_TEMPLATE
        .replace('{{name}}', name)
        .replace('{{intro}}', intro);

    const mailOptions = {
        from: `"Koyn" <koyn@jsmastery.pro>`,
        to: email,
        subject: `Welcome to Koyn - your stock market toolkit is ready!`,
        text: 'Thanks for joining Koyn',
        html: htmlTemplate,
    }

    await transporter.sendMail(mailOptions);
}

export const sendNewsSummaryEmail = async (
    { email, date, newsContent }: { email: string; date: string; newsContent: string }
): Promise<void> => {
    const htmlTemplate = NEWS_SUMMARY_EMAIL_TEMPLATE
        .replace('{{date}}', date)
        .replace('{{newsContent}}', newsContent);

    const mailOptions = {
        from: `"Koyn News" <koyn@jsmastery.pro>`,
        to: email,
        subject: `Koyn: Today's Market News & Updates`,
        text: `Today's market news summary from Koyn`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};

export const sendAlertEmail = async ({
    email,
    symbol,
    company,
    alertType,
    threshold,
    currentPrice,
    changePercent,
    aiInference,
    headingText,
}: {
    email: string;
    symbol: string;
    company: string;
    alertType: 'upper' | 'lower';
    threshold: number;
    currentPrice: number;
    changePercent: number;
    aiInference: string;
    headingText: string;
}): Promise<void> => {
    const template = alertType === 'upper'
        ? STOCK_ALERT_UPPER_EMAIL_TEMPLATE
        : STOCK_ALERT_LOWER_EMAIL_TEMPLATE;

    const timestamp = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
    });

    const condition = alertType === 'upper' ? '>' : '<';
    const changeStr = formatChangePercent(changePercent);
    const changeColor = changePercent >= 0 ? '#10b981' : '#ef4444';

    const alertDetailsHtml = `
        <h3 class="dark-text" style="margin: 0 0 15px 0; font-size: 18px; font-weight: 600; color: #ffffff;">
            Alert Details
        </h3>
        <p class="mobile-text dark-text-secondary" style="margin: 0 0 10px 0; font-size: 16px; line-height: 1.5; color: #9ca3af;">
            Your alert for <strong>${company} (${symbol})</strong> just triggered:
        </p>
        <ul style="margin: 10px 0 0 0; padding-left: 20px; list-style-type: disc;">
            <li style="margin: 0 0 8px 0; font-size: 14px; color: #CCDADC;">
                Condition: <strong>Price ${condition} ${formatPrice(threshold)}</strong>
            </li>
            <li style="margin: 0 0 8px 0; font-size: 14px; color: #CCDADC;">
                Current Price: <strong>${formatPrice(currentPrice)}</strong>
            </li>
            <li style="margin: 0 0 8px 0; font-size: 14px; color: #CCDADC;">
                Change: <strong style="color: ${changeColor};">${changeStr}</strong>
            </li>
        </ul>
    `;

    const opportunityHtml = `
        <h3 style="margin: 0 0 8px 0; font-size: 18px; font-weight: 600; color: #E8BA40;">
            ${headingText}
        </h3>
        ${aiInference}
    `;

    let htmlTemplate = template
        .replace('{{timestamp}}', timestamp)
        .replace(/\{\{symbol\}\}/g, `${symbol} - ${company}`)
        .replace('{{company}}', `Current Price:`)
        .replace('{{currentPrice}}', formatPrice(currentPrice))
        .replace(/\{\{targetPrice\}\}/g, formatPrice(threshold));

    // Replace the Alert Details section with enhanced version
    htmlTemplate = htmlTemplate.replace(
        /<!-- Alert Details -->[\s\S]*?<\/div>\s*(?=\s*<!-- (?:Success|Opportunity) Message -->)/,
        `<!-- Alert Details -->
        <div class="dark-info-box" style="background-color: #212328; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            ${alertDetailsHtml}
        </div>
        `
    );

    // Replace the opportunity/success message with AI inference
    htmlTemplate = htmlTemplate.replace(
        /<!-- (?:Success|Opportunity) Message -->[\s\S]*?<\/div>\s*(?=\s*<!-- Action Button -->)/,
        `<!-- AI Inference Message -->
        <div style="background-color: #050505; border: 1px solid #374151; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
            ${opportunityHtml}
        </div>
        `
    );

    const subjectEmoji = alertType === 'upper' ? '📈' : '📉';
    const subjectText = alertType === 'upper' ? 'Price Above Reached' : 'Price Below Hit';

    const mailOptions = {
        from: `"Koyn Alerts" <koyn@jsmastery.pro>`,
        to: email,
        subject: `${subjectEmoji} ${subjectText}: ${symbol} - ${formatPrice(currentPrice)}`,
        text: `Your price alert for ${symbol} has been triggered. Current price: ${formatPrice(currentPrice)}`,
        html: htmlTemplate,
    };

    await transporter.sendMail(mailOptions);
};
