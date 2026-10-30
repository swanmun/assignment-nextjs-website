"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { MapPin } from "lucide-react";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { Fieldset } from "@/components/fieldset/Fieldset";
import { Icon } from "@/components/icon/Icon";
import { ListItem } from "@/components/list-item/ListItem";
import { MapPicker, SEOUL_CITY_HALL, type MapPoint } from "@/components/map/MapPicker";
import { MapPreview } from "@/components/map/MapPreview";
import { TopNavigation } from "@/components/navigation/TopNavigation";
import { Skeleton } from "@/components/skeleton/Skeleton";
import { TextField } from "@/components/text-field/TextField";
import { Panel, Window, WindowWell } from "@/components/window/Window";
import { cx } from "@/lib/cx";
import { PLACE_ADDRESS_PENDING, PLACE_NAME_MAX, PLACE_SEARCH_QUERY_MAX, validatePlaceName } from "@/lib/place-rules";
import { requestJson } from "@/lib/request-json";
import type { PlaceAddress, PlaceAddressResult, PlaceLocation, PlaceSearchItem, PlaceSearchResult } from "@/lib/types";
import page from "../../_components/page.module.css";
import styles from "./PlacePicker.module.css";

type SearchState =
  | { step: "idle" }
  | { step: "loading"; query: string }
  | { step: "done"; result: PlaceSearchResult }
  | { step: "error"; query: string; message: string };

/** 장소 화면에 들고 돌아온 값 */
type Choice =
  /** 아직 고르지 않음: 지번 주소·좌표는 기본값(등록 대기중 · 서울시청) */
  | { kind: "none" }
  /** 검색 결과를 골랐다: 검색어 + 고른 장소의 지번 주소·좌표 */
  | { kind: "place"; query: string; place: PlaceSearchItem }
  /** 결과가 없어 장소명을 직접 입력했다: 지도를 옮기기 전까지 지번 주소·좌표는 기본값 그대로 */
  | { kind: "direct"; name: string };

/** design.pen "07 장소 등록" 시안 상태 */
export type PlacePickerPreview = "place-results" | "place-empty" | "place-location";

const PREVIEW_RESULTS: PlaceSearchItem[] = [
  { title: "오류동 골목 손칼국수", category: "칼국수,만두", address: "서울 구로구 오류로8길 22", jibunAddress: "서울 구로구 오류동 45-12", latitude: 37.4945, longitude: 126.8447 },
  { title: "명동 손칼국수 오류점", category: "칼국수,만두", address: "서울 구로구 경인로 312", jibunAddress: null, latitude: 37.4943, longitude: 126.8478 },
  { title: "할매 손칼국수", category: "칼국수,만두", address: "서울 구로구 개봉로 54", jibunAddress: null, latitude: 37.4889, longitude: 126.8541 },
  { title: "오류시장 손칼국수", category: "국수", address: "서울 구로구 오류로 36-1", jibunAddress: null, latitude: 37.4937, longitude: 126.8432 },
  { title: "시골 손칼국수", category: "칼국수,만두", address: "경기 부천시 소사구 경인로 155", jibunAddress: null, latitude: 37.4831, longitude: 126.7952 },
];

type Initial = { searching: boolean; search: SearchState; choice: Choice };

const initialState = (initialQuery: string, preview?: PlacePickerPreview): Initial => {
  if (preview === "place-empty") {
    return { searching: true, search: { step: "done", result: { query: "영자네 손칼국수", items: [] } }, choice: { kind: "none" } };
  }
  if (preview === "place-results") {
    return { searching: true, search: { step: "done", result: { query: "손칼국수", items: PREVIEW_RESULTS } }, choice: { kind: "none" } };
  }
  if (preview === "place-location") {
    return { searching: false, search: { step: "idle" }, choice: { kind: "place", query: "손칼국수", place: PREVIEW_RESULTS[0] } };
  }
  return { searching: false, search: { step: "idle" }, choice: { kind: "none" } };
};

const searchQuery = (state: SearchState) =>
  state.step === "done" ? state.result.query : state.step === "idle" ? "" : state.query;

/** 장소 화면 검색창에 보일 글자 */
const choiceText = (choice: Choice) => (choice.kind === "place" ? choice.query : choice.kind === "direct" ? choice.name : "");

