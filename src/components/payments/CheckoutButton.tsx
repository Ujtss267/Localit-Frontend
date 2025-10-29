// components/payments/CheckoutButton.tsx
import * as React from "react";
import { Button } from "@mui/material";

type Props = {
  eventId: number;
  quantity?: number;
};

export default function CheckoutButton({ eventId, quantity = 1 }: Props) {
  const [loading, setLoading] = React.useState(false);

  const onClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId, quantity }),
      });
      const data = await res.json();
      // A안(Stripe 예시): data.checkoutUrl 로 리디렉트
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }
      // B안(국내 PG 예시): data.paymentKey 등으로 결제창 오픈 스크립트 호출
      if (data.toss?.clientKey && data.toss?.paymentKey) {
        // 예시: tosspayments-js 결제창 호출 (실제 SDK 코드 삽입)
        // await toss.requestPayment({...});
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="contained" onClick={onClick} disabled={loading} className="rounded-2xl px-6 py-3">
      {loading ? "처리중..." : "결제하기"}
    </Button>
  );
}
