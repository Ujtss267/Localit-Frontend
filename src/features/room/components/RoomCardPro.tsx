import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import type { RoomDTO } from "../api";
import { Box, Card, CardActionArea, CardActions, CardContent, CardMedia, Chip, Stack, Typography, IconButton, Tooltip, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

function formatDateShort(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(d);
}

type Props = { room: RoomDTO; to?: string };

export default function RoomCardPro({ room, to = `/rooms/reserve?roomId=${room.id}` }: Props) {
  // coverUrl 또는 imageUrls[0] → 없으면 SVG 폴백
  const fallback =
    "data:image/svg+xml;utf8," +
    encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' width='800' height='420'>
        <defs><linearGradient id='g' x1='0' x2='1'>
          <stop stop-color='#ecfeff'/><stop offset='1' stop-color='#eff6ff'/>
        </linearGradient></defs>
        <rect fill='url(#g)' width='100%' height='100%'/>
        <text x='50%' y='52%' dominant-baseline='middle' text-anchor='middle'
          fill='#475569' font-family='Inter,system-ui' font-size='26'>Localit Room</text>
      </svg>`
    );
  const cover = (room as any).coverUrl || (room as any).imageUrls?.[0] || fallback;

  const availableChip = room.available ? (
    <Chip size="small" color="success" icon={<EventAvailableIcon />} label="예약 가능" sx={{ fontWeight: 700 }} />
  ) : (
    <Chip size="small" variant="outlined" color="default" icon={<EventBusyIcon />} label="예약 불가" sx={{ fontWeight: 700 }} />
  );

  return (
    <Card
      variant="outlined"
      // ⬇️ 균일 높이 핵심: h-full + flex col
      className="h-full flex flex-col rounded-2xl shadow-sm hover:shadow-md transition-shadow"
      sx={{ overflow: "hidden" }}
    >
      {/* 본문 전체 클릭 가능 영역을 flex-1로 채움 */}
      <CardActionArea component={RouterLink} to={to} className="flex-1 flex flex-col items-stretch">
        {/* 이미지 영역: 고정 높이로 통일 */}
        <Box sx={{ position: "relative" }}>
          <CardMedia
            component="img"
            image={cover}
            alt={room.name}
            // ⬇️ 카드마다 동일한 이미지 높이로 통일
            sx={{ height: { xs: 164, sm: 176 }, objectFit: "cover" }}
            loading="lazy"
          />
          {/* 우상단 액션 */}
          <Box sx={{ position: "absolute", top: 8, right: 8 }}>
            <Tooltip title="즐겨찾기">
              <IconButton size="small" className="bg-white/90 hover:bg-white dark:bg-neutral-900/70 dark:hover:bg-neutral-900">
                <FavoriteBorderIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
          {/* 좌하단 캡슐: 정원 */}
          <Box sx={{ position: "absolute", left: 8, bottom: 8 }}>
            <Chip
              size="small"
              variant="outlined"
              label={
                <span className="inline-flex items-center gap-1">
                  <PeopleAltOutlinedIcon fontSize="small" />
                  정원 {room.capacity}명
                </span>
              }
              className="backdrop-blur"
              sx={{ bgcolor: "white", color: "text.primary", borderColor: "divider" }}
            />
          </Box>
        </Box>

        {/* 본문 */}
        <CardContent className="flex-1 grid gap-1">
          <Typography variant="subtitle1" fontWeight={700} className="line-clamp-1">
            {room.name}
          </Typography>

          <Stack direction="row" spacing={1} alignItems="center">
            <PlaceOutlinedIcon fontSize="small" />
            <Typography variant="body2" color="text.secondary" className="truncate">
              {room.location}
            </Typography>
          </Stack>

          <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
            {availableChip}
            <Chip size="small" variant="outlined" label={`생성 ${formatDateShort(room.createdAt)}`} />
          </Stack>

          <Typography variant="caption" sx={{ mt: 1 }} color="text.disabled">
            업데이트 {formatDateShort(room.updatedAt)}
          </Typography>
        </CardContent>
      </CardActionArea>

      {/* 하단 버튼: 항상 카드 맨 아래 고정 */}
      <CardActions className="p-3 pt-0">
        <Stack direction="row" spacing={1} sx={{ width: "100%" }}>
          <Button
            variant="outlined"
            color="inherit"
            fullWidth
            component={RouterLink}
            to={`/rooms/reserve?roomId=${room.id}`}
            disabled={!room.available}
          >
            예약
          </Button>
          <Button variant="contained" fullWidth component={RouterLink} to={`/rooms/reserve?roomId=${room.id}`}>
            상세/예약
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
