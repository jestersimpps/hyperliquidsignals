'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CandlestickController, CandlestickElement, OhlcElement } from 'chartjs-chart-financial';
import { Chart } from 'react-chartjs-2';
import 'chartjs-adapter-date-fns';

ChartJS.register(
  CategoryScale,
  LinearScale,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  CandlestickController,
  CandlestickElement,
  OhlcElement
);

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CandlestickChartProps {
  coin: string;
  data: CandleData[];
  isLoading: boolean;
}

export default function CandlestickChart({ coin, data, isLoading }: CandlestickChartProps) {
  if (isLoading) {
    return <div className="w-full h-[300px] flex items-center justify-center">Loading...</div>;
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${coin} - 5m`,
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm',
          },
        },
        title: {
          display: true,
          text: 'Time',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Price',
        },
      },
    },
  };

  const chartData = {
    datasets: [
      {
        label: coin,
        data: data.map(candle => ({
          x: new Date(candle.time),
          o: candle.open,
          h: candle.high,
          l: candle.low,
          c: candle.close
        })),
        color: {
          up: 'rgba(75, 192, 75, 1)',
          down: 'rgba(255, 99, 132, 1)',
        },
      }
    ],
  };

  return (
    <div className="w-full h-[300px]">
      <Chart type='candlestick' options={options} data={chartData} />
    </div>
  );
}
