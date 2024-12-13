'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

import { useVolumeData } from '../hooks/useVolumeData';

import { ArrowPathIcon } from '@heroicons/react/20/solid';

export default function VolumeChart() {
  const { data, isLoading, error, refresh } = useVolumeData();

  if (isLoading) {
    return <div className="w-full max-w-4xl h-[400px] flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-full max-w-4xl h-[400px] flex items-center justify-center text-red-500">{error}</div>;
  }

  // Sort data by volume in descending order and take top 20
  const sortedData = [...data]
    .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, 20);
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          font: {
            family: 'var(--font-geist-sans)',
          },
        },
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (context: { raw: number }) => {
            const value = context.raw;
            return `Volume: $${value.toLocaleString('en-US', { 
              minimumFractionDigits: 0,
              maximumFractionDigits: 0 
            })}`;
          },
        },
      },
    },
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 45
        }
      },
      y: {
        ticks: {
          callback: (value: number) => {
            return `$${(value / 1000000).toFixed(1)}M`;
          },
        },
      },
    },
  };

  const chartData = {
    labels: sortedData.map(d => d.coin),
    datasets: [
      {
        label: '24h Volume (USD)',
        data: sortedData.map(d => parseFloat(d.volume)),
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex justify-end mb-4">
        <button
          onClick={() => refresh()}
          className="inline-flex items-center px-3 py-2 border border-black/[.1] dark:border-white/[.1] rounded-md text-sm font-medium hover:bg-black/[.05] dark:hover:bg-white/[.05] transition-colors"
          disabled={isLoading}
        >
          <ArrowPathIcon className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      <div className="w-full h-[400px]">
      <Bar options={options} data={chartData} />
      </div>
    </div>
  );
}
