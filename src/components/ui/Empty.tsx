// src/components/ui/Empty.tsx
import * as React from "react";
import { Box, Typography, Button } from "@mui/material";

export interface EmptyProps {
  title?: string;
  desc?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function Empty({
  title = "내용이 없습니다",
  desc = "조건을 바꾸어 다시 시도해 보세요.",
  actionLabel,
  onAction,
}: EmptyProps) {
  return (
    <Box
      sx={{
        textAlign: "center",
        border: "1px dashed",
        borderRadius: 3,
        p: 5,
        color: "text.secondary",
      }}
    >
      <Box sx={{ fontSize: 40, mb: 1 }}>🗂️</Box>

      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Typography variant="body2" gutterBottom>
        {desc}
      </Typography>

      {actionLabel && onAction && (
        <Button
          variant="outlined"
          sx={{ mt: 2 }}
          onClick={onAction}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}