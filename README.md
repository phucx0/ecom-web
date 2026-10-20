# Retail Shop — Next.js + CouchDB

Nền tảng website bán lẻ cho đồ án quản trị Apache CouchDB bằng Fauxton. Hiện dự án hoàn thành phạm vi Phase 0–5: authentication, catalog, checkout COD, quản lý vòng đời đơn và giao hàng.

## Yêu cầu

- Node.js 20.9 trở lên (môi trường đã kiểm tra: Node 24.14.1).
- Apache CouchDB đang chạy và database `retail_shop` đã tồn tại.
- Fauxton: `http://127.0.0.1:5984/_utils/`.

## Chạy trên Windows

```powershell
Copy-Item .env.example .env.local
# Điền credentials vào .env.local, không commit file này.
npm.cmd install
npm.cmd run dev
```

Mở `http://localhost:3000`, sản phẩm tại `/products`, giỏ hàng tại `/cart`, checkout tại `/checkout`, CRUD Admin tại `/admin`.

## Biến môi trường

`COUCHDB_URL`, `COUCHDB_DATABASE`, `COUCHDB_USERNAME`, `COUCHDB_PASSWORD`, `COUCHDB_TIMEOUT_MS`, `SESSION_SECRET`, `SESSION_TTL_SECONDS`. Chỉ được đọc phía server; không dùng tiền tố `NEXT_PUBLIC_`. `SESSION_SECRET` phải là chuỗi ngẫu nhiên ít nhất 32 ký tự.

## Khởi tạo Admin

Đặt tạm `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` cùng các biến CouchDB trong môi trường shell rồi chạy `npm.cmd run admin:init`. Script chỉ tạo mới, không ghi đè tài khoản tồn tại và không log mật khẩu. Không lưu mật khẩu Admin thật vào repository.

## Kiểm tra

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Tài liệu Phase 0 nằm trong `docs/ARCHITECTURE.md`, `COUCHDB_SCHEMA.md`, `BUSINESS_RULES.md`, `API_CONTRACT.md` và `TEST_PLAN.md`.

## Quản trị hệ thống và Backup/Restore

Admin mở `/admin/users` để quản trị tài khoản và `/admin/database` để xem trạng thái CouchDB, Mango Indexes, Views và document theo type. Khu vực `/admin/database/backups` hỗ trợ tạo, tải và restore snapshot.

Backup được tạo phía server trong `.data/backups` và không nằm trong `public`. File chứa dữ liệu nhạy cảm, phải được lưu tại vị trí chỉ người quản trị truy cập. Để restore trên Windows:

1. Mở `/admin/database/backups` và tải một backup hợp lệ.
2. Chọn file JSON, nhập tên database mới dạng `retail_shop_restore_demo`.
3. Nhập chính xác `RESTORE`, đọc cảnh báo và xác nhận.
4. Kiểm tra kết quả xác minh document trên thông báo; có thể mở Fauxton để đối chiếu database mới.

Hệ thống không bao giờ restore vào `retail_shop`, không xóa database thử nghiệm đã tồn tại và không tự dọn backup cũ. Chi tiết định dạng, tính toàn vẹn và giới hạn snapshot xem tại `docs/PHASE_8_AUDIT_AND_BACKUP.md`.
