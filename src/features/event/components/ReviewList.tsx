// src/features/event/components/ReviewList.tsx
import * as React from "react";
import { Avatar, Card, CardContent, Divider, Stack, Typography } from "@mui/material";
import Rating from "@mui/material/Rating";
import type { EventReviewDTO } from "../api";

function initials(nameOrEmail: string) {
  const base = nameOrEmail?.trim();
  if (!base) return "U";
  const parts = base.split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base[0].toUpperCase();
}

function formatK(dt: string) {
  return new Date(dt).toLocaleString("ko-KR", { dateStyle: "medium", timeStyle: "short" });
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

  return (
    <div className="space-y-3">
      {reviews.map((r, idx) => (
        <Card key={r.id}>
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
                  <Typography variant="body2" className="mt-1 leading-7 text-neutral-800 dark:text-neutral-200">
                    {r.content}
                  </Typography>
                )}
              </div>
            </Stack>
          </CardContent>
          {idx < reviews.length - 1 && <Divider className="!mt-0" />}
        </Card>
      ))}
    </div>
  );
}
