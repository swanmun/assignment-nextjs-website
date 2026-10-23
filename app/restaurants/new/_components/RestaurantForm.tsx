"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/button/Button";
import { Empty } from "@/components/empty/Empty";
import { FileItem, type FileItemStatus } from "@/components/file-uploader/FileItem";
import { FileUploader } from "@/components/file-uploader/FileUploader";
import { Icon } from "@/components/icon/Icon";
import { MapPreview } from "@/components/map/MapPreview";
import { TextArea } from "@/components/text-area/TextArea";
import { TextField } from "@/components/text-field/TextField";
import { Toast } from "@/components/toast/Toast";
import { Panel } from "@/components/window/Window";
import page from "../../../_components/page.module.css";
import styles from "../new.module.css";

const MAX_FILES = 5;
const MAX_BYTES = 10 * 1024 * 1024;
const NAME_MAX = 50;
const CONTENT_MAX = 2000;

type Photo = {
  id: string;
  name: string;
  size: number;
  url?: string;
  status: FileItemStatus;
  progress: number;
};

type Field = "photos" | "name" | "content" | "address";

type FormState = {
  photos: Photo[];
  name: string;
  content: string;
  address: string;
  /** 주소 검색으로 위치를 지정한 주소 */
  located: string;
};

const EMPTY: FormState = { photos: [], name: "", content: "", address: "", located: "" };

/** design.pen "03 등록 - 입력 오류" 시안 상태 (?preview=error) */
const ERROR_PREVIEW: FormState = {
  photos: [
    { id: "p1", name: "IMG_2039.jpg", size: 2.4 * 1024 * 1024, url: "/images/thumb-8.png", status: "complete", progress: 100 },
    { id: "p2", name: "IMG_2040.jpg", size: 3.1 * 1024 * 1024, url: "/images/thumb-8.png", status: "complete", progress: 100 },
    { id: "p3", name: "IMG_2041.jpg", size: 12.4 * 1024 * 1024, url: "/images/thumb-8.png", status: "error", progress: 0 },
  ],
  name: "구로시장 할매 순대국",
  content: "",
  address: "",
  located: "",
};

const mb = (bytes: number) => `${(bytes / 1024 / 1024).toFixed(1)}MB`;

const validate = (form: FormState): Partial<Record<Field, string>> => {
  const errors: Partial<Record<Field, string>> = {};
  if (form.photos.some((photo) => photo.status === "error")) errors.photos = "1장당 10MB까지 올릴 수 있어요";
  else if (!form.photos.some((photo) => photo.status === "complete")) errors.photos = "사진을 1장 이상 올려 주세요";
  if (form.name.trim().length < 2) errors.name = "2자 이상 입력해 주세요.";
  if (!form.content.trim()) errors.content = "추천 내용을 입력해 주세요.";
  if (!form.located || form.located !== form.address.trim()) errors.address = "주소 검색으로 위치를 지정해 주세요.";
  return errors;
};

