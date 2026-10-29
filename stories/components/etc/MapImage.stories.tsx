import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/button/Button";
import { MapImage } from "@/components/map/MapImage";
import { MapPreview } from "@/components/map/MapPreview";
import { Block, ComponentPage, Option, kit } from "../kit";

/** 스토리용 지도 캡처. 실제 화면은 BFF(GET /api/map)가 만든 지도 이미지를 쓴다. */
const SAMPLE = "/images/map-sample.png";

const meta = {
  title: "Components/Etc/MapImage",
  component: MapImage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MapImage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { src: SAMPLE, alt: "오류동 골목 손칼국수 위치 지도" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Map Image"
      description="가운데에 핀이 꽂힌 실제 지도 이미지. 지도 키는 서버에만 두고 BFF(GET /api/map)가 만든 이미지를 보여줍니다. 이미지는 가운데 기준으로 잘라 핀이 항상 가운데에 오고, 768px 이상에서는 가로로 긴 지도(wideSrc)로 바꿉니다. 지도를 불러오지 못하면 fallback(일러스트 지도 MapPreview)을 대신 보여줍니다."
    >
      <Block title="Size" usage="sm 140 — 상세 상단 미니 지도 · md 180 — 상세 지도 칸 · lg 360 — 장소 등록 위치 지정">
        <div className={kit.row}>
          <Option caption="sm · 140" width={328}>
            <MapImage src={SAMPLE} alt="지도" size="sm" />
          </Option>
          <Option caption="md · 180" width={272}>
            <MapImage src={SAMPLE} alt="지도" size="md" />
          </Option>
          <Option caption="lg · 360" width={328}>
            <MapImage src={SAMPLE} alt="지도" size="lg" />
          </Option>
        </div>
      </Block>
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="bleed + action — 가로 전체 띠 · 크게 보기 버튼" width={360}>
            <MapImage
              src={SAMPLE}
              alt="지도"
              size="sm"
              bleed
              action={
                <Button variant="secondary" rightIcon="chevron-right">
                  크게 보기
                </Button>
              }
            />
          </Option>
          <Option caption="fallback — 지도를 불러오지 못했을 때" width={272}>
            <MapImage src="/api/map?broken" alt="지도" fallback={<MapPreview label="손칼국수" roadLabel="오류로" />} />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { src: SAMPLE, alt: "오류동 골목 손칼국수 위치 지도", size: "md", bleed: false },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
