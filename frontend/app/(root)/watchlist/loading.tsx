import React from 'react';

const WatchlistLoading = () => {
  return (
    <div className="flex flex-col lg:flex-row gap-10 md:gap-14 w-full items-start animate-in fade-in duration-500 min-h-[500px]">
      <div className="flex flex-col gap-10 md:gap-14 w-full lg:w-2/3 xl:w-3/4">
        {/* Skeleton for Watchlist Table */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="watchlist-title">Watchlist</h2>
            <div className="h-10 w-32 rounded-md silver-glow"></div>
          </div>
          
          <div className="rounded-xl border border-gray-800 overflow-hidden bg-[#0D1F1E]/30">
            <div className="h-12 bg-gray-800/50 border-b border-gray-800"></div>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center h-16 border-b border-gray-800/50 px-4">
                <div className="h-4 rounded w-1/4 mr-4 silver-glow"></div>
                <div className="h-4 rounded w-1/6 mr-4 silver-glow"></div>
                <div className="h-4 rounded w-1/6 mr-4 silver-glow"></div>
                <div className="h-4 rounded w-1/6 mr-4 silver-glow"></div>
                <div className="h-4 rounded w-1/6 silver-glow"></div>
              </div>
            ))}
          </div>
        </section>

        {/* Skeleton for Watchlist News */}
        <section className="w-full mt-2">
          <h2 className="watchlist-title mb-4">News</h2>
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl border border-gray-800 p-5 bg-[#0D1F1E]/30">
                <div className="h-3 rounded w-20 mb-3 silver-glow"></div>
                <div className="h-5 rounded w-3/4 mb-4 silver-glow"></div>
                <div className="h-3 rounded w-1/3 mb-4 silver-glow"></div>
                <div className="h-4 rounded w-full mb-2 silver-glow"></div>
                <div className="h-4 rounded w-5/6 silver-glow"></div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Skeleton for Alerts Sidebar */}
      <div className="w-full lg:w-1/3 xl:w-1/4 sticky top-6">
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold tracking-tight text-white/90">Alerts</h2>
            <div className="h-5 w-5 rounded-full silver-glow"></div>
          </div>
          <div className="flex flex-col gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-xl p-4 h-24 silver-glow"></div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default WatchlistLoading;
