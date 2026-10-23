"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import fieldStyles from "@/components/field/Field.module.css";
import { FieldHelper } from "@/components/field/FieldHelper";
import { Icon } from "@/components/icon/Icon";
import { FIELD_ICON_SIZE, type FieldSize } from "@/components/text-field/TextField";
import { cx } from "@/lib/cx";
import styles from "./Select.module.css";
import { SelectItem } from "./SelectItem";

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
};

export type SelectProps = {
  label: string;
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  size?: FieldSize;
  hint?: string;
  /** 에러 메시지. 있으면 에러 상태가 되고 힌트를 대체한다. */
  error?: string;
  disabled?: boolean;
  /**
   * 목록을 띄우는 방식.
   * auto: 767px 이하 화면은 바텀시트(lg), 그 외는 셀렉트 아래 패널
   */
  presentation?: "auto" | "dropdown" | "sheet";
  /** 처음부터 열린 상태로 렌더링(문서·테스트용) */
  defaultOpen?: boolean;
  className?: string;
};

const MOBILE_QUERY = "(max-width: 767px)";

export const Select = ({
  label,
  options,
  value,
  onChange,
  placeholder = "선택하세요",
  size = "md",
  hint,
  error,
  disabled = false,
  presentation = "auto",
  defaultOpen = false,
  className,
}: SelectProps) => {
  const id = useId();
  const listId = `${id}-list`;
  const helperId = `${id}-helper`;
  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(defaultOpen);
  const [asSheet, setAsSheet] = useState(presentation === "sheet");
  const [activeIndex, setActiveIndex] = useState(-1);
  const selected = options.find((option) => option.value === value);

  const openList = () => {
    if (disabled) return;
    setAsSheet(presentation === "sheet" || (presentation === "auto" && window.matchMedia(MOBILE_QUERY).matches));
    setActiveIndex(Math.max(0, options.findIndex((option) => option.value === value)));
    setOpen(true);
  };

  const choose = (option: SelectOption) => {
    if (option.disabled) return;
    onChange?.(option.value);
    setOpen(false);
  };

  // 패널 바깥을 누르면 닫는다.
  useEffect(() => {
    if (!open || asSheet) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open, asSheet]);

  const moveActive = (step: 1 | -1) => {
    if (!options.some((option) => !option.disabled)) return;
    let next = activeIndex;
    do {
      next = (next + step + options.length) % options.length;
    } while (options[next].disabled);
    setActiveIndex(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (!open) {
      if (["ArrowDown", "ArrowUp", "Enter", " "].includes(event.key)) {
        event.preventDefault();
        openList();
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(event.key === "ArrowDown" ? 1 : -1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      if (options[activeIndex]) choose(options[activeIndex]);
    } else if (event.key === "Escape" || event.key === "Tab") {
      setOpen(false);
    }
  };

  const itemSize = asSheet ? "lg" : size;
  const items = options.map((option, index) => (
    <SelectItem
      key={option.value}
      id={`${id}-option-${index}`}
      size={itemSize}
      selected={option.value === value}
      disabled={option.disabled}
      active={!asSheet && index === activeIndex}
      onClick={() => choose(option)}
    >
      {option.label}
    </SelectItem>
  ));

  return (
    <div className={cx(fieldStyles.field, error && fieldStyles.error, disabled && fieldStyles.disabled, className)}>
      <span id={`${id}-label`} className={`${fieldStyles.label} typo-label-lg`}>
        {label}
      </span>
      <div ref={anchorRef} className={styles.anchor}>
        <button
          type="button"
          role="combobox"
          data-slot="box"
          data-open={open}
          disabled={disabled}
          aria-labelledby={`${id}-label`}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          aria-activedescendant={open && !asSheet && activeIndex >= 0 ? `${id}-option-${activeIndex}` : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={error || hint ? helperId : undefined}
          className={cx(fieldStyles.box, fieldStyles[size], styles.trigger)}
          onClick={() => (open ? setOpen(false) : openList())}
          onKeyDown={onKeyDown}
        >
          <span className={cx(styles.value, !selected && styles.placeholder, "typo-body-lg")}>
            {selected?.label ?? placeholder}
          </span>
          <Icon name="chevron-down" size={FIELD_ICON_SIZE[size]} className={styles.chevron} />
        </button>
        {open && !asSheet && (
          <ul id={listId} role="listbox" aria-labelledby={`${id}-label`} className={styles.panel}>
            {items}
          </ul>
        )}
      </div>
      <FieldHelper id={helperId} error={error} hint={hint} />
      {asSheet && (
        <BottomSheet open={open} onClose={() => setOpen(false)} title={label}>
          <ul id={listId} role="listbox" aria-labelledby={`${id}-label`} className={styles.sheetList}>
            {items}
          </ul>
        </BottomSheet>
      )}
    </div>
  );
};
