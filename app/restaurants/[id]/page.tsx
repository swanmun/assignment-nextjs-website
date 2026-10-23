import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/badge/Badge";
import { ButtonLink } from "@/components/button/Button";
import { PhotoCarousel } from "@/components/carousel/PhotoCarousel";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { MapPreview } from "@/components/map/MapPreview";
import { Panel } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import { CURRENT_USER, findRestaurant, RESTAURANTS } from "@/lib/mock-data";
import page from "../../_components/page.module.css";
import { CopyAddressButton, DetailTopNavigation, OwnerActions } from "./_components/DetailClient";
import styles from "./detail.module.css";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return RESTAURANTS.map((restaurant) => ({ id: restaurant.id }));
}

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const restaurant = findRestaurant((await params).id);
  return { title: restaurant ? `${restaurant.name} · 숨은 맛집 커뮤니티` : "숨은 맛집 커뮤니티" };
}

export default async function RestaurantDetail({ params }: DetailProps) {
  const restaurant = findRestaurant((await params).id);
  if (!restaurant) notFound();

  const isMine = restaurant.author === CURRENT_USER.nickname;
  const fullAddress = [restaurant.address, restaurant.addressDetail].filter(Boolean).join("\n");

  return (
    <div className={page.page}>
      <DetailTopNavigation name={restaurant.name} />
      <PhotoCarousel
        photos={restaurant.photos.map((src, i) => ({
          src,
          wideSrc: restaurant.widePhotos?.[i],
          alt: `${restaurant.name} 사진 ${i + 1}`,
        }))}
      />
      <main className={cx(page.body, page.narrow)}>
        <Panel>
          <header className={styles.header}>
            <h2 className="typo-heading-lg">{restaurant.name}</h2>
            <div className={styles.author}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 디더링 픽셀을 그대로 보여주기 위해 원본 이미지를 쓴다 */}
              {isMine ? <img src={CURRENT_USER.avatarUrl} alt="" className={styles.avatar} /> : <span className={styles.avatar} />}
              <div className={styles.authorText}>
                <span className="typo-label-lg">{restaurant.author}</span>
                <span className={`${styles.date} typo-label-md`}>{restaurant.createdAt} 작성</span>
              </div>
              {isMine && <Badge tone="info">내 글</Badge>}
            </div>
          </header>
          <p className={`${styles.content} typo-body-md`}>{restaurant.content}</p>
          <Fieldset legend="주소">
            <div className={styles.addressRow}>
              <MapPin size={18} aria-hidden />
              <p className={`${styles.addressText} typo-body-md`}>
                {fullAddress}
              </p>
              <CopyAddressButton address={restaurant.address} />
            </div>
          </Fieldset>
          <Fieldset legend="지도">
            <MapPreview label={restaurant.mapLabel} roadLabel={restaurant.roadLabel} />
            <ButtonLink
              href={`https://map.kakao.com/?q=${encodeURIComponent(restaurant.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              rightIcon="chevron-right"
              className={page.fullWidth}
            >
              지도 앱으로 길찾기
            </ButtonLink>
          </Fieldset>
        </Panel>
        {isMine && <OwnerActions name={restaurant.name} />}
      </main>
    </div>
  );
}
