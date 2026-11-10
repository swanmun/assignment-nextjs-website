import styles from "./ResponsiveImage.module.css";

/** lg 이미지로 바뀌는 데스크톱 기준 너비. 이보다 좁은 모바일·태블릿은 md 이미지를 받는다. */
export const DESKTOP_MIN_WIDTH = 1024;

export type ResponsiveImageProps = {
  /** 데스크톱(1024px 이상)용 큰 이미지. md가 없으면 모든 화면에서 이 이미지를 쓴다. */
  src: string;
  /** 모바일·태블릿(1024px 미만)용 이미지 */
  mdSrc?: string;
  alt: string;
  className?: string;
};

/**
 * 화면 너비에 따라 lg·md 이미지 중 하나만 받는 이미지.
 * 크기·비율·자르기는 className으로 넘긴 스타일이 정한다(<img>에 적용된다).
 */
export const ResponsiveImage = ({ src, mdSrc, alt, className }: ResponsiveImageProps) => {
  // eslint-disable-next-line @next/next/no-img-element -- 디자인 시스템 컴포넌트는 이미지 로더에 의존하지 않는다
  const image = <img src={src} alt={alt} className={className} />;
  if (!mdSrc) return image;
  return (
    <picture className={styles.picture}>
      <source media={`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`} srcSet={mdSrc} />
      {image}
    </picture>
  );
};
