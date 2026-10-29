# 숨은맛집.EXE

서울 구로 주변에 사는, 차가 있는 가족과 커플을 위한 **숨은 맛집 커뮤니티** 웹사이트입니다.
광고 없이 이웃이 직접 다녀온 "주말에 차 타고 가볼 만한 곳"을 사진·주소·지도와 함께 올리고 둘러봅니다.

윈도우 95 느낌의 레트로 UI(입체 테두리, 창 제목 표시줄, 디더링 이미지)를 콘셉트로 했습니다.

> 교육 과정 과제로 만든 프로젝트입니다. Pencil로 만든 디자인 시스템과 하이파이 시안을 Storybook과 Next.js로 옮기는(핸드오프) 과정을 다룹니다.

## 진행 과정

1. **디자인 시스템 핸드오프 (Pencil → Storybook)**
   - 파운데이션: 디자인 토큰 → 컬러 → 타이포그래피 → 아이코노그래피
   - UI 컴포넌트: Action, Form, Navigation, Feedback, Etc
2. **페이지 핸드오프 (Pencil → Next.js)**
   - 모바일 시안 5장을 Storybook 컴포넌트만 조합해 구현
   - 태블릿·데스크톱까지 반응형으로 확장

## 페이지

| 페이지 | 경로 | 시안 상태 확인 |
|---|---|---|
| 메인 | `/` | `/?q=칼국수` (검색) |
| 상세 | `/restaurants/[id]` | 위치가 있으면 미니 지도 · 지도 칸에 실제 지도 |
| 등록 | `/restaurants/new` | `?preview=error` (입력 오류) |
| 장소 등록 | 등록 화면 위 전체 화면 (`장소 입력하기`) | `/restaurants/new?preview=place-results` (검색 결과) · `place-empty` (결과 없음 · 직접 입력) · `place-location` (위치 지정) |
| 로그인 | `/login` | `?error=cancelled` (로그인 실패) |
| 마이 | `/me` | `?empty=1` (쓴 글 없음) |

### 반응형

- 카드 목록은 화면 너비에 따라 1열 → 2열 → 3열 → 4열로 늘어나고, 최대 1280px을 넘으면 좌우 여백으로 처리합니다.
- 상세·등록·로그인 페이지는 640px 너비로 가운데 정렬합니다.
- 상단 바·검색줄·히어로는 바탕을 화면 전체에 깔고, 내용만 레이아웃 너비 안에 정렬합니다.
- 히어로와 상세 사진은 768px 이상에서 가로로 긴 이미지로 바뀝니다.

## 기술 스택

- Next.js 16 (App Router), React 19, TypeScript
- CSS Modules + CSS 변수 디자인 토큰
- Storybook 10 (`@storybook/nextjs-vite`)
- 아이콘: Lucide, Phosphor(하단 내비게이션)
- 폰트: Pretendard

## 실행 방법

```bash
npm install

# 웹사이트 (http://localhost:3000)
npm run dev

# Storybook (http://localhost:6006)
npm run storybook

# 프로덕션 빌드
npm run build && npm start
```

## 폴더 구조

```
app/            페이지 (메인, 상세, 등록, 로그인, 마이)
components/     디자인 시스템 UI 컴포넌트
stories/
  foundation/   토큰 · 컬러 · 타이포그래피 · 아이코노그래피 문서
  components/   컴포넌트 스토리 (Action, Form, Navigation, Feedback, Etc)
styles/         토큰(tokens.css) · 타이포그래피 · 이펙트
lib/            목업 데이터, 유틸
public/images/  Pencil에서 내보낸 디더링 이미지
```

## 디자인 시스템 규칙

Storybook을 디자인의 기준(SSOT)으로 둡니다. 자세한 규칙은 [`CLAUDE.md`](./CLAUDE.md)에 있습니다.

- 페이지는 `components/`의 컴포넌트를 조합해 만듭니다.
- 색·타이포·간격·이펙트는 토큰만 쓰고 값을 하드코딩하지 않습니다.
- Storybook에 없는 UI가 필요하면 컴포넌트와 스토리를 먼저 추가합니다.

## 장소 검색 · 지도

- 장소 등록 흐름: `장소 입력하기` → 장소 화면(검색창 · 지도 · 지번 주소) → 검색창을 누르면 검색 화면 → 결과를 고르면 장소 화면으로 돌아와 검색어는 검색창에, 지번 주소는 주소 칸에 넣고 지도 가운데를 고른 장소로 옮깁니다. 결과가 없으면 장소명을 직접 입력하고, 돌아와도 지번 주소·좌표는 기본값(등록 대기중 · 서울시청)을 그대로 둡니다.
- 장소 검색: NCP API Hub 지역 검색(`naverapihub.apigw.ntruss.com/search/v1/local`)을 BFF(`GET /api/places/search?q=`)로 부릅니다. 결과는 최대 5곳이고, `mapx`·`mapy`(WGS84 × 10^7)는 lng·lat으로 바꿔 씁니다.
- 지도: 네이버 클라우드 플랫폼 Static Map을 BFF(`GET /api/map?lat=&lng=&w=&h=`)로 받아 이미지로 보여 줍니다. 키가 없거나 불러오지 못하면 일러스트 지도로 대신합니다.
- 위치 지정: 장소 화면에 네이버 지도 JavaScript API v3(Dynamic Map)를 띄웁니다. 핀은 지도 가운데에 고정되고, 지도를 움직여 위치를 고칩니다(기본 위치 서울시청). `이 위치로 등록하기`를 누르면 핀 좌표가 저장되고 주소는 검색된 주소를 그대로 씁니다. 직접 입력한 장소는 주소 없이 등록됩니다(나중에 리버스 지오코딩으로 지도에서 고르게 할 예정).
- 키는 서버 전용 환경변수(`NAVER_SEARCH_CLIENT_ID`, `NAVER_SEARCH_CLIENT_SECRET`, `NCP_MAP_KEY_ID`, `NCP_MAP_KEY`)에 둡니다. 브라우저 SDK가 쓰는 지도 Client ID만 `NEXT_PUBLIC_NCP_MAP_KEY_ID`로 둡니다(공개 값, NCP 콘솔의 Web 서비스 URL 등록으로 제한). `.env.example`을 참고하세요.
- 검색 결과가 없으면 장소명만 직접 입력해 주소 없이 등록할 수 있습니다.
- 위치(지번 주소·좌표) 컬럼은 `supabase/migrations/20261029000000_place_location.sql`로 추가합니다.
