import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { Button } from "@/components/button/Button";
import { Menu, MenuDivider, MenuItem } from "@/components/menu/Menu";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { FIELD_SIZES, type FieldSize } from "@/components/text-field/TextField";
import { Block, Caption, ComponentPage, Phone, kit } from "../kit";

const meta = {
  title: "Components/Etc/Menu",
  component: Menu,
  subcomponents: { MenuItem, MenuDivider },
  parameters: { layout: "fullscreen" },
  argTypes: { size: { control: "inline-radio", options: FIELD_SIZES } },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const PostMenu = ({ size, plain }: { size?: FieldSize; plain?: boolean }) => (
  <Menu size={size} plain={plain} aria-label="게시글 메뉴">
    <MenuItem icon="edit">수정하기</MenuItem>
    <MenuItem icon="share">공유하기</MenuItem>
    <MenuItem icon="copy">주소 복사</MenuItem>
    <MenuItem icon="bookmark" disabled>
      북마크 (준비 중)
    </MenuItem>
    <MenuDivider />
    <MenuItem icon="delete" variant="destructive">
      삭제하기
    </MenuItem>
  </Menu>
);

/** 데스크톱: 메뉴 버튼 아래에 메뉴를 연다. */
const MenuButton = ({ size = "md", defaultOpen = false }: { size?: FieldSize; defaultOpen?: boolean }) => {
  const [open, setOpen] = useState(defaultOpen);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [open]);

  return (
    <div ref={ref} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
      <Button
        variant="secondary"
        size={size === "lg" ? "lg" : size}
        rightIcon="chevron-down"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        더보기
      </Button>
      {open && <PostMenu size={size} />}
    </div>
  );
};

const MobileMenu = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="secondary" onClick={() => setOpen(true)}>
        모바일 메뉴 열기
      </Button>
      <BottomSheet open={open} onClose={() => setOpen(false)}>
        <PostMenu size="lg" plain />
      </BottomSheet>
    </>
  );
};

export const Overview: Story = {
  args: { children: null },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Menu"
      description="메뉴아이템 목록 패널. 가로·높이 auto. 활성화하면 데스크톱은 메뉴 버튼 아래, 모바일은 바텀시트 안에 메뉴아이템을 연결합니다. 위·아래 화살표로 항목 사이를 이동합니다."
    >
      <Block title="Component">
        <PostMenu />
      </Block>
      <Block title="연결범위" usage="메뉴아이템 사이즈는 메뉴 사이즈를 따릅니다.">
        <div className={kit.row} style={{ alignItems: "flex-start" }}>
          <div className={kit.option} style={{ minHeight: 320 }}>
            <Caption>데스크톱 · md — 메뉴버튼 아래</Caption>
            <MenuButton defaultOpen />
          </div>
          <div className={kit.option} style={{ minHeight: 320 }}>
            <Caption>데스크톱 · sm — 메뉴버튼 아래</Caption>
            <MenuButton size="sm" defaultOpen />
          </div>
          <div className={kit.option}>
            <Caption>모바일 · lg — 바텀시트 안</Caption>
            <Phone>
              <TopNavigation title="맛집 상세" leftAction={{ icon: "arrow-left", label: "뒤로 가기" }} />
              <BottomSheet open contained onClose={() => {}}>
                <PostMenu size="lg" plain />
              </BottomSheet>
            </Phone>
          </div>
        </div>
      </Block>
      <Block title="Interactive">
        <div className={kit.row}>
          <MenuButton />
          <MobileMenu />
        </div>
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { size: "md", plain: false, children: null },
  render: (args) => <PostMenu size={args.size} plain={args.plain} />,
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
