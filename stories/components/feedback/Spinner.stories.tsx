import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/button/Button";
import { Spinner } from "@/components/spinner/Spinner";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Feedback/Spinner",
  component: Spinner,
  parameters: { layout: "fullscreen" },
  argTypes: { color: { control: "color" } },
} satisfies Meta<typeof Spinner>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Spinner"
      description="진행 중임을 알리는 270° 호. 기본 md(24px), 브랜드 컬러입니다. 버튼·파일 아이템 안에서는 아이콘 크기(16·20px)와 주변 글자색에 맞춰 씁니다."
    >
      <Block title="Component">
        <div className={kit.row}>
          <Option caption="md · 24px · text-brand">
            <Spinner />
          </Option>
        </div>
      </Block>
      <Block title="Usage" usage="다른 컴포넌트 안에서의 사용 예">
        <div className={kit.row}>
          <Option caption="Button loading (sm · 16px)">
            <Button size="sm" loading>
              등록하기
            </Button>
          </Option>
          <Option caption="Button loading (md · 20px)">
            <Button loading>등록하기</Button>
          </Option>
          <Option caption="Secondary loading">
            <Button variant="secondary" loading>
              불러오는 중
            </Button>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { size: 24, label: "로딩 중" },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
