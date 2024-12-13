'use client';

import { usePerformanceData, type SortField } from '../hooks/usePerformanceData';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

export default function PerformanceOverview() {
  const { data: sortedData, isLoading, error, sortConfig, requestSort } = usePerformanceData();

  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) return null;
    return sortConfig.direction === 'asc' ? (
      <ChevronUpIcon className="w-4 h-4 inline-block ml-1" />
    ) : (
      <ChevronDownIcon className="w-4 h-4 inline-block ml-1" />
    );
  };

  if (isLoading) {
    return <div className="w-full flex items-center justify-center p-4">Loading...</div>;
  }

  if (error) {
    return <div className="w-full flex items-center justify-center p-4 text-red-500">{error}</div>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-black/[.1] dark:divide-white/[.1]">
        <thead>
          <tr>
            <th 
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => requestSort('coin')}
            >
              Pair {getSortIcon('coin')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => requestSort('markPrice')}
            >
              Price {getSortIcon('markPrice')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => requestSort('priceChange')}
            >
              24h Change {getSortIcon('priceChange')}
            </th>
            <th 
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-700 dark:hover:text-gray-200"
              onClick={() => requestSort('priceChangePercentage')}
            >
              24h % {getSortIcon('priceChangePercentage')}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[.1] dark:divide-white/[.1]">
          {sortedData.map((item) => (
            <tr key={item.coin}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.coin}</td>
              <td key={`${item.coin}-${item.markPrice}`} className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={`price-arrow ${item.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {item.priceChange >= 0 ? '↑' : '↓'}
                </span>
                ${parseFloat(item.markPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td key={`${item.coin}-${item.priceChange}`} className="px-6 py-4 whitespace-nowrap text-sm text-right flash-animation">
                <span className={item.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  ${Math.abs(item.priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </td>
              <td key={`${item.coin}-${item.priceChangePercentage}`} className="px-6 py-4 whitespace-nowrap text-sm text-right flash-animation">
                <span className={item.priceChangePercentage >= 0 ? 'text-green-500' : 'text-red-500'}>
                  {item.priceChangePercentage >= 0 ? '+' : '-'}
                  {Math.abs(item.priceChangePercentage).toFixed(2)}%
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
