"use client";

import { createContext, useContext, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from "react";
import { Icon, type IconName } from "@/components/icon/Icon";
import type { FieldSize } from "@/components/text-field/TextField";
import { cx } from "@/lib/cx";
import styles from "./Menu.module.css";

export const MENU_ITEM_VARIANTS = ["default", "destructive"] as const;
export type MenuItemVariant = (typeof MENU_ITEM_VARIANTS)[number];

const ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

const MenuSizeContext = createContext<FieldSize>("md");

export type MenuItemProps = Omit<ComponentPropsWithoutRef<"button">, "role"> & {
  variant?: MenuItemVariant;
  /** 왼쪽 아이콘 */
  icon?: IconName;
  /** 생략하면 감싸는 Menu의 사이즈를 따른다. */
  size?: FieldSize;
};

export const MenuItem = ({ variant = "default", icon, size, type = "button", className, children, ...rest }: MenuItemProps) => {
  const menuSize = useContext(MenuSizeContext);
  const resolved = size ?? menuSize;
  return (
    <li role="none">
      <button
        type={type}
        role="menuitem"
        className={cx(styles.item, styles[resolved], variant === "destructive" && styles.destructive, className)}
        {...rest}
      >
        {icon && <Icon name={icon} size={ICON_SIZE[resolved]} />}
        <span className={`${styles.label} typo-body-lg`}>{children}</span>
      </button>
    </li>
  );
};

export const MenuDivider = () => <li role="separator" className={styles.divider} />;

export type MenuProps = {
  /** 메뉴아이템 사이즈 (sm 32 · md 40 · lg 48) */
  size?: FieldSize;
  /** 바텀시트 안처럼 창 테두리·그림자 없이 그릴 때 */
  plain?: boolean;
  "aria-label"?: string;
  className?: string;
  children: ReactNode;
};

/** 메뉴아이템 목록 패널. 데스크톱은 메뉴 버튼 아래, 모바일은 바텀시트 안에 둔다. */
export const Menu = ({ size = "md", plain = false, className, children, ...rest }: MenuProps) => {
  // 위·아래 화살표로 활성 항목 사이를 이동한다.
  const onKeyDown = (event: KeyboardEvent<HTMLUListElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="menuitem"]:not(:disabled)'));
    const index = items.indexOf(document.activeElement as HTMLButtonElement);
    const next = items[(index + (event.key === "ArrowDown" ? 1 : -1) + items.length) % items.length];
    next?.focus();
  };

  return (
    <ul role="menu" className={cx(styles.menu, plain && styles.plain, className)} onKeyDown={onKeyDown} {...rest}>
      <MenuSizeContext.Provider value={size}>{children}</MenuSizeContext.Provider>
    </ul>
  );
};
