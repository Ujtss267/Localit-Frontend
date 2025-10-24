// src/features/event/pages/EventCreatePage.tsx
import { useState, type FormEvent, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEvent } from "../queries";
import type { CreateEventDto } from "../api";

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
  RadioGroup,
  FormControlLabel,
  Radio,
  Autocomplete,
  Switch,
} from "@mui/material";

import { ImagePickerGrid } from "@/components";
import TimeRangeBadgePicker from "@/components/ui/TimeRangeBadgePicker";
import React from "react";

/** ▼▼▼ 시리즈 API 훅 예시 (네 API에 맞춰 구현/대체) ▼▼▼ */
type SeriesOption = { seriesId: number; title: string };
function useSearchSeries() {
  // 실서비스: debounce + 서버검색
  const [options, setOptions] = useState<SeriesOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const search = async (keyword: string) => {
    setIsLoading(true);
    try {
      // TODO: 서버 검색으로 교체
      // const res = await api.series.search(keyword);
      // setOptions(res.data);
      // Demo
      const seed = ["영어회화 스터디", "보드게임 정모", "사진 동호회"];
      const filtered = keyword ? seed.filter((s) => s.includes(keyword)) : seed;
      setOptions(
        filtered.map((t, i) => ({
          seriesId: i + 1,
          title: t,
        }))
      );
    } finally {
      setIsLoading(false);
    }
  };

  return { options, isLoading, search };
}

