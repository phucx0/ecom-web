# Retail Shop — Phase-by-phase Tasks

> Trạng thái: **PHASE 0–5 ĐÃ TRIỂN KHAI, CHỜ NGHIỆM THU PHASE 5**. Các phase sau chưa được bắt đầu.

## Phase 0 — Audit và đặc tả

- [x] P0-01 Kiểm tra 5 loại document đang có trong `retail_shop`.
- [x] P0-02 Kiểm tra Mango Index, Views `_design/reports` và dữ liệu trả về.
- [x] P0-03 Chốt JSON schema, ID, validation và trường bắt buộc.
- [x] P0-04 Chốt trạng thái đơn: pending → confirmed → packing → shipping → delivered; cancelled và failed.
- [x] P0-05 Chốt quy tắc tồn kho, hủy đơn, thất bại vận chuyển, retry và idempotency.
- [x] P0-06 Viết API contract, ma trận phân quyền, kiến trúc và kế hoạch kiểm thử.
      **Nghiệm thu:** tài liệu schema/API/luồng nghiệp vụ rõ ràng, không thay đổi dữ liệu đang chạy.

## Phase 1 — Next.js và CouchDB

- [x] P1-01 Khởi tạo Next.js App Router, TypeScript, Tailwind, ESLint.
- [x] P1-02 Tạo `.env.example`, hướng dẫn cấu hình `.env.local`.
- [x] P1-03 Tạo CouchDB client phía server, timeout và xử lý lỗi.
- [x] P1-04 Viết helper đọc/ghi document, Mango query, conflict `_rev`.
- [x] P1-05 Tạo `GET /api/health` kiểm tra `retail_shop`.
- [x] P1-06 Layout cơ bản, cấu trúc route, error/loading.
- [x] P1-07 Cấu hình shadcn/ui, Lucide React và các component nền tảng thực sự cần dùng.
      **Nghiệm thu:** API health chạy trên máy người dùng, build thành công, credentials không ra client.

## Phase 2 — Authentication và phân quyền

- [x] P2-01 Thiết kế schema user tương thích `user:U001` mẫu; tách tài khoản demo chưa có hash.
- [x] P2-02 Đăng ký với email duy nhất, validation.
- [x] P2-03 Đăng nhập, đăng xuất, hash password, session HttpOnly.
- [x] P2-04 Kiểm tra customer/admin trên mọi protected API.
- [x] P2-05 Giao diện login/register/account.
- [x] P2-06 Script khởi tạo Admin an toàn, không hardcode mật khẩu.
- [x] P2-07 Test sai mật khẩu, quyền truy cập và session hết hạn.
      **Nghiệm thu:** user/customer không gọi được API Admin, password không plaintext.

## Phase 3 — Danh mục và sản phẩm

- [x] P3-01 API đọc danh sách/chi tiết sản phẩm từ CouchDB.
- [x] P3-02 API quản trị CRUD sản phẩm và validation.
- [x] P3-03 API quản trị CRUD danh mục và validation.
- [x] P3-04 Trang chủ, listing, search, filter theo category.
- [x] P3-05 Trang chi tiết sản phẩm theo slug.
- [x] P3-06 Admin UI quản lý sản phẩm/danh mục.
- [x] P3-07 Kiểm thử CRUD, duplicate slug, inactive và conflict.
      **Nghiệm thu:** thay đổi trên Admin hiện trên website và Fauxton.

## Phase 4 — Giỏ hàng và checkout COD

- [x] P4-01 Giỏ hàng client-side, lưu bền vững phù hợp.
- [x] P4-02 Thêm/xóa/sửa số lượng và kiểm tra input.
- [x] P4-03 Trang checkout, địa chỉ và phương thức COD.
- [x] P4-04 API tạo order với snapshot tên/giá/số lượng.
- [x] P4-05 Server tính lại giá/tổng tiền và kiểm tra tồn kho.
- [x] P4-06 Chốt chiến lược giữ/trừ tồn kho, xử lý conflict và bù trừ khi lỗi nhiều document.
- [x] P4-07 Idempotency tránh tạo đơn trùng do gửi lại.
- [x] P4-08 Trang xác nhận đặt hàng, test thiếu hàng.
      **Nghiệm thu:** đặt hàng thật, tổng tiền chính xác, không tạo đơn trùng, lỗi được xử lý minh bạch.

## Phase 5 — Đơn hàng và giao hàng

