import * as React from "react";
import { useMemo } from "react";
import { Chip, Stack, Typography, Alert, Divider, Button } from "@mui/material";

/* ──────────────────────────────────────────────────────────
 * TimeRangeBadgePicker (Range Only)
 *  - 두 번 클릭 → 시작/종료 각각 선택
 *  - hover 프리뷰, 선택요약(시작/종료/기간), 초기화, 안전가드 포함
 *  - 종료 시간은 "선택된 종료 칩 시각 그대로" (30분 추가 없음)
 * ────────────────────────────────────────────────────────── */

// -----------------------------
// Types
// -----------------------------
export type TimeRangeBadgePickerProps = {
  /** from/to can be Date or "HH:mm" (24h) string */
  from: Date | string;
  to: Date | string;

  /** step minutes between badges (default: 30) — must be > 0 */
  stepMinutes?: number;

  /** controlled selected range (start, end) */
  value?: { start: Date; end: Date } | null;

  /** callback when selection completed/changed */
  onChange?: (range: { start: Date; end: Date }) => void;

  /** disable specific slots (by start time). If returns true, slot is disabled */
  isSlotDisabled?: (slotStart: Date) => boolean;

  /** format function for time labels (default HH:mm) */
  formatLabel?: (d: Date) => string;

  /** Tailwind grid columns (responsive classes allowed) */
  gridClassName?: string; // e.g. "grid grid-cols-3 gap-2 md:grid-cols-6"

  /** Height of each badge in px (default 40) */
  badgeHeight?: number;

  /** Helper text below the grid */
  helperText?: React.ReactNode;
};

// -----------------------------
// Helpers (safe & defensive)
// -----------------------------
function parseToDateNullable(base: Date, v: Date | string | null | undefined): Date | null {
  if (v instanceof Date) {
    const t = v.getTime();
    return Number.isFinite(t) ? new Date(v) : null;
  }
  if (typeof v === "string") {
    // accept HH:mm (24h)
    const m = v.match(/^([01]\d|2[0-3]):([0-5]\d)$/);
    if (!m) return null;
    const hh = Number(m[1]);
    const mm = Number(m[2]);
    const d = new Date(base);
    d.setHours(hh, mm, 0, 0);
    return d;
  }
  return null;
}

function addMinutes(d: Date, mins: number): Date {
  const nd = new Date(d);
  nd.setMinutes(nd.getMinutes() + mins);
  return nd;
}

function diffMinutes(a: Date, b: Date): number {
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

const defaultFormat = (d: Date) => d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false });

function safeFormatLabel(d: Date | null | undefined, formatLabel: (d: Date) => string) {
  if (!(d instanceof Date) || !Number.isFinite(d.getTime())) return "--:--";
  try {
    return formatLabel(d);
  } catch {
    return "--:--";
  }
}

