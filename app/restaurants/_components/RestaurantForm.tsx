"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button/Button";
import { FileItem } from "@/components/file-uploader/FileItem";
import { FileUploader } from "@/components/file-uploader/FileUploader";
import { Icon } from "@/components/icon/Icon";
import { TextArea } from "@/components/text-area/TextArea";
import { TextField } from "@/components/text-field/TextField";
import { Toast } from "@/components/toast/Toast";
import { Panel } from "@/components/window/Window";
import {
  PLACE_ADDRESS_PENDING,
  PLACE_CONTENT_MAX,
  PLACE_CONTENT_MIN,
  PLACE_IMAGE_MAX,
  PLACE_IMAGE_MAX_BYTES,
  PLACE_NAME_MAX,
  validatePlaceContent,
  validatePlaceImage,
  validatePlaceImageCount,
  validatePlaceName,
} from "@/lib/place-rules";
import { requestJson } from "@/lib/request-json";
import type { PlacePhoto } from "@/lib/types";
import page from "../../_components/page.module.css";
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

type Field = "photos" | "name" | "content";

type FormState = {
  photos: Photo[];
  name: string;
  content: string;
};

/** 수정할 글. 없으면 새 글 등록이다. */
export type EditablePlace = {
  id: string;
  name: string;
  content: string;
  photos: PlacePhoto[];
};

const ALL_FIELDS: Field[] = ["photos", "name", "content"];

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
};

const validate = (form: FormState): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  const photos = form.photos.find((photo) => photo.error)?.error ?? validatePlaceImageCount(form.photos.length);
  if (photos) errors.photos = photos;
  const name = validatePlaceName(form.name);
  if (name) errors.name = name;
  const content = validatePlaceContent(form.content);
  if (content) errors.content = content;
  return errors;
};

type RestaurantFormProps = {
  place?: EditablePlace;
  preview?: "error";
};

export const RestaurantForm = ({ place, preview }: RestaurantFormProps) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(() => (preview === "error" ? ERROR_PREVIEW : initialState(place)));
  const [touched, setTouched] = useState<Set<Field>>(() => new Set(preview === "error" ? ALL_FIELDS : []));
  const [toastDismissed, setToastDismissed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string>();
  const blobUrls = useRef(new Set<string>());

  useEffect(() => {
    const urls = blobUrls.current;
    return () => urls.forEach((url) => URL.revokeObjectURL(url));
  }, []);

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

  return (
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

        {/* 주소 검색은 아직 없다. 서버가 기본값("등록 대기중")으로 저장한다. */}
        <TextField label="주소" value={PLACE_ADDRESS_PENDING} hint="주소 검색은 준비 중이에요." disabled readOnly />
      </Panel>
      <Button type="submit" size="lg" loading={submitting} disabled={!isValid || submitting} className={page.fullWidth}>
        {place ? "수정하기" : "등록하기"}
      </Button>
    </form>
  );
};
