import MuiButton, { ButtonProps as MuiButtonProps } from "@mui/material/Button";

type Props = Omit<MuiButtonProps, "size" | "variant"> & {
  size?: "sm" | "md";
  variant?: "solid" | "outline";
};

export default function CustomButton({
  size = "md",
  variant = "outline",
  className = "",
  sx,
  children,
  ...muiProps
}: Props) {
  const muiSize: MuiButtonProps["size"] = size === "sm" ? "small" : "medium";
  const muiVariant: MuiButtonProps["variant"] =
    variant === "solid" ? "contained" : "outlined";

  const defaultSx = {
    borderRadius: "12px",
    textTransform: "none",
    boxShadow: 1,
    "&:active": { transform: "scale(0.98)" },
  } as const;

  const mergedSx = Array.isArray(sx) ? [defaultSx, ...sx] : sx ? [defaultSx, sx] : [defaultSx];

  return (
    <MuiButton
      size={muiSize}
      variant={muiVariant}
      className={className}
      sx={mergedSx}
      {...muiProps}
    >
      {children}
    </MuiButton>
  );
}
