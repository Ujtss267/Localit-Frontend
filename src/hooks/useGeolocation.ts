// src/hooks/useGeolocation.ts
//현재 위치 정보를 가져오는 커스텀 훅
import { useCallback, useEffect, useRef, useState } from "react";

type GeoStatus = "idle" | "loading" | "ready" | "error" | "denied";

export type GeoPosition = {
  lat: number;
  lng: number;
  accuracy?: number; // 미터 단위
  timestamp?: number; // epoch ms
};

export function useGeolocation(options: PositionOptions = { enableHighAccuracy: true, timeout: 10_000, maximumAge: 5_000 }) {
  const [status, setStatus] = useState<GeoStatus>("idle");
  const [pos, setPos] = useState<GeoPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  const onSuccess = useCallback((p: GeolocationPosition) => {
    setPos({
      lat: p.coords.latitude,
      lng: p.coords.longitude,
      accuracy: p.coords.accuracy,
      timestamp: p.timestamp,
    });
    setStatus("ready");
    setError(null);
  }, []);

  const onError = useCallback((e: GeolocationPositionError) => {
    // 1: PERMISSION_DENIED, 2: POSITION_UNAVAILABLE, 3: TIMEOUT
    setError(e.message);
    setStatus(e.code === 1 ? "denied" : "error");
  }, []);

  const getOnce = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("이 브라우저는 Geolocation을 지원하지 않습니다.");
      return;
    }
    setStatus("loading");
    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, [onSuccess, onError, options]);

  const startWatch = useCallback(() => {
    if (!("geolocation" in navigator)) {
      setStatus("error");
      setError("이 브라우저는 Geolocation을 지원하지 않습니다.");
      return;
    }
    setStatus("loading");
    watchIdRef.current = navigator.geolocation.watchPosition(onSuccess, onError, options);
  }, [onSuccess, onError, options]);

  const stopWatch = useCallback(() => {
    if (watchIdRef.current !== null && "geolocation" in navigator) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // 권한 상태 미리 조회 (지원 브라우저 한정)
  useEffect(() => {
    let mounted = true;
    if ("permissions" in navigator && "query" in (navigator as any).permissions) {
      (navigator as any).permissions
        .query({ name: "geolocation" as PermissionName })
        .then((res: PermissionStatus) => {
          if (!mounted) return;
          if (res.state === "granted") setStatus("ready");
          if (res.state === "denied") setStatus("denied");
          // "prompt"는 아직 미결정 → getOnce 호출 시 브라우저가 물어봄
          res.onchange = () => {
            if (!mounted) return;
            if (res.state === "granted") setStatus("ready");
            else if (res.state === "denied") setStatus("denied");
            else setStatus("idle");
          };
        })
        .catch(() => void 0);
    }
    return () => {
      mounted = false;
      stopWatch();
    };
  }, [stopWatch]);

  return { status, pos, error, getOnce, startWatch, stopWatch };
}
