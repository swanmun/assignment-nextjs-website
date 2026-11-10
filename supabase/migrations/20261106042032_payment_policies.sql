-- 결제 기록 규칙 (rules/payment.md)
-- payment는 거래 기록(원장)이다. 결제 완료는 type 'PAID', 결제 취소는 같은 transaction_key로 type 'CANCELLED' 행을 더한다.
-- 같은 결제(paymentId)가 두 번 기록되지 않도록 (transaction_key, type)을 유일하게 둔다.

alter table public.payment
  add constraint payment_transaction_key_type_key unique (transaction_key, type);

alter table public.payment
  add constraint payment_type_check check (type in ('PAID', 'CANCELLED'));

create index if not exists payment_user_id_idx on public.payment (user_id);
create index if not exists payment_product_id_idx on public.payment (product_id);
create index if not exists payment_payment_snapshot_id_idx on public.payment (payment_snapshot_id);

-- RLS: 로그인한 회원은 자기 결제만 읽고 쓴다. 수정·삭제는 하지 않는다(기록은 쌓기만 한다).
-- BFF가 PortOne 서버 조회로 검증한 뒤에만 INSERT 한다.
create policy payment_select_own on public.payment
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy payment_insert_own on public.payment
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

-- 스냅숏: 결제 기록보다 먼저 만들어지므로 로그인한 회원이 넣을 수 있고, 읽기는 자기 결제에 연결된 것만.
create policy product_snapshot_insert_authenticated on public.product_snapshot
  for insert to authenticated
  with check (true);

create policy product_snapshot_select_own on public.product_snapshot
  for select to authenticated
  using (
    exists (
      select 1 from public.payment p
      where p.payment_snapshot_id = product_snapshot.id
        and p.user_id = (select auth.uid())
    )
  );

-- 비로그인(anon)은 결제 테이블에 접근하지 않는다.
revoke all on public.payment from anon;
revoke all on public.product_snapshot from anon;
