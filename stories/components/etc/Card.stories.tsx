import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Badge } from "@/components/badge/Badge";
import { Card, CardRemoveButton } from "@/components/card/Card";
import { Block, ComponentPage, Option, kit } from "../kit";

const SAMPLE = {
  title: "항동 저수지 앞 보리밥",
  imageUrl: "/images/restaurant-2.png",
  imageAlt: "보리밥 한 상",
  address: "경기 부천시 범안로 112",
  summary: "창가 자리에서 저수지가 보여요. 주말 점심엔 11시 반 전에 가야 대기 없어요.",
  author: "항동커플",
  date: "10.14",
};

const meta = {
  title: "Components/Etc/Card",
  component: Card,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Card>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: SAMPLE,
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Card"
      description="맛집 목록의 기본 단위. 가로·높이 auto이며 이미지 영역(160px)은 추가/제외할 수 있습니다. 제목 heading-sm, 주소·작성자 label-md, 요약 body-md."
    >
      <Block title="Options" usage="imageUrl 유무로 이미지 영역을 켜고 끄고, badge로 제목 왼쪽에 배지를 둡니다.">
        <div className={kit.row}>
          <Option caption="이미지 있음" width={320}>
            <Card {...SAMPLE} />
          </Option>
          <Option caption="이미지 없음" width={320}>
            <Card {...SAMPLE} imageUrl={undefined} />
          </Option>
          <Option caption="제목 배지 — NEW" width={320}>
            <Card {...SAMPLE} badge={<Badge tone="info">NEW</Badge>} />
          </Option>
        </div>
      </Block>
      <Block
        title="CardRemoveButton"
        usage="내 글 목록에서 카드 오른쪽 위에 겹쳐 두는 삭제(X) 버튼. 카드를 감싼 링크 밖, position: relative 부모 안에 카드와 형제로 둡니다."
      >
        <div className={kit.row}>
          <Option caption="삭제 버튼 — 내 글 목록" width={320}>
            <div style={{ position: "relative" }}>
              <Card {...SAMPLE} />
              <CardRemoveButton aria-label={`${SAMPLE.title} 삭제`} />
            </div>
          </Option>
          <Option caption="삭제 중 — disabled" width={320}>
            <div style={{ position: "relative" }}>
              <Card {...SAMPLE} />
              <CardRemoveButton aria-label={`${SAMPLE.title} 삭제`} disabled />
            </div>
          </Option>
        </div>
      </Block>
      <Block title="Usage" usage="리스트·카드 갭 spacing-12">
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-12)", maxWidth: 360 }}>
          <Card {...SAMPLE} />
          <Card
            {...SAMPLE}
            title="구로시장 할매 순대국"
            address="서울 구로구 구로동 시장길 22"
            summary="새벽 6시부터 열어요. 순대 반 접시 추가가 돼요."
            author="구로토박이"
            date="10.12"
            imageUrl={undefined}
          />
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: SAMPLE,
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
