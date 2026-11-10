-- 결제 웹훅 연동 (rules/payment.md)
-- 1) 결제 기록 쓰기는 서버 전용 secret key(service_role)로만 한다. 웹훅은 사용자 세션이 없다.
drop policy if exists payment_insert_own on public.payment;
drop policy if exists product_snapshot_insert_authenticated on public.product_snapshot;
revoke insert, update, delete, truncate on public.payment from authenticated;
revoke insert, update, delete, truncate on public.product_snapshot from authenticated;

-- 2) amount 부호: 결제 +, 취소 −. transaction_key별 합계 = 남은 결제 금액.
alter table public.payment
  add constraint payment_amount_sign_check
  check ((type = 'PAID' and amount > 0) or (type = 'CANCELLED' and amount < 0));

-- 3) insert-only 원장: secret key로도 수정·삭제하지 못하게 막는다.
create or replace function public.payment_block_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'payment는 insert-only 원장입니다. 취소는 type = ''CANCELLED'' 행을 추가하세요.'
    using errcode = '42501';
end;
$$;

revoke execute on function public.payment_block_mutation() from public, anon, authenticated;

create trigger payment_block_update_delete
  before update or delete on public.payment
  for each row execute function public.payment_block_mutation();

create trigger payment_block_truncate
  before truncate on public.payment
  for each statement execute function public.payment_block_mutation();