export const RestaurantForm = ({ preview }: { preview?: "error" }) => {
  const router = useRouter();
  const initial = preview === "error" ? ERROR_PREVIEW : EMPTY;
  const [form, setForm] = useState<FormState>(initial);
  const [touched, setTouched] = useState<Set<Field>>(
    () => new Set(preview === "error" ? (["photos", "name", "content", "address"] as Field[]) : []),
  );
  const [toastDismissed, setToastDismissed] = useState(false);
  const timers = useRef<ReturnType<typeof setInterval>[]>([]);

  useEffect(() => () => timers.current.forEach(clearInterval), []);

  const errors = validate(form);
  const visibleErrors = (Object.keys(errors) as Field[]).filter((field) => touched.has(field));
  const isValid = Object.keys(errors).length === 0;
  const touch = (field: Field) => setTouched((prev) => new Set(prev).add(field));
  const update = (patch: Partial<FormState>) => setForm((prev) => ({ ...prev, ...patch }));
  const errorFor = (field: Field) => (touched.has(field) ? errors[field] : undefined);

  const addFiles = (files: File[]) => {
    touch("photos");
    setToastDismissed(false);
    const room = MAX_FILES - form.photos.length;
    const added: Photo[] = files.slice(0, room).map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
      name: file.name,
      size: file.size,
      url: URL.createObjectURL(file),
      status: file.size > MAX_BYTES ? "error" : "uploading",
      progress: 0,
    }));
    update({ photos: [...form.photos, ...added] });

    // 업로드 API 연동 전까지 진행률만 흉내 낸다.
    for (const photo of added.filter((p) => p.status === "uploading")) {
      const timer = setInterval(() => {
        setForm((prev) => ({
          ...prev,
          photos: prev.photos.map((p) => {
            if (p.id !== photo.id) return p;
            const progress = Math.min(100, p.progress + 20);
            if (progress === 100) clearInterval(timer);
            return { ...p, progress, status: progress === 100 ? "complete" : "uploading" };
          }),
        }));
      }, 250);
      timers.current.push(timer);
    }
  };

  const removePhoto = (id: string) => update({ photos: form.photos.filter((photo) => photo.id !== id) });

  const searchAddress = () => {
    touch("address");
    setToastDismissed(false);
    const address = form.address.trim();
    if (address) update({ located: address });
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setTouched(new Set(["photos", "name", "content", "address"]));
    setToastDismissed(false);
    if (isValid) router.push("/me");
  };

  const photoMeta = (photo: Photo) => {
    if (photo.status === "error") return `${mb(photo.size)} · 용량 초과`;
    if (photo.status === "uploading") return `${mb(photo.size)} · 업로드 중 ${photo.progress}%`;
    return `${mb(photo.size)} · 업로드 완료`;
  };

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      {visibleErrors.length > 0 && !toastDismissed && (
        <Toast type="error" onClose={() => setToastDismissed(true)} className={styles.toast}>
          확인할 항목이 {visibleErrors.length}개 있어요. 빨간색으로 표시된 칸을 채우면 등록 버튼이 켜져요.
        </Toast>
      )}
      <Panel>
        <section className={styles.photoSection} aria-label="사진">
          <div className={styles.labelRow}>
            <span className="typo-label-lg">사진</span>
            <span className={`${styles.counter} typo-label-md`}>
              {form.photos.filter((photo) => photo.status !== "error").length}/{MAX_FILES}
            </span>
          </div>
          <FileUploader
            hint="JPG · PNG, 1장당 10MB · 최대 5장"
            accept="image/png,image/jpeg"
            error={errorFor("photos")}
            disabled={form.photos.length >= MAX_FILES}
            onFilesSelected={addFiles}
          >
            {form.photos.length > 0 &&
              form.photos.map((photo) => (
                <FileItem
                  key={photo.id}
                  name={photo.name}
                  meta={photoMeta(photo)}
                  status={photo.status}
                  progress={photo.progress}
                  thumbnailUrl={photo.url}
                  onRemove={() => removePhoto(photo.id)}
                />
              ))}
          </FileUploader>
        </section>

        <TextField
          label="맛집 이름 *"
          name="name"
          value={form.name}
          maxLength={NAME_MAX}
          placeholder="예) 구로시장 할매 순대국"
          hint={`${form.name.length}/${NAME_MAX}자`}
          error={errorFor("name")}
          rightAdornment={!errors.name ? <Icon name="check" size={20} className={styles.success} aria-label="입력 완료" /> : undefined}
          onChange={(event) => update({ name: event.target.value })}
          onBlur={() => touch("name")}
        />

        <TextArea
          label="추천 내용 *"
          name="content"
          value={form.content}
          maxLength={CONTENT_MAX}
          placeholder="추천 이유, 메뉴, 분위기, 주차 정보를 자유롭게 적어 주세요."
          error={errorFor("content")}
          onChange={(event) => update({ content: event.target.value })}
          onBlur={() => touch("content")}
        />

        <section className={styles.addressSection} aria-label="주소">
          <div className={styles.addressRow}>
            <TextField
              label="주소 *"
              name="address"
              value={form.address}
              placeholder="도로명, 건물명, 지번"
              error={errorFor("address")}
              className={styles.addressField}
              onChange={(event) => update({ address: event.target.value })}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  searchAddress();
                }
              }}
            />
            <Button variant="secondary" leftIcon="search" className={styles.searchButton} onClick={searchAddress}>
              검색
            </Button>
          </div>
          {form.located && form.located === form.address.trim() ? (
            <MapPreview label={form.name.trim() || "선택한 위치"} roadLabel={form.located.split(" ")[2]} />
          ) : (
            <div className={styles.mapEmpty}>
              <Empty visual="search" title="지도에 표시할 위치가 없어요" description="주소를 검색하면 핀이 표시돼요." />
            </div>
          )}
        </section>
      </Panel>
      <Button type="submit" size="lg" disabled={!isValid} className={page.fullWidth}>
        등록하기
      </Button>
    </form>
  );
};
