import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Tabs from "@/components/ui/Tabs";
import { mobileText } from "@/components/ui/mobileTypography";
import { useChat } from "@/app/providers/ChatProvider";
import type { ApplicationStatus, RegistrationStatus } from "../api";
import {
  useCheckinEvent,
  useEvent,
  useEventApplications,
  useEventParticipants,
  useUpdateEventApplicationStatus,
  useUpdateEventParticipantStatus,
} from "../queries";

type ManageTab = "APPLICATIONS" | "PARTICIPANTS";

type SimpleApplication = {
  eventApplicationId: number;
  userName: string;
  userEmail?: string;
  status: ApplicationStatus;
};

type SimpleParticipant = {
  eventRegistrationId: number;
  userName: string;
  userEmail?: string;
  status: RegistrationStatus;
  checkInAt?: string | null;
};

const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

function appTone(s: ApplicationStatus) {
  if (s === "APPROVED") return "green" as const;
  if (s === "REJECTED") return "rose" as const;
  if (s === "WAITLIST") return "indigo" as const;
  return "blue" as const;
}

function regTone(s: RegistrationStatus) {
  if (s === "ATTENDED") return "green" as const;
  if (s === "NO_SHOW") return "rose" as const;
  if (s === "CANCELLED") return "rose" as const;
  return "blue" as const;
}

export default function EventManagePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();

  const [tab, setTab] = useState<ManageTab>("APPLICATIONS");

  const id = Number(eventId);
  if (Number.isNaN(id)) {
    return <div className="p-4 text-sm text-neutral-200">잘못된 이벤트 ID입니다.</div>;
  }

  const { data: eventData } = useEvent(id);
  const eventTitle = eventData?.title ?? `이벤트 #${id}`;

  return (
    <div className="mx-auto max-w-5xl p-4 text-neutral-100 sm:p-6">
      <Header
        eventId={id}
        eventTitle={eventTitle}
        onBack={() => navigate(-1)}
        onOpenChat={() => {
          openEventChat({ eventId: id, title: eventTitle });
          navigate(`/chat/events/${id}`);
        }}
        onOpenDetail={() => navigate(`/events/${id}`)}
      />

      <div className="mb-4">
        <Tabs<ManageTab>
          value={tab}
          onChange={setTab}
          size="sm"
          fullWidth
          tabs={[
            { value: "APPLICATIONS", label: "신청/심사" },
            { value: "PARTICIPANTS", label: "참여자" },
          ]}
        />
      </div>

      {tab === "APPLICATIONS" && <ApplicationsPanel eventId={id} />}
      {tab === "PARTICIPANTS" && <ParticipantsPanel eventId={id} />}
    </div>
  );
}

function Header(props: {
  eventId: number;
  eventTitle: string;
  onBack: () => void;
  onOpenChat: () => void;
  onOpenDetail: () => void;
}) {
  const { eventId, eventTitle, onBack, onOpenChat, onOpenDetail } = props;
  const { data: apps } = useEventApplications(eventId);
  const { data: participants } = useEventParticipants(eventId);

  const pendingApplications = (apps ?? []).filter((a) => a.status === "SUBMITTED" || a.status === "WAITLIST").length;
  const confirmed = (participants ?? []).filter((p) => p.status === "CONFIRMED" || p.status === "ATTENDED").length;

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div>
        <button className={`mb-1 hidden ${mobileText.meta} text-neutral-400 hover:underline sm:inline-block`} onClick={onBack}>
          ← MyPage로 돌아가기
        </button>
        <h1 className={`${mobileText.title} font-semibold`}>{eventTitle}</h1>
        <div className={`mt-1 flex flex-wrap items-center gap-2 ${mobileText.meta} text-neutral-400`}>
          <Badge tone="blue">신청 대기 {pendingApplications}명</Badge>
          <Badge tone="green">참여 확정 {confirmed}명</Badge>
        </div>
      </div>

      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={onOpenChat}>
          채팅 열기
        </Button>
        <Button size="sm" onClick={onOpenDetail}>
          이벤트 상세 보기
        </Button>
      </div>
    </div>
  );
}

