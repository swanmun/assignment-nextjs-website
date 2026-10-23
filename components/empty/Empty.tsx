import type { ReactNode } from "react";
import { Button, type ButtonProps } from "@/components/button/Button";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Empty.module.css";

type EmptyAction = Pick<ButtonProps, "leftIcon" | "onClick"> & { label: string };

export type EmptyProps = {
  title: string;
  description?: string;
  /** 비주얼: 아이콘 이름이면 도트 패턴 박스 안에 32px 아이콘, ReactNode면 그대로(그림 등) */
  visual?: IconName | ReactNode;
  /** primary 버튼 1개 */
  primaryAction?: EmptyAction;
  /** secondary 버튼 1개 */
  secondaryAction?: EmptyAction;
  className?: string;
};

/** 비어 있는 화면 — 가로·세로 중앙 정렬 */
export const Empty = ({ title, description, visual, primaryAction, secondaryAction, className }: EmptyProps) => (
  <section className={cx(styles.empty, className)}>
    {typeof visual === "string" ? (
      <div className={styles.visual}>
        <Icon name={visual as IconName} size={32} />
      </div>
    ) : (
      visual
    )}
    <h2 className={`${styles.title} typo-heading-sm`}>{title}</h2>
    {description && <p className={`${styles.description} typo-body-md`}>{description}</p>}
    {(primaryAction || secondaryAction) && (
      <div className={styles.actions}>
        {secondaryAction && (
          <Button variant="secondary" leftIcon={secondaryAction.leftIcon} onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </Button>
        )}
        {primaryAction && (
          <Button variant="primary" leftIcon={primaryAction.leftIcon} onClick={primaryAction.onClick}>
            {primaryAction.label}
          </Button>
        )}
      </div>
    )}
  </section>
);
