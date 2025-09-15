// src/features/room/pages/RoomListPage.tsx
import { useMemo, useState } from "react";
import { Link as RouterLink, useSearchParams } from "react-router-dom";
import { useRooms } from "../queries";
import type { RoomDTO } from "../api";

// MUI
import {
  Container,
  Stack,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Grid,
  Card,
  CardContent,
  CardActions,
  Chip,
  Box,
  Alert,
  Skeleton,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import AddHomeWorkIcon from "@mui/icons-material/AddHomeWork";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import RefreshIcon from "@mui/icons-material/Refresh";
import SortIcon from "@mui/icons-material/Sort";

type SortKey = "created" | "capacity" | "name";

export default function RoomListPage() {
  const { data, isLoading, isError, error, refetch, isFetching } = useRooms();

  // URL 쿼리와 동기화 (선택)
  const [sp, setSp] = useSearchParams();
  const [q, setQ] = useState(sp.get("q") ?? "");
  const [onlyAvailable, setOnlyAvailable] = useState(sp.get("avail") === "1");
  const [sortKey, setSortKey] = useState<SortKey>((sp.get("sort") as SortKey) || "created");

  function syncSearchParams(next: { q?: string; avail?: string; sort?: SortKey }) {
    const params = new URLSearchParams(sp);
    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
    if (next.avail !== undefined) {
      if (next.avail) params.set("avail", next.avail);
      else params.delete("avail");
    }
    if (next.sort !== undefined) {
      if (next.sort) params.set("sort", next.sort);
      else params.delete("sort");
    }
    setSp(params, { replace: true });
  }

  const filtered = useMemo(() => {
    const rooms: RoomDTO[] = data ?? [];
    let out = rooms;

    const keyword = q.trim().toLowerCase();
    if (keyword) {
      out = out.filter((r) => r.name.toLowerCase().includes(keyword) || r.location.toLowerCase().includes(keyword));
    }

    if (onlyAvailable) {
      out = out.filter((r) => r.available);
    }

    switch (sortKey) {
      case "capacity":
        out = [...out].sort((a, b) => b.capacity - a.capacity);
        break;
      case "name":
        out = [...out].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "created":
      default:
        out = [...out].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
    }

    return out;
  }, [data, q, onlyAvailable, sortKey]);

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* 헤더 */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "flex-start", sm: "center" }}
        justifyContent="space-between"
        spacing={1}
        sx={{ mb: 2 }}
      >
        <Box>
          <Typography variant="h5" fontWeight={700}>
            공간 목록
          </Typography>
          <Typography variant="body2" color="text.secondary">
            모임/이벤트/멘토링을 위한 공간을 찾아보세요.
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Tooltip title="새 공간 등록">
            <Button variant="contained" startIcon={<AddHomeWorkIcon />} component={RouterLink} to="/rooms/new">
              공간 등록
            </Button>
          </Tooltip>
          <Tooltip title="새로고침">
            <span>
              <IconButton onClick={() => refetch()} disabled={isFetching}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {/* 컨트롤 바: 검색 / 필터 / 정렬 */}
      <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
        <TextField
          placeholder="이름 또는 위치로 검색"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
          }}
          onBlur={() => syncSearchParams({ q })}
          fullWidth
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
            endAdornment: q ? (
              <InputAdornment position="end">
                <IconButton
                  size="small"
                  onClick={() => {
                    setQ("");
                    syncSearchParams({ q: "" });
                  }}
                >
                  <ClearIcon fontSize="small" />
                </IconButton>
              </InputAdornment>
            ) : null,
          }}
        />

        <ToggleButton
          value="available"
          selected={onlyAvailable}
          onChange={() => {
            const next = !onlyAvailable;
            setOnlyAvailable(next);
            syncSearchParams({ avail: next ? "1" : "" });
          }}
          sx={{ px: 2, whiteSpace: "nowrap" }}
        >
          {onlyAvailable ? (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventAvailableIcon fontSize="small" />
              <span>예약 가능만</span>
            </Stack>
          ) : (
            <Stack direction="row" spacing={0.5} alignItems="center">
              <EventBusyIcon fontSize="small" />
              <span>모두 보기</span>
            </Stack>
          )}
        </ToggleButton>

        <ToggleButtonGroup
          exclusive
          value={sortKey}
          onChange={(_e, val) => {
            if (!val) return;
            setSortKey(val);
            syncSearchParams({ sort: val });
          }}
          size="small"
          sx={{ ml: { md: "auto" }, whiteSpace: "nowrap" }}
        >
          <ToggleButton value="created">
            <SortIcon fontSize="small" style={{ marginRight: 6 }} />
            최신순
          </ToggleButton>
          <ToggleButton value="capacity">정원순</ToggleButton>
          <ToggleButton value="name">이름순</ToggleButton>
        </ToggleButtonGroup>
      </Stack>

      {/* 상태 */}
      {isError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          공간 목록을 불러오지 못했습니다. {(error as any)?.message ?? ""}
        </Alert>
      )}

      {/* 목록 */}
      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 9 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} key={i}>
              <Card variant="outlined">
                <CardContent>
                  <Skeleton variant="text" width="60%" />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="rectangular" height={80} sx={{ mt: 1 }} />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={120} height={36} />
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : filtered.length === 0 ? (
        <EmptyState />
      ) : (
        <Grid container spacing={2}>
          {filtered.map((r) => (
            <Grid item xs={12} sm={6} md={4} key={r.id}>
              <RoomCard item={r} />
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
}

/* ----------------- 하위 컴포넌트 ----------------- */

function RoomCard({ item }: { item: RoomDTO }) {
  const chip = item.available ? <Chip label="예약 가능" color="success" size="small" /> : <Chip label="예약 불가" variant="outlined" size="small" />;

  return (
    <Card variant="outlined" sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack spacing={0.5}>
          <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
            {item.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {item.location}
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            {chip}
            <Chip size="small" label={`정원 ${item.capacity}명`} variant="outlined" />
          </Stack>
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            component={RouterLink}
            to={`/rooms/reserve?roomId=${item.id}`}
            disabled={!item.available}
          >
            예약
          </Button>
          <Button variant="contained" fullWidth component={RouterLink} to={`/rooms/reserve?roomId=${item.id}`}>
            상세/예약
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}

function EmptyState() {
  return (
    <Box
      sx={{
        border: "1px dashed",
        borderColor: "divider",
        borderRadius: 2,
        py: 8,
        textAlign: "center",
        color: "text.secondary",
      }}
    >
      <Typography variant="subtitle1" fontWeight={700}>
        등록된 공간이 없습니다
      </Typography>
      <Typography variant="body2" sx={{ mt: 0.5, mb: 2 }}>
        첫 공간을 등록해 보세요.
      </Typography>
      <Button variant="contained" component={RouterLink} to="/rooms/new" startIcon={<AddHomeWorkIcon />}>
        공간 등록
      </Button>
    </Box>
  );
}
