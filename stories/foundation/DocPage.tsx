import type { ReactNode } from "react";
import styles from "./foundation.module.css";

type DocPageProps = {
  /** 상단 경로 표기 */
  eyebrow?: string;
  title: string;
  description: ReactNode;
  children: ReactNode;
};

export const DocPage = ({ eyebrow = "DESIGN SYSTEM / FOUNDATION", title, description, children }: DocPageProps) => (
  <div className={styles.page}>
    <header className={styles.header}>
      <span className={styles.eyebrow}>{eyebrow}</span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
    {children}
  </div>
);

export const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className={styles.section}>
    <h2 className={styles.sectionTitle}>{title}</h2>
    {children}
  </section>
);
