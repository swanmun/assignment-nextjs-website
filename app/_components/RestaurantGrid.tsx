import Link from "next/link";
import { Card, CardRemoveButton } from "@/components/card/Card";
import type { ListView } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import type { Place } from "@/lib/types";
import page from "./page.module.css";

type RestaurantGridProps = {
  restaurants: Place[];
  view?: ListView;
  /** 있으면 카드마다 삭제(X) 버튼을 보여준다. (내 글 목록) */
  onRemove?: (restaurant: Place) => void;
  /** 삭제 요청 중인 글. 그동안 X 버튼을 끈다. */
  removingId?: string;
};

/** 맛집 카드 그리드. 카드를 누르면 상세로 이동한다. */
export const RestaurantGrid = ({ restaurants, view = "list", onRemove, removingId }: RestaurantGridProps) => (
  <ul className={cx(page.cardGrid, view === "grid" && page.cardGridDense)}>
    {restaurants.map((restaurant) => (
      <li key={restaurant.id} className={page.gridItem}>
        <Link href={`/restaurants/${restaurant.id}`} className={page.cardLink}>
          <Card
            title={restaurant.name}
            imageUrl={restaurant.photos[0]?.url}
            imageAlt={`${restaurant.name} 사진`}
            address={restaurant.address}
            summary={restaurant.summary}
            author={restaurant.author}
            date={restaurant.date}
          />
        </Link>
        {onRemove && (
          <CardRemoveButton
            aria-label={`${restaurant.name} 삭제`}
            disabled={removingId === restaurant.id}
            onClick={() => onRemove(restaurant)}
          />
        )}
      </li>
    ))}
  </ul>
);
