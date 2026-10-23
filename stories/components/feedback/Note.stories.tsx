import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ICON_NAMES } from "@/components/icon/Icon";
import { Note } from "@/components/note/Note";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Feedback/Note",
  component: Note,
  parameters: { layout: "fullscreen" },
  argTypes: {
    icon: { control: "select", options: ICON_NAMES },
    tone: { control: "inline-radio", options: ["tertiary", "secondary"] },
  },
} satisfies Meta<typeof Note>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { children: "내가 쓴 글에만 보이는 버튼이에요" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Note"
      description="아이콘(16px) + 짧은 안내 문구(label-md). 버튼·입력칸 주변의 보조 설명이나 목록 끝 안내에 씁니다."
    >
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="기본 — info · tertiary">
            <Note>맛집 글쓰기는 로그인 후에 할 수 있어요</Note>
          </Option>
          <Option caption="목록 끝 — check · secondary · 가운데" width={320}>
            <Note icon="check" tone="secondary" center>
              마지막 맛집이에요
            </Note>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { children: "내가 쓴 글에만 보이는 버튼이에요", icon: "info", tone: "tertiary", center: false },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
