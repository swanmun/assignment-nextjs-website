"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import styles from "./BottomSheet.module.css";

export type BottomSheetProps = {
  open: boolean;
  /** 스크림을 탭하거나 Esc를 누르면 호출된다. 선택 없이 닫힌다. */
  onClose: () => void;
  /** 콘텐츠 상단 제목(heading-sm) */
  title?: ReactNode;
  /** true면 화면 전체가 아니라 가장 가까운 position 부모 안에 띄운다. */
  contained?: boolean;
  className?: string;
  children: ReactNode;
};

export const BottomSheet = ({ open, onClose, title, contained = false, className, children }: BottomSheetProps) => {
  const sheetRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open || contained) return;
    const previous = document.activeElement as HTMLElement | null;
    sheetRef.current?.focus();
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
        ref={sheetRef}
        role="dialog"
        aria-modal={!contained}
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={cx(styles.sheet, className)}
      >
        <div className={styles.handleArea} aria-hidden>
          <span className={styles.handle} />
        </div>
        <div className={styles.content}>
          {title && (
            <h2 id={titleId} className={`${styles.title} typo-heading-sm`}>
              {title}
            </h2>
          )}
          {children}
        </div>
      </div>
    </div>
  );
};
