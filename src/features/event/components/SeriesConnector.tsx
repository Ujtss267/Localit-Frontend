import React from "react";
import { Box, Typography, Stack, Autocomplete, TextField, Button as MUIButton } from "@mui/material";
import type { SeriesConnectorProps } from "../api";

export default function SeriesConnector(props: SeriesConnectorProps) {
  const {
    selectedSeries,
    setSelectedSeries,
    canEdit,
    seriesDetails,
    setCreateSeriesOpen,
    setEditSeriesOpen,
    setBulkOpen,
    seriesSearch,
    seriesKeyword,
    setSeriesKeyword,
    episodeNo,
    setEpisodeNo,
  } = props;

  return (
    <Box className="rounded-2xl border p-3 mt-2">
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        시리즈 연결
      </Typography>

      <Stack spacing={2} sx={{ mt: 1 }}>
        <Autocomplete
          value={selectedSeries}
          onChange={(_, v) => setSelectedSeries(v)}
          options={seriesSearch.options}
          loading={seriesSearch.isLoading}
          getOptionLabel={(o) => o.title}
          renderInput={(params) => (
            <TextField
              {...params}
              label="시리즈 검색/선택"
              placeholder="예) 영어회화 스터디"
              onChange={(e) => setSeriesKeyword(e.target.value)}
              helperText="기존 시리즈를 검색하여 선택하거나, 새 시리즈를 만들어 연결하세요."
            />
          )}
        />

        <Stack direction="row" spacing={1}>
          <MUIButton variant="outlined" onClick={() => setCreateSeriesOpen(true)}>
            새 시리즈 만들기
          </MUIButton>
          {selectedSeries && canEdit && (
            <>
              <MUIButton variant="outlined" color="primary" onClick={() => setEditSeriesOpen(true)}>
                시리즈 편집
              </MUIButton>
              <MUIButton variant="outlined" color="secondary" onClick={() => setBulkOpen(true)}>
                연속 회차 만들기
              </MUIButton>
            </>
          )}
          {selectedSeries && (
            <MUIButton variant="text" color="inherit" onClick={() => setSelectedSeries(null)}>
              선택 해제
            </MUIButton>
          )}
        </Stack>

        {selectedSeries && seriesDetails.details && (
          <Box className="rounded-xl border p-2 bg-white/60">
            <Typography variant="body2" className="font-semibold mb-1">
              최근 회차
            </Typography>
            <Stack spacing={1}>
              {seriesDetails.details.recentEpisodes?.map?.((ep: any) => (
                <Box key={ep.id} className="flex items-center justify-between text-sm">
                  <span className="truncate">
                    {ep.episodeNo ? `${ep.episodeNo}회차` : "회차"} · {ep.title}
                  </span>
                  {ep.startTime && <span className="text-neutral-500">{new Date(ep.startTime).toLocaleDateString("ko-KR")}</span>}
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        <TextField
          label="회차 번호 (선택)"
          type="number"
          inputProps={{ min: 1, step: 1 }}
          value={episodeNo}
          onChange={(e) => setEpisodeNo(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
        />
      </Stack>
    </Box>
  );
}
