'use client';

import { createChart, ColorType, Time, LineStyle, ISeriesApi, CandlestickData } from 'lightweight-charts';
import { useEffect, useRef, useCallback } from 'react';
import { useWebSocketCandles } from '../hooks/useWebSocketCandles';
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

interface Trendline {
  start: { time: number; price: number };
  end: { time: number; price: number };
  type: 'support' | 'resistance';
  strength: number;
  isIntersecting?: boolean;
  intersectionPrice?: number;
}

export default function CandlestickChart({ 
  coin, 
  data, 
  isLoading,
  onTrendlinesUpdate
}: CandlestickChartProps & { 
  onTrendlinesUpdate?: (trendlines: Trendline[]) => void 
}) {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<any>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<'Candlestick'>>();

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
        visible: false,
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
    candlestickSeriesRef.current = candlestickSeries;

    // Add trendlines and notify parent
    const trendlines = findTrendlines(data);
    if (onTrendlinesUpdate) {
      onTrendlinesUpdate(trendlines);
    }
    trendlines.forEach((trendline) => {
      const lineSeries = chart.addLineSeries({
        color: trendline.type === 'support' ? 'rgb(75, 192, 192)' : 'rgb(255, 99, 132)',
        lineWidth: 2,
        lineStyle: LineStyle.Dashed,
        lastValueVisible: false,
        priceLineVisible: false,
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

  const handleCandleUpdate = useCallback((wsCandle: WsCandle) => {
    if (!candlestickSeriesRef.current) return;

    const newCandle: CandlestickData = {
      time: wsCandle.t / 1000 as Time,
      open: parseFloat(wsCandle.o),
      high: parseFloat(wsCandle.h),
      low: parseFloat(wsCandle.l),
      close: parseFloat(wsCandle.c)
    };

    candlestickSeriesRef.current.update(newCandle);
    
    // Update trendlines when new candle arrives
    if (onTrendlinesUpdate) {
      const updatedData = [...data, {
        time: wsCandle.t,
        open: parseFloat(wsCandle.o),
        high: parseFloat(wsCandle.h),
        low: parseFloat(wsCandle.l),
        close: parseFloat(wsCandle.c)
      }];
      const newTrendlines = findTrendlines(updatedData);
      onTrendlinesUpdate(newTrendlines);
    }
  }, []);

  useWebSocket(
    (data) => {
      if (data.channel === 'candle') {
        handleCandleUpdate(data.data);
      }
    },
    [
      { 
        type: 'candle',
        coin: coin,
        interval: '5m'
      }
    ]
  );

  if (isLoading) {
    return <div className="w-full h-[300px] flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="w-full h-[300px]">
      <div ref={chartContainerRef} className="w-full h-full" />
    </div>
  );
}
