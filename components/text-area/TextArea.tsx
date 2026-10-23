"use client";

import { useId, useState, type ChangeEvent, type ComponentPropsWithoutRef } from "react";
import fieldStyles from "@/components/field/Field.module.css";
import { FieldHelper } from "@/components/field/FieldHelper";
import { cx } from "@/lib/cx";
import styles from "./TextArea.module.css";

export type TextAreaProps = ComponentPropsWithoutRef<"textarea"> & {
  label: string;
  hint?: string;
  /** 에러 메시지. 있으면 에러 상태가 되고 힌트를 대체한다. */
  error?: string;
  /** 하단 오른쪽 글자수 카운터. maxLength가 있으면 "현재/최대"로 표시한다. */
  showCounter?: boolean;
};

/** 고정 높이 3줄. 내용이 넘치면 스크롤된다. */
export const TextArea = ({
  label,
  hint,
  error,
  showCounter = true,
  disabled,
  className,
  id,
  value,
  defaultValue,
  maxLength,
  onChange,
  ...rest
}: TextAreaProps) => {
  const autoId = useId();
  const inputId = id ?? autoId;
  const helperId = `${inputId}-helper`;
  const [innerLength, setInnerLength] = useState(String(defaultValue ?? "").length);
  const length = value !== undefined ? String(value).length : innerLength;

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    setInnerLength(event.target.value.length);
    onChange?.(event);
  };

  return (
    <div className={cx(fieldStyles.field, error && fieldStyles.error, disabled && fieldStyles.disabled, className)}>
      <label htmlFor={inputId} className={`${fieldStyles.label} typo-label-lg`}>
        {label}
      </label>
      <div data-slot="box" className={cx(fieldStyles.box, styles.box)}>
        <textarea
          id={inputId}
          disabled={disabled}
          value={value}
          defaultValue={defaultValue}
          maxLength={maxLength}
          onChange={handleChange}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helperId : undefined}
          className={cx(fieldStyles.control, styles.textarea, "typo-body-lg")}
          {...rest}
        />
      </div>
      {(error || hint || showCounter) && (
        <div className={fieldStyles.footer}>
          <FieldHelper id={helperId} error={error} hint={hint} />
          {showCounter && (
            <span className={`${fieldStyles.counter} typo-label-md`}>
              {maxLength ? `${length}/${maxLength}` : length}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
