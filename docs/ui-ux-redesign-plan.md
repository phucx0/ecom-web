# Lộ trình redesign

## Phase 1 — Audit

Đọc route, component, API/repository, auth và lifecycle trước sửa; ghi nhận tại `ui-ux-audit.md`. Yêu cầu hiện tại cho phép thực hiện liên tiếp cả 5 phase, thay cho quy trình chờ từng phase trong tài liệu cũ.

## Phase 2 — Design system

- Modern Minimal E-commerce, nền trắng/xám lạnh, emerald trầm; sản phẩm thực là nội dung chính.
- Palette: canvas #f6f8f7, surface #ffffff, ink #172b24, muted #52645b, brand #006b4f, border #dce5df. Màu lỗi/amber chỉ dùng theo trạng thái.
- Font: Be Vietnam Pro nếu có font local; fallback Segoe UI/Arial hỗ trợ tiếng Việt. Không phụ thuộc font mạng để build.
- H1 30–42px tùy ngữ cảnh, body 16px, meta 12–14px. Container 1200px, gutter 16/24/32px, nhịp 4/8px, radius 8/12/20px.
- Không hero lớn, gradient, social proof giả, giá giảm giả, hoặc lời hứa dịch vụ chưa có. Hero gọn dùng sản phẩm thực mới nhất làm điểm nhấn.
- Tái dùng Radix hiện có; native select/details cho chọn lọc và mobile disclosure; không cài thư viện chồng chức năng.

Kết quả dữ liệu skill: E-commerce nhấn mạnh hierarchy/conversion, palette emerald, typography Vietnamese Friendly. Script Python không chạy vì runtime thiếu standard library và `py` không có interpreter; đã đọc trực tiếp CSV của skill bằng PowerShell. Không áp dụng đề xuất motion/glassmorphism vì trái brief; emerald làm tối hơn để chữ trắng đủ tương phản.

## Phase 3 — Redesign

Thứ tự triển khai: shell → home/catalog → detail/gallery → cart/checkout → auth/account/orders → admin/table/form → trạng thái hệ thống. Dùng grid cố định số cột theo breakpoint để ít sản phẩm không giãn vô hạn.

```text
Desktop: brand | search                 | account | cart
         navigation / categories
         compact hero copy | newest real product
         category links
         newest product grid (4 columns)

Catalog: breadcrumb + title + count
         labelled search / category / sort / apply
         grid (2 mobile / 3 tablet / 4 desktop)
         results range + previous / next

Checkout: recipient form (2/3) | item/fee/total summary (1/3)
Mobile:   header wraps → search full width → content → summary
```

## Phase 4 — Integration

Giữ repositories/API endpoints/schema và route aliases. Home gọi cùng repository thật như API public. Cart giữ localStorage key cũ, không thêm ảnh vào document. Checkout áp dụng đúng phí hiện tại, server vẫn quyết định giá cuối cùng. Tăng độ chắc chắn của UI fetch/retry và nhãn lỗi, không tạo dữ liệu thật khi QA.

## Phase 5 — QA

Chạy typecheck/lint/test/build, kiểm tra public API và bảo vệ auth; kiểm tra trình duyệt 375/768/1440px nếu runtime cho phép. Kiểm tra keyboard, gallery, search/filter/sort/page, cart, empty/error/disabled, validation và reduced motion. Không reset/seed/init-admin/restore. Chỉ đánh dấu pass khi có bằng chứng; ghi giới hạn ở `ui-ux-qa.md`.
