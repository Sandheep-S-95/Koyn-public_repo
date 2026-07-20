'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatPrice, formatChangePercent, getChangeColorClass } from '@/lib/utils';
import { toggleWatchlist } from '@/lib/actions/watchlist.actions';
import { toast } from 'sonner';
import AlertModal from './AlertModal';
import SearchCommand from './SearchCommand';
import { WATCHLIST_TABLE_HEADER } from '@/lib/constants';

const WatchlistTable = ({ watchlist, userEmail, initialStocks }: WatchlistTableProps & { initialStocks: StockWithWatchlistStatus[] }) => {
  const [items, setItems] = useState<StockWithData[]>(watchlist);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SelectedStock | null>(null);

  const handleRemove = async (symbol: string, company: string) => {
    try {
      const res = await toggleWatchlist(symbol, company, userEmail || '', false);
      if (res.success) {
        setItems((prev) => prev.filter((s) => s.symbol !== symbol));
        toast.success(`${symbol} removed from watchlist`);
      } else {
        toast.error('Failed to remove from watchlist');
      }
    } catch {
      toast.error('Something went wrong');
    }
  };

  const handleAddAlert = (stock: StockWithData) => {
    setSelectedStock({
      symbol: stock.symbol,
      company: stock.company,
      currentPrice: stock.currentPrice,
    });
    setAlertModalOpen(true);
  };

  if (items.length === 0) {
    return (
      <div className="watchlist-empty-container flex">
        <div className="watchlist-empty">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="watchlist-star">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.385a.563.563 0 00-.182-.557L3.04 10.385a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345l2.125-5.111z" />
          </svg>
          <h3 className="empty-title">Your watchlist is empty</h3>
          <p className="empty-description">
            Search for stocks to add them to your watchlist and start tracking their performance.
          </p>
          <SearchCommand
            renderAs="button"
            label="Add Stock"
            initialStocks={initialStocks}
            userEmail={userEmail}
          />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <h2 className="watchlist-title">Watchlist</h2>
        <SearchCommand
          renderAs="button"
          label="Add Stock"
          initialStocks={initialStocks}
          userEmail={userEmail}
        />
      </div>

      <div className="watchlist-table overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="table-header-row">
              {WATCHLIST_TABLE_HEADER.map((header) => (
                <th key={header} className="table-header px-4 py-3 text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((stock) => (
              <tr key={stock.symbol} className="table-row">
                {/* Company */}
                <td className="table-cell px-4 py-4">
                  <Link
                    href={`/stocks/${stock.symbol.toLowerCase()}`}
                    className="hover:text-emerald-400 transition-colors truncate max-w-[140px] inline-block"
                    title={stock.company}
                  >
                    {stock.company.length > 14
                      ? `${stock.company.substring(0, 14)}...`
                      : stock.company}
                  </Link>
                </td>

                {/* Symbol */}
                <td className="table-cell px-4 py-4 text-gray-400 font-mono">
                  {stock.symbol}
                </td>

                {/* Price */}
                <td className="table-cell px-4 py-4">
                  {stock.currentPrice ? formatPrice(stock.currentPrice) : 'N/A'}
                </td>

                {/* Change */}
                <td className={`table-cell px-4 py-4 ${getChangeColorClass(stock.changePercent)}`}>
                  {stock.changePercent ? formatChangePercent(stock.changePercent) : 'N/A'}
                </td>

                {/* Market Cap */}
                <td className="table-cell px-4 py-4 text-gray-400">
                  {stock.marketCap || 'N/A'}
                </td>

                {/* P/E Ratio */}
                <td className="table-cell px-4 py-4 text-gray-400">
                  {stock.peRatio || 'N/A'}
                </td>

                {/* Alert */}
                <td className="table-cell px-4 py-4">
                  <button
                    onClick={() => handleAddAlert(stock)}
                    className="add-alert"
                  >
                    Add Alert
                  </button>
                </td>

                {/* Action */}
                <td className="table-cell px-4 py-4">
                  <button
                    onClick={() => handleRemove(stock.symbol, stock.company)}
                    className="p-2 rounded hover:bg-red-500/10 transition-colors cursor-pointer"
                    title={`Remove ${stock.symbol}`}
                  >
                    <Trash2 className="trash-icon" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Alert Modal */}
      {selectedStock && (
        <AlertModal
          alertData={{
            symbol: selectedStock.symbol,
            company: selectedStock.company,
            alertName: `${selectedStock.company} Alert`,
            alertType: 'upper',
            threshold: selectedStock.currentPrice ? String(selectedStock.currentPrice) : '',
          }}
          open={alertModalOpen}
          setOpen={setAlertModalOpen}
          userEmail={userEmail || ''}
        />
      )}
    </>
  );
};

export default WatchlistTable;