- [x] P5-01 API danh sách/chi tiết order theo user và Admin.
- [x] P5-02 Trang lịch sử đơn và theo dõi đơn.
- [x] P5-03 Admin lọc, xem, xác nhận, đóng gói order.
- [x] P5-04 Validate state transition ở server.
- [x] P5-05 Tạo delivery, tracking code, carrier.
- [x] P5-06 Ghi order status_history và delivery history.
- [x] P5-07 Xử lý hủy đơn, giao thất bại và quy tắc hoàn kho.
- [x] P5-08 Kiểm thử từ pending tới delivered và quyền xem đơn.
      **Nghiệm thu:** lifecycle hoạt động, lịch sử nhất quán, khách không xem đơn người khác.

## Phase 5.5 — Hoàn thiện cấu trúc trang và trải nghiệm nghiệp vụ

> Trạng thái: CHƯA TRIỂN KHAI. Chỉ thực hiện sau khi người dùng giao rõ.
>
> Mục tiêu: Audit toàn bộ website sau Phase 5, bổ sung các trang còn thiếu, tách các màn hình đang gộp quá nhiều chức năng và chuẩn hóa trải nghiệm khách hàng/Admin. Ưu tiên tái sử dụng API và nghiệp vụ đã xây dựng, không viết lại hệ thống.

### A. Audit cấu trúc website

- [x] P5.5-01 Kiểm tra toàn bộ routes, pages, layouts, components và navigation hiện tại.
- [x] P5.5-02 Lập bảng đối chiếu giữa các trang hiện có và danh sách trang mục tiêu.
- [x] P5.5-03 Phân loại trang: đã hoàn chỉnh, thiếu, đang gộp chức năng, cần cải thiện.
- [x] P5.5-04 Kiểm tra luồng điều hướng từ danh sách → chi tiết → thao tác → quay lại.
- [x] P5.5-05 Kiểm tra các trang có API nhưng chưa có giao diện tương ứng.
- [x] P5.5-06 Xác định component có thể tái sử dụng, tránh tạo code trùng lặp.

### B. Hoàn thiện khu vực khách hàng

- [x] P5.5-07 Chuẩn hóa trang danh sách sản phẩm với tìm kiếm, bộ lọc, sắp xếp và phân trang phù hợp.
- [x] P5.5-08 Hoàn thiện trang chi tiết sản phẩm: hình ảnh, mô tả, giá, tồn kho, số lượng và thêm giỏ hàng.
- [x] P5.5-09 Hoàn thiện trang giỏ hàng và checkout thành các bước rõ ràng.
- [x] P5.5-10 Hoàn thiện trang xác nhận đặt hàng thành công, có mã đơn và liên kết xem chi tiết.
- [x] P5.5-11 Tạo hoặc hoàn thiện layout tài khoản khách hàng với navigation riêng.
- [x] P5.5-12 Tạo trang thông tin cá nhân, chỉ cho phép cập nhật những trường được hỗ trợ an toàn.
- [x] P5.5-13 Tách trang danh sách đơn hàng `/account/orders`.
- [x] P5.5-14 Tạo trang chi tiết đơn hàng `/account/orders/[id]`.
- [x] P5.5-15 Hiển thị tiến trình xử lý đơn, lịch sử trạng thái và thông tin vận chuyển.
- [x] P5.5-16 Cho phép hủy đơn ở trạng thái hợp lệ, có xác nhận trước khi thực hiện.

### C. Hoàn thiện khu vực Admin

- [x] P5.5-17 Chuẩn hóa Admin Layout: sidebar, header, breadcrumb, menu và trạng thái active.
- [x] P5.5-18 Hoàn thiện trang danh sách sản phẩm với bảng quản lý, bộ lọc và phân trang.
- [x] P5.5-19 Tách giao diện thêm sản phẩm và chỉnh sửa sản phẩm, dùng chung ProductForm.
- [x] P5.5-20 Hoàn thiện trang danh mục, có danh sách và form tạo/sửa phù hợp.
- [x] P5.5-21 Tạo trang danh sách đơn hàng `/admin/orders`, chỉ hiển thị thông tin tóm tắt.
- [x] P5.5-22 Tạo trang chi tiết đơn hàng `/admin/orders/[id]` với các section rõ ràng.
- [x] P5.5-23 Chuyển các thao tác xác nhận, đóng gói, giao hàng và hủy đơn vào khu vực xử lý phù hợp.
- [x] P5.5-24 Tạo trang danh sách giao hàng `/admin/deliveries`.
- [x] P5.5-25 Tạo trang chi tiết giao hàng `/admin/deliveries/[id]` với carrier, tracking và lịch sử.
- [x] P5.5-26 Tạo trang danh sách khách hàng `/admin/customers` dựa trên document `user`.
- [x] P5.5-27 Tạo trang chi tiết khách hàng `/admin/customers/[id]` với thông tin được phép xem và lịch sử đơn hàng.
- [x] P5.5-28 Kiểm tra liên kết điều hướng giữa đơn hàng, khách hàng và vận chuyển.