// -----------------------------
// Component (Range Only)
// -----------------------------
export default function TimeRangeBadgePicker({
  from,
  to,
  stepMinutes = 30,
  value = null,
  onChange,
  isSlotDisabled,
  formatLabel = defaultFormat,
  gridClassName = "flex gap-2 overflow-x-auto whitespace-nowrap p-1 scrollbar-thin",
  badgeHeight = 40,
  helperText,
}: TimeRangeBadgePickerProps) {
  // Anchor day (today) to avoid date rollover issues
  const today = useMemo(() => {
    const t = new Date();
    t.setSeconds(0, 0);
    return t;
  }, []);

  const start = useMemo(() => parseToDateNullable(today, from), [today, from]);
  const end = useMemo(() => parseToDateNullable(today, to), [today, to]);

  // Runtime validation
  const validationError = useMemo(() => {
    if (!start || !end) return "Invalid `from`/`to` (expected Date or 'HH:mm').";
    if (diffMinutes(start, end) < 0) return "`from` must be before `to`.";
    if (!Number.isFinite(stepMinutes) || stepMinutes <= 0) return "`stepMinutes` must be > 0.";
    return null;
  }, [start, end, stepMinutes]);

  // Build all badge times from start ... end inclusive by step
  const slots = useMemo(() => {
    if (validationError) return [] as Date[];
    const out: Date[] = [];
    const total = Math.max(0, diffMinutes(start!, end!));
    const steps = Math.floor(total / stepMinutes);
    for (let i = 0; i <= steps; i++) out.push(addMinutes(start!, i * stepMinutes));
    return out;
  }, [start, end, stepMinutes, validationError]);

  // 내부 상태: 선택 중인 시작 인덱스 + 호버 인덱스
  const [pendingStartIdx, setPendingStartIdx] = React.useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  // 선택 구간 하이라이트 계산 (종료 칩 포함)
  const selectedIdxes = useMemo(() => {
    const set = new Set<number>();
    if (!slots.length) return set;

    // 1) 확정된 value 반영 (종료 칩 포함)
    if (value?.start instanceof Date && value?.end instanceof Date) {
      const sTime = value.start.getTime();
      const eTime = value.end.getTime();
      if (Number.isFinite(sTime) && Number.isFinite(eTime)) {
        slots.forEach((t, i) => {
          const ts = t.getTime();
          if (ts >= sTime && ts <= eTime) set.add(i); // <= (inclusive)
        });
        return set;
      }
    }

    // 2) 종료 선택 전 프리뷰 (종료 칩 포함)
    if (pendingStartIdx != null) {
      const hi = hoverIdx ?? pendingStartIdx;
      const [a, b] = hi >= pendingStartIdx ? [pendingStartIdx, hi] : [hi, pendingStartIdx];
      for (let i = a; i <= b; i++) set.add(i);
    }

    return set;
  }, [value, slots, pendingStartIdx, hoverIdx]);

  // ✅ Range 모드: 화면에 보여줄 "현재 선택/프리뷰" (시작/종료/기간) 계산
  const { currentPreviewStart, currentPreviewEnd, currentPreviewDurationMinutes } = useMemo(() => {
    let s: Date | null = null;
    let e: Date | null = null;

    // 1) 확정된 value 우선 (종료 칩 그대로)
    if (
      value?.start instanceof Date &&
      value?.end instanceof Date &&
      Number.isFinite(value.start.getTime()) &&
      Number.isFinite(value.end.getTime())
    ) {
      s = value.start;
      e = value.end;
    } else if (pendingStartIdx != null && slots.length) {
      // 2) 종료 선택 전 프리뷰 (종료 칩 그대로)
      const sIdx = pendingStartIdx;
      const hIdx = hoverIdx ?? pendingStartIdx;
      const [a, b] = hIdx >= sIdx ? [sIdx, hIdx] : [hIdx, sIdx];
      s = slots[a];
      e = slots[b];
    }

    const mins = s && e ? diffMinutes(s, e) : null;
    return { currentPreviewStart: s, currentPreviewEnd: e, currentPreviewDurationMinutes: mins };
  }, [value, pendingStartIdx, hoverIdx, slots]);

  // == Range: 두 번 클릭(시작 → 종료) ==
  const handlePickRange = (i: number) => {
    if (!slots.length) return;
    if (isSlotDisabled?.(slots[i])) return; // 개별 disable이면 무시

    // 시작 지정
    if (pendingStartIdx == null) {
      setPendingStartIdx(i);
      setHoverIdx(i);
      return;
    }

    // 같은 칩 재클릭 → 초기화
    if (pendingStartIdx === i) {
      setPendingStartIdx(null);
      setHoverIdx(null);
      return;
    }

    // 시작/종료 결정 (종료 칩 포함, 종료시간 그대로)
    const [sIdx, eIdx] = i > pendingStartIdx ? [pendingStartIdx, i] : [i, pendingStartIdx];
    const rangeStart = slots[sIdx];
    const rangeEnd = slots[eIdx];

    // 중간에 disable 포함되면 취소
    if (isSlotDisabled) {
      for (let k = sIdx; k <= eIdx; k++) if (isSlotDisabled(slots[k])) return;
    }

    onChange?.({ start: rangeStart, end: rangeEnd });

    // 내부 상태 초기화 (외부 value가 오면 selected로 표시됨)
    setPendingStartIdx(null);
    setHoverIdx(null);
  };

  const handleMouseEnter = (i: number) => {
    if (pendingStartIdx != null) setHoverIdx(i);
  };

  const handleClear = () => {
    setPendingStartIdx(null);
    setHoverIdx(null);
    onChange?.({ start: new Date(NaN), end: new Date(NaN) }); // 외부에서 null 처리
  };

  return (
    <div className="w-full">
      <Stack spacing={1}>
        {validationError ? (
          <Alert severity="error">{validationError}</Alert>
        ) : (
          <>
            {/* ✅ 현재 선택/프리뷰 텍스트 (시작/종료/기간) */}
            <Typography variant="body2" sx={{ mb: 0.5 }}>
              {currentPreviewStart && currentPreviewEnd ? (
                <>
                  선택: <b>{safeFormatLabel(currentPreviewStart, formatLabel)}</b> ~ <b>{safeFormatLabel(currentPreviewEnd, formatLabel)}</b>{" "}
                  <span className="text-neutral-600 dark:text-neutral-400">
                    (기간: <b>{currentPreviewDurationMinutes}</b>분)
                  </span>
                </>
              ) : pendingStartIdx != null ? (
                <>
                  시작: <b>{safeFormatLabel(slots[pendingStartIdx], formatLabel)}</b> — 종료 배지를 선택하세요
                </>
              ) : (
                <>시작 배지를 선택하세요</>
              )}
            </Typography>

            <div className={` ${gridClassName} `}>
              {slots.map((d, i) => {
                const disabled = isSlotDisabled?.(d) ?? false;
                const selected = selectedIdxes.has(i);
                const isPendingStart = pendingStartIdx === i;

                return (
                  <div key={i} className="flex">
                    <Chip
                      label={safeFormatLabel(d, formatLabel)}
                      onClick={!disabled ? () => handlePickRange(i) : undefined}
                      onMouseEnter={() => handleMouseEnter(i)}
                      clickable={!disabled}
                      variant={selected ? "filled" : "outlined"}
                      color={selected ? "primary" : disabled ? "default" : isPendingStart ? "primary" : "primary"}
                      sx={{
                        height: badgeHeight,
                        width: "100%",
                        borderRadius: "12px",
                        fontWeight: 600,
                        ...(isPendingStart && !selected ? { borderWidth: 2, borderColor: "primary.main" } : {}),
                        // ⭐ 다크 모드 대응: theme 기반 색상 사용
                        "&.MuiChip-filled": {
                          borderWidth: 1,
                          borderStyle: "solid",
                          borderColor: "divider",
                        },
                        "&.MuiChip-outlined": {
                          borderColor: "divider",
                          color: "text.primary",
                        },
                      }}
                      className={[
                        "!justify-center !font-medium",
                        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                        selected ? "shadow-md dark:shadow-neutral-900/60" : "",
                      ].join(" ")}
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* helper & clear */}
        <div className="flex items-center justify-between">
          {helperText ? (
            <Typography variant="caption" color="text.secondary">
              {helperText}
            </Typography>
          ) : null}

          <Button size="small" variant="outlined" onClick={handleClear}>
            선택 초기화
          </Button>
        </div>
      </Stack>
    </div>
  );
}

/* ────────────────────────
 * Demo (Range Only)
 * ──────────────────────── */
export function Demo() {
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);

  const time = (d: Date | null | undefined) =>
    d instanceof Date && Number.isFinite(d.getTime())
      ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "--:--";

  const durationOf = (r: { start: Date; end: Date } | null) =>
    r?.start instanceof Date && r?.end instanceof Date ? diffMinutes(r.start, r.end) : null;

  return (
    <div className="p-4 space-y-4">
      <Typography variant="h6">시작/종료 직접 선택 (Range)</Typography>
      <TimeRangeBadgePicker
        from="09:00"
        to="18:00"
        stepMinutes={30}
        value={range}
        onChange={(r) => {
          if (!(r.start instanceof Date) || isNaN(r.start.getTime())) return setRange(null); // clear
          setRange(r);
        }}
        helperText="첫 클릭: 시작, 두 번째 클릭: 종료(선택 칩 시각 그대로). 같은 칩 다시 클릭 시 선택 초기화."
      />
      <div className="text-sm text-gray-600 dark:text-gray-300">
        {range ? (
          <>
            선택: {time(range.start)} ~ {time(range.end)}{" "}
            <span className="text-neutral-600 dark:text-neutral-400">(기간: {durationOf(range)}분)</span>
          </>
        ) : (
          <>선택 없음</>
        )}
      </div>

      <Divider className="my-2" />
    </div>
  );
}