export type PlacePickerProps = {
  /** 검색 화면 검색창에 미리 채울 검색어 */
  initialQuery: string;
  preview?: PlacePickerPreview;
  /** 검색 결과를 고르고 "이 위치로 등록하기" (좌표는 지도 가운데 핀 위치, 지도를 옮겼으면 주소도 핀 위치 주소) */
  onSelect: (place: PlaceSearchItem) => void;
  /** 장소명을 직접 입력하고 "이 위치로 등록하기" (지도를 옮겨 주소를 찾았으면 그 위치, 아니면 null로 주소 없이 등록) */
  onDirectInput: (name: string, location: PlaceLocation | null) => void;
  onClose: () => void;
};

/**
 * 맛집 등록 위의 전체 화면 장소 등록.
 * 장소 화면(검색창 · 지도 · 주소) → 검색창을 누르면 검색 화면 → 결과를 고르거나 직접 입력하면 장소 화면으로 돌아온다.
 */
export const PlacePicker = ({ initialQuery, preview, onSelect, onDirectInput, onClose }: PlacePickerProps) => {
  const [initial] = useState(() => initialState(initialQuery, preview));
  const [searching, setSearching] = useState(initial.searching);
  const [query, setQuery] = useState(() => searchQuery(initial.search) || initialQuery.trim().slice(0, PLACE_SEARCH_QUERY_MAX));
  const [search, setSearch] = useState<SearchState>(initial.search);
  const [choice, setChoice] = useState<Choice>(initial.choice);
  const requestId = useRef(0);

  /** BFF 검색. 늦게 도착한 이전 검색 결과는 버린다. */
  const load = async (q: string) => {
    const id = ++requestId.current;
    try {
      const result = await requestJson<PlaceSearchResult>(
        `/api/places/search?q=${encodeURIComponent(q)}`,
        {},
        "장소를 검색하지 못했어요.",
      );
      if (id === requestId.current) setSearch({ step: "done", result });
    } catch (error) {
      if (id === requestId.current) setSearch({ step: "error", query: q, message: (error as Error).message });
    }
  };

  const runSearch = (value: string) => {
    const q = value.trim().slice(0, PLACE_SEARCH_QUERY_MAX);
    if (!q) return;
    setSearch({ step: "loading", query: q });
    void load(q);
  };

  // 아래 맛집 등록 화면이 같이 스크롤되지 않도록 막는다.
  useEffect(() => {
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
    };
  }, []);

  /** 장소 화면 검색창을 누르면 검색 화면으로. 미리 채운 검색어가 있고 아직 찾지 않았으면 바로 찾는다. */
  const openSearch = () => {
    setSearching(true);
    if (search.step === "idle") runSearch(query);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    runSearch(query);
  };

  const resetSearch = () => {
    requestId.current++;
    setSearch({ step: "idle" });
  };

  const pick = (place: PlaceSearchItem) => {
    setChoice({ kind: "place", query: searchQuery(search), place });
    setSearching(false);
  };

  const inputDirectly = (name: string) => {
    setChoice({ kind: "direct", name });
    setSearching(false);
  };

  if (searching) {
    return (
      <div className={styles.layer} role="dialog" aria-modal="true" aria-label="장소 검색">
        <TopNavigation title="장소 검색" leftAction={{ icon: "arrow-left", label: "장소 등록으로", onClick: () => setSearching(false) }} />
        <div className={styles.searchBar}>
          <form role="search" className={styles.searchForm} onSubmit={submit}>
            <TextField
              label="장소 검색"
              hideLabel
              leftIcon="search"
              value={query}
              maxLength={PLACE_SEARCH_QUERY_MAX}
              placeholder="가게 이름이나 주소로 검색"
              autoFocus={!preview}
              onChange={(event) => setQuery(event.target.value)}
              rightAdornment={
                query && (
                  <button type="button" className={styles.clear} aria-label="검색어 지우기" onClick={() => setQuery("")}>
                    <Icon name="close" size={20} />
                  </button>
                )
              }
              className={styles.searchField}
            />
            <Button type="submit" variant="secondary" disabled={!query.trim()}>
              찾기
            </Button>
          </form>
        </div>
        <div className={cx(page.body, page.narrow)}>
          <SearchResults state={search} onPick={pick} onDirectInput={inputDirectly} onReset={resetSearch} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layer} role="dialog" aria-modal="true" aria-label="장소 등록">
      <TopNavigation title="장소 등록" leftAction={{ icon: "arrow-left", label: "맛집 등록으로", onClick: onClose }} />
      <div className={styles.searchBar}>
        <div className={styles.searchForm}>
          <TextField
            label="장소 검색"
            hideLabel
            leftIcon="search"
            readOnly
            value={choiceText(choice)}
            placeholder="가게 이름이나 주소로 검색"
            aria-haspopup="dialog"
            onClick={openSearch}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openSearch();
              }
            }}
            className={cx(styles.searchField, styles.searchTrigger)}
          />
        </div>
      </div>
      <div className={cx(page.body, page.narrow)}>
        <ChosenLocation
          // 새로 고르면 지도 가운데(핀) 위치를 고른 장소에서 다시 시작한다.
          key={choice.kind === "place" ? `${choice.place.latitude}-${choice.place.longitude}` : choice.kind}
          choice={choice}
          // 시안 미리보기에서는 주소를 찾지 않는다.
          lookup={!preview}
          onSelect={onSelect}
          onDirectInput={onDirectInput}
        />
      </div>
    </div>
  );
};

