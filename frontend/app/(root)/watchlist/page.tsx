import React from 'react';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getWatchlist } from '@/lib/actions/watchlist.actions';
import { getAlerts } from '@/lib/actions/alert.actions';
import { getNews } from '@/lib/actions/finnhub.actions';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import WatchlistTable from '@/components/WatchlistTable';
import AlertsList from '@/components/AlertsList';
import WatchlistNews from '@/components/WatchlistNews';

const WatchlistPage = async () => {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) redirect('/sign-in');

  const userEmail = session.user.email;

  // Fetch watchlist, alerts, and initial stocks in parallel
  const [watchlist, alerts, initialStocks] = await Promise.all([
    getWatchlist(userEmail),
    getAlerts(userEmail),
    searchStocks(undefined, userEmail),
  ]);

  // Extract symbols from watchlist for news filtering
  const watchlistSymbols = watchlist.map((s) => s.symbol);

  // Fetch news filtered to watchlist stocks
  let news: MarketNewsArticle[] = [];
  try {
    if (watchlistSymbols.length > 0) {
      news = await getNews(watchlistSymbols, userEmail);
    }
  } catch {
    console.error('Failed to fetch watchlist news');
  }

  return (
    <div className="flex flex-col lg:flex-row gap-10 md:gap-14 w-full items-start">
      {/* Left Column: Watchlist Table and News */}
      <div className="flex flex-col gap-10 md:gap-14 w-full lg:w-2/3 xl:w-3/4">
        <section className="w-full">
          <WatchlistTable
            watchlist={watchlist}
            userEmail={userEmail}
            initialStocks={initialStocks}
          />
        </section>

        <section className="w-full">
          <WatchlistNews news={news} />
        </section>
      </div>

      {/* Right Column: Alerts Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4 sticky top-6">
        <section className="w-full">
          <AlertsList alertData={alerts} userEmail={userEmail} />
        </section>
      </div>
    </div>
  );
};

export default WatchlistPage;
