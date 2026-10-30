"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { BottomSheet } from "@/components/bottom-sheet/BottomSheet";
import { InstallBanner } from "@/components/install-banner/InstallBanner";
import { IosInstallGuide } from "@/components/install-banner/IosInstallGuide";
import { APP_ICON_URL, APP_NAME, APP_SHORT_NAME } from "@/lib/pwa/config";

/** 크롬·삼성 인터넷 등이 설치 가능할 때 보내는 이벤트 (TS 기본 타입에 없다) */
type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

/** 닫으면 이 기간 동안 다시 띄우지 않는다. */
const DISMISS_KEY = "install-banner-dismissed-at";
const DISMISS_DAYS = 7;

/** 이미 홈 화면 앱으로 실행 중인지 */
const isStandalone = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true;

/** iPhone·iPad (iPadOS는 데스크톱 Safari처럼 Macintosh로 알려 터치 지원으로 가린다) */
const isIos = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (/Macintosh/.test(navigator.userAgent) && navigator.maxTouchPoints > 1);

const isDismissed = () => {
  const dismissedAt = Number(localStorage.getItem(DISMISS_KEY));
  return Date.now() - dismissedAt < DISMISS_DAYS * 24 * 60 * 60 * 1000;
};

// 브라우저 환경 값은 바뀌지 않으므로 구독할 것이 없다. 서버 렌더링 때는 띠배너를 그리지 않는다.
const subscribeNothing = () => () => {};
const useClientValue = (read: () => boolean) => useSyncExternalStore(subscribeNothing, read, () => false);

/** 홈 화면 설치 유도 띠배너: 안드로이드는 누르면 바로 설치 창, iOS는 바텀시트로 설치 방법 안내 */
export const InstallPrompt = () => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [closed, setClosed] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const iosBrowser = useClientValue(() => isIos() && !isStandalone());
  const dismissed = useClientValue(isDismissed);

  useEffect(() => {
    const onBeforeInstallPrompt = (event: Event) => {
      // 브라우저 기본 설치 안내 대신 띠배너를 띄우고, 누를 때 이 이벤트로 설치 창을 연다.
      event.preventDefault();
      setInstallEvent(event as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstallEvent(null);
      setClosed(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const platform = installEvent ? "android" : iosBrowser ? "ios" : null;
  if (!platform || dismissed || closed) return null;

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    // 설치 창 이벤트는 한 번만 쓸 수 있다. 취소했으면 브라우저가 다음에 다시 보내 줄 때 띄운다.
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  const close = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setClosed(true);
  };

  return (
    <>
      <InstallBanner
        iconSrc={APP_ICON_URL}
        title={`${APP_NAME} 앱 설치`}
        description="홈 화면에서 바로 열 수 있어요"
        actionLabel={platform === "android" ? "설치" : "설치 방법"}
        onAction={platform === "android" ? install : () => setGuideOpen(true)}
        onClose={close}
      />
      <BottomSheet open={guideOpen} onClose={() => setGuideOpen(false)} title="홈 화면에 추가하기">
        <IosInstallGuide appName={APP_SHORT_NAME} onConfirm={() => setGuideOpen(false)} />
      </BottomSheet>
    </>
  );
};
