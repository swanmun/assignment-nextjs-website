import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { fn } from "storybook/test";
import { ORDER_ITEM_STATUSES, OrderItem, REFUND_TONES, type OrderItemProps } from "@/components/order-item/OrderItem";
import { Block, ComponentPage, Option, kit } from "../kit";

/** design.pen OrderItem/Paid · Paid-Locked 기본 내용 */
const PAID = {
  href: "#",
  imageUrl: "/images/order-thumb-1.png",
  kind: "모임",
  title: "구로 맛집 투어: 오류동 골목 세 집 걷기",
  schedule: "11.21(토) 11:00 · 구로역 2번 출구",
  amount: "25,000원",
  amountDetail: "11.03 결제 · 카카오페이",
} satisfies Omit<OrderItemProps, "status">;

/** design.pen OrderItem/Canceled 기본 내용 */
const CANCELED = {
  href: "#",
  imageUrl: "/images/order-thumb-3.png",
  kind: "강연",
  title: "노포 셰프에게 듣는 30년 육수 이야기",
  schedule: "11.08(일) 15:00 · 구로아트밸리 소극장",
  amount: "환불 30,000원",
  amountDetail: "결제 30,000원 · 11.03 취소",
} satisfies Omit<OrderItemProps, "status">;

const meta = {
  title: "Components/Etc/OrderItem",
  component: OrderItem,
  parameters: { layout: "fullscreen" },
  argTypes: {
    status: { control: "inline-radio", options: ORDER_ITEM_STATUSES },
    refundTone: { control: "inline-radio", options: REFUND_TONES },
  },
  args: { onCancel: fn() },
} satisfies Meta<typeof OrderItem>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 마이 페이지 목록처럼 항목을 spacing-12 간격으로 쌓는다 */
const List = ({ items }: { items: OrderItemProps[] }) => (
  <ul style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)", maxWidth: 328, margin: 0, padding: 0, listStyle: "none" }}>
    {items.map((item) => (
      <li key={item.title}>
        <OrderItem {...item} />
      </li>
    ))}
  </ul>
);

export const Overview: Story = {
  args: { ...PAID, status: "paid" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Order Item"
      description="마이 페이지 결제 내역·취소 내역 탭의 목록 항목. 가로 전체 · 높이 auto. 위: 상품 썸네일(72) · 종류 배지 · 상태 배지 · 이름(heading-sm) · 일시(label-md). 아래: 금액(label-lg)과 보조 문구(label-md), 결제 취소 버튼(Button secondary sm) 또는 환불 상태 배지. 항목 전체가 강연·모임 상세로 가는 링크이고, 결제 취소 버튼만 따로 동작합니다."
    >
      <Block title="Status" usage="status 하나로 결제 완료(취소 가능) · 결제 완료(취소 불가) · 취소 완료를 고릅니다.">
        <div className={kit.row}>
          <Option caption="paid — 결제 완료 · 취소 가능" width={333}>
            <OrderItem {...PAID} status="paid" onCancel={() => {}} />
          </Option>
          <Option caption="paid-locked — 결제 완료 · 취소 불가" width={333}>
            <OrderItem {...PAID} status="paid-locked" />
          </Option>
          <Option caption="canceled — 취소 완료 · 환불 상태" width={333}>
            <OrderItem {...CANCELED} status="canceled" />
          </Option>
        </div>
      </Block>
      <Block title="Refund" usage="취소 완료의 환불 상태 배지. 환불 완료는 success, 부분 환불 등 처리 중은 warning(refundTone)입니다.">
        <div className={kit.row}>
          <Option caption="환불 완료 — success" width={333}>
            <OrderItem {...CANCELED} status="canceled" />
          </Option>
          <Option caption="환불 진행 중 — warning" width={333}>
            <OrderItem
              {...CANCELED}
              status="canceled"
              imageUrl="/images/order-thumb-4.png"
              kind="모임"
              title="항동 저수지 산책과 보리밥"
              schedule="11.06(금) 10:30 · 항동 푸른수목원 정문"
              amount="환불 12,500원"
              amountDetail="결제 25,000원 · 11.02 취소 · 50% 환불"
              refundLabel="환불 진행 중"
              refundTone="warning"
            />
          </Option>
        </div>
      </Block>
      <Block title="Usage" usage="결제 내역 탭(05 마이 - 결제 내역 탭) 목록 — 항목 간격 spacing-12">
        <List
          items={[
            { ...PAID, status: "paid", onCancel: () => {} },
            {
              ...PAID,
              status: "paid-locked",
              imageUrl: "/images/order-thumb-2.png",
              title: "시흥 갯골 바지락 캠프",
              schedule: "11.05(목) 10:00 · 시흥 갯골생태공원",
              amount: "38,000원",
              amountDetail: "10.28 결제 · 신용카드",
            },
          ]}
        />
      </Block>
    </ComponentPage>
  ),
};

/** 결제 완료 · 취소 가능 — 결제 취소 버튼이 onCancel을 부른다 */
export const Paid: Story = {
  args: { ...PAID, status: "paid" },
  decorators: [(Story) => <div style={{ maxWidth: 328, padding: "var(--spacing-16)" }}><Story /></div>],
};

/** 결제 완료 · 취소 불가 — 버튼 disabled + 이유 안내 */
export const PaidLocked: Story = {
  args: { ...PAID, status: "paid-locked" },
  decorators: Paid.decorators,
};

/** 취소 완료 — 금액 자리에 환불 금액, 오른쪽에 환불 상태 배지 */
export const Canceled: Story = {
  args: { ...CANCELED, status: "canceled" },
  decorators: Paid.decorators,
};
