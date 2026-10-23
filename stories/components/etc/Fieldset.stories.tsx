import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { Icon } from "@/components/icon/Icon";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Etc/Fieldset",
  component: Fieldset,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Fieldset>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { legend: "주소" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Fieldset"
      description="관련 정보를 묶는 그룹 상자. 테두리(border-subtle) 위에 제목(label-md)이 걸칩니다. 내용 간격은 기본 12px, compact는 8px입니다."
    >
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="기본 — 주소" width={328}>
            <Fieldset legend="주소">
              <span className="typo-body-md">서울 구로구 오류로 8길 23</span>
            </Fieldset>
          </Option>
          <Option caption="목록 — 이런 곳이에요" width={328}>
            <Fieldset legend="이런 곳이에요">
              {["광고·협찬 없는 이웃의 진짜 추천", "구로에서 차로 1시간 이내"].map((text) => (
                <span key={text} className="typo-body-md" style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Icon name="check" size={20} style={{ color: "var(--color-text-brand)" }} />
                  {text}
                </span>
              ))}
            </Fieldset>
          </Option>
          <Option caption="compact — 닉네임 바꾸기" width={328}>
            <Fieldset legend="닉네임 바꾸기" compact>
              <span className="typo-body-md">개봉동먹보</span>
              <span className="typo-label-md" style={{ color: "var(--color-text-tertiary)" }}>
                2~12자
              </span>
            </Fieldset>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { legend: "주소", compact: false, children: <span className="typo-body-md">서울 구로구 오류로 8길 23</span> },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
