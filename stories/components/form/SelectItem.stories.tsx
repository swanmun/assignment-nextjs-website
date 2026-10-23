import type { ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { SelectItem } from "@/components/select/SelectItem";
import { FIELD_SIZES } from "@/components/text-field/TextField";
import { Block, ComponentPage, Matrix, kit } from "../kit";

const meta = {
  title: "Components/Form/SelectItem",
  component: SelectItem,
  parameters: { layout: "fullscreen" },
  argTypes: { size: { control: "inline-radio", options: FIELD_SIZES } },
} satisfies Meta<typeof SelectItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZE_SPEC = { sm: "32px · icon 16px", md: "40px · icon 20px", lg: "48px · icon 20px" };

/** option은 listbox 안에서만 유효하므로 문서에서도 listbox로 감싼다. */
const List = ({ children }: { children: ReactNode }) => (
  <ul role="listbox" aria-label="예시" style={{ width: 240, margin: 0, padding: 0 }}>
    {children}
  </ul>
);

export const Overview: Story = {
  args: { children: "구로구" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Select Item"
      description="셀렉트 패널·바텀시트 안의 선택지. 왼쪽 텍스트(body-lg), 선택되면 오른쪽에 체크 아이콘을 표시합니다. 사이즈는 참조하는 셀렉트를 따릅니다."
    >
      <Block title="States">
        <Matrix
          columns={["default", "selected", "disabled"]}
          rows={FIELD_SIZES.map((size) => ({
            label: size === "md" ? "md · 기본" : size,
            spec: SIZE_SPEC[size],
            cells: [
              <List key="d">
                <SelectItem size={size}>구로구</SelectItem>
              </List>,
              <List key="s">
                <SelectItem size={size} selected>
                  금천구
                </SelectItem>
              </List>,
              <List key="x">
                <SelectItem size={size} disabled>
                  강서구 (준비 중)
                </SelectItem>
              </List>,
            ],
          }))}
        />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { children: "금천구", size: "md", selected: true, disabled: false },
  render: (args) => (
    <List>
      <SelectItem {...args} />
    </List>
  ),
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
