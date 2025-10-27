import * as React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import { useKakaoMaps } from "@/hooks/useKakaoMaps";

export type LocationMapProps = {
  title?: string; // InfoWindow/접근성용
  lat: number; // 위도
  lng: number; // 경도
  zoom?: number; // 기본 3~5 권장 (작게: 4, 가깝게: 2~3)
  height?: number | string; // 지도 높이
  draggableMarker?: boolean; // 마커 드래그 허용
  onMarkerDragEnd?: (lat: number, lng: number) => void;
  className?: string;
};

export default function LocationMap({
  title = "이벤트 위치",
  lat,
  lng,
  zoom = 3,
  height = 360,
  draggableMarker = false,
  onMarkerDragEnd,
  className,
}: LocationMapProps) {
  const ready = useKakaoMaps();
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const instanceRef = React.useRef<any>(null);

  React.useEffect(() => {
    if (!ready || !mapRef.current) return;
    const { kakao } = window as any;

    const center = new kakao.maps.LatLng(lat, lng);
    const map = new kakao.maps.Map(mapRef.current, {
      center,
      level: zoom, // 숫자 클수록 더 멀리 (카카오: level)
    });
    instanceRef.current = map;

    const marker = new kakao.maps.Marker({
      position: center,
      draggable: draggableMarker,
      map,
    });

    if (title) {
      const info = new kakao.maps.InfoWindow({
        content: `<div style="padding:6px 10px; font-size:12px;">${title}</div>`,
      });
      info.open(map, marker);
    }

    if (draggableMarker && onMarkerDragEnd) {
      kakao.maps.event.addListener(marker, "dragend", () => {
        const pos = marker.getPosition();
        onMarkerDragEnd(pos.getLat(), pos.getLng());
      });
    }

    // 중심 좌표가 바뀌면 마커도 중앙으로
    map.setCenter(center);

    return () => {
      // 카카오는 명시적 destroy가 없어서 DOM만 제거하면 충분
    };
  }, [ready, lat, lng, zoom, title, draggableMarker, onMarkerDragEnd]);

  return (
    <Card className={`w-full shadow-lg rounded-2xl ${className ?? ""}`}>
      <CardContent className="p-0">
        <div ref={mapRef} style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }} aria-label={title} />
        {/* 접근성/설명 */}
        <Typography variant="body2" className="p-3 text-gray-600">
          {title} · {lat.toFixed(6)}, {lng.toFixed(6)}
        </Typography>
      </CardContent>
    </Card>
  );
}
