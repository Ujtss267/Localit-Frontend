// src/features/room/components/ImagePickerGrid.tsx
import { useEffect, useMemo } from "react";
import { Box, Button, Typography } from "@mui/material";

type Props = {
  value: File[]; // 현재 선택된 파일들(컨트롤드)
  onChange: (files: File[]) => void; // 파일 변경 콜백
  max?: number; // 최대 개수 (기본 5)
  columns?: number; // 그리드 컬럼 수 (기본 3)
  accept?: string; // accept 속성 (기본 "image/*")
  height?: number; // 썸네일 높이 (기본 90)
  helperText?: string; // 하단 안내 문구
};

export default function ImagePickerGrid({
  value,
  onChange,
  max = 5,
  columns = 3,
  accept = "image/*",
  height = 90,
  helperText = "최대 5장까지 업로드 가능합니다.",
}: Props) {
  // ObjectURL 생성
  const previews = useMemo(() => value.map((f) => URL.createObjectURL(f)), [value]);

  // 메모리 정리
  useEffect(() => {
    return () => {
      previews.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previews]);

  function handlePick(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const next = files.slice(0, max);
    onChange(next);
  }

  return (
    <Box sx={{ display: "grid", gap: 1 }}>
      <Typography variant="subtitle2">이미지 (선택)</Typography>

      <Button variant="outlined" component="label" color="inherit">
        이미지 선택
        <input type="file" accept={accept} hidden multiple onChange={handlePick} />
      </Button>

      {previews.length > 0 ? (
        <Box sx={{ display: "grid", gridTemplateColumns: `repeat(${columns}, 1fr)`, gap: 1 }}>
          {previews.map((src, idx) => (
            <Box
              key={idx}
              sx={{
                position: "relative",
                borderRadius: 1,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
                aspectRatio: "1 / 1",
              }}
            >
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <img src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </Box>
          ))}
        </Box>
      ) : (
        <Typography variant="caption" color="text.secondary">
          {helperText}
        </Typography>
      )}
    </Box>
  );
}
