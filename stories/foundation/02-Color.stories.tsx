import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { DocPage, Section } from "./DocPage";
import styles from "./foundation.module.css";
import { byPrefix, COLOR_SCALES, COLOR_STEPS, contrast, resolve } from "./tokens";

const meta = {
  title: "Foundation/Color",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const SCALE_LABEL: Record<(typeof COLOR_SCALES)[number], string> = {
  brand: "Brand · 브랜드",
  neutral: "Neutral · 뉴트럴",
  amber: "Amber · 경고",
  green: "Green · 성공",
  sky: "Sky · 정보",
  red: "Red · 에러",
};

const BASE = resolve("color-neutral-50");

export const PrimitivePalette: Story = {
  render: () => (
    <DocPage
      title="Color — Primitive Tokens"
      description="6개 팔레트 × 11단계. 칸 안의 숫자는 color-neutral-50 배경 대비 명도 대비이며, AA(4.5:1 이상)와 AA Large(3:1 이상)를 표시합니다."
    >
      {COLOR_SCALES.map((scale) => (
        <div key={scale} className={styles.paletteRow}>
          <div className={styles.paletteName}>
            {SCALE_LABEL[scale]}
            <span className={`${styles.mono} ${styles.muted}`}>color-{scale}-*</span>
          </div>
          {COLOR_STEPS.map((step) => {
            const name = `color-${scale}-${step}`;
            const hex = resolve(name);
            const ratio = contrast(hex, BASE);
            const onColor = ratio >= 3 ? "var(--color-neutral-50)" : "var(--color-neutral-900)";
            return (
              <div key={step} className={styles.swatch}>
                <div className={styles.swatchBox} style={{ background: `var(--${name})`, color: onColor }}>
                  <span>{ratio.toFixed(2)}</span>
                  {ratio >= 4.5 ? (
                    <span className={styles.badge}>AA</span>
                  ) : ratio >= 3 ? (
                    <span className={styles.badge}>AA Large</span>
                  ) : null}
                </div>
                <span className={styles.mono}>{step}</span>
                <span className={`${styles.mono} ${styles.muted}`}>{hex.toUpperCase()}</span>
              </div>
            );
          })}
        </div>
      ))}
    </DocPage>
  ),
};

const SEMANTIC_GROUPS = [
  { prefix: "color-text-", title: "Text" },
  { prefix: "color-background-", title: "Background" },
  { prefix: "color-border-", title: "Border" },
];

export const SemanticTokens: Story = {
  render: () => (
    <DocPage
      title="Color — Semantic Tokens"
      description="용도별 토큰입니다. hex를 직접 쓰지 않고 Primitive 토큰을 참조하므로, 팔레트 값이 바뀌면 함께 바뀝니다."
    >
      {SEMANTIC_GROUPS.map(({ prefix, title }) => {
        const items = byPrefix(prefix);
        return (
          <Section key={prefix} title={`${title} (${items.length})`}>
            <div className={styles.semanticGrid}>
              {items.map((t) => (
                <div key={t.name} className={styles.semanticItem}>
                  {prefix === "color-text-" ? (
                    <span
                      className={`${styles.chip} typo-heading-md`}
                      style={{
                        color: `var(--${t.name})`,
                        display: "grid",
                        placeItems: "center",
                        background:
                          contrast(resolve(t.name), BASE) < 3
                            ? "var(--color-background-inverse)"
                            : "var(--color-background-elevated)",
                      }}
                    >
                      가
                    </span>
                  ) : prefix === "color-border-" ? (
                    <span
                      className={styles.chip}
                      style={{
                        border: `3px solid var(--${t.name})`,
                        background:
                          contrast(resolve(t.name), BASE) < 1.5
                            ? "var(--color-background-inverse)"
                            : "var(--color-background-elevated)",
                      }}
                    />
                  ) : (
                    <span className={styles.chip} style={{ background: `var(--${t.name})` }} />
                  )}
                  <div>
                    <span className={styles.mono}>{t.name}</span>
                    <span className={`${styles.mono} ${styles.muted}`}>
                      → {t.ref} · {resolve(t.name).toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        );
      })}
    </DocPage>
  ),
};
