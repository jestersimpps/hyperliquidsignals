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

// Mock data - replace with real API data later
const mockData = {
  labels: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'SOL/USDT', 'ADA/USDT', 'DOGE/USDT', 'TRX/USDT', 'LINK/USDT', 'DOT/USDT'],
  volumes: [1000000, 800000, 600000, 500000, 400000, 300000, 250000, 200000, 150000, 100000]
};

export default function VolumeChart() {
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

  const data = {
    labels: mockData.labels,
    datasets: [
      {
        label: '24h Volume (USD)',
        data: mockData.volumes,
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
    ],
  };

  return (
    <div className="w-full max-w-4xl h-[400px]">
      <Bar options={options} data={data} />
    </div>
  );
}
