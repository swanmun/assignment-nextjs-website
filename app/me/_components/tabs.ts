/** 마이 페이지 탭. 값은 주소의 ?tab= 으로도 쓴다(내가 쓴 글은 기본이라 생략). */
export const MY_TABS = [
  { value: "posts", label: "내가 쓴 글" },
  { value: "payments", label: "결제 내역" },
  { value: "cancellations", label: "취소 내역" },
] as const;

export type MyTab = (typeof MY_TABS)[number]["value"];

export const toMyTab = (value: string | undefined): MyTab =>
  MY_TABS.find((tab) => tab.value === value)?.value ?? "posts";
