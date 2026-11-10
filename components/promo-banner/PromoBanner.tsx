import { ResponsiveImage } from "@/components/responsive-image/ResponsiveImage";
import { cx } from "@/lib/cx";
import styles from "./PromoBanner.module.css";

export type PromoBannerProps = {
  /** 배너를 눌렀을 때 갈 주소. 배너 전체가 링크 하나다. 없으면 링크 없이 이미지만 보여 준다(상품 상세 대표 이미지). */
  href?: string;
  /** 문구·버튼이 들어 있는 배너 이미지(lg, 1024×332). 디더링하지 않은 원본 색 그대로 쓴다. */
  imageSrc: string;
  /**
   * 모바일·태블릿용 배너 이미지(md, 1.875:1로 미리 자른 이미지).
   * 주면 1024px 미만은 md를 1.875:1로, 1024px 이상은 lg를 3.08:1로 보여 준다.
   * 없으면 lg 한 장을 768px 미만에서 가운데만 잘라 보여 준다.
   */
  mdImageSrc?: string;
  /** 이미지 안 문구를 그대로 옮긴 대체 텍스트 */
  alt: string;
  className?: string;
};

/**
 * 광고 배너. 화면 너비에 따라 비율을 바꾼다(모바일 1.875:1, 넓은 화면 3.08:1).
 * md 이미지가 있으면 비율이 바뀌는 기준이 768px에서 1024px(데스크톱)로 옮겨 간다.
 */
export const PromoBanner = ({ href, imageSrc, mdImageSrc, alt, className }: PromoBannerProps) => {
  const image = <ResponsiveImage src={imageSrc} mdSrc={mdImageSrc} alt={alt} className={styles.image} />;
  const bannerClass = cx(styles.banner, mdImageSrc && styles.sized, className);
  return href ? (
    <a href={href} className={bannerClass}>
      {image}
    </a>
  ) : (
    <div className={bannerClass}>{image}</div>
  );
};
