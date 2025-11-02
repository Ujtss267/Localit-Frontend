// src/features/event/hooks.ts
import { useState, useMemo } from "react";
import { sampleSeries, sampleSeriesDetails } from "./sampleEvents";
import type { SeriesDTO, SeriesDetailDTO } from "./api";

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
  const [details, setDetails] = useState<SeriesDetailDTO | null>(null);

  useMemo(() => {
    (async () => {
      setLoading(true);
      try {
        if (!seriesId) {
          setDetails(null);
        } else {
          setDetails(sampleSeriesDetails.seriesId === seriesId ? sampleSeriesDetails : null);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId]);

  return { loading, details } as { loading: boolean; details: SeriesDetailDTO | null };
}
