import React from "react";
import TextField, { TextFieldProps } from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import IconButton from "@mui/material/IconButton";
// 아이콘을 쓰려면: npm i @mui/icons-material (이미 설치되어 있으면 그대로 사용)
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

type Props = Omit<TextFieldProps, "size" | "variant"> & {
  /** UI 통일을 위한 커스텀 사이즈 */
  size?: "sm" | "md";
  /** 비밀번호 입력 시 우측 토글 버튼 노출 */
  togglePassword?: boolean;
  /** Tailwind와 함께 쓰기 위한 className */
  className?: string;
};

/**
 * Custom Input (MUI TextField Wrapper)
 * - size: "sm" | "md" -> MUI "small" | "medium" 매핑
 * - togglePassword: type="password"일 때 가시성 토글 아이콘 제공
 * - sx 병합 및 className 지원
 */
const Input = React.forwardRef<HTMLInputElement, Props>(function Input(
  {
    size = "md",
    type = "text",
    togglePassword = false,
    className,
    sx,
    InputProps,
    ...rest
  },
  ref
) {
  const [showPassword, setShowPassword] = React.useState(false);

  const muiSize: TextFieldProps["size"] = size === "sm" ? "small" : "medium";

  const defaultSx = {
    "& .MuiInputBase-root": {
      borderRadius: "12px",
      
    },
  } as const;

  const mergedSx = Array.isArray(sx)
    ? [defaultSx, ...sx]
    : sx
    ? [defaultSx, sx]
    : [defaultSx];

  const isPassword = type === "password";
  const endAdornment =
    togglePassword && isPassword ? (
      <InputAdornment position="end">
        <IconButton
          aria-label="toggle password visibility"
          onClick={() => setShowPassword((v) => !v)}
          edge="end"
        >
          {showPassword ? <VisibilityOff /> : <Visibility />}
        </IconButton>
      </InputAdornment>
    ) : (
      InputProps?.endAdornment
    );

  return (
    <TextField
      inputRef={ref}
      type={isPassword && togglePassword ? (showPassword ? "text" : "password") : type}
      size={muiSize}
      className={className}
      sx={mergedSx}
      InputProps={{
        ...InputProps,
        endAdornment,
      }}
      {...rest}
    />
  );
});

export default Input;