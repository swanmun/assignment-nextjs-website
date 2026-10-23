import type { ComponentPropsWithoutRef, ElementType } from "react";

export const TEXT_VARIANTS = [
  "display-lg",
  "display-md",
  "display-sm",
  "heading-lg",
  "heading-md",
  "heading-sm",
  "body-lg",
  "body-md",
  "label-lg",
  "label-md",
] as const;

export type TextVariant = (typeof TEXT_VARIANTS)[number];

const DEFAULT_TAG: Record<TextVariant, ElementType> = {
  "display-lg": "h1",
  "display-md": "h1",
  "display-sm": "h2",
  "heading-lg": "h2",
  "heading-md": "h3",
  "heading-sm": "h4",
  "body-lg": "p",
  "body-md": "p",
  "label-lg": "span",
  "label-md": "span",
};

export type TextProps<T extends ElementType = "span"> = {
  variant: TextVariant;
  /** 렌더링할 HTML 태그. 생략하면 variant에 맞는 기본 태그를 사용한다. */
  as?: T;
} & Omit<ComponentPropsWithoutRef<T>, "as">;

export const Text = <T extends ElementType = "span">({ variant, as, className, ...rest }: TextProps<T>) => {
  const Tag = as ?? DEFAULT_TAG[variant];
  return <Tag className={className ? `typo-${variant} ${className}` : `typo-${variant}`} {...rest} />;
};
