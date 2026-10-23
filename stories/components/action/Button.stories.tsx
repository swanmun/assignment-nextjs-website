import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button, ButtonLink, BUTTON_SIZES, BUTTON_VARIANTS, type ButtonVariant } from "@/components/button/Button";
import { ICON_NAMES, type IconName } from "@/components/icon/Icon";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Action/Button",
  component: Button,
  parameters: { layout: "fullscreen" },
  argTypes: {
    variant: { control: "inline-radio", options: BUTTON_VARIANTS },
    size: { control: "inline-radio", options: BUTTON_SIZES },
    leftIcon: { control: "select", options: [undefined, ...ICON_NAMES] },
    rightIcon: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const SAMPLE: Record<ButtonVariant, { label: string; icon: IconName; usage: string }> = {
  primary: { label: "등록하기", icon: "check", usage: "화면의 핵심 행동 1개에만 사용합니다 — 등록, 저장, 확인" },
  secondary: { label: "수정", icon: "edit", usage: "보조 행동에 사용합니다 — 취소, 수정, 더보기" },
  destructive: { label: "삭제", icon: "delete", usage: "되돌릴 수 없는 행동에 사용합니다 — 삭제, 탈퇴" },
};

const SIZE_SPEC = { sm: "32px · icon 16px", md: "40px · icon 20px", lg: "48px · icon 20px" };

export const Overview: Story = {
  args: { children: "버튼" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Button"
      description="타입(primary · secondary · destructive) × 상태(default · disabled · loading) × 사이즈(sm · md · lg). 레이블은 label-lg, loading은 왼쪽 아이콘을 스피너로 바꾸고 레이블을 유지합니다."
    >
      {BUTTON_VARIANTS.map((variant) => {
        const { label, icon, usage } = SAMPLE[variant];
        return (
          <Block key={variant} title={variant[0].toUpperCase() + variant.slice(1)} usage={usage}>
            <Matrix
              columns={["default", "disabled", "loading"]}
              rows={BUTTON_SIZES.map((size) => ({
                label: size === "md" ? "md · 기본" : size,
                spec: SIZE_SPEC[size],
                cells: [
                  <Button key="d" variant={variant} size={size} leftIcon={icon}>
                    {label}
                  </Button>,
                  <Button key="x" variant={variant} size={size} leftIcon={icon} disabled>
                    {label}
                  </Button>,
                  <Button key="l" variant={variant} size={size} loading>
                    {label}
                  </Button>,
                ],
              }))}
            />
          </Block>
        );
      })}
      <Block title="Icon Options" usage="레이블 좌/우측 아이콘은 leftIcon · rightIcon 으로 켜고 끕니다.">
        <div className={kit.row}>
          <Option caption="좌측 아이콘 (기본)">
            <Button leftIcon="check">등록하기</Button>
          </Option>
          <Option caption="우측 아이콘">
            <Button rightIcon="chevron-right">등록하기</Button>
          </Option>
          <Option caption="양측 아이콘">
            <Button leftIcon="check" rightIcon="chevron-right">
              등록하기
            </Button>
          </Option>
          <Option caption="레이블만">
            <Button>등록하기</Button>
          </Option>
        </div>
      </Block>
      <Block title="ButtonLink" usage="페이지 이동은 ButtonLink(Next.js Link)를 씁니다. 모양과 옵션은 Button과 같습니다.">
        <div className={kit.row}>
          <Option caption="primary · lg — 플로팅 맛집 쓰기">
            <ButtonLink href="#" size="lg" leftIcon="edit">
              맛집 쓰기
            </ButtonLink>
          </Option>
          <Option caption="secondary · 우측 아이콘">
            <ButtonLink href="#" variant="secondary" rightIcon="chevron-right">
              로그인 없이 둘러보기
            </ButtonLink>
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { variant: "primary", size: "md", leftIcon: "check", children: "등록하기", loading: false, disabled: false },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
