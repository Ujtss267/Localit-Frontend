import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Typography, Stack, Autocomplete, TextField, Button as MUIButton } from "@mui/material";
import type { SeriesConnectorProps } from "../api";

export default function SeriesConnector(props: SeriesConnectorProps) {
  const {
    selectedSeries,
    setSelectedSeries,
    canEdit,
    seriesDetails,
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
              helperText="시리즈 생성/편집은 시리즈 관리 화면에서 진행하고, 여기서는 연결할 시리즈를 선택합니다."
            />
          )}
        />

        <Stack direction="row" spacing={1}>
          <MUIButton variant="outlined" component={RouterLink} to="/series?from=event-create" replace>
            시리즈 관리
          </MUIButton>
          {selectedSeries && canEdit && (
            <>
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
          <Box className="rounded-xl border border-neutral-700 p-2 bg-neutral-900/70">
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
