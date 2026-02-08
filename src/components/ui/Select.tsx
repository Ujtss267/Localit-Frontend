// src/components/ui/Select.tsx
import MuiSelect, { SelectProps as MuiSelectProps } from "@mui/material/Select";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";

type Props = Omit<MuiSelectProps, "size" | "variant" | "native"> & {
  /** 라벨(선택) — 떠있는 라벨을 쓰고 싶을 때 */
  label?: string;
  /** Tailwind 친화적 사이즈 */
  size?: "sm" | "md" | "lg";
  /** 바깥 FormControl에 Tailwind 클래스 추가 */
  className?: string;
};

/**
 * Tailwind 룩앤필을 유지하는 MUI Select 래퍼.
 * - native 모드라서 기존처럼 <option> 자식을 그대로 사용할 수 있음.
 * - 모서리/포커스 링을 sx로 살짝 조정.
 */
export default function Select({
  label,
  size = "md",
  className = "",
  children,
  sx,
  ...props
}: Props) {
  const muiSize: MuiSelectProps["size"] = size === "sm" ? "small" : "medium";
  const minHeight = size === "sm" ? 44 : size === "md" ? 44 : 48;

  const defaultSx = {
    // rounded-2xl 대응
    "& .MuiOutlinedInput-root": {
      borderRadius: "16px",
      backgroundColor: "rgba(23, 23, 23, 0.9)",
      color: "rgb(245, 245, 245)",
      minHeight,
    },
    // 포커스 링 가시성 향상
    "& .MuiOutlinedInput-notchedOutline": {
      transition: "box-shadow .2s",
      borderColor: "rgba(82, 82, 91, 0.9)",
    },
    "& .MuiInputLabel-root": { color: "rgba(212, 212, 216, 0.9)" },
    "& .MuiSvgIcon-root": { color: "rgba(228, 228, 231, 0.9)" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": {
      boxShadow: "0 0 0 2px rgba(37, 99, 235, .6)", // blue-600 느낌
      borderColor: "rgba(37, 99, 235, 1)",
    },
  } as const;

  const mergedSx = Array.isArray(sx) ? [defaultSx, ...sx] : sx ? [defaultSx, sx] : [defaultSx];

  return (
    <FormControl fullWidth size={muiSize} className={className}>
      {label && <InputLabel>{label}</InputLabel>}
      <MuiSelect native variant="outlined" label={label} sx={mergedSx} {...props}>
        {children}
      </MuiSelect>
    </FormControl>
  );
}
