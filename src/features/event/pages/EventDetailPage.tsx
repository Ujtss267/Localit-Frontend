// src/features/event/pages/EventDetailPage.tsx
import * as React from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Typography, Dialog, DialogContent, Divider, Chip } from "@mui/material";
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

  // 이미지 라이트박스
  const [imgOpen, setImgOpen] = React.useState(false);
  const [imgSrc, setImgSrc] = React.useState<string | null>(null);
  const openImage = (url: string) => {
    setImgSrc(url);
    setImgOpen(true);
  };

  const { data: serverEvent, isFetching } = useEvent(eventId);
  const sample = useMemo(() => sampleEvents.find((e) => e.id === eventId), [eventId]);
  const e: EventDTO | undefined = USE_SAMPLE ? sample : (serverEvent ?? sample);

  if (!e) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
        <CardUI className="p-6">
          <Typography variant="h6">이벤트를 찾을 수 없습니다.</Typography>
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

  // 참가하기도 같은 흐름으로
  const onAttend = () => {
    goHostPage();
  };

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 sm:pb-16">
        {/* 사진 갤러리 */}
        {images.length > 0 && (
          <CardUI className="p-3 sm:p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <Typography variant="subtitle1" className="font-semibold">
                사진 갤러리
              </Typography>
              <div className="hidden sm:flex gap-2 text-xs text-neutral-500">{images.length}장</div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
              {images.slice(0, 12).map((src, idx) => (
                <button
                  key={src + idx}
                  className="group relative block w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-800"
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
            <CardUI className="p-5">
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

              {/* ✅ 호스트 정보 블럭 (여기서도 이동 가능) */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-neutral-50 dark:bg-neutral-900/40 p-3">
                <div>
                  <div className="text-xs text-neutral-500">주최자</div>
                  <div className="font-semibold">
                    {(e as any)?.creator?.name ?? (e as any)?.creator?.email ?? (hostUserId ? `User #${hostUserId}` : "주최자")}
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={goHostPage}>
                  프로필 보기
                </Button>
              </div>

              <Typography variant="subtitle1" className="font-semibold mb-2 mt-4">
                이벤트 소개
              </Typography>
              <Typography variant="body1" className="leading-7 text-neutral-800 dark:text-neutral-200">
                {e.description}
              </Typography>
            </CardUI>

            {/* 세부 정보 */}
            <CardUI className="p-5">
              <Typography variant="subtitle1" className="font-semibold mb-3">
                세부 정보
              </Typography>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <div className="text-neutral-500">이벤트 유형</div>
                  <div className="font-medium">{e.type ?? "GENERAL"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-500">주최자</div>
                  <div className="font-medium">
                    {(e as any)?.creator?.name ?? (e as any)?.creator?.email ?? (hostUserId ? `User #${hostUserId}` : "주최자")}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-500">결제 처리</div>
                  <div className="font-medium">{e.paidToHost ? "주최자 수령" : "공유 정산"}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-neutral-500">호스트 형태</div>
                  <div className="font-medium">{e.hostType ?? "creator"}</div>
                </div>
              </div>
            </CardUI>

            {/* 리뷰 */}
            <ReviewSummaryCard avg={e.ratingAvg} count={e.ratingCount} breakdown={e.ratingBreakdown ?? null} className="rounded-2xl shadow-sm" />
            <ReviewList reviews={e.reviews} />
          </div>

          {/* 우측 CTA */}
          <div className="hidden lg:block">
            <CardUI className="p-5 sticky top-6">
              <div className="flex items-center justify-between">
                <div className="text-lg font-semibold">{e.price && e.price > 0 ? `${e.price.toLocaleString()}원` : "무료"}</div>
                {e.type && <Chip size="small" label={e.type} variant="outlined" />}
              </div>
              <Typography variant="body2" className="text-neutral-600 dark:text-neutral-400 mt-1">
                {new Date(e.startTime).toLocaleString("ko-KR")}
              </Typography>
              <Divider className="!my-4" />
              <Button size="lg" className="w-full" onClick={onAttend} disabled={isFetching}>
                {isFetching ? "처리 중…" : "참가하기"}
              </Button>
              <Typography variant="caption" className="block text-neutral-500 mt-2">
                버튼을 누르면 주최자의 마이페이지로 이동합니다.
              </Typography>
            </CardUI>
          </div>
        </div>

        {/* 원본 이미지 모달 */}
        <Dialog open={imgOpen} onClose={() => setImgOpen(false)} maxWidth={false} fullWidth={false}>
          <DialogContent className="p-0 bg-black/80">
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
            <div className="p-3 flex items-center justify-end gap-2 bg-neutral-900/80">
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
    </div>
  );
}
