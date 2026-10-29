"use client";

import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./MapImage.module.css";

export const MAP_IMAGE_SIZES = ["sm", "md", "lg"] as const;
export type MapImageSize = (typeof MAP_IMAGE_SIZES)[number];

/** 크기별 높이(px). 지도 이미지를 요청할 때도 같은 값을 쓴다. */
export const MAP_IMAGE_HEIGHT = { sm: 140, md: 180, lg: 360 } as const satisfies Record<MapImageSize, number>;

export type MapImageProps = {
  /** 지도 이미지 (모바일) */
  src: string;
  /** 태블릿 이상(768px~)에서 쓸 가로로 긴 지도 */
  wideSrc?: string;
  alt: string;
  /** 높이 sm 140 · md 180 · lg 360 */
  size?: MapImageSize;
  /** 가로 전체 띠: 위아래 테두리만 두고 바탕을 전체 너비로 깐다. 지도는 읽기 영역 너비 안에 둔다. */
  bleed?: boolean;
  /** 오른쪽 아래에 띄울 요소 (예: 크게 보기 버튼) */
  action?: ReactNode;
  /** 지도를 불러오지 못하면 대신 보여줄 요소 (예: MapPreview) */
  fallback?: ReactNode;
  className?: string;
};

/** 가운데에 핀이 꽂힌 지도 이미지. 이미지는 가운데 기준으로 잘라 핀이 항상 가운데에 온다. */
export const MapImage = ({ src, wideSrc, alt, size = "md", bleed = false, action, fallback, className }: MapImageProps) => {
  const [failedSrc, setFailedSrc] = useState<string>();
  const failed = failedSrc === src;

  const map = (
    <div className={cx(styles.map, styles[size], !bleed && styles.framed, !bleed && className)}>
      {failed ? (
        <div className={styles.fallback}>{fallback}</div>
      ) : (
        <picture>
          {wideSrc && <source media="(min-width: 768px)" srcSet={wideSrc} />}
          <img
            src={src}
            alt={alt}
            className={styles.image}
            // 하이드레이션 전에 실패한 이미지는 onError가 오지 않으므로 마운트할 때 한 번 더 본다.
            ref={(img) => {
              if (img?.complete && img.naturalWidth === 0) setFailedSrc(src);
            }}
            onError={() => setFailedSrc(src)}
          />
        </picture>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );

  return bleed ? <div className={cx(styles.strip, className)}>{map}</div> : map;
};
