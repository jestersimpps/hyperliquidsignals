'use client';

import { useState, useEffect } from 'react';

interface VolumeData {
  coin: string;
  volume: string;
}

export function useVolumeData() {
  const [data, setData] = useState<VolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
      try {
        const response = await fetch('/api/volume');
        if (!response.ok) throw new Error('Failed to fetch volume data');
        const volumeData = await response.json();
        setData(volumeData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, [fetchData]);

  return { data, isLoading, error, refresh: fetchData };
}
