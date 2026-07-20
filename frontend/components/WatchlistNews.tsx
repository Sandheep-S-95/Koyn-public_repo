'use client';

import React from 'react';
import { formatTimeAgo } from '@/lib/utils';

const WatchlistNews = ({ news }: WatchlistNewsProps) => {
  if (!news || news.length === 0) {
    return (
      <div className="mt-2">
        <h2 className="watchlist-title mb-4">News</h2>
        <div className="rounded-lg border border-gray-600 bg-gray-700 p-8 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 mx-auto mb-3 text-gray-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 01-2.25 2.25M16.5 7.5V18a2.25 2.25 0 002.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 002.25 2.25h13.5M6 7.5h3v3H6v-3z" />
          </svg>
          <p className="text-gray-500 text-sm">No news available for your watchlist stocks.</p>
          <p className="text-gray-600 text-xs mt-1">Add stocks to your watchlist to see relevant news.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2">
      <h2 className="watchlist-title mb-4">News</h2>
      <div className="watchlist-news">
        {news.map((article) => (
          <a
            key={article.id}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="news-item group"
          >
            {/* Stock Tag */}
            {article.related && (
              <span className="news-tag">{article.related}</span>
            )}

            {/* Title */}
            <h3 className="news-title group-hover:text-emerald-400 transition-colors">
              {article.headline}
            </h3>

            {/* Meta */}
            <div className="news-meta">
              <span>{article.source}</span>
              <span className="mx-2">•</span>
              <span>{formatTimeAgo(article.datetime)}</span>
            </div>

            {/* Summary */}
            <p className="news-summary">{article.summary}</p>

            {/* CTA */}
            <span className="news-cta">
              Read more →
            </span>
          </a>
        ))}
      </div>
    </div>
  );
};

export default WatchlistNews;
