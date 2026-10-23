import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Icon, ICON_NAMES, ICON_SIZES, type IconName } from "@/components/icon/Icon";
import { DocPage } from "./DocPage";
import styles from "./foundation.module.css";

const ROWS_PER_COLUMN = 20;

/** 가이드 이름과 Lucide 실제 이름이 다른 아이콘 (design.pen 기준) */
const LUCIDE_ALIAS: Partial<Record<IconName, string>> = {
  home: "house",
  refresh: "refresh-cw",
  logout: "log-out",
  close: "x",
  filter: "funnel",
  sort: "arrow-up-down",
  edit: "pencil",
  delete: "trash-2",
  "more-horizontal": "ellipsis",
  "more-vertical": "ellipsis-vertical",
  warning: "triangle-alert",
  error: "circle-alert",
  notification: "bell",
  comment: "message-circle",
};

const meta = {
  title: "Foundation/Iconography",
  component: Icon,
  parameters: { layout: "fullscreen" },
  argTypes: {
    name: { control: "select", options: ICON_NAMES },
    size: { control: "inline-radio", options: ICON_SIZES },
    color: { control: "color" },
  },
} satisfies Meta<typeof Icon>;

export default meta;
type Story = StoryObj<typeof meta>;

const IconColumn = ({ names, offset }: { names: IconName[]; offset: number }) => (
  <table className={`${styles.table} ${styles.iconTable}`}>
    <thead>
      <tr>
        <th className={styles.mono}>#  NAME</th>
        {ICON_SIZES.map((s) => (
          <th key={s} className={styles.mono}>
            {s}px
          </th>
        ))}
      </tr>
    </thead>
    <tbody>
      {names.map((name, i) => {
        const lucide = LUCIDE_ALIAS[name];
        return (
          <tr key={name}>
            <td>
              <span className={`${styles.mono} ${styles.muted}`}>{String(offset + i + 1).padStart(2, "0")}</span>{" "}
              <span className={styles.mono} style={{ fontSize: 14, fontWeight: 700 }}>
                {name}
              </span>{" "}
              {lucide && <span className={`${styles.mono} ${styles.muted}`}>({lucide})</span>}
            </td>
            {ICON_SIZES.map((s) => (
              <td key={s}>
                <Icon name={name} size={s} />
              </td>
            ))}
          </tr>
        );
      })}
    </tbody>
  </table>
);

export const AllIcons: Story = {
  args: { name: "home" },
  parameters: { controls: { disable: true } },
  render: () => (
    <DocPage
      title="Iconography — Lucide Icons"
      description={`Lucide 아이콘 ${ICON_NAMES.length}종 × ${ICON_SIZES.length}사이즈(${ICON_SIZES.join(" · ")}). 1열에 ${ROWS_PER_COLUMN}행을 채운 뒤 오른쪽 열로 이어집니다. 가이드 이름과 Lucide 실제 이름이 다르면 괄호로 표기합니다.`}
    >
      <div className={styles.iconColumns}>
        <IconColumn names={ICON_NAMES.slice(0, ROWS_PER_COLUMN)} offset={0} />
        <IconColumn names={ICON_NAMES.slice(ROWS_PER_COLUMN)} offset={ROWS_PER_COLUMN} />
      </div>
    </DocPage>
  ),
};

export const Playground: Story = {
  args: { name: "heart", size: 32, color: "var(--color-text-default)" },
  parameters: { layout: "centered" },
};
