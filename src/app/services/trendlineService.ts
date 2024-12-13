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

export function findTrendlines(data: { time: number; high: number; low: number }[]): Trendline[] {
  const trendlines: Trendline[] = [];
  const maxLines = 3;
  const numChunks = 3;
  const chunkSize = Math.floor(data.length / numChunks);
  
  // Process each chunk
  for (let i = 0; i < numChunks; i++) {
    const startIdx = i * chunkSize;
    const endIdx = Math.min((i + 1) * chunkSize, data.length);
    const chunk = data.slice(startIdx, endIdx);
    
    // Find support and resistance points in chunk
    const supportPoints: Point[] = [];
    const resistancePoints: Point[] = [];
    
    for (let j = 2; j < chunk.length - 2; j++) {
      const candle = chunk[j];
      const prevCandles = chunk.slice(j - 2, j);
      const nextCandles = chunk.slice(j + 1, j + 3);
      
      // Check for support point
      if (prevCandles.every(c => c.low > candle.low) && 
          nextCandles.every(c => c.low > candle.low)) {
        supportPoints.push({ time: candle.time, price: candle.low });
      }
      
      // Check for resistance point
      if (prevCandles.every(c => c.high < candle.high) && 
          nextCandles.every(c => c.high < candle.high)) {
        resistancePoints.push({ time: candle.time, price: candle.high });
      }
    }

    // Create regression lines for support and resistance
    if (supportPoints.length >= 2) {
      const xs = supportPoints.map(p => p.time);
      const ys = supportPoints.map(p => p.price);
      const slope = calculateSlope(xs, ys);
      const intercept = calculateIntercept(xs, ys, slope);
      
      const intersection = checkIntersection(data[data.length - 1], slope, intercept);
      const line = {
        start: { 
          time: chunk[0].time,
          price: slope * chunk[0].time + intercept
        },
        end: { 
          time: chunk[chunk.length - 1].time,
          price: slope * chunk[chunk.length - 1].time + intercept
        },
        type: 'support' as const,
        strength: calculateLineStrength(supportPoints, chunk, slope, intercept),
        isIntersecting: intersection !== false,
        intersectionPrice: intersection !== false ? intersection : undefined
      };
      trendlines.push(line);
    }

    if (resistancePoints.length >= 2) {
      const xs = resistancePoints.map(p => p.time);
      const ys = resistancePoints.map(p => p.price);
      const slope = calculateSlope(xs, ys);
      const intercept = calculateIntercept(xs, ys, slope);
      
      const intersection = checkIntersection(data[data.length - 1], slope, intercept);
      const line = {
        start: { 
          time: chunk[0].time,
          price: slope * chunk[0].time + intercept
        },
        end: { 
          time: chunk[chunk.length - 1].time,
          price: slope * chunk[chunk.length - 1].time + intercept
        },
        type: 'resistance' as const,
        strength: calculateLineStrength(resistancePoints, chunk, slope, intercept),
        isIntersecting: intersection !== false,
        intersectionPrice: intersection !== false ? intersection : undefined
      };
      trendlines.push(line);
    }
  }

  // Sort by strength and filter
  return filterBestLines(trendlines, maxLines);
}

function calculateSlope(xs: number[], ys: number[]): number {
  const n = xs.length;
  const sumX = xs.reduce((a, b) => a + b, 0);
  const sumY = ys.reduce((a, b) => a + b, 0);
  const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
  const sumXX = xs.reduce((sum, x) => sum + x * x, 0);
  
  return (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
}

function calculateIntercept(xs: number[], ys: number[], slope: number): number {
  const avgX = xs.reduce((a, b) => a + b, 0) / xs.length;
  const avgY = ys.reduce((a, b) => a + b, 0) / ys.length;
  
  return avgY - slope * avgX;
}

function calculateLineStrength(points: Point[], data: { time: number; high: number; low: number }[], slope: number, intercept: number): number {
  let touchPoints = 0;
  const tolerance = 0.003; // 0.3% tolerance

  data.forEach(candle => {
    const expectedPrice = slope * candle.time + intercept;
    const lowPrice = Math.min(candle.low, candle.open, candle.close);
    const highPrice = Math.max(candle.high, candle.open, candle.close);
    
    if (Math.abs(expectedPrice - lowPrice) / lowPrice <= tolerance ||
        Math.abs(expectedPrice - highPrice) / highPrice <= tolerance) {
      touchPoints++;
    }
  });

  return touchPoints + points.length; // Add original points to strength
}

function checkIntersection(lastCandle: { time: number; high: number; low: number }, slope: number, intercept: number): boolean | number {
  const expectedPrice = slope * lastCandle.time + intercept;
  const isIntersecting = expectedPrice >= lastCandle.low && expectedPrice <= lastCandle.high;
  return isIntersecting ? expectedPrice : false;
}

function filterBestLines(trendlines: Trendline[], maxLines: number): Trendline[] {
  // Prioritize intersecting lines and sort by strength
  const sorted = trendlines.sort((a, b) => {
    if (a.isIntersecting && !b.isIntersecting) return -1;
    if (!a.isIntersecting && b.isIntersecting) return 1;
    return b.strength - a.strength;
  });
  
  const resistance = sorted.filter(line => line.type === 'resistance').slice(0, maxLines);
  const support = sorted.filter(line => line.type === 'support').slice(0, maxLines);
  
  return [...resistance, ...support];
}
