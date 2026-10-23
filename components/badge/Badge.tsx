import type { ComponentPropsWithoutRef } from "react";
import { cx } from "@/lib/cx";
import styles from "./Badge.module.css";

export const BADGE_TONES = ["neutral", "success", "error", "info", "warning"] as const;
export const BADGE_SIZES = ["md", "lg"] as const;

export type BadgeTone = (typeof BADGE_TONES)[number];
export type BadgeSize = (typeof BADGE_SIZES)[number];

export type BadgeProps = ComponentPropsWithoutRef<"span"> & {
  tone?: BadgeTone;
  /** md: 20px · lg: 24px */
  size?: BadgeSize;
};

/** 상태·수량 표시용 라벨(label-md) */
export const Badge = ({ tone = "neutral", size = "md", className, ...rest }: BadgeProps) => (
  <span className={cx(styles.badge, styles[tone], styles[size], "typo-label-md", className)} {...rest} />
);
