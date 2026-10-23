import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { Select, type SelectOption, type SelectProps } from "@/components/select/Select";
import { SelectItem } from "@/components/select/SelectItem";
import { FIELD_SIZES } from "@/components/text-field/TextField";
import { Block, Caption, ComponentPage, Matrix, Phone, kit } from "../kit";

const meta = {
  title: "Components/Form/Select",
  component: Select,
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "inline-radio", options: FIELD_SIZES },
    presentation: { control: "inline-radio", options: ["auto", "dropdown", "sheet"] },
  },
} satisfies Meta<typeof Select>;

export default meta;
type Story = StoryObj<typeof meta>;

const DISTRICTS: SelectOption[] = [
  { value: "guro", label: "구로구" },
  { value: "geumcheon", label: "금천구" },
  { value: "yeongdeungpo", label: "영등포구" },
  { value: "gangseo", label: "강서구 (준비 중)", disabled: true },
];

const BASE = { label: "지역", options: DISTRICTS, placeholder: "지역을 선택하세요", hint: "맛집이 있는 구를 선택해 주세요." };
const SIZE_SPEC = { sm: "32px · icon 16px", md: "40px · icon 20px", lg: "48px · icon 20px" };

const Controlled = (props: Partial<SelectProps>) => {
  const [value, setValue] = useState(props.value);
  return <Select {...BASE} {...props} value={value} onChange={setValue} />;
};

export const Overview: Story = {
  args: BASE,
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Select"
      description="상단 레이블(label-lg) · 선택값(body-lg) · 하단 헬퍼텍스트(label-md) · 오른쪽 아래 방향 꺾쇠. Focused는 패널이 열려 있는 동안 유지됩니다. 데스크톱은 셀렉트 아래 패널, 모바일은 바텀시트 안에 셀렉트아이템을 표시합니다."
    >
      <Block title="States">
        <Matrix
          columns={["default", "focused", "disabled", "error"]}
          rows={FIELD_SIZES.map((size) => ({
            label: size === "md" ? "md · 기본" : size,
            spec: SIZE_SPEC[size],
            cells: [
              <Controlled key="d" size={size} />,
              <div key="f" className={kit.forceFocus} style={{ width: "100%" }}>
                <Controlled size={size} value="geumcheon" />
              </div>,
              <Controlled key="x" size={size} value="guro" disabled />,
              <Controlled key="e" size={size} error="지역을 선택해 주세요." />,
            ],
          }))}
        />
      </Block>
      <Block title="연결범위" usage="Focused(패널 열림) 상태에서 셀렉트아이템을 연결합니다. 셀렉트아이템은 셀렉트와 같은 사이즈를 사용합니다.">
        <div className={kit.row} style={{ alignItems: "flex-start" }}>
          {(["md", "sm"] as const).map((size) => (
            <div key={size} className={kit.option} style={{ width: 240, minHeight: 300 }}>
              <Caption>{`데스크톱 · ${size} — 셀렉트 아래 패널`}</Caption>
              <Controlled size={size} value="geumcheon" presentation="dropdown" defaultOpen />
            </div>
          ))}
          <div className={kit.option}>
            <Caption>모바일 · lg — 바텀시트</Caption>
            <Phone>
              <div className={kit.phoneBody}>
                <Select {...BASE} size="lg" value="geumcheon" />
              </div>
              <BottomSheet open contained onClose={() => {}} title="지역">
                <ul role="listbox" aria-label="지역" style={{ margin: "0 -8px", padding: 0 }}>
                  {DISTRICTS.map((option) => (
                    <SelectItem key={option.value} size="lg" selected={option.value === "geumcheon"} disabled={option.disabled}>
                      {option.label}
                    </SelectItem>
                  ))}
                </ul>
              </BottomSheet>
            </Phone>
          </div>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { ...BASE, size: "md", presentation: "auto", disabled: false },
  render: (args) => <Controlled {...args} />,
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360, minHeight: 320 }}>{Story()}</div>],
};
