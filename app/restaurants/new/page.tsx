import type { Metadata } from "next";
import { Suspense } from "react";
import { Badge } from "@/components/badge/Badge";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { cx } from "@/lib/cx";
import page from "../../_components/page.module.css";
import { RestaurantForm } from "../_components/RestaurantForm";

export const metadata: Metadata = { title: "맛집 등록 · 숨은 맛집 커뮤니티" };

type NewRestaurantProps = {
  searchParams: Promise<{ preview?: string }>;
};

const Form = async ({ searchParams }: NewRestaurantProps) => {
  const { preview } = await searchParams;
  return <RestaurantForm preview={preview === "error" ? "error" : undefined} />;
};

export default function NewRestaurant({ searchParams }: NewRestaurantProps) {
  return (
    <div className={page.page}>
      <TopNavigation
        title="맛집 등록"
        leftAction={{ icon: "arrow-left", label: "목록으로", href: "/" }}
        rightSlot={<Badge tone="warning">작성 중</Badge>}
      />
      <main className={cx(page.body, page.narrow)}>
        <Suspense fallback={<RestaurantForm />}>
          <Form searchParams={searchParams} />
        </Suspense>
      </main>
    </div>
  );
}
