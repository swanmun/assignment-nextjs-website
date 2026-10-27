import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Icon } from "@/components/icon/Icon";
import { IconButton, type IconButtonProps } from "@/components/icon-button/IconButton";
import { cx } from "@/lib/cx";
import styles from "./Card.module.css";

export type CardProps = ComponentPropsWithoutRef<"article"> & {
  title: string;
  /** 제목 왼쪽 배지 (예: NEW) */
  badge?: ReactNode;
  /** 이미지 영역 (생략하면 이미지 없이 콘텐츠만) */
  imageUrl?: string;
  imageAlt?: string;
  address?: string;
  summary?: string;
  author?: string;
  /** 작성일 표기 (예: "10.14") */
  date?: string;
};

/** 맛집 카드 — 가로·높이 auto */
export const Card = ({ title, badge, imageUrl, imageAlt = "", address, summary, author, date, className, ...rest }: CardProps) => (
  <article className={cx(styles.card, className)} {...rest}>
    {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 시스템 컴포넌트는 이미지 로더에 의존하지 않는다 */}
    {imageUrl && <img src={imageUrl} alt={imageAlt} className={styles.image} />}
    <div className={styles.content}>
      {badge ? (
        <div className={styles.titleRow}>
          {badge}
          <h3 className="typo-heading-sm">{title}</h3>
        </div>
      ) : (
        <h3 className="typo-heading-sm">{title}</h3>
      )}
      {address && (
        <p className={`${styles.address} typo-label-md`}>
          <MapPin size={16} aria-hidden />
          {address}
        </p>
      )}
      {summary && <p className="typo-body-md">{summary}</p>}
      {(author || date) && (
        <div className={styles.meta}>
          {author && (
            <>
              <span className={styles.avatar} aria-hidden>
                <Icon name="user" size={16} />
              </span>
              <span className="typo-label-md">{author}</span>
            </>
          )}
          {date && <span className={`${styles.date} typo-label-md`}>{author ? `· ${date}` : date}</span>}
        </div>
      )}
    </div>
  </article>
);

export type CardRemoveButtonProps = Omit<IconButtonProps, "icon" | "variant">;

/**
 * 카드 오른쪽 위에 겹쳐 두는 삭제(X) 버튼.
 * 카드를 감싼 링크 안에 넣지 말고, 카드와 같은 부모(position: relative) 안에 형제로 둔다.
 */
export const CardRemoveButton = ({ className, ...rest }: CardRemoveButtonProps) => (
  <IconButton icon="close" variant="circle-neutral" className={cx(styles.removeButton, className)} {...rest} />
);
