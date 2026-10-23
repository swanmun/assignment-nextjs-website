import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/icon/Icon";
import type { FieldSize } from "@/components/text-field/TextField";
import { cx } from "@/lib/cx";
import styles from "./SelectItem.module.css";

const ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

export type SelectItemProps = ComponentPropsWithoutRef<"li"> & {
  /** 참조하는 셀렉트의 사이즈를 따른다. */
  size?: FieldSize;
  selected?: boolean;
  disabled?: boolean;
  /** 키보드 탐색으로 가리키고 있는 항목 */
  active?: boolean;
};

export const SelectItem = ({
  size = "md",
  selected = false,
  disabled = false,
  active = false,
  className,
  children,
  ...rest
}: SelectItemProps) => (
  <li
    role="option"
    aria-selected={selected}
    aria-disabled={disabled || undefined}
    className={cx(
      styles.item,
      styles[size],
      selected && styles.selected,
      disabled && styles.disabled,
      active && styles.active,
      className,
    )}
    {...rest}
  >
    <span className={`${styles.text} typo-body-lg`}>{children}</span>
    {selected && <Icon name="check" size={ICON_SIZE[size]} />}
  </li>
);
