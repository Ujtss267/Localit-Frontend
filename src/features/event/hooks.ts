// src/features/event/hooks.ts
import { useEffect, useState } from "react";
import { getSeriesById, searchSeries } from "./api";
import { sampleSeries, sampleSeriesDetails } from "./sampleEvents";
import type { SeriesDetailDTO, SeriesOption } from "./api";

const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

export function useSearchSeries() {
  const [options, setOptions] = useState<SeriesOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setOptions(sampleSeries.map((s) => ({ seriesId: s.seriesId, title: s.title })));
  }, []);

  const search = async (keyword: string) => {
    setIsLoading(true);
    try {
      const trimmed = keyword.trim();
      if (USE_SAMPLE) {
        const filtered = trimmed ? sampleSeries.filter((s) => s.title.includes(trimmed)) : sampleSeries;
        setOptions(filtered.map((s) => ({ seriesId: s.seriesId, title: s.title })));
        return;
      }
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
        if (USE_SAMPLE) {
          setDetails(sampleSeriesDetails.seriesId === seriesId ? sampleSeriesDetails : null);
        } else {
          const found = await getSeriesById(seriesId);
          setDetails(found);
        }
      } finally {
        setLoading(false);
      }
    })();
  }, [seriesId]);

  return { loading, details };
}
