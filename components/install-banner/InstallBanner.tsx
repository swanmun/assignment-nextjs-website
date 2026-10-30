import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./InstallBanner.module.css";

export type InstallBannerProps = {
  /** 앱 아이콘 이미지 (40px) */
  iconSrc: string;
  /** 제목(label-lg) — 예: "숨은맛집.EXE 앱 설치" */
  title: string;
  /** 보조 문구(label-md) */
  description: string;
  /** 오른쪽 버튼 모양 문구. 띠배너 전체가 하나의 버튼이다. */
  actionLabel: string;
  /** 띠배너를 누르면 호출된다 (안드로이드: 설치 창 · iOS: 설치 안내). */
  onAction: () => void;
  /** 닫기(X)를 누르면 호출된다. */
  onClose: () => void;
  className?: string;
};

/** 화면 아래 가로 전체 띠배너 — 작업 표시줄처럼 깔고 내용만 최대 너비 안에 둔다. */
export const InstallBanner = ({ iconSrc, title, description, actionLabel, onAction, onClose, className }: InstallBannerProps) => (
  <aside className={cx(styles.banner, className)} aria-label="앱 설치 안내">
    <div className={styles.inner}>
      <button type="button" className={styles.main} onClick={onAction}>
        <span className={styles.iconFrame}>
          {/* eslint-disable-next-line @next/next/no-img-element -- 40px 정적 아이콘이라 next/image 최적화가 필요 없다 */}
          <img src={iconSrc} alt="" width={40} height={40} className={styles.icon} />
        </span>
        <span className={styles.text}>
          <span className={`${styles.title} typo-label-lg`}>{title}</span>
          <span className={`${styles.description} typo-label-md`}>{description}</span>
        </span>
        <span className={`${styles.action} typo-label-lg`}>{actionLabel}</span>
      </button>
      <button type="button" className={styles.close} onClick={onClose} aria-label="설치 안내 닫기">
        <Icon name="close" size={20} />
      </button>
    </div>
  </aside>
);
