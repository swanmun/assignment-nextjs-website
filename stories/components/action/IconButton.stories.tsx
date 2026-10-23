import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES } from "@/components/icon/Icon";
import { IconButton, IconButtonLink, ICON_BUTTON_VARIANTS } from "@/components/icon-button/IconButton";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Action/IconButton",
  component: IconButton,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: { control: "inline-radio", options: ICON_BUTTON_VARIANTS },
    icon: { control: "select", options: ICON_NAMES },
  },
} satisfies Meta<typeof IconButton>;

export default meta;
type Story = StoryObj<typeof meta>;

const CAPTION = {
  ghost: "Ghost — 배경·테두리 없음",
  "circle-brand": "Circle-Brand — background-brand",
  "circle-neutral": "Circle-Neutral — background-surface",
};

export const Overview: Story = {
  args: { icon: "heart", "aria-label": "찜하기" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Icon Button"
      description="48×48 터치 영역 안에 24px 아이콘. 아이콘만 있으므로 aria-label이 필수입니다. Ghost는 부모의 글자색을 따릅니다."
    >
      <Block title="Variants">
        <div className={kit.row}>
          {ICON_BUTTON_VARIANTS.map((variant) => (
            <Option key={variant} caption={CAPTION[variant]}>
              <IconButton variant={variant} icon="heart" aria-label="찜하기" />
            </Option>
          ))}
        </div>
      </Block>
      <Block title="IconButtonLink" usage="페이지 이동은 IconButtonLink(Next.js Link)를 씁니다.">
        <div className={kit.row}>
          <Option caption="Ghost — 마이 페이지로">
            <IconButtonLink href="#" icon="user" aria-label="마이 페이지" />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { variant: "circle-brand", icon: "heart", "aria-label": "찜하기" },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
