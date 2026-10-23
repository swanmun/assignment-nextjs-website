"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, ButtonLink } from "@/components/button/Button";
import { Modal } from "@/components/modal/Modal";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Note } from "@/components/note/Note";
import { useFlashToast } from "../../../_components/useFlashToast";
import styles from "../detail.module.css";

/** 상단 바 — 공유 버튼은 기기 공유창, 없으면 링크 복사 */
export const DetailTopNavigation = ({ name }: { name: string }) => {
  const { show, toast } = useFlashToast();

  const share = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      show("info", "링크를 복사했어요.");
    } catch (error) {
      if ((error as Error).name !== "AbortError") show("error", "링크를 복사하지 못했어요.");
    }
  };

  return (
    <>
      <TopNavigation
        title="맛집 상세"
        leftAction={{ icon: "arrow-left", label: "목록으로", href: "/" }}
        rightActions={[{ icon: "share", label: "공유하기", onClick: share }]}
      />
      {toast}
    </>
  );
};

export const CopyAddressButton = ({ address }: { address: string }) => {
  const { show, toast } = useFlashToast();

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      show("info", "주소를 복사했어요.");
    } catch {
      show("error", "주소를 복사하지 못했어요.");
    }
  };

  return (
    <>
      <Button variant="secondary" size="sm" leftIcon="copy" onClick={copy}>
        복사
      </Button>
      {toast}
    </>
  );
};

/** 내가 쓴 글에만 보이는 수정·삭제 */
export const OwnerActions = ({ name }: { name: string }) => {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  return (
    <div className={styles.ownerActions}>
      <Note>내가 쓴 글에만 보이는 버튼이에요</Note>
      <div className={styles.ownerButtons}>
        <ButtonLink href="/restaurants/new" variant="secondary" leftIcon="edit">
          수정
        </ButtonLink>
        <Button variant="destructive" leftIcon="delete" onClick={() => setConfirming(true)}>
          삭제
        </Button>
      </div>
      <Modal
        open={confirming}
        onClose={() => setConfirming(false)}
        title="글을 삭제할까요?"
        secondaryAction={{ label: "취소", onClick: () => setConfirming(false) }}
        primaryAction={{ label: "삭제하기", onClick: () => router.push("/me") }}
      >
        {`'${name}' 글을 삭제하면 되돌릴 수 없어요.`}
      </Modal>
    </div>
  );
};
