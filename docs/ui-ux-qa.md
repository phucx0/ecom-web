# UI/UX QA — Retail Shop

Thực hiện ngày 13/11/2026 (Asia/Bangkok). Kết quả chỉ phản ánh các kiểm tra được chạy, không thay thế nghiệm thu bằng trình duyệt.

## Kết quả tự động

| Kiểm tra | Kết quả | Bằng chứng / phạm vi |
| --- | --- | --- |
| `npm.cmd run typecheck` | PASS | TypeScript không có lỗi |
| `npm.cmd run lint` | PASS | ESLint không có lỗi/cảnh báo |
| `npm.cmd run test` | PASS | 5 file, 22 test: auth/session, catalog validation, checkout validation, lifecycle transitions và client request errors |
| `npm.cmd run build` | PASS | Next.js production compile, typecheck, prerender 28 static entries, tạo route manifest |
| `npm.cmd run test:ui-smoke` | PASS | 9 nhóm kiểm tra trên server thật, dữ liệu CouchDB hiện có |
| Source diff backend | PASS | Không sửa `app/api`, `lib/couchdb`, `lib/auth`, `lib/catalog`, `lib/orders`, `scripts/init-admin.mjs` |
| Production smoke | PASS | Cùng 9 nhóm trên `next start`, `http://127.0.0.1:3101` |
| Static bundle scan | PASS | Không tìm thấy tên biến COUCHDB_PASSWORD, COUCHDB_USERNAME hoặc SESSION_SECRET trong `.next/static` |
| `git diff --check` | PASS | Không có lỗi whitespace |

Smoke test dùng GET, không seed, không tạo order/user/product, không backup/restore. Dữ liệu tại thời điểm chạy: 2 sản phẩm và 2 danh mục; cả hai sản phẩm có `images: []`.

9 nhóm smoke test:

1. Health xác nhận kết nối database `retail_shop`.
2. Trang chủ render tên sản phẩm thật; không còn copy kỹ thuật cũ.
3. Catalog render; tìm kiếm API có kết quả thật; thứ tự giá tăng trong HTML; page 999 được clamp.
4. Category filter dùng ID thật, API không trả sản phẩm thuộc danh mục khác.
5. Từ khóa không khớp có empty state.
6. Hai trang sản phẩm thật render; slug không tồn tại trả API 404 và UI not-found.
7. Login/register/cart SSR render; password autocomplete hiện đúng.
8. Account/checkout/admin routes redirect khi không có session.
9. Private API GET trả 401 khi không có session.

Các test `client-request.test.ts` dùng response giả **chỉ trong unit test**, không đưa mock data vào ứng dụng. Bao gồm: giữ method/body/idempotency header, lỗi kho từ API, mất mạng và phản hồi HTML không hợp lệ.

## Rà soát Web Interface Guidelines sau triển khai

Nguồn đã tải trong phiên làm việc: [Vercel Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md).

Các kiểm tra source đã thực hiện: tên nút icon; nhãn input; ARIA lỗi; focus-visible; skip link; heading level; native controls; ảnh giữ tỉ lệ; min-w-0 và vùng cuộn bảng/JSON; URL cho filter/page; reduced motion; định dạng tiền/ngày; lỗi fetch; xác nhận thao tác hủy/xóa. Đây là kiểm tra source, không phải báo cáo axe hay kiểm thử screen reader.

```text
app/(store)/layout.tsx:20 - ✓ skip link target, search label, semantic navigation
app/(store)/products/page.tsx:23 - ✓ labelled filters, responsive grid, clamped pagination
components/catalog/product-card.tsx:8 - ✓ product links, responsive image, heading level
components/cart/cart-page.tsx:21 - ✓ named quantity/remove actions and undo
components/cart/checkout-form.tsx:52 - ✓ field labels/errors, pending state, error focus
components/ui/confirm-dialog.tsx:9 - ✓ pending guard, accessible Radix title/description
components/ui/drawer.tsx:8 - ✓ native dialog, Escape/close, body scroll cleanup
app/globals.css:54 - ✓ reduced-motion override
components/admin/dashboard-charts.tsx:6 - ✓ readable data-table alternative
```