### D. Chuẩn hóa UI/UX và component

- [x] P5.5-29 Xây dựng hoặc tái sử dụng PageHeader, StatusBadge, DataTable, EmptyState, ConfirmDialog, DetailSection và OrderTimeline.
- [x] P5.5-30 Ưu tiên shadcn/ui, Tailwind CSS, Lucide React.
- [x] P5.5-31 Dùng TanStack Table cho bảng có nhu cầu lọc, sắp xếp, phân trang nâng cao.
- [x] P5.5-32 Chuẩn hóa typography, spacing, màu sắc, badge, button và form.
- [x] P5.5-33 Bổ sung loading skeleton, empty state, error state và thông báo Sonner.
- [x] P5.5-34 Kiểm tra responsive desktop, tablet và mobile.
- [x] P5.5-35 Bổ sung breadcrumb, nút quay lại và trạng thái active navigation.
- [x] P5.5-36 Đảm bảo các thao tác quan trọng có feedback và xác nhận khi cần.

### E. Kiểm thử và nghiệm thu

- [x] P5.5-37 Kiểm tra các route mới, refresh trang trực tiếp và xử lý 404.
- [x] P5.5-38 Kiểm tra quyền customer/admin và quyền sở hữu đơn hàng.
- [x] P5.5-39 Kiểm tra điều hướng danh sách → chi tiết → chỉnh sửa hoặc cập nhật → quay lại.
- [x] P5.5-40 Kiểm tra các API hiện có vẫn hoạt động và dữ liệu vẫn lấy từ CouchDB.
- [x] P5.5-41 Chạy lint, typecheck, build và sửa lỗi.
- [x] P5.5-42 Cập nhật bảng routes, tài liệu và checklist nghiệm thu.

**Điều kiện nghiệm thu:**

- Có các trang danh sách và chi tiết độc lập cho đơn hàng ở cả khách hàng và Admin.
- Có các trang quản lý và chi tiết phù hợp cho sản phẩm, giao hàng và khách hàng.
- Navigation giữa các trang hoạt động.
- Không còn trang quản lý chính bị nhồi toàn bộ nội dung nghiệp vụ vào một màn hình.
- Không phá vỡ các chức năng Phase 0–5.
- Không thay đổi schema CouchDB khi chưa được duyệt.
- UI nhất quán, responsive và tái sử dụng shadcn/ui.
- Có báo cáo các trang đã bổ sung, các trang đã sửa và kết quả kiểm thử.
- Codex dừng sau Phase 5.5, không tự chuyển sang Phase 6.

## Phase 6 — Dashboard và hoàn thiện UI

- [x] P6-01 Dashboard tổng đơn, đơn đang xử lý, đang giao, đã giao.
- [x] P6-02 Thống kê doanh thu đơn hoàn tất qua Views hoặc truy vấn phù hợp.
- [x] P6-03 Lọc, phân trang, thông báo trạng thái.
- [x] P6-04 Responsive desktop/mobile.
- [x] P6-05 Loading, empty, error state.
- [x] P6-06 Kiểm tra accessibility cơ bản.
      **Nghiệm thu:** số liệu dashboard đối chiếu được với CouchDB.

## Phase 7 — QA, tài liệu, demo

- [ ] P7-01 Test API, validation và role access.
- [ ] P7-02 Test end-to-end mua hàng đến giao thành công.
- [ ] P7-03 Test lỗi mạng, hết hàng, retry, conflict.
- [ ] P7-04 Lint, typecheck, build và sửa lỗi.
- [ ] P7-05 README, `.env.example`, tài liệu API, setup.
- [ ] P7-06 Kịch bản demo, danh sách ảnh Fauxton cần chụp cho báo cáo.
- [ ] P7-07 Báo cáo nghiệm thu, giới hạn còn tồn tại.
      **Nghiệm thu:** app chạy được từ máy người dùng; checklist demo và báo cáo đầy đủ.

