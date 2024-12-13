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
      tooltip: {
        intersect: false,
        mode: 'index' as const,
        callbacks: {
          label: (ctx: any) => {
            const point = ctx.raw;
            return `O: ${point.o.toFixed(2)}  H: ${point.h.toFixed(2)}  L: ${point.l.toFixed(2)}  C: ${point.c.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'time' as const,
        offset: true,
        ticks: {
          major: {
            enabled: true,
          },
          source: 'data' as const,
          maxRotation: 0,
          autoSkip: true,
          autoSkipPadding: 75,
        },
        time: {
          unit: 'minute' as const,
          displayFormats: {
            minute: 'HH:mm',
          },
          tooltipFormat: 'HH:mm:ss',
        },
      },
      y: {
        type: 'linear' as const,
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
        borderColor: (ctx: any) => {
          const point = ctx.raw;
          return point.c >= point.o ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)';
        },
        backgroundColor: (ctx: any) => {
          const point = ctx.raw;
          return point.c >= point.o 
            ? 'rgba(75, 192, 192, 0.5)'
            : 'rgba(255, 99, 132, 0.5)';
        },
        borderWidth: 1,
        barWidth: 4,
      }
    ],
  };

  return (
    <div className="w-full h-[300px]">
      <Chart type='candlestick' options={options} data={chartData} />
    </div>
  );
}
