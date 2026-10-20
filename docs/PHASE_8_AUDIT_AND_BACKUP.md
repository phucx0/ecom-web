# Phase 8 — Audit và kiến trúc Backup/Restore

## Đối chiếu hiện trạng

| Chức năng | Trước Phase 8 | Thay đổi Phase 8 |
|---|---|---|
| Danh sách khách hàng | `/admin/customers`, chỉ customer | Bổ sung `/admin/users` cho mọi role và trạng thái |
| Chi tiết tài khoản | Có hồ sơ khách hàng và lịch sử đơn | Bổ sung màn hình quản trị tên, số điện thoại, trạng thái an toàn |
| Bảo vệ Admin | Có role check cho API nghiệp vụ | Thêm chống tự khóa và khóa Admin cuối cùng |
| Database health | Chỉ có `/api/health` | Bổ sung dashboard database, số lượng type, indexes và Views |
| Xem document | Chưa có | Inspector read-only, whitelist 5 type và che trường bí mật |
| Ghi document | CRUD sản phẩm/danh mục và nghiệp vụ đơn đã có | Tái sử dụng API có validation; không tạo API ghi tùy ý |
| Backup/Restore | Chưa có | Snapshot có SHA-256, tải bảo vệ và restore database mới |

## Phương pháp backup

Server gọi `_all_docs?include_docs=true&attachments=true` trên `retail_shop`. File JSON chứa format/version, metadata không có credentials, toàn bộ current document—including Design Documents—và attachments inline. SHA-256 được tính trên mảng documents và kiểm tra trước restore. File được lưu tại `.data/backups`, ngoài `public` và bị loại khỏi source control.

## Phương pháp restore

File upload tối đa 25 MB được kiểm tra JSON, format, version, document count và SHA-256 trước khi thay đổi CouchDB. Database đích phải khớp `retail_shop_restore_*`, khác database nguồn và chưa tồn tại. Server tạo database mới, bỏ `_rev` nguồn rồi ghi `_bulk_docs`; attachments inline và Design Documents được giữ. Sau đó server so sánh số document thực tế với manifest. Database đã tồn tại luôn bị từ chối, không bị xóa hay ghi đè.

## Giới hạn

- Snapshot lưu current revision, không lưu toàn bộ revision history hoặc tombstone đã compact.
- Đây là application-level snapshot, không phải snapshot giao dịch; document có thể thay đổi trong lúc `_all_docs` chạy trên hệ thống đang ghi liên tục.
- File chứa dữ liệu người dùng và password hash nên là dữ liệu nhạy cảm, chỉ được tải qua API Admin và cần lưu trữ an toàn sau khi tải.
- Storage `.data` là local filesystem; triển khai serverless/đa instance cần chuyển sang object storage riêng tư.
- Restore thất bại sau khi database mới được tạo sẽ để lại database thử nghiệm để điều tra; hệ thống không tự xóa nhằm tránh hành động phá hủy ngoài ý muốn.
