import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/badge/Badge";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Navigation/TopNavigation",
  component: TopNavigation,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TopNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

const BACK = { icon: "arrow-left" as const, label: "뒤로 가기" };
const SHARE = { icon: "share" as const, label: "공유하기" };
const MORE = { icon: "more-vertical" as const, label: "더보기" };

export const Overview: Story = {
  args: { title: "맛집 상세" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Top Navigation"
      description="가로 전체 · 높이 56px. 제목은 heading-sm, 좌/우측 아이콘 버튼(Ghost, 아이콘 24px)은 추가/제외할 수 있습니다."
    >
      <Block title="Component">
        <div style={{ maxWidth: 360 }}>
          <TopNavigation title="맛집 상세" leftAction={BACK} rightActions={[SHARE]} />
        </div>
      </Block>
      <Block title="Options" usage="leftAction · rightActions 로 아이콘 버튼을 켜고 끕니다. href를 주면 링크로 렌더링하고, rightSlot에는 배지 등을 둘 수 있습니다.">
        <div className={kit.row}>
          <Option caption="좌측만" width={360}>
            <TopNavigation title="맛집 등록" leftAction={BACK} />
          </Option>
          <Option caption="우측만" width={360}>
            <TopNavigation title="숨은 맛집" rightActions={[{ icon: "search", label: "검색" }, { icon: "notification", label: "알림" }]} />
          </Option>
          <Option caption="제목만" width={360}>
            <TopNavigation title="내 정보" />
          </Option>
          <Option caption="우측 슬롯 — 상태 배지" width={360}>
            <TopNavigation title="맛집 등록" leftAction={BACK} rightSlot={<Badge tone="warning">작성 중</Badge>} />
          </Option>
          <Option caption="양측 + 우측 2개" width={360}>
            <TopNavigation title="맛집 상세" leftAction={BACK} rightActions={[SHARE, MORE]} />
          </Option>
        </div>
      </Block>
      <Block title="Full Width" usage="바탕은 부모 너비를 가득 채우고, 내용은 레이아웃 최대 너비(1280) 안에 정렬합니다.">
        <TopNavigation title="맛집 상세" leftAction={BACK} rightActions={[SHARE]} />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { title: "맛집 상세", leftAction: BACK, rightActions: [SHARE] },
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
