interface Point {
  time: number;
  price: number;
}

interface Trendline {
  start: Point;
  end: Point;
  type: 'support' | 'resistance';
  strength: number;
}

export function findTrendlines(data: { time: number; high: number; low: number }[]): Trendline[] {
  const trendlines: Trendline[] = [];
  const minDistance = 5; // Minimum number of candles between points
  const maxLines = 3; // Maximum number of lines per type
  
  // Find local maxima and minima
  const peaks: Point[] = [];
  const troughs: Point[] = [];
  
  for (let i = 2; i < data.length - 2; i++) {
    // Peak detection
    if (data[i].high > data[i-1].high && 
        data[i].high > data[i-2].high && 
        data[i].high > data[i+1].high && 
        data[i].high > data[i+2].high) {
      peaks.push({ time: data[i].time, price: data[i].high });
    }
    
    // Trough detection
    if (data[i].low < data[i-1].low && 
        data[i].low < data[i-2].low && 
        data[i].low < data[i+1].low && 
        data[i].low < data[i+2].low) {
      troughs.push({ time: data[i].time, price: data[i].low });
    }
  }

  // Find resistance lines connecting peaks
  for (let i = 0; i < peaks.length - 1; i++) {
    for (let j = i + 1; j < peaks.length; j++) {
      if ((peaks[j].time - peaks[i].time) / (1000 * 60) >= minDistance) {
        const line = {
          start: peaks[i],
          end: peaks[j],
          type: 'resistance' as const,
          strength: calculateLineStrength(peaks[i], peaks[j], data, 'resistance')
        };
        trendlines.push(line);
      }
    }
  }

  // Find support lines connecting troughs
  for (let i = 0; i < troughs.length - 1; i++) {
    for (let j = i + 1; j < troughs.length; j++) {
      if ((troughs[j].time - troughs[i].time) / (1000 * 60) >= minDistance) {
        const line = {
          start: troughs[i],
          end: troughs[j],
          type: 'support' as const,
          strength: calculateLineStrength(troughs[i], troughs[j], data, 'support')
        };
        trendlines.push(line);
      }
    }
  }

  // Sort by strength and filter
  return filterBestLines(trendlines, maxLines);
}

function calculateLineStrength(start: Point, end: Point, data: { time: number; high: number; low: number }[], type: 'support' | 'resistance'): number {
  const slope = (end.price - start.price) / (end.time - start.time);
  let touchPoints = 0;
  const tolerance = 0.003; // 0.3% tolerance

  data.forEach(candle => {
    if (candle.time > start.time && candle.time < end.time) {
      const expectedPrice = start.price + slope * (candle.time - start.time);
      const price = type === 'resistance' ? candle.high : candle.low;
      if (Math.abs(price - expectedPrice) / expectedPrice <= tolerance) {
        touchPoints++;
      }
    }
  });

  return touchPoints;
}

function filterBestLines(trendlines: Trendline[], maxLines: number): Trendline[] {
  // Sort by strength (number of touch points)
  const sorted = trendlines.sort((a, b) => b.strength - a.strength);
  
  // Get top resistance and support lines
  const resistance = sorted.filter(line => line.type === 'resistance').slice(0, maxLines);
  const support = sorted.filter(line => line.type === 'support').slice(0, maxLines);
  
  return [...resistance, ...support];
}
