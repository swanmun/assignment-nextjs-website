import type { Metadata } from "next";
import { Suspense } from "react";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { Hero } from "@/components/hero/Hero";
import { Icon } from "@/components/icon/Icon";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { StatusBar } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import page from "../_components/page.module.css";
import { LoginWindow, type LoginError } from "./_components/LoginWindow";
import styles from "./login.module.css";

export const metadata: Metadata = { title: "로그인 · 숨은 맛집 커뮤니티" };

const FEATURES = ["광고·협찬 없는 이웃의 진짜 추천", "사진·주소·지도를 한 화면에서 보고 바로 출발", "구로에서 차로 1시간 이내, 숨은 곳만"];

type LoginProps = {
  searchParams: Promise<{ error?: string }>;
};

const LoginWindowWithError = async ({ searchParams }: LoginProps) => {
  const { error } = await searchParams;
  const loginError: LoginError | undefined = error === "cancelled" || error === "auth" ? error : undefined;
  return <LoginWindow error={loginError} />;
};

export default function Login({ searchParams }: LoginProps) {
  return (
    <div className={page.page}>
      <TopNavigation title="숨은맛집.EXE" />
      <Hero
        size="lg"
        imageUrl="/images/hero-login.png"
        wideImageUrl="/images/hero-wide.png"
        badge="구로 출발 · 차로 1시간 이내"
        headline={"광고 없는\n이웃의 진짜 맛집."}
        contentWidth="calc(var(--layout-content-width) + 2 * var(--spacing-16))"
      />
      <main className={cx(page.body, page.narrow)}>
        <Suspense fallback={<LoginWindow />}>
          <LoginWindowWithError searchParams={searchParams} />
        </Suspense>
        <Fieldset legend="이런 곳이에요" className={styles.features}>
          <ul className={styles.featureList}>
            {FEATURES.map((feature) => (
              <li key={feature} className={`${styles.feature} typo-body-md`}>
                <Icon name="check" size={20} />
                {feature}
              </li>
            ))}
          </ul>
        </Fieldset>
        <StatusBar items={["자동 로그인 유지", "v0.1"]} />
        <p className={`${styles.terms} typo-label-md`}>계속하면 이용약관 및 개인정보 처리방침에 동의하는 것으로 봐요.</p>
      </main>
    </div>
  );
}
