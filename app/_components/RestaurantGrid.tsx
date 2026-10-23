import Link from "next/link";
import { Badge } from "@/components/badge/Badge";
import { Card } from "@/components/card/Card";
import type { ListView } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import type { Restaurant } from "@/lib/mock-data";
import page from "./page.module.css";

type RestaurantGridProps = {
  restaurants: Restaurant[];
  view?: ListView;
};

/** 맛집 카드 그리드. 카드를 누르면 상세로 이동한다. */
export const RestaurantGrid = ({ restaurants, view = "list" }: RestaurantGridProps) => (
  <ul className={cx(page.cardGrid, view === "grid" && page.cardGridDense)}>
    {restaurants.map((restaurant) => (
      <li key={restaurant.id} className={page.gridItem}>
        <Link href={`/restaurants/${restaurant.id}`} className={page.cardLink}>
          <Card
            title={restaurant.name}
            badge={
              restaurant.isNew ? (
                <Badge tone="info">NEW</Badge>
              ) : undefined
            }
            imageUrl={restaurant.photos[0]}
            imageAlt={`${restaurant.name} 사진`}
            address={restaurant.address}
            summary={restaurant.summary}
            author={restaurant.author}
            date={restaurant.date}
          />
        </Link>
      </li>
    ))}
  </ul>
);
