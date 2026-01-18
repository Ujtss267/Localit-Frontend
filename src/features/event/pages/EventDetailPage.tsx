// src/features/event/pages/EventDetailPage.tsx
import * as React from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Dialog, DialogContent, Divider, Chip, IconButton } from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";
import Button from "@/components/ui/Button";
import CardUI from "@/components/ui/Card";
import EventMeta from "../components/EventMeta";
import { sampleEvents } from "../sampleEvents";
import type { EventDTO } from "../api";
import { useEvent } from "../queries";

import ReviewSummaryCard from "../components/ReviewSummaryCard";
import ReviewList from "../components/ReviewList";
import Badge from "@/components/ui/Badge";

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  const eventId = Number(id);
  const safeEventId = Number.isNaN(eventId) ? 0 : eventId;

  // 이미지 라이트박스
  const [imgOpen, setImgOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  const openImage = (url: string) => {
    setImgSrc(url);
    setImgOpen(true);
  };

  const { data: serverEvent, isFetching } = useEvent(safeEventId);
  const sample = useMemo(() => sampleEvents.find((e) => e.id === eventId), [eventId]);
  const e: EventDTO | undefined = USE_SAMPLE ? sample : (serverEvent ?? sample);

  if (Number.isNaN(eventId)) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
        <CardUI className="p-6 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <Typography variant="h6" className="text-neutral-900 dark:text-neutral-50">
            잘못된 이벤트 ID입니다.
          </Typography>
          <div className="mt-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              뒤로가기
            </Button>
          </div>
        </CardUI>
      </div>
    );
  }

  if (!e) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
        <CardUI className="p-6 border-neutral-200 dark:border-neutral-800 shadow-sm">
          <Typography variant="h6" className="text-neutral-900 dark:text-neutral-50">
            이벤트를 찾을 수 없습니다.
          </Typography>
          <div className="mt-3">
            <Button onClick={() => navigate(-1)} variant="outline">
              뒤로가기
            </Button>
          </div>
        </CardUI>
      </div>
    );
  }

  const images = e.imageUrls ?? [];
  const mentorName = (e.mentor && ("name" in e.mentor ? (e.mentor as any).name : (e.mentor as any).email)) ?? null;
  const roomName = (e.room && ("name" in e.room ? (e.room as any).name : null)) ?? null;

  // ✅ 이벤트 안에 들어있는 주최자 정보에서 userId 뽑기
  const hostUserId: number | null = (e as any)?.creator?.id ?? (e as any)?.creator?.userId ?? null;

  // ✅ 호스트 페이지로 보내는 함수
  const goHostPage = () => {
    if (hostUserId) {
      navigate(`/my/${hostUserId}`);
    } else {
      // 주최자 정보가 없으면 내 마이페이지로
      navigate("/my");
    }
  };

  // 참가요청 버튼
  const onAttend = () => {
    // TODO: 실제로는 신청 API / 신청 폼으로 연결하고,
    // 승인 프로세스는 EventApplication 기반으로 구현 예정
    goHostPage();
  };

  const priceLabel = e.price && e.price > 0 ? `${e.price.toLocaleString()}원` : "무료";
  const startLabel = new Date(e.startTime).toLocaleString("ko-KR");
  const mobileCtaStyle = { paddingBottom: "max(10px, env(safe-area-inset-bottom))" } as React.CSSProperties;

  return (
    <div className="min-h-[100svh] bg-neutral-950 text-neutral-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 sm:pb-16">
        <div className="flex items-center gap-2 mb-4">
          <IconButton aria-label="뒤로가기" onClick={() => navigate(-1)} size="small" className="text-neutral-200">
            <ArrowBackIosNewIcon fontSize="small" />
          </IconButton>
          <span className="text-sm text-neutral-200">이벤트 목록으로</span>
        </div>

        {/* 사진 갤러리 */}
        {images.length > 0 && (
          <CardUI className="p-3 sm:p-4 mb-4 bg-neutral-900/80 border border-neutral-800 shadow-sm backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="subtitle1" className="font-semibold text-neutral-100">
                사진 갤러리
              </Typography>
              <div className="hidden sm:flex gap-2 text-xs text-neutral-400">{images.length}장</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {images.slice(0, 12).map((src, idx) => (
                <button
                  key={src + idx}
                  className="group relative block w-full overflow-hidden rounded-lg bg-neutral-800"
                  onClick={() => openImage(src)}
                  aria-label={`이미지 ${idx + 1} 크게 보기`}
                >
                  <div className="pb-[100%]"></div>
                  <img
                    src={src}
                    alt={`이미지 ${idx + 1}`}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
                    draggable={false}
                  />
                </button>
              ))}
            </div>
          </CardUI>
        )}

        {/* 본문 */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 좌측 */}
          <div className="lg:col-span-2 space-y-5">
            <CardUI className="p-5 bg-neutral-900/90 border border-neutral-800 shadow-sm backdrop-blur">
              <div className="flex items-center gap-2 mb-2">
                {e.seriesId != null ? (
                  <>
                    <Badge tone="blue">{`시리즈 ${e.episodeNo ?? "-"}회차`}</Badge>
                    {e.seriesTitle ? <Badge tone="blue">{e.seriesTitle}</Badge> : null}
                  </>
                ) : (
                  <Badge tone="neutral">단발형</Badge>
                )}
              </div>

              <EventMeta
                title={e.title}
                type={e.type}
                location={e.location}
                startTime={e.startTime}
                endTime={e.endTime}
                capacity={e.capacity}
                price={e.price ?? 0}
                mentorName={mentorName}
                hostType={e.hostType ?? null}
                roomName={roomName}
              />

              {/* ✅ 호스트 정보 블럭 */}
              <div className="mt-4 flex items-center justify-between rounded-xl px-3 py-2.5 border border-neutral-800">
                <div>
                  <div className="text-xs text-neutral-400">주최자</div>
                  <div className="font-semibold text-neutral-100">
                    {(e as any)?.creator?.name ?? (e as any)?.creator?.email ?? (hostUserId ? `User #${hostUserId}` : "주최자")}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={goHostPage}>
                  프로필 보기
                </Button>
              </div>

              <Typography variant="subtitle1" className="font-semibold mb-2 mt-4 text-neutral-100">
                이벤트 소개
              </Typography>
              <Typography variant="body1" className="leading-7 text-neutral-200">
                {e.description}
              </Typography>
            </CardUI>

            {/* 세부 정보 */}
            <CardUI className="p-5 shadow-sm bg-neutral-900/90 border border-neutral-800 shadow-sm backdrop-blur">
              <Typography variant="subtitle1" className="font-semibold mb-3 text-neutral-100">
                세부 정보
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-200">
                <div className="space-y-1">
                  <div className="text-neutral-400">이벤트 유형</div>
                  <div className="font-medium text-neutral-100">{e.type ?? "GENERAL"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-400">주최자</div>
                  <div className="font-medium text-neutral-100">
                    {(e as any)?.creator?.name ?? (e as any)?.creator?.email ?? (hostUserId ? `User #${hostUserId}` : "주최자")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-400">결제 처리</div>
                  <div className="font-medium text-neutral-100">{e.paidToHost ? "주최자 수령" : "공유 정산"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-400">호스트 형태</div>
                  <div className="font-medium text-neutral-100">{e.hostType ?? "creator"}</div>
                </div>
              </div>
            </CardUI>

            {/* 리뷰 */}
            <ReviewSummaryCard
              avg={e.ratingAvg}
              count={e.ratingCount}
              breakdown={e.ratingBreakdown ?? null}
              className="rounded-2xl shadow-sm bg-white/95 dark:bg-neutral-900/95 border border-neutral-200/80 dark:border-neutral-800/80 backdrop-blur"
            />
            <ReviewList reviews={e.reviews} />
          </div>

          {/* 우측 CTA (데스크탑용) */}
          <div className="hidden lg:block">
            <CardUI className="p-5 sticky top-6 shadow-sm backdrop-blur bg-neutral-900/90 border border-neutral-800">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold text-neutral-100">{priceLabel}</div>
                {e.type && <Chip size="small" label={e.type} variant="outlined" />}
              </div>
              <Typography variant="body2" className="mt-1 text-neutral-300">
                {startLabel}
              </Typography>
              <Divider className="!my-4" />
              <Button size="lg" className="w-full" onClick={onAttend} disabled={isFetching}>
                {isFetching ? "처리 중…" : "참가요청"}
              </Button>
              <Typography variant="caption" className="block mt-2 text-neutral-400">
                지금은 테스트로 주최자의 마이페이지로 이동하지만, 실제로는 참가요청 → 호스트 승인 플로우로 동작할 예정입니다.
              </Typography>
            </CardUI>
          </div>
        </div>

        {/* 원본 이미지 모달 */}
        <Dialog open={imgOpen} onClose={() => setImgOpen(false)} maxWidth={false} fullWidth={false}>
          <DialogContent className="p-0 ">
            {imgSrc && (
              <div className="flex items-center justify-center max-w-[95vw] max-h-[90vh]">
                <img
                  src={imgSrc}
                  alt="원본 이미지"
                  className="max-w-[95vw] max-h-[90vh] w-auto h-auto object-contain select-none"
                  draggable={false}
                />
              </div>
            )}
            <div className="p-3 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setImgOpen(false)}>
                닫기
              </Button>
              {imgSrc && (
                <a href={imgSrc} target="_blank" rel="noreferrer" className="inline-flex">
                  <Button variant="outline">새 탭에서 열기</Button>
                </a>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* ✅ 모바일 하단 CTA 바 (BottomTab 위에 떠 있게 수정) */}
      <div className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-neutral-800 bg-neutral-950/90 backdrop-blur" style={mobileCtaStyle}>
        <div className="max-w-5xl mx-auto px-3 py-2 flex items-center justify-between gap-3">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-neutral-100">{priceLabel}</span>
            <span className="text-[11px] text-neutral-400">{startLabel}</span>
          </div>
          <Button size="md" className="flex-1 max-w-[180px]" onClick={onAttend} disabled={isFetching}>
            {isFetching ? "처리 중…" : "참가요청"}
          </Button>
        </div>
      </div>
    </div>
  );
}
