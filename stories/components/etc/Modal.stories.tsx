import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Button } from "@/components/button/Button";
import { Modal, type ModalProps } from "@/components/modal/Modal";
import { Block, ComponentPage, Phone, kit } from "../kit";

const SAMPLE = {
  title: "임시 저장한 글이 있어요",
  children: "10월 14일에 쓰던 '항동 저수지 앞 보리밥' 글을 이어서 쓸까요? 새로 쓰면 임시 저장한 내용은 지워져요.",
  primaryAction: { label: "이어서 쓰기", onClick: () => {} },
  secondaryAction: { label: "새로 쓰기", onClick: () => {} },
};

const meta = {
  title: "Components/Etc/Modal",
  component: Modal,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof Modal>;

export default meta;
type Story = StoryObj<typeof meta>;

const Trigger = (props: Partial<ModalProps>) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>모달 열기</Button>
      <Modal
        {...SAMPLE}
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        primaryAction={{ label: "이어서 쓰기", onClick: () => setOpen(false) }}
        secondaryAction={{ label: "새로 쓰기", onClick: () => setOpen(false) }}
      />
    </>
  );
};

export const Overview: Story = {
  args: { ...SAMPLE, open: true, onClose: () => {} },
  parameters: { controls: { disable: true } },
  render: () => (
    <ComponentPage
      title="Modal"
      description="헤더(제목 heading-sm · 닫기 아이콘 16px), 바디(본문 body-md), 푸터(secondary · primary 버튼)로 구성됩니다. 배경 스크림을 탭하거나 Esc를 누르면 닫힙니다."
    >
      <Block title="Component" usage="스크림 위에 가운데 정렬됩니다.">
        <Phone>
          <Modal {...SAMPLE} open contained onClose={() => {}} />
        </Phone>
      </Block>
      <Block title="Interactive" usage="버튼을 눌러 실제로 열고 닫아 보세요.">
        <Trigger />
      </Block>
    </ComponentPage>
  ),
};

export const Playground: Story = {
  args: { ...SAMPLE, open: false, onClose: () => {} },
  render: (args) => <Trigger title={args.title} width={args.width} />,
  decorators: [(Story) => <div className={kit.center}>{Story()}</div>],
};
