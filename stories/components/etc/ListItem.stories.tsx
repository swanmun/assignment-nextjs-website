import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ListItem } from "@/components/list-item/ListItem";
import { WindowWell } from "@/components/window/Window";
import { Block, ComponentPage, Option, kit } from "../kit";

const SAMPLE = { title: "오류동 골목 손칼국수", meta: "칼국수,만두", description: "서울 구로구 오류로8길 22" };

const RESULTS = [
  SAMPLE,
  { title: "명동 손칼국수 오류점", meta: "칼국수,만두", description: "서울 구로구 경인로 312" },
  { title: "오류시장 손칼국수", meta: "국수", description: "서울 구로구 오류로 36-1" },
];

const meta = {
  title: "Components/Etc/ListItem",
  component: ListItem,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ListItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: SAMPLE,
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="List Item"
      description="눌러서 고르는 목록 한 줄. 제목(label-lg)과 보조 정보(label-md · tertiary), 설명(label-md · secondary), 오른쪽 화살표(chevron-right 16)로 구성됩니다. 제목·설명이 길면 한 줄에서 말줄임합니다."
    >
      <Block title="Component" usage="장소 등록 — 네이버 지역 검색 결과 목록 (WindowWell 안)">
        <div style={{ maxWidth: 328 }}>
          <WindowWell>
            {RESULTS.map((item) => (
              <ListItem key={item.title} {...item} />
            ))}
          </WindowWell>
        </div>
      </Block>
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="제목 + 설명" width={296}>
            <ListItem title={SAMPLE.title} description={SAMPLE.description} />
          </Option>
          <Option caption="제목만" width={296}>
            <ListItem title={SAMPLE.title} />
          </Option>
          <Option caption="Disabled" width={296}>
            <ListItem {...SAMPLE} disabled />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: SAMPLE,
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
