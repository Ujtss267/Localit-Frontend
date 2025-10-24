// src/features/event/pages/EventDetailPage.tsx
import * as React from "react";
import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box, Card, CardContent, Chip, Divider, Stack, Typography } from "@mui/material";
import Button from "@/components/ui/Button";
import CardUI from "@/components/ui/Card";
import ImageCarousel from "@/components/ui/ImageCarousel";
import EventMeta from "../components/EventMeta";
import { sampleEvents } from "../sampleEvents";
import type { EventDTO } from "../api";
import { useEvent } from "../queries";

// NEW
import ReviewSummaryCard from "../components/ReviewSummaryCard";
import ReviewList from "../components/ReviewList";
import Badge from "@/components/ui/Badge"; // 너의 커스텀 Badge

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const USE_SAMPLE = import.meta.env.VITE_USE_SAMPLE === "true";
  const eventId = Number(id);

  const { data: serverEvent, isFetching } = useEvent?.(eventId) ?? { data: undefined, isFetching: false };
  const sample = useMemo(() => sampleEvents.find((e) => e.id === eventId), [eventId]);
  const e: EventDTO | undefined = USE_SAMPLE ? sample : (serverEvent ?? sample);

  const onAttend = () => {
    navigate("/my");
  };

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

  return (
    <div className="min-h-[100svh] bg-gradient-to-b from-neutral-50 to-white dark:from-neutral-950 dark:to-neutral-900 text-neutral-900 dark:text-neutral-100">
      <div className="max-w-5xl mx-auto px-3 sm:px-4 pb-28 sm:pb-16">
        {/* Hero 이미지 */}
        <div className="pt-4 sm:pt-6">
          <ImageCarousel images={images} autoplayMs={4000} className="mb-4" />
        </div>

        {/* 본문 */}
        <div className="mt-5 grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* 좌측: 정보/설명/리뷰 */}
          <div className="lg:col-span-2 space-y-5">
            <CardUI className="p-5">
              {/* 상단 라인: 시리즈 뱃지/타이틀 보강 */}
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

              <Typography variant="subtitle1" className="font-semibold mb-2">
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
                  <div className="font-medium">{(e.creator as any)?.name ?? (e.creator as any)?.email ?? "주최자"}</div>
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

            {/* ✅ 리뷰 요약 + 분포 */}
            <ReviewSummaryCard avg={e.ratingAvg} count={e.ratingCount} breakdown={e.ratingBreakdown ?? null} className="rounded-2xl shadow-sm" />

            {/* ✅ 리뷰 목록 */}
            <ReviewList reviews={e.reviews} />

            {/* ✅ 모바일 전용 인라인 CTA */}
            <div className="lg:hidden">
              <CardUI className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-neutral-600 dark:text-neutral-400">참가비</div>
                    <div className="font-semibold">{e.price && e.price > 0 ? `${e.price.toLocaleString()}원` : "무료"}</div>
                  </div>
                  <Button size="lg" className="flex-[2]" onClick={onAttend} disabled={isFetching}>
                    {isFetching ? "처리 중…" : "참가하기"}
                  </Button>
                </div>
              </CardUI>
            </div>
          </div>

          {/* 우측: 참가 CTA (데스크톱) */}
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
                버튼을 누르면 마이페이지로 이동합니다.
              </Typography>
            </CardUI>
          </div>
        </div>
      </div>
    </div>
  );
}
