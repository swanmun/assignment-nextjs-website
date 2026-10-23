import { MapPin } from "lucide-react";
import { cx } from "@/lib/cx";
import styles from "./MapPreview.module.css";

export type MapPreviewProps = {
  /** 핀 위 이름표 */
  label: string;
  /** 주요 도로 이름표 */
  roadLabel?: string;
  className?: string;
};

/** 실제 지도 연동 전까지 위치를 보여주는 일러스트 지도. 핀은 항상 가운데에 둔다. */
export const MapPreview = ({ label, roadLabel, className }: MapPreviewProps) => (
  <div className={cx(styles.map, className)} role="img" aria-label={`${label} 위치 지도`}>
    <span className={cx(styles.shape, styles.diagonal)} />
    <span className={cx(styles.shape, styles.roadH3)} />
    <span className={cx(styles.shape, styles.roadH2)} />
    <span className={cx(styles.shape, styles.roadH1)} />
    <span className={cx(styles.shape, styles.roadV3)} />
    <span className={cx(styles.shape, styles.roadV2)} />
    <span className={cx(styles.shape, styles.roadV1)} />
    <span className={cx(styles.shape, styles.mainRoad)} />
    <span className={cx(styles.shape, styles.stream)} />
    <span className={cx(styles.shape, styles.park)} />
    <div className={styles.pin}>
      <span className={`${styles.pinLabel} typo-label-md`}>{label}</span>
      <MapPin size={40} className={styles.pinIcon} fill="var(--color-background-default)" aria-hidden />
    </div>
    {roadLabel && <span className={`${styles.roadLabel} typo-label-md`}>{roadLabel}</span>}
  </div>
);
