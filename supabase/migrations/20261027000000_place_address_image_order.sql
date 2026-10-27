-- 맛집 주소: 주소 입력 기능 전까지 BFF는 주소를 보내지 않고 기본값으로 저장한다. (lib/place-rules.ts PLACE_ADDRESS_PENDING)
alter table public.place
  add column if not exists address text not null default '등록 대기중';

-- 맛집 사진 순서: 등록한 순서대로 보여 주고 첫 장을 대표 사진으로 쓴다.
alter table public.place_image
  add column if not exists sort_order smallint not null default 0;