## Phase 8 — Quản trị hệ thống, Backup & Restore CouchDB

> **Trạng thái: CHƯA TRIỂN KHAI.**
>
> **Mục tiêu:** Bổ sung chức năng quản trị người dùng, thao tác trên cơ sở dữ liệu CouchDB và sao lưu/khôi phục dữ liệu phục vụ yêu cầu demo đồ án NoSQL.
>
> **Phạm vi:** Chỉ dành cho Admin. Ưu tiên tái sử dụng kiến trúc, API, authentication và UI components hiện có. Không làm thay đổi hoặc phá vỡ nghiệp vụ bán hàng đã triển khai.
>
> **Điều kiện bắt đầu:** Các Phase nghiệp vụ liên quan đã được nghiệm thu. Phase 8 chỉ được thực hiện khi người dùng giao rõ.

### A. Quản trị người dùng

- [x] P8-01 Audit chức năng quản trị người dùng hiện tại và xác định các phần còn thiếu.
- [x] P8-02 Xây dựng trang `/admin/users` hiển thị danh sách tài khoản.
- [x] P8-03 Tìm kiếm, lọc người dùng theo vai trò và trạng thái tài khoản.
- [x] P8-04 Xem chi tiết người dùng tại `/admin/users/[id]`.
- [x] P8-05 Cho phép Admin cập nhật thông tin hoặc trạng thái tài khoản theo quy tắc bảo mật.
- [x] P8-06 Kiểm tra phân quyền; không hiển thị password hash hoặc session token trên giao diện/API phản hồi.
- [x] P8-07 Ngăn Admin tự khóa tài khoản đang sử dụng hoặc vô hiệu hóa Admin cuối cùng.

### B. Quản trị dữ liệu CouchDB

- [x] P8-08 Tạo trang `/admin/database` hiển thị trạng thái kết nối và thông tin database `retail_shop`.
- [x] P8-09 Hiển thị số lượng document theo type: `user`, `category`, `product`, `order`, `delivery`.
- [x] P8-10 Hiển thị thông tin Mango Indexes và Design Document `_design/reports` phục vụ minh họa.
- [x] P8-11 Tạo giao diện quản trị dữ liệu có kiểm soát, hỗ trợ xem document theo type và ID.
- [x] P8-12 Hỗ trợ thêm, sửa và xóa document theo quyền và validation phù hợp.
- [x] P8-13 Kiểm tra `_rev` khi cập nhật/xóa document, xử lý conflict.
- [x] P8-14 Chặn thao tác trực tiếp gây mất nhất quán đơn hàng, tồn kho, giao hàng hoặc tài khoản.
- [x] P8-15 Không cho phép chỉnh sửa/xóa tùy ý Design Document, tài liệu bảo mật hoặc tài liệu hệ thống.

### C. Backup CouchDB

- [x] P8-16 Tạo trang `/admin/database/backups`.
- [x] P8-17 Thiết kế giao diện danh sách các bản backup.
- [x] P8-18 Xây dựng chức năng tạo bản sao lưu dữ liệu `retail_shop` ở phía server.
- [x] P8-19 Backup đầy đủ document, bao gồm Design Documents và attachments nếu có.
- [x] P8-20 Lưu metadata backup: tên file, thời gian tạo, dung lượng, phạm vi và trạng thái.
- [x] P8-21 Cho phép Admin tải bản backup về máy.
- [x] P8-22 Hiển thị thông báo thành công hoặc thất bại và nhật ký lỗi phù hợp.
- [x] P8-23 Không lưu thông tin đăng nhập CouchDB hoặc session token trong backup metadata.
- [x] P8-24 Kiểm thử backup với dữ liệu thật, kiểm tra nội dung và tính toàn vẹn của file.

### D. Restore CouchDB

