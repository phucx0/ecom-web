# Retail Shop — Design system

## Định hướng

Modern Minimal E-commerce: sản phẩm thực và quyết định mua hàng là trọng tâm. Hero nhỏ, ảnh không bị crop, nội dung tiếng Việt dễ hiểu. Không dùng gradient, giảm giá giả, đánh giá giả hoặc cam kết dịch vụ không có trong nghiệp vụ.

Nguồn quyết định: brief của người dùng; `frontend-design`; dữ liệu E-commerce và Vietnamese Friendly của `ui-ux-pro-max`; [Web Interface Guidelines](https://raw.githubusercontent.com/vercel-labs/web-interface-guidelines/main/command.md). Các khuyến nghị glassmorphism/motion trong dữ liệu skill không phù hợp brief nên không áp dụng.

## Tokens

Định nghĩa tại `app/globals.css`, xuất sang Tailwind v4 qua `@theme inline`.

| Semantic token / class | Giá trị | Mục đích |
| --- | --- | --- |
| `--canvas` / `bg-background` | #f6f8f7 | Nền toàn ứng dụng |
| `--surface` / `bg-surface` | #ffffff | Card, form, header |
| `--foreground` / `text-foreground` | #172b24 | Nội dung chính |
| `--muted-foreground` | #52645b | Mô tả, nhãn phụ |
| `--primary` | #006b4f | CTA, focus, giá và active navigation |
| `--primary-hover` | #00533d | Hover CTA |
| `--primary-foreground` | #ffffff | Chữ trên CTA |
| `--subtle` | #edf5f0 | Vùng hỗ trợ và trạng thái được chọn |
| `--border` | #dce5df | Phân chia bề mặt |
| `--control-border` | #7f9386 | Biên input, select và textarea |
| `--destructive` | #b42318 | Lỗi và thao tác nguy hiểm |

StatusBadge dùng nhãn chữ kèm màu riêng cho pending/confirmed/packing/shipping/delivered/failed/cancelled/active/disabled/paid/unpaid. Không truyền trạng thái chỉ bằng màu. Nhãn dùng chung tại `lib/status-labels.ts`.

## Typography và spacing

- Font stack: Be Vietnam Pro → Segoe UI → Arial → sans-serif. Repository chưa có file font local; hiện dùng system fallback. Không tải font từ bên ngoài khi build. Hệ thống vẫn hỗ trợ tiếng Việt.
- Hero 42px desktop, 30px mobile; tiêu đề trang 30–36px, tiêu đề section 20–24px, card 14–16px; body 16px/1.6, secondary 14px, meta 12px/1.5.
- H1/H2/H3 phân cấp theo trang; headings balance, văn bản người dùng wrap, flex/grid child `min-w-0` khi cần.
- Nhịp 4px: 4/8/12/16/20/24/32/40/48px. Khoảng cách section 40–48px, panel padding 20–24px.
- Radius: control 8px, card 12px, hero 16px. Shadow dành cho dialog/drawer, không đổ bóng mọi card.

## Layout

`.shop-container`: tối đa 1232px gồm padding, vùng nội dung khoảng 1200px; gutter 16px → 24px từ 640px → 32px từ 1024px. Dùng breakpoint Tailwind sẵn có: 640/768/1024/1280.

- Catalog: 2 cột mobile, 3 cột từ 640px, 4 cột từ 1024px; card ít sản phẩm vẫn giữ kích thước cột. Pagination 12 sản phẩm/trang.
- Detail: một cột mobile, hai cột từ 1024px. Gallery giữ aspect square, thumbnails wrap.
- Cart/checkout: một cột mobile; nội dung + summary 350px từ 1024px. Không sticky summary để tránh che focus ở màn hình thấp.
- Account/admin dùng sidebar desktop; admin mobile có Drawer. Bảng rộng/JSON chỉ cuộn bên trong container, không che tràn toàn trang bằng overflow hidden.

## Component và hành vi

| Thành phần | File | Quy tắc sử dụng |
| --- | --- | --- |
| Button | `components/ui/button.tsx` | Primary emerald, outline và ghost; tối thiểu 44px; disabled thật; Link qua asChild |
| Input / Select / Textarea | `components/ui/{input,select,textarea}.tsx` | `.field-control`, nhãn liên kết id, input 16px, lỗi qua aria-invalid/describedby |
| Dialog | `components/ui/confirm-dialog.tsx` | Radix AlertDialog; giữ mở khi pending, chặn double submit, lỗi trong dialog |
| Drawer | `components/ui/drawer.tsx` | Native modal dialog, Escape/close, khóa cuộn nền, đóng khi chọn link; dùng ở admin mobile |
| Dropdown | `components/ui/select.tsx` | Native select cho bộ lọc; tương thích bàn phím và mobile, không có custom menu chưa dùng |
| Badge | `components/shared/status-badge.tsx` | Nhãn chữ + màu, h-fit; không giãn thành khối trên flex |
| Tabs điều hướng | `components/shared/section-nav.tsx` | Link route với aria-current; dùng nav, không giả lập ARIA tablist cho điều hướng trang |
| Breadcrumb | `components/shared/breadcrumbs.tsx` | Nav/ol/li, current page, tên dài wrap |
| ProductCard / Price | `components/catalog/{product-card,price}.tsx` | Giá định dạng Intl, ảnh/tiêu đề đều có link; heading level phù hợp ngữ cảnh |
| ProductGallery | `components/catalog/product-gallery.tsx` | Ảnh từ images[] thật, button thumbnail aria-pressed; ảnh trống/lỗi có fallback |
| QuantitySelector | `components/ui/quantity-selector.tsx` | Tăng/giảm và nhập số bằng bàn phím, 1–min(stock,99), nút giới hạn disabled |
| Skeleton / Loading | `components/ui/skeleton.tsx`, `app/(store)/loading.tsx` | aria-busy/status ở container; skeleton aria-hidden |
| Empty / Error | `components/shared/empty-state.tsx`, `app/(store)/error.tsx` | Hướng dẫn bước tiếp theo; lỗi kết nối khác trạng thái dữ liệu trống |
| Toast | Sonner tại root layout | Thêm giỏ, lưu, đăng xuất lỗi; xóa giỏ có hoàn tác |
| Summary | `components/cart/order-summary.tsx` | Dùng chung giỏ/checkout; giá dự kiến, phí đúng quy tắc server hiện tại |

## Interaction và accessibility

- Skip link, main landmark, visible focus 2px và offset; không header sticky che nội dung.
- Native form controls, nhãn nút icon, decorative icons ẩn khỏi accessibility tree. Không chặn paste hoặc password managers.
- Error inline, focus trường đầu sai qua RHF; lỗi đặt hàng được focus khi server/network thất bại.
- Mọi trạng thái async có disabled/text phản hồi; ConfirmDialog có spinner. Không autoplay/scroll animation. Reduced motion tắt animation/transition toàn ứng dụng; biểu đồ không animate.
- Giá/dates dùng Intl, ngày giờ đơn hàng dùng timezone Asia/Bangkok để tránh khác biệt server/client.
- `clientRequest` xử lý lỗi mạng/API/JSON; checkout giữ khóa idempotency cho cùng payload qua retry/remount trong cùng tab. Server vẫn kiểm tra giá/kho và ownership.

## Ranh giới dữ liệu

Không thay đổi schema, document structure, API, database client hay order lifecycle. Không thêm payment gateway hoặc phương thức giao hàng. Không dùng mock data trong UI. ProductImage chỉ hiển thị URL có trong dữ liệu; thiếu ảnh hiển thị trạng thái trung tính.
