import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { CONTROL_SIZES } from "@/components/checkbox/Checkbox";
import { Radio, RadioGroup, type RadioGroupProps } from "@/components/radio/Radio";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Form/Radio",
  component: RadioGroup,
  subcomponents: { Radio },
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "inline-radio", options: CONTROL_SIZES },
    direction: { control: "inline-radio", options: ["vertical", "horizontal"] },
  },
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

const SORTS = [
  { value: "latest", label: "최신순" },
  { value: "popular", label: "인기순" },
  { value: "distance", label: "가까운순" },
];

const SortGroup = (props: Partial<RadioGroupProps>) => {
  const [value, setValue] = useState("latest");
  return (
    <RadioGroup label="정렬 기준" {...props} value={value} onChange={setValue}>
      {SORTS.map((sort) => (
        <Radio key={sort.value} {...sort} />
      ))}
    </RadioGroup>
  );
};

/** 매트릭스 셀 — 라디오는 단독 사용 금지라 셀마다 1개짜리 그룹으로 감싼다. */
const Cell = ({ size, selected, disabled }: { size: "sm" | "md"; selected: boolean; disabled?: boolean }) => (
  <RadioGroup label="예시" hideLabel size={size} value={selected ? "a" : ""} disabled={disabled}>
    <Radio value="a" label="최신순" readOnly />
  </RadioGroup>
);

export const Overview: Story = {
  args: { label: "정렬 기준", children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Radio"
      description="선택(unselected · selected) × 상태(default · disabled). 라디오 영역은 직접 그리며 레이블(body-md)과 8px 간격을 둡니다. 단독 사용은 금지이며 반드시 RadioGroup 안에서 씁니다."
    >
      {CONTROL_SIZES.slice()
        .reverse()
        .map((size) => (
          <Block key={size} title={`Size ${size}`} usage={size === "md" ? "라디오 영역 20px · 기본" : "라디오 영역 16px"}>
            <Matrix
              rowHeader="SELECTION"
              columns={["default", "disabled"]}
              rows={[false, true].map((selected) => ({
                label: selected ? "selected" : "unselected",
                cells: [
                  <Cell key="d" size={size} selected={selected} />,
                  <Cell key="x" size={size} selected={selected} disabled />,
                ],
              }))}
            />
          </Block>
        ))}
      <Block title="Usage" usage="같은 질문에 대한 선택지 2개 이상을 묶어 하나만 고르게 합니다.">
        <div className={kit.row}>
          <Option caption="세로 배치">
            <SortGroup />
          </Option>
          <Option caption="가로 배치">
            <SortGroup direction="horizontal" />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { label: "정렬 기준", size: "md", direction: "vertical", disabled: false, children: null },
  render: (args) => <SortGroup {...args} />,
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
