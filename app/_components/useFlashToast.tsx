"use client";

import { useEffect, useState } from "react";
import { Toast, type ToastType } from "@/components/toast/Toast";
import page from "./page.module.css";

type Flash = { type: ToastType; message: string } | null;

/** 화면 위에 잠깐(2.5초) 떴다 사라지는 토스트 */
export const useFlashToast = () => {
  const [flash, setFlash] = useState<Flash>(null);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 2500);
    return () => clearTimeout(timer);
  }, [flash]);

  const toast = flash && (
    <div className={page.toastLayer}>
      <Toast type={flash.type} onClose={() => setFlash(null)}>
        {flash.message}
      </Toast>
    </div>
  );

  return { show: (type: ToastType, message: string) => setFlash({ type, message }), toast };
};
