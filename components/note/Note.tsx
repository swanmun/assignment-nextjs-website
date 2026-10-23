import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Note.module.css";

export type NoteProps = {
  children: ReactNode;
  /** 기본 info (16px) */
  icon?: IconName;
  /** 가운데 정렬 (목록 끝 안내 등) */
  center?: boolean;
  /** 글자색 tertiary(기본) · secondary */
  tone?: "tertiary" | "secondary";
  className?: string;
};

/** 아이콘 + 짧은 안내 문구(label-md) */
export const Note = ({ children, icon = "info", center = false, tone = "tertiary", className }: NoteProps) => (
  <p className={cx(styles.note, center && styles.center, styles[tone], "typo-label-md", className)}>
    <Icon name={icon} size={16} />
    <span>{children}</span>
  </p>
);
