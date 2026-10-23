import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import type { ReactNode } from "react";
import { DocPage, Section } from "./DocPage";
import styles from "./foundation.module.css";
import { byPrefix, resolve, type Token } from "./tokens";

const meta = {
  title: "Foundation/Design Tokens",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

const semanticPrefixes = ["color-text-", "color-background-", "color-border-"];
const isSemantic = (t: Token) => semanticPrefixes.some((p) => t.name.startsWith(p));

const TokenTable = ({ items, preview }: { items: Token[]; preview?: (t: Token) => ReactNode }) => (
  <table className={styles.table}>
    <thead>
      <tr>
        {preview && <th style={{ width: 64 }} />}
        <th>CSS Variable</th>
        <th>Value</th>
        <th>Resolved</th>
      </tr>
    </thead>
    <tbody>
      {items.map((t) => (
        <tr key={t.name}>
          {preview && <td>{preview(t)}</td>}
          <td className={styles.mono}>--{t.name}</td>
          <td className={styles.mono}>{t.ref ? `→ ${t.ref}` : t.value}</td>
          <td className={`${styles.mono} ${styles.muted}`}>{resolve(t.name)}</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const colorChip = (t: Token) => <span className={styles.chip} style={{ background: `var(--${t.name})` }} />;

export const AllTokens: Story = {
  render: () => {
    const colors = byPrefix("color-");
    return (
      <DocPage
        title="Design Tokens"
        description={
          <>
            design.pen의 variables를 <code>styles/tokens.css</code>의 CSS 변수로 옮겼습니다. Primitive 토큰만 실제 값을
            가지며, Semantic 토큰은 Primitive 토큰을 <code>var()</code>로 참조합니다.
          </>
        }
      >
        <Section title={`Color · Primitive (${colors.filter((t) => !isSemantic(t)).length})`}>
          <TokenTable items={colors.filter((t) => !isSemantic(t))} preview={colorChip} />
        </Section>
        <Section title={`Color · Semantic (${colors.filter(isSemantic).length})`}>
          <TokenTable items={colors.filter(isSemantic)} preview={colorChip} />
        </Section>
        <Section title="Typography">
          <TokenTable items={byPrefix("font-")} />
        </Section>
        <Section title="Spacing">
          <TokenTable
            items={byPrefix("spacing-")}
            preview={(t) => <div className={styles.spacingBar} style={{ width: `var(--${t.name})` }} />}
          />
        </Section>
      </DocPage>
    );
  },
};
