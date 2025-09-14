import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

type Props = Omit<MuiButtonProps, "size" | "variant" | "color"> & {
  /** Tailwind-friendly sizes */
  size?: "sm" | "md" | "lg";
  /** Design variants aligned with Tailwind tokens */
  variant?: "primary" | "secondary" | "ghost" | "outline";
  /** Extra class names to append */
  className?: string;
};

export default function CustomButton({
  size = "md",
  variant = "primary",
  className = "",
  sx,
  children,
  ...muiProps
}: Props) {
  // Map our abstract variants to MUI's internal variants.
  // We keep colors/styles via Tailwind classes, so use color="inherit" and disableElevation.
  const muiVariant: MuiButtonProps["variant"] =
    variant === "outline" ? "outlined" : variant === "ghost" ? "text" : "contained";

  // Base Tailwind classes shared by all variants/sizes
  const base =
    "inline-flex items-center justify-center font-medium rounded-2xl transition active:scale-[.99] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed";

  // Size tokens (height/padding/font-size are managed by Tailwind; we keep MUI size at "medium")
  const sizes: Record<NonNullable<Props["size"]>, string> = {
    sm: "h-10 px-3 text-[15px]",
    md: "h-11 px-4 text-[15px]",
    lg: "h-12 px-5 text-base",
  };

  // Variant tokens expressed with Tailwind (light/dark supported)
  const variants: Record<NonNullable<Props["variant"]>, string> = {
    primary:
      "bg-blue-600 text-white hover:bg-blue-700 focus-visible:ring-blue-600 ring-offset-white dark:ring-offset-neutral-950",
    secondary:
      "bg-neutral-900 text-white hover:bg-neutral-800 focus-visible:ring-neutral-900 ring-offset-white dark:ring-offset-neutral-950",
    ghost:
      "bg-transparent hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
    outline:
      "border border-neutral-300 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-800 dark:text-neutral-200",
  };

  // Minimal MUI sx to keep our button shape and behavior consistent.
  const defaultSx = {
    textTransform: "none",
    borderRadius: "16px", // matches Tailwind rounded-2xl
    boxShadow: "none",
    "&:active": { transform: "scale(0.99)" },
  } as const;

  const mergedSx = Array.isArray(sx)
    ? [defaultSx, ...sx]
    : sx
    ? [defaultSx, sx]
    : [defaultSx];

  return (
    <MuiButton
      variant={muiVariant}
      color="inherit"
      disableElevation
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      sx={mergedSx}
      {...muiProps}
    >
      {children}
    </MuiButton>
  );
}
