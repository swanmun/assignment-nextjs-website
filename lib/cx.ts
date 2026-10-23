/** falsy 값을 걸러내고 className을 이어 붙인다. */
export const cx = (...names: (string | false | null | undefined)[]) => names.filter(Boolean).join(" ");
