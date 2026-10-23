"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Modal.module.css";

type ModalAction = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export type ModalProps = {
  open: boolean;
  /** 닫기 아이콘, 스크림 탭, Esc에서 호출된다. */
  onClose: () => void;
  title: string;
  /** 푸터 primary 버튼 1개 */
  primaryAction?: ModalAction;
  /** 푸터 secondary 버튼 1개 */
  secondaryAction?: ModalAction;
  /** 기본 320px. 내용에 맞춰 바꿀 수 있다. */
  width?: number | string;
  /** true면 화면 전체가 아니라 가장 가까운 position 부모 안에 띄운다. */
  contained?: boolean;
  className?: string;
  /** 바디 콘텐츠. 문자열이면 body-md 문단으로 감싼다. */
  children: ReactNode;
};

export const Modal = ({
  open,
  onClose,
  title,
  primaryAction,
  secondaryAction,
  width = 320,
  contained = false,
  className,
  children,
}: ModalProps) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open || contained) return;
    const previous = document.activeElement as HTMLElement | null;
    dialogRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onCloseRef.current();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      previous?.focus?.();
    };
  }, [open, contained]);

  if (!open) return null;

  return (
    <div className={cx(styles.overlay, contained && styles.contained)}>
      <div className={styles.scrim} onClick={onClose} aria-hidden />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal={!contained}
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cx(styles.modal, className)}
        style={{ width }}
      >
        <div className={styles.header}>
          <h2 id={titleId} className={`${styles.title} typo-heading-sm`}>
            {title}
          </h2>
          <button type="button" className={styles.close} onClick={onClose} aria-label="닫기">
            <Icon name="close" size={16} />
          </button>
        </div>
        <div className={styles.body}>
          {typeof children === "string" ? <p className="typo-body-md">{children}</p> : children}
        </div>
        {(primaryAction || secondaryAction) && (
          <div className={styles.footer}>
            {secondaryAction && (
              <Button variant="secondary" {...secondaryAction}>
                {secondaryAction.label}
              </Button>
            )}
            {primaryAction && (
              <Button variant="primary" {...primaryAction}>
                {primaryAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
