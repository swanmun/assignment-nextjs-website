-- 결제 취소 기록 검사 (rules/payment.md › 결제 취소)
-- CANCELLED 행은 같은 transaction_key의 PAID 행이 있고, 같은 회원·상품이며, 금액이 정확히 −PAID 금액(전액 취소)일 때만 들어간다.
create or replace function public.payment_check_cancel()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  paid public.payment%rowtype;
begin
  if new.type <> 'CANCELLED' then
    return new;
  end if;

  select * into paid
    from public.payment
   where transaction_key = new.transaction_key and type = 'PAID';

  if not found then
    raise exception '결제(PAID) 기록이 없는 취소입니다: %', new.transaction_key using errcode = '23514';
  end if;
  if paid.user_id <> new.user_id or paid.product_id <> new.product_id then
    raise exception '결제와 회원·상품이 다른 취소입니다: %', new.transaction_key using errcode = '23514';
  end if;
  if new.amount <> -paid.amount then
    raise exception '전액 취소만 기록합니다(결제 %, 취소 %)', paid.amount, new.amount using errcode = '23514';
  end if;

  return new;
end;
$$;

revoke execute on function public.payment_check_cancel() from public, anon, authenticated;

create trigger payment_check_cancel
  before insert on public.payment
  for each row execute function public.payment_check_cancel();
