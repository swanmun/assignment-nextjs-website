"use client";

import { useEffect, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Checkbox.module.css";

export const CONTROL_SIZES = ["sm", "md"] as const;
export type ControlSize = (typeof CONTROL_SIZES)[number];

export type CheckboxProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "size"> & {
  label: ReactNode;
  size?: ControlSize;
  /** 일부만 선택된 상태(전체 선택 등). checked보다 우선해서 대시를 표시한다. */
  indeterminate?: boolean;
  /** 에러 상태(빨간 테두리). 메시지는 CheckboxGroup에서 한 번만 표시한다. */
  error?: boolean;
};

export const Checkbox = ({ label, size = "md", indeterminate = false, error = false, className, ...rest }: CheckboxProps) => {
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label className={cx(styles.root, styles[size], error && styles.error, className)}>
      <input
        ref={ref}
        type="checkbox"
        className={styles.input}
        aria-invalid={error || undefined}
        aria-checked={indeterminate ? "mixed" : undefined}
        {...rest}
      />
      {/* design.pen: 아이코노그래피 아이콘을 쓰지 않고 직접 그린 체크 */}
      <span className={styles.box} aria-hidden>
        <svg className={styles.check} viewBox="0 0 14 14" fill="none">
          <path d="M2 7.5l3.5 3.5 6.5-7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="square" />
        </svg>
        <span className={styles.dash} />
      </span>
      <span className="typo-body-md">{label}</span>
    </label>
  );
};

export type CheckboxGroupProps = {
  /** 그룹 제목(fieldset legend) */
  label?: ReactNode;
  /** 그룹 전체 에러 메시지. 그룹 아래에 한 번만 표시한다. */
  error?: string;
  direction?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

export const CheckboxGroup = ({ label, error, direction = "vertical", className, children }: CheckboxGroupProps) => (
  <fieldset className={cx(styles.group, className)} aria-invalid={error ? true : undefined}>
    {label && <legend className={`${styles.legend} typo-label-lg`}>{label}</legend>}
    <div className={cx(styles.items, direction === "horizontal" && styles.horizontal)}>{children}</div>
    {error && (
      <p className={`${styles.groupError} typo-label-md`} role="alert">
        <Icon name="error" size={16} />
        {error}
      </p>
    )}
  </fieldset>
);
