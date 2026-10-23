import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge, BADGE_SIZES, BADGE_TONES, type BadgeTone } from "@/components/badge/Badge";
import { Block, ComponentPage, Matrix, kit } from "../kit";

const meta = {
  title: "Components/Etc/Badge",
  component: Badge,
  parameters: { layout: "fullscreen" },
  argTypes: {
    tone: { control: "inline-radio", options: BADGE_TONES },
    size: { control: "inline-radio", options: BADGE_SIZES },
  },
} satisfies Meta<typeof Badge>;

export default meta;
type Story = StoryObj<typeof meta>;

const LABEL: Record<BadgeTone, string> = {
  neutral: "리뷰 12",
  success: "영업 중",
  error: "폐업",
  info: "내 글",
  warning: "곧 마감",
};

export const Overview: Story = {
  args: { children: "리뷰 12" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Badge"
      description="상태·수량을 짧게 표시합니다. 레이블은 label-md 가운데 정렬, 좌우 패딩 8px. md 20px · lg 24px."
    >
      <Block title="Types" usage="neutral · success · error · info · warning">
        <Matrix
          rowHeader="TYPE"
          columns={["md · 20px", "lg · 24px"]}
          rows={BADGE_TONES.map((tone) => ({
            label: tone,
            cells: BADGE_SIZES.map((size) => (
              <Badge key={size} tone={tone} size={size}>
                {LABEL[tone]}
              </Badge>
            )),
          }))}
        />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { tone: "success", size: "md", children: "영업 중" },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
