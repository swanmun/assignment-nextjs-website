import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Toast.module.css";

export const TOAST_TYPES = ["success", "error", "info", "warning"] as const;
export type ToastType = (typeof TOAST_TYPES)[number];

const STATUS_ICON: Record<ToastType, IconName> = {
  success: "check",
  error: "error",
  info: "info",
  warning: "warning",
};

export type ToastProps = {
  type: ToastType;
  /** 메시지(body-md) */
  children: ReactNode;
  /** 있으면 오른쪽에 닫기 아이콘을 표시한다. */
  onClose?: () => void;
  className?: string;
};

export const Toast = ({ type, children, onClose, className }: ToastProps) => (
  <div role={type === "error" ? "alert" : "status"} className={cx(styles.toast, styles[type], className)}>
    <div className={styles.body}>
      <Icon name={STATUS_ICON[type]} size={20} className={styles.statusIcon} />
      <p className={`${styles.message} typo-body-md`}>{children}</p>
      {onClose && (
        <button type="button" className={styles.close} onClick={onClose} aria-label="알림 닫기">
          <Icon name="close" size={20} />
        </button>
      )}
    </div>
  </div>
);
