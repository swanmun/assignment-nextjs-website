import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./Fieldset.module.css";

export type FieldsetProps = ComponentPropsWithoutRef<"fieldset"> & {
  /** 테두리 위 제목(label-md) */
  legend: ReactNode;
  /** 내용 간격 8px (기본 12px) */
  compact?: boolean;
};

/** 관련 정보를 묶는 그룹 상자 (주소·지도·닉네임 등) */
export const Fieldset = ({ legend, compact = false, className, children, ...rest }: FieldsetProps) => (
  <fieldset className={cx(styles.fieldset, compact && styles.compact, className)} {...rest}>
    <legend className={`${styles.legend} typo-label-md`}>{legend}</legend>
    {children}
  </fieldset>
);
