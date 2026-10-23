"use client";

import { createContext, useContext, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import shared from "@/components/checkbox/Checkbox.module.css";
import type { ControlSize } from "@/components/checkbox/Checkbox";
import { cx } from "@/lib/cx";
import styles from "./Radio.module.css";

type RadioGroupContextValue = {
  name: string;
  value?: string;
  size: ControlSize;
  disabled?: boolean;
  onChange?: (value: string) => void;
};

const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export type RadioProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "name" | "onChange" | "checked"> & {
  value: string;
  label: ReactNode;
};

/** 단독 사용 금지 — 반드시 RadioGroup 안에서 쓴다. */
export const Radio = ({ value, label, disabled, className, ...rest }: RadioProps) => {
  const group = useContext(RadioGroupContext);
  if (!group) throw new Error("Radio는 RadioGroup 안에서만 사용할 수 있습니다.");

  return (
    <label className={cx(shared.root, styles[group.size], className)}>
      <input
        type="radio"
        name={group.name}
        value={value}
        checked={group.value === undefined ? undefined : group.value === value}
        disabled={group.disabled || disabled}
        onChange={() => group.onChange?.(value)}
        className={cx(shared.input, styles.input)}
        {...rest}
      />
      <span className={styles.control} aria-hidden>
        <span className={styles.dot} />
      </span>
      <span className="typo-body-md">{label}</span>
    </label>
  );
};

export type RadioGroupProps = {
  /** 그룹 제목(radiogroup 이름) */
  label: ReactNode;
  /** 시각적으로 제목을 숨길지 여부 */
  hideLabel?: boolean;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  size?: ControlSize;
  disabled?: boolean;
  direction?: "vertical" | "horizontal";
  className?: string;
  children: ReactNode;
};

export const RadioGroup = ({
  label,
  hideLabel = false,
  name,
  value,
  onChange,
  size = "md",
  disabled,
  direction = "vertical",
  className,
  children,
}: RadioGroupProps) => {
  const autoName = useId();
  return (
    <fieldset className={cx(shared.group, className)}>
      <legend className={cx(shared.legend, "typo-label-lg", hideLabel && "sr-only")}>{label}</legend>
      <div role="radiogroup" className={cx(shared.items, direction === "horizontal" && shared.horizontal)}>
        <RadioGroupContext.Provider value={{ name: name ?? autoName, value, size, disabled, onChange }}>
          {children}
        </RadioGroupContext.Provider>
      </div>
    </fieldset>
  );
};
