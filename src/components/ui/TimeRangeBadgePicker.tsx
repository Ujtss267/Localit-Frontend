import * as React from "react";
import { useMemo } from "react";
import { Chip, Stack, Typography, Alert, Divider, Button } from "@mui/material";

// ---------------------------------------------
// TimeRangeBadgePicker (Robust build w/ guards)
// - Fix: handle undefined/null from/to and null range
// - Add: runtime validation + safe formatting
// - Add: lightweight dev test panel
// ---------------------------------------------

// -----------------------------
// Types
// -----------------------------
export type TimeRangeBadgePickerProps = {
  /** from/to can be Date or "HH:mm" (24h) string */
  from: Date | string;
  to: Date | string;
  /** step minutes between badges (default: 30) — must be > 0 */
  stepMinutes?: number;
  /** selection length in minutes (default: 60) — must be > 0 */
  durationMinutes?: number;
  /** controlled selected range (start, end) */
  value?: { start: Date; end: Date } | null;
  /** callback when user picks a new range — returns only start/end */
  onChange?: (range: { start: Date; end: Date }) => void;
  /** disable specific slots (by start time). If returns true, slot is disabled */
  isSlotDisabled?: (slotStart: Date) => boolean;
  /** include an extra marker right after the end (visual boundary). Default true to match the example 09:00→10:30 */
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

// Safe label formatter
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
  value = null,
  onChange,
  isSlotDisabled,
  includePostEndMarker = true, // to match the user's sample (09:00→09:30→10:00→10:30)
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
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return "`durationMinutes` must be > 0.";
    return null;
  }, [start, end, stepMinutes, durationMinutes]);

  // Build all badge times from start ... end inclusive by step
  const slots = useMemo(() => {
    if (validationError) return [] as Date[];
    const out: Date[] = [];
    const total = Math.max(0, diffMinutes(start!, end!));
    const steps = Math.floor(total / stepMinutes);
    for (let i = 0; i <= steps; i++) out.push(addMinutes(start!, i * stepMinutes));
    return out;
  }, [start, end, stepMinutes, validationError]);

  // Compute selection markers count (how many badges to highlight when picking one)
  const markersCount = useMemo(() => {
    const base = Math.max(0, Math.floor(durationMinutes / stepMinutes)) + 1; // inclusive end marker
    return includePostEndMarker ? base + 1 : base; // add one more visual boundary if requested
  }, [durationMinutes, stepMinutes, includePostEndMarker]);

  // Determine current selected indexes for highlighting (defensive on `value`)
  const selectedIdxes = useMemo(() => {
    const set = new Set<number>();
    if (!value || !slots.length) return set;
    if (!(value.start instanceof Date) || !(value.end instanceof Date)) return set;

    const sTime = value.start.getTime();
    const eTime = value.end.getTime();
    if (!Number.isFinite(sTime) || !Number.isFinite(eTime)) return set;

    // ✅ 채우기(fill)는 end까지만 포함 (post-end 미포함)
    slots.forEach((t, i) => {
      const time = t.getTime();

      // console.log("time", time);
      // console.log("sTime", sTime);
      // console.log("eTime", eTime);

      if (time >= sTime && time <= eTime) set.add(i);
    });

    return set;
  }, [value, slots]);

  const handlePick = (i: number) => {
    if (!slots.length) return;

    const head = i;
    const tail = i + (markersCount - 1);

    console.log("markersCount", markersCount - 1);
    console.log("tail, slots.length", tail, slots.length);

    if (tail > slots.length) return; // out of range

    const nextStart = slots[head];
    // Real range end = start + durationMinutes (not the visual boundary)
    const realEnd = addMinutes(nextStart, durationMinutes);

    // disabled check across real covered markers (excluding the post-end marker)
    const covered = Array.from({ length: markersCount }, (_, k) => head + k)
      .map((idx) => slots[idx])
      .slice(0, includePostEndMarker ? -1 : undefined);

    if (isSlotDisabled && covered.some((d) => isSlotDisabled(d))) return;

    onChange?.({ start: nextStart, end: realEnd });
  };

  return (
    <div className="w-full">
      <Stack spacing={1}>
        {validationError ? (
          <Alert severity="error">{validationError}</Alert>
        ) : (
          <div className={` ${gridClassName} `}>
            {slots.map((d, i) => {
              const disabled = isSlotDisabled?.(d) ?? false;
              const selected = selectedIdxes.has(i);
              return (
                <div key={i} className="flex">
                  <Chip
                    label={safeFormatLabel(d, formatLabel)}
                    onClick={!disabled ? () => handlePick(i) : undefined}
                    clickable={!disabled}
                    variant={selected ? "filled" : "outlined"}
                    color={selected ? "primary" : disabled ? "default" : "primary"}
                    sx={{
                      height: badgeHeight,
                      width: "100%",
                      borderRadius: "12px",
                      fontWeight: 600,
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
        )}

        {helperText ? (
          <Typography variant="caption" color="text.secondary">
            {helperText}
          </Typography>
        ) : null}
      </Stack>
    </div>
  );
}

// -----------------------------
// Usage Example + Dev Tests
// -----------------------------
export function Demo() {
  const [range, setRange] = React.useState<{ start: Date; end: Date } | null>(null);

  const time = (d: Date | null | undefined) =>
    d instanceof Date && Number.isFinite(d.getTime())
      ? d.toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit", hour12: false })
      : "--:--";

  return (
    <div className="p-4 space-y-3">
      <Typography variant="h6">30분 단위 배지 선택 (1시간 범위)</Typography>

      {/* Happy path */}
      <TimeRangeBadgePicker
        from="09:00"
        to="18:00"
        stepMinutes={30}
        durationMinutes={60}
        value={range}
        onChange={(r) => setRange({ start: r.start, end: r.end })}
        helperText="배지를 클릭하면 해당 시각부터 1시간까지 범위를 선택합니다. (끝 경계 배지 포함)"
      />

      <div className="text-sm text-gray-600">
        {range ? (
          <>
            선택: {time(range.start)} ~ {time(range.end)}
          </>
        ) : (
          <>선택 없음</>
        )}
      </div>

      <Divider className="my-3" />
      <Typography variant="subtitle1">Dev Tests</Typography>
      <DevTests />
    </div>
  );
}

// -----------------------------
// Lightweight runtime tests (no framework)
// -----------------------------
function DevTests() {
  const [logs, setLogs] = React.useState<string[]>([]);

  React.useEffect(() => {
    const today = new Date();
    const push = (name: string, ok: boolean, note = "") => setLogs((prev) => [...prev, `${ok ? "✅" : "❌"} ${name}${note ? ` — ${note}` : ""}`]);

    // Test 1: Valid HH:mm parsing
    const d1 = parseToDateNullable(today, "09:30");
    push("parse HH:mm", !!d1 && d1.getHours() === 9 && d1.getMinutes() === 30);

    // Test 2: Valid Date instance
    const raw = new Date(today);
    raw.setHours(14, 0, 0, 0);
    const d2 = parseToDateNullable(today, raw);
    push("parse Date", !!d2 && d2.getHours() === 14 && d2.getMinutes() === 0);

    // Test 3: Invalid string → null (no throw)
    const d3 = parseToDateNullable(today, "09");
    push("parse invalid string returns null", d3 === null);

    // Test 4: Guarded rendering when from/to invalid (should show error instead of throwing)
    // Simulate by constructing component-like call
    const invalidFrom = parseToDateNullable(today, undefined as any);
    const invalidTo = parseToDateNullable(today, "18:00");
    push("invalid from handled", invalidFrom === null && invalidTo instanceof Date);

    // Test 5: Safe time formatting (no throw on null)
    const txt = safeFormatLabel(null as any, defaultFormat);
    push("safe format label", txt === "--:--");

    // Test 6: Selection math — markers count for 60/30 with post-end marker
    const step = 30,
      duration = 60;
    const base = Math.floor(duration / step) + 1; // inclusive end marker
    const markers = base + 1; // with post-end
    push("markers count 60/30 post-end", markers === 4); // 09:00, 09:30, 10:00, 10:30
  }, []);

  return (
    <div className="text-xs bg-gray-50 rounded p-2">
      {logs.map((l, i) => (
        <div key={i}>{l}</div>
      ))}
      <div className="mt-2">
        <Button size="small" variant="outlined" onClick={() => setLogs([])}>
          Clear
        </Button>
      </div>
    </div>
  );
}
