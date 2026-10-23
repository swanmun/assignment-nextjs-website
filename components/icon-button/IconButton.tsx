import type { ComponentPropsWithoutRef } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./IconButton.module.css";

export const ICON_BUTTON_VARIANTS = ["ghost", "circle-brand", "circle-neutral"] as const;

export type IconButtonVariant = (typeof ICON_BUTTON_VARIANTS)[number];

export type IconButtonProps = Omit<ComponentPropsWithoutRef<"button">, "children"> & {
  icon: IconName;
  /** 아이콘만 있으므로 스크린리더용 이름이 반드시 필요하다. */
  "aria-label": string;
  /** ghost는 부모의 글자색을 그대로 따른다. */
  variant?: IconButtonVariant;
};

/** 48×48 터치 영역, 내부 아이콘 24px */
export const IconButton = ({ icon, variant = "ghost", type = "button", className, ...rest }: IconButtonProps) => (
  <button type={type} className={cx(styles.iconButton, styles[variant], className)} {...rest}>
    <Icon name={icon} size={24} />
  </button>
);

export type IconButtonLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "children"> & {
  icon: IconName;
  "aria-label": string;
  variant?: IconButtonVariant;
};

/** 페이지 이동용 아이콘 버튼 (Next.js Link) */
export const IconButtonLink = ({ icon, variant = "ghost", className, ...rest }: IconButtonLinkProps) => (
  <Link className={cx(styles.iconButton, styles[variant], className)} {...rest}>
    <Icon name={icon} size={24} />
  </Link>
);
