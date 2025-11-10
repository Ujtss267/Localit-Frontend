// src/features/my/components/VisibilitySelect.tsx
import React from "react";
import type { Visibility } from "../types";

interface VisibilitySelectProps {
  value?: Visibility;
  onChange: (v: Visibility) => void;
}

export function VisibilitySelect({ value = "PUBLIC", onChange }: VisibilitySelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Visibility)}
      className="rounded-md border bg-white px-2 py-1 text-xs shadow-sm hover:bg-gray-50"
      title="공개 범위"
    >
      <option value="PUBLIC">공개</option>
      <option value="FOLLOWERS">팔로워 공개</option>
      <option value="PRIVATE">비공개</option>
    </select>
  );
}
