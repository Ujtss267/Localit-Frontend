import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Tabs from "@/components/ui/Tabs";
import Empty from "@/components/ui/Empty";
import { mobileText } from "@/components/ui/mobileTypography";
import { sampleData } from "@/mocks/sampleData";
import { getSeriesById, type EventDTO } from "../api";
import { useEvents } from "../queries";
import { useQuery } from "@tanstack/react-query";

type DetailTab = "EPISODES" | "ATTENDANCE";
const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

function formatDateTime(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleString("ko-KR");
}

export default function SeriesDetailPage() {
  const { seriesId } = useParams<{ seriesId: string }>();
  const [sp] = useSearchParams();
  const fromEventCreate = sp.get("from") === "event-create";
  const [tab, setTab] = useState<DetailTab>("EPISODES");
  const id = Number(seriesId);

  const { data: events = [], isLoading: eventsLoading } = useEvents({ seriesId: Number.isFinite(id) ? id : undefined });
  const seriesQuery = useQuery({
    queryKey: ["series", id],
    enabled: Number.isFinite(id),
    queryFn: async () => {
      if (USE_SAMPLE) return sampleData.series.find((s) => s.seriesId === id) ?? null;
      return getSeriesById(id);
    },
  });

  const episodes = useMemo(() => {
    return [...events].sort((a, b) => {
      const ea = a.episodeNo ?? 0;
      const eb = b.episodeNo ?? 0;
      if (ea !== eb) return ea - eb;
      return new Date(a.startTime).getTime() - new Date(b.startTime).getTime();
    });
  }, [events]);

  const attendanceRows = useMemo(() => {
    if (!USE_SAMPLE) return episodes.map((e) => ({ event: e, confirmed: null as number | null, attended: null as number | null, noShow: null as number | null }));
    return episodes.map((e) => {
      const regs = sampleData.registrations.filter((r) => r.eventId === e.id);
      const confirmed = regs.filter((r) => r.registrationStatus === "CONFIRMED").length;
      const attended = regs.filter((r) => r.registrationStatus === "ATTENDED").length;
      const noShow = regs.filter((r) => r.registrationStatus === "NO_SHOW").length;
      return { event: e, confirmed, attended, noShow };
    });
  }, [episodes]);

  if (!Number.isFinite(id)) {
    return <div className="p-4 text-sm text-neutral-200">잘못된 시리즈 ID입니다.</div>;
  }

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-base sm:text-xl font-semibold text-white mt-1">{seriesQuery.data?.title ?? "시리즈 상세"}</h1>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>{seriesQuery.data?.description || "시리즈 설명이 없습니다."}</p>
        </div>
        <Button
          component={Link as any}
          to={`/events/new?seriesId=${id}&seriesTitle=${encodeURIComponent(seriesQuery.data?.title ?? `시리즈 #${id}`)}`}
          size="sm"
          replace={fromEventCreate}
        >
          새 회차 추가
        </Button>
      </div>

      <Tabs<DetailTab>
        value={tab}
        onChange={setTab}
        size="sm"
        fullWidth
        tabs={[
          { value: "EPISODES", label: "회차 목록" },
          { value: "ATTENDANCE", label: "출석/참여" },
        ]}
      />

      {eventsLoading ? (
        <Card className="p-4 text-sm text-neutral-300">불러오는 중...</Card>
      ) : episodes.length === 0 ? (
        <Empty title="등록된 회차가 없습니다" desc="이 시리즈에 회차 이벤트를 추가해 보세요." />
      ) : tab === "EPISODES" ? (
        <div className="space-y-2">
          {episodes.map((e) => (
            <EpisodeRow key={e.id} event={e} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {attendanceRows.map((row) => (
            <AttendanceRow key={row.event.id} row={row} />
          ))}
        </div>
      )}
    </div>
  );
}

function EpisodeRow({ event }: { event: EventDTO }) {
  const now = Date.now();
  const start = new Date(event.startTime).getTime();
  const end = new Date(event.endTime).getTime();
  const status = end < now ? "종료" : start > now ? "예정" : "진행 중";

  return (
    <Card className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-neutral-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {event.episodeNo ?? "-"}회차 · {event.title}
          </div>
          <div className={`${mobileText.meta} text-neutral-400 mt-1`}>
            {formatDateTime(event.startTime)} ~ {formatDateTime(event.endTime)}
          </div>
          <div className={`${mobileText.meta} text-neutral-500 mt-1`}>상태: {status}</div>
        </div>
        <div className="flex gap-2">
          <Button component={Link as any} to={`/events/${event.id}`} size="sm" variant="outline">
            상세
          </Button>
          <Button component={Link as any} to={`/events/${event.id}/manage`} size="sm">
            관리
          </Button>
        </div>
      </div>
    </Card>
  );
}

function AttendanceRow({
  row,
}: {
  row: { event: EventDTO; confirmed: number | null; attended: number | null; noShow: number | null };
}) {
  return (
    <Card className="rounded-xl border border-neutral-800 bg-neutral-900 p-3 text-neutral-100">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">
            {row.event.episodeNo ?? "-"}회차 · {row.event.title}
          </div>
          <div className={`${mobileText.meta} mt-1 text-neutral-400`}>종료 시각: {formatDateTime(row.event.endTime)}</div>
          <div className={`${mobileText.meta} mt-1 text-neutral-300`}>
            확정 {row.confirmed ?? "-"}명 · 출석 {row.attended ?? "-"}명 · 노쇼 {row.noShow ?? "-"}명
          </div>
        </div>
        <Button component={Link as any} to={`/events/${row.event.id}/manage`} size="sm" variant="outline">
          회차 관리
        </Button>
      </div>
    </Card>
  );
}
