import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ResponsiveImage } from "@/components/responsive-image/ResponsiveImage";
import { Block, ComponentPage } from "../kit";
import styles from "./ResponsiveImage.stories.module.css";

/** 툴바 Viewport 메뉴에서 고를 수 있는 확인용 화면 크기 */
const VIEWPORTS = {
  mobile360: { name: "Mobile 360", styles: { width: "360px", height: "720px" }, type: "mobile" },
  tablet768: { name: "Tablet 768", styles: { width: "768px", height: "1024px" }, type: "tablet" },
  desktop1280: { name: "Desktop 1280", styles: { width: "1280px", height: "800px" }, type: "desktop" },
} as const;

const meta = {
  title: "Components/Etc/ResponsiveImage",
  component: ResponsiveImage,
  parameters: { layout: "padded", viewport: { options: VIEWPORTS } },
  args: {
    src: "/images/product-detail-lg.jpg",
    mdSrc: "/images/product-detail-md.jpg",
    alt: "주방에서 함께 채소를 볶으며 요리하는 사람들",
    className: styles.photo,
  },
} satisfies Meta<typeof ResponsiveImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: (args) => (
    <ComponentPage
      title="Responsive Image"
      description="화면 너비에 따라 lg·md 두 장 중 한 장만 받는 이미지입니다. 상품 대표·상세 이미지처럼 스토리지에 크기별로 올린 이미지에 씁니다. lg는 데스크톱(1024px 이상), md는 모바일·태블릿(1024px 미만)용입니다. 크기·비율·테두리는 className으로 넘긴 스타일이 정합니다."
    >
      <Block
        title="lg · md"
        usage="<picture>로 감싸 1024px 미만에서는 md만 내려받습니다. 툴바 Viewport(Mobile 360 · Tablet 768 · Desktop 1280)를 바꾸고 개발자 도구 Network 탭이나 이미지 주소로 어떤 파일을 받는지 확인하세요."
      >
        <ResponsiveImage {...args} />
      </Block>
      <Block title="lg 한 장" usage="mdSrc를 비우면 <picture> 없이 lg 한 장을 모든 화면에서 씁니다.">
        <ResponsiveImage src={args.src} alt={args.alt} className={args.className} />
      </Block>
    </ComponentPage>
  ),
};

export const Mobile360: Story = {
  globals: { viewport: { value: "mobile360", isRotated: false } },
};

export const Tablet768: Story = {
  globals: { viewport: { value: "tablet768", isRotated: false } },
};

export const Desktop1280: Story = {
  globals: { viewport: { value: "desktop1280", isRotated: false } },
};

export const Playground: Story = {};
