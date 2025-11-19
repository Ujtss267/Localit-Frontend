// src/components/ui/Tabs.tsx
import * as React from "react";

export type TabsValue = string;

export type TabsOption<T extends TabsValue = TabsValue> = {
  value: T;
  label: React.ReactNode;
  badge?: React.ReactNode; // 필요하면 카운트 뱃지 등도 같이 넣을 수 있게
};

export type TabsProps<T extends TabsValue = TabsValue> = {
  value: T;
  onChange: React.Dispatch<React.SetStateAction<T>>;
  tabs: TabsOption<T>[];
  className?: string;
  fullWidth?: boolean; // true면 각 탭이 균등 분할
  size?: "sm" | "md";
};

export function Tabs<T extends TabsValue>({ value, onChange, tabs, className = "", fullWidth = false, size = "md" }: TabsProps<T>) {
  // 컨테이너: 라이트/다크에서 모두 자연스럽게 보이도록 배경/테두리 조정
  const baseContainer =
    "inline-flex items-center gap-1 rounded-2xl border bg-white p-1 " + "border-neutral-200 " + "dark:bg-neutral-900 dark:border-neutral-700";

  const sizeClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`${baseContainer} ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;

        const baseBtn =
          "flex items-center justify-center rounded-xl px-4 py-2 font-medium transition " +
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
          "focus-visible:ring-neutral-900 focus-visible:ring-offset-white " +
          "dark:focus-visible:ring-neutral-100 dark:focus-visible:ring-offset-neutral-900";

        // ✅ 활성 탭: 라이트에선 검정배경/흰글씨, 다크에선 흰배경/어두운 글씨로 반전
        const activeClass = active
          ? "bg-black text-white dark:bg-white dark:text-neutral-900"
          : "text-neutral-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-800";

        const widthClass = fullWidth ? "flex-1" : "";

        return (
          <button
            key={String(t.value)}
            type="button"
            onClick={() => onChange(t.value)}
            className={`${baseBtn} ${activeClass} ${widthClass} ${sizeClass}`}
          >
            <span>{t.label}</span>
            {t.badge ? (
              <span className={"ml-1 inline-flex items-center rounded-full px-1.5 text-[11px] " + "bg-black/10 text-inherit " + "dark:bg-white/10"}>
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
