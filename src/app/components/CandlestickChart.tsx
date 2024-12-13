'use client';

import { createChart, ColorType, Time, LineStyle, IChartApi } from 'lightweight-charts';
import { useEffect, useRef, useMemo } from 'react';
import { useCandleData } from '../hooks/useCandleData';
import { findTrendlines } from '../services/trendlineService';

interface CandlestickChartProps {
  coin: string;
  isLoading: boolean;
  onTrendlinesUpdate?: (trendlines: Trendline[]) => void;
}

interface Point {
  time: number;
  price: number;
}

interface Trendline {
  start: Point;
  end: Point;
  type: 'support' | 'resistance';
  strength: number;
  isIntersecting?: boolean;
  intersectionPrice?: number;
}

export default function CandlestickChart({ 
  coin, 
  isLoading: propsLoading,
  onTrendlinesUpdate 
}: CandlestickChartProps) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const { data, isLoading: dataLoading } = useCandleData(coin, '5m');

  // Calculate trendlines only when data changes
  const trendlines = useMemo(() => {
    if (!data?.length) return [];
    return findTrendlines(data);
  }, [data]);

  // Notify parent component of trendlines update
  useEffect(() => {
    if (onTrendlinesUpdate && trendlines.length > 0) {
      onTrendlinesUpdate(trendlines);
    }
  }, [trendlines, onTrendlinesUpdate]);

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current || !data?.length) return;

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
      timeScale: {
        borderVisible: false,
      },
    });

    chartRef.current = chart;

    // Add candlestick series
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: 'rgb(75, 192, 192)',
      downColor: 'rgb(255, 99, 132)',
      borderVisible: false,
      wickUpColor: 'rgb(75, 192, 192)',
      wickDownColor: 'rgb(255, 99, 132)',
    });

    // Format and set data
    const formattedData = data.map(candle => ({
      time: candle.time / 1000 as Time,
      open: candle.open,
      high: candle.high,
      low: candle.low,
      close: candle.close,
    }));

    candlestickSeries.setData(formattedData);

    // Add trendlines
    trendlines.forEach(trendline => {
      const lineSeries = chart.addLineSeries({
        color: trendline.type === 'support' ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
      });

      lineSeries.setData([
        { 
          time: trendline.start.time / 1000 as Time, 
          value: trendline.start.price 
        },
        { 
          time: trendline.end.time / 1000 as Time, 
          value: trendline.end.price 
        }
      ]);
    });

    // Fit content
    chart.timeScale().fitContent();

    // Handle resize
    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({ 
          width: chartContainerRef.current.clientWidth 
        });
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      // Proper cleanup of chart
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [data, trendlines]); // Include both data and trendlines as dependencies

  const isLoading = propsLoading || dataLoading;

  if (isLoading) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full h-[300px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
