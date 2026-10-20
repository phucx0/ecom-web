# API contract dự kiến

Response thành công dùng `{ "data": ... }`; lỗi dùng `{ "error": { "code", "message", "requestId?" } }`. Validation: 400; chưa đăng nhập: 401; thiếu quyền: 403; không thấy: 404; conflict `_rev`/idempotency: 409; CouchDB không sẵn sàng: 503.

## Endpoint theo phase dự kiến

| Method | Path | Customer | Admin | Ghi chú |
|---|---|---:|---:|---|
| GET | `/api/health` | công khai | công khai | chỉ trạng thái dịch vụ/DB, không lộ credentials |
| GET | `/api/products`, `/api/products/:slug` | có | có | chỉ sản phẩm active với khách |
| POST | `/api/auth/register`, `/api/auth/login` | công khai | công khai | Phase 2 |
| GET | `/api/orders` | own | tất cả | lọc ownership ở server |
| POST | `/api/orders` | có | có | server định giá; cần Idempotency-Key |
| GET | `/api/orders/:id` | own | tất cả | không tin user_id từ client |
| PATCH | `/api/admin/orders/:id/status` | không | có | state machine + `_rev` |
| CRUD | `/api/admin/products/*`, `/api/admin/categories/*` | không | có | validation và conflict rõ ràng |
| GET | `/api/admin/reports/*` | không | có | dùng Views đã audit |

## Endpoint authentication đã triển khai ở Phase 2

- `POST /api/auth/register`: tạo customer, hash mật khẩu và đặt session.
- `POST /api/auth/login`: xác minh credentials và đặt session.
- `POST /api/auth/logout`: xóa cookie session.
- `GET /api/auth/me`: trả safe user hoặc 401.
- `GET /api/admin/auth-check`: trả 401 khi chưa đăng nhập, 403 với customer và 200 với admin.

## Endpoint catalog đã triển khai ở Phase 3

- `GET /api/products?q=&category=` và `GET /api/products/:slug`: chỉ trả sản phẩm active.
- `GET /api/categories`: chỉ trả danh mục active.
- `GET|POST /api/admin/products`, `PATCH|DELETE /api/admin/products/:id`: yêu cầu Admin.
- `GET|POST /api/admin/categories`, `PATCH|DELETE /api/admin/categories/:id`: yêu cầu Admin.
- Update/delete bắt buộc `_rev`; slug trùng hoặc stale revision trả 409. Danh mục đang có sản phẩm không thể xóa.

Các endpoint đơn hàng/báo cáo trong bảng vẫn chỉ là contract cho phase sau.

## Checkout đã triển khai ở Phase 4

`POST /api/orders` yêu cầu session và header `Idempotency-Key`. Server đọc lại product, snapshot tên/đơn giá, tính subtotal/phí vận chuyển/tổng, kiểm tra và trừ kho bằng `_rev`. Gửi lại cùng user/key trả cùng order; thiếu hàng trả 409. Nếu cập nhật nhiều product thất bại, các phần đã trừ được bù lại và order đánh dấu `failed/released`.

## Health response

- 200: `{ "status":"ok", "database":"retail_shop", "details":{"connected":true} }`
- 503: `{ "status":"error", "database":"retail_shop", "details":{"connected":false}, "error":{"code":"DATABASE_UNAVAILABLE","message":"Không thể kết nối cơ sở dữ liệu."} }`

Không trả CouchDB URL, version server, username, password hay stack trace.
