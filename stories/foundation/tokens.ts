import tokensCss from "@/styles/tokens.css?raw";

export type Token = {
  name: string;
  value: string;
  /** Semantic 토큰이 참조하는 Primitive 토큰 이름 */
  ref?: string;
};

export const tokens: Token[] = [...tokensCss.matchAll(/--([\w-]+):\s*([^;]+);/g)].map(
  ([, name, value]) => ({
    name,
    value: value.trim(),
    ref: value.trim().match(/^var\(--([\w-]+)\)$/)?.[1],
  }),
);

const tokenMap = new Map(tokens.map((t) => [t.name, t]));

export const byPrefix = (prefix: string) => tokens.filter((t) => t.name.startsWith(prefix));

/** 참조 체인을 따라가 최종 값을 돌려준다. */
export const resolve = (name: string): string => {
  let token = tokenMap.get(name);
  while (token?.ref) token = tokenMap.get(token.ref);
  return token?.value ?? "";
};

export const COLOR_SCALES = ["brand", "neutral", "amber", "green", "sky", "red"] as const;
export const COLOR_STEPS = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;

const luminance = (hex: string) => {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG 2.x 명도 대비 */
export const contrast = (a: string, b: string) => {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
