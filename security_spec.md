# Security Specification for Leapmotor Mexico Leads App

## 1. Data Invariants
- A lead must have a valid full name, email, phone, city, and model of interest.
- The default status for an incoming lead is strictly `'waiting'`.
- Only valid models of interest can be registered: 'T03', 'C10', 'C11', 'C16'.
- An Advisor can update lead status to `'attending'` (setting `attendedAt` and `advisorId` / `advisorName`) and subsequently to `'attended'` or `'lost'` (setting `notes`).
- Once a lead's status is `'attended'` or `'lost'`, it is in a terminal state and cannot be updated further.

## 2. The "Dirty Dozen" Payloads (Unauthorized / Malicious Writes)
1. **Unregistered model**: Create with `modelOfInterest: "F150"`.
2. **Missing required fields**: Create without `phone`.
3. **Privilege escalation / Client-side status overwrite**: Create with `status: 'attended'`.
4. **Invalid Email format**: Create with `email: "notanemail"`.
5. **Wrong type**: Create with `createdAt: true` instead of Timestamp.
6. **Malicious ID injection**: Create document with custom ID exceeding 128 characters or containing illegal characters.
7. **Bypass write lock**: Update a lead that is already `'attended'` to another status like `'waiting'`.
8. **Malicious field injection**: Create with unmapped fields like `isVipAdmin: true`.
9. **Advisor overwrite**: Update a lead's original client data (`name`, `email`, `phone`) as an advisor.
10. **Untrusted timestamp**: Client-provided `createdAt` does not match server `request.time`.
11. **Malicious note length**: Overwriting notes with an extremely oversized description (e.g. 50,000 characters).
12. **Status bypass**: Update Status directly from `'waiting'` to `'attended'` without being `'attending'`.

## 3. The Test Runner Reference
In standard deployments, these payloads are tested against the Firestore local emulator using `@firebase/rules-unit-testing`. The test runner asserts `permission_denied` for all 12 bad payloads and `success` for compliant ones. All tests are verified before deployment.
