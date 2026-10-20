# Đặc tả document CouchDB

## Quy ước chung

- `_id` bất biến theo mẫu `<type>:<business-id>`; `type` bắt buộc và thuộc `user|category|product|order|delivery`.
- `_rev` do CouchDB cấp, bắt buộc khi cập nhật/xóa; conflict `409` không được ghi đè mù.
- Tiền tệ dùng số nguyên VND không âm; thời gian dùng ISO-8601 UTC; chuỗi được trim và giới hạn độ dài tại API.
- Trường lạ được từ chối ở payload ghi. Các snapshot trong order không được tự đồng bộ ngược từ product.

## Schema tương thích dữ liệu hiện có

### user — `user:U001`

Bắt buộc với tài khoản có thể đăng nhập: `_id`, `type`, `name`, `email`, `role`, `phone`, `created_at`, `password_hash`, `account_status`. `role`: `customer|admin`; `account_status`: `active|disabled`. Tài khoản mới dùng ID xác định `user:email:<sha256(normalized-email)>`. `user:U001` mẫu không có hash được giữ nguyên và không thể đăng nhập. Không chấp nhận password plaintext.

### category — `category:CAT001`

Bắt buộc: `_id`, `type`, `name`, `slug`, `is_active`. `slug` lowercase, URL-safe và duy nhất theo kiểm tra ứng dụng.

### product — `product:P001`

Bắt buộc: `_id`, `type`, `name`, `slug`, `category_id`, `price`, `stock`, `description`, `images`, `is_active`, `created_at`. `price`, `stock` là integer không âm; `category_id` phải trỏ tới category; `images` là mảng URL.

### order — `order:ORD001`

Bắt buộc: `_id`, `type`, `user_id`, `customer{name,phone}`, `shipping_address{line1,city}`, `items[]`, `subtotal`, `shipping_fee`, `total`, `payment_method`, `payment_status`, `status`, `created_at`, `status_history[]`. Item bắt buộc có `product_id`, snapshot `name`, `quantity > 0`, `unit_price >= 0`. `total = subtotal + shipping_fee`; Phase hiện tại chốt `payment_method=COD`, `payment_status=unpaid|paid|failed`.

### delivery — `delivery:DEL001`

Bắt buộc: `_id`, `type`, `order_id`, `carrier`, `tracking_code`, `status`, `history[]`. `order_id` trỏ tới order; mỗi history entry có `status` và `at`.

## Index và Views hiện có

| Tên | Trường / điều kiện | Mục đích |
|---|---|---|
| `idx_type_status` | `type,status` | lọc order/delivery theo trạng thái |
| `idx_delivery_order` | `type,order_id` | tìm delivery của order |
| `idx_user_orders` | `type,user_id,created_at` | lịch sử order theo user |
| `idx_type_category` | `type,category_id` | sản phẩm theo category |
| `orders_by_status` | order có status; `_count` | tổng order theo status |
| `revenue_by_day` | order delivered, paid; `_sum(total)` | doanh thu theo ngày |

Phase 0 không tạo hoặc sửa index/design document.
