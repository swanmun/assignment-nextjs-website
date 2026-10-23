"use client";

import { useState, type CSSProperties } from "react";
import { IconButton } from "@/components/icon-button/IconButton";
import styles from "./PhotoCarousel.module.css";

export type CarouselPhoto = {
  src: string;
  alt: string;
  /** 태블릿 이상(768px~)에서 쓸 가로로 긴 이미지 */
  wideSrc?: string;
};

export type PhotoCarouselProps = {
  photos: CarouselPhoto[];
  /** 사진 영역 최대 너비 (기본 읽기 영역 너비). 바탕은 가로 전체로 깔린다. */
  width?: string;
};

/** 사진 1장씩 넘겨 보는 캐러셀: 이전/다음 버튼 · 점 · 순번 */
export const PhotoCarousel = ({ photos, width }: PhotoCarouselProps) => {
  const [index, setIndex] = useState(0);
  const count = photos.length;
  const go = (next: number) => setIndex((next + count) % count);

  if (count === 0) return null;

  return (
    <section
      className={styles.carousel}
      aria-roledescription="carousel"
      aria-label="맛집 사진"
      style={width ? ({ "--carousel-width": width } as CSSProperties) : undefined}
    >
      <div className={styles.inner}>
        <div className={styles.viewport} aria-live="polite">
          <picture>
            {photos[index].wideSrc && <source media="(min-width: 768px)" srcSet={photos[index].wideSrc} />}
            <img src={photos[index].src} alt={photos[index].alt} className={styles.photo} />
          </picture>
        </div>
        {count > 1 && (
          <div className={styles.pager}>
            <IconButton variant="circle-neutral" icon="chevron-left" aria-label="이전 사진" onClick={() => go(index - 1)} />
            <div className={styles.dots}>
              {photos.map((photo, i) => (
                <button
                  key={photo.src + i}
                  type="button"
                  className={styles.dot}
                  aria-label={`${i + 1}번째 사진`}
                  aria-current={i === index}
                  onClick={() => go(i)}
                />
              ))}
              <span className={`${styles.counter} typo-label-md`}>
                {index + 1}/{count}
              </span>
            </div>
            <IconButton variant="circle-neutral" icon="chevron-right" aria-label="다음 사진" onClick={() => go(index + 1)} />
          </div>
        )}
      </div>
    </section>
  );
};
