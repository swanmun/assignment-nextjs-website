import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  // proxy 요청 본문 버퍼 한도는 기본값(10MB)을 쓴다. 사진은 브라우저에서 줄여 보내므로 요청 하나가 4MB를 넘지 않는다.
};

export default nextConfig;
