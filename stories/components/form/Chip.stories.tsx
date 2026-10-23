import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Chip, CHIP_SIZES } from "@/components/chip/Chip";
import { ICON_NAMES } from "@/components/icon/Icon";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Form/Chip",
  component: Chip,
  parameters: { layout: "fullscreen" },
  argTypes: {
    size: { control: "inline-radio", options: CHIP_SIZES },
    icon: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Chip>;

export default meta;
type Story = StoryObj<typeof meta>;

const FILTERS = ["주차 가능", "단체석", "아이 동반", "혼밥", "늦게까지"];

const FilterRow = () => {
  const [selected, setSelected] = useState<string[]>(["주차 가능"]);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-8)" }}>
      {FILTERS.map((filter) => {
        const on = selected.includes(filter);
        return (
          <Chip
            key={filter}
            selected={on}
            icon={on ? "check" : undefined}
            onClick={() => setSelected((prev) => (on ? prev.filter((v) => v !== filter) : [...prev, filter]))}
          >
            {filter}
          </Chip>
        );
      })}
    </div>
  );
};

export const Overview: Story = {
  args: { children: "주차 가능" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Chip"
      description="선택(unselected · selected) × 상태(default · disabled). 레이블(label-lg) 가운데 정렬, 좌측 아이콘은 16px입니다. 좌우 패딩은 sm 12px(아이콘 6px) · md 16px(아이콘 8px)."
    >
      {CHIP_SIZES.slice()
        .reverse()
        .map((size) => (
          <Block key={size} title={`Size ${size}`} usage={size === "md" ? "높이 32px · 기본" : "높이 24px"}>
            <Matrix
              rowHeader="SELECTION"
              columns={["default", "disabled"]}
              rows={[false, true].map((selected) => ({
                label: selected ? "selected" : "unselected",
                cells: [
                  <Chip key="d" size={size} selected={selected}>
                    주차 가능
                  </Chip>,
                  <Chip key="x" size={size} selected={selected} disabled>
                    주차 가능
                  </Chip>,
                ],
              }))}
            />
          </Block>
        ))}
      <Block title="Icon Options" usage="icon으로 좌측 아이콘을 켜면 왼쪽 패딩이 줄어듭니다.">
        <div className={kit.row}>
          {CHIP_SIZES.map((size) => (
            <Option key={size} caption={`${size} · 좌측 아이콘`}>
              <Chip size={size} icon="check" selected>
                주차 가능
              </Chip>
            </Option>
          ))}
        </div>
      </Block>
      <Block title="Usage" usage="필터 나열 — 칩 사이 간격 spacing-8">
        <FilterRow />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { children: "주차 가능", size: "md", selected: false, disabled: false },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