function ApplicationsPanel({ eventId }: { eventId: number }) {
  const { data, isLoading } = useEventApplications(eventId);
  const updateStatus = useUpdateEventApplicationStatus(eventId);

  const [sampleRows, setSampleRows] = useState<SimpleApplication[]>([
    { eventApplicationId: 1, userName: "Anna", userEmail: "anna@example.com", status: "SUBMITTED" },
    { eventApplicationId: 2, userName: "Brian", userEmail: "brian@example.com", status: "WAITLIST" },
  ]);

  const rows = useMemo<SimpleApplication[]>(() => {
    if (USE_SAMPLE) return sampleRows;
    return (data ?? []).map((a) => ({
      eventApplicationId: a.eventApplicationId,
      userName: a.user?.name ?? a.user?.nickname ?? a.user?.email ?? `User #${a.userId}`,
      userEmail: a.user?.email ?? undefined,
      status: a.status,
    }));
  }, [data, sampleRows]);

  const onChangeStatus = async (applicationId: number, status: ApplicationStatus) => {
    if (USE_SAMPLE) {
      setSampleRows((prev) => prev.map((r) => (r.eventApplicationId === applicationId ? { ...r, status } : r)));
      return;
    }
    await updateStatus.mutateAsync({ eventApplicationId: applicationId, status });
  };

  return (
    <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <h2 className="mb-3 text-lg font-semibold text-neutral-100">신청 목록</h2>

      {isLoading && !USE_SAMPLE ? <div className={`${mobileText.body} text-neutral-400`}>불러오는 중...</div> : null}

      <div className="space-y-2">
        {rows.length === 0 ? <div className="rounded-xl border border-neutral-800 px-3 py-6 text-center text-sm text-neutral-400">신청 내역이 없습니다.</div> : null}

        {rows.map((a) => (
          <div key={a.eventApplicationId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-3 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-neutral-100">{a.userName}</span>
              <span className={`${mobileText.meta} text-neutral-400`}>#{a.eventApplicationId}</span>
            </div>

            <div className="flex items-center gap-2">
              <Badge tone={appTone(a.status)}>{a.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => onChangeStatus(a.eventApplicationId, "APPROVED")}>
                승인
              </Button>
              <Button variant="outline" size="sm" onClick={() => onChangeStatus(a.eventApplicationId, "WAITLIST")}>
                대기
              </Button>
              <Button variant="outline" size="sm" onClick={() => onChangeStatus(a.eventApplicationId, "REJECTED")}>
                거절
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

function ParticipantsPanel({ eventId }: { eventId: number }) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const { data, isLoading } = useEventParticipants(eventId);
  const updateStatus = useUpdateEventParticipantStatus(eventId);

  const [sampleRows, setSampleRows] = useState<SimpleParticipant[]>([
    { eventRegistrationId: 1, userName: "Anna", userEmail: "anna@example.com", status: "CONFIRMED" },
    { eventRegistrationId: 2, userName: "Brian", userEmail: "brian@example.com", status: "ATTENDED", checkInAt: new Date().toISOString() },
  ]);

  const rows = useMemo<SimpleParticipant[]>(() => {
    if (USE_SAMPLE) return sampleRows;
    return (data ?? []).map((p) => ({
      eventRegistrationId: p.eventRegistrationId,
      userName: p.user?.name ?? p.user?.nickname ?? p.user?.email ?? `User #${p.userId}`,
      userEmail: p.user?.email ?? undefined,
      status: p.status,
      checkInAt: p.checkInAt,
    }));
  }, [data, sampleRows]);

  const onChangeStatus = async (eventRegistrationId: number, status: RegistrationStatus) => {
    if (USE_SAMPLE) {
      setSampleRows((prev) =>
        prev.map((r) =>
          r.eventRegistrationId === eventRegistrationId
            ? { ...r, status, checkInAt: status === "ATTENDED" ? new Date().toISOString() : r.checkInAt }
            : r
        )
      );
      return;
    }
    await updateStatus.mutateAsync({ eventRegistrationId, status });
  };

  return (
    <Card className="rounded-2xl border border-neutral-800 bg-neutral-900 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-100">참여자 목록</h2>
        <Button size="sm" variant="outline" onClick={() => setScannerOpen(true)}>
          QR 스캔으로 출석 처리
        </Button>
      </div>

      {isLoading && !USE_SAMPLE ? <div className={`${mobileText.body} text-neutral-400`}>불러오는 중...</div> : null}

      <div className="space-y-2">
        {rows.length === 0 ? <div className="rounded-xl border border-neutral-800 px-3 py-6 text-center text-sm text-neutral-400">참여자가 없습니다.</div> : null}

        {rows.map((p) => (
          <div key={p.eventRegistrationId} className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-3 text-sm">
            <div className="flex flex-col">
              <span className="font-medium text-neutral-100">{p.userName}</span>
              <span className={`${mobileText.meta} text-neutral-400`}>#{p.eventRegistrationId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone={regTone(p.status)}>{p.status}</Badge>
              <Button variant="outline" size="sm" onClick={() => onChangeStatus(p.eventRegistrationId, "ATTENDED")}>
                출석 처리
              </Button>
              <Button variant="outline" size="sm" onClick={() => onChangeStatus(p.eventRegistrationId, "NO_SHOW")}>
                노쇼 처리
              </Button>
            </div>
          </div>
        ))}
      </div>

      {scannerOpen ? <CheckinScannerModal eventId={eventId} onClose={() => setScannerOpen(false)} /> : null}
    </Card>
  );
}

type CheckinScannerModalProps = {
  eventId: number;
  onClose: () => void;
};

function CheckinScannerModal({ eventId, onClose }: CheckinScannerModalProps) {
  const [token, setToken] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const checkin = useCheckinEvent(eventId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setMessage(null);
      if (USE_SAMPLE) {
        setMessage("샘플 모드: 출석이 정상 처리되었습니다.");
        setToken("");
        return;
      }

      const res = await checkin.mutateAsync(token);
      setMessage(res?.message ?? "출석이 정상 처리되었습니다.");
      setToken("");
    } catch (err: any) {
      setMessage(err?.response?.data?.message ?? err?.message ?? "체크인 처리 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl border border-neutral-700 bg-neutral-900 p-4 text-neutral-100">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">QR 체크인</h3>
          <button className="text-sm text-neutral-400 hover:text-neutral-100" onClick={onClose}>
            닫기
          </button>
        </div>

        <p className={`mb-3 ${mobileText.meta} text-neutral-400`}>QR 스캔 토큰을 입력하면 참석 처리됩니다.</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="h-11 w-full rounded-xl border border-neutral-700 bg-neutral-950 px-3 text-sm text-neutral-100 placeholder:text-neutral-500"
            placeholder="체크인 토큰을 입력하세요"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={checkin.isPending} className="w-full">
            {checkin.isPending ? "처리 중..." : "출석 처리"}
          </Button>
        </form>

        {message ? <div className={`mt-2 ${mobileText.meta} text-neutral-300`}>{message}</div> : null}
      </div>
    </div>
  );
}
