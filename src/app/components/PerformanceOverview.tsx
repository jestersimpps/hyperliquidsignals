'use client';

import { usePerformanceData } from '../hooks/usePerformanceData';

export default function PerformanceOverview() {
  const { data, isLoading, error } = usePerformanceData();

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
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pair</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h Change</th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">24h %</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[.1] dark:divide-white/[.1]">
          {data.map((item) => (
            <tr key={item.coin}>
              <td className="px-6 py-4 whitespace-nowrap text-sm">{item.coin}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                ${parseFloat(item.markPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
                <span className={item.priceChange >= 0 ? 'text-green-500' : 'text-red-500'}>
                  ${Math.abs(item.priceChange).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-right">
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
