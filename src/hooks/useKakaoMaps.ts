import { useEffect, useState } from "react";

export function useKakaoMaps() {
  const [ready, setReady] = useState(false);
  const jsKey = import.meta.env.VITE_KAKAO_JS_KEY as string;

  useEffect(() => {
    if (!jsKey) {
      console.warn("VITE_KAKAO_JS_KEY is missing");
      return;
    }
    const existing = document.getElementById("kakao-sdk");
    if (existing) {
      setReady(!!(window as any).kakao?.maps);
      return;
    }
    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.async = true;
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${jsKey}&libraries=services&autoload=false`;
    script.onload = () => {
      (window as any).kakao?.maps?.load?.(() => setReady(true));
      // autoload=false 이므로 load로 초기화
      (window as any).kakao?.load?.(() => setReady(true));
    };
    document.head.appendChild(script);
  }, [jsKey]);

  return ready;
}
