# 결제 규칙 (SSOT)

결제(요청·완료 검증·기록·취소·웹훅) 규칙의 기준. 코드와 다르면 이 문서를 먼저 고친 뒤 코드를 맞춘다.
화면 흐름은 `02-prd.md`(v0.2), 코드 상수는 `lib/payment-rules.ts`.

| 상태 | 범위 |
| --- | --- |
| ✅ 구현 | 결제 요청, 결제 완료 검증·기록, 결제 완료 웹훅(`Transaction.Paid`), 중복 기록 방지 |
| ⏳ 예정 | 결제 취소 BFF, 결제 취소 웹훅, 정원·1인 1회, 결제/취소 내역 탭, 결제 바텀시트 |

## 1. 구성

- PG: **PortOne V2**, 결제수단 `CARD`, 통화 `KRW`. 브라우저 SDK `@portone/browser-sdk/v2`, 서버 SDK `@portone/server-sdk`.
- 포트원 코드는 PortOne MCP(`readPortoneV2FrontendCode`·`readPortoneV2BackendCode`)로 V2 예제·스펙을 확인한 뒤 쓴다.
- 결제 성공 여부는 브라우저가 아니라 **BFF가 포트원 서버 조회(`getPayment`)로** 판단한다.

| 파일 | 역할 |
| --- | --- |
| `lib/payment-rules.ts` | 통화·결제수단·완료 경로·`PAYMENT_TYPE`·금액 부호(`toLedgerAmount`)·`customData` 타입·`toOrderName` (공용) |
| `lib/portone.ts` | 포트원 환경변수, 서버 SDK, `fetchPortonePayment` (`server-only`) |
| `lib/supabase/payment.ts` | `recordPaidPayment()` 검증·기록(완료 페이지·웹훅 공용), `completePayment()` (`server-only`) |
| `lib/supabase/server.ts` | `createSupabaseAdminClient()` secret key 클라이언트 |
| `app/products/[id]/_components/PayButton.tsx` | [결제하기] → `PortOne.requestPayment` |
| `app/api/payments/complete/route.ts` | `POST /api/payments/complete` |
| `app/api/payments/webhook/route.ts` | `POST /api/payments/webhook` |
| `app/payments/complete/` | 결제 완료 페이지(`redirectUrl`) |
| `supabase/migrations/*_payment_*.sql` | 제약·RLS·insert-only 트리거 |

## 2. 환경변수

모두 서버 전용. `NEXT_PUBLIC_` 금지. 형식은 `.env.example`, 값은 `.env.local`·Vercel.

| 이름 | 용도 | 브라우저 노출 |
| --- | --- | --- |
| `PORTONE_STORE_ID` | 상점 아이디 | 가능(서버가 결제 버튼 props로 전달) |
| `PORTONE_CHANNEL_KEY` | 채널 키(테스트/실연동 전환은 이것만 바꾼다) | 가능(동일) |
| `PORTONE_API_SECRET` | 결제 조회·취소 | **금지** |
| `PORTONE_WEBHOOK_SECRET` | 웹훅 서명 검증 | **금지** |
| `SUPABASE_SECRET_KEY` | 결제 기록 쓰기·웹훅(RLS 우회) | **금지** |

- 상점 아이디·채널 키가 없으면 상세 페이지는 "지금은 결제할 수 없는 상품이에요"를 보여 준다.

## 3. 결제 요청 (상품 상세 › [결제하기])

- 로그인 회원만. 비로그인은 `/login?next=/products/<id>`로 보낸다.
- 상품명·가격은 서버가 DB에서 읽은 값만 쓴다. `status = 'Public'`이고 가격이 있는 상품만 결제 가능.
- `requestPayment` 값: `paymentId: uuidv4()`(시도마다 새로), `orderName: toOrderName(name)`, `totalAmount: price`, `currency: "KRW"`, `payMethod: "CARD"`, `redirectUrl: ${origin}/payments/complete`, `forceRedirect: true`, `customData: { productId, userId }`.
- 브라우저는 성공 여부를 판단하지 않는다. 결제창 열기 전 오류(`response.code`)만 토스트로 보여 준다.

## 4. 결제 완료 페이지 (`/payments/complete`)

- `code`가 있으면 "결제가 완료되지 않았어요" + 메시지. BFF를 부르지 않는다.
- 없으면 `POST /api/payments/complete { paymentId }` 결과를 보여 준다. 로그인 필수(`proxy.ts` PROTECTED).
- 새로고침해도 같은 결과(멱등).

## 5. 결제 완료 검증 (`recordPaidPayment`)

입력은 **paymentId 하나**. 완료 페이지는 로그인 회원 id를 함께 넘기고, 웹훅은 넘기지 않는다(`customData.userId` 사용).

