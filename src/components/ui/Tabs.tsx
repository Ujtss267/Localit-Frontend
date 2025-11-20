// src/components/ui/Tabs.tsx
import * as React from "react";

export type TabsValue = string;

export type TabsOption<T extends TabsValue = TabsValue> = {
  value: T;
  label: React.ReactNode;
  badge?: React.ReactNode;
};

export type TabsProps<T extends TabsValue = TabsValue> = {
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>;
  tabs: TabsOption<T>[];
  className?: string;
  fullWidth?: boolean;
  size?: "sm" | "md" | "lg";
};

export function Tabs<T extends TabsValue>({ value, onChange, tabs, className = "", fullWidth = false, size = "md" }: TabsProps<T>) {
  // 📌 세련된 바탕 스타일
  const baseContainer =
    "inline-flex items-center gap-1 rounded-2xl border bg-neutral-50 " + // 밝은 그레이
    "p-1 border-neutral-200 shadow-sm " + // 약간의 실루엣
    "dark:bg-neutral-800/60 dark:border-neutral-700 dark:backdrop-blur-sm"; // 다크모드: 반투명 + Blur

  // 📌 더 넉넉한 폰트/패딩
  const fontSize = size === "sm" ? "text-sm" : size === "md" ? "text-base" : "text-lg";

  const buttonPadding = size === "sm" ? "px-4 py-2" : size === "md" ? "px-5 py-2.5" : "px-6 py-3";

  return (
    <div className={`${baseContainer} ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;

        const baseBtn =
          `flex items-center justify-center rounded-xl font-medium select-none whitespace-nowrap ${fontSize} ${buttonPadding} transition-all ` +
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
          "focus-visible:ring-neutral-900 focus-visible:ring-offset-white " +
          "dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900";

        // 📌 활성 스타일 대폭 개선
        const activeClass = active
          ? "bg-neutral-900 text-white shadow-sm " + // 라이트: 고급스러운 다크톤
            "dark:bg-neutral-100 dark:text-neutral-900 dark:shadow-sm" // 다크: 밝은 하이라이트
          : "text-neutral-700 hover:bg-neutral-200 " + // 라이트: 호버 강조
            "dark:text-neutral-300 dark:hover:bg-neutral-700/60";

        const widthClass = fullWidth ? "flex-1" : "";

        return (
          <button key={String(t.value)} type="button" onClick={() => onChange(t.value)} className={`${baseBtn} ${activeClass} ${widthClass}`}>
            <span>{t.label}</span>

            {t.badge ? (
              <span
                className={
                  "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-[11px] " + "bg-neutral-900/10 text-inherit " + "dark:bg-white/10"
                }
              >
                {t.badge}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
