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
  const baseContainer = "inline-flex items-center gap-1 rounded-2xl border p-1 shadow-sm bg-neutral-900/80 border-neutral-700 backdrop-blur-sm";

  // 📌 더 넉넉한 폰트/패딩
  const fontSize = size === "lg" ? "text-base" : "text-sm";

  const buttonPadding = size === "lg" ? "px-6 min-h-12" : size === "md" ? "px-5 min-h-11" : "px-4 min-h-11";

  return (
    <div className={`${baseContainer} ${className}`}>
      {tabs.map((t) => {
        const active = t.value === value;

        const baseBtn =
          `flex items-center justify-center rounded-xl font-medium select-none whitespace-nowrap ${fontSize} ${buttonPadding} transition-all ` +
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 " +
          "focus-visible:ring-neutral-100 focus-visible:ring-offset-neutral-900";

        const activeClass = active
          ? "bg-neutral-200/20 text-neutral-100 shadow-sm"
          : "text-neutral-300 hover:bg-neutral-700/60";

        const widthClass = fullWidth ? "flex-1" : "";

        return (
          <button key={String(t.value)} type="button" onClick={() => onChange(t.value)} className={`${baseBtn} ${activeClass} ${widthClass}`}>
            <span>{t.label}</span>

            {t.badge ? (
              <span
                className={
                  "ml-1 inline-flex items-center rounded-full px-2 py-0.5 text-xs bg-neutral-700/70 text-inherit"
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
