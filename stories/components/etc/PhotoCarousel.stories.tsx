import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PhotoCarousel } from "@/components/carousel/PhotoCarousel";
import { Block, ComponentPage, Option, kit } from "../kit";

const PHOTOS = ["/images/restaurant-4.png", "/images/restaurant-1.png", "/images/restaurant-3.png", "/images/restaurant-8.png"].map(
  (src, i) => ({ src, alt: `맛집 사진 ${i + 1}` }),
);

const meta = {
  title: "Components/Etc/PhotoCarousel",
  component: PhotoCarousel,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof PhotoCarousel>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { photos: PHOTOS },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Photo Carousel"
      description="사진을 1장씩 넘겨 봅니다. 사진 260px(태블릿 이상 360px), 아래 페이저는 이전/다음 IconButton(Circle-Neutral), 8px 사각 점, 순번(label-md). 사진이 1장이면 페이저를 숨깁니다. 바탕은 가로 전체, 사진은 읽기 영역 너비(640) 안에 둡니다."
    >
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="여러 장" width={360}>
            <PhotoCarousel photos={PHOTOS} />
          </Option>
          <Option caption="1장 — 페이저 없음" width={360}>
            <PhotoCarousel photos={PHOTOS.slice(0, 1)} />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { photos: PHOTOS },
};
