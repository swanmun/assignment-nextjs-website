-- 상품 이미지를 화면 크기별 2장으로 나눈다. lg: 데스크톱(1024px 이상), md: 모바일·태블릿.
-- 컬럼에는 product-image 버킷 안 파일 경로(<uuidv4>.<ext>)만 저장하고, 공개 URL은 서버에서 SUPABASE_STORAGE_URL과 합친다.
alter table public."Product" rename column image_path_main to image_path_main_lg;
alter table public."Product" rename column image_path_detail to image_path_detail_lg;

alter table public."Product" add column image_path_main_md text;
alter table public."Product" add column image_path_detail_md text;

-- 기존 행은 md가 없으므로 lg로 채워 둔다. (실제 md 파일 경로는 데이터로 따로 넣는다)
update public."Product"
  set image_path_main_md = image_path_main_lg,
      image_path_detail_md = image_path_detail_lg;

alter table public."Product" alter column image_path_main_md set not null;
alter table public."Product" alter column image_path_detail_md set not null;

-- 상품 조회 RLS: 공개(Public) 상품만 누구나 읽는다. 등록·수정은 대시보드(관리자)에서만 한다.
create policy product_select_public on public."Product"
  for select to anon, authenticated
  using (status = 'Public');

create index if not exists product_event_at_idx on public."Product" (event_at) where status = 'Public';
