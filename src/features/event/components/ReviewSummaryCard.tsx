// src/features/event/components/ReviewSummaryCard.tsx
import * as React from "react";
import { Card, CardContent, Divider, LinearProgress, Stack, Typography } from "@mui/material";
import ReviewStars from "./ReviewStars";
import type { RatingBreakdown } from "../api";

function Bar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Typography className="min-w-[44px]" variant="body2" color="text.secondary">
        {label}★
      </Typography>
      <div className="flex-1">
        <LinearProgress variant="determinate" value={pct} />
      </div>
      <Typography className="min-w-[36px]" variant="body2" color="text.secondary" align="right">
        {value}
      </Typography>
    </Stack>
  );
}

export default function ReviewSummaryCard({
  avg,
  count,
  breakdown,
  className,
}: {
  avg?: number | null;
  count?: number | null;
  breakdown?: Partial<RatingBreakdown> | null;
  className?: string;
}) {
  const max = count ?? 0;
  return (
    <Card className={className}>
      <CardContent className="p-5">
        <Typography variant="h6" className="font-semibold mb-2">
          리뷰 & 평점
        </Typography>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="shrink-0">
            <ReviewStars value={avg ?? 0} count={count ?? 0} size="medium" />
            <Typography variant="caption" color="text.secondary">
              최근 참가자 리뷰 기준
            </Typography>
          </div>
          <Divider className="sm:hidden" />
          <Divider orientation="vertical" flexItem className="hidden sm:block" />
          <div className="flex-1 space-y-1.5">
            {[5, 4, 3, 2, 1].map((s) => (
              <Bar key={s} label={String(s)} value={breakdown?.[s as 1 | 2 | 3 | 4 | 5] ?? 0} max={max} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
