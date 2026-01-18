// src/features/event/pages/EventCreatePage.tsx
import React, { useState, type FormEvent, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEvent } from "../queries";
import type { CreateEventDto } from "../api";
import { useFetchSeriesDetails, useSearchSeries } from "../hooks";

import {
  Container,
  Card,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button as MUIButton,
  Stack,
  Alert,
  CircularProgress,
  Box,
  Divider,
  ToggleButtonGroup,
  ToggleButton,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import { ImagePickerGrid, LocationMap } from "@/components";
import TimeRangeBadgePicker from "@/components/ui/TimeRangeBadgePicker";

// 분리한 컴포넌트들
import SeriesConnector from "../components/SeriesConnector";
import CreateSeriesDialog from "../components/CreateSeriesDialog";
import EditSeriesDialog from "../components/EditSeriesDialog";
import BulkCreateDialog from "../components/BulkCreateDialog";

/** ▼▼▼ 시리즈 API 훅 예시 (네 API에 맞춰 구현/대체) ▼▼▼ */
type SeriesOption = { seriesId: number; title: string };

function useCreateSeries() {
  const [isPending, setPending] = useState(false);
  const mutateAsync = async (payload: { title: string; description?: string; isPublic?: boolean }) => {
    setPending(true);
    try {
      // TODO: 서버 연동
      return { seriesId: Math.floor(Math.random() * 100000), ...payload };
    } finally {
      setPending(false);
    }
  };
  return { mutateAsync, isPending };
}

function useUpdateSeries() {
  const [isPending, setPending] = useState(false);
  const mutateAsync = async (payload: { seriesId: number; title?: string; description?: string; isPublic?: boolean }) => {
    setPending(true);
    try {
      // TODO: 서버 연동
      return { ok: true };
    } finally {
      setPending(false);
    }
  };
  return { mutateAsync, isPending };
}

function useSeriesPermissions(seriesId?: number | null) {
  const [canEdit, setCanEdit] = useState(false);
  useEffect(() => {
    setCanEdit(!!seriesId);
  }, [seriesId]);
  return { canEdit };
}

function useBulkCreateEpisodes() {
  const [isPending, setPending] = useState(false);
  const mutateAsync = async (payloads: Array<CreateEventDto & { seriesId: number; episodeNo?: number }>) => {
    setPending(true);
    try {
      // TODO: 서버 연동
      return { created: payloads.length };
    } finally {
      setPending(false);
    }
  };
  return { mutateAsync, isPending };
}
/** ▲▲▲ 시리즈 API 훅 예시 끝 ▲▲▲ */

function toISO(local: string) {
  if (!local) return "";
  const d = new Date(local);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

function toLocalFromDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

type EventMode = "single" | "series";

export default function EventCreatePage() {
  const navigate = useNavigate();
  const createMut = useCreateEvent();

  // 기본 필드
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [genderControl, setGenderControl] = useState({
    maleLimit: false,
    femaleLimit: false,
    balanceRequired: false,
  });

  // 이벤트 유형
  const [mode, setMode] = useState<EventMode>("single");

  // 시리즈
  const [episodeNo, setEpisodeNo] = useState<number | "">("");
  const [seriesKeyword, setSeriesKeyword] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(null);

  // 새 시리즈 생성용
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [newSeriesPublic, setNewSeriesPublic] = useState(true);
  const [createSeriesOpen, setCreateSeriesOpen] = useState(false);

  const [editSeriesOpen, setEditSeriesOpen] = useState(false);
  const [editSeriesTitle, setEditSeriesTitle] = useState("");
  const [editSeriesDesc, setEditSeriesDesc] = useState("");
  const [editSeriesPublic, setEditSeriesPublic] = useState(true);

  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkFrequency, setBulkFrequency] = useState<"DAILY" | "WEEKLY">("WEEKLY");
  const [bulkCount, setBulkCount] = useState<number>(4);

  const seriesSearch = useSearchSeries();
  const createSeries = useCreateSeries();
  const updateSeries = useUpdateSeries();
  const { canEdit } = useSeriesPermissions(selectedSeries?.seriesId ?? null);
  const seriesDetails = useFetchSeriesDetails(selectedSeries?.seriesId ?? null);
  const bulkCreate = useBulkCreateEpisodes();

  // 시간 선택/연동 상태
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [duration, setDuration] = useState(60);

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setGenderControl((prev) => ({ ...prev, [name]: checked }));
  };

  const baseValid =
    title.trim().length >= 2 &&
    desc.trim().length >= 5 &&
    location.trim().length >= 2 &&
    !!startLocal &&
    !!endLocal &&
    new Date(endLocal) > new Date(startLocal) &&
    typeof capacity === "number" &&
    capacity > 0;

  const seriesValid = mode === "single" ? true : !!selectedSeries;
  const valid = baseValid && seriesValid;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    let seriesId: number | undefined = undefined;
    if (mode === "series") {
      if (!selectedSeries) return;
      seriesId = selectedSeries.seriesId;
    }

    const payload: CreateEventDto & { seriesId?: number; episodeNo?: number } = {
      title: title.trim(),
      description: desc.trim(),
      location: location.trim(),
      startTime: toISO(startLocal),
      endTime: toISO(endLocal),
      capacity: Number(capacity),
      ...(seriesId ? { seriesId } : {}),
      ...(episodeNo !== "" ? { episodeNo: Number(episodeNo) } : {}),
    };

    createMut.mutate(payload, {
      onSuccess: (res) => {
        navigate(res?.id ? `/events/${res.id}` : "/events", { replace: true });
      },
    });
  }

  // 시리즈 검색
  useEffect(() => {
    if (mode === "series") {
      const k = seriesKeyword.trim();
      if (k.length >= 1) seriesSearch.search(k);
      else seriesSearch.search("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seriesKeyword]);

  // 지도용 예시
  const lat = 35.2277;
  const lng = 128.6812;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          새 이벤트 만들기
        </Typography>
        <Typography variant="body2" color="text.secondary">
          기본 정보부터 일정, 모집 조건, 위치까지 순서대로 입력해 주세요.
        </Typography>
      </Stack>

      <Box component="form" onSubmit={onSubmit}>
        <Card variant="outlined" sx={{ overflow: "hidden" }}>
          <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
            {/* 1. 이벤트 유형 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                이벤트 유형
              </Typography>
              <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small" sx={{ borderRadius: 3 }}>
                <ToggleButton value="single">단발형</ToggleButton>
                <ToggleButton value="series">시리즈 회차형</ToggleButton>
              </ToggleButtonGroup>
            </Box>

            {/* 시리즈 옵션 */}
            {mode === "series" && (
              <Box sx={{ mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, backgroundColor: "background.default" }}>
                <SeriesConnector
                  selectedSeries={selectedSeries}
                  setSelectedSeries={setSelectedSeries}
                  canEdit={canEdit}
                  seriesDetails={seriesDetails}
                  setCreateSeriesOpen={setCreateSeriesOpen}
                  setEditSeriesOpen={setEditSeriesOpen}
                  setBulkOpen={setBulkOpen}
                  seriesSearch={seriesSearch}
                  seriesKeyword={seriesKeyword}
                  setSeriesKeyword={setSeriesKeyword}
                  episodeNo={episodeNo}
                  setEpisodeNo={setEpisodeNo}
                  createSeriesOpen={false}
                />
              </Box>
            )}

            <Divider sx={{ my: 3 }} />

            {/* 2. 기본 정보 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                기본 정보
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="제목"
                  placeholder="예) 로컬 스터디 모임"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  fullWidth
                />
                <TextField
                  label="설명"
                  placeholder="모임/공연에 대한 소개를 입력해 주세요."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
                />
                <TextField label="위치" placeholder="예) 서울 마포" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 3. 일정/시간 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                일정
              </Typography>
              <Stack spacing={2}>
                <TextField
                  label="이벤트 발생일"
                  type="date"
                  value={startLocal}
                  onChange={(e) => {
                    const v = e.target.value;
                    setStartLocal(v);
                    if (v) {
                      const s = new Date(v);
                      const newEnd = new Date(s);
                      newEnd.setMinutes(newEnd.getMinutes() + duration);
                      setEndLocal(toLocalFromDate(newEnd));
                      setRange({ start: s, end: newEnd });
                    } else {
                      setRange(null);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />

                <TimeRangeBadgePicker
                  from="09:00"
                  to="18:00"
                  stepMinutes={30}
                  value={range}
                  onChange={(r) => {
                    if (isNaN(r.start.getTime())) {
                      setRange(null);
                      return;
                    }
                    setRange(r);
                    setStartLocal(toLocalFromDate(r.start));
                    setEndLocal(toLocalFromDate(r.end));
                  }}
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 4. 모집/참가 조건 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                모집 조건
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                <FormGroup row>
                  <FormControlLabel
                    control={<Checkbox name="maleLimit" checked={genderControl.maleLimit} onChange={handleGenderChange} />}
                    label="남자 제한"
                  />
                  <FormControlLabel
                    control={<Checkbox name="femaleLimit" checked={genderControl.femaleLimit} onChange={handleGenderChange} />}
                    label="여자 제한"
                  />
                  <FormControlLabel
                    control={<Checkbox name="balanceRequired" checked={genderControl.balanceRequired} onChange={handleGenderChange} />}
                    label="성비 균형 맞추기"
                  />
                </FormGroup>

                <TextField
                  label="정원"
                  type="number"
                  inputProps={{ min: 1, step: 1 }}
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                  sx={{ minWidth: 140 }}
                />
              </Stack>
            </Box>

            <Divider sx={{ my: 3 }} />

            {/* 5. 이미지 & 위치 */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                이미지 / 위치
              </Typography>
              <Stack spacing={2}>
                <ImagePickerGrid
                  value={[]}
                  onChange={() => {}}
                  max={5}
                  columns={3}
                  helperText="최대 5장까지 업로드 가능합니다. (실제 업로드 연동은 추후 진행)"
                />
                <LocationMap title="로컬잇 밋업 @ 사림동" lat={lat} lng={lng} zoom={3} height={380} />
              </Stack>
            </Box>

            {/* 다이얼로그들 */}
            <CreateSeriesDialog
              open={createSeriesOpen}
              onClose={() => setCreateSeriesOpen(false)}
              newSeriesTitle={newSeriesTitle}
              setNewSeriesTitle={setNewSeriesTitle}
              newSeriesDesc={newSeriesDesc}
              setNewSeriesDesc={setNewSeriesDesc}
              newSeriesPublic={newSeriesPublic}
              setNewSeriesPublic={setNewSeriesPublic}
              createSeries={createSeries}
              setSelectedSeries={setSelectedSeries}
            />

            <EditSeriesDialog
              open={editSeriesOpen}
              onClose={() => setEditSeriesOpen(false)}
              selectedSeries={selectedSeries}
              setSelectedSeries={setSelectedSeries}
              seriesDetails={seriesDetails}
              updateSeries={updateSeries}
              editSeriesTitle={editSeriesTitle}
              setEditSeriesTitle={setEditSeriesTitle}
              editSeriesDesc={editSeriesDesc}
              setEditSeriesDesc={setEditSeriesDesc}
              editSeriesPublic={editSeriesPublic}
              setEditSeriesPublic={setEditSeriesPublic}
            />

            <BulkCreateDialog
              open={bulkOpen}
              onClose={() => setBulkOpen(false)}
              bulkFrequency={bulkFrequency}
              setBulkFrequency={setBulkFrequency}
              bulkCount={bulkCount}
              setBulkCount={setBulkCount}
              bulkCreate={bulkCreate}
              selectedSeries={selectedSeries}
              startLocal={startLocal}
              endLocal={endLocal}
              baseValid={baseValid}
              title={title}
              desc={desc}
              location={location}
              capacity={capacity}
              episodeNo={episodeNo}
            />

            {(createMut.isError || createSeries.isPending) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {(createMut.error as any)?.response?.data?.message ?? "처리 중 오류가 발생했습니다."}
              </Alert>
            )}
          </CardContent>

          <CardActions sx={{ p: 2, borderTop: "1px solid", borderColor: "divider" }}>
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <MUIButton
                variant="outlined"
                color="inherit"
                fullWidth
                onClick={() => navigate(-1)}
                disabled={createMut.isPending || createSeries.isPending}
              >
                취소
              </MUIButton>
              <MUIButton
                type="submit"
                variant="contained"
                fullWidth
                disabled={!valid || createMut.isPending || createSeries.isPending}
                startIcon={createMut.isPending || createSeries.isPending ? <CircularProgress size={18} /> : undefined}
              >
                {createMut.isPending || createSeries.isPending ? "등록 중…" : "등록"}
              </MUIButton>
            </Stack>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}
