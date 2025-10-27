import * as React from "react";
import { Card, CardContent, CardActions, Button, Stack, Typography, Chip, Divider, Alert, Tooltip } from "@mui/material";
import RoomIcon from "@mui/icons-material/Room";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import PauseCircleIcon from "@mui/icons-material/PauseCircle";
import PlayCircleIcon from "@mui/icons-material/PlayCircle";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { useGeolocation, type GeoPosition } from "@/hooks/useGeolocation";

export type LocationCardProps = {
  /** 좌측 상단 타이틀 */
  title?: string;
  /** 구글 지도 링크 버튼 표시 여부 (기본: true) */
  showMapLink?: boolean;
  /** 복사 버튼 표시 여부 (기본: true) */
  showCopy?: boolean;
  /** 컨트롤 버튼 표시 여부: getOnce / watch / stop (기본: 모두 true) */
  controls?: { getOnce?: boolean; watch?: boolean; stop?: boolean };
  /** 좌표가 변할 때 콜백 */
  onChange?: (pos: GeoPosition | null) => void;
  /** tailwind/MUI sx 등 외부에서 className 전달 */
  className?: string;
};

export default function LocationCard({
  title = "현재 위치",
  showMapLink = true,
  showCopy = true,
  controls = { getOnce: true, watch: true, stop: true },
  onChange,
  className,
}: LocationCardProps) {
  const { status, pos, error, getOnce, startWatch, stopWatch } = useGeolocation();

  React.useEffect(() => {
    onChange?.(pos ?? null);
  }, [pos, onChange]);

  const coords = pos ? `${pos.lat.toFixed(6)}, ${pos.lng.toFixed(6)}` : "-";
  const mapsUrl = pos ? `https://maps.google.com/?q=${pos.lat},${pos.lng}` : undefined;

  const copy = async () => {
    if (!pos) return;
    await navigator.clipboard.writeText(coords);
  };

  const statusColor = status === "ready" ? "success" : status === "loading" ? "warning" : status === "denied" ? "error" : "default";

  return (
    <Card className={`w-full max-w-xl mx-auto shadow-lg rounded-2xl ${className ?? ""}`}>
      <CardContent className="p-6">
        <Stack spacing={1.5}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <RoomIcon />
            <Typography variant="h6" className="font-semibold">
              {title}
            </Typography>
            <Chip size="small" label={status.toUpperCase()} color={statusColor as any} variant="outlined" />
          </Stack>

          <Typography variant="body2" color="text.secondary">
            보안 환경(HTTPS 또는 localhost)에서 동작합니다. 브라우저 권한을 허용하세요.
          </Typography>

          <Divider className="my-2" />

          {error && <Alert severity="error">{error}</Alert>}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} className="items-start sm:items-center">
            <Chip icon={<MyLocationIcon />} label={`좌표: ${coords}`} />
            <Chip label={`정확도: ${pos?.accuracy ? `${Math.round(pos.accuracy)}m` : "-"}`} />
            <Chip label={`시각: ${pos?.timestamp ? new Date(pos.timestamp).toLocaleString() : "-"}`} />
          </Stack>
        </Stack>
      </CardContent>

      <CardActions className="p-4 pt-0 flex flex-wrap gap-2">
        {controls.getOnce !== false && (
          <Button variant="contained" onClick={getOnce} startIcon={<MyLocationIcon />}>
            한 번 가져오기
          </Button>
        )}
        {controls.watch !== false && (
          <Button variant="outlined" onClick={startWatch} startIcon={<PlayCircleIcon />}>
            계속 추적
          </Button>
        )}
        {controls.stop !== false && (
          <Button variant="outlined" onClick={stopWatch} startIcon={<PauseCircleIcon />}>
            추적 중지
          </Button>
        )}

        <div className="flex-1" />

        {showCopy && (
          <Tooltip title="좌표 복사">
            <span>
              <Button disabled={!pos} onClick={copy} startIcon={<ContentCopyIcon />}>
                복사
              </Button>
            </span>
          </Tooltip>
        )}
        {showMapLink && (
          <Tooltip title="지도에서 열기">
            <span>
              <Button disabled={!mapsUrl} href={mapsUrl} target="_blank" rel="noopener noreferrer" startIcon={<OpenInNewIcon />}>
                지도
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
}
