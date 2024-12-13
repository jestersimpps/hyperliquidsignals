interface Point {
  time: number;
  price: number;
}

interface Trendline {
  points: Point[];
  type: 'support' | 'resistance';
}

export function findTrendlines(data: { time: number; high: number; low: number }[]): Trendline[] {
  const trendlines: Trendline[] = [];
  const minPoints = 3; // Minimum points to form a trendline
  const tolerance = 0.02; // 2% price deviation tolerance

  // Find support lines (using lows)
  for (let i = 0; i < data.length - minPoints; i++) {
    const startPoint = { time: data[i].time, price: data[i].low };
    let points = [startPoint];
    
    for (let j = i + 1; j < data.length; j++) {
      const expectedPrice = calculateExpectedPrice(startPoint, 
        { time: data[j].time, price: data[j].low }, 
        data[j].time);
      
      if (Math.abs(data[j].low - expectedPrice) / expectedPrice <= tolerance) {
        points.push({ time: data[j].time, price: data[j].low });
      }
    }

    if (points.length >= minPoints) {
      trendlines.push({ points, type: 'support' });
    }
  }

  // Find resistance lines (using highs)
  for (let i = 0; i < data.length - minPoints; i++) {
    const startPoint = { time: data[i].time, price: data[i].high };
    let points = [startPoint];
    
    for (let j = i + 1; j < data.length; j++) {
      const expectedPrice = calculateExpectedPrice(startPoint,
        { time: data[j].time, price: data[j].high },
        data[j].time);
      
      if (Math.abs(data[j].high - expectedPrice) / expectedPrice <= tolerance) {
        points.push({ time: data[j].time, price: data[j].high });
      }
    }

    if (points.length >= minPoints) {
      trendlines.push({ points, type: 'resistance' });
    }
  }

  // Filter out overlapping trendlines
  return filterOverlappingTrendlines(trendlines);
}

function calculateExpectedPrice(start: Point, end: Point, targetTime: number): number {
  const slope = (end.price - start.price) / (end.time - start.time);
  return start.price + slope * (targetTime - start.time);
}

function filterOverlappingTrendlines(trendlines: Trendline[]): Trendline[] {
  return trendlines.filter((trendline, index) => {
    // Keep only trendlines that don't overlap significantly with previous ones
    for (let i = 0; i < index; i++) {
      const overlap = calculateOverlap(trendline, trendlines[i]);
      if (overlap > 0.7) { // 70% overlap threshold
        return false;
      }
    }
    return true;
  });
}

function calculateOverlap(line1: Trendline, line2: Trendline): number {
  const timeRange1 = new Set(line1.points.map(p => p.time));
  const timeRange2 = new Set(line2.points.map(p => p.time));
  const intersection = new Set([...timeRange1].filter(x => timeRange2.has(x)));
  return intersection.size / Math.min(timeRange1.size, timeRange2.size);
}
