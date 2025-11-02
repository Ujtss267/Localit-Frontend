import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Stack,
  TextField,
  FormControlLabel,
  Switch,
  DialogActions,
  CircularProgress,
  Button as MUIButton,
} from "@mui/material";
import type { SeriesOption } from "../api";

export default function CreateSeriesDialog(props: {
  open: boolean;
  onClose: () => void;
  newSeriesTitle: string;
  setNewSeriesTitle: (v: string) => void;
  newSeriesDesc: string;
  setNewSeriesDesc: (v: string) => void;
  newSeriesPublic: boolean;
  setNewSeriesPublic: (v: boolean) => void;
  createSeries: {
    isPending: boolean;
    mutateAsync: (payload: { title: string; description?: string; isPublic?: boolean }) => Promise<{ seriesId: number }>;
  };
  setSelectedSeries: (v: SeriesOption | null) => void;
}) {
  const {
    open,
    onClose,
    newSeriesTitle,
    setNewSeriesTitle,
    newSeriesDesc,
    setNewSeriesDesc,
    newSeriesPublic,
    setNewSeriesPublic,
    createSeries,
    setSelectedSeries,
  } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>새 시리즈 만들기</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="시리즈 제목"
            placeholder="예) 영어회화 스터디"
            value={newSeriesTitle}
            onChange={(e) => setNewSeriesTitle(e.target.value)}
            required
          />
          <TextField
            label="시리즈 설명 (선택)"
            placeholder="시리즈에 대한 소개"
            value={newSeriesDesc}
            onChange={(e) => setNewSeriesDesc(e.target.value)}
            multiline
            minRows={2}
          />
          <FormControlLabel
            control={<Switch checked={newSeriesPublic} onChange={(e) => setNewSeriesPublic(e.target.checked)} />}
            label="공개 시리즈"
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <MUIButton onClick={onClose} color="inherit">
          취소
        </MUIButton>
        <MUIButton
          variant="contained"
          disabled={createSeries.isPending || newSeriesTitle.trim().length < 2}
          onClick={async () => {
            const created = await createSeries.mutateAsync({
              title: newSeriesTitle.trim(),
              description: newSeriesDesc.trim() || undefined,
              isPublic: newSeriesPublic,
            });
            setSelectedSeries({ seriesId: created.seriesId, title: newSeriesTitle.trim() });
            onClose();
          }}
          startIcon={createSeries.isPending ? <CircularProgress size={18} /> : undefined}
        >
          {createSeries.isPending ? "생성 중…" : "생성하고 연결"}
        </MUIButton>
      </DialogActions>
    </Dialog>
  );
}
