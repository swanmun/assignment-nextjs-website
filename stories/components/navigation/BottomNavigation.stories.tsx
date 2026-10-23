import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Heart, House, MagnifyingGlass, PencilSimple, User } from "@phosphor-icons/react";
import { BottomNavigation, type BottomNavigationProps } from "@/components/navigation/BottomNavigation";
import { Block, ComponentPage, Option, kit } from "../kit";

const ITEMS = [
  { value: "home", label: "홈", icon: House },
  { value: "search", label: "검색", icon: MagnifyingGlass },
  { value: "write", label: "글쓰기", icon: PencilSimple },
  { value: "likes", label: "찜", icon: Heart },
  { value: "me", label: "내 정보", icon: User },
];

const Controlled = (props: Partial<BottomNavigationProps>) => {
  const [value, setValue] = useState(props.value ?? "home");
  return <BottomNavigation items={ITEMS} {...props} value={value} onChange={setValue} />;
};

const meta = {
  title: "Components/Navigation/BottomNavigation",
  component: BottomNavigation,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomNavigation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { items: ITEMS, value: "home" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Bottom Navigation"
      description="가로 전체 · 높이 56px. 아이템 2~5개를 균등 분배합니다. 아이콘(24px)은 필수 — 미선택은 아웃라인 + 뉴트럴, 선택은 필 + 브랜드 컬러. 아이콘 아래 레이블(label-md)은 추가/제외할 수 있습니다."
    >
      <Block title="Component">
        <div style={{ maxWidth: 360 }}>
          <Controlled />
        </div>
      </Block>
      <Block title="Options" usage="아이템 개수와 레이블 표시 여부">
        <div className={kit.row}>
          <Option caption="5개 · 레이블" width={360}>
            <Controlled value="search" />
          </Option>
          <Option caption="3개 · 레이블" width={360}>
            <Controlled items={ITEMS.slice(0, 3)} />
          </Option>
          <Option caption="5개 · 아이콘만" width={360}>
            <Controlled showLabels={false} value="likes" />
          </Option>
          <Option caption="2개 · 레이블" width={360}>
            <Controlled items={[ITEMS[0], ITEMS[4]]} value="me" />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { items: ITEMS, value: "home", showLabels: true },
  render: (args) => <Controlled {...args} />,
  decorators: [(Story) => <div style={{ maxWidth: 360 }}>{Story()}</div>],
};
