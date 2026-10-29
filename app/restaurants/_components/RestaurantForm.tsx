"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { FileItem } from "@/components/file-uploader/FileItem";
import { FileUploader } from "@/components/file-uploader/FileUploader";
import { Icon } from "@/components/icon/Icon";
import { MAP_IMAGE_HEIGHT, MapImage } from "@/components/map/MapImage";
import { MapPreview } from "@/components/map/MapPreview";
import { TextArea } from "@/components/text-area/TextArea";
import { TextField } from "@/components/text-field/TextField";
import { Toast } from "@/components/toast/Toast";
import { Panel } from "@/components/window/Window";
import { mapImageUrl } from "@/lib/map-url";
import {
  PLACE_ADDRESS_MAX,
  PLACE_CONTENT_MAX,
  PLACE_CONTENT_MIN,
  PLACE_IMAGE_MAX,
  PLACE_IMAGE_MAX_BYTES,
  PLACE_NAME_MAX,
  shortJibun,
  validatePlaceContent,
  validatePlaceImage,
  validatePlaceImageCount,
  validatePlaceName,
  type PlaceLocation,
} from "@/lib/place-rules";
import { requestJson } from "@/lib/request-json";
import type { PlacePhoto, PlaceSearchItem } from "@/lib/types";
import page from "../../_components/page.module.css";
import { PlacePicker, type PlacePickerPreview } from "./PlacePicker";
import styles from "./RestaurantForm.module.css";

type Photo = {
  key: string;
  name: string;
  meta: string;
  url: string;
  /** 새로 고른 파일. 없으면 이미 등록된 사진이다. */
  file?: File;
  /** 이미 등록된 사진의 place_image.id */
  existingId?: string;
  /** 올릴 수 없는 사진이면 안내 문구 */
  error?: string;
};

type Field = "photos" | "name" | "content" | "address";

type FormState = {
  photos: Photo[];
  name: string;
  content: string;
  /** 장소 검색으로 고른 위치 */
  location: PlaceLocation | null;
  /** 장소를 고르지 않고 이름만 직접 입력했다 (주소 없이 등록) */
  locationSkipped: boolean;
  /** 주소 칸에 입력 중인 검색어 */
  addressQuery: string;
};

/** 수정할 글. 없으면 새 글 등록이다. */
export type EditablePlace = {
  id: string;
  name: string;
  content: string;
  photos: PlacePhoto[];
  location: PlaceLocation | null;
};

const ALL_FIELDS: Field[] = ["photos", "name", "content", "address"];

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

const initialState = (place?: EditablePlace): FormState => ({
  name: place?.name ?? "",
  content: place?.content ?? "",
  photos: (place?.photos ?? []).map((photo, i) => ({
    key: photo.id,
    name: `등록된 사진 ${i + 1}`,
    meta: "등록된 사진",
    url: photo.url,
    existingId: photo.id,
  })),
  location: place?.location ?? null,
  // 위치 없이 올린 기존 글은 그대로 수정할 수 있게 둔다.
  locationSkipped: Boolean(place && !place.location),
  addressQuery: "",
});

/** design.pen "03 등록 - 입력 오류" 시안 상태 (?preview=error) */
const ERROR_PREVIEW: FormState = {
  photos: [
    { key: "p1", name: "IMG_2039.jpg", meta: "2.4MB · 첨부 완료", url: "/images/thumb-8.png" },
    { key: "p2", name: "IMG_2040.jpg", meta: "3.1MB · 첨부 완료", url: "/images/thumb-8.png" },
    { key: "p3", name: "IMG_2041.jpg", meta: "12.4MB · 용량 초과", url: "/images/thumb-8.png", error: "1장당 10MB까지 올릴 수 있어요" },
  ],
  name: "구로시장 할매 순대국",
  content: "",
  location: null,
  locationSkipped: false,
  addressQuery: "",
};

const validate = (form: FormState): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  const photos = form.photos.find((photo) => photo.error)?.error ?? validatePlaceImageCount(form.photos.length);
  if (photos) errors.photos = photos;
  const name = validatePlaceName(form.name);
  if (name) errors.name = name;
  const content = validatePlaceContent(form.content);
  if (content) errors.content = content;
  if (!form.location && !form.locationSkipped) errors.address = "주소 검색으로 위치를 지정해 주세요.";
  return errors;
};

/** "error": 입력 오류 시안, 나머지: 장소 등록 시안 */
export type RestaurantFormPreview = "error" | PlacePickerPreview;

type PickerState = { query: string; preview?: PlacePickerPreview };

type RestaurantFormProps = {
  place?: EditablePlace;
  preview?: RestaurantFormPreview;
};

