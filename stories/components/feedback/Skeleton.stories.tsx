import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Skeleton, SKELETON_SHAPES } from "@/components/skeleton/Skeleton";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Feedback/Skeleton",
  component: Skeleton,
  parameters: { layout: "fullscreen" },
  argTypes: { shape: { control: "inline-radio", options: SKELETON_SHAPES } },
} satisfies Meta<typeof Skeleton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Skeleton"
      description="콘텐츠가 오기 전 자리를 잡아 두는 뉴트럴 도트 패턴. 텍스트형은 대상 텍스트의 행 높이, 사각형은 대상의 너비×높이, 원형은 대상의 지름을 따릅니다."
    >
      <Block title="Types">
        <div className={kit.row}>
          <Option caption="Text — 240 × 행 높이 20">
            <Skeleton shape="text" width={240} height={20} />
          </Option>
          <Option caption="Rect — 72 × 72">
            <Skeleton shape="rect" />
          </Option>
          <Option caption="Circle — 지름 40">
            <Skeleton shape="circle" />
          </Option>
        </div>
      </Block>
      <Block title="Sizing" usage="대상 요소의 타이포그래피 행 높이·크기를 그대로 씁니다.">
        <div className={kit.row}>
          <Option caption="heading-sm 한 줄 (20 × 1.2 = 24)">
            <Skeleton width={200} height={24} />
          </Option>
          <Option caption="body-md 한 줄 (14 × 1.4 ≈ 20)">
            <Skeleton width={280} height={20} />
          </Option>
          <Option caption="카드 이미지 (가로 전체 × 160)">
            <Skeleton shape="rect" width={280} height={160} />
          </Option>
        </div>
      </Block>
      <Block title="Usage" usage="맛집 카드 로딩">
        <div
          style={{
            width: 320,
            display: "flex",
            flexDirection: "column",
            gap: 6,
            border: "1px solid var(--color-border-default)",
            background: "var(--color-background-elevated)",
          }}
        >
          <Skeleton shape="rect" width="100%" height={160} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6, padding: 12 }}>
            <Skeleton width="70%" height={24} />
            <Skeleton width="50%" height={17} />
            <Skeleton height={20} />
            <Skeleton height={20} />
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <Skeleton shape="circle" size={18} />
              <Skeleton width={80} height={17} />
            </div>
          </div>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { shape: "rect", width: 120, height: 80, size: 40 },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
