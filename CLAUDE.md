# UI 작업 규칙

- Storybook(`stories/`)이 디자인 SSOT다.
- UI는 Storybook에 있는 컴포넌트(`components/`)를 재사용해 만든다.
- 색·타이포·간격·이펙트는 토큰(`styles/tokens.css`, `styles/typography.css`, `styles/effects.css`)만 쓴다. 값을 하드코딩하지 않는다.
- 아이콘은 `components/icon/Icon`을 쓴다.
- Storybook에 없는 UI가 필요하면 먼저 컴포넌트와 스토리를 추가한 뒤 사용한다.
- 컴포넌트를 수정하면 해당 스토리도 함께 수정한다.