1. paymentId가 uuid인지 확인.
2. `(transaction_key, 'PAID')` 행이 있으면 그대로 반환(멱등). 완료 페이지는 행의 `user_id`가 본인인지 확인(아니면 403).
3. `getPayment({ paymentId, storeId })` → `status === "PAID"`.
4. `storeId === PORTONE_STORE_ID`, `customData`를 `{ productId, userId }`로 읽을 수 있는지. 완료 페이지는 `userId === 로그인 회원`.
5. DB 상품 재조회: 공개 상품이고 `amount.total === price`, `currency === "KRW"`, `orderName === toOrderName(name)`.
6. 같은 회원·같은 상품의 다른 유효 결제가 있으면 `[payment] 같은 상품 중복 결제` 경고 로그(기록은 한다. ⏳ 1인 1회에서 차단).
7. 스냅숏 INSERT → 결제 INSERT(6장).

- 하나라도 틀리면 기록하지 않는다. 금액 불일치는 `[payment]` 에러 로그(⏳ 취소 기능이 생기면 자동 전액 취소).
- 실연동 전환 후 `channel.type === "LIVE"` 확인을 추가한다.

| 상황 | 완료 BFF 응답 |
| --- | --- |
| paymentId 없음·uuid 아님 / customData·상점 불일치 | 400 |
| 로그인 안 함 | 401 |
| 다른 회원의 결제 | 403 |
| 포트원에 결제 없음 | 404 |
| `PAID` 아님 / 판매 중 아님 / 금액·통화·주문명 불일치 | 409 |
| DB 저장 실패·예상 못 한 오류 | 500 |

## 6. DB 기록

### `payment` — insert-only 원장

| 컬럼 | 값 |
| --- | --- |
| `transaction_key` | 포트원 `paymentId`(uuid v4). 결제·취소를 묶는 그룹 키 |
| `type` | `'PAID'` · `'CANCELLED'` (CHECK) |
| `amount` | **결제 +금액, 취소 −금액** (CHECK `payment_amount_sign_check`). `toLedgerAmount(type, amount)`로 만든다 |
| `product_id` · `user_id` · `payment_snapshot_id` | `Product.id` · `auth.users.id` · `product_snapshot.id` |

- **INSERT만 한다.** UPDATE·DELETE·TRUNCATE는 트리거(`payment_block_mutation`)가 secret key로도 막는다.
- 취소는 같은 `transaction_key`로 `CANCELLED` 행을 더한다. 남은 금액 = `sum(amount) group by transaction_key`, `CANCELLED` 행이 있으면 취소 상태.
- 부분 취소는 하지 않는다 → `(transaction_key, type)` 유일 = 결제 1행 + 취소 최대 1행.

### 중복 기록 방지 (필수)

같은 paymentId가 완료 페이지·새로고침·웹훅·웹훅 재전송으로 여러 번, 동시에 들어와도 행은 하나다.

1. 기록 전 `(transaction_key, type)` 조회 → 있으면 기존 행 반환.
2. DB unique `payment_transaction_key_type_key`가 최종 방어선.
3. INSERT가 23505면 먼저 기록된 것으로 보고 내 스냅숏을 지운 뒤 기존 행을 반환(성공).
4. 결제 INSERT가 다른 이유로 실패하면 스냅숏을 지우고 500.

### `product_snapshot` — 결제 시점 정보

- `snapshot_product`: 결제 시점 `Product` 행(이미지는 경로). `snapshot_payment`: 포트원 결제 요약(paymentId, transactionId, status, orderName, amount, currency, method, channel, paidAt, pgTxId, receiptUrl).
- `id`는 서버에서 `crypto.randomUUID()`. 순서: 스냅숏 → 결제.

### 권한

| 테이블 | authenticated | 쓰기 |
| --- | --- | --- |
| `payment` | 자기 행 SELECT만 | `createSupabaseAdminClient()`(secret key)만 INSERT |
| `product_snapshot` | 자기 결제에 연결된 것만 SELECT | secret key만 INSERT·DELETE(고아 정리) |

- anon 권한 없음. secret key 클라이언트는 `lib/supabase/payment.ts`에서만 쓰고, 부르기 전에 로그인 회원 또는 웹훅 서명을 확인한다.

## 7. 결제 완료 웹훅 (`POST /api/payments/webhook`)

- 포트원 콘솔 › 결제알림(Webhook) 관리 › **결제모듈 V2**, 버전 `2024-04-25`, Content-Type `application/json`, URL `https://<배포 주소>/api/payments/webhook`.
- `proxy.ts` matcher에서 제외(세션 없음). localhost는 포트원이 부를 수 없으니 배포 주소로 테스트한다.
- 본문은 **원문 문자열**(`request.text()`)로 `Webhook.verify(PORTONE_WEBHOOK_SECRET, body, headers)`.
- 웹훅 내용은 믿지 않는다. `data.paymentId`만 꺼내 5장 검증을 그대로 다시 한다.

