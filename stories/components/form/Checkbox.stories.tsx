import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Checkbox, CheckboxGroup, CONTROL_SIZES } from "@/components/checkbox/Checkbox";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Form/Checkbox",
  component: Checkbox,
  parameters: { layout: "fullscreen" },
  argTypes: { size: { control: "inline-radio", options: CONTROL_SIZES } },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

const SELECTIONS = [
  { label: "unchecked", props: {} },
  { label: "checked", props: { checked: true } },
  { label: "indeterminate", props: { checked: true, indeterminate: true } },
];

const AMENITIES = ["주차 가능", "단체석", "아이 동반", "반려동물"];

const GroupExample = () => {
  const [checked, setChecked] = useState<string[]>([]);
  const all = checked.length === AMENITIES.length;
  const some = checked.length > 0 && !all;
  const toggle = (item: string) =>
    setChecked((prev) => (prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]));

  return (
    <CheckboxGroup label="편의시설" error={checked.length === 0 ? "편의시설을 1개 이상 선택해 주세요." : undefined}>
      <Checkbox
        label="전체 선택"
        checked={all}
        indeterminate={some}
        onChange={() => setChecked(all ? [] : AMENITIES)}
        error={checked.length === 0}
      />
      {AMENITIES.map((item) => (
        <Checkbox
          key={item}
          label={item}
          checked={checked.includes(item)}
          onChange={() => toggle(item)}
          error={checked.length === 0}
        />
      ))}
    </CheckboxGroup>
  );
};

export const Overview: Story = {
  args: { label: "주차 가능" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Checkbox"
      description="선택(unchecked · checked · indeterminate) × 상태(default · disabled · error). 체크 영역은 아이코노그래피 아이콘을 쓰지 않고 직접 그리며, 레이블(body-md)과 8px 간격을 둡니다."
    >
      {CONTROL_SIZES.slice()
        .reverse()
        .map((size) => (
          <Block key={size} title={`Size ${size}`} usage={size === "md" ? "체크 영역 20px · 기본" : "체크 영역 16px"}>
            <Matrix
              rowHeader="SELECTION"
              columns={["default", "disabled", "error"]}
              rows={SELECTIONS.map(({ label, props }) => ({
                label,
                cells: [
                  <Checkbox key="d" size={size} label="주차 가능" readOnly {...props} />,
                  <Checkbox key="x" size={size} label="주차 가능" readOnly disabled {...props} />,
                  <Checkbox key="e" size={size} label="주차 가능" readOnly error {...props} />,
                ],
              }))}
            />
          </Block>
        ))}
      <Block title="Usage" usage="단독 또는 그룹으로 사용합니다. 그룹의 에러 메시지는 그룹 아래에 한 번만 표시합니다.">
        <div className={kit.row}>
          <Option caption="단독 — 약관 동의">
            <Checkbox label="위치 정보 이용에 동의합니다" />
          </Option>
          <Option caption="그룹 — 전체 선택(indeterminate) + 그룹 에러">
            <GroupExample />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { label: "주차 가능", size: "md", indeterminate: false, error: false, disabled: false },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
