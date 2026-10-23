import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CONTROL_SIZES } from "@/components/checkbox/Checkbox";
import { Switch } from "@/components/switch/Switch";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Form/Switch",
  component: Switch,
  parameters: { layout: "fullscreen" },
  argTypes: { size: { control: "inline-radio", options: CONTROL_SIZES } },
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { label: "알림 받기" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Switch"
      description="선택(off · on) × 상태(default · disabled). 바로 적용되는 설정에 단독으로만 사용합니다. 레이블(body-md)과 트랙 사이 간격은 8px입니다."
    >
      {CONTROL_SIZES.slice()
        .reverse()
        .map((size) => (
          <Block key={size} title={`Size ${size}`} usage={size === "md" ? "트랙 40×20 · 기본" : "트랙 32×16"}>
            <Matrix
              rowHeader="SELECTION"
              columns={["default", "disabled"]}
              rows={[false, true].map((checked) => ({
                label: checked ? "on" : "off",
                cells: [
                  <Switch key="d" size={size} label="알림 받기" checked={checked} readOnly />,
                  <Switch key="x" size={size} label="알림 받기" checked={checked} readOnly disabled />,
                ],
              }))}
            />
          </Block>
        ))}
      <Block title="Usage" usage="눌러서 바로 켜고 끄는 설정 한 가지에 사용합니다. 여러 항목을 고를 때는 체크박스를 씁니다.">
        <div className={kit.row}>
          <Option caption="단독 사용 — 설정 화면">
            <Switch label="새 댓글 알림 받기" defaultChecked />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { label: "알림 받기", size: "md", disabled: false },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
