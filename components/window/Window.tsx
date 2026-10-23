"use client";

import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { LayoutGrid, Minus, Rows2 } from "lucide-react";
import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./Window.module.css";

export type WindowProps = Omit<ComponentPropsWithoutRef<"section">, "title"> & {
  /** 제목 표시줄 경로 텍스트 (예: "C:\구로\새로 올라온 맛집") */
  title: string;
  /** 제목 왼쪽 14px 아이콘 */
  icon?: ReactNode;
  /** 최소화 버튼 표시. 누르면 제목 표시줄만 남기고 접는다. */
  minimizable?: boolean;
  /** 닫기 버튼 표시 */
  onClose?: () => void;
  /** 제목 표시줄 아래 도구 막대 (개수·보기 전환 등) */
  toolbar?: ReactNode;
  /** 하단 상태 표시줄 칸들. 첫 칸이 남는 너비를 채운다. */
  status?: ReactNode[];
  children: ReactNode;
};

/** 제목 표시줄이 있는 레트로 창 */
export const Window = ({
  title,
  icon,
  minimizable = false,
  onClose,
  toolbar,
  status,
  className,
  children,
  ...rest
}: WindowProps) => {
  const bodyId = useId();
  const [minimized, setMinimized] = useState(false);

  return (
    <section className={cx(styles.window, className)} aria-label={title} {...rest}>
      <div className={styles.titleBar}>
        {icon && (
          <span className={styles.titleIcon} aria-hidden>
            {icon}
          </span>
        )}
        <span className={`${styles.title} typo-label-md`}>{title}</span>
        {minimizable && (
          <button
            type="button"
            className={styles.titleButton}
            onClick={() => setMinimized((v) => !v)}
            aria-label={minimized ? "펼치기" : "최소화"}
            aria-expanded={!minimized}
            aria-controls={bodyId}
          >
            <Minus size={12} strokeWidth={3} aria-hidden />
          </button>
        )}
        {onClose && (
          <button type="button" className={styles.titleButton} onClick={onClose} aria-label="닫기">
            <Icon name="close" size={16} />
          </button>
        )}
      </div>
      <div id={bodyId} className={styles.body} hidden={minimized}>
        {toolbar && <div className={styles.toolbar}>{toolbar}</div>}
        {children}
        {status && status.length > 0 && <StatusBar items={status} />}
      </div>
    </section>
  );
};

/** 상태 표시줄. 첫 칸이 남는 너비를 채운다. */
export const StatusBar = ({ items }: { items: ReactNode[] }) => (
  <div className={styles.statusBar}>
    {items.map((cell, index) => (
      <span key={index} className={`${styles.statusCell} typo-label-md`}>
        {cell}
      </span>
    ))}
  </div>
);

/** 창 안의 오목한 목록 영역 */
export const WindowWell = ({ className, ...rest }: ComponentPropsWithoutRef<"div">) => (
  <div className={cx(styles.well, className)} {...rest} />
);

export type ListView = "list" | "grid";

export type ViewToggleProps = {
  value: ListView;
  onChange: (value: ListView) => void;
};

/** 목록 / 격자 보기 전환 */
export const ViewToggle = ({ value, onChange }: ViewToggleProps) => (
  <div className={styles.viewToggle} role="group" aria-label="보기 방식">
    <button
      type="button"
      className={styles.viewButton}
      aria-pressed={value === "list"}
      aria-label="목록으로 보기"
      onClick={() => onChange("list")}
    >
      <Rows2 size={14} aria-hidden />
    </button>
    <button
      type="button"
      className={styles.viewButton}
      aria-pressed={value === "grid"}
      aria-label="격자로 보기"
      onClick={() => onChange("grid")}
    >
      <LayoutGrid size={14} aria-hidden />
    </button>
  </div>
);

/** 제목 표시줄 없는 볼록 패널 (상세 정보·폼) */
export const Panel = ({ className, ...rest }: ComponentPropsWithoutRef<"div">) => (
  <div className={cx(styles.panel, className)} {...rest} />
);
