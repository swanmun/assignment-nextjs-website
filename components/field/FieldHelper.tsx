import { Icon } from "@/components/icon/Icon";
import styles from "./Field.module.css";

type FieldHelperProps = {
  id: string;
  /** 에러 메시지. 있으면 힌트를 대체하고 에러 아이콘을 붙인다. */
  error?: string;
  hint?: string;
};

/** 입력 박스 아래 헬퍼텍스트(label-md). 에러가 있으면 힌트 대신 에러를 보여준다. */
export const FieldHelper = ({ id, error, hint }: FieldHelperProps) => {
  if (!error && !hint) return null;
  return (
    <p id={id} className={`${styles.helper} typo-label-md`}>
      {error && <Icon name="error" size={16} />}
      {error || hint}
    </p>
  );
};
