import type { ReactNode } from "react";
import { Button } from "@/components/button/Button";
import { Icon } from "@/components/icon/Icon";
import { Note } from "@/components/note/Note";
import styles from "./InstallBanner.module.css";

export type IosInstallGuideProps = {
  /** 홈 화면에 생길 앱 이름 */
  appName: string;
  /** 확인 버튼을 누르면 호출된다. */
  onConfirm: () => void;
};

const Step = ({ number, children }: { number: number; children: ReactNode }) => (
  <li className={styles.step}>
    <span className={`${styles.stepNumber} typo-label-lg`}>{number}</span>
    <span className={`${styles.stepText} typo-body-md`}>{children}</span>
  </li>
);

/** iOS 홈 화면 추가 방법 — 바텀시트 안에 넣는다. iOS는 설치 창을 띄우는 API가 없어 직접 안내한다. */
export const IosInstallGuide = ({ appName, onConfirm }: IosInstallGuideProps) => (
  <div className={styles.guide}>
    <ol className={styles.steps}>
      <Step number={1}>
        주소창 옆 <Icon name="share" size={16} className={styles.inlineIcon} aria-label="공유" /> 공유 버튼을 누르세요.
        <br />
        버튼이 없으면 <Icon name="more-horizontal" size={16} className={styles.inlineIcon} aria-label="더 보기" /> 버튼부터 누르세요.
      </Step>
      <Step number={2}>
        메뉴에서 <Icon name="plus" size={16} className={styles.inlineIcon} aria-label="추가" /> <strong>홈 화면에 추가</strong>를 고르세요.
      </Step>
      <Step number={3}>
        오른쪽 위 <strong>추가</strong>를 누르면 홈 화면에 {appName} 아이콘이 생겨요.
      </Step>
    </ol>
    <Note>카카오톡·네이버 앱 안이라면 Safari에서 열어 주세요.</Note>
    <Button variant="secondary" className={styles.confirm} onClick={onConfirm}>
      확인
    </Button>
  </div>
);
