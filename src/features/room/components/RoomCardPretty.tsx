// src/features/room/components/RoomCardPro.tsx
import * as React from "react";
import { Link as RouterLink } from "react-router-dom";
import type { RoomDTO } from "../api";

// MUI (푸터 버튼/칩/아이콘 유지)
import { CardActions, CardContent, Chip, Stack, Typography, IconButton, Tooltip, Button } from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PlaceOutlinedIcon from "@mui/icons-material/PlaceOutlined";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import PeopleAltOutlinedIcon from "@mui/icons-material/PeopleAltOutlined";

// 캐러셀 (EventCardPretty와 동일 경로/방식)
import ImageCarousel from "@/components/ui/ImageCarousel";
import Card from "@/components/ui/Card";
function formatDateShort(iso: string) {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium" }).format(d);
}

type Props = {
  room: RoomDTO;
  className?: string;
  /** 상세/예약 이동 경로 (푸터 버튼만 이동) */
  to?: string;
};

export default function RoomCardPretty({ room, className = "", to = `/rooms/reserve?roomId=${room.id}` }: Props) {
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

  const images: string[] = (() => {
    const urls = (room as any).imageUrls as string[] | undefined;
    const cover = (room as any).coverUrl as string | undefined;
    const list = urls && urls.length > 0 ? urls : cover ? [cover] : [fallback];
    return Array.from(new Set(list.filter(Boolean)));
  })();

  const availableChip = room.available ? (
    <Chip size="small" color="success" icon={<EventAvailableIcon />} label="예약 가능" sx={{ fontWeight: 700 }} />
  ) : (
    <Chip size="small" variant="outlined" color="default" icon={<EventBusyIcon />} label="예약 불가" sx={{ fontWeight: 700 }} />
  );

  return (
    <Card className={`group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-md transition h-full flex flex-col ${className}`}>
      {/* ✅ 이미지/캐러셀 영역 (클릭 이동 제거) */}
      <div className="relative">
        {images.length > 1 ? (
          <ImageCarousel
            images={images}
            autoplayMs={0} // 자동 넘김 OFF
            fit="cover"
            alt={room.name}
            options={{ loop: true }}
            className="" // 필요시 높이 조절: h-40 sm:h-48 ...
          />
        ) : (
          <img src={images[0]} alt={room.name} loading="lazy" className="w-full h-40 sm:h-48 md:h-56 lg:h-60 object-cover" />
        )}

        {/* ⭐ 즐겨찾기 (absolute) */}
        <div className="absolute top-2 right-2">
          <Tooltip title="즐겨찾기">
            <IconButton size="small" className="!bg-neutral-900/85 hover:!bg-neutral-800 shadow-sm">
              <FavoriteBorderIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </div>

        {/* 👥 정원 x명 (absolute) */}
        <div className="absolute left-2 bottom-2">
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
            sx={{ bgcolor: "rgba(23,23,23,0.92)", color: "rgb(245,245,245)", borderColor: "rgba(82,82,91,0.9)" }}
          />
        </div>
      </div>

      {/* 본문 (텍스트) */}
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

      {/* ✅ 푸터만 이동: 버튼으로만 페이지 이동 */}
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
          <Button variant="contained" fullWidth component={RouterLink} to={to}>
            상세/예약
          </Button>
        </Stack>
      </CardActions>
    </Card>
  );
}
