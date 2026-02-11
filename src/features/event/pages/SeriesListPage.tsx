import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Empty from "@/components/ui/Empty";
import { mobileText } from "@/components/ui/mobileTypography";
import { useAuth } from "@/app/providers/AuthProvider";
import { sampleData } from "@/mocks/sampleData";
import { createSeriesApi, searchSeries, type SeriesDTO } from "../api";
import { useEvents } from "../queries";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Switch, TextField } from "@mui/material";

const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";

function formatDate(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "-";
  return d.toLocaleDateString("ko-KR");
}

export default function SeriesListPage() {
  const { user } = useAuth();
  const viewerId = user?.id ?? 1;
  const navigate = useNavigate();
  const [sp] = useSearchParams();
  const fromEventCreate = sp.get("from") === "event-create";
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPublic, setNewPublic] = useState(true);

  const { data: events = [] } = useEvents();
  const [sampleSeriesRows, setSampleSeriesRows] = useState<SeriesDTO[]>(sampleData.series);
  const seriesQuery = useQuery({
    queryKey: ["series-list"],
    enabled: !USE_SAMPLE,
    queryFn: async () => {
      return searchSeries("");
    },
  });
  const createSeries = useMutation({
    mutationFn: async (payload: { title: string; description?: string; isPublic?: boolean }) => {
      if (USE_SAMPLE) {
        const created: SeriesDTO = {
          seriesId: Date.now(),
          title: payload.title,
          description: payload.description,
          isPublic: payload.isPublic ?? true,
          hostId: viewerId,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setSampleSeriesRows((prev) => [created, ...prev]);
        return created;
      }
      return createSeriesApi(payload);
    },
    onSuccess: (created) => {
      if (!USE_SAMPLE) qc.invalidateQueries({ queryKey: ["series-list"] });
      setCreateOpen(false);
      setNewTitle("");
      setNewDescription("");
      setNewPublic(true);
      if (fromEventCreate) {
        navigate(`/events/new?seriesId=${created.seriesId}&seriesTitle=${encodeURIComponent(created.title)}`, { replace: true });
      }
    },
  });

  const hostedSeries = useMemo(() => {
    const rows = (USE_SAMPLE ? sampleSeriesRows : (seriesQuery.data ?? [])) as SeriesDTO[];
    return rows.filter((s) => s.hostId === viewerId);
  }, [seriesQuery.data, sampleSeriesRows, viewerId]);

  const statsBySeriesId = useMemo(() => {
    const now = Date.now();
    const out = new Map<number, { episodes: number; nextStart?: string; pastEpisodes: number }>();
    for (const s of hostedSeries) {
      const eps = events.filter((e) => e.seriesId === s.seriesId);
      const next = eps
        .filter((e) => new Date(e.startTime).getTime() > now)
        .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
      const pastEpisodes = eps.filter((e) => new Date(e.endTime).getTime() <= now).length;
      out.set(s.seriesId, { episodes: eps.length, nextStart: next?.startTime, pastEpisodes });
    }
    return out;
  }, [hostedSeries, events]);

  return (
    <div className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-5 space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-base sm:text-xl font-semibold text-white">시리즈 목록</h1>
          <p className={`${mobileText.meta} mt-1 text-neutral-400`}>내가 개설한 시리즈의 회차 운영 현황을 확인합니다.</p>
        </div>
        <div className="grid w-full grid-cols-2 gap-2 sm:w-auto sm:flex sm:items-center">
          {fromEventCreate && (
            <Button variant="outline" size="sm" onClick={() => navigate("/events/new", { replace: true })} className="w-full whitespace-nowrap text-[11px] sm:text-sm">
              이벤트로
            </Button>
          )}
          <Button size="sm" onClick={() => setCreateOpen(true)} className="w-full whitespace-nowrap text-[11px] sm:text-sm">
            새 시리즈
          </Button>
        </div>
      </div>

      {seriesQuery.isLoading ? (
        <Card className="p-4 text-sm text-neutral-300">불러오는 중...</Card>
      ) : hostedSeries.length === 0 ? (
        <Empty title="등록한 시리즈가 없습니다" desc="이벤트 생성 화면에서 시리즈를 만들어 보세요." />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {hostedSeries.map((s) => {
            const stats = statsBySeriesId.get(s.seriesId);
            return (
              <Card key={s.seriesId} className="p-4 space-y-3 border border-neutral-800 bg-neutral-900 text-neutral-100">
                <div>
                  <div className="text-sm font-semibold">{s.title}</div>
                  <div className={`${mobileText.meta} text-neutral-400 mt-1`}>{s.description || "설명 없음"}</div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded-lg border border-neutral-800 px-2 py-2">
                    <div className={`${mobileText.meta} text-neutral-400`}>회차</div>
                    <div className="text-sm font-semibold">{stats?.episodes ?? 0}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 px-2 py-2">
                    <div className={`${mobileText.meta} text-neutral-400`}>지난 회차</div>
                    <div className="text-sm font-semibold">{stats?.pastEpisodes ?? 0}</div>
                  </div>
                  <div className="rounded-lg border border-neutral-800 px-2 py-2">
                    <div className={`${mobileText.meta} text-neutral-400`}>다음 일정</div>
                    <div className="text-xs font-semibold">{formatDate(stats?.nextStart)}</div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className={`${mobileText.meta} text-neutral-500`}>업데이트 {formatDate(s.updatedAt)}</div>
                  <Button
                    component={Link as any}
                    to={`/series/${s.seriesId}${fromEventCreate ? "?from=event-create" : ""}`}
                    size="sm"
                    variant="outline"
                    replace={fromEventCreate}
                  >
                    시리즈 운영
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={createOpen} onClose={() => setCreateOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>새 시리즈 만들기</DialogTitle>
        <DialogContent dividers>
          <div className="space-y-3 mt-1">
            <TextField label="시리즈 제목" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} fullWidth required />
            <TextField
              label="시리즈 설명 (선택)"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              fullWidth
              multiline
              minRows={2}
            />
            <FormControlLabel control={<Switch checked={newPublic} onChange={(e) => setNewPublic(e.target.checked)} />} label="공개 시리즈" />
          </div>
        </DialogContent>
        <DialogActions>
          <Button variant="ghost" size="sm" onClick={() => setCreateOpen(false)}>
            취소
          </Button>
          <Button
            size="sm"
            onClick={() =>
              createSeries.mutate({
                title: newTitle.trim(),
                description: newDescription.trim() || undefined,
                isPublic: newPublic,
              })
            }
            disabled={createSeries.isPending || newTitle.trim().length < 2}
          >
            {createSeries.isPending ? "생성 중..." : fromEventCreate ? "생성 후 이벤트로" : "생성"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
