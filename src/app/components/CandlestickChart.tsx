'use client';

import { createChart, ColorType, Time, LineStyle } from 'lightweight-charts';
import { useEffect, useRef } from 'react';
import { findTrendlines } from '../services/trendlineService';

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
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);

  useEffect(() => {
    if (!chartContainerRef.current || isLoading || !data.length) return;

    // Create the chart
    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#D9D9D9',
      },
      grid: {
        vertLines: { color: 'rgba(42, 46, 57, 0.5)' },
        horzLines: { color: 'rgba(42, 46, 57, 0.5)' },
      },
      width: chartContainerRef.current.clientWidth,
      height: 300,
      rightPriceScale: {
        borderVisible: false,
      },
      watermark: {
        visible: false,
      },
      crosshair: {
        horzLine: {
          visible: true,
          labelVisible: true,
        },
        vertLine: {
          visible: true,
          labelVisible: true,
        },
      },
      handleScroll: false,
      handleScale: {
        mouseWheel: false,
      },
      title: {
        text: `${coin.toUpperCase()} Price Chart`,
        visible: true,
        color: '#D9D9D9',
      },
    });

    // Create the candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'rgb(75, 192, 192)',
      downColor: 'rgb(255, 99, 132)',
      borderVisible: false,
      wickUpColor: 'rgb(75, 192, 192)',
      wickDownColor: 'rgb(255, 99, 132)',
    });

    // Format the data for the chart
    const formattedData = data.map((candle) => ({
      time: candle.time / 1000 as Time, // Convert milliseconds to seconds
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(formattedData);

    // Add trendlines
    const trendlines = findTrendlines(data);
    trendlines.forEach((trendline) => {
      const lineSeries = chart.addLineSeries({
        color: trendline.type === 'support' ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
      });

      // Create line with just start and end points
      const lineData = [
        { time: trendline.start.time / 1000 as Time, value: trendline.start.price },
        { time: trendline.end.time / 1000 as Time, value: trendline.end.price }
      ];

      lineSeries.setData(lineData);
    });

    // Fit the chart to the data
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({ width: chartContainerRef.current.clientWidth });
      }
    };

    window.addEventListener('resize', handleResize);

    // Store chart reference for cleanup
    chartRef.current = chart;

    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [data, isLoading]);

  if (isLoading) {
    return <div className="w-full h-[300px] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full h-[300px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
