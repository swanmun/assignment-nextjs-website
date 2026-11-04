import { cx } from "@/lib/cx";
import styles from "./PromoBanner.module.css";

export type PromoBannerProps = {
  /** 배너를 눌렀을 때 갈 주소. 배너 전체가 링크 하나다. 없으면 링크 없이 이미지만 보여 준다(상품 상세 대표 이미지). */
  href?: string;
  /** 문구·버튼이 들어 있는 배너 이미지 한 장. 디더링하지 않은 원본 색 그대로 쓴다. */
  imageSrc: string;
  /** 이미지 안 문구를 그대로 옮긴 대체 텍스트 */
  alt: string;
  className?: string;
};

/**
 * 광고 배너. 같은 이미지 한 장으로 768px 기준 비율만 바꾼다.
 * 모바일(1.875:1)은 가운데를 잘라 문구가 읽히게, 768px 이상(3.08:1)은 이미지 전체를 보여준다.
 */
export const PromoBanner = ({ href, imageSrc, alt, className }: PromoBannerProps) => {
  // eslint-disable-next-line @next/next/no-img-element -- 디자인 시스템 컴포넌트는 이미지 로더에 의존하지 않는다
  const image = <img src={imageSrc} alt={alt} className={styles.image} />;
  return href ? (
    <a href={href} className={cx(styles.banner, className)}>
      {image}
    </a>
  ) : (
    <div className={cx(styles.banner, className)}>{image}</div>
  );
};