Tương phản đo bằng công thức relative luminance: primary #006b4f trên trắng 6,53:1; body #172b24 trên canvas #f6f8f7 13,99:1; muted #52645b trên trắng 6,30:1; biên control #7f9386 trên trắng 3,27:1. Đây là kiểm tra token cơ sở, chưa đo mọi trạng thái render thực tế.

## Chưa thể xác minh bằng trình duyệt

Computer Use báo native pipe unavailable, inventory không có browser; mở in-app browser trả `Browser is not available: iab`. Vì vậy **chưa đánh dấu PASS** cho các mục sau:

- Layout thật ở 375/768/1440px, landscape, zoom 200%, không horizontal overflow.
- Keyboard/tab order, focus trap/restore của modal/drawer, screen reader và accessibility tree sau hydration.
- Gallery nhiều ảnh: dữ liệu thật hiện không có ảnh; source hỗ trợ toàn bộ images[] và lỗi tải ảnh.
- Thêm giỏ, reload localStorage, tăng/giảm/xóa/hoàn tác, tổng tiền sau tương tác.
- Login/register thành công, account có dữ liệu, validation tương tác.
- Checkout thành công, retry khi mất mạng, đặt/hủy đơn và khôi phục kho qua UI.
- Admin CRUD, transitions/delivery, user status và backup/restore qua UI.
- Reduced motion thực tế, chỉ số CLS/Lighthouse và kiểm tra bằng axe.

Không thực hiện các mutation trên dữ liệu thật để thử giao diện. Cần một tài khoản test và môi trường/dữ liệu được xác nhận có thể thay đổi để nghiệm thu phần ghi dữ liệu; không dùng `admin:init`, không reset hoặc restore database hiện tại.

## Những điểm còn tồn tại

- Chưa thể nghiệm thu trực quan/responsive và tương tác sau hydration vì không có browser. Không tuyên bố hoàn tất nghiệm thu end-to-end.
- Hai sản phẩm thật chưa có ảnh; UI hiển thị fallback trung tính. Có thể bổ sung ảnh qua chức năng sửa sản phẩm sẵn có khi chủ dữ liệu quyết định.
- Font Be Vietnam Pro chưa được đóng gói; giao diện dùng Segoe UI/Arial trên máy chưa cài font này.
- Form quản trị chưa có cơ chế giữ bản nháp khi chuyển trang. Chưa có cảnh báo chuyển route khi có thay đổi chưa lưu.
- Repository đọc tối đa 100 documents, nên phân trang đang áp dụng trong tập kết quả hiện có. Giữ nguyên giới hạn backend trong redesign này.
- Payment status/View doanh thu và tính nguyên tử nhiều document vẫn có hạn chế đã ghi trong audit. Không sửa lifecycle/schema để giải quyết trong đợt UI.

## Chạy lại

```powershell
npm.cmd run dev -- --hostname 127.0.0.1 --port 3100
# Trong terminal khác:
npm.cmd run test:ui-smoke
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test
npm.cmd run build
```

Port 3000 bị hệ điều hành từ chối bind (EACCES) trong phiên này; port 3100 hoạt động. Dùng `UI_SMOKE_URL` nếu server chạy ở port khác.

## Phạm vi bàn giao

- Store: shell/header/search/footer; home; catalog/search/filter/sort/page; product gallery/detail; cart/summary/quantity; checkout/success; login/register; account navigation/profile/orders; loading/error/not-found.
- Admin: shell/sidebar/mobile drawer; shared typography/panels/controls; products table/pagination/form; categories form/table; order filters/actions; customer/user table labels; database inspector layout; backup pending/long-ID handling; chart data-table alternative.
- Shared: semantic tokens, Button/Input/Select/Textarea/Skeleton/Drawer/ConfirmDialog, Price, QuantitySelector, SectionNav, Breadcrumbs, StatusBadge, request/format/status utilities.
- Tài liệu: `ui-ux-audit.md`, `ui-ux-redesign-plan.md`, `design-system.md`, `ui-ux-qa.md`.
- Kiểm thử: `scripts/ui-smoke.mjs`, `tests/client-request.test.ts`, script `test:ui-smoke` trong package.json.
- `AGENTS.md` được Next.js 16.4.2 tự sinh khi chạy dev; không phải thay đổi nghiệp vụ.
