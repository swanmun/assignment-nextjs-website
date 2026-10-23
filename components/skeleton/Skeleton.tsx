import type { CSSProperties } from "react";
import { cx } from "@/lib/cx";
import styles from "./Skeleton.module.css";

export const SKELETON_SHAPES = ["text", "rect", "circle"] as const;
export type SkeletonShape = (typeof SKELETON_SHAPES)[number];

type Length = number | string;

export type SkeletonProps = {
  shape?: SkeletonShape;
  /** text·rect 너비 (기본: text 100%, rect 72px) */
  width?: Length;
  /** text: 대상 텍스트의 행 높이, rect: 대상 요소의 높이 */
  height?: Length;
  /** circle: 대상 요소의 지름 */
  size?: Length;
  className?: string;
  style?: CSSProperties;
};

const DEFAULTS: Record<SkeletonShape, { width: Length; height: Length }> = {
  text: { width: "100%", height: 20 },
  rect: { width: 72, height: 72 },
  circle: { width: 40, height: 40 },
};

/** 콘텐츠 로딩 자리표시자. 뉴트럴 도트 패턴으로 채운다. */
export const Skeleton = ({ shape = "text", width, height, size, className, style }: SkeletonProps) => {
  const base = DEFAULTS[shape];
  const dimensions =
    shape === "circle"
      ? { width: size ?? base.width, height: size ?? base.height }
      : { width: width ?? base.width, height: height ?? base.height };

  return (
    <span aria-hidden className={cx(styles.skeleton, shape === "circle" && styles.circle, className)} style={{ ...dimensions, ...style }} />
  );
};
