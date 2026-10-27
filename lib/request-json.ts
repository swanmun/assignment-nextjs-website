/** 브라우저에서 BFF를 호출한다. 실패하면 서버가 준 안내 문구로 에러를 던진다. */
export const requestJson = async <T>(input: string, init: RequestInit, fallback: string): Promise<T> => {
  const response = await fetch(input, init);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.message ?? fallback);
  return body as T;
};
