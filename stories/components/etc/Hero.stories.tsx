import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Hero } from "@/components/hero/Hero";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Etc/Hero",
  component: Hero,
  parameters: { layout: "fullscreen" },
  argTypes: { size: { control: "inline-radio", options: ["md", "lg"] } },
} satisfies Meta<typeof Hero>;

export default meta;
type Story = StoryObj<typeof meta>;

const BADGE = "구로 출발 · 차로 1시간 이내";

export const Overview: Story = {
  args: { imageUrl: "/images/hero-main.png", headline: "" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Hero"
      description="가로 전체 디더링 이미지 위에 상황 배지(Badge neutral lg)와 헤드라인 상자를 얹습니다. md는 heading-md, lg는 display-sm이며 태블릿 이상에서 높이가 40px 커집니다. 내용은 레이아웃 최대 너비 안에 정렬됩니다."
    >
      <Block title="Sizes">
        <div className={kit.row}>
          <Option caption="md · 200px — 메인" width={360}>
            <Hero imageUrl="/images/hero-main.png" badge={BADGE} headline={"이번 주말엔\n이웃만 아는 그 집으로."} />
          </Option>
          <Option caption="lg · 240px — 로그인" width={360}>
            <Hero size="lg" imageUrl="/images/hero-login.png" badge={BADGE} headline={"광고 없는\n이웃의 진짜 맛집."} />
          </Option>
        </div>
      </Block>
      <Block title="Full Width" usage="부모 너비를 가득 채우고, 배지·헤드라인은 레이아웃 최대 너비(1280) 안에 둡니다. 768px 이상에서는 wideImageUrl 이미지로 바뀝니다.">
        <Hero imageUrl="/images/hero-main.png" wideImageUrl="/images/hero-wide.png" badge={BADGE} headline={"이번 주말엔\n이웃만 아는 그 집으로."} />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { imageUrl: "/images/hero-main.png", badge: BADGE, headline: "이번 주말엔\n이웃만 아는 그 집으로.", size: "md" },
};
