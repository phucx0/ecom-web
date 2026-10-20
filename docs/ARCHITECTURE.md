# Kiến trúc hệ thống

## Phạm vi Phase 0–1

Ứng dụng dùng Next.js App Router, TypeScript và Tailwind CSS. Trình duyệt chỉ gọi Route Handler của Next.js; mọi yêu cầu CouchDB đi qua mã server và Basic credentials lấy từ `.env.local`. Fauxton tiếp tục là công cụ quan sát/quản trị độc lập.

```text
Browser -> Next.js pages / Route Handlers -> server-only CouchDB client -> retail_shop
                                                               |
Fauxton --------------------------------------------------------+
```

## Ranh giới và cấu trúc

- `app/(store)`: giao diện khách hàng công khai.
- `app/admin`: giao diện quản trị được bảo vệ server-side bằng session và role admin.
- `app/api`: API server-side.
- `lib/couchdb`: client, lỗi chuẩn hóa và helper document/Mango.
- `components/ui`: primitive theo quy ước shadcn/ui.
- `components/shared`: component dùng chung theo nghiệp vụ/giao diện.

Credentials không dùng tiền tố `NEXT_PUBLIC_`. CouchDB timeout mặc định 5 giây. API không trả URL, username, password hay nội dung lỗi nội bộ ra client.

## Dữ liệu đã audit ngày 20/10/2026

- CouchDB 3.5.3; database `retail_shop`: 12 document, 0 deleted.
- 7 document nghiệp vụ: user 1, category 2, product 2, order 1, delivery 1.
- 4 Mango index: `type+status`, `type+order_id`, `type+user_id+created_at`, `type+category_id`.
- `_design/reports`: `orders_by_status` và `revenue_by_day`.
- View trạng thái trả `shipping: 1`; View doanh thu rỗng vì chưa có order vừa `delivered` vừa `paid`.

## Rủi ro

- CouchDB không có transaction ACID nhiều document: cập nhật order/tồn kho phải dùng `_rev`, retry giới hạn và bù trừ.
- User mẫu chưa có `password_hash` được giữ nguyên như tài khoản demo và không thể đăng nhập.
- Email/slug duy nhất chưa được bảo đảm bằng index unique của CouchDB; API phải kiểm tra và dùng ID xác định/idempotency.
- Schema là quy ước ứng dụng, CouchDB hiện không có `validate_doc_update`; validation server là bắt buộc.
- JWT session là stateless: logout xóa cookie trên trình duyệt; thu hồi token trước hạn cần cơ chế version/denylist nếu yêu cầu ở production.
