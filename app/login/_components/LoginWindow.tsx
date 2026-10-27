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

export type LoginError = "cancelled" | "auth";

const ERROR_MESSAGE: Record<LoginError, string> = {
  cancelled: "구글 로그인이 취소됐어요. 다시 시도해 주세요.",
  auth: "로그인하지 못했어요. 잠시 후 다시 시도해 주세요.",
};

export const LoginWindow = ({ error }: { error?: LoginError }) => {
  const router = useRouter();
  const [showError, setShowError] = useState(Boolean(error));
  const [submitting, setSubmitting] = useState(false);

  return (
    <>
      {showError && error && (
        <div className={page.toastLayer}>
          <Toast type="error" onClose={() => setShowError(false)}>
            {ERROR_MESSAGE[error]}
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
            {/* BFF(/api/auth/signin)가 구글 동의 화면으로 리다이렉트한다. */}
            <form action="/api/auth/signin" method="post" onSubmit={() => setSubmitting(true)}>
              <Button type="submit" size="lg" leftIcon="user" loading={submitting} className={page.fullWidth}>
                Google 계정으로 로그인
              </Button>
            </form>
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
