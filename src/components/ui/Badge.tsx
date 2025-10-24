import * as React from "react";
import Chip from "@mui/material/Chip";
import type { SxProps, Theme } from "@mui/material/styles";

type Tone =
  | "blue"
  | "green"
  | "rose"
  | "neutral"
  // ▼ 추가
  | "violet"
  | "slate"
  | "indigo";

const toneToColor: Record<Tone, "primary" | "success" | "error" | "default"> = {
  blue: "primary",
  green: "success",
  rose: "error",
  neutral: "default",

  // ▼ 추가 매핑 (MUI 팔레트에 맞춰 근사치 매핑)
  violet: "primary",
  indigo: "primary",
  slate: "default",
};

export interface BadgeProps {
  children: React.ReactNode;
  /** 기존 tone 값을 MUI 팔레트에 매핑 */
  tone?: Tone;
  /** Tailwind 함께 쓰고 싶다면 className으로 루트에 붙습니다 */
  className?: string;
  /** MUI sx 커스터마이징 */
  sx?: SxProps<Theme>;
  /** Chip 아이콘(선택) */
  icon?: React.ReactElement;
  onClick?: () => void;
}

export default function Badge({ children, tone = "blue", className, sx, icon, onClick }: BadgeProps) {
  return (
    <Chip
      label={children}
      size="small"
      color={toneToColor[tone]}
      variant="filled" // v5 호환을 위해 filled 사용
      icon={icon}
      onClick={onClick}
      className={className}
      sx={{
        // Tailwind의 rounded-full/px-2.5/py-1 느낌 가깝게
        borderRadius: "9999px",
        fontWeight: 500,
        // Chip의 내부 여백은 size에 따라 자동 적용되지만 약간 보정
        "& .MuiChip-label": {
          px: 1.25, // 약 px-2.5 느낌
        },
        ...sx,
      }}
    />
  );
}
