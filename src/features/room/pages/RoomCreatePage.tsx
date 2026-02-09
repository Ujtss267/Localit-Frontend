// src/features/room/pages/RoomCreatePage.tsx
import { useState, type FormEvent, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCreateRoom } from "../queries";
import type { CreateRoomDto } from "../api";

// MUI
import {
  Container,
  Grid,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Stack,
  Typography,
  Alert,
  Chip,
  Divider,
  Box,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import DoNotDisturbOnIcon from "@mui/icons-material/DoNotDisturbOn";
import ImagePickerGrid from "@/components/ui/ImagePickerGrid";

export default function RoomCreatePage() {
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const createMut = useCreateRoom();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState<number | "">("");
  const [available, setAvailable] = useState(true);
  const fromEventCreate = sp.get("fromEventCreate") === "1";

  // (선택) 이미지 미리보기 — 실제 업로드는 추후 멀티파트 연동
  const [images, setImages] = useState<File[]>([]);
  const previews = useMemo(() => images.map((f) => URL.createObjectURL(f)), [images]);

  const valid = name.trim().length >= 2 && location.trim().length >= 2 && typeof capacity === "number" && capacity > 0;

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!valid) return;

    const payload: CreateRoomDto = {
      name: name.trim(),
      location: location.trim(),
      capacity: Number(capacity),
      available,
    };

    // NOTE: 이미지 업로드가 필요하면 FormData로 변경 + 백엔드 엔드포인트 분리 권장
    createMut.mutate(payload, {
      onSuccess: (room) =>
        navigate(fromEventCreate ? `/events/new?roomId=${room.id}` : `/rooms`, {
          replace: true,
        }),
    });
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 1.5, sm: 3 }, px: { xs: 1, sm: 2 } }}>
      <Typography variant="h5" fontWeight={700} gutterBottom sx={{ fontSize: { xs: 20, sm: 28 }, lineHeight: 1.2 }}>
        공간 등록
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: { xs: 1.5, sm: 2 }, fontSize: { xs: 12, sm: 14 } }}>
        모임/이벤트가 열릴 공간 정보를 입력해 주세요.
      </Typography>

      <Box component="form" onSubmit={onSubmit}>
        <Grid container spacing={{ xs: 1.5, sm: 2 }}>
          {/* 좌: 입력 폼 */}
          <Grid size={{ xs: 12, md: 7 }}>
            <Card variant="outlined" sx={{ borderRadius: { xs: 2, sm: 3 } }}>
              <CardHeader
                title="기본 정보"
                titleTypographyProps={{ fontSize: { xs: 15, sm: 18 }, fontWeight: 700 }}
                sx={{ pb: 0.5, "& .MuiCardHeader-content": { overflow: "hidden" } }}
              />
              <CardContent>
                <Stack spacing={{ xs: 1.5, sm: 2 }}>
                  <TextField
                    label="이름"
                    placeholder="예) A동 3층 소회의실"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                  />
                  <TextField
                    label="위치"
                    placeholder="예) 서울 마포구 ..."
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                  />
                  <TextField
                    label="정원"
                    type="number"
                    inputProps={{ min: 1, step: 1 }}
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value === "" ? "" : Math.max(0, Number(e.target.value)))}
                    size={isMobile ? "small" : "medium"}
                    fullWidth
                    required
                    helperText="수용 가능한 최대 인원 수"
                  />
                  <FormControlLabel
                    control={<Switch checked={available} onChange={(e) => setAvailable(e.target.checked)} />}
                    label={available ? "예약 가능" : "예약 불가"}
                  />

                  <Divider sx={{ my: 1 }} />

                  {/* 🔽 분리한 컴포넌트 사용 */}
                  <ImagePickerGrid
                    value={images}
                    onChange={setImages}
                    max={5}
                    columns={isMobile ? 2 : 3}
                    helperText="최대 5장까지 업로드 가능합니다. (실제 업로드 연동은 추후 진행)"
                  />
                </Stack>

                {createMut.isError && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {(createMut.error as any)?.response?.data?.message ?? "등록에 실패했습니다."}
                  </Alert>
                )}
              </CardContent>

              <CardActions sx={{ p: { xs: 1.5, sm: 2 }, pt: { xs: 0.5, sm: 1 } }}>
                <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
                  <Button
                    variant="outlined"
                    color="inherit"
                    fullWidth
                    onClick={() => navigate(-1)}
                    disabled={createMut.isPending}
                    size={isMobile ? "small" : "medium"}
                  >
                    취소
                  </Button>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size={isMobile ? "small" : "medium"}
                    disabled={!valid || createMut.isPending}
                    startIcon={createMut.isPending ? <SpinnerMini /> : undefined}
                  >
                    {createMut.isPending ? "등록 중…" : "등록"}
                  </Button>
                </Stack>
              </CardActions>
            </Card>
          </Grid>

          {/* 우: 미리보기 / 요약 */}
          <Grid size={{ xs: 12, md: 5 }} sx={{ display: { xs: "none", md: "block" } }}>
            <Card variant="outlined" sx={{ position: "sticky", top: 16, borderRadius: 3 }}>
              <CardHeader title="미리보기" />
              <CardContent>
                <Stack spacing={1.5}>
                  <Typography variant="h6" fontWeight={700}>
                    {name || "공간 이름"}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {location || "위치 정보"}
                  </Typography>

                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      size="small"
                      color={available ? "success" : "default"}
                      icon={available ? <CheckCircleIcon /> : <DoNotDisturbOnIcon />}
                      label={available ? "예약 가능" : "예약 불가"}
                      variant={available ? "filled" : "outlined"}
                    />
                    <Chip size="small" label={`정원 ${capacity || 0}명`} variant="outlined" />
                  </Stack>

                  <Divider sx={{ my: 1.5 }} />

                  {/* 썸네일 프리뷰 */}
                  <Box sx={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1 }}>
                    {previews.length > 0 ? (
                      previews.slice(0, 3).map((src, i) => (
                        // eslint-disable-next-line jsx-a11y/alt-text
                        <img key={i} src={src} style={{ width: "100%", height: 80, objectFit: "cover", borderRadius: 8 }} />
                      ))
                    ) : (
                      <Box
                        sx={{
                          gridColumn: "span 3",
                          height: 90,
                          borderRadius: 1,
                          border: "1px dashed",
                          borderColor: "divider",
                          display: "grid",
                          placeItems: "center",
                          color: "text.secondary",
                          fontSize: 12,
                        }}
                      >
                        이미지 미리보기
                      </Box>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
}

function SpinnerMini() {
  return (
    <Box
      sx={{
        width: 18,
        height: 18,
        borderRadius: "50%",
        border: "2px solid rgba(0,0,0,0.15)",
        borderTopColor: "rgba(0,0,0,0.5)",
        animation: "spin 0.8s linear infinite",
        "@keyframes spin": { to: { transform: "rotate(360deg)" } },
      }}
    />
  );
}