const SOURCE = "네이버 지역 검색 API";

type SearchResultsProps = {
  state: SearchState;
  onPick: (place: PlaceSearchItem) => void;
  onDirectInput: (name: string) => void;
  onReset: () => void;
};

const SearchResults = ({ state, onPick, onDirectInput, onReset }: SearchResultsProps) => {
  if (state.step === "idle") {
    return (
      <Window title="네이버 지역 검색" icon={<Icon name="search" size={16} />} status={["검색어를 기다리는 중", SOURCE]}>
        <WindowWell>
          <Empty visual="search" title="장소를 검색해 주세요" description="가게 이름이나 주소를 입력하고 찾기를 눌러 주세요." />
        </WindowWell>
      </Window>
    );
  }

  const query = searchQuery(state);
  const items = state.step === "done" ? state.result.items : [];
  const resultWindow = (body: ReactNode, count: string, status: string) => (
    <Window
      title={`네이버 지역 검색 › ${query}`}
      icon={<Icon name="search" size={16} />}
      minimizable
      onClose={onReset}
      toolbar={<span className="typo-label-md">{count}</span>}
      status={[status, SOURCE]}
    >
      <WindowWell aria-busy={state.step === "loading" || undefined}>{body}</WindowWell>
    </Window>
  );

  if (state.step === "loading") {
    return resultWindow(
      [0, 1, 2].map((i) => <Skeleton key={i} shape="rect" width="100%" height={55} />),
      `'${query}' 검색 중…`,
      "검색 중",
    );
  }

  if (items.length > 0) {
    return resultWindow(
      items.map((item) => (
        <ListItem
          key={`${item.title}-${item.latitude}-${item.longitude}`}
          title={item.title}
          meta={item.category}
          description={item.jibunAddress ?? item.address}
          onClick={() => onPick(item)}
        />
      )),
      `'${query}' 검색 결과 ${items.length}곳`,
      `${items.length} / ${items.length} 표시`,
    );
  }

  const failed = state.step === "error";
  return (
    <>
      {resultWindow(
        <Empty
          visual={failed ? "warning" : "search"}
          title={failed ? "장소를 검색하지 못했어요" : "검색 결과가 없어요"}
          description={
            failed
              ? `${state.message} 아래에 장소명을 직접 입력하고 지도로 위치를 정해 주세요.`
              : `네이버에서 '${query}'을(를) 찾지 못했어요. 아래에 장소명을 직접 입력하고 지도로 위치를 정해 주세요.`
          }
        />,
        `'${query}' 검색 결과 0곳`,
        "0 / 0 표시",
      )}
      {/* 검색어가 바뀌면 입력칸을 새 검색어로 다시 채운다. */}
      <DirectInput key={query} defaultName={query} onSubmit={onDirectInput} />
    </>
  );
};

const DirectInput = ({ defaultName, onSubmit }: { defaultName: string; onSubmit: (name: string) => void }) => {
  const [name, setName] = useState(defaultName.slice(0, PLACE_NAME_MAX));
  const [touched, setTouched] = useState(false);
  const error = validatePlaceName(name);

  return (
    <>
      <Panel>
        <TextField
          label="장소명 직접 입력 *"
          leftIcon="edit"
          value={name}
          maxLength={PLACE_NAME_MAX}
          hint="다음 화면에서 지도를 옮기면 핀 위치의 주소로 등록돼요. 옮기지 않으면 주소 없이 등록돼요."
          error={touched ? error : undefined}
          onChange={(event) => setName(event.target.value)}
          onBlur={() => setTouched(true)}
          rightAdornment={
            name && (
              <button type="button" className={styles.clear} aria-label="장소명 지우기" onClick={() => setName("")}>
                <Icon name="close" size={20} />
              </button>
            )
          }
        />
      </Panel>
      <Button leftIcon="check" disabled={!!error} className={page.fullWidth} onClick={() => onSubmit(name.trim())}>
        이 이름으로 등록하기
      </Button>
    </>
  );
};

