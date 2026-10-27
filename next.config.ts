import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  experimental: {
    // proxy가 요청 본문을 버퍼링하는 한도(기본 10MB). 맛집 사진 최대 5장 × 10MB + 글 내용
    proxyClientMaxBodySize: "55mb",
  },
};

export default nextConfig;