export const RestaurantForm = ({ place, preview }: RestaurantFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => (preview === "error" ? ERROR_PREVIEW : initialState(place)));
  const [touched, setTouched] = useState<Set<Field>>(() => new Set(preview === "error" ? ALL_FIELDS : []));
  const [picker, setPicker] = useState<PickerState | null>(() =>
    preview && preview !== "error" ? { query: "", preview } : null,
  );
  /** 장소 등록 화면을 열 때 방문 기록을 하나 쌓았는지. 쌓았으면 뒤로 가기로 닫는다. */
  const pickerHistory = useRef(false);
  const [toastDismissed, setToastDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const blobUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  // 장소 등록 화면에서 기기 뒤로 가기를 누르면 맛집 등록으로 돌아온다(작성 중인 사진·글은 그대로 둔다).
  const pickerOpen = picker !== null;
  useEffect(() => {
    if (!pickerOpen) return;
    const onPopState = () => {
      pickerHistory.current = false;
      setPicker(null);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [pickerOpen]);

  const errors = validate(form);
  const visibleErrors = (Object.keys(errors) as Field[]).filter((field) => touched.has(field));
  const isValid = Object.keys(errors).length === 0;
  const touch = (field: Field) => setTouched((prev) => new Set(prev).add(field));
  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));
  const errorFor = (field: Field) => (touched.has(field) ? errors[field] : undefined);

  const addFiles = (files: File[]) => {
    touch("photos");
    setToastDismissed(false);
    const room = PLACE_IMAGE_MAX - form.photos.length;
    const added: Photo[] = files.slice(0, room).map((file) => {
      const url = URL.createObjectURL(file);
      blobUrls.current.add(url);
      const error = validatePlaceImage(file);
      const problem = file.size > PLACE_IMAGE_MAX_BYTES ? "용량 초과" : "형식 오류";
      return {
        key: `${file.name}-${file.lastModified}-${url}`,
        name: file.name,
        meta: `${mb(file.size)} · ${error ? problem : "첨부 완료"}`,
        url,
        file,
        error,
      };
    });
    update({ photos: [...form.photos, ...added] });
  };

  const openPicker = (query: string) => {
    setPicker({ query: query.trim() });
    window.history.pushState(null, "");
    pickerHistory.current = true;
  };

  const closePicker = () => {
    if (pickerHistory.current) window.history.back();
    else setPicker(null);
  };

  const selectPlace = ({ title, address, jibunAddress, latitude, longitude }: PlaceSearchItem) => {
    touch("address");
    setForm((prev) => ({
      ...prev,
      // 이름을 아직 안 적었으면 고른 가게 이름으로 채운다.
      name: prev.name.trim() ? prev.name : title.slice(0, PLACE_NAME_MAX),
      location: { address, jibunAddress, latitude, longitude },
      locationSkipped: false,
      addressQuery: "",
    }));
    closePicker();
  };

  const skipLocation = (name: string) => {
    touch("address");
    touch("name");
    update({ name, location: null, locationSkipped: true, addressQuery: "" });
    closePicker();
  };

  const removePhoto = (key: string) => {
    const photo = form.photos.find((p) => p.key === key);
    if (photo?.file) {
      URL.revokeObjectURL(photo.url);
      blobUrls.current.delete(photo.url);
    }
    update({ photos: form.photos.filter((p) => p.key !== key) });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setTouched(new Set(ALL_FIELDS));
    setToastDismissed(false);
    setServerError(undefined);
    if (!isValid || submitting) return;

    // 기존 사진은 남길 id만, 새 사진은 파일을 보낸다. 서버가 같은 규칙으로 다시 검증한다.
    const body = new FormData();
    body.append("name", form.name.trim());
    body.append("content", form.content.trim());
    for (const photo of form.photos) {
      if (photo.existingId) body.append("keepImageIds", photo.existingId);
      else if (photo.file) body.append("images", photo.file);
    }
    if (form.location) {
      body.append("address", form.location.address);
      if (form.location.jibunAddress) body.append("jibunAddress", form.location.jibunAddress);
      body.append("latitude", String(form.location.latitude));
      body.append("longitude", String(form.location.longitude));
    }

    setSubmitting(true);
    try {
      const { id } = await requestJson<{ id: string }>(
        place ? `/api/places/${place.id}` : "/api/places",
        { method: place ? "PATCH" : "POST", body },
        place ? "맛집을 수정하지 못했어요." : "맛집을 등록하지 못했어요.",
      );
      router.push(`/restaurants/${id}`);
      router.refresh();
    } catch (error) {
      setServerError((error as Error).message);
      setSubmitting(false);
    }
  };

  const { location } = form;
  const addressValue = location?.address ?? form.addressQuery;
  const mapHeight = MAP_IMAGE_HEIGHT.md;

  return (
    <>
      {picker && (
        <PlacePicker
          initialQuery={picker.query}
          preview={picker.preview}
          onSelect={selectPlace}
          onDirectInput={skipLocation}
          onClose={closePicker}
        />
      )}
    <form className={styles.form} onSubmit={submit} noValidate>
      {serverError ? (
        <Toast type="error" onClose={() => setServerError(undefined)} className={styles.toast}>
          {serverError}
        </Toast>
      ) : (
        visibleErrors.length > 0 &&
        !toastDismissed && (
          <Toast type="error" onClose={() => setToastDismissed(true)} className={styles.toast}>
            확인할 항목이 {visibleErrors.length}개 있어요. 빨간색으로 표시된 칸을 채우면 {place ? "수정" : "등록"} 버튼이 켜져요.
          </Toast>
        )
      )}
      <Panel>
        <section className={styles.photoSection} aria-label="사진">
          <div className={styles.labelRow}>
            <span className="typo-label-lg">사진 *</span>
            <span className={`${styles.counter} typo-label-md`}>
              {form.photos.filter((photo) => !photo.error).length}/{PLACE_IMAGE_MAX}
            </span>
          </div>
          <FileUploader
            hint={`JPG · PNG, 1장당 10MB · 최대 ${PLACE_IMAGE_MAX}장`}
            accept="image/png,image/jpeg"
            error={errorFor("photos")}
            disabled={submitting || form.photos.length >= PLACE_IMAGE_MAX}
            onFilesSelected={addFiles}
          >
            {form.photos.length > 0 &&
              form.photos.map((photo) => (
                <FileItem
                  key={photo.key}
                  name={photo.name}
                  meta={photo.meta}
                  status={photo.error ? "error" : "complete"}
                  thumbnailUrl={photo.url}
                  removeDisabled={submitting}
                  onRemove={() => {
                    touch("photos");
                    removePhoto(photo.key);
                  }}
                />
              ))}
          </FileUploader>
        </section>

        <TextField
          label="맛집 이름 *"
          name="name"
          value={form.name}
          maxLength={PLACE_NAME_MAX}
          placeholder="예) 구로시장 할매 순대국"
          hint={`${form.name.length}/${PLACE_NAME_MAX}자`}
          error={errorFor("name")}
          rightAdornment={!errors.name ? <Icon name="check" size={20} className={styles.success} aria-label="입력 완료" /> : undefined}
          onChange={(event) => update({ name: event.target.value })}
          onBlur={() => touch("name")}
        />

        <TextArea
          label="추천 내용 *"
          name="content"
          value={form.content}
          maxLength={PLACE_CONTENT_MAX}
          placeholder="추천 이유, 메뉴, 분위기, 주차 정보를 자유롭게 적어 주세요."
          hint={`${PLACE_CONTENT_MIN}자 이상 입력해 주세요.`}
          error={errorFor("content")}
          onChange={(event) => update({ content: event.target.value })}
          onBlur={() => touch("content")}
        />

        <section className={styles.addressSection} aria-label="주소">
          <div className={styles.addressRow}>
            <TextField
              label="주소 *"
              name="address"
              value={addressValue}
              maxLength={PLACE_ADDRESS_MAX}
              placeholder="도로명, 건물명, 지번"
              hint={
                location?.jibunAddress
                  ? `(${shortJibun(location.jibunAddress)})`
                  : form.locationSkipped
                    ? "주소 없이 등록돼요. 장소 입력하기로 다시 찾을 수 있어요."
                    : undefined
              }
              error={errorFor("address")}
              disabled={submitting}
              onChange={(event) => update({ addressQuery: event.target.value, location: null, locationSkipped: false })}
              onBlur={() => touch("address")}
              onKeyDown={(event) => {
                // 주소 칸의 엔터는 글 등록이 아니라 주소 검색이다.
                if (event.key === "Enter" && !event.nativeEvent.isComposing) {
                  event.preventDefault();
                  openPicker(addressValue);
                }
              }}
              className={styles.addressField}
            />
            <Button
              variant="secondary"
              leftIcon="search"
              disabled={submitting}
              className={styles.addressSearch}
              onClick={() => openPicker(addressValue)}
            >
              검색
            </Button>
          </div>
          <Button
            variant="secondary"
            leftIcon="search"
            rightIcon="chevron-right"
            disabled={submitting}
            className={page.fullWidth}
            onClick={() => openPicker(form.name)}
          >
            장소 입력하기
          </Button>
          {location ? (
            <MapImage
              src={mapImageUrl(location, 360, mapHeight)}
              wideSrc={mapImageUrl(location, 640, mapHeight)}
              alt={`${form.name || location.address} 위치 지도`}
              fallback={<MapPreview label={form.name || "선택한 장소"} />}
            />
          ) : (
            <div className={styles.mapEmpty}>
              <Empty
                visual="search"
                title="지도에 표시할 위치가 없어요"
                description={
                  form.locationSkipped ? "주소 없이 등록하면 지도에 핀이 표시되지 않아요." : "주소를 검색하면 핀이 표시돼요."
                }
              />
            </div>
          )}
        </section>
      </Panel>
      <Button type="submit" size="lg" loading={submitting} disabled={!isValid || submitting} className={page.fullWidth}>
        {place ? "수정하기" : "등록하기"}
      </Button>
    </form>
    </>
  );
};
