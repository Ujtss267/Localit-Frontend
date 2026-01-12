// src/features/event/components/ReviewList.tsx
import * as React from "react";
import { Avatar, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import Rating from "@mui/material/Rating";
import { Virtuoso } from "react-virtuoso";
import type { EventReviewDTO } from "../api";

function initials(nameOrEmail: string) {
  const base = nameOrEmail?.trim();
  if (!base) return "U";
  const parts = base.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base[0].toUpperCase();
}

function formatK(dt: string) {
  return new Date(dt).toLocaleString("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/** ✅ 기존 map 안의 Card를 컴포넌트로 분리 */
function ReviewItem({ r }: { r: EventReviewDTO }) {
  return (
    <Card className="mb-3">
      <CardContent className="p-4">
        <Stack direction="row" spacing={2}>
          <Avatar>{initials(r.user.name || r.user.email)}</Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <Typography variant="subtitle2" className="truncate">
                  {r.user.name || r.user.email}
                </Typography>
                <Rating size="small" value={r.rating} readOnly />
              </div>
              <Typography variant="caption" color="text.secondary">
                {formatK(r.createdAt)}
              </Typography>
            </div>

            {r.title && (
              <Typography variant="subtitle1" className="font-semibold mt-1">
                {r.title}
              </Typography>
            )}

            {r.content && (
              <Typography variant="body2" className="mt-1 leading-7">
                {r.content}
              </Typography>
            )}
          </div>
        </Stack>
      </CardContent>
    </Card>
  );
}

export default function ReviewList({ reviews }: { reviews?: EventReviewDTO[] }) {
  if (!reviews || reviews.length === 0) {
    return (
      <Card>
        <CardContent className="p-5 text-center">
          <Typography variant="subtitle1" className="font-semibold">
            아직 리뷰가 없어요
          </Typography>
          <Typography variant="body2" color="text.secondary" className="mt-1">
            첫 번째 리뷰의 주인공이 되어주세요!
          </Typography>
        </CardContent>
      </Card>
    );
  }

  /** ✅ 반드시 height 지정 (가상화 필수 조건) */
  return (
    <div className="h-[70vh]">
      <Virtuoso
        data={reviews}
        itemContent={(_, r) => <ReviewItem r={r} />}
        components={{
          Footer: () => <Divider className="opacity-0 my-2" />,
        }}
      />
    </div>
  );
}
