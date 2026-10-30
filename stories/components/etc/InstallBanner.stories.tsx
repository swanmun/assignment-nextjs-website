import { useState, type ReactNode } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { InstallBanner } from "@/components/install-banner/InstallBanner";
import { IosInstallGuide } from "@/components/install-banner/IosInstallGuide";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Block, ComponentPage, Phone, kit } from "../kit";

const meta = {
  title: "Components/Etc/InstallBanner",
  component: InstallBanner,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof InstallBanner>;

export default meta;
type Story = StoryObj<typeof meta>;

const BASE = {
  iconSrc: "/icons/icon-192.png",
  title: "숨은맛집.EXE 앱 설치",
  description: "홈 화면에서 바로 열 수 있어요",
  onAction: () => {},
  onClose: () => {},
};

/** 띠배너를 화면 아래에 붙인 모바일 목업 */
const Screen = ({ children }: { children: ReactNode }) => (
  <Phone>
    <TopNavigation title="숨은맛집.EXE" />
    <div style={{ flex: 1, background: "var(--pattern-dots-sparse)" }} />
    {children}
  </Phone>
);

const IosTrigger = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <InstallBanner {...BASE} actionLabel="설치 방법" onAction={() => setOpen(true)} />
      <BottomSheet open={open} onClose={() => setOpen(false)} title="홈 화면에 추가하기">
        <IosInstallGuide appName="숨은맛집" onConfirm={() => setOpen(false)} />
      </BottomSheet>
    </>
  );
};

export const Overview: Story = {
  args: { ...BASE, actionLabel: "설치" },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Install Banner"
      description="홈 화면 설치를 권하는 화면 아래 띠배너. 작업 표시줄처럼 회색 바탕을 가로 전체에 깔고, 앱 아이콘 · 제목 · 보조 문구 · 버튼 모양 문구 · 닫기로 구성됩니다. 띠배너 전체가 하나의 버튼이고 닫기만 따로 동작합니다. 이미 홈 화면 앱으로 실행 중이거나 설치할 수 없는 브라우저에서는 띄우지 않습니다."
    >
      <Block title="Android" usage="브라우저가 설치 가능하다고 알려 주면(beforeinstallprompt) 띄웁니다. 누르면 바로 설치 창이 열립니다.">
        <Screen>
          <InstallBanner {...BASE} actionLabel="설치" />
        </Screen>
      </Block>
      <Block title="iOS" usage="iOS는 설치 창을 띄울 수 없어 누르면 바텀시트로 홈 화면 추가 방법을 안내합니다.">
        <div className={kit.row}>
          <Screen>
            <InstallBanner {...BASE} actionLabel="설치 방법" />
          </Screen>
          <Screen>
            <InstallBanner {...BASE} actionLabel="설치 방법" />
            <BottomSheet open contained onClose={() => {}} title="홈 화면에 추가하기">
              <IosInstallGuide appName="숨은맛집" onConfirm={() => {}} />
            </BottomSheet>
          </Screen>
        </div>
      </Block>
      <Block title="Interactive" usage="iOS 띠배너를 눌러 설치 안내를 열고, 확인이나 스크림을 눌러 닫아 보세요.">
        <div style={{ width: 360, maxWidth: "100%" }}>
          <IosTrigger />
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { ...BASE, actionLabel: "설치" },
  render: (args) => (
    <Screen>
      <InstallBanner {...args} />
    </Screen>
  ),
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
