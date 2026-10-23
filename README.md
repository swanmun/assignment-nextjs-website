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
| 상세 | `/restaurants/[id]` | `/restaurants/oryu-kalguksu` |
| 등록 | `/restaurants/new` | `?preview=error` (입력 오류) |
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

## 아직 구현하지 않은 것

백엔드 없이 화면만 구현한 상태라, 아래 기능은 목업으로 동작합니다.

- 맛집 데이터 (5건 고정), 구글 로그인, 사진 업로드, 주소 검색, 글 삭제
- 지도는 실제 지도 대신 일러스트로 보여 줍니다.
