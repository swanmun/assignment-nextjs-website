import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/badge/Badge";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { cx } from "@/lib/cx";
import { getCurrentUser } from "@/lib/supabase/auth";
import { getPlace } from "@/lib/supabase/place";
import page from "../../../_components/page.module.css";
import { RestaurantForm } from "../../_components/RestaurantForm";

export const metadata: Metadata = { title: "맛집 수정 · 숨은 맛집 커뮤니티" };

type EditRestaurantProps = {
  params: Promise<{ id: string }>;
};

const Edit = async ({ params }: EditRestaurantProps) => {
  const { id } = await params;
  const [place, user] = await Promise.all([getPlace(id), getCurrentUser()]);
  if (!place) notFound();
  if (!user) redirect("/login");
  // 다른 사람의 글은 수정 화면을 열지 않는다. BFF(PATCH)에서도 한 번 더 막는다.
  if (place.authorId !== user.id) redirect(`/restaurants/${place.id}`);

  return (
    <>
      <TopNavigation
        title="맛집 수정"
        leftAction={{ icon: "arrow-left", label: "상세로", href: `/restaurants/${place.id}` }}
        rightSlot={<Badge tone="warning">수정 중</Badge>}
      />
      <main className={cx(page.body, page.narrow)}>
        <RestaurantForm
          place={{ id: place.id, name: place.name, content: place.content, photos: place.photos, location: place.location }}
        />
      </main>
    </>
  );
};

export default function EditRestaurant({ params }: EditRestaurantProps) {
  return (
    <div className={page.page}>
      <Suspense
        fallback={
          <>
            <TopNavigation title="맛집 수정" rightSlot={<Badge tone="warning">수정 중</Badge>} />
            <main className={cx(page.body, page.narrow)}>
              <Skeleton shape="rect" width="100%" height={480} />
            </main>
          </>
        }
      >
        <Edit params={params} />
      </Suspense>
    </div>
  );
}
