"use client";

import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { cx } from "@/lib/cx";
import { loadNaverMaps, onNaverMapsAuthFailure, type NaverMap, type NaverMapsSdk } from "@/lib/naver/maps-sdk";
import type { MapImageSize } from "./MapImage";
import styles from "./MapPicker.module.css";

/** 지도 위 한 점 (WGS84) */
export type MapPoint = { latitude: number; longitude: number };

/** 기본 위치: 서울시청 */
export const SEOUL_CITY_HALL: MapPoint = { latitude: 37.5666805, longitude: 126.9784147 };

/** 정적 지도(MapImage)와 같은 확대 수준 */
const ZOOM = 16;

type Status = "loading" | "ready" | "failed";

export type MapPickerProps = {
  /** 지도 가운데. 바뀌면 그 위치로 옮긴다. 기본 서울시청 */
  center?: MapPoint;
  /** 핀 위 이름표 */
  label?: string;
  /** 높이 sm 140 · md 180 · lg 360 (MapImage와 같다) */
  size?: MapImageSize;
  /** 지도 이동이 끝날 때마다 가운데(핀) 위치를 알린다. */
  onCenterChange?: (point: MapPoint) => void;
  /** 지도를 불러오지 못하면 대신 보여줄 요소 (예: MapPreview) */
  fallback?: ReactNode;
  className?: string;
};

/** 가운데에 핀을 고정하고 지도를 움직여 위치를 고르는 네이버 지도 */
export const MapPicker = ({ center = SEOUL_CITY_HALL, label, size = "lg", onCenterChange, fallback, className }: MapPickerProps) => {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<{ sdk: NaverMapsSdk; map: NaverMap }>(null);
  const [status, setStatus] = useState<Status>("loading");
  const { latitude, longitude } = center;

  const initialCenter = useEffectEvent(() => ({ latitude, longitude }));
  const reportCenter = useEffectEvent((point: MapPoint) => onCenterChange?.(point));

  // 지도는 한 번만 만든다. 가운데가 바뀌면 아래 effect가 옮긴다.
  useEffect(() => {
    let cancelled = false;
    let instance: NaverMap | undefined;
    let idle: unknown;

    const unsubscribe = onNaverMapsAuthFailure(() => setStatus("failed"));
    loadNaverMaps()
      .then((sdk) => {
        if (cancelled || !element.current) return;
        const start = initialCenter();
        instance = new sdk.Map(element.current, {
          center: new sdk.LatLng(start.latitude, start.longitude),
          zoom: ZOOM,
          scaleControl: false,
          mapDataControl: false,
        });
        const created = instance;
        idle = sdk.Event.addListener(created, "idle", () => {
          const point = created.getCenter();
          reportCenter({ latitude: point.lat(), longitude: point.lng() });
        });
        map.current = { sdk, map: created };
        setStatus("ready");
      })
      .catch(() => {
        if (!cancelled) setStatus("failed");
      });

    return () => {
      cancelled = true;
      unsubscribe();
      if (idle) map.current?.sdk.Event.removeListener(idle);
      instance?.destroy();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    const current = map.current;
    if (!current) return;
    const point = current.map.getCenter();
    if (point.lat() !== latitude || point.lng() !== longitude) {
      current.map.setCenter(new current.sdk.LatLng(latitude, longitude));
    }
  }, [latitude, longitude]);

  if (status === "failed") {
    return <div className={cx(styles.map, styles[size], styles.fallback, className)}>{fallback}</div>;
  }

  return (
    <div className={cx(styles.map, styles[size], className)} aria-busy={status === "loading" || undefined}>
      <div
        ref={element}
        className={styles.canvas}
        role="application"
        aria-label={`${label ? `${label} ` : ""}위치 지도. 지도를 움직여 가운데 핀을 맞춰 주세요.`}
      />
      <div className={styles.pin} aria-hidden>
        {label && <span className={`${styles.pinLabel} typo-label-md`}>{label}</span>}
        <MapPin size={40} className={styles.pinIcon} fill="var(--color-background-default)" />
      </div>
    </div>
  );
};
