// src/features/ticket/pages/EventTicketPage.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge, { BadgeProps } from "@/components/ui/Badge";
import { useAuth } from "@/app/providers/AuthProvider";
import QRCode from "react-qr-code";

// 티켓 상태 (백엔드 DTO에 맞춰 나중에 교체해도 됨)
type TicketStatus = "CONFIRMED" | "WAITLIST" | "CANCELED";

interface EventTicketDto {
  eventId: number;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  status: TicketStatus;
  qrValue: string; // QR에 들어갈 실제 값 (예: 체크인용 URL 또는 토큰)
}

function formatRange(fromIso: string, toIso: string) {
  const tz = "Asia/Seoul";
  const from = new Date(fromIso);
  const to = new Date(toIso);

  const sameDay = from.toDateString() === to.toDateString();
  const d1 = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: tz }).format(from);
  const d2 = new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeZone: tz }).format(to);
  const t1 = new Intl.DateTimeFormat("ko-KR", { timeStyle: "short", timeZone: tz }).format(from);
  const t2 = new Intl.DateTimeFormat("ko-KR", { timeStyle: "short", timeZone: tz }).format(to);

  return sameDay ? `${d1} • ${t1} – ${t2}` : `${d1} ${t1} → ${d2} ${t2}`;
}

function statusLabel(s: TicketStatus) {
  switch (s) {
    case "CONFIRMED":
      return "참석 확정";
    case "WAITLIST":
      return "대기자";
    case "CANCELED":
      return "취소됨";
    default:
      return s;
  }
}

function statusTone(s: TicketStatus): BadgeProps["tone"] {
  switch (s) {
    case "CONFIRMED":
      return "green";
    case "WAITLIST":
      return "indigo";
    case "CANCELED":
      return "rose";
    default:
      return "neutral";
  }
}

export default function EventTicketPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const id = Number(eventId);
  if (Number.isNaN(id)) {
    return <div className="p-4">잘못된 이벤트 ID입니다.</div>;
  }

  // TODO: 실제로는 React Query 등으로 서버에서 티켓 정보를 가져오기
  // 예: useEventTicket(eventId)
  const data: EventTicketDto = useMemo(() => {
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://localit.app";
    const dummyToken = "dummy-checkin-token"; // 나중에 서버에서 내려주는 토큰으로 교체
    return {
      eventId: id,
      title: `이벤트 #${id}`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2시간
      location: "서울 어딘가의 카페",
      status: "CONFIRMED",
      // 실제 운영 시: `${baseUrl}/api/events/${id}/checkin?token=${token}`
      qrValue: `${baseUrl}/checkin/events/${id}?token=${dummyToken}`,
    };
  }, [id]);

  const rangeText = formatRange(data.startTime, data.endTime);

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-neutral-50 px-4 py-6">
      {/* 상단 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <button className="text-xs text-neutral-500 hover:text-neutral-800" type="button" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
        <span className="text-xs font-medium text-neutral-500">내 참가권</span>
      </div>

      {/* 티켓 카드 */}
      <Card className="flex flex-1 flex-col rounded-3xl border bg-white p-4 shadow-sm sm:p-5">
        {/* 이벤트 기본 정보 */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{data.title}</h1>
            <Badge tone={statusTone(data.status)}>{statusLabel(data.status)}</Badge>
          </div>
          <div className="text-xs text-neutral-500">{rangeText}</div>
          {data.location && <div className="mt-1 text-xs text-neutral-600">📍 {data.location}</div>}
        </div>

        {/* QR 영역 */}
        <div className="mb-4 flex flex-1 flex-col items-center justify-center">
          <div className="rounded-3xl bg-neutral-100 p-4">
            <div className="flex items-center justify-center rounded-2xl bg-white p-4">
              <QRCode value={data.qrValue} size={220} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
            </div>
          </div>
          <div className="mt-3 text-center text-xs text-neutral-500">
            입장 시 이 화면을 호스트에게 보여주세요.
            <br />
            화면 밝기를 밝게 해두면 인식이 더 잘 됩니다.
          </div>
        </div>

        {/* 하단 정보 */}
        <div className="mt-auto space-y-2 border-t pt-3 text-xs text-neutral-500">
          {user && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-700">참석자</span>
              <span>{user.id ?? user.email ?? "나"}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-700">이벤트 ID</span>
            <span>#{data.eventId}</span>
          </div>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => navigate(`/events/${data.eventId}`)}>
              이벤트 상세 보기
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
