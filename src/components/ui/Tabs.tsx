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
  onChange: (value: T) => void;
  tabs: TabsOption<T>[];
  className?: string;
  fullWidth?: boolean; // true면 각 탭이 균등 분할
  size?: "sm" | "md";
};

export function Tabs<T extends TabsValue>({ value, onChange, tabs, className = "", fullWidth = false, size = "md" }: TabsProps<T>) {
  const baseContainer = "inline-flex items-center gap-1 rounded-2xl border bg-white p-1";
  const sizeClass = size === "sm" ? "text-xs" : "text-sm";

  return (
    <div className={`${baseContainer} ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;
        const baseBtn = "flex items-center justify-center rounded-xl px-4 py-2 font-medium transition";
        const activeClass = active ? "bg-black text-white" : "text-neutral-700 hover:bg-gray-100";
        const widthClass = fullWidth ? "flex-1" : "";

        return (
          <button
            key={String(t.value)}
            type="button"
            onClick={() => onChange(t.value)}
            className={`${baseBtn} ${activeClass} ${widthClass} ${sizeClass}`}
          >
            <span>{t.label}</span>
            {t.badge ? <span className="ml-1 inline-flex items-center rounded-full bg-white/10 px-1.5 text-[11px]">{t.badge}</span> : null}
          </button>
        );
      })}
    </div>
  );
}

export default Tabs;
