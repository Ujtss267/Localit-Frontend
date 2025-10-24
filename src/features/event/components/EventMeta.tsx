// src/features/event/components/EventMeta.tsx
import * as React from "react";
import { Box, Chip, Divider, Stack, Typography } from "@mui/material";

type MetaProps = {
  title: string;
  type?: string; // "GENERAL" | "MENTORING" | ...
  location?: string;
  startTime?: string; // ISO
  endTime?: string; // ISO
  capacity?: number;
  price?: number; // 원 단위
  mentorName?: string | null;
  hostType?: string | null;
  roomName?: string | null;
};

function fmtDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  try {
    return new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short" }).format(d);
  } catch {
    return d.toLocaleString();
  }
}

export default function EventMeta({ title, type, location, startTime, endTime, capacity, price = 0, mentorName, hostType, roomName }: MetaProps) {
  const when = [fmtDate(startTime), endTime ? `– ${fmtDate(endTime)}` : ""].join(" ");

  return (
    <Box className="space-y-3">
      <div>
        <div className="flex items-center gap-2 flex-wrap">
          <Typography variant="h4" className="font-bold leading-tight">
            {title}
          </Typography>
          {type && <Chip size="small" label={type} color="primary" variant="outlined" />}
        </div>
        {mentorName && (
          <Typography variant="body2" className="text-neutral-600 dark:text-neutral-400 mt-1">
            멘토: <span className="font-medium">{mentorName}</span>
          </Typography>
        )}
      </div>

      <Stack spacing={1.2} className="text-sm text-neutral-700 dark:text-neutral-300">
        {when && (
          <div>
            일시: <span className="font-medium">{when}</span>
          </div>
        )}
        {location && (
          <div>
            장소:{" "}
            <span className="font-medium">
              {location}
              {roomName ? ` · ${roomName}` : ""}
            </span>
          </div>
        )}
        {typeof capacity === "number" && (
          <div>
            정원: <span className="font-medium">{capacity.toLocaleString()}명</span>
          </div>
        )}
        <div>
          참가비: <span className="font-semibold">{price > 0 ? `${price.toLocaleString()}원` : "무료"}</span>
          {hostType ? ` · (${hostType})` : ""}
        </div>
      </Stack>

      <Divider className="!my-3" />
    </Box>
  );
}
