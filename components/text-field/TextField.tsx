"use client";

import { useId, useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";
import styles from "@/components/field/Field.module.css";
import { FieldHelper } from "@/components/field/FieldHelper";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";

export const FIELD_SIZES = ["sm", "md", "lg"] as const;
export type FieldSize = (typeof FIELD_SIZES)[number];

export const TEXT_FIELD_TYPES = ["text", "password"] as const;
export type TextFieldType = (typeof TEXT_FIELD_TYPES)[number];

export const FIELD_ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

export type TextFieldProps = Omit<ComponentPropsWithoutRef<"input">, "size" | "type"> & {
  label: string;
  /** 레이블을 화면에서 숨기고 스크린리더에만 읽힌다. (검색창 등) */
  hideLabel?: boolean;
  type?: TextFieldType;
  size?: FieldSize;
  /** 하단 힌트 */
  hint?: string;
  /** 에러 메시지. 있으면 에러 상태가 되고 힌트를 대체한다. */
  error?: string;
  /** text 타입: 입력 텍스트 왼쪽 아이콘 (password는 자물쇠 고정) */
  leftIcon?: IconName;
  /** text 타입: 입력 텍스트 오른쪽 아이콘 (password는 보기 토글 고정) */
  rightIcon?: IconName;
  /** 오른쪽 아이콘 대신 둘 요소 (예: 성공 체크, 지우기 버튼). rightIcon보다 우선한다. */
  rightAdornment?: ReactNode;
};

export const TextField = ({
  label,
  hideLabel = false,
  type = "text",
  size = "md",
  hint,
  error,
  leftIcon,
  rightIcon,
  rightAdornment,
  disabled,
  className,
  id,
  ...rest
}: TextFieldProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const [revealed, setRevealed] = useState(false);
  const iconSize = FIELD_ICON_SIZE[size];
  const isPassword = type === "password";
  const EyeIcon = revealed ? EyeOff : Eye;

  return (
    <div className={cx(styles.field, error && styles.error, disabled && styles.disabled, className)}>
      <label htmlFor={inputId} className={cx(styles.label, "typo-label-lg", hideLabel && "sr-only")}>
        {label}
      </label>
      <div data-slot="box" className={cx(styles.box, styles[size])}>
        {isPassword ? <Lock size={iconSize} aria-hidden /> : leftIcon && <Icon name={leftIcon} size={iconSize} />}
        <input
          id={inputId}
          type={isPassword && !revealed ? "password" : "text"}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helperId : undefined}
          className={`${styles.control} typo-body-lg`}
          {...rest}
        />
        {isPassword ? (
          <button
            type="button"
            className={styles.adornment}
            disabled={disabled}
            aria-label={revealed ? "비밀번호 숨기기" : "비밀번호 보기"}
            aria-pressed={revealed}
            onClick={() => setRevealed((v) => !v)}
          >
            <EyeIcon size={iconSize} aria-hidden />
          </button>
        ) : (
          (rightAdornment ?? (rightIcon && <Icon name={rightIcon} size={iconSize} />))
        )}
      </div>
      <FieldHelper id={helperId} error={error} hint={hint} />
    </div>
  );
};
