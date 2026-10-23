import type { ReactNode } from "react";
import type { IconName } from "@/components/icon/Icon";
import { IconButton, IconButtonLink } from "@/components/icon-button/IconButton";
import { cx } from "@/lib/cx";
import styles from "./Navigation.module.css";

export type NavigationAction = {
  icon: IconName;
  /** 스크린리더용 이름 (예: "뒤로 가기") */
  label: string;
  /** 있으면 해당 경로로 이동하는 링크로 렌더링한다. */
  href?: string;
  onClick?: () => void;
};

const ActionButton = ({ icon, label, href, onClick }: NavigationAction) =>
  href ? (
    <IconButtonLink href={href} icon={icon} aria-label={label} />
  ) : (
    <IconButton icon={icon} aria-label={label} onClick={onClick} />
  );

export type TopNavigationProps = {
  /** 제목(heading-sm) */
  title: string;
  /** 왼쪽 아이콘 버튼 (뒤로 가기·메뉴 등) */
  leftAction?: NavigationAction;
  /** 오른쪽 아이콘 버튼들 */
  rightActions?: NavigationAction[];
  /** 아이콘 버튼 대신 오른쪽에 둘 요소 (예: 상태 배지) */
  rightSlot?: ReactNode;
  className?: string;
};

/** 가로 전체 · 높이 56px 상단 바 */
export const TopNavigation = ({ title, leftAction, rightActions = [], rightSlot, className }: TopNavigationProps) => (
  <header className={cx(styles.top, className)}>
    <div className={styles.topInner}>
      {leftAction && <ActionButton {...leftAction} />}
      <h1 className={`${styles.topTitle} typo-heading-sm`}>{title}</h1>
      {rightActions.length > 0 && (
        <div className={styles.topActions}>
          {rightActions.map((action) => (
            <ActionButton key={action.label} {...action} />
          ))}
        </div>
      )}
      {rightSlot && <div className={styles.topSlot}>{rightSlot}</div>}
    </div>
  </header>
);