- [x] P8-25 Thiết kế giao diện chọn file backup để khôi phục.
- [x] P8-26 Kiểm tra định dạng, kích thước, phiên bản và tính hợp lệ của backup.
- [x] P8-27 Chỉ cho phép khôi phục vào database thử nghiệm mới, ví dụ `retail_shop_restore_test`.
- [x] P8-28 Không ghi đè hoặc xóa database `retail_shop` hiện tại.
- [x] P8-29 Hiển thị cảnh báo, yêu cầu xác nhận trước khi restore.
- [x] P8-30 Thực hiện restore ở phía server, có kiểm soát quyền Admin.
- [x] P8-31 Kiểm tra số lượng document và nội dung sau restore.
- [x] P8-32 Ghi log thao tác backup/restore và kết quả kiểm thử.
- [x] P8-33 Kiểm thử quy trình backup → restore → xác minh dữ liệu.

### E. Bảo mật và kiểm thử

- [x] P8-34 Bảo vệ mọi API quản trị database bằng kiểm tra quyền Admin phía server.
- [x] P8-35 Không cho client truy cập trực tiếp CouchDB bằng tài khoản quản trị.
- [x] P8-36 Áp dụng giới hạn kích thước, chống path traversal và kiểm tra file upload.
- [x] P8-37 Bảo vệ thao tác nhạy cảm bằng xác nhận bổ sung và CSRF protection phù hợp.
- [x] P8-38 Kiểm tra việc tải file backup chỉ dành cho Admin được cấp quyền.
- [x] P8-39 Kiểm thử các trường hợp file lỗi, backup thiếu dữ liệu và restore thất bại.
- [x] P8-40 Chạy lint, typecheck, build và kiểm thử API.
- [x] P8-41 Cập nhật README và tài liệu hướng dẫn backup/restore trên Windows.

### Điều kiện nghiệm thu Phase 8

- Có trang quản trị người dùng với chức năng phù hợp.
- Có giao diện quản trị và kiểm tra dữ liệu CouchDB.
- Admin có thể tạo và tải backup của `retail_shop`.
- Có thể restore backup vào database thử nghiệm mà không ảnh hưởng database gốc.
- Backup có khả năng khôi phục dữ liệu thực tế, không chỉ xuất danh sách JSON đơn giản thiếu thông tin cần thiết.
- Phạm vi và giới hạn backup được ghi rõ, bao gồm cách xử lý attachments, revisions và dữ liệu thay đổi trong lúc sao lưu.
- Không lộ credentials hoặc session token. File backup chứa dữ liệu nhạy cảm phải được bảo vệ và chỉ Admin được phép truy cập.
- Không cho phép Customer truy cập API quản trị.
- Có bằng chứng kiểm thử backup và restore.
- Không phá vỡ chức năng Phase 0–7.
- Codex dừng sau Phase 8, chờ người dùng nghiệm thu.

### Quy tắc triển khai Phase 8

1. Codex phải đọc `PROJECT_RULES.md`, `TASKS.md` và `PHASE_PROMPT_TEMPLATE.md` trước khi thực hiện.
2. Audit mã nguồn và chức năng hiện tại trước khi tạo mới.
3. Không triển khai lại các chức năng đã tồn tại và hoạt động đúng.
4. Ưu tiên shadcn/ui, Tailwind CSS, Lucide React và các component dùng chung.
5. Không xây dựng API cho phép tùy ý sửa/xóa mọi document nếu có nguy cơ phá vỡ dữ liệu nghiệp vụ.
6. Không xóa, reset hoặc ghi đè database `retail_shop`.
7. Không tự động xóa database thử nghiệm hoặc các bản backup cũ.
8. Nếu thiếu thông tin hoặc gặp rủi ro mất dữ liệu, phải dừng và yêu cầu người dùng xác nhận.
9. Chỉ đánh dấu hoàn thành task đã được triển khai và kiểm thử.
10. Sau Phase 8, báo cáo kết quả và dừng chờ nghiệm thu.

## Quy tắc duyệt phase

- Codex chỉ được thực hiện phase hiện tại khi người dùng giao rõ.
- Khi xong phải gửi kết quả, lệnh test, file đã sửa, lỗi còn lại rồi dừng.
- Không được tự đánh dấu phase tiếp theo là bắt đầu.

## Yêu cầu xuyên suốt các Phase có giao diện

- [ ] Ưu tiên shadcn/ui, Tailwind CSS, Lucide React; không viết lại UI primitive sẵn có.
- [ ] Tái sử dụng component nghiệp vụ, form React Hook Form + Zod và Sonner khi phù hợp.
- [ ] Dùng TanStack Table / Recharts chỉ khi task cần bảng nâng cao / biểu đồ.
- [ ] Kiểm thử responsive, loading, empty, error và accessibility cơ bản.
