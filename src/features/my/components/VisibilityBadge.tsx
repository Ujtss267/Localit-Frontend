// src/features/my/components/VisibilityBadge.tsx
import React from "react";
import type { Visibility } from "../types";

export function VisibilityBadge({ v }: { v?: Visibility }) {
  if (!v) return null;
  const label = v === "PUBLIC" ? "공개" : v === "FOLLOWERS" ? "팔로워 공개" : "비공개";

  return <span className="ml-2 inline-flex items-center rounded-full border px-2 py-0.5 text-xs opacity-80">{label}</span>;
}
