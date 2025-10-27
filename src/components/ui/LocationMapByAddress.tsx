import * as React from "react";
import { Card, CardContent, Typography, Alert } from "@mui/material";
import { useKakaoMaps } from "@/hooks/useKakaoMaps";

export type LocationMapByAddressProps = {
  title?: string;
  address: string; // 도로명/지번 주소
  zoom?: number;
  height?: number | string;
  className?: string;
};

export default function LocationMapByAddress({ title = "이벤트 위치", address, zoom = 3, height = 360, className }: LocationMapByAddressProps) {
  const ready = useKakaoMaps();
  const mapRef = React.useRef<HTMLDivElement | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!ready || !mapRef.current) return;
    const { kakao } = window as any;

    const map = new kakao.maps.Map(mapRef.current, {
      center: new kakao.maps.LatLng(37.5665, 126.978), // 서울 중심 임시
      level: zoom,
    });

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch(address, (result: any[], status: string) => {
      if (status !== kakao.maps.services.Status.OK || !result?.length) {
        setError("주소를 좌표로 변환하지 못했습니다.");
        return;
      }
      const { y, x } = result[0]; // y: lat, x: lng (문자열)
      const lat = parseFloat(y);
      const lng = parseFloat(x);
      const position = new kakao.maps.LatLng(lat, lng);

      map.setCenter(position);
      const marker = new kakao.maps.Marker({ position, map });

      if (title) {
        const info = new kakao.maps.InfoWindow({
          content: `<div style="padding:6px 10px; font-size:12px;">${title}<br/>${address}</div>`,
        });
        info.open(map, marker);
      }
    });

    return () => {};
  }, [ready, address, zoom, title]);

  return (
    <Card className={`w-full shadow-lg rounded-2xl ${className ?? ""}`}>
      <CardContent className="p-0">
        {error && (
          <Alert severity="error" className="m-3">
            {error}
          </Alert>
        )}
        <div ref={mapRef} style={{ width: "100%", height: typeof height === "number" ? `${height}px` : height }} aria-label={title} />
        <Typography variant="body2" className="p-3 text-gray-600">
          {title} · {address}
        </Typography>
      </CardContent>
    </Card>
  );
}
