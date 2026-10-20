# Phase 5.5 — Audit cấu trúc trang

Ngày audit: 2026-10-20. Phạm vi chỉ gồm Phase 5.5; không thay đổi schema CouchDB, state machine hay authentication.

| Khu vực | Trước Phase 5.5 | Route mục tiêu | Kết quả |
|---|---|---|---|
| Catalog admin | Sản phẩm và danh mục gộp tại `/admin` | `/admin/products`, `/admin/products/new`, `/admin/products/[id]/edit`, `/admin/categories` | Đã tách |
| Đơn hàng admin | Danh sách và thao tác gộp tại `/admin/orders` | `/admin/orders`, `/admin/orders/[id]` | Đã tách |
| Vận chuyển admin | Chưa có UI | `/admin/deliveries`, `/admin/deliveries/[id]` | Đã bổ sung |
| Khách hàng admin | Chưa có UI | `/admin/customers`, `/admin/customers/[id]` | Đã bổ sung |
| Tài khoản | Chưa có navigation riêng | `/account/profile`, `/account/orders`, `/account/orders/[id]` | Đã bổ sung |
| Đơn hàng khách | `/orders` và `/orders/[id]` | Namespace `/account/orders` | Route cũ chuyển hướng tương thích |
| Sản phẩm khách | Có tìm kiếm/lọc cơ bản | `/products`, `/products/[slug]` | Thêm sắp xếp, phân trang, chọn số lượng |
| Checkout | Form đơn và màn hình thành công tối giản | `/cart` → `/checkout` → `/checkout/success` | Thêm chỉ báo bước và liên kết chi tiết đơn |

## Nhận định

- Trang quản lý chính từng nhồi catalog hoặc toàn bộ nội dung đơn hàng đã được thay bằng mô hình danh sách → chi tiết → thao tác.
- API hiện có được tái sử dụng cho catalog và chuyển trạng thái. Hai API tối thiểu được bổ sung là cập nhật hồ sơ an toàn và khách tự hủy đơn hợp lệ.
- Trang khách hàng và vận chuyển đọc CouchDB phía server qua repository hiện tại; credential không đi xuống client.
- Các component dùng chung gồm `PageHeader`, `StatusBadge`, `EmptyState`, `ConfirmDialog`, `DetailSection`, `OrderTimeline`, `OrderList`, `ProductForm`.
- Bảng hiện tại chỉ cần lọc/phân trang ở mức vừa nên chưa thêm TanStack Table; tránh tăng dependency khi chưa có nhu cầu bảng nâng cao.
