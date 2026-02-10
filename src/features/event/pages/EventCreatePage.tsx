import React, { useEffect, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateEvent } from "../queries";
import {
  createEvent,
  createSeriesApi,
  updateSeriesApi,
  type AdmissionPolicy,
  type CreateEventDto,
  type EventType,
  type Visibility,
} from "../api";
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
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  useMediaQuery,
  useTheme,
} from "@mui/material";

import { ImagePickerGrid, LocationMap } from "@/components";
import TimeRangeBadgePicker from "@/components/ui/TimeRangeBadgePicker";

import SeriesConnector from "../components/SeriesConnector";
import CreateSeriesDialog from "../components/CreateSeriesDialog";
import EditSeriesDialog from "../components/EditSeriesDialog";
import BulkCreateDialog from "../components/BulkCreateDialog";
import { useRooms } from "@/features/room/queries";
import { useAuth } from "@/app/providers/AuthProvider";
import { sampleData } from "@/mocks/sampleData";
import { checkRoomAvailability } from "@/features/room/api";

type SeriesOption = { seriesId: number; title: string };
type EventMode = "single" | "series";

type CombinedError = { message?: string };

const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

function toISO(local: string) {
  if (!local) return "";
  return new Date(local).toISOString();
}

function toLocalFromDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function combineDateAndTime(dateYmd: string, timeSource: Date) {
  const [y, m, d] = dateYmd.split("-").map(Number);
  const out = new Date(timeSource);
  out.setFullYear(y, (m ?? 1) - 1, d ?? 1);
  return out;
}

function replaceDatePart(dateYmd: string, localDateTime: string) {
  if (!localDateTime) return "";
  const [y, m, d] = dateYmd.split("-").map(Number);
  const out = new Date(localDateTime);
  out.setFullYear(y, (m ?? 1) - 1, d ?? 1);
  return toLocalFromDate(out);
}

