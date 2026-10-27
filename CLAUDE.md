# UI 작업 규칙

- Storybook(`stories/`)이 디자인 SSOT다.
- UI는 Storybook에 있는 컴포넌트(`components/`)를 재사용해 만든다.
- 색·타이포·간격·이펙트는 토큰(`styles/tokens.css`, `styles/typography.css`, `styles/effects.css`)만 쓴다. 값을 하드코딩하지 않는다.
- 아이콘은 `components/icon/Icon`을 쓴다.
- Storybook에 없는 UI가 필요하면 먼저 컴포넌트와 스토리를 추가한 뒤 사용한다.
- 컴포넌트를 수정하면 해당 스토리도 함께 수정한다.

# 반응형 레이아웃 규칙

- 모바일 시안을 기준으로 태블릿·데스크톱까지 대응한다.
- 브레이크포인트는 768px이다.
- 최대 너비는 `--layout-max-width`(1280px)이고, 넘는 영역은 좌우 여백으로 처리한다.
- 카드 목록은 `app/_components/page.module.css`의 `.cardGrid`를 쓴다(`--layout-card-min-width` 기준 1→4열 자동 확장).
- 상세·폼·로그인처럼 한 줄 읽기 화면은 `.narrow`(`--layout-content-width`, 640px) 가운데 정렬로 둔다.
- 페이지 본문은 `.body`(좌우 `--spacing-16`)로 감싼다.
- 상단 바·검색줄·히어로는 배경을 전체 너비로 깔고 내용만 최대 너비 안에 정렬한다.
- 768px 이상에서는 디더링 이미지를 와이드 버전으로 바꾼다.
- 레이아웃 너비 값을 하드코딩하지 않는다.

# Supabase 연동 규칙

- 모든 Supabase API 호출은 Next.js BFF(Route Handler `app/api/**/route.ts` 또는 Server Action)를 통해서만 한다.
- 클라이언트 컴포넌트에서 Supabase 클라이언트를 직접 생성하거나 호출하지 않는다. 클라이언트는 BFF 엔드포인트만 호출한다.
- Supabase 키·URL은 서버 전용 환경변수로 두고 `NEXT_PUBLIC_` 접두사를 붙이지 않는다.
- 인증(소셜 로그인 포함) 세션은 BFF에서 처리하고 쿠키로 관리한다.
- Supabase 클라이언트는 `lib/supabase/server.ts`의 `createSupabaseServerClient()`만 쓴다(`server-only`로 클라이언트 번들 유입 차단).
- 세션 갱신·로그인 필요 경로 리다이렉트는 `proxy.ts`가 맡는다.
- 소셜 로그인은 `POST /api/auth/signin` → 구글 → `GET /api/auth/callback`, 로그아웃은 `POST /api/auth/signout`이다. 클라이언트는 form POST로만 호출한다.
- 로그인 사용자·프로필은 서버에서 `lib/supabase/auth.ts`의 `getCurrentUser()`로 읽는다.
- 프로필 변경은 `PATCH /api/profile`(닉네임), `POST /api/profile/image`(사진)이다. 입력 규칙은 `lib/profile-rules.ts`를 클라이언트·BFF가 함께 쓴다.
- 이미지는 스토리지에 `<uuidv4>.<ext>`로 올리고 테이블에는 파일 경로만 저장한다. 공개 URL은 `SUPABASE_STORAGE_URL` + 버킷 + 경로로 서버에서 만든다(`lib/supabase/storage.ts`).
