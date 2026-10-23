import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { Button } from "@/components/button/Button";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Block, ComponentPage, Phone, kit } from "../kit";

const meta = {
  title: "Components/Etc/BottomSheet",
  component: BottomSheet,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

const CONTENT = (
  <p className="typo-body-md" style={{ color: "var(--color-text-secondary)" }}>
    콘텐츠 영역 — 목록, 선택지, 폼 등 원하는 내용을 넣습니다.
  </p>
);

const Trigger = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        바텀시트 열기
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)} title="정렬 기준">
        {CONTENT}
      </BottomSheet>
    </>
  );
};

export const Overview: Story = {
  args: { open: true, onClose: () => {}, title: "정렬 기준", children: CONTENT },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Bottom Sheet"
      description="가로 전체 · 높이 auto. 상단 드래그 핸들, 가운데 콘텐츠 영역, 배경 스크림으로 구성됩니다. 스크림을 탭하거나 Esc를 누르면 선택 없이 닫힙니다."
    >
      <Block title="Component">
        <Phone>
          <TopNavigation title="맛집 목록" />
          <BottomSheet open contained onClose={() => {}} title="정렬 기준">
            {CONTENT}
          </BottomSheet>
        </Phone>
      </Block>
      <Block title="Interactive" usage="버튼을 눌러 실제로 열고, 스크림을 탭해 닫아 보세요.">
        <Trigger />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { open: true, onClose: () => {}, title: "정렬 기준", children: CONTENT },
  render: (args) => (
    <Phone>
      <BottomSheet {...args} contained />
    </Phone>
  ),
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
