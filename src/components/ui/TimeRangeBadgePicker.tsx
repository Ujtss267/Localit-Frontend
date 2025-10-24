import * as React from "react";
import { useMemo } from "react";
import { Chip, Stack, Typography, Alert, Divider, Button } from "@mui/material";

/* ──────────────────────────────────────────────────────────
 * TimeRangeBadgePicker (Dual Mode)
 *  - "duration" (기존): 한 번 클릭 → duration 길이 선택
 *  - "range": 두 번 클릭 → 시작/종료 각각 선택
 *  - hover 프리뷰, 선택요약 텍스트, 재선택/초기화, 안전가드 포함
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

  /** "duration" 모드일 때만 사용: 선택 길이(분) */
  durationMinutes?: number;

  /** 선택 모드: "duration"(한 번 클릭) | "range"(시작/종료 두 번 클릭) */
  selectionMode?: "duration" | "range";

  /** controlled selected range (start, end) */
  value?: { start: Date; end: Date } | null;

  /** callback when selection completed/changed */
  onChange?: (range: { start: Date; end: Date }) => void;

  /** disable specific slots (by start time). If returns true, slot is disabled */
  isSlotDisabled?: (slotStart: Date) => boolean;

  /** include an extra marker right after the end (duration 모드용 시각 경계 마커) */
  includePostEndMarker?: boolean;

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
// Component
// -----------------------------
export default function TimeRangeBadgePicker({
  from,
  to,
  stepMinutes = 30,
  durationMinutes = 60,
  selectionMode = "duration",
  value = null,
  onChange,
  isSlotDisabled,
  includePostEndMarker = true,
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

  // Runtime validation (모드별로 요구사항이 다름)
  const validationError = useMemo(() => {
    if (!start || !end) return "Invalid `from`/`to` (expected Date or 'HH:mm').";
    if (diffMinutes(start, end) < 0) return "`from` must be before `to`.";
    if (!Number.isFinite(stepMinutes) || stepMinutes <= 0) return "`stepMinutes` must be > 0.";
    if (selectionMode === "duration") {
      if (!Number.isFinite(durationMinutes) || (durationMinutes ?? 0) <= 0) return "`durationMinutes` must be > 0 in duration mode.";
    }
    return null;
  }, [start, end, stepMinutes, durationMinutes, selectionMode]);

  // Build all badge times from start ... end inclusive by step
  const slots = useMemo(() => {
    if (validationError) return [] as Date[];
    const out: Date[] = [];
    const total = Math.max(0, diffMinutes(start!, end!));
    const steps = Math.floor(total / stepMinutes);
    for (let i = 0; i <= steps; i++) out.push(addMinutes(start!, i * stepMinutes));
    return out;
  }, [start, end, stepMinutes, validationError]);

  // == duration 모드에서 시각 경계(마커) 개수 계산 ==
  const markersCount = useMemo(() => {
    if (selectionMode !== "duration") return 0;
    const base = Math.max(0, Math.floor((durationMinutes ?? 0) / stepMinutes)) + 1; // inclusive end marker
    return includePostEndMarker ? base + 1 : base; // add one more visual boundary if requested
  }, [durationMinutes, stepMinutes, includePostEndMarker, selectionMode]);

  // == range 모드 내부 상태 ==
  const [pendingStartIdx, setPendingStartIdx] = React.useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = React.useState<number | null>(null);

  // 외부 value를 기반으로 선택 구간 하이라이트 계산
  const selectedIdxes = useMemo(() => {
    const set = new Set<number>();
    if (!slots.length) return set;

    // 1) 완성된 value가 있으면 value로 표시
    if (value?.start instanceof Date && value?.end instanceof Date) {
      const sTime = value.start.getTime();
      const eTime = value.end.getTime();
      if (Number.isFinite(sTime) && Number.isFinite(eTime)) {
        slots.forEach((t, i) => {
          const ts = t.getTime();
          if (selectionMode === "duration") {
            if (ts >= sTime && ts <= eTime) set.add(i); // 기존 로직 유지
          } else {
            // range: end는 "사용자가 고른 종료배지 + step"까지라고 가정
            // 표시상으로는 start~(end-step) 까지 칠해주면 자연스러움
            if (ts >= sTime && ts < eTime) set.add(i);
          }
        });
        return set;
      }
    }

    // 2) range 모드에서 시작만 정해진 상태 + hover 프리뷰
    if (selectionMode === "range" && pendingStartIdx != null) {
      const hi = hoverIdx ?? pendingStartIdx;
      const [a, b] = hi >= pendingStartIdx ? [pendingStartIdx, hi] : [hi, pendingStartIdx];
      for (let i = a; i <= b; i++) set.add(i);
    }

    return set;
  }, [value, slots, selectionMode, pendingStartIdx, hoverIdx]);

  // ✅ Range 모드에서 화면에 보여줄 "현재 선택/프리뷰" 텍스트 계산
  const { currentPreviewStart, currentPreviewEnd } = useMemo(() => {
    let s: Date | null = null;
    let e: Date | null = null;

    if (selectionMode === "range") {
      // 1) 확정된 value 우선
      if (
        value?.start instanceof Date &&
        value?.end instanceof Date &&
        Number.isFinite(value.start.getTime()) &&
        Number.isFinite(value.end.getTime())
      ) {
        s = value.start;
        e = value.end; // end는 "종료 배지 + step"
      } else if (pendingStartIdx != null && slots.length) {
        // 2) 종료 선택 전 프리뷰
        const sIdx = pendingStartIdx;
        const hIdx = hoverIdx ?? pendingStartIdx;
        const [a, b] = hIdx >= sIdx ? [sIdx, hIdx] : [hIdx, sIdx];
        s = slots[a];
        e = addMinutes(slots[b], stepMinutes);
      }
    }
    return { currentPreviewStart: s, currentPreviewEnd: e };
  }, [selectionMode, value, pendingStartIdx, hoverIdx, slots, stepMinutes]);

  // == duration 모드: 기존 한 번 클릭 선택 ==
  const handlePickDuration = (i: number) => {
    if (!slots.length) return;

    const head = i;
    const tail = i + (markersCount - 1);
    if (tail > slots.length) return; // out of range

    const nextStart = slots[head];
    const realEnd = addMinutes(nextStart, durationMinutes!);

    // disabled check across covered markers (excluding the post-end marker)
    const covered = Array.from({ length: markersCount }, (_, k) => head + k)
      .map((idx) => slots[idx])
      .slice(0, includePostEndMarker ? -1 : undefined);

    if (isSlotDisabled && covered.some((d) => isSlotDisabled(d))) return;

    onChange?.({ start: nextStart, end: realEnd });
  };

  // == range 모드: 두 번 클릭(시작 → 종료) ==
  const handlePickRange = (i: number) => {
    if (!slots.length) return;
    if (isSlotDisabled?.(slots[i])) return; // 개별 disable이면 무시

    if (pendingStartIdx == null) {
      // 시작 지정
      setPendingStartIdx(i);
      setHoverIdx(i);
      return;
    }

    if (pendingStartIdx === i) {
      // 같은 칸 재클릭 → 초기화
      setPendingStartIdx(null);
      setHoverIdx(null);
      return;
    }

    // 시작/종료 결정
    const [sIdx, eIdx] = i > pendingStartIdx ? [pendingStartIdx, i] : [i, pendingStartIdx];
    const rangeStart = slots[sIdx];
    const endExclusive = addMinutes(slots[eIdx], stepMinutes); // 종료 배지 + step

    // 중간에 disable 포함되면 취소
    if (isSlotDisabled) {
      for (let k = sIdx; k <= eIdx; k++) if (isSlotDisabled(slots[k])) return;
    }

    onChange?.({ start: rangeStart, end: endExclusive });

    // 내부 상태 초기화 (외부 value가 오면 selected로 표시됨)
    setPendingStartIdx(null);
    setHoverIdx(null);
  };

  const handleClick = (i: number) => {
    if (selectionMode === "duration") handlePickDuration(i);
    else handlePickRange(i);
  };

  const handleMouseEnter = (i: number) => {
    if (selectionMode === "range" && pendingStartIdx != null) setHoverIdx(i);
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
            {/* ✅ Range 모드: 현재 선택/프리뷰 텍스트 */}
            {selectionMode === "range" && (
              <Typography variant="body2" sx={{ mb: 0.5 }}>
                {currentPreviewStart && currentPreviewEnd ? (
                  <>
                    선택: <b>{safeFormatLabel(currentPreviewStart, formatLabel)}</b> ~ <b>{safeFormatLabel(currentPreviewEnd, formatLabel)}</b>
                  </>
                ) : pendingStartIdx != null ? (
                  <>
                    시작: <b>{safeFormatLabel(slots[pendingStartIdx], formatLabel)}</b> — 종료 배지를 선택하세요
                  </>
                ) : (
                  <>시작 배지를 선택하세요</>
                )}
              </Typography>
            )}

            <div className={` ${gridClassName} `}>
              {slots.map((d, i) => {
                const disabled = isSlotDisabled?.(d) ?? false;
                const selected = selectedIdxes.has(i);
                const isPendingStart = selectionMode === "range" && pendingStartIdx === i;

                return (
                  <div key={i} className="flex">
                    <Chip
                      label={safeFormatLabel(d, formatLabel)}
                      onClick={!disabled ? () => handleClick(i) : undefined}
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
                        // ✅ filled에도 테두리 보이게
                        "&.MuiChip-filled": {
                          border: "2px solid rgba(0,0,0,0.2)",
                        },
                        // ✅ outlined는 검정 테두리/텍스트
                        "&.MuiChip-outlined": {
                          borderColor: "#000",
                          color: "#000",
                        },
                      }}
                      className={[
                        "!justify-center !font-medium",
                        disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer",
                        selected ? "shadow-md" : "",
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

          {selectionMode === "range" && (
            <Button size="small" variant="outlined" onClick={handleClear}>
              선택 초기화
            </Button>
          )}
        </div>
      </Stack>
    </div>
  );
}

/* ────────────────────────
 * Demo
 * ──────────────────────── */
export function Demo() {
  const [range1, setRange1] = React.useState<{ start: Date; end: Date } | null>(null);
  const [range2, setRange2] = React.useState<{ start: Date; end: Date } | null>(null);

  const time = (d: Date | null | undefined) =>
    d instanceof Date && Number.isFinite(d.getTime())
      ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "--:--";

  return (
    <div className="p-4 space-y-4">
      <Typography variant="h6">A) 기존 Duration 모드</Typography>
      <TimeRangeBadgePicker
        from="09:00"
        to="18:00"
        stepMinutes={30}
        durationMinutes={90}
        selectionMode="duration"
        value={range1}
        onChange={(r) => setRange1(r)}
        helperText="배지를 클릭하면 설정된 기간만큼 선택됩니다."
      />
      <div className="text-sm text-gray-600">
        {range1 ? (
          <>
            선택: {time(range1.start)} ~ {time(range1.end)}
          </>
        ) : (
          <>선택 없음</>
        )}
      </div>

      <Divider className="my-2" />

      <Typography variant="h6">B) 시작/종료 직접 선택 (Range 모드)</Typography>
      <TimeRangeBadgePicker
        from="09:00"
        to="18:00"
        stepMinutes={30}
        selectionMode="range"
        value={range2}
        onChange={(r) => {
          // NaN → 외부에서 null 처리 (clear 버튼 동작 등)
          if (!(r.start instanceof Date) || isNaN(r.start.getTime())) return setRange2(null);
          setRange2(r);
        }}
        helperText="첫 클릭: 시작, 두 번째 클릭: 종료(해당 배지 시각 + 30분). 같은 배지 다시 클릭 시 선택 초기화."
      />
      <div className="text-sm text-gray-600">
        {range2 ? (
          <>
            선택: {time(range2.start)} ~ {time(range2.end)}
          </>
        ) : (
          <>선택 없음</>
        )}
      </div>
    </div>
  );
}