function useCreateSeries() {
  const [isPending, setPending] = useState(false);
  const mutateAsync = async (payload: { title: string; description?: string; isPublic?: boolean }) => {
    setPending(true);
    try {
      // TODO: 서버 연동
      // const res = await api.series.create(payload);
      // return res.data; // { seriesId: number, ... }
      return { seriesId: Math.floor(Math.random() * 100000), ...payload };
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
type SeriesAttachMode = "existing" | "create";

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

  // 이벤트 유형
  const [mode, setMode] = useState<EventMode>("single");

  // 시리즈 부가 상태
  const [seriesAttachMode, setSeriesAttachMode] = useState<SeriesAttachMode>("existing");
  const [episodeNo, setEpisodeNo] = useState<number | "">("");
  const [seriesKeyword, setSeriesKeyword] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(null);

  // 새 시리즈 생성용
  const [newSeriesTitle, setNewSeriesTitle] = useState("");
  const [newSeriesDesc, setNewSeriesDesc] = useState("");
  const [newSeriesPublic, setNewSeriesPublic] = useState(true);

  const seriesSearch = useSearchSeries();
  const createSeries = useCreateSeries();

  // 시간 선택/연동 상태
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);
  const [duration, setDuration] = useState(60); // 분 단위 (기본 60)

  const formatLabel = (d: Date) => d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

  const baseValid =
    title.trim().length >= 2 &&
    desc.trim().length >= 5 &&
    location.trim().length >= 2 &&
    !!startLocal &&
    !!endLocal &&
    new Date(endLocal) > new Date(startLocal) &&
    typeof capacity === "number" &&
    capacity > 0;

  const seriesValid = mode === "single" ? true : seriesAttachMode === "existing" ? !!selectedSeries : newSeriesTitle.trim().length >= 2; // 새 시리즈는 최소 제목 필요

  const valid = baseValid && seriesValid;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    let seriesId: number | undefined = undefined;

    // 시리즈 회차형이면 시리즈 ID 확보
    if (mode === "series") {
      if (seriesAttachMode === "existing") {
        if (!selectedSeries) return;
        seriesId = selectedSeries.seriesId;
      } else {
        // 새 시리즈 먼저 생성
        const created = await createSeries.mutateAsync({
          title: newSeriesTitle.trim(),
          description: newSeriesDesc.trim() || undefined,
          isPublic: newSeriesPublic,
        });
        seriesId = created.seriesId;
      }
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
        navigate(res?.id ? `/event/${res.id}` : "/events", { replace: true });
      },
    });
  }

  // 시리즈 검색 트리거 (간단 디바운스 느낌)
  useMemo(() => {
    if (mode === "series" && seriesAttachMode === "existing") {
      const k = seriesKeyword.trim();
      if (k.length >= 1) seriesSearch.search(k);
      else seriesSearch.search("");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, seriesAttachMode, seriesKeyword]);

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        새 이벤트 만들기
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        단발형 또는 시리즈의 회차로 등록할 수 있습니다.
      </Typography>

      <Box component="form" onSubmit={onSubmit}>
        <Card variant="outlined">
          <CardContent>
            {/* 이벤트 유형 토글 */}
            <Stack spacing={1} sx={{ mb: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">
                이벤트 유형
              </Typography>
              <ToggleButtonGroup value={mode} exclusive onChange={(_, v) => v && setMode(v)} size="small" sx={{ alignSelf: "flex-start" }}>
                <ToggleButton value="single">단발형</ToggleButton>
                <ToggleButton value="series">시리즈 회차형</ToggleButton>
              </ToggleButtonGroup>
            </Stack>

            {/* 시리즈 회차형 옵션 */}
            {mode === "series" && (
              <Box className="rounded-2xl border p-3 mt-2 bg-neutral-50">
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  시리즈 연결 방식
                </Typography>

                <RadioGroup row value={seriesAttachMode} onChange={(e) => setSeriesAttachMode(e.target.value as SeriesAttachMode)}>
                  <FormControlLabel value="existing" control={<Radio />} label="기존 시리즈에 회차 추가" />
                  <FormControlLabel value="create" control={<Radio />} label="새 시리즈 생성 후 회차 추가" />
                </RadioGroup>

                {seriesAttachMode === "existing" ? (
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
                        />
                      )}
                    />
                    <TextField
                      label="회차 번호 (선택)"
                      type="number"
                      inputProps={{ min: 1, step: 1 }}
                      value={episodeNo}
                      onChange={(e) => setEpisodeNo(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
                    />
                  </Stack>
                ) : (
                  <Stack spacing={2} sx={{ mt: 1 }}>
                    <TextField
                      label="새 시리즈 제목"
                      placeholder="예) 영어회화 스터디"
                      value={newSeriesTitle}
                      onChange={(e) => setNewSeriesTitle(e.target.value)}
                      required
                    />
                    <TextField
                      label="새 시리즈 설명 (선택)"
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
                    <TextField
                      label="회차 번호 (선택)"
                      type="number"
                      inputProps={{ min: 1, step: 1 }}
                      value={episodeNo}
                      onChange={(e) => setEpisodeNo(e.target.value === "" ? "" : Math.max(1, Number(e.target.value)))}
                    />
                  </Stack>
                )}
              </Box>
            )}

            <Divider sx={{ my: 2 }} />

            {/* 기본 입력 */}
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
                placeholder="모임/공연에 대한 소개"
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <TextField label="위치" placeholder="예) 서울 마포" value={location} onChange={(e) => setLocation(e.target.value)} fullWidth />

              <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                <TextField
                  label="시작"
                  type="datetime-local"
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
                <TextField
                  label="종료"
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => {
                    const v = e.target.value;
                    setEndLocal(v);
                    // 종료를 직접 바꿀땐 range만 맞추고 duration은 유지(슬라이더 기준)
                    if (startLocal && v) {
                      const s = new Date(startLocal);
                      const ed = new Date(v);
                      if (ed > s) setRange({ start: s, end: ed });
                      else setRange(null);
                    }
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                  error={!!startLocal && !!endLocal && new Date(endLocal) <= new Date(startLocal)}
                  helperText={!!startLocal && !!endLocal && new Date(endLocal) <= new Date(startLocal) ? "종료 시간은 시작 이후여야 합니다." : " "}
                />
              </Stack>

              <TextField
                label="정원"
                type="number"
                inputProps={{ min: 1, step: 1 }}
                value={capacity}
                onChange={(e) => setCapacity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                fullWidth
              />

              <ImagePickerGrid
                value={[]}
                onChange={() => {}}
                max={5}
                columns={3}
                helperText="최대 5장까지 업로드 가능합니다. (실제 업로드 연동은 추후 진행)"
              />

              {/* 시간 배지 피커 */}
              <TimeRangeBadgePicker
                from="09:00"
                to="18:00"
                stepMinutes={30}
                selectionMode="range"
                value={range}
                onChange={(r) => setRange(isNaN(r.start.getTime()) ? null : r)}
              />
            </Stack>

            {(createMut.isError || createSeries.isPending) && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {(createMut.error as any)?.response?.data?.message ?? "처리 중 오류가 발생했습니다."}
              </Alert>
            )}
          </CardContent>

          <CardActions sx={{ p: 2 }}>
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
