import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MapPreview } from "@/components/map/MapPreview";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Etc/MapPreview",
  component: MapPreview,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MapPreview>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  args: { label: "손칼국수" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Map Preview"
      description="실제 지도 연동 전까지 위치를 보여주는 일러스트 지도(높이 180px). 도로·하천·공원을 도트 패턴으로 그리고, 가운데 핀 위에 이름표(label-md)를 답니다."
    >
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="이름표 + 도로 이름" width={272}>
            <MapPreview label="손칼국수" roadLabel="오류로" />
          </Option>
          <Option caption="이름표만" width={272}>
            <MapPreview label="보리밥" />
          </Option>
          <Option caption="넓은 화면" width={560}>
            <MapPreview label="손칼국수" roadLabel="오류로" />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { label: "손칼국수", roadLabel: "오류로" },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
