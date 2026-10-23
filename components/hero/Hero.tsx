import type { CSSProperties, ReactNode } from "react";
import { Badge } from "@/components/badge/Badge";
import { cx } from "@/lib/cx";
import styles from "./Hero.module.css";

export type HeroProps = {
  /** 디더링 처리된 배경 이미지 (모바일) */
  imageUrl: string;
  /** 태블릿 이상(768px~)에서 쓸 가로로 긴 이미지. 디더링 점 크기를 화면 크기와 맞추기 위해 따로 둔다. */
  wideImageUrl?: string;
  /** 왼쪽 위 상황 배지 (neutral · lg) */
  badge?: string;
  /** 헤드라인. 줄바꿈(\n)을 그대로 표시한다. */
  headline: ReactNode;
  /** md: 200px · heading-md / lg: 240px · display-sm (태블릿 이상에서 40px 커진다) */
  size?: "md" | "lg";
  /** 내용 정렬 기준 너비 (기본 레이아웃 최대 너비) */
  contentWidth?: string;
  className?: string;
};

/** 가로 전체 이미지 위에 배지와 헤드라인을 얹은 상단 영역 */
export const Hero = ({ imageUrl, wideImageUrl, badge, headline, size = "md", contentWidth, className }: HeroProps) => (
  <section className={cx(styles.hero, styles[size], className)}>
    <picture>
      {wideImageUrl && <source media="(min-width: 768px)" srcSet={wideImageUrl} />}
      <img src={imageUrl} alt="" className={styles.image} />
    </picture>
    <div className={styles.inner} style={contentWidth ? ({ "--hero-content-width": contentWidth } as CSSProperties) : undefined}>
      {badge && (
        <Badge tone="neutral" size="lg">
          {badge}
        </Badge>
      )}
      <h2 className={cx(styles.headline, size === "lg" ? "typo-display-sm" : "typo-heading-md")}>{headline}</h2>
    </div>
  </section>
);
