import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { ICON_NAMES } from "@/components/icon/Icon";
import { Menu, MenuItem, MENU_ITEM_VARIANTS } from "@/components/menu/Menu";
import { FIELD_SIZES } from "@/components/text-field/TextField";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Etc/MenuItem",
  component: MenuItem,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: { control: "inline-radio", options: MENU_ITEM_VARIANTS },
    size: { control: "inline-radio", options: FIELD_SIZES },
    icon: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof MenuItem>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZE_SPEC = { sm: "32px · icon 16px", md: "40px · icon 20px", lg: "48px · icon 20px" };

/** menuitem은 menu 안에서만 유효하므로 문서에서도 Menu(plain)로 감싼다. */
const Wrap = ({ children }: { children: ReactNode }) => (
  <Menu plain aria-label="예시">
    {children}
  </Menu>
);

const SAMPLE = {
  default: { icon: "edit" as const, label: "수정하기", usage: "일반 동작 — 수정, 공유, 복사" },
  destructive: { icon: "delete" as const, label: "삭제하기", usage: "되돌릴 수 없는 동작 — 삭제, 신고" },
};

export const Overview: Story = {
  args: { children: "수정하기" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Menu Item"
      description="타입(default · destructive) × 상태(default · disabled). 레이블 body-lg, 좌측 아이콘은 추가/제외할 수 있고 sm 16px · md·lg 20px입니다. 사이즈는 참조하는 메뉴를 따릅니다."
    >
      {MENU_ITEM_VARIANTS.map((variant) => (
        <Block key={variant} title={variant === "default" ? "Default" : "Destructive"} usage={SAMPLE[variant].usage}>
          <Matrix
            columns={["default", "disabled"]}
            rows={FIELD_SIZES.map((size) => ({
              label: size === "md" ? "md · 기본" : size,
              spec: SIZE_SPEC[size],
              cells: [false, true].map((disabled) => (
                <div key={String(disabled)} style={{ width: 220 }}>
                  <Wrap>
                    <MenuItem variant={variant} size={size} icon={SAMPLE[variant].icon} disabled={disabled}>
                      {SAMPLE[variant].label}
                    </MenuItem>
                  </Wrap>
                </div>
              )),
            }))}
          />
        </Block>
      ))}
      <Block title="Icon Options">
        <div className={kit.row}>
          <Option caption="좌측 아이콘 (기본)" width={220}>
            <Wrap>
              <MenuItem icon="share">공유하기</MenuItem>
            </Wrap>
          </Option>
          <Option caption="아이콘 없음" width={220}>
            <Wrap>
              <MenuItem>공유하기</MenuItem>
            </Wrap>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { children: "수정하기", variant: "default", size: "md", icon: "edit", disabled: false },
  render: (args) => (
    <div style={{ width: 220 }}>
      <Wrap>
        <MenuItem {...args} />
      </Wrap>
    </div>
  ),
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
