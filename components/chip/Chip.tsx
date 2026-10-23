import type { ComponentPropsWithoutRef } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Chip.module.css";

export const CHIP_SIZES = ["sm", "md"] as const;
export type ChipSize = (typeof CHIP_SIZES)[number];

export type ChipProps = Omit<ComponentPropsWithoutRef<"button">, "aria-pressed"> & {
  selected?: boolean;
  /** sm: 24px · md: 32px */
  size?: ChipSize;
  /** 레이블 왼쪽 아이콘(16px) */
  icon?: IconName;
};

/** 필터·태그 선택용 토글 칩 */
export const Chip = ({ selected = false, size = "md", icon, type = "button", className, children, ...rest }: ChipProps) => (
  <button
    type={type}
    aria-pressed={selected}
    className={cx(styles.chip, styles[size], icon && styles.withIcon, selected && styles.selected, "typo-label-lg", className)}
    {...rest}
  >
    {icon && <Icon name={icon} size={16} />}
    {children}
  </button>
);
