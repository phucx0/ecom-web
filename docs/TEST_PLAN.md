# Kế hoạch kiểm thử

- Static: ESLint, TypeScript `tsc --noEmit`, Next.js production build.
- Config: thiếu/sai env trả lỗi cấu hình an toàn; không có biến bí mật trong client bundle.
- CouchDB: timeout/network/401/404/409 được ánh xạ đúng; health 200 khi DB thật sẵn sàng và 503 khi lỗi.
- Helpers: đọc ID được encode; Mango chỉ nhận selector/limit hợp lệ; ghi cập nhật bắt buộc `_rev`; conflict trả lỗi chuyên biệt.
- UI: store/admin layout ở mobile và desktop; keyboard focus; loading/error/not-found không vỡ layout.
- Các phase sau: test ownership/role, validation, idempotency, conflict, state transition, stock compensation và đối chiếu Views với Fauxton.
