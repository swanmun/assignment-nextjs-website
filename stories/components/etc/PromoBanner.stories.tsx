import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import page from "@/app/_components/page.module.css";
import { PromoBanner } from "@/components/promo-banner/PromoBanner";
import { Block, ComponentPage } from "../kit";

/** 툴바 Viewport 메뉴에서 고를 수 있는 확인용 화면 크기 */
const VIEWPORTS = {
  mobile360: { name: "Mobile 360", styles: { width: "360px", height: "720px" }, type: "mobile" },
  tablet768: { name: "Tablet 768", styles: { width: "768px", height: "1024px" }, type: "tablet" },
  desktop1280: { name: "Desktop 1280", styles: { width: "1280px", height: "800px" }, type: "desktop" },
} as const;

/** 모바일·태블릿용 md: lg 가운데를 1.875:1로 자른 이미지 */
const MD_IMAGE_SRC = "/images/promo-cooking-class-md.png";

const meta = {
  title: "Components/Etc/PromoBanner",
  component: PromoBanner,
  parameters: { layout: "fullscreen", viewport: { options: VIEWPORTS } },
  args: {
    href: "#",
    imageSrc: "/images/promo-cooking-class.png",
    alt: "심심한 주말 놓치지 아까운 기회 — 요리 수업 알아보기",
  },
} satisfies Meta<typeof PromoBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 메인 본문(.body) 맨 위에 놓인 모습 그대로 */
const InBody = (args: Story["args"]) => (
  <main className={page.body}>
    <PromoBanner {...meta.args} {...args} />
  </main>
);

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ComponentPage
      title="Promo Banner"
      description='메인 맛집 목록 위에 붙는 광고 배너. 문구·버튼이 들어 있는 이미지 한 장을 그대로 쓰고, 배너 전체가 링크 하나입니다. 디더링 없이 원본 색 그대로 보여 주며 1px 테두리를 두릅니다. 대체 텍스트는 이미지 안 문구를 옮깁니다: "심심한 주말 놓치지 아까운 기회 — 요리 수업 알아보기".'
    >
      <Block
        title="Mobile (< 768px) · Wide (≥ 768px)"
        usage="가로는 항상 부모를 채웁니다. 768px 미만은 비율 1.875:1(.body 안 328×175)로 이미지 가운데를 cover로 잘라 문구가 읽히게, 768px 이상은 비율 3.08:1로 이미지 전체를 보여 줍니다. 같은 이미지 한 장으로 화면 너비에 따라 비율만 바뀌므로, 툴바 Viewport(Mobile 360 · Desktop 1280)나 아래 Mobile 360 · Desktop 1280 스토리에서 확인하세요."
      >
        <PromoBanner {...args} />
      </Block>
      <Block
        title="lg · md 두 장 (상품 배너)"
        usage="DB 상품처럼 데스크톱용 lg(1024×332)와 모바일·태블릿용 md(1.875:1로 미리 자른 622×332)를 함께 주면 mdImageSrc를 씁니다. 1024px 미만은 md를 1.875:1로, 1024px 이상은 lg 전체를 3.08:1로 보여 주고, 브라우저는 화면에 맞는 한 장만 받습니다. 툴바 Viewport의 Tablet 768에서 md가 유지되는지 확인하세요."
      >
        <PromoBanner {...args} mdImageSrc={MD_IMAGE_SRC} />
      </Block>
      <Block
        title="Static (href 없음)"
        usage="href를 비우면 링크 없이 이미지만 보여 줍니다. 상품 상세(/products/[id], /classes/cooking) 맨 위 대표 이미지로 씁니다. 크기·비율은 링크 배너와 같습니다."
      >
        <PromoBanner imageSrc={args.imageSrc} alt={args.alt} />
      </Block>
    </ComponentPage>
  ),
};

export const Mobile360: Story = {
  globals: { viewport: { value: "mobile360", isRotated: false } },
  render: InBody,
};

export const Desktop1280: Story = {
  globals: { viewport: { value: "desktop1280", isRotated: false } },
  render: InBody,
};

export const Tablet768: Story = {
  globals: { viewport: { value: "tablet768", isRotated: false } },
  render: InBody,
};

/** lg·md 두 장 — 1024px 미만은 md, 이상은 lg */
export const WithMd: Story = {
  args: { mdImageSrc: MD_IMAGE_SRC },
  render: InBody,
};

/** 링크 없이 이미지만 (상품 상세 대표 이미지) */
export const Static: Story = {
  args: { href: undefined },
};

export const Playground: Story = {};
