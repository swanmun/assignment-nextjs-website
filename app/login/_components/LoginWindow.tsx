"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { Button, ButtonLink } from "@/components/button/Button";
import { Note } from "@/components/note/Note";
import { Toast } from "@/components/toast/Toast";
import { Window } from "@/components/window/Window";
import page from "../../_components/page.module.css";
import styles from "../login.module.css";

export const LoginWindow = ({ error }: { error?: "cancelled" }) => {
  const router = useRouter();
  const [showError, setShowError] = useState(error === "cancelled");

  return (
    <>
      {showError && (
        <div className={page.toastLayer}>
          <Toast type="error" onClose={() => setShowError(false)}>
            구글 로그인이 취소됐어요. 다시 시도해 주세요.
          </Toast>
        </div>
      )}
      <Window title="C:\구로\로그인.exe" icon={<LogIn size={14} />} onClose={() => router.push("/")}>
        <div className={page.windowContent}>
          <div className={styles.intro}>
            <h2 className="typo-heading-md">구글 계정 하나면 끝!</h2>
            <p className={`${styles.description} typo-body-md`}>
              처음 로그인하면 구글 이름과 사진으로 프로필이 자동으로 만들어져요. 한 번 로그인하면 다음부터는 바로
              들어와요.
            </p>
          </div>
          <div className={styles.actions}>
            {/* 구글 OAuth 연동 전까지는 로그인된 것으로 보고 마이 페이지로 이동한다. */}
            <Button size="lg" leftIcon="user" className={page.fullWidth} onClick={() => router.push("/me")}>
              Google 계정으로 로그인
            </Button>
            <ButtonLink href="/" variant="secondary" rightIcon="chevron-right" className={page.fullWidth}>
              로그인 없이 둘러보기
            </ButtonLink>
          </div>
          <Note>맛집 글쓰기는 로그인 후에 할 수 있어요</Note>
        </div>
      </Window>
    </>
  );
};
