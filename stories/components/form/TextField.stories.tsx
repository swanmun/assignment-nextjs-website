import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, ICON_NAMES } from "@/components/icon/Icon";
import { FIELD_SIZES, TextField, TEXT_FIELD_TYPES, type TextFieldProps } from "@/components/text-field/TextField";
import { Block, ComponentPage, Matrix, Option, kit } from "../kit";

const meta = {
  title: "Components/Form/TextField",
  component: TextField,
  parameters: { layout: "fullscreen" },
  argTypes: {
    type: { control: "inline-radio", options: TEXT_FIELD_TYPES },
    size: { control: "inline-radio", options: FIELD_SIZES },
    leftIcon: { control: "select", options: [undefined, ...ICON_NAMES] },
    rightIcon: { control: "select", options: [undefined, ...ICON_NAMES] },
  },
} satisfies Meta<typeof TextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const SIZE_SPEC = { sm: "32px · icon 16px", md: "40px · icon 20px", lg: "48px · icon 20px" };

const TYPES = {
  text: {
    title: "Text",
    usage: "일반 텍스트 입력 — 맛집 이름, 주소, 검색어",
    base: { label: "맛집 이름", placeholder: "예) 구로시장 할매 순대국", hint: "2~50자로 입력해 주세요.", leftIcon: "edit" },
    value: "구로시장 할매 순대국",
    error: { value: "구", error: "2자 이상 입력해 주세요." },
  },
  password: {
    title: "Password",
    usage: "비밀번호 입력 — 왼쪽 자물쇠, 오른쪽 보기/숨기기 토글이 고정입니다.",
    base: { label: "비밀번호", placeholder: "비밀번호 입력", hint: "영문·숫자 포함 8자 이상" },
    value: "foodie1234",
    error: { value: "1234", error: "영문과 숫자를 함께 넣어 8자 이상 입력해 주세요." },
  },
} satisfies Record<string, { title: string; usage: string; base: Partial<TextFieldProps>; value: string; error: Partial<TextFieldProps> }>;

export const Overview: Story = {
  args: { label: "맛집 이름" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Text Field"
      description="상단 레이블(label-lg) · 입력텍스트(body-lg) · 하단 헬퍼텍스트(label-md). 에러가 있으면 힌트를 대체합니다. 입력 좌/우측 아이콘은 sm 16px, md·lg 20px입니다."
    >
      {TEXT_FIELD_TYPES.map((type) => {
        const t = TYPES[type];
        return (
          <Block key={type} title={t.title} usage={t.usage}>
            <Matrix
              columns={["default", "focused", "disabled", "error"]}
              rows={FIELD_SIZES.map((size) => ({
                label: size === "md" ? "md · 기본" : size,
                spec: SIZE_SPEC[size],
                cells: [
                  <TextField key="d" type={type} size={size} {...t.base} />,
                  <div key="f" className={kit.forceFocus} style={{ width: "100%" }}>
                    <TextField type={type} size={size} {...t.base} defaultValue={t.value} />
                  </div>,
                  <TextField key="x" type={type} size={size} {...t.base} defaultValue={t.value} disabled />,
                  <TextField key="e" type={type} size={size} {...t.base} defaultValue={t.error.value} error={t.error.error} />,
                ],
              }))}
            />
          </Block>
        );
      })}
      <Block title="Icon Options" usage="text 타입은 leftIcon · rightIcon 으로 입력 좌/우측 아이콘을 켜고 끕니다.">
        <div className={kit.row}>
          {[
            { caption: "좌측 아이콘 (기본)", leftIcon: "edit" as const },
            { caption: "우측 아이콘", rightIcon: "close" as const },
            { caption: "양측 아이콘", leftIcon: "search" as const, rightIcon: "close" as const },
            { caption: "아이콘 없음" },
          ].map(({ caption, ...icons }) => (
            <Option key={caption} caption={caption} width={240}>
              <TextField label="검색" placeholder="동네, 메뉴로 검색" {...icons} />
            </Option>
          ))}
        </div>
      </Block>
      <Block title="Label · Adornment" usage="hideLabel은 레이블을 스크린리더에만 남깁니다. rightAdornment는 오른쪽 아이콘 자리에 성공 체크·지우기 버튼 등을 둡니다.">
        <div className={kit.row}>
          <Option caption="hideLabel — 검색줄" width={240}>
            <TextField label="맛집 검색" hideLabel leftIcon="search" placeholder="맛집 이름, 주소, 메뉴 검색" />
          </Option>
          <Option caption="rightAdornment — 입력 완료" width={240}>
            <TextField
              label="맛집 이름 *"
              defaultValue="구로시장 할매 순대국"
              hint="10/50자"
              rightAdornment={<Icon name="check" size={20} style={{ color: "var(--color-text-success)" }} aria-label="입력 완료" />}
            />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: {
    label: "맛집 이름",
    type: "text",
    size: "md",
    placeholder: "예) 구로시장 할매 순대국",
    hint: "2~50자로 입력해 주세요.",
    leftIcon: "edit",
    disabled: false,
  },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
