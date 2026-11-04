import Link from "next/link";
import { Badge } from "@/components/badge/Badge";
import { Button } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { cx } from "@/lib/cx";
import styles from "./OrderItem.module.css";

export const ORDER_ITEM_STATUSES = ["paid", "paid-locked", "canceled"] as const;
export type OrderItemStatus = (typeof ORDER_ITEM_STATUSES)[number];

export const REFUND_TONES = ["success", "warning"] as const;
export type RefundTone = (typeof REFUND_TONES)[number];

/** 상태별 기본 배지 문구 */
const STATUS_LABEL: Record<OrderItemStatus, string> = {
  paid: "결제 완료",
  "paid-locked": "결제 완료",
  canceled: "취소 완료",
};

export type OrderItemProps = {
  /** paid: 결제 완료 · 취소 가능 / paid-locked: 결제 완료 · 취소 불가 / canceled: 취소 완료 */
  status: OrderItemStatus;
  /** 항목을 누르면 갈 주소 (강연·모임 상세) */
  href: string;
  /** 상품 썸네일 (72px, 디더링 이미지) */
  imageUrl: string;
  imageAlt?: string;
  /** 종류 배지 — 예: "모임", "강연" */
  kind: string;
  /** 상태 배지 문구. 생략하면 상태별 기본 문구(결제 완료 · 취소 완료) */
  statusLabel?: string;
  /** 상품명 */
  title: string;
  /** 일시 · 장소 — 예: "11.21(토) 11:00 · 구로역 2번 출구" */
  schedule: string;
  /** 금액 — 예: "25,000원", 취소 완료는 "환불 30,000원" */
  amount: string;
  /** 금액 아래 보조 문구 — 예: "11.03 결제 · 카카오페이" */
  amountDetail: string;
  /** paid에서 결제 취소 버튼을 누르면 호출된다. */
  onCancel?: () => void;
  /** paid-locked에서 취소할 수 없는 이유 */
  lockedReason?: string;
  /** canceled에서 오른쪽 환불 상태 배지 문구 */
  refundLabel?: string;
  /** 환불 상태 배지 색 — 완료 success · 진행 중 warning */
  refundTone?: RefundTone;
  className?: string;
};

/**
 * 마이 페이지 결제 내역·취소 내역 목록 항목 — 가로 전체 · 높이 auto.
 * 항목 전체가 상세로 가는 링크이고, 결제 취소 버튼만 따로 동작한다(버튼을 링크 안에 넣지 않고 위에 겹친다).
 */
export const OrderItem = ({
  status,
  href,
  imageUrl,
  imageAlt = "",
  kind,
  statusLabel = STATUS_LABEL[status],
  title,
  schedule,
  amount,
  amountDetail,
  onCancel,
  lockedReason = "행사 2일 전부터는 취소할 수 없어요",
  refundLabel = "환불 완료",
  refundTone = "success",
  className,
}: OrderItemProps) => (
  <article className={cx(styles.item, className)}>
    <div className={styles.main}>
      {/* eslint-disable-next-line @next/next/no-img-element -- 디자인 시스템 컴포넌트는 이미지 로더에 의존하지 않는다 */}
      <img src={imageUrl} alt={imageAlt} className={styles.thumbnail} />
      <div className={styles.info}>
        <div className={styles.badges}>
          <Badge tone="neutral">{kind}</Badge>
          <Badge tone={status === "canceled" ? "neutral" : "success"}>{statusLabel}</Badge>
        </div>
        <h3 className={`${styles.title} typo-heading-sm`}>
          <Link href={href} className={styles.link}>
            {title}
          </Link>
        </h3>
        <p className={`${styles.schedule} typo-label-md`}>{schedule}</p>
      </div>
    </div>
    <div className={styles.footer}>
      <div className={styles.footerRow}>
        <div className={styles.amount}>
          <span className={`${styles.amountValue} typo-label-lg`}>{amount}</span>
          <span className={`${styles.amountDetail} typo-label-md`}>{amountDetail}</span>
        </div>
        {status === "canceled" ? (
          <Badge tone={refundTone}>{refundLabel}</Badge>
        ) : (
          <Button
            variant="secondary"
            size="sm"
            disabled={status === "paid-locked"}
            onClick={onCancel}
            aria-label={`결제 취소: ${title}`}
            className={styles.action}
          >
            결제 취소
          </Button>
        )}
      </div>
      {status === "paid-locked" && (
        <p className={`${styles.reason} typo-label-md`}>
          <Icon name="info" size={16} />
          {lockedReason}
        </p>
      )}
    </div>
  </article>
);
