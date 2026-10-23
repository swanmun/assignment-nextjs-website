import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { TextArea } from "@/components/text-area/TextArea";
import { Block, ComponentPage, Matrix, kit } from "../kit";

const meta = {
  title: "Components/Form/TextArea",
  component: TextArea,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TextArea>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = {
  label: "추천 내용",
  placeholder: "추천 이유, 메뉴, 분위기, 주차 정보를 자유롭게 적어 주세요.",
  hint: "맛집을 추천하는 이유를 적어 주세요.",
  maxLength: 2000,
};

const LONG =
  "사골 육수에 손으로 뽑은 면이 정말 쫄깃해요. 가게 뒤 공터에 주차 6대 가능하고, 아이용 작은 그릇도 따로 줘요. 주말 점심엔 11시 반 전에 가야 대기 없어요.";

export const Overview: Story = {
  args: { label: "추천 내용" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Text Area"
      description="고정 높이 3줄(88px), 내용이 넘치면 스크롤됩니다. 하단에 헬퍼텍스트(label-md)와 글자수 카운터(label-md)를 둡니다. 에러가 있으면 힌트를 대체합니다."
    >
      <Block title="States">
        <Matrix
          rowHeader=""
          columns={["default", "focused", "disabled", "error"]}
          rows={[
            {
              label: "기본",
              spec: "3줄 고정 · 스크롤",
              cells: [
                <TextArea key="d" {...BASE} />,
                <div key="f" className={kit.forceFocus} style={{ width: "100%" }}>
                  <TextArea {...BASE} defaultValue={LONG} />
                </div>,
                <TextArea key="x" {...BASE} defaultValue="작성 기간이 지나 수정할 수 없어요." disabled />,
                <TextArea key="e" {...BASE} error="추천 내용을 입력해 주세요." />,
              ],
            },
          ]}
        />
      </Block>
      <Block title="Options" usage="showCounter로 글자수 카운터를 켜고 끕니다. maxLength가 있으면 '현재/최대'로 표시합니다.">
        <div className={kit.row}>
          <div style={{ width: 320 }}>
            <TextArea {...BASE} />
          </div>
          <div style={{ width: 320 }}>
            <TextArea {...BASE} showCounter={false} />
          </div>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { ...BASE, showCounter: true, disabled: false },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 400 }}>{Story()}</div>],
};
