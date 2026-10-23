import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TabNavigation, type TabNavigationProps } from "@/components/navigation/TabNavigation";
import { Block, ComponentPage, Option, kit } from "../kit";

const TABS = [
  { value: "info", label: "정보" },
  { value: "reviews", label: "리뷰" },
  { value: "photos", label: "사진" },
  { value: "map", label: "지도" },
];

const Controlled = (props: Partial<TabNavigationProps>) => {
  const [value, setValue] = useState(props.value ?? "info");
  return <TabNavigation items={TABS} aria-label="맛집 상세" {...props} value={value} onChange={setValue} />;
};

const meta = {
  title: "Components/Navigation/TabNavigation",
  component: TabNavigation,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TabNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { items: TABS, value: "info" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Tab Navigation"
      description="가로 auto · 높이 48px. 아이템 2개 이상을 균등 분배하고, 레이블은 label-lg, 선택된 탭 하단에 2px 인디케이터를 표시합니다. 좌우 화살표 키로 이동합니다."
    >
      <Block title="Component">
        <div style={{ maxWidth: 360 }}>
          <Controlled />
        </div>
      </Block>
      <Block title="Options" usage="아이템 개수">
        <div className={kit.row}>
          <Option caption="2개" width={360}>
            <Controlled items={TABS.slice(0, 2)} />
          </Option>
          <Option caption="3개" width={360}>
            <Controlled items={TABS.slice(0, 3)} value="reviews" />
          </Option>
        </div>
      </Block>
      <Block title="Auto Width" usage="부모 너비에 맞춰 늘어납니다.">
        <Controlled />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { items: TABS, value: "info" },
  render: (args) => <Controlled {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
