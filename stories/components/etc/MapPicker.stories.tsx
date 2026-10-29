import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { MapPicker, SEOUL_CITY_HALL, type MapPoint } from "@/components/map/MapPicker";
import { MapPreview } from "@/components/map/MapPreview";
import { Block, Caption, ComponentPage, Option, kit } from "../kit";

const ORYU: MapPoint = { latitude: 37.4945, longitude: 126.8447 };

const meta = {
  title: "Components/Etc/MapPicker",
  component: MapPicker,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MapPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

/** 지도를 움직이면 가운데(핀) 좌표를 아래에 보여준다. */
const WithCenter = ({ center, label }: { center?: MapPoint; label?: string }) => {
  const [point, setPoint] = useState(center ?? SEOUL_CITY_HALL);
  return (
    <>
      <MapPicker center={center} label={label} onCenterChange={setPoint} fallback={<MapPreview label={label ?? "서울시청"} />} />
      <Caption>
        {point.latitude.toFixed(6)}, {point.longitude.toFixed(6)}
      </Caption>
    </>
  );
};

export const Overview: Story = {
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Map Picker"
      description="가운데에 핀을 고정하고 지도를 움직여 위치를 고르는 네이버 지도(JavaScript API v3). 지도 이동이 끝날 때마다 onCenterChange로 핀 좌표를 알립니다. center가 없으면 서울시청에서 시작합니다. 지도 키(NEXT_PUBLIC_NCP_MAP_KEY_ID)가 없거나 인증에 실패하면 fallback(일러스트 지도 MapPreview)을 대신 보여줍니다."
    >
      <Block title="Center" usage="장소 등록 위치 지정 — 검색된 위치에서 시작해 핀 위치를 고칩니다.">
        <div className={kit.row}>
          <Option caption="기본 — 서울시청" width={328}>
            <WithCenter />
          </Option>
          <Option caption="검색된 위치 + 이름표" width={328}>
            <WithCenter center={ORYU} label="오류동 골목 손칼국수" />
          </Option>
        </div>
      </Block>
      <Block title="Size" usage="MapImage와 같은 높이 — sm 140 · md 180 · lg 360">
        <div className={kit.row}>
          <Option caption="sm · 140" width={328}>
            <MapPicker size="sm" fallback={<MapPreview label="서울시청" />} />
          </Option>
          <Option caption="md · 180" width={272}>
            <MapPicker size="md" fallback={<MapPreview label="서울시청" />} />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { label: "서울시청", size: "lg" },
  decorators: [(Story) => <div className={kit.padded} style={{ maxWidth: 360 }}>{Story()}</div>],
};
