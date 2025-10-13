// src/features/room/components/RoomFilter.tsx
import { Stack, TextField, InputAdornment, IconButton, ToggleButton, ToggleButtonGroup } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import EventBusyIcon from "@mui/icons-material/EventBusy";
import SortIcon from "@mui/icons-material/Sort";
import { memo } from "react";

export type RoomSortKey = "created" | "capacity" | "name";

type Props = {
  q: string;
  onlyAvailable: boolean;
  sortKey: RoomSortKey;

  /** 입력 변경(타이핑 중) 또는 확정 동기화(blur/clear) 시 호출
   * commit=true일 때 부모에서 URL 동기화 등을 수행하면 됨 */
  onQChange: (next: string, commit?: boolean) => void;

  /** 예약 가능 토글 변경 */
  onOnlyAvailableChange: (next: boolean) => void;

  /** 정렬 키 변경 */
  onSortKeyChange: (next: RoomSortKey) => void;
};

function RoomFilter({ q, onlyAvailable, sortKey, onQChange, onOnlyAvailableChange, onSortKeyChange }: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={1.5} sx={{ mb: 2 }}>
      {/* 검색 */}
      <TextField
        placeholder="이름 또는 위치로 검색"
        value={q}
        onChange={(e) => onQChange(e.target.value, false)}
        onBlur={() => onQChange(q, true)}
        fullWidth
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
          endAdornment: q ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={() => onQChange("", true)} // clear 시 즉시 확정
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </InputAdornment>
          ) : null,
        }}
      />

      {/* 예약 가능 토글 */}
      <ToggleButton
        value="available"
        selected={onlyAvailable}
        onChange={() => onOnlyAvailableChange(!onlyAvailable)}
        sx={{ px: 2, whiteSpace: "nowrap" }}
      >
        {onlyAvailable ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <EventAvailableIcon fontSize="small" />
            예약 가능만
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <EventBusyIcon fontSize="small" />
            모두 보기
          </span>
        )}
      </ToggleButton>

      {/* 정렬 */}
      <ToggleButtonGroup
        exclusive
        value={sortKey}
        onChange={(_e, val: RoomSortKey | null) => {
          if (!val) return;
          onSortKeyChange(val);
        }}
        size="small"
        sx={{ ml: { md: "auto" }, whiteSpace: "nowrap" }}
      >
        <ToggleButton value="created">
          <SortIcon fontSize="small" style={{ marginRight: 6 }} />
          최신순
        </ToggleButton>
        <ToggleButton value="capacity">정원순</ToggleButton>
        <ToggleButton value="name">이름순</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}

export default memo(RoomFilter);
