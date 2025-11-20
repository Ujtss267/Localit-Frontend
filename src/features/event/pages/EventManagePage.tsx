// src/features/event/pages/EventManagePage.tsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useChat } from "@/app/providers/ChatProvider";
import Tabs from "@/components/ui/Tabs";

// 채팅 탭은 별도 페이지로 빼므로 CHAT 제거
type ManageTab = "APPLICATIONS" | "PARTICIPANTS";

export default function EventManagePage() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { openEventChat } = useChat();

  const [tab, setTab] = useState<ManageTab>("APPLICATIONS");

  const id = Number(eventId);
  if (Number.isNaN(id)) {
    return <div className="p-4">잘못된 이벤트 ID입니다.</div>;
  }

  // TODO: 실제로는 React Query로 이벤트 정보 가져오기
  const eventTitle = `이벤트 #${id}`;
  const summary = {
    capacity: 16,
    pendingApplications: 3,
    confirmed: 10,
  };

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      {/* 상단 헤더 */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <button className="mb-1 text-xs text-neutral-500 hover:underline" onClick={() => navigate(-1)}>
            ← MyPage로 돌아가기
          </button>
          <h1 className="text-xl font-semibold sm:text-2xl">{eventTitle}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
            <Badge tone="blue">정원 {summary.capacity}명</Badge>
            <Badge tone="indigo">승인 대기 {summary.pendingApplications}명</Badge>
            <Badge tone="green">확정 {summary.confirmed}명</Badge>
          </div>
        </div>

        {/* 오른쪽 액션 버튼들 */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              // 열린 채팅 목록에 등록 + 채팅 페이지로 이동
              openEventChat({ eventId: id, title: eventTitle });
              navigate(`/chat/events/${id}`);
            }}
          >
            채팅 열기
          </Button>
          <Button size="sm" onClick={() => navigate(`/events/${id}`)}>
            이벤트 상세 보기
          </Button>
        </div>
      </div>

      {/* 탭 영역 */}
      <div className="mb-4">
        <Tabs<ManageTab>
          value={tab}
          onChange={setTab}
          size="sm"
          fullWidth
          tabs={[
            {
              value: "APPLICATIONS",
              label: "신청/심사",
              // 뱃지로 대기 인원 수 노출
              //badge: <>대기 {summary.pendingApplications}</>,
            },
            {
              value: "PARTICIPANTS",
              label: "참여자",
              // 뱃지로 확정 인원 수 노출
              //badge: <>참여 {summary.confirmed}</>,
            },
          ]}
        />
      </div>

      {/* 내용 */}
      {tab === "APPLICATIONS" && <ApplicationsPanel eventId={id} />}
      {tab === "PARTICIPANTS" && <ParticipantsPanel eventId={id} />}
    </div>
  );
}

// ───────────────────────────
// 신청/심사 탭
// ───────────────────────────
function ApplicationsPanel({ eventId }: { eventId: number }) {
  // const { data, isLoading } = useEventApplications(eventId);
  const mock = [
    { applicationId: 1, userName: "Anna", status: "SUBMITTED" },
    { applicationId: 2, userName: "Brian", status: "WAITLIST" },
  ];

  return (
    <Card className="rounded-2xl border p-4">
      <h2 className="mb-3 text-lg font-semibold">신청 목록</h2>
      <div className="space-y-2">
        {mock.map((a) => (
          <div key={a.applicationId} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{a.userName}</span>
              <span className="text-xs text-neutral-500">#{a.applicationId}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge tone="blue">{a.status}</Badge>
              <Button variant="outline">승인</Button>
              <Button variant="outline">거절</Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

// ───────────────────────────
// 참여자 탭
// ───────────────────────────
function ParticipantsPanel({ eventId }: { eventId: number }) {
  const [scannerOpen, setScannerOpen] = useState(false);

  // const { data } = useEventParticipants(eventId);
  const mock = [
    { registrationId: 1, userName: "Anna", status: "CONFIRMED" },
    { registrationId: 2, userName: "Brian", status: "ATTENDED" },
  ];

  return (
    <Card className="rounded-2xl border p-4">
      {/* 헤더 + QR 스캐너 버튼 */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">참여자 목록</h2>
        <Button size="sm" variant="outline" onClick={() => setScannerOpen(true)}>
          QR 스캔으로 출석 처리
        </Button>
      </div>

      {/* 참여자 리스트 */}
      <div className="space-y-2">
        {mock.map((p) => (
          <div key={p.registrationId} className="flex items-center justify-between rounded-xl border px-3 py-2 text-sm">
            <div className="flex flex-col">
              <span className="font-medium">{p.userName}</span>
              <span className="text-xs text-neutral-500">{p.status}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline">출석 처리</Button>
              <Button variant="outline">노쇼 처리</Button>
            </div>
          </div>
        ))}
      </div>

      {/* QR 스캐너 모달 (임시 구현) */}
      {scannerOpen && <CheckinScannerModal eventId={eventId} onClose={() => setScannerOpen(false)} />}
    </Card>
  );
}

//onDecode={token => mutate({ token })} 같은 식으로 QR 라이브러리만 갈아끼우면 됨.
type CheckinScannerModalProps = {
  eventId: number;
  onClose: () => void;
};

function CheckinScannerModal({ eventId, onClose }: CheckinScannerModalProps) {
  const [token, setToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      setLoading(true);
      setMessage(null);

      // TODO: 실제 API 엔드포인트로 교체 (예시)
      // POST /api/events/:eventId/checkin
      const res = await fetch(`/api/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => null);
        throw new Error(err?.message ?? "체크인에 실패했습니다.");
      }

      setMessage("출석이 정상 처리되었습니다.");
      setToken("");
      // TODO: React Query 쓰면 여기서 참가자 목록 refetch
    } catch (err: any) {
      setMessage(err.message ?? "에러가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-base font-semibold">QR 체크인</h3>
          <button className="text-sm text-neutral-500 hover:text-neutral-800" onClick={onClose}>
            닫기
          </button>
        </div>

        {/* 실제로는 여기 자리에 QR 카메라 뷰가 올 예정 */}
        <p className="mb-3 text-xs text-neutral-500">
          실제 운영 시에는 카메라로 QR을 스캔해서 토큰을 자동으로 읽어올 수 있습니다. 지금은 테스트용으로 토큰을 직접 입력합니다.
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm"
            placeholder="체크인 토큰을 입력하세요"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Button type="submit" size="sm" disabled={loading} className="w-full">
            {loading ? "처리 중..." : "출석 처리"}
          </Button>
        </form>

        {message && <div className="mt-2 text-xs text-neutral-700">{message}</div>}
      </div>
    </div>
  );
}