| 상황 | 응답 |
| --- | --- |
| 서명 검증 실패 | 400 |
| 모르는 `type`, 처리하지 않는 이벤트, 다른 상점(`data.storeId`) | 200(무시) |
| `Transaction.Paid` 기록 완료·이미 기록됨 | 200 |
| 검증 실패(4xx: 결제 없음·미완료·금액 불일치) | 200 + 경고 로그(재전송해도 같으므로 멈춘다) |
| DB·포트원 일시 오류, 시크릿 없음(5xx) | 500 → 포트원이 최대 5회 재전송 |

- 완료 페이지와 웹훅의 도착 순서는 보장되지 않는다. 어느 쪽이 먼저든 6장 중복 방지로 행은 하나.
- 브라우저가 완료 페이지에 못 온 경우(창 닫힘·앱 종료)의 누락을 웹훅이 채운다.
- 30초 안에 응답한다(포트원 타임아웃).

## 8. 결제 취소 (⏳ 예정)

- 마이 페이지 › 결제 내역에서 본인이 취소. `POST /api/payments/[paymentId]/cancel`.
- 순서: 로그인 → 본인 `PAID` 행 확인 → `CANCELLED` 행이 있으면 그대로 성공(멱등) → 환불 규정 확인 → `payment.cancelPayment({ paymentId, reason, requester: "CUSTOMER", currentCancellableAmount })` → 9장 기록 함수로 `CANCELLED` 행 INSERT.
- 전액 취소만. 환불 규정(기한·금액)은 PRD 확정 후 이 문서와 `lib/payment-rules.ts`에 상수로 둔다. 불가하면 버튼 비활성화(`OrderItem` `paid-locked`).
- 취소하면 참여 인원이 1 줄어든다.

## 9. 결제 취소 웹훅 (⏳ 예정)

- 같은 엔드포인트에서 `Transaction.Cancelled`를 처리한다. `Transaction.PartialCancelled`는 부분 취소를 하지 않으므로 경고 로그 후 200.
- 기록 함수 `recordCancelledPayment(paymentId)`를 취소 BFF와 함께 쓴다.
  1. `(transaction_key, 'CANCELLED')` 행이 있으면 끝(멱등).
  2. `getPayment` → `status === "CANCELLED"`, `storeId` 확인.
  3. `PAID` 행이 없으면(결제 웹훅 누락) 5장 검증으로 `PAID` 행을 먼저 만든다. 상태 검사만 `CANCELLED`도 허용.
  4. `cancellations`에서 `status === "SUCCEEDED"`인 건의 `totalAmount` 합이 `PAID` 금액과 같은지 확인.
  5. `transaction_key = paymentId`, `type = 'CANCELLED'`, `amount = toLedgerAmount('CANCELLED', 합계)`(음수), `product_id`·`user_id`는 `PAID` 행과 같게, 스냅숏은 취소 시점 결제 요약으로 새로 만든다.
  6. 23505면 이미 기록된 것으로 성공(취소 BFF와 웹훅 동시 도착).
- 응답 규칙은 7장과 같다.
- DB 보강: `CANCELLED` INSERT 시 같은 키의 `PAID` 행 존재·금액 합 0을 트리거로 검사한다.

## 10. 정원·1인 1회 (⏳ 예정)

- 정원 = `Product.capacity`, 참여 수 = 취소되지 않은 `PAID` 수. 차면 [결제하기]를 막고, 검증 시점에 넘었으면 기록하지 않고 자동 전액 취소.
- 1인 1회: 이미 결제한 상품이면 버튼을 [신청 완료 · 결제 내역 보기]로. 5장 6번 경고를 차단으로 바꾼다.
- 집계는 secret key 서버 코드에서 한다.

## 11. 테스트

- 테스트 채널은 실제 출금되지 않는다. 결제 상태는 포트원 콘솔 또는 PortOne MCP `getPaymentsByFilter`로 확인.
- 시나리오: 결제 성공 → 행 1개 / 완료 페이지 새로고침 → 그대로 1개 / 완료 페이지 안 가고 창 닫기 → 웹훅으로 1개 / 웹훅 재전송·콘솔 [호출 테스트] → 그대로 1개 / 서명 틀린 요청 → 400 / 다른 계정으로 완료 페이지 → 403 / 결제창 닫기 → 실패 안내.
- `payment` UPDATE·DELETE 시도 → 트리거 오류, `amount` 부호 틀린 INSERT → CHECK 오류.
