-- 맛집 위치: 장소 검색(네이버 지역 검색)으로 고른 지번 주소와 좌표(WGS84).
-- 장소를 고르지 않고 이름만 직접 입력하면 address는 기본값("등록 대기중"), 나머지는 null로 둔다.
alter table public.place
  add column if not exists jibun_address text,
  add column if not exists latitude double precision,
  add column if not exists longitude double precision;

-- 좌표는 둘 다 있거나 둘 다 없다. (다시 실행해도 되도록 지우고 만든다)
alter table public.place drop constraint if exists place_location_pair;
alter table public.place
  add constraint place_location_pair check ((latitude is null) = (longitude is null));
