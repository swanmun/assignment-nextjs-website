import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Toast, TOAST_TYPES, type ToastType } from "@/components/toast/Toast";
import { Block, ComponentPage, Option, Phone, kit } from "../kit";

const meta = {
  title: "Components/Feedback/Toast",
  component: Toast,
  parameters: { layout: "fullscreen" },
  argTypes: { type: { control: "inline-radio", options: TOAST_TYPES } },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

const MESSAGE: Record<ToastType, string> = {
  success: "맛집이 등록됐어요.",
  error: "사진을 올리지 못했어요. 다시 시도해 주세요.",
  info: "주소를 복사했어요.",
  warning: "작성 중인 글은 임시 저장돼요.",
};

const noop = () => {};

export const Overview: Story = {
  args: { type: "success", children: MESSAGE.success },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Toast"
      description="잠깐 떠서 결과를 알리는 메시지. 좌측에 타입별 상태 아이콘(20px), 메시지(body-md), 우측 닫기 아이콘(20px, 추가/제외 가능). 데스크톱 400px, 모바일은 화면 너비에서 좌우 마진을 뺀 너비입니다."
    >
      <Block title="Types" usage="success · error · info · warning">
        <div style={{ display: "grid", gap: 16 }}>
          {TOAST_TYPES.map((type) => (
            <Toast key={type} type={type} onClose={noop}>
              {MESSAGE[type]}
            </Toast>
          ))}
        </div>
      </Block>
      <Block title="Options" usage="onClose를 넘기지 않으면 닫기 아이콘이 빠집니다.">
        <div className={kit.row}>
          <Option caption="닫기 아이콘 있음" width={400}>
            <Toast type="info" onClose={noop}>
              {MESSAGE.info}
            </Toast>
          </Option>
          <Option caption="닫기 아이콘 없음" width={400}>
            <Toast type="info">{MESSAGE.info}</Toast>
          </Option>
        </div>
      </Block>
      <Block title="Placement" usage="모바일 — 화면 너비 - 좌우 마진(16px)">
        <Phone>
          <div style={{ marginTop: "auto", padding: 16 }}>
            <Toast type="error" onClose={noop}>
              {MESSAGE.error}
            </Toast>
          </div>
        </Phone>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { type: "success", children: MESSAGE.success, onClose: noop },
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
