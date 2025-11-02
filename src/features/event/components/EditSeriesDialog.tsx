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

export default function EditSeriesDialog(props: {
  open: boolean;
  onClose: () => void;
  selectedSeries: SeriesOption | null;
  setSelectedSeries: (v: SeriesOption | null) => void;
  seriesDetails: { details: { description?: string; isPublic?: boolean } | null };
  updateSeries: {
    isPending: boolean;
    mutateAsync: (payload: { seriesId: number; title?: string; description?: string; isPublic?: boolean }) => Promise<any>;
  };
  editSeriesTitle: string;
  setEditSeriesTitle: (v: string) => void;
  editSeriesDesc: string;
  setEditSeriesDesc: (v: string) => void;
  editSeriesPublic: boolean;
  setEditSeriesPublic: (v: boolean) => void;
}) {
  const {
    open,
    onClose,
    selectedSeries,
    setSelectedSeries,
    seriesDetails,
    updateSeries,
    editSeriesTitle,
    setEditSeriesTitle,
    editSeriesDesc,
    setEditSeriesDesc,
    editSeriesPublic,
    setEditSeriesPublic,
  } = props;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>시리즈 편집</DialogTitle>
      <DialogContent dividers>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField label="시리즈 제목" value={editSeriesTitle} onChange={(e) => setEditSeriesTitle(e.target.value)} required />
          <TextField label="시리즈 설명 (선택)" value={editSeriesDesc} onChange={(e) => setEditSeriesDesc(e.target.value)} multiline minRows={2} />
          <FormControlLabel
            control={<Switch checked={editSeriesPublic} onChange={(e) => setEditSeriesPublic(e.target.checked)} />}
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
          disabled={updateSeries.isPending || editSeriesTitle.trim().length < 2 || !selectedSeries}
          onClick={async () => {
            if (!selectedSeries) return;
            await updateSeries.mutateAsync({
              seriesId: selectedSeries.seriesId,
              title: editSeriesTitle.trim(),
              description: editSeriesDesc.trim() || undefined,
              isPublic: editSeriesPublic,
            });
            // Optimistic title update
            setSelectedSeries({ seriesId: selectedSeries.seriesId, title: editSeriesTitle.trim() });
            onClose();
          }}
          startIcon={updateSeries.isPending ? <CircularProgress size={18} /> : undefined}
        >
          {updateSeries.isPending ? "저장 중…" : "저장"}
        </MUIButton>
      </DialogActions>
    </Dialog>
  );
}
