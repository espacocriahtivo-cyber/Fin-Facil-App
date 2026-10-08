# Security Specification: FinanSync

## 1. Data Invariants
- Every transaction MUST belong to the authenticated user (`userId == request.auth.uid`).
- Transactions cannot be created or altered on behalf of other users (Identity Isolation).
- A transaction's `amount` must be a positive number greater than 0.
- `context` must strictly be `"personal"` or `"business"`.
- `type` must strictly be `"income"` or `"expense"`.
- `status` must strictly be `"paid"` or `"pending"`.
- Text fields like `category`, `description`, `notes` have strict character length limits to prevent Denial of Wallet.
- User profile documents at `/users/{userId}` are strictly accessed and updated by the matching authenticated user `request.auth.uid == userId`.
- Users cannot read or list another user's transactions (`allow list: if isSignedIn() && resource.data.userId == request.auth.uid`).

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Transaction Create**: Anonymous write attempt without auth. -> REJECT
2. **Spoofed Owner UID**: Authenticated user 'userA' submits `{ userId: 'userB', amount: 100 }`. -> REJECT
3. **Negative Amount Value**: Transaction with `{ amount: -50 }`. -> REJECT
4. **Invalid Context**: Transaction with `{ context: 'crypto_gambling' }`. -> REJECT
5. **Invalid Type**: Transaction with `{ type: 'refund_hack' }`. -> REJECT
6. **Invalid Status**: Transaction with `{ status: 'arbitrary' }`. -> REJECT
7. **Massive Description Payload**: Transaction with `description` exceeding 160 characters. -> REJECT
8. **Massive Notes Payload**: Transaction with `notes` exceeding 500 characters. -> REJECT
9. **Immutability Breach**: Updating an existing transaction and changing its `userId` from 'userA' to 'userB'. -> REJECT
10. **Cross-User Document Update**: Authenticated user 'userB' attempts to update a document owned by 'userA'. -> REJECT
11. **Cross-User Profile Hijack**: User 'userA' attempts to write to `/users/userB`. -> REJECT
12. **Blanket Query Scraping**: User attempts to list collection `/transactions` without filtering by `userId == request.auth.uid`. -> REJECT
