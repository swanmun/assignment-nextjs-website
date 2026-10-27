-- 맛집 글·사진 RLS. BFF는 사용자 세션(쿠키)으로 호출하므로 auth.uid()가 작성자다.

-- place: 누구나 삭제되지 않은 글을 읽는다. 작성자는 소프트삭제한 자기 글도 읽을 수 있다(소프트삭제 UPDATE 직후 행 확인용).
create policy place_select_visible on public.place
  for select to anon, authenticated
  using (deleted_at is null or (select auth.uid()) = user_id);

create policy place_insert_own on public.place
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- 수정·소프트삭제(deleted_at 채우기)는 작성자만
create policy place_update_own on public.place
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- 등록 중 사진 저장이 실패했을 때 방금 만든 글을 되돌리는 용도
create policy place_delete_own on public.place
  for delete to authenticated
  using ((select auth.uid()) = user_id);

-- place_image: 읽을 수 있는 글(place RLS 통과)의 사진만 읽는다.
create policy place_image_select_visible on public.place_image
  for select to anon, authenticated
  using (exists (select 1 from public.place p where p.id = place_id));

create policy place_image_insert_own on public.place_image
  for insert to authenticated
  with check (exists (select 1 from public.place p where p.id = place_id and p.user_id = (select auth.uid())));

create policy place_image_delete_own on public.place_image
  for delete to authenticated
  using (exists (select 1 from public.place p where p.id = place_id and p.user_id = (select auth.uid())));

-- 목록(최신순, 삭제 제외)·사진 조인용 인덱스
create index if not exists place_created_at_idx on public.place (created_at desc, id desc) where deleted_at is null;
create index if not exists place_user_id_idx on public.place (user_id);
create index if not exists place_image_place_id_idx on public.place_image (place_id);

-- place-image 버킷: 공개 읽기, 업로드·삭제는 올린 본인만. 크기·형식은 lib/place-rules.ts와 같게 제한한다.
update storage.buckets
  set file_size_limit = 10485760, allowed_mime_types = array['image/png', 'image/jpeg']
  where id = 'place-image';

create policy place_image_object_insert_own on storage.objects
  for insert to authenticated
  with check (bucket_id = 'place-image' and owner_id = (select auth.uid())::text);

create policy place_image_object_select_own on storage.objects
  for select to authenticated
  using (bucket_id = 'place-image' and owner_id = (select auth.uid())::text);

create policy place_image_object_delete_own on storage.objects
  for delete to authenticated
  using (bucket_id = 'place-image' and owner_id = (select auth.uid())::text);
