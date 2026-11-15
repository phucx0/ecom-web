# Audit UI/UX Retail Shop

Ngày audit: 13/11/2026. Phạm vi: toàn bộ `app`, `components`, `lib`, API và 4 bộ kiểm thử hiện có. Đây là kết quả đọc source trước redesign; kiểm chứng trình duyệt được ghi riêng trong `ui-ux-qa.md`.

## Kiến trúc và dữ liệu

- Next.js 16.4.2 App Router, React 19.3.1, TypeScript, Tailwind 4.3.3. Button dùng CVA/Radix Slot; AlertDialog Radix; Lucide; RHF/Zod; Sonner; Recharts. Không cần cài thêm UI framework.
- Server Component gọi repository server-only → `lib/couchdb/documents.ts` → `client.ts` → CouchDB. Public API `/api/products`, `/api/products/[slug]`, `/api/categories` dùng cùng repository. UI không dùng dữ liệu mock.
- JWT HS256, cookie HttpOnly, SameSite lax, Secure production. `currentUser` kiểm tra user hiện tại; layout account/admin gọi `requireUser`; API kiểm tra quyền riêng. Credentials chỉ trong environment server.
- Order API đọc lại giá/kho, COD, phí 30.000đ dưới 500.000đ và miễn phí từ 500.000đ; idempotency key, `_rev`, bù tồn kho. Các trạng thái pending → confirmed → packing → shipping → delivered, nhánh failed/cancelled. Giữ nguyên nghiệp vụ này.
- Quản trị đã có sản phẩm thêm/sửa, danh mục CRUD, đơn hàng/chuyển trạng thái, giao hàng, khách hàng, tài khoản, database inspector, backup/restore vào database mới. `CatalogManager` và `OrderManager` là component cũ không còn được route sử dụng.

## Mức ưu tiên

| Mức | Vị trí source trước sửa | Vấn đề / ảnh hưởng |
| --- | --- | --- |
| P0 | `components/cart/checkout-form.tsx:16` | Fetch không catch; mất mạng không có hướng dẫn, mỗi lần retry tạo key mới có nguy cơ tạo đơn lặp. |
| P1 | `app/(store)/page.tsx:8` | Không có sản phẩm hay danh mục; nội dung kỹ thuật thay vì hành trình mua hàng. |
| P1 | `app/(store)/layout.tsx:5` | Thiếu tìm kiếm/điều hướng sản phẩm, main padding quá lớn, footer kỹ thuật; không có skip link. |
| P1 | `app/(store)/products/page.tsx:3` | Input/select không nhãn, số trang không clamp, grid ít sản phẩm bị phóng lớn; copy nhắc database. |
| P1 | `app/(store)/products/[slug]/page.tsx:1` | Chỉ ảnh đầu tiên dù schema có images[], thiếu breadcrumb và thông tin mua hàng có cấu trúc. |
| P1 | `components/cart/cart-page.tsx:1` | Nút xóa/input quantity không tên truy cập; tổng tiền không thể hiện phí hiện có. |
| P1 | `components/cart/checkout-form.tsx:22` | Label không nối input, lỗi schema chỉ ở đầu form; không có breakdown tổng tiền, không chặn giỏ trống. |
| P1 | `components/auth/auth-form.tsx:18`, `components/account/profile-form.tsx:1` | Không catch lỗi mạng; trạng thái gửi/lưu có thể bị kẹt. |
| P1 | `components/orders/order-list.tsx:1` | Tên dài có thể tràn trên mobile do flex child thiếu min-width; thời gian không cố định timezone. |
| P1 | `app/admin/products/page.tsx:1` | Nút sửa chỉ icon không tên; phân trang làm mất category/q, trang ngoài phạm vi rỗng. |
| P1 | `components/ui/confirm-dialog.tsx:3` | Dialog đóng ngay khi async đang chạy; thiếu bảo vệ gửi lặp. |
| P2 | `components/ui/*`, `app/globals.css` | Chưa có semantic tokens, focus/touch size và select/textarea không thống nhất. |
| P2 | `components/shared/page-header.tsx:2` | H1 48px kể cả quản trị; uppercase eyebrow tạo nhiễu. |
| P2 | `app/(store)/login/page.tsx:5`, `register/page.tsx:5` | Tiêu đề chỉ h3, copy giải thích password hash thay vì lợi ích tài khoản. |
| P2 | `app/admin/layout.tsx:1` | Sidebar quá dài trên điện thoại, thiếu compact disclosure. |
| P2 | `components/admin/category-manager.tsx:20`, `order-actions.tsx:5` | Nút đóng không nhãn; thiếu loading khi lưu danh mục, trường vận chuyển thiếu nhãn. |

## Đánh giá theo màn hình

