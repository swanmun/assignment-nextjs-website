import type { ComponentPropsWithoutRef, ReactNode } from "react";
import Link from "next/link";
import { Icon, type IconName } from "@/components/icon/Icon";
import { Spinner } from "@/components/spinner/Spinner";
import { cx } from "@/lib/cx";
import styles from "./Button.module.css";

export const BUTTON_VARIANTS = ["primary", "secondary", "destructive"] as const;
export const BUTTON_SIZES = ["sm", "md", "lg"] as const;

export type ButtonVariant = (typeof BUTTON_VARIANTS)[number];
export type ButtonSize = (typeof BUTTON_SIZES)[number];

const ICON_SIZE = { sm: 16, md: 20, lg: 20 } as const;

export type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** 레이블 왼쪽 아이콘 */
  leftIcon?: IconName;
  /** 레이블 오른쪽 아이콘 */
  rightIcon?: IconName;
  /** 로딩 중에는 왼쪽 아이콘 자리에 스피너를 표시하고 레이블은 유지한다. */
  loading?: boolean;
};

export const Button = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  loading = false,
  disabled,
  type = "button",
  className,
  children,
  ...rest
}: ButtonProps) => {
  const iconSize = ICON_SIZE[size];
  return (
    <button
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      className={cx(styles.button, styles[size], styles[variant], loading && styles.loading, className, `typo-label-lg`)}
      {...rest}
    >
      {loading ? (
        <Spinner size={iconSize} color="currentColor" label="" />
      ) : (
        leftIcon && <Icon name={leftIcon} size={iconSize} />
      )}
      {children}
      {rightIcon && <Icon name={rightIcon} size={iconSize} />}
    </button>
  );
};

export type ButtonLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "children"> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  leftIcon?: IconName;
  rightIcon?: IconName;
  children: ReactNode;
};

/** 페이지 이동용 버튼. 모양은 Button과 같고 Next.js Link로 렌더링한다. */
export const ButtonLink = ({
  variant = "primary",
  size = "md",
  leftIcon,
  rightIcon,
  className,
  children,
  ...rest
}: ButtonLinkProps) => {
  const iconSize = ICON_SIZE[size];
  return (
    <Link className={cx(styles.button, styles[size], styles[variant], className, "typo-label-lg")} {...rest}>
      {leftIcon && <Icon name={leftIcon} size={iconSize} />}
      {children}
      {rightIcon && <Icon name={rightIcon} size={iconSize} />}
    </Link>
  );
};