function todayYmd() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function formatLocalDateTime(local: string) {
  if (!local) return "";
  const d = new Date(local);
  if (isNaN(d.getTime())) return local;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function EventCreatePage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const createMut = useCreateEvent();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { user } = useAuth();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [selectedRoomId, setSelectedRoomId] = useState<number | "">("");
  const [eventDate, setEventDate] = useState(todayYmd());
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [price, setPrice] = useState<number | "">(0);
  const [type, setType] = useState<EventType>("GENERAL");
  const [visibility, setVisibility] = useState<Visibility>("PUBLIC");
  const [admissionPolicy, setAdmissionPolicy] = useState<AdmissionPolicy>("FIRST_COME");
  const [paidToHost, setPaidToHost] = useState(true);

  const [genderControl, setGenderControl] = useState({
    maleLimit: false,
    femaleLimit: false,
    balanceRequired: false,
  });

  const [mode, setMode] = useState<EventMode>("single");

  const [episodeNo, setEpisodeNo] = useState<number | "">("");
  const [seriesKeyword, setSeriesKeyword] = useState("");
  const [selectedSeries, setSelectedSeries] = useState<SeriesOption | null>(null);

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
  const seriesDetails = useFetchSeriesDetails(selectedSeries?.seriesId ?? null);

  const createSeries = useMutation({
    mutationFn: (payload: { title: string; description?: string; isPublic?: boolean }) => createSeriesApi(payload),
  });

  const updateSeries = useMutation({
    mutationFn: (payload: { seriesId: number; title?: string; description?: string; isPublic?: boolean }) => updateSeriesApi(payload),
  });

  const bulkCreate = useMutation({
    mutationFn: async (payloads: Array<CreateEventDto & { seriesId: number; episodeNo?: number }>) => {
      if (USE_SAMPLE) {
        return { created: payloads.length };
      }
      const rows = await Promise.all(payloads.map((p) => createEvent(p)));
      return { created: rows.length };
    },
  });

  const [range, setRange] = useState<{ start: Date; end: Date } | null>(null);
  const [duration, setDuration] = useState(60);
  const { data: roomsData, isLoading: roomsLoading } = useRooms();
  const viewerId = user?.id ?? 1;
  const userPref = sampleData.userPreferences[viewerId];
  const [needsRoom, setNeedsRoom] = useState(Boolean(userPref?.needsRoom));

  const distanceKm = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const availableRooms = React.useMemo(() => {
    const base = (roomsData ?? []).filter((r) => r.available);
    if (!needsRoom) return base;
    if (typeof userPref?.lat !== "number" || typeof userPref?.lng !== "number") return base;
    return [...base].sort((a, b) => {
      if (a.lat == null || a.lng == null) return 1;
      if (b.lat == null || b.lng == null) return -1;
      return distanceKm(userPref.lat!, userPref.lng!, a.lat, a.lng) - distanceKm(userPref.lat!, userPref.lng!, b.lat, b.lng);
    });
  }, [roomsData, needsRoom, userPref?.lat, userPref?.lng]);

  const selectedRoom = selectedRoomId === "" ? null : availableRooms.find((r) => r.id === Number(selectedRoomId)) ?? null;
  const hasValidTimeRange = Boolean(startLocal && endLocal && new Date(endLocal) > new Date(startLocal));
  const { data: availability } = useQuery({
    queryKey: ["room-availability", selectedRoom?.id, startLocal, endLocal],
    enabled: Boolean(needsRoom && selectedRoom?.id && hasValidTimeRange),
    queryFn: () => checkRoomAvailability(selectedRoom!.id, toISO(startLocal), toISO(endLocal)),
  });

  const canEdit = Boolean(selectedSeries?.seriesId);

  useEffect(() => {
    if (!editSeriesOpen || !selectedSeries) return;
    setEditSeriesTitle(selectedSeries.title);
    setEditSeriesDesc(seriesDetails.details?.description ?? "");
    setEditSeriesPublic(seriesDetails.details?.isPublic ?? true);
  }, [editSeriesOpen, selectedSeries, seriesDetails.details]);

  const handleGenderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setGenderControl((prev) => ({ ...prev, [name]: checked }));
  };

  const baseValid =
    title.trim().length >= 2 &&
    desc.trim().length >= 5 &&
    location.trim().length >= 2 &&
    !!eventDate &&
    !!startLocal &&
    !!endLocal &&
    new Date(endLocal) > new Date(startLocal) &&
    typeof capacity === "number" &&
    capacity > 0 &&
    typeof price === "number" &&
    price >= 0;

  const seriesValid = mode === "single" ? true : !!selectedSeries;
  const roomValid = !needsRoom || (Boolean(selectedRoom) && (availability?.available ?? false));
  const valid = baseValid && seriesValid && roomValid;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    let seriesId: number | undefined;
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
      price: Number(price),
      type,
      visibility,
      admissionPolicy,
      paidToHost,
      genderControl,
      ...(selectedRoom ? { roomId: selectedRoom.id } : {}),
      ...(seriesId ? { seriesId } : {}),
      ...(episodeNo !== "" ? { episodeNo: Number(episodeNo) } : {}),
    };

    createMut.mutate(payload, {
      onSuccess: (res) => {
        navigate(res?.id ? `/events/${res.id}` : "/events", { replace: true });
      },
    });
  }

  useEffect(() => {
    if (mode !== "series") return;
    const k = seriesKeyword.trim();
    seriesSearch.search(k);
  }, [mode, seriesKeyword]);

  useEffect(() => {
    if (!selectedRoom) return;
    setLocation(selectedRoom.location);
  }, [selectedRoom]);

  useEffect(() => {
    const roomIdFromQuery = sp.get("roomId");
    if (!roomIdFromQuery) return;
    const n = Number(roomIdFromQuery);
    if (Number.isFinite(n)) {
      setNeedsRoom(true);
      setSelectedRoomId(n);
    }
  }, [sp]);

  useEffect(() => {
    const qsStart = sp.get("startLocal");
    const qsEnd = sp.get("endLocal");
    if (qsStart && !startLocal) setStartLocal(qsStart);
    if (qsEnd && !endLocal) setEndLocal(qsEnd);
  }, [sp, startLocal, endLocal]);

  useEffect(() => {
    if (needsRoom) return;
    setSelectedRoomId("");
  }, [needsRoom]);

  const lat = 35.2277;
  const lng = 128.6812;

  const isPending = createMut.isPending || createSeries.isPending || updateSeries.isPending || bulkCreate.isPending;
  const combinedError =
    (createMut.error as CombinedError) ||
    (createSeries.error as CombinedError) ||
    (updateSeries.error as CombinedError) ||
    (bulkCreate.error as CombinedError);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 4 }, px: { xs: 1, sm: 2 }, pb: { xs: 10, sm: 4 } }}>
      <Stack spacing={1} sx={{ mb: { xs: 1.5, sm: 3 } }}>
        <Typography variant="h4" fontWeight={700} sx={{ fontSize: { xs: 20, sm: 32 }, lineHeight: 1.2 }}>
          새 이벤트 만들기
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: 12, sm: 14 } }}>
          기본 정보부터 일정, 모집 조건, 위치까지 순서대로 입력해 주세요.
        </Typography>
      </Stack>

      <Box component="form" onSubmit={onSubmit}>
        <Card variant="outlined" sx={{ overflow: "hidden" }}>
          <CardContent
            sx={{
              p: { xs: 1.5, sm: 3 },
              "& .MuiInputBase-input": { fontSize: { xs: 13, sm: 14 } },
              "& .MuiInputLabel-root": { fontSize: { xs: 12, sm: 14 } },
              "& .MuiFormHelperText-root": { fontSize: { xs: 11, sm: 12 } },
              "& .MuiFormControlLabel-label": { fontSize: { xs: 12, sm: 14 } },
              "& .MuiMenuItem-root": { fontSize: { xs: 13, sm: 14 } },
            }}
          >
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: { xs: 12, sm: 14 } }}>
                이벤트 유형
              </Typography>
              <ToggleButtonGroup
                value={mode}
                exclusive
                onChange={(_, v) => v && setMode(v)}
                size="small"
                fullWidth={isMobile}
                sx={{ borderRadius: 3 }}
              >
                <ToggleButton value="single" sx={{ fontSize: { xs: 12, sm: 14 }, py: { xs: 0.8, sm: 1 } }}>
                  단발형
                </ToggleButton>
                <ToggleButton value="series" sx={{ fontSize: { xs: 12, sm: 14 }, py: { xs: 0.8, sm: 1 } }}>
                  시리즈 회차형
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>

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
                  createSeriesOpen={createSeriesOpen}
                />
              </Box>
            )}

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: 15, sm: 18 } }}>
                기본 정보
              </Typography>
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                <TextField
                  label="제목"
                  placeholder="예) 로컬 스터디 모임"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  size={isMobile ? "small" : "medium"}
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
                  size={isMobile ? "small" : "medium"}
                  fullWidth
                />
                <FormControl fullWidth size={isMobile ? "small" : "medium"}>
                  <InputLabel id="need-room-label">공간 연결</InputLabel>
                  <Select
                    labelId="need-room-label"
                    value={needsRoom ? "yes" : "no"}
                    label="공간 연결"
                    onChange={(e) => setNeedsRoom(e.target.value === "yes")}
                  >
                    <MenuItem value="yes">공간 필요</MenuItem>
                    <MenuItem value="no">공간 없이 진행</MenuItem>
                  </Select>
                </FormControl>

                <FormControl fullWidth size={isMobile ? "small" : "medium"} disabled={!needsRoom || !hasValidTimeRange}>
                  <InputLabel id="room-link-label">연결 공간(선택)</InputLabel>
                  <Select
                    labelId="room-link-label"
                    value={selectedRoomId === "" ? "" : String(selectedRoomId)}
                    label="연결 공간(선택)"
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelectedRoomId(v === "" ? "" : Number(v));
                    }}
                    disabled={roomsLoading || !hasValidTimeRange}
                  >
                    <MenuItem value="">공간 없이 진행</MenuItem>
                    {availableRooms.map((room) => (
                      <MenuItem key={room.id} value={room.id}>
                        {room.name} · {room.location}
                        {needsRoom && typeof userPref?.lat === "number" && typeof userPref?.lng === "number" && room.lat != null && room.lng != null
                          ? ` (${distanceKm(userPref.lat, userPref.lng, room.lat, room.lng).toFixed(1)}km)`
                          : ""}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                {needsRoom && (
                  <MUIButton
                    variant="outlined"
                    size={isMobile ? "small" : "medium"}
                    onClick={() => navigate(`/rooms?pickForEvent=1&startLocal=${encodeURIComponent(startLocal)}&endLocal=${encodeURIComponent(endLocal)}`)}
                    disabled={!hasValidTimeRange}
                  >
                    {hasValidTimeRange ? "공간 목록에서 선택/등록" : "시간을 먼저 선택해 주세요"}
                  </MUIButton>
                )}
                {needsRoom && selectedRoom && hasValidTimeRange && (
                  <Alert severity="info" variant="outlined">
                    선택 공간: {selectedRoom.name} / 시작: {formatLocalDateTime(startLocal)} / 종료: {formatLocalDateTime(endLocal)}
                  </Alert>
                )}
                <TextField
                  label="위치"
                  placeholder={needsRoom && selectedRoom ? "선택한 공간의 위치가 자동 입력됩니다." : "예) 서울 마포"}
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  size={isMobile ? "small" : "medium"}
                  disabled={Boolean(needsRoom && selectedRoom)}
                  helperText={
                    needsRoom
                      ? selectedRoom
                        ? availability?.available === false
                          ? "선택한 시간에는 이 공간 예약이 불가능합니다."
                          : `연결된 공간: ${selectedRoom.name}`
                        : hasValidTimeRange
                          ? "사용자 위치 기준 가까운 순으로 정렬됩니다."
                          : "이벤트 시작/종료 시간을 먼저 선택하면 공간 선택이 가능합니다."
                      : "공간을 선택하지 않으면 위치를 직접 입력하세요."
                  }
                  fullWidth
                />

                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  <FormControl fullWidth>
                    <InputLabel id="event-type-label">이벤트 성격</InputLabel>
                    <Select
                      labelId="event-type-label"
                      value={type}
                      label="이벤트 성격"
                      onChange={(e) => setType(e.target.value as EventType)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <MenuItem value="GENERAL">일반</MenuItem>
                      <MenuItem value="MENTORING">멘토링</MenuItem>
                      <MenuItem value="WORKSHOP">워크숍</MenuItem>
                      <MenuItem value="MEETUP">밋업</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="visibility-label">공개 범위</InputLabel>
                    <Select
                      labelId="visibility-label"
                      value={visibility}
                      label="공개 범위"
                      onChange={(e) => setVisibility(e.target.value as Visibility)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <MenuItem value="PUBLIC">전체 공개</MenuItem>
                      <MenuItem value="FOLLOWERS">팔로워 공개</MenuItem>
                      <MenuItem value="PRIVATE">비공개</MenuItem>
                    </Select>
                  </FormControl>

                  <FormControl fullWidth>
                    <InputLabel id="admission-policy-label">입장 정책</InputLabel>
                    <Select
                      labelId="admission-policy-label"
                      value={admissionPolicy}
                      label="입장 정책"
                      onChange={(e) => setAdmissionPolicy(e.target.value as AdmissionPolicy)}
                      size={isMobile ? "small" : "medium"}
                    >
                      <MenuItem value="FIRST_COME">선착순</MenuItem>
                      <MenuItem value="REVIEW">심사 승인</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </Stack>
            </Box>

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: 15, sm: 18 } }}>
                일정
              </Typography>
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                <TextField
                  label="이벤트 발생일"
                  type="date"
                  value={eventDate}
                  onChange={(e) => {
                    const dateYmd = e.target.value;
                    setEventDate(dateYmd);
                    if (!dateYmd) return;
                    if (startLocal) setStartLocal(replaceDatePart(dateYmd, startLocal));
                    if (endLocal) setEndLocal(replaceDatePart(dateYmd, endLocal));
                  }}
                  InputLabelProps={{ shrink: true }}
                  size={isMobile ? "small" : "medium"}
                  fullWidth
                  required
                />

                <TimeRangeBadgePicker
                  from="09:00"
                  to="23:00"
                  stepMinutes={30}
                  value={range}
                  onChange={(r) => {
                    if (isNaN(r.start.getTime()) || !eventDate) {
                      setRange(null);
                      return;
                    }
                    const nextStart = combineDateAndTime(eventDate, r.start);
                    const nextEnd = combineDateAndTime(eventDate, r.end);
                    if (nextEnd <= nextStart) {
                      nextEnd.setDate(nextEnd.getDate() + 1);
                    }
                    setRange({ start: nextStart, end: nextEnd });
                    setStartLocal(toLocalFromDate(nextStart));
                    setEndLocal(toLocalFromDate(nextEnd));
                    setDuration(Math.max(30, Math.round((nextEnd.getTime() - nextStart.getTime()) / 60000)));
                  }}
                />
              </Stack>
            </Box>

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: 15, sm: 18 } }}>
                모집 조건
              </Typography>
              <Stack direction="column" spacing={{ xs: 1.5, sm: 2 }}>
                <FormGroup row={!isMobile}>
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
                  <FormControlLabel control={<Checkbox checked={paidToHost} onChange={(e) => setPaidToHost(e.target.checked)} />} label="호스트 정산" />
                </FormGroup>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <TextField
                    label="정원"
                    type="number"
                    inputProps={{ min: 1, step: 1 }}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                  />

                  <TextField
                    label="참가비"
                    type="number"
                    inputProps={{ min: 0, step: 1000 }}
                    value={price}
                    onChange={(e) => setPrice(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider sx={{ my: { xs: 2, sm: 3 } }} />

            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
              <Typography variant="h6" sx={{ mb: 1.25, fontSize: { xs: 15, sm: 18 } }}>
                이미지 / 위치
              </Typography>
              <Stack spacing={{ xs: 1.5, sm: 2 }}>
                <ImagePickerGrid
                  value={[]}
                  onChange={() => {}}
                  max={5}
                  columns={isMobile ? 2 : 3}
                  helperText="최대 5장까지 업로드 가능합니다. (실제 업로드 연동은 추후 진행)"
                />
                <LocationMap title="로컬잇 밋업 @ 사림동" lat={lat} lng={lng} zoom={3} height={isMobile ? 260 : 380} />
              </Stack>
            </Box>

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

            {combinedError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {combinedError.message ?? "처리 중 오류가 발생했습니다."}
              </Alert>
            )}
          </CardContent>

          <CardActions
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderTop: "1px solid",
              borderColor: "divider",
              position: { xs: "sticky", sm: "static" },
              bottom: 0,
              zIndex: 2,
              backgroundColor: "background.paper",
            }}
          >
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <MUIButton variant="outlined" color="inherit" fullWidth onClick={() => navigate(-1)} disabled={isPending} size={isMobile ? "small" : "medium"}>
                취소
              </MUIButton>
              <MUIButton
                type="submit"
                variant="contained"
                fullWidth
                size={isMobile ? "small" : "medium"}
                disabled={!valid || isPending}
                startIcon={isPending ? <CircularProgress size={18} /> : undefined}
              >
                {isPending ? "등록 중…" : "등록"}
              </MUIButton>
            </Stack>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}
