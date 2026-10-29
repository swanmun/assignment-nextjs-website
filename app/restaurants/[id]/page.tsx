import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/badge/Badge";
import { ButtonLink } from "@/components/button/Button";
import { PhotoCarousel } from "@/components/carousel/PhotoCarousel";
import { Empty } from "@/components/empty/Empty";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { MAP_IMAGE_HEIGHT, MapImage } from "@/components/map/MapImage";
import { MapPreview } from "@/components/map/MapPreview";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { Panel } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import { mapImageUrl, naverMapUrl } from "@/lib/map-url";
import { shortJibun } from "@/lib/place-rules";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getPlace } from "@/lib/supabase/place";
import page from "../../_components/page.module.css";
import { CopyAddressButton, DetailTopNavigation, OwnerActions } from "./_components/DetailClient";
import styles from "./detail.module.css";

type DetailProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const place = await getPlace((await params).id);
  return { title: place ? `${place.name} · 숨은 맛집 커뮤니티` : "숨은 맛집 커뮤니티" };
}

const Detail = async ({ params }: DetailProps) => {
  const { id } = await params;
  const [place, user] = await Promise.all([getPlace(id), getCurrentUser()]);
  if (!place) notFound();

  const isMine = user?.id === place.authorId;
  const { location } = place;
  // 지도를 못 불러오면 일러스트 지도로 대신한다.
  const fallbackMap = <MapPreview label={place.name} roadLabel={place.address.split(" ")[2]} />;

  return (
    <>
      <DetailTopNavigation name={place.name} />
      <PhotoCarousel photos={place.photos.map((photo, i) => ({ src: photo.url, alt: `${place.name} 사진 ${i + 1}` }))} />
      {location && (
        <MapImage
          src={mapImageUrl(location, 360, MAP_IMAGE_HEIGHT.sm)}
          wideSrc={mapImageUrl(location, 640, MAP_IMAGE_HEIGHT.sm)}
          alt={`${place.name} 위치 미니 지도`}
          size="sm"
          bleed
          fallback={fallbackMap}
          action={
            <ButtonLink
              href={naverMapUrl(location.address)}
              target="_blank"
              rel="noopener noreferrer"
              variant="secondary"
              rightIcon="chevron-right"
            >
              크게 보기
            </ButtonLink>
          }
        />
      )}
      <main className={cx(page.body, page.narrow)}>
        <Panel>
          <header className={styles.header}>
            <h2 className="typo-heading-lg">{place.name}</h2>
            <div className={styles.author}>
              {/* eslint-disable-next-line @next/next/no-img-element -- 스토리지·구글 사진 URL을 그대로 보여준다 */}
              <img src={place.authorAvatarUrl} alt="" className={styles.avatar} />
              <div className={styles.authorText}>
                <span className="typo-label-lg">{place.author}</span>
                <span className={`${styles.date} typo-label-md`}>{place.createdAt} 작성</span>
              </div>
              {isMine && <Badge tone="info">내 글</Badge>}
            </div>
          </header>
          <p className={`${styles.content} typo-body-md`}>{place.content}</p>
          <Fieldset legend="주소">
            <div className={styles.addressRow}>
              <MapPin size={18} aria-hidden />
              <p className={`${styles.addressText} typo-body-md`}>
                {place.address}
                {location?.jibunAddress && `\n(${shortJibun(location.jibunAddress)})`}
              </p>
              {location && <CopyAddressButton address={place.address} />}
            </div>
          </Fieldset>
          <Fieldset legend="지도">
            {location ? (
              <>
                <MapImage
                  src={mapImageUrl(location, 360, MAP_IMAGE_HEIGHT.md)}
                  wideSrc={mapImageUrl(location, 640, MAP_IMAGE_HEIGHT.md)}
                  alt={`${place.name} 위치 지도`}
                  fallback={fallbackMap}
                />
                <ButtonLink
                  href={`https://map.kakao.com/?q=${encodeURIComponent(place.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  variant="secondary"
                  rightIcon="chevron-right"
                  className={page.fullWidth}
                >
                  지도 앱으로 길찾기
                </ButtonLink>
              </>
            ) : (
              <div className={styles.mapEmpty}>
                <Empty visual="search" title="아직 위치가 등록되지 않았어요" description="주소가 등록되면 지도에 핀이 표시돼요." />
              </div>
            )}
          </Fieldset>
        </Panel>
        {isMine && <OwnerActions id={place.id} name={place.name} />}
      </main>
    </>
  );
};

export default function RestaurantDetail({ params }: DetailProps) {
  return (
    <div className={page.page}>
      <Suspense
        fallback={
          <>
            <DetailTopNavigation name="" />
            <main className={cx(page.body, page.narrow)}>
              <Skeleton shape="rect" width="100%" height={480} />
            </main>
          </>
        }
      >
        <Detail params={params} />
      </Suspense>
    </div>
  );
}
