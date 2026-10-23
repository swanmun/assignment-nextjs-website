"use client";

import type { Icon as PhosphorIcon } from "@phosphor-icons/react";
import { cx } from "@/lib/cx";
import styles from "./Navigation.module.css";

export type BottomNavigationItem = {
  value: string;
  label: string;
  /**
   * Phosphor 아이콘 컴포넌트. design.pen의 바텀내비게이션은
   * 미선택=아웃라인(regular), 선택=필(fill) 두 형태가 필요해 Phosphor를 사용한다.
   */
  icon: PhosphorIcon;
};

export type BottomNavigationProps = {
  /** 2~5개, 균등 분배 */
  items: BottomNavigationItem[];
  value: string;
  onChange?: (value: string) => void;
  /** 아이콘 아래 레이블(label-md) 표시 여부 */
  showLabels?: boolean;
  className?: string;
};

export const BottomNavigation = ({ items, value, onChange, showLabels = true, className }: BottomNavigationProps) => {
  if (process.env.NODE_ENV !== "production" && (items.length < 2 || items.length > 5)) {
    console.warn(`BottomNavigation 아이템은 2~5개여야 합니다. (현재 ${items.length}개)`);
  }

  return (
    <nav className={cx(styles.bottom, className)} aria-label="주요 메뉴">
      {items.map(({ value: itemValue, label, icon: ItemIcon }) => {
        const selected = itemValue === value;
        return (
          <button
            key={itemValue}
            type="button"
            className={styles.bottomItem}
            aria-current={selected ? "page" : undefined}
            aria-label={showLabels ? undefined : label}
            onClick={() => onChange?.(itemValue)}
          >
            <ItemIcon size={24} weight={selected ? "fill" : "regular"} aria-hidden />
            {showLabels && <span className="typo-label-md">{label}</span>}
          </button>
        );
      })}
    </nav>
  );
};
