"use client";

import { useRef, type KeyboardEvent } from "react";
import { cx } from "@/lib/cx";
import styles from "./Navigation.module.css";

export type TabItem = {
  value: string;
  label: string;
};

export type TabNavigationProps = {
  /** 2개 이상, 균등 분배 */
  items: TabItem[];
  value: string;
  onChange?: (value: string) => void;
  /** 각 탭이 제어하는 tabpanel id를 만들 때 쓰는 접두사 */
  idPrefix?: string;
  "aria-label"?: string;
  className?: string;
};

/** 높이 48px · 선택 탭 하단 2px 인디케이터 */
export const TabNavigation = ({ items, value, onChange, idPrefix, className, ...rest }: TabNavigationProps) => {
  const listRef = useRef<HTMLDivElement>(null);

  // 좌우 화살표로 탭 이동 (WAI-ARIA Tabs 패턴)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    const index = items.findIndex((item) => item.value === value);
    const next = items[(index + (event.key === "ArrowRight" ? 1 : -1) + items.length) % items.length];
    onChange?.(next.value);
    listRef.current?.querySelector<HTMLButtonElement>(`[data-value="${next.value}"]`)?.focus();
  };

  return (
    <div ref={listRef} role="tablist" className={cx(styles.tabs, className)} onKeyDown={onKeyDown} {...rest}>
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            data-value={item.value}
            id={idPrefix ? `${idPrefix}-tab-${item.value}` : undefined}
            aria-controls={idPrefix ? `${idPrefix}-panel-${item.value}` : undefined}
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            className={styles.tab}
            onClick={() => onChange?.(item.value)}
          >
            <span className={`${styles.tabLabel} typo-label-lg`}>{item.label}</span>
            <span className={styles.indicator} aria-hidden />
          </button>
        );
      })}
    </div>
  );
};
