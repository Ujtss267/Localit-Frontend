import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField,
  Alert,
  DialogActions,
  CircularProgress,
  Button as MUIButton,
} from "@mui/material";
import type { CreateEventDto, SeriesOption } from "../api";

const toIsoFromDate = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();

export default function BulkCreateDialog(props: {
  open: boolean;
  onClose: () => void;
  bulkFrequency: "DAILY" | "WEEKLY";
  setBulkFrequency: (v: "DAILY" | "WEEKLY") => void;
  bulkCount: number;
  setBulkCount: (v: number) => void;
  bulkCreate: {
    isPending: boolean;
    mutateAsync: (payloads: Array<CreateEventDto & { seriesId: number; episodeNo?: number }>) => Promise<any>;
  };
  selectedSeries: SeriesOption | null;
  startLocal: string;
  endLocal: string;
  baseValid: boolean;
  title: string;
  desc: string;
  location: string;
  capacity: number | "";
  episodeNo: number | "";
}) {
  const {
    open,
    onClose,
    bulkFrequency,
    setBulkFrequency,
    bulkCount,
    setBulkCount,
    bulkCreate,
    selectedSeries,
    startLocal,
    endLocal,
    baseValid,
    title,
    desc,
    location,
    capacity,
    episodeNo,
  } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>연속 회차 만들기</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <RadioGroup row value={bulkFrequency} onChange={(_, v) => v && setBulkFrequency(v as any)}>
            <FormControlLabel value="DAILY" control={<Radio />} label="매일" />
            <FormControlLabel value="WEEKLY" control={<Radio />} label="매주" />
          </RadioGroup>
          <TextField
            label="회차 개수"
            type="number"
            inputProps={{ min: 2, max: 30, step: 1 }}
            value={bulkCount}
            onChange={(e) => setBulkCount(Math.min(30, Math.max(2, Number(e.target.value || 2))))}
          />
          <Alert severity="info">
            현재 폼의 제목/설명/위치/시간/정원을 기준으로 연속 회차를 생성합니다. 시작 시간 기준으로 {bulkFrequency === "DAILY" ? "하루" : "일주일"}{" "}
            간격으로 날짜가 증가합니다.
          </Alert>
        </Stack>
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={onClose} color="inherit">
          취소
        </MUIButton>
        <MUIButton
          variant="contained"
          disabled={bulkCreate.isPending || !selectedSeries || !startLocal || !endLocal || !baseValid}
          onClick={async () => {
            if (!selectedSeries || !startLocal || !endLocal) return;
            const baseStart = new Date(startLocal);
            const baseEnd = new Date(endLocal);
            const delta = bulkFrequency === "DAILY" ? 1 : 7; // days

            const payloads: Array<CreateEventDto & { seriesId: number; episodeNo?: number }> = [];
            for (let i = 0; i < bulkCount; i++) {
              const s = new Date(baseStart);
              const e = new Date(baseEnd);
              s.setDate(s.getDate() + i * delta);
              e.setDate(e.getDate() + i * delta);

              payloads.push({
                title: title.trim(),
                description: desc.trim(),
                location: location.trim(),
                startTime: toIsoFromDate(s),
                endTime: toIsoFromDate(e),
                capacity: Number(capacity),
                seriesId: selectedSeries.seriesId,
                episodeNo: (typeof episodeNo === "number" ? episodeNo : 1) + i,
              });
            }
            await bulkCreate.mutateAsync(payloads);
            onClose();
          }}
          startIcon={bulkCreate.isPending ? <CircularProgress size={18} /> : undefined}
        >
          {bulkCreate.isPending ? "생성 중…" : "생성"}
        </MUIButton>
      </DialogActions>
    </Dialog>
  );
}
