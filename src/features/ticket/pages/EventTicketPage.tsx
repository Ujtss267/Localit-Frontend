// src/features/ticket/pages/EventTicketPage.tsx
import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge, { BadgeProps } from "@/components/ui/Badge";
import { useAuth } from "@/app/providers/AuthProvider";
import QRCode from "react-qr-code";
import { useEvent } from "@/features/event/queries";
import type { ApplicationStatus, RegistrationStatus } from "@/features/event/api";
import { mobileText } from "@/components/ui/mobileTypography";

type TicketStatus = {
  applicationStatus: ApplicationStatus | null;
  registrationStatus: RegistrationStatus | null;
};

interface EventTicketDto {
  eventId: number;
  title: string;
  startTime: string;
  endTime: string;
  location?: string | null;
  status: TicketStatus;
  qrValue?: string;
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
  if (s.registrationStatus === "ATTENDED") return "참석 완료";
  if (s.registrationStatus === "CONFIRMED") return "참석 확정";
  if (s.registrationStatus === "CANCELLED") return "취소됨";
  if (s.registrationStatus === "NO_SHOW") return "노쇼";
  if (s.applicationStatus === "WAITLIST") return "대기자";
  if (s.applicationStatus === "SUBMITTED") return "신청 대기";
  if (s.applicationStatus === "REJECTED") return "승인 거절";
  if (s.applicationStatus === "APPROVED") return "승인됨";
  return "상태 없음";
}

function statusTone(s: TicketStatus): BadgeProps["tone"] {
  if (s.registrationStatus === "ATTENDED") return "green";
  if (s.registrationStatus === "CONFIRMED") return "green";
  if (s.registrationStatus === "CANCELLED") return "rose";
  if (s.registrationStatus === "NO_SHOW") return "rose";
  if (s.applicationStatus === "WAITLIST") return "indigo";
  if (s.applicationStatus === "SUBMITTED") return "indigo";
  if (s.applicationStatus === "REJECTED") return "rose";
  return "neutral";
}

export default function EventTicketPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const id = Number(eventId);
  const safeId = Number.isNaN(id) ? 0 : id;
  const { data: eventData, isFetching } = useEvent(safeId);
  if (Number.isNaN(id)) {
    return <div className="p-4 text-sm text-neutral-200">잘못된 이벤트 ID입니다.</div>;
  }

  const data: EventTicketDto = useMemo(() => {
    if (eventData) {
      const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://localit.app";
      const status = {
        applicationStatus: eventData.myRegistration?.applicationStatus ?? null,
        registrationStatus: eventData.myRegistration?.registrationStatus ?? null,
      };
      const canShowQr = status.registrationStatus === "CONFIRMED" || status.registrationStatus === "ATTENDED";
      return {
        eventId: eventData.id,
        title: eventData.title,
        startTime: eventData.startTime,
        endTime: eventData.endTime,
        location: eventData.location,
        status,
        qrValue: canShowQr ? `${baseUrl}/checkin/events/${eventData.id}?u=${user?.id ?? "guest"}` : undefined,
      };
    }

    return {
      eventId: id,
      title: `이벤트 #${id}`,
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // +2시간
      location: "서울 어딘가의 카페",
      status: {
        applicationStatus: "APPROVED",
        registrationStatus: "CONFIRMED",
      },
      qrValue: `https://localit.app/checkin/events/${id}?u=${user?.id ?? "guest"}`,
    };
  }, [eventData, id, user?.id]);

  const rangeText = formatRange(data.startTime, data.endTime);
  const showQr = Boolean(data.qrValue && (data.status.registrationStatus === "CONFIRMED" || data.status.registrationStatus === "ATTENDED"));

  return (
    <div className="mx-auto flex min-h-[100dvh] max-w-md flex-col bg-neutral-950 px-4 py-6 text-neutral-100">
      {/* 상단 헤더 */}
      <div className="mb-4 flex items-center justify-between">
        <button className={`hidden ${mobileText.meta} text-neutral-400 hover:text-neutral-200 sm:inline-block`} type="button" onClick={() => navigate(-1)}>
          ← 돌아가기
        </button>
        <span className={`${mobileText.meta} font-medium text-neutral-400`}>내 참가권</span>
      </div>

      {/* 티켓 카드 */}
      <Card className="flex flex-1 flex-col rounded-3xl border bg-neutral-900 p-4 shadow-sm sm:p-5">
        {/* 이벤트 기본 정보 */}
        <div className="mb-4">
          <div className="mb-1 flex items-center justify-between">
            <h1 className="text-lg font-semibold">{data.title}</h1>
            <Badge tone={statusTone(data.status)}>{statusLabel(data.status)}</Badge>
          </div>
          <div className={`${mobileText.meta} text-neutral-400`}>{rangeText}</div>
          {data.location && <div className={`mt-1 ${mobileText.meta} text-neutral-400`}>📍 {data.location}</div>}
        </div>

        {/* QR 영역 */}
        <div className="mb-4 flex flex-1 flex-col items-center justify-center">
            <div className="rounded-3xl bg-neutral-800 p-4">
              <div className="flex min-h-[252px] items-center justify-center rounded-2xl bg-neutral-900 p-4">
                {showQr ? (
                  <QRCode value={data.qrValue!} size={220} style={{ height: "auto", maxWidth: "100%", width: "100%" }} />
                ) : (
                  <div className={`text-center ${mobileText.meta} text-neutral-400`}>참석 확정 후 QR이 활성화됩니다.</div>
                )}
              </div>
            </div>
          <div className={`mt-3 text-center ${mobileText.meta} text-neutral-400`}>
            입장 시 이 화면을 호스트에게 보여주세요.
            <br />
            화면 밝기를 밝게 해두면 인식이 더 잘 됩니다.
          </div>
        </div>

        {/* 하단 정보 */}
        <div className={`mt-auto space-y-2 border-t border-neutral-800 pt-3 ${mobileText.meta} text-neutral-400`}>
          {user && (
            <div className="flex items-center justify-between">
              <span className="font-medium text-neutral-300">참석자</span>
              <span>{user.id ?? user.email ?? "나"}</span>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="font-medium text-neutral-300">이벤트 ID</span>
            <span>#{data.eventId}</span>
          </div>
          <div className="mt-2 flex justify-end">
            <Button size="sm" variant="outline" onClick={() => navigate(`/events/${data.eventId}`)}>
              이벤트 상세 보기
            </Button>
          </div>
          {isFetching ? <div className={`${mobileText.meta} text-neutral-400`}>티켓 정보를 동기화 중입니다...</div> : null}
        </div>
      </Card>
    </div>
  );
}
