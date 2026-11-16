# Retail Shop — Next.js + CouchDB

Nền tảng website bán lẻ cho đồ án quản trị Apache CouchDB bằng Fauxton. Hiện dự án hoàn thành phạm vi Phase 0–5: authentication, catalog, checkout COD, quản lý vòng đời đơn và giao hàng.

Hướng dẫn từng bước bằng tiếng Việt: [Cài đặt và sử dụng CouchDB và website](docs/HUONG_DAN_CAI_DAT_VA_SU_DUNG.md), bao gồm thiết lập trên Windows, cấu hình, tạo tài khoản, mua hàng, quản trị và backup/restore.

## Yêu cầu

- Node.js 20.9 trở lên (môi trường đã kiểm tra: Node 24.14.1).
- Apache CouchDB đang chạy. Script bên dưới tạo database `retail_shop` nếu chưa có.
- Fauxton: `http://127.0.0.1:5984/_utils/`.

## Chạy trên Windows

```powershell
Copy-Item .env.example .env.local
# Điền credentials vào .env.local, không commit file này.
npm.cmd install
npm.cmd run db:init
npm.cmd run dev
```

Mở `http://localhost:3000`, sản phẩm tại `/products`, giỏ hàng tại `/cart`, checkout tại `/checkout`, CRUD Admin tại `/admin`.

## Biến môi trường

`COUCHDB_URL`, `COUCHDB_DATABASE`, `COUCHDB_USERNAME`, `COUCHDB_PASSWORD`, `COUCHDB_TIMEOUT_MS`, `SESSION_SECRET`, `SESSION_TTL_SECONDS`. Chỉ được đọc phía server; không dùng tiền tố `NEXT_PUBLIC_`. `SESSION_SECRET` phải là chuỗi ngẫu nhiên ít nhất 32 ký tự.

## Tạo database và dữ liệu mẫu

CouchDB lưu document JSON trong một database, không có bảng hay lệnh SQL `CREATE TABLE`. Trường `type` phân biệt `user`, `category`, `product`, `order`, `delivery`. Cấu trúc nằm trong [docs/COUCHDB_SCHEMA.md](docs/COUCHDB_SCHEMA.md).

Điền cấu hình CouchDB trong `.env.local`. Các lệnh `db:*` tự đọc file này; biến đã đặt trong shell được ưu tiên. Tài khoản CouchDB cần quyền tạo database và design document.

```powershell
# Tạo database, 8 Mango indexes và _design/reports với 2 view.
npm.cmd run db:init

# Chèn dữ liệu mẫu vào database đã khởi tạo.
# Chọn mật khẩu riêng cho hai tài khoản khách hàng demo.
$env:SEED_CUSTOMER_PASSWORD = 'DemoShop2026!'
npm.cmd run db:seed
Remove-Item Env:SEED_CUSTOMER_PASSWORD
```

Hoặc đặt `SEED_CUSTOMER_PASSWORD` rồi chạy `npm.cmd run db:setup` để thực hiện cả hai bước. Mật khẩu demo phải có ít nhất 10 ký tự, gồm chữ hoa, chữ thường, số và tối đa 72 byte UTF-8. Có thể đặt biến này trong `.env.local`; script chỉ lưu bcrypt hash vào CouchDB và không log mật khẩu.

| Loại document | Số lượng | Nội dung |
|---|---:|---|
| `user` | 2 | `an.demo@example.com`, `binh.demo@example.com`, role `customer` |
| `category` | 3 | Văn phòng phẩm, phụ kiện máy tính, đồ dùng gia đình |
| `product` | 6 | Có sản phẩm hết hàng và sản phẩm ngừng bán |
| `order` | 8 | Đủ 7 trạng thái; 2 đơn delivered đã paid |
| `delivery` | 4 | Đang giao, đã giao và giao thất bại |

Hai tài khoản khách hàng dùng mật khẩu đã chọn trong `SEED_CUSTOMER_PASSWORD`. Admin được tạo riêng bằng `admin:init` bên dưới. Ngày mẫu cố định trong tháng 11/2026; tổng doanh thu của riêng bộ mẫu là **1.400.000 VND**, nhóm theo ngày tạo đơn.

Các file để xem hoặc sửa bộ khởi tạo:

