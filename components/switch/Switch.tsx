import type { ComponentPropsWithoutRef, ReactNode } from "react";
import shared from "@/components/checkbox/Checkbox.module.css";
import type { ControlSize } from "@/components/checkbox/Checkbox";
import { cx } from "@/lib/cx";
import styles from "./Switch.module.css";

export type SwitchProps = Omit<ComponentPropsWithoutRef<"input">, "type" | "size" | "role"> & {
  label: ReactNode;
  /** sm: 32×16 · md: 40×20 */
  size?: ControlSize;
};

/** 단독 사용 전용 on/off 토글 */
export const Switch = ({ label, size = "md", className, ...rest }: SwitchProps) => (
  <label className={cx(shared.root, styles[size], className)}>
    <input type="checkbox" role="switch" className={cx(shared.input, styles.input)} {...rest} />
    <span className={styles.track} aria-hidden>
      <span className={styles.thumb} />
    </span>
    <span className="typo-body-md">{label}</span>
  </label>
);
