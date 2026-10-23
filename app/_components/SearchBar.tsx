import { Button } from "@/components/button/Button";
import { TextField } from "@/components/text-field/TextField";
import styles from "./SearchBar.module.css";

/** 메인 상단 검색줄 — GET /?q= 로 제출한다. */
export const SearchBar = ({ defaultValue }: { defaultValue?: string }) => (
  <div className={styles.bar}>
    <form action="/" role="search" className={styles.form}>
      <TextField
        label="맛집 검색"
        hideLabel
        name="q"
        type="text"
        leftIcon="search"
        placeholder="맛집 이름, 주소, 메뉴 검색"
        defaultValue={defaultValue}
        className={styles.field}
      />
      <Button type="submit" variant="secondary">
        찾기
      </Button>
    </form>
  </div>
);
