"use client";

import { useId, useRef, useState, type DragEvent, type ReactNode } from "react";
import { Button } from "@/components/button/Button";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./FileUploader.module.css";

export type FileUploaderProps = {
  /** 상단 헬퍼텍스트 — 파일 형식·용량 제한 안내 */
  hint?: string;
  /** input accept 속성 (예: "image/png,image/jpeg") */
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  /** 에러 메시지. 있으면 드롭존이 에러 상태가 되고 안내문구를 대체한다. */
  error?: string;
  /** 파일을 끌어다 놓거나 선택했을 때 호출된다. 검증·업로드는 사용하는 쪽에서 처리한다. */
  onFilesSelected?: (files: File[]) => void;
  /** 하단 파일 아이템 리스트 (FileItem) */
  children?: ReactNode;
  /** 처음부터 dragover 상태로 렌더링(문서·테스트용) */
  defaultDragOver?: boolean;
  className?: string;
};

const GUIDE = {
  default: "사진을 여기로 끌어다 놓거나",
  dragover: "여기에 놓으면 바로 올라가요",
  disabled: "지금은 파일을 올릴 수 없어요",
};

const DROP_ICON: Record<"default" | "dragover" | "disabled" | "error", IconName> = {
  default: "arrow-up",
  dragover: "arrow-down",
  disabled: "arrow-up",
  error: "error",
};

/** 드롭존 + 파일선택버튼 결합 단일형 */
export const FileUploader = ({
  hint,
  accept,
  multiple = true,
  disabled = false,
  error,
  onFilesSelected,
  children,
  defaultDragOver = false,
  className,
}: FileUploaderProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const hintId = useId();
  const [dragOver, setDragOver] = useState(defaultDragOver);
  const state = disabled ? "disabled" : dragOver ? "dragover" : error ? "error" : "default";

  const onDragOver = (event: DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    setDragOver(true);
  };

  const onDrop = (event: DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    setDragOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length) onFilesSelected?.(files);
  };

  return (
    <div className={cx(styles.uploader, error && styles.error, disabled && styles.disabled, className)}>
      {hint && (
        <p id={hintId} className={`${styles.helper} typo-label-md`}>
          {hint}
        </p>
      )}
      <div
        className={cx(styles.dropzone, state === "dragover" && styles.dragover)}
        onDragOver={onDragOver}
        onDragLeave={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setDragOver(false);
        }}
        onDrop={onDrop}
      >
        <Icon name={DROP_ICON[state]} size={32} />
        <p className={`${styles.guide} typo-body-md`} role={state === "error" ? "alert" : undefined}>
          {state === "error" ? error : GUIDE[state]}
        </p>
        <Button
          variant="secondary"
          size="sm"
          leftIcon="image"
          disabled={disabled}
          aria-describedby={hint ? hintId : undefined}
          onClick={() => inputRef.current?.click()}
        >
          파일 선택
        </Button>
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length) onFilesSelected?.(files);
            event.target.value = "";
          }}
        />
      </div>
      {children && <ul className={styles.list}>{children}</ul>}
    </div>
  );
};
