import { Icon } from "@/components/icon/Icon";
import { Spinner } from "@/components/spinner/Spinner";
import { cx } from "@/lib/cx";
import styles from "./FileUploader.module.css";

export const FILE_ITEM_STATUSES = ["uploading", "complete", "error"] as const;
export type FileItemStatus = (typeof FILE_ITEM_STATUSES)[number];

export type FileItemProps = {
  name: string;
  /** 용량·진행 상황 등 보조 정보 (예: "2.4MB · 업로드 완료") */
  meta?: string;
  status: FileItemStatus;
  /** uploading 상태의 진행률(0~100) */
  progress?: number;
  thumbnailUrl?: string;
  onRemove?: () => void;
  removeDisabled?: boolean;
  className?: string;
};

export const FileItem = ({
  name,
  meta,
  status,
  progress = 0,
  thumbnailUrl,
  onRemove,
  removeDisabled,
  className,
}: FileItemProps) => (
  <li className={cx(styles.item, status === "error" && styles.itemError, className)}>
    {/* eslint-disable-next-line @next/next/no-img-element -- 업로드 미리보기는 blob URL이라 next/image를 쓰지 않는다 */}
    {thumbnailUrl ? <img src={thumbnailUrl} alt="" className={styles.thumbnail} /> : <span className={styles.thumbnail} />}
    <div className={styles.info}>
      <span className={`${styles.name} typo-body-md`}>{name}</span>
      {meta && <span className={`${styles.meta} typo-label-md`}>{meta}</span>}
      {status === "uploading" && (
        <div
          className={styles.progress}
          role="progressbar"
          aria-label={`${name} 업로드 진행률`}
          aria-valuenow={progress}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className={styles.progressBar} style={{ width: `${progress}%` }} />
        </div>
      )}
    </div>
    <span className={styles.status}>
      {status === "uploading" && <Spinner size={20} label="업로드 중" />}
      {status === "complete" && <Icon name="check" size={20} className={styles.complete} aria-label="업로드 완료" />}
      {status === "error" && <Icon name="error" size={20} className={styles.statusError} aria-label="업로드 실패" />}
    </span>
    {onRemove && (
      <button type="button" className={styles.remove} onClick={onRemove} disabled={removeDisabled} aria-label={`${name} 삭제`}>
        <Icon name="close" size={16} />
      </button>
    )}
  </li>
);