type AddressState =
  /** 지도를 아직 옮기지 않았다: 고른 장소의 주소(직접 입력이면 등록 대기중) */
  | { step: "idle" }
  | { step: "loading" }
  /** 핀 위치에서 찾은 주소. 주소가 없는 곳이거나 찾지 못했으면 null */
  | { step: "done"; found: PlaceAddress | null };

/** 지도 가운데 좌표가 이보다 덜 바뀌면 확대·축소만 한 것으로 본다. */
const SAME_POINT = 1e-6;

const moved = (a: MapPoint, b: MapPoint) =>
  Math.abs(a.latitude - b.latitude) > SAME_POINT || Math.abs(a.longitude - b.longitude) > SAME_POINT;

type ChosenLocationProps = {
  choice: Choice;
  /** 지도를 옮기면 핀 위치의 주소를 찾는다. */
  lookup: boolean;
  onSelect: (place: PlaceSearchItem) => void;
  onDirectInput: (name: string, location: PlaceLocation | null) => void;
};

/**
 * 지도(가운데 핀 고정 · 지도 이동)와 지번 주소. 고르기 전·직접 입력은 기본값(서울시청 · 등록 대기중)을 둔다.
 * 지도를 옮기면 멈출 때마다 핀 위치의 주소를 BFF(리버스 지오코딩)로 찾아 바꾼다.
 */
const ChosenLocation = ({ choice, lookup, onSelect, onDirectInput }: ChosenLocationProps) => {
  const place = choice.kind === "place" ? choice.place : null;
  const start: MapPoint = place ? { latitude: place.latitude, longitude: place.longitude } : SEOUL_CITY_HALL;
  const [point, setPoint] = useState<MapPoint>(start);
  const [address, setAddress] = useState<AddressState>({ step: "idle" });
  const requestId = useRef(0);
  const label = place?.title ?? (choice.kind === "direct" ? choice.name : undefined);
  const found = address.step === "done" ? address.found : null;

  /** 늦게 도착한 이전 위치의 주소는 버린다. */
  const findAddress = async ({ latitude, longitude }: MapPoint) => {
    const id = ++requestId.current;
    setAddress({ step: "loading" });
    try {
      const result = await requestJson<PlaceAddressResult>(
        `/api/places/address?lat=${latitude}&lng=${longitude}`,
        {},
        "주소를 찾지 못했어요.",
      );
      if (id === requestId.current) setAddress({ step: "done", found: result.found });
    } catch {
      if (id === requestId.current) setAddress({ step: "done", found: null });
    }
  };

  const changeCenter = (next: MapPoint) => {
    if (!moved(next, point)) return;
    setPoint(next);
    if (lookup && choice.kind !== "none") void findAddress(next);
  };

  const confirm = () => {
    if (place) onSelect({ ...place, ...point, ...found });
    else if (choice.kind === "direct") onDirectInput(choice.name, found && { ...found, ...point });
  };

  const addressText = () => {
    if (address.step === "loading") return "주소를 찾는 중이에요…";
    if (address.step === "done") {
      if (found) return found.jibunAddress ?? found.address;
      return place ? "이 위치의 주소를 찾지 못해 검색한 주소로 등록돼요." : "이 위치의 주소를 찾지 못해 주소 없이 등록돼요.";
    }
    return place ? (place.jibunAddress ?? place.address) : PLACE_ADDRESS_PENDING;
  };

  return (
    <>
      <MapPicker center={start} label={label} size="lg" onCenterChange={changeCenter} fallback={<MapPreview label={label ?? "서울시청"} />} />
      <Fieldset legend="지번 주소">
        <div className={styles.addressRow}>
          <MapPin size={18} aria-hidden />
          <p className={`${styles.addressText} typo-body-md`} aria-live="polite">
            {addressText()}
          </p>
        </div>
      </Fieldset>
      <Button
        leftIcon="check"
        disabled={choice.kind === "none" || address.step === "loading"}
        className={page.fullWidth}
        onClick={confirm}
      >
        이 위치로 등록하기
      </Button>
    </>
  );
};
