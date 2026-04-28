// src/features/event/hooks.ts
import { useEffect, useState } from "react";
import { getSeriesById, searchSeries } from "./api";
import type { SeriesDetailDTO, SeriesOption } from "./api";

export function useSearchSeries() {
  const [options, setOptions] = useState<SeriesOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    void search("");
  }, []);

  const search = async (keyword: string) => {
    setIsLoading(true);
    try {
      const trimmed = keyword.trim();
      const rows = await searchSeries(trimmed);
      setOptions(rows.map((s) => ({ seriesId: s.seriesId, title: s.title })));
    } finally {
      setIsLoading(false);
    }
  };

  return { options, isLoading, search };
}

export function useFetchSeriesDetails(seriesId?: number | null) {
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState<SeriesDetailDTO | null>(null);

  useEffect(() => {
    (async () => {
      if (!seriesId) {
        setDetails(null);
        return;
      }
      setLoading(true);
      try {
        const found = await getSeriesById(seriesId);
        setDetails(found);
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId]);

  return { loading, details };
}
