// src/features/event/components/ReviewStars.tsx
import * as React from "react";
import Rating from "@mui/material/Rating";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";

export default function ReviewStars({
  value,
  count,
  size = "small",
}: {
  value?: number | null;
  count?: number | null;
  size?: "small" | "medium" | "large";
}) {
  if (!value) return null;
  const display = Number.isFinite(value) ? value.toFixed(1) : "0.0";
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <Rating name="read-only" value={Number(display)} precision={0.1} readOnly size={size} />
      <Typography variant="body2" color="text.secondary">
        {display}
        {count ? ` (${count})` : ""}
      </Typography>
    </Stack>
  );
}
