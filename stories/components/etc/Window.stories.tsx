import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { FolderOpen, LogIn } from "lucide-react";
import { Card } from "@/components/card/Card";
import { Panel, StatusBar, ViewToggle, Window, WindowWell, type ListView } from "@/components/window/Window";
import { Block, ComponentPage, Option, kit } from "../kit";

const meta = {
  title: "Components/Etc/Window",
  component: Window,
  subcomponents: { WindowWell, ViewToggle, StatusBar, Panel },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Window>;

export default meta;
type Story = StoryObj<typeof meta>;

const CARD = {
  title: "항동 저수지 앞 보리밥",
  imageUrl: "/images/restaurant-2.png",
  address: "경기 부천시 범안로 112",
  summary: "창가 자리에서 저수지가 보여요.",
  author: "항동커플",
  date: "10.14",
};

const ListWindow = () => {
  const [view, setView] = useState<ListView>("list");
  return (
    <Window
      title="C:\구로\새로 올라온 맛집"
      icon={<FolderOpen size={14} />}
      minimizable
      onClose={() => {}}
      toolbar={
        <>
          <span className="typo-label-md">총 128곳 · 최신순</span>
          <ViewToggle value={view} onChange={setView} />
        </>
      }
      status={["1 / 128 표시", "비로그인 열람 가능"]}
    >
      <WindowWell>
        <Card {...CARD} />
      </WindowWell>
    </Window>
  );
};

export const Overview: Story = {
  args: { title: "C:\\구로\\새로 올라온 맛집", children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Window"
      description="페이지의 콘텐츠 묶음을 감싸는 레트로 창. 제목 표시줄(경로 label-md · 14px 아이콘 · 최소화/닫기), 도구 막대, 오목한 목록 영역(WindowWell), 상태 표시줄(StatusBar)로 구성됩니다. 최소화를 누르면 제목 표시줄만 남기고 접힙니다."
    >
      <Block title="Component" usage="목록 창 — 도구 막대(개수 · 보기 전환) + 목록 영역 + 상태 표시줄">
        <div style={{ maxWidth: 360 }}>
          <ListWindow />
        </div>
      </Block>
      <Block title="Options">
        <div className={kit.row}>
          <Option caption="닫기만 · 도구 막대 없음" width={360}>
            <Window title="C:\구로\로그인.exe" icon={<LogIn size={14} />} onClose={() => {}}>
              <div style={{ padding: "16px 12px" }} className="typo-body-md">
                내용 영역
              </div>
            </Window>
          </Option>
          <Option caption="Panel — 제목 표시줄 없는 볼록 패널" width={360}>
            <Panel>
              <span className="typo-body-md">상세 정보 · 폼처럼 창 제목이 필요 없을 때</span>
            </Panel>
          </Option>
          <Option caption="StatusBar — 단독 사용" width={360}>
            <StatusBar items={["자동 로그인 유지", "v0.1"]} />
          </Option>
        </div>
      </Block>
    </ComponentPage>
  ),
};
