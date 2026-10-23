import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Text, TEXT_VARIANTS, type TextVariant } from "@/components/typography/Text";
import { DocPage } from "./DocPage";
import styles from "./foundation.module.css";

const SAMPLE = "오늘 뭐 먹지? 동네 맛집 한 끼 추천";

const SPEC: Record<TextVariant, [size: string, weight: string, lineHeight: string]> = {
  "display-lg": ["font-size-800", "font-weight-bold", "font-line-height-tight"],
  "display-md": ["font-size-700", "font-weight-bold", "font-line-height-tight"],
  "display-sm": ["font-size-600", "font-weight-bold", "font-line-height-tight"],
  "heading-lg": ["font-size-500", "font-weight-bold", "font-line-height-tight"],
  "heading-md": ["font-size-400", "font-weight-bold", "font-line-height-tight"],
  "heading-sm": ["font-size-300", "font-weight-semibold", "font-line-height-tight"],
  "body-lg": ["font-size-300", "font-weight-regular", "font-line-height-normal"],
  "body-md": ["font-size-200", "font-weight-regular", "font-line-height-normal"],
  "label-lg": ["font-size-200", "font-weight-semibold", "font-line-height-normal"],
  "label-md": ["font-size-100", "font-weight-regular", "font-line-height-normal"],
};

const meta = {
  title: "Foundation/Typography",
  component: Text,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: { control: "select", options: TEXT_VARIANTS },
  },
} satisfies Meta<typeof Text>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Scale: Story = {
  args: { variant: "display-lg" },
  parameters: { controls: { disable: true } },
  render: () => (
    <DocPage
      title="Typography — Primitive Scale"
      description="Pretendard Variable 기반 10개 텍스트 스타일. 모든 스타일에 공통 자간 -2%를 적용합니다. 코드에서는 <Text variant> 또는 .typo-* 클래스로 사용합니다."
    >
      {TEXT_VARIANTS.map((variant) => (
        <div key={variant} className={styles.typeRow}>
          <div className={styles.typeMeta}>
            <span className={styles.mono} style={{ fontWeight: 700 }}>
              {variant}
            </span>
            {SPEC[variant].map((token) => (
              <span key={token} className={`${styles.mono} ${styles.muted}`}>
                {token}
              </span>
            ))}
          </div>
          <Text variant={variant}>{SAMPLE}</Text>
        </div>
      ))}
    </DocPage>
  ),
};

export const Playground: Story = {
  args: { variant: "heading-lg", children: SAMPLE },
  parameters: { layout: "padded" },
};
