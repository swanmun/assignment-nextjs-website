import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Empty } from "@/components/empty/Empty";
import { Block, ComponentPage, Option, kit } from "../kit";

const SAMPLE = {
  visual: "search" as const,
  title: "아직 등록된 맛집이 없어요",
  description: "우리 동네 숨은 맛집을 가장 먼저 소개해 주세요.",
  secondaryAction: { label: "다른 지역 보기", leftIcon: "search" as const },
  primaryAction: { label: "맛집 쓰기", leftIcon: "edit" as const },
};

const meta = {
  title: "Components/Etc/Empty",
  component: Empty,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Empty>;

export default meta;
type Story = StoryObj<typeof meta>;

const frame = { border: "1px solid var(--color-border-default)", background: "var(--color-background-default)" };

export const Overview: Story = {
  args: SAMPLE,
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Empty"
      description="보여줄 내용이 없을 때의 화면. 가로·세로 중앙 정렬. 비주얼(아이콘·그림), 설명(body-md), 액션(primary 1개 · secondary 1개)은 추가/제외할 수 있고 제목(heading-sm)은 필수입니다."
    >
      <Block title="Component">
        <div style={{ ...frame, maxWidth: 360 }}>
          <Empty {...SAMPLE} />
        </div>
      </Block>
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="제목 + 설명" width={360}>
            <div style={frame}>
              <Empty title={SAMPLE.title} description={SAMPLE.description} />
            </div>
          </Option>
          <Option caption="비주얼 + 제목 + primary" width={360}>
            <div style={frame}>
              <Empty visual="comment" title="아직 댓글이 없어요" primaryAction={{ label: "댓글 쓰기", leftIcon: "edit" }} />
            </div>
          </Option>
          <Option caption="제목만" width={360}>
            <div style={frame}>
              <Empty title="검색 결과가 없어요" />
            </div>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: SAMPLE,
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
