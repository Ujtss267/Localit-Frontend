// src/features/event/hooks.ts
import { useState, useMemo } from "react";
import { sampleSeries, sampleSeriesDetails } from "./sampleEvents";

export function useSearchSeries() {
  const [options, setOptions] = useState(sampleSeries);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (keyword: string) => {
    setIsLoading(true);
    try {
      const filtered = keyword ? sampleSeries.filter((s) => s.title.includes(keyword)) : sampleSeries;
      setOptions(filtered);
    } finally {
      setIsLoading(false);
    }
  };

  return { options, isLoading, search };
}

export function useFetchSeriesDetails(seriesId?: number | null) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<any>(null);

  useMemo(() => {
    (async () => {
      setLoading(true);
      try {
        setDetails(seriesId ? sampleSeriesDetails : null);
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId]);

  return { loading, details };
}
