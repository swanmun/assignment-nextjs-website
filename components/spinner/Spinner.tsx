import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./Spinner.module.css";

export type SpinnerProps = {
  /** 지름(px). 기본 md(24). 버튼 안에서는 아이콘 크기(16·20)로 줄여 쓴다. */
  size?: number;
  /** 기본은 브랜드 컬러. 브랜드 배경 위에서는 currentColor 등으로 바꾼다. */
  color?: string;
  /** 스크린리더에 읽힐 문구. 빈 문자열이면 장식용으로 숨긴다. */
  label?: string;
  className?: string;
};

export const Spinner = ({ size = 24, color = "var(--color-text-brand)", label = "로딩 중", className }: SpinnerProps) => (
  <span
    role={label ? "status" : undefined}
    aria-label={label || undefined}
    aria-hidden={label ? undefined : true}
    className={cx(styles.spinner, className)}
    style={{ "--spinner-size": `${size}px`, color } as CSSProperties}
  />
);