- [database/seed.mjs](database/seed.mjs): dữ liệu mẫu và quan hệ giữa document, tổng tiền được tính từ items.
- [database/indexes.json](database/indexes.json): định nghĩa Mango indexes.
- [database/reports.json](database/reports.json): các view `orders_by_status` và `revenue_by_day`.
- [scripts/init-db.mjs](scripts/init-db.mjs): tạo database và insert theo thứ tự user → category → product → order → delivery.

Chạy lại sẽ bỏ qua `_id` đã tồn tại hoặc đã xóa, không reset database, không trừ tồn kho thêm và không đổi mật khẩu demo đã có. Tồn kho trong bộ mẫu là số lượng còn lại sau các đơn đã giữ hàng. Script giữ nguyên index/view hiện có; nếu index trùng tên nhưng khác định nghĩa hoặc reports thiếu view bắt buộc, script dừng để kiểm tra thủ công. Nếu một tham chiếu cần thiết đã bị xóa, seed dừng trước khi ghi.

`_bulk_docs` có thể thành công một phần; script kiểm tra kết quả từng document và báo lỗi, không tự rollback. Sau khi xử lý lỗi có thể chạy lại để bổ sung phần thiếu. Có thể xem kết quả trên Fauxton tại `http://127.0.0.1:5984/_utils/` hoặc trang `/admin/database` của ứng dụng.

API sử dụng: [tạo database](https://docs.couchdb.org/en/stable/api/database/common.html#put--db), [Mango indexes](https://docs.couchdb.org/en/stable/api/database/find.html#post--db-_index), [bulk documents](https://docs.couchdb.org/en/stable/api/database/bulk-api.html#post--db-_bulk_docs).

## Khởi tạo Admin

Đặt tạm `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` cùng các biến CouchDB trong môi trường shell rồi chạy `npm.cmd run admin:init`. Script chỉ tạo mới, không ghi đè tài khoản tồn tại và không log mật khẩu. Không lưu mật khẩu Admin thật vào repository.

## Postman collection

Import [collection](<postman/Retail Shop.postman_collection.json>) và [environment Local](<postman/Retail Shop Local.postman_environment.json>) vào Postman. Chọn **Retail Shop Local**, điền mật khẩu customer/admin rồi đăng nhập theo role. Collection có 37 request, tự lưu ID và `_rev`, dùng cookie session của ứng dụng.

Xem [hướng dẫn Postman](postman/README.md) để chạy các luồng catalog, đơn hàng, quản lý tài khoản và backup/restore. Gửi từng request theo luồng; không chạy toàn bộ collection một lượt.

## Lưu và hiển thị ảnh local

- File ảnh nằm trong `uploads/products/` tại thư mục gốc dự án. Thư mục được tạo tự động nếu chưa có; ảnh tải lên không được commit vào Git.
- Vào **Admin → Sản phẩm → Thêm sản phẩm/Sửa**, chọn ảnh từ máy, xem trước, chọn ảnh đại diện rồi **Lưu sản phẩm**. Ảnh hiển thị trong bảng quản trị, danh sách cửa hàng và thư viện ảnh ở trang chi tiết.
- Chấp nhận JPG, PNG, WebP, GIF, tối đa 5 MB/file và 10 ảnh/sản phẩm. Server kiểm tra nội dung, giới hạn 25 triệu điểm ảnh, chuyển sang WebP, sửa hướng ảnh và thu gọn tối đa 2000 × 2000 px. GIF lấy khung hình đầu tiên.
- `POST /api/admin/uploads`: đăng nhập Admin, gửi `multipart/form-data` với một trường `file`. Response `201` có `data.url`, ví dụ `/uploads/products/<uuid>.webp`. Lưu đường dẫn này vào mảng `images` khi tạo/cập nhật sản phẩm; URL ảnh bên ngoài vẫn được hỗ trợ.
- `GET /uploads/products/<uuid>.webp` trả ảnh công khai, dùng được ngay sau khi tải lên cả với `next start`, không cần build lại.
- Gỡ ảnh khỏi sản phẩm hoặc rời form chưa lưu chỉ bỏ liên kết, không xóa file trên ổ đĩa. File tải lên được giữ lại; hiện chưa có chức năng dọn ảnh không còn sử dụng.
- Khi chuyển máy hoặc sao lưu, chép cả `uploads/products/` cùng dữ liệu CouchDB. Backup JSON hiện tại chỉ chứa database, không kèm ảnh local. Máy chạy ứng dụng cần ổ đĩa có quyền ghi và được giữ lại qua các lần khởi động/deploy.

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
