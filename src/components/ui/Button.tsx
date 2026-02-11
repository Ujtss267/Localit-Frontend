// src/components/ui/Button.tsx
import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";
import { Link as RouterLink } from "react-router-dom";

type Props = Omit<MuiButtonProps, "size" | "variant" | "color"> & {
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "ghost" | "outline";
  className?: string;
  /** 있으면 react-router Link로 렌더링 */
  to?: string;
  replace?: boolean;
};

export default function CustomButton({ size = "md", variant = "primary", className = "", sx, to, replace, children, ...muiProps }: Props) {
  const muiVariant: MuiButtonProps["variant"] = variant === "outline" ? "outlined" : variant === "ghost" ? "text" : "contained";

  const base =
    "inline-flex items-center justify-center font-medium rounded-2xl transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-11 px-3 text-sm",
    md: "h-11 px-4 text-sm",
    lg: "h-12 px-5 text-base",
  };

  /**
   * ▼ Dark 모드 강화 포인트
   * Primary / Secondary / Outline / Ghost 모두 Tailwind의 dark: 기능을 확장해,
   * 배경색 / 글자색 / hover / ring-offset / border가 Dark에서 자연스럽게 표현되도록 수정
   */
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary: [
      "bg-blue-600 text-white hover:bg-blue-700",
      "focus-visible:ring-blue-600 ring-offset-white",
      "dark:bg-blue-500 dark:hover:bg-blue-600",
      "dark:text-white dark:ring-offset-neutral-900",
    ].join(" "),

    secondary: [
      "bg-neutral-900 text-white hover:bg-neutral-800",
      "focus-visible:ring-neutral-900 ring-offset-white",
      "dark:bg-neutral-800 dark:hover:bg-neutral-700",
      "dark:text-white dark:ring-offset-neutral-900",
    ].join(" "),

    ghost: ["bg-transparent hover:bg-neutral-800 text-neutral-200", "dark:text-neutral-200 dark:hover:bg-neutral-800"].join(" "),

    outline: [
      "border border-neutral-700 text-neutral-200 hover:bg-neutral-800",
      "dark:border-neutral-700 dark:text-neutral-200",
      "dark:hover:bg-neutral-800",
    ].join(" "),
  };

  const defaultSx = {
    textTransform: "none",
    borderRadius: "16px",
    boxShadow: "none",
    "&:active": { transform: "scale(0.99)" },
  } as const;

  const mergedSx = Array.isArray(sx) ? [defaultSx, ...sx] : sx ? [defaultSx, sx] : [defaultSx];

  const common = {
    variant: muiVariant,
    color: "inherit" as const,
    disableElevation: true,
    className: `${base} ${sizes[size]} ${variants[variant]} ${className}`,
    sx: mergedSx,
    ...muiProps,
  };

  // to 있으면 Link로 렌더링
  if (to) {
    return (
      <MuiButton component={RouterLink} to={to} replace={replace} {...common}>
        {children}
      </MuiButton>
    );
  }

  return <MuiButton {...common}>{children}</MuiButton>;
}
