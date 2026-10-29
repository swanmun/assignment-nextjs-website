import type { ComponentPropsWithoutRef } from "react";
import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./ListItem.module.css";

export type ListItemProps = Omit<ComponentPropsWithoutRef<"button">, "title" | "children"> & {
  /** 제목(label-lg) */
  title: string;
  /** 제목 옆 보조 정보(label-md, 예: 분류) */
  meta?: string;
  /** 제목 아래 설명(label-md, 예: 주소) */
  description?: string;
};

/** 눌러서 고르는 목록 한 줄 — 제목·보조 정보·설명 + 오른쪽 화살표 (장소 검색 결과 등) */
export const ListItem = ({ title, meta, description, type = "button", className, ...rest }: ListItemProps) => (
  <button type={type} className={cx(styles.item, className)} {...rest}>
    <span className={styles.texts}>
      <span className={styles.titleRow}>
        <span className={`${styles.title} typo-label-lg`}>{title}</span>
        {meta && <span className={`${styles.meta} typo-label-md`}>{meta}</span>}
      </span>
      {description && <span className={`${styles.description} typo-label-md`}>{description}</span>}
    </span>
    <Icon name="chevron-right" size={16} className={styles.chevron} />
  </button>
);
