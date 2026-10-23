import { Fragment, type CSSProperties, type ReactNode } from "react";
import { DocPage } from "../foundation/DocPage";
import styles from "./kit.module.css";

export { styles as kit };

export const ComponentPage = ({ title, description, children }: { title: string; description: ReactNode; children: ReactNode }) => (
  <DocPage eyebrow="DESIGN SYSTEM / COMPONENT" title={title} description={description}>
    {children}
  </DocPage>
);

/** 타입·옵션 단위 블록: 제목(heading-md) + 사용처(body-md) */
export const Block = ({ title, usage, children }: { title: string; usage?: ReactNode; children: ReactNode }) => (
  <section className={styles.block}>
    <header className={styles.blockHeader}>
      <h2 className="typo-heading-md">{title}</h2>
      {usage && <p className={`${styles.usage} typo-body-md`}>{usage}</p>}
    </header>
    {children}
  </section>
);

export const Caption = ({ children }: { children: ReactNode }) => (
  <span className={`${styles.caption} typo-label-md`}>{children}</span>
);

export type MatrixRow = {
  label: string;
  spec?: string;
  cells: ReactNode[];
};

/** 타입(행) × 상태(열) 매트릭스. rowHeader를 비우면 행 이름 열 없이 상태 열만 그린다. */
export const Matrix = ({
  columns,
  rows,
  rowHeader = "SIZE",
  align = "center",
}: {
  columns: string[];
  rows: MatrixRow[];
  rowHeader?: string;
  /** 셀 세로 정렬. 높이가 제각각인 셀은 start로 위를 맞춘다. */
  align?: "center" | "start";
}) => (
  <div className={styles.matrix} style={{ "--cols": columns.length, alignItems: align } as CSSProperties}>
    <span className={styles.matrixHead}>
      <Caption>{rowHeader}</Caption>
    </span>
    {columns.map((column) => (
      <span key={column} className={styles.matrixHead}>
        <Caption>{column.toUpperCase()}</Caption>
      </span>
    ))}
    {rows.map((row) => (
      <Fragment key={row.label}>
        <div className={styles.matrixRowMeta}>
          <span className="typo-label-lg">{row.label}</span>
          {row.spec && <Caption>{row.spec}</Caption>}
        </div>
        {row.cells.map((cell, index) => (
          <div key={index} className={styles.matrixCell}>
            {cell}
          </div>
        ))}
      </Fragment>
    ))}
  </div>
);

/** 캡션이 붙은 옵션 하나 */
export const Option = ({ caption, width, children }: { caption: string; width?: number; children: ReactNode }) => (
  <div className={styles.option} style={{ width }}>
    {children}
    <Caption>{caption}</Caption>
  </div>
);

/** 360×560 모바일 목업 */
export const Phone = ({ children }: { children: ReactNode }) => <div className={styles.phone}>{children}</div>;
