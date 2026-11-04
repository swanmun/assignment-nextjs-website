import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Modal } from "@/components/modal/Modal";
import { PaymentLink, PaymentQr } from "@/components/payment-link/PaymentLink";
import { Block, ComponentPage, Phone } from "../kit";

const meta = {
  title: "Components/Action/PaymentLink",
  component: PaymentLink,
  parameters: { layout: "fullscreen" },
  args: {
    href: "https://www.payapp.kr/L/z4nwAD",
    qrSrc: "/images/payapp-qr-cooking-class.png",
    productName: "취미 요리 수업 1건",
  },
} satisfies Meta<typeof PaymentLink>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ComponentPage
      title="Payment Link"
      description="외부 결제 링크(페이앱)로 결제하는 버튼 묶음입니다. 결제하기(primary lg)와 QR로 결제하기(secondary lg)를 위아래로 쌓고 가로를 채웁니다. 결제 처리는 외부 결제 페이지가 맡고, 이 컴포넌트는 결제창을 열어 주기만 합니다."
    >
      <Block
        title="Buttons"
        usage="결제하기는 결제창을 화면 가운데 420×760 팝업으로 엽니다. 팝업이 막히거나 모바일 브라우저면 새 탭으로 열립니다. 아래 버튼을 눌러 실제로 열어 보세요."
      >
        <div style={{ maxWidth: 328 }}>
          <PaymentLink {...args} />
        </div>
      </Block>
      <Block title="QR Modal" usage="QR로 결제하기를 누르면 뜨는 모달. QR 코드(200px, 픽셀 그대로 확대) 아래에 안내 문구(Note)를 둡니다. PC에서 보고 휴대폰으로 결제하려는 사람을 위한 경로입니다.">
        <Phone>
          <Modal open contained onClose={() => {}} title="QR로 결제하기" width={300}>
            <PaymentQr qrSrc={args.qrSrc} productName={args.productName} />
          </Modal>
        </Phone>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  render: (args) => (
    <div style={{ maxWidth: 328, padding: "var(--spacing-16)" }}>
      <PaymentLink {...args} />
    </div>
  ),
};