| Trang / nhóm route | Hierarchy, spacing, typography, layout | Responsive / accessibility | Usability, consistency, interaction |
| --- | --- | --- | --- |
| `/` | Hero chữ và 3 thẻ kỹ thuật, khoảng trống lớn | Flex cơ bản; thiếu skip link | Không dẫn người dùng đến sản phẩm thực |
| `/products` | Heading/filter/grid chưa cân đối | 1/2/3 cột; select thiếu nhãn | Có search/category/sort/page; query page chưa an toàn |
| `/products/[slug]` | Hai cột nhưng thông tin rời rạc | Mobile xếp dọc; ảnh không có gallery | Có tồn kho và add cart, thiếu phản hồi giới hạn lượng |
| `/cart` | Dòng sản phẩm và tổng ít phân cấp | Icon xóa/input không nhãn | Có cập nhật/xóa; thiếu summary/phí/empty hướng dẫn |
| `/checkout`, `/checkout/success` | Form đơn cột thiếu breakdown | Label chưa gắn input, lỗi schema chưa inline | Có COD/validation API; retry và giỏ trống cần sửa |
| `/login`, `/register` | Card cơ bản, tiêu đề nhỏ | Có autocomplete nhưng lỗi chưa gắn field | Có RHF/Zod và returnTo; thiếu xử lý mạng |
| `/account/profile` | Sidebar/card tái dùng được | Sidebar chiếm chỗ; tên dài cần wrap | Có cập nhật tên/phone, email readonly |
| `/account/orders`, `/account/orders/[id]` | List/detail/timeline có sẵn, giá cần căn rõ | List dài dễ tràn; badge cần ổn định | Có empty/cancel confirmation và delivery thực |
| `/orders`, `/orders/[id]`, `/account` | Redirect có chủ đích | Không có UI độc lập | Giữ alias tương thích |
| `/admin` | KPI/chart/table có sẵn; H1 quá lớn | Table scroll cục bộ, sidebar mobile dài | Có date/status/page; trạng thái tiếng Anh |
| `/admin/products`, `/new`, `/[id]/edit` | Table/form có sẵn | Nhãn filter/nút sửa thiếu; textarea chưa đồng bộ | Có validation/_rev; mất bộ lọc khi page |
| `/admin/categories` | Table + inline form | Form thiếu tên nút đóng | Có xác nhận xóa; thiếu saving/empty |
| `/admin/orders`, `/[id]` | Table/detail/action dùng chung | Filter và carrier/tracking thiếu nhãn | Chỉ transition hợp lệ, giữ nguyên backend |
| `/admin/deliveries`, `/[id]` | Card/detail/timeline có sẵn | Mã dài cần wrap | Có link order, empty state |
| `/admin/customers`, `/[id]` | Table/contact/order history có sẵn | Email/name dài có nguy cơ tràn | Có empty/detail |
| `/admin/users`, `/[id]` | Table/form khá đầy đủ | Vai trò disabled thiếu label liên kết | Bảo vệ self-disable/last-admin ở server |
| `/admin/database`, `/documents`, `/backups` | Card/index/JSON/backup form có sẵn | JSON cuộn cục bộ, backup ID cần wrap | Giữ read-only inspector, xác nhận restore; không chạy restore khi QA |
| Loading/error/not-found | Có nhưng chưa theo cấu trúc catalog | Thiếu reduced motion chung | Retry có sẵn; cần giữ shell khi catalog lỗi |

## Giới hạn và tồn tại backend

Repository hiện giới hạn 100 documents mỗi query, không phải phân trang toàn database. Dashboard KPI và doanh thu có cách lọc khác nhau; type `payment_status` và khả năng ghi nhận paid chưa thống nhất với View doanh thu. Multi-document inventory không atomic và có rủi ro khi tiến trình bị ngắt. Các điểm này cần phase backend riêng, không sửa schema/lifecycle trong redesign.

## Component tái sử dụng

Giữ Button/Input/Card/ConfirmDialog/StatusBadge/PageHeader/EmptyState/Breadcrumbs/DetailSection/DataTable. Bổ sung Price, QuantitySelector, ProductGallery, Skeleton, Select/Textarea, navigation có active state và summary chung cho cart/checkout.

## Sau triển khai

Các vấn đề UI P0/P1 trong bảng đã được xử lý ở source: xử lý mạng/retry, chuyển home sang dữ liệu thật, tìm kiếm/labels, gallery, summary/checkout, pagination và pending dialog. Checkout đăng nhập quay lại đúng route; trang kết quả đọc order thực có kiểm tra quyền sở hữu. Các vấn đề backend được giữ nguyên và các hạng mục chưa có bằng chứng trình duyệt được liệt kê tại `ui-ux-qa.md`; không coi sửa source là bằng chứng nghiệm thu tương tác.
