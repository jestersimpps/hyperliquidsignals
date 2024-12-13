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

export default function VolumeChart() {
  const { data, isLoading, error } = useVolumeData();

  if (isLoading) {
    return <div className="w-full max-w-4xl h-[400px] flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="w-full max-w-4xl h-[400px] flex items-center justify-center text-red-500">{error}</div>;
  }

  // Sort data by volume in descending order and take top 10
  const sortedData = [...data]
    .sort((a, b) => parseFloat(b.volume) - parseFloat(a.volume))
    .slice(0, 10);
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Top 10 Trading Pairs by Volume',
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
    <div className="w-full max-w-4xl h-[400px]">
      <Bar options={options} data={chartData} />
    </div>
  );
}
