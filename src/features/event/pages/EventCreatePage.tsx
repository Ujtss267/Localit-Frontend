// src/features/event/pages/EventCreatePage.tsx
import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateEvent } from "../queries";
import type { CreateEventDto } from "../api";

import { Container, Card, CardContent, CardActions, Typography, TextField, Button, Stack, Alert, CircularProgress, Box } from "@mui/material";

import { ImagePickerGrid } from "@/components";
import TimeRangeBadgePicker from "@/components/ui/TimeRangeBadgePicker";
import React from "react";

function toISO(local: string) {
  if (!local) return "";
  const d = new Date(local);
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString();
}

export default function EventCreatePage() {
  const navigate = useNavigate();
  const createMut = useCreateEvent();

  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [location, setLocation] = useState("");
  const [startLocal, setStartLocal] = useState("");
  const [endLocal, setEndLocal] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");

  const valid =
    title.trim().length >= 2 &&
    desc.trim().length >= 5 &&
    location.trim().length >= 2 &&
    !!startLocal &&
    !!endLocal &&
    new Date(endLocal) > new Date(startLocal) &&
    typeof capacity === "number" &&
    capacity > 0;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const payload: CreateEventDto = {
      title: title.trim(),
      description: desc.trim(),
      location: location.trim(),
      startTime: toISO(startLocal),
      endTime: toISO(endLocal),
      capacity: Number(capacity),
    };

    createMut.mutate(payload, {
      onSuccess: (res) => {
        navigate(res?.id ? `/event/${res.id}` : "/events", { replace: true });
      },
    });
  }
  //#region TimeRangeBadgePicker 사용 예시

  // ✅ 부모가 상태 보유
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);

  // (선택) 비활성화 규칙이 있으면 이렇게 정의
  const isSlotDisabled = (slotStart: Date) => {
    // 예: 12:00~13:00 점심 시간 비활성화
    const h = slotStart.getHours();
    return h === 12;
  };

  // (선택) 표기 형식 커스터마이즈
  const formatLabel = (d: Date) => d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });
  //#endregion

  return (
    <Container maxWidth="sm" sx={{ py: 3 }}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        새 이벤트 만들기
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        제목, 시간, 장소, 정원을 입력해 주세요.
      </Typography>

      <Box component="form" onSubmit={onSubmit}>
        <Card variant="outlined">
          <CardContent>
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
                  onChange={(e) => setStartLocal(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  required
                />
                <TextField
                  label="종료"
                  type="datetime-local"
                  value={endLocal}
                  onChange={(e) => setEndLocal(e.target.value)}
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
              ></ImagePickerGrid>

              <TimeRangeBadgePicker
                from="09:00"
                to="18:30"
                stepMinutes={30} // 30분 단위 Chip
                durationMinutes={60} // ✅ 원하는 “선택 유지 시간(2시간)”
                value={range} // ✅ 부모 상태를 내려줌 (controlled 포인트 1)
                onChange={(next) => {
                  // ✅ 클릭 시 부모 상태 갱신 (controlled 포인트 2)
                  setRange(next);
                }}
                isSlotDisabled={isSlotDisabled} // (선택) 금지 슬롯
                includePostEndMarker={true} // (선택) 경계 마커 표시
                formatLabel={formatLabel} // (선택) 시간 라벨 포맷
                //gridClassName="grid grid-cols-10 gap-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8"
                badgeHeight={40}
                helperText="배지를 클릭하면 시작 시각부터 2시간 범위가 선택됩니다. (끝 경계 배지 포함)"
              />
              <Typography variant="caption" color="text.secondary">
                이벤트 시간대 뱃지 선택 (추후 구현)
              </Typography>
            </Stack>

            {createMut.isError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {(createMut.error as any)?.response?.data?.message ?? "등록에 실패했습니다."}
              </Alert>
            )}
          </CardContent>

          <CardActions sx={{ p: 2 }}>
            <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
              <Button variant="outlined" color="inherit" fullWidth onClick={() => navigate(-1)} disabled={createMut.isPending}>
                취소
              </Button>
              <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={!valid || createMut.isPending}
                startIcon={createMut.isPending ? <CircularProgress size={18} /> : undefined}
              >
                {createMut.isPending ? "등록 중…" : "등록"}
              </Button>
            </Stack>
          </CardActions>
        </Card>
      </Box>
    </Container>
  );
}
