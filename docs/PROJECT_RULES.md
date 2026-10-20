# Retail Shop — Quy tắc triển khai cho Codex

## Mục tiêu
Website bán lẻ minh họa hoàn chỉnh phục vụ đề tài quản trị CouchDB bằng Fauxton. Stack: Next.js App Router, TypeScript, Tailwind CSS, CouchDB database `retail_shop`.

## Nguyên tắc bắt buộc
1. Chỉ triển khai phase được người dùng chỉ định; không tự động chuyển phase.
2. Đầu mỗi phase: đọc tài liệu liên quan, kiểm tra code/schema hiện có, nêu rủi ro và kế hoạch ngắn.
3. Không xóa database, không xóa/ghi đè document mẫu, không reset môi trường, không thay đổi schema đã chốt nếu chưa được duyệt.
4. Credentials chỉ ở server-side environment; không commit `.env.local`, không lộ mật khẩu trên client.
5. Không dùng mock data làm dữ liệu sản phẩm cuối cùng; dữ liệu chính phải từ CouchDB.
6. Không tuyên bố hoàn thành khi chưa chạy kiểm thử phù hợp. Báo cáo rõ phần chưa thể xác minh.
7. Kết thúc mỗi phase: liệt kê file thay đổi, API/chức năng đã làm, lệnh kiểm thử, kết quả, vấn đề còn lại; DỪNG và chờ duyệt.
8. Ưu tiên tương thích dữ liệu hiện có: `user`, `category`, `product`, `order`, `delivery`, indexes và `_design/reports`.
9. Kiểm tra quyền tại server cho mọi API Admin; mật khẩu phải hash; session cookie HttpOnly, Secure ở production.
10. CouchDB dùng `_rev` để xử lý conflict; không giả định giao dịch ACID nhiều document.


## UI library và tái sử dụng component
1. Sử dụng **shadcn/ui** làm thư viện component ưu tiên; Tailwind CSS cho styling và Lucide React cho icon.
2. Ưu tiên component có sẵn trước khi viết mới: Button, Input, Card, Dialog, Sheet, Select, Table, Badge, Skeleton, AlertDialog, Form.
3. Dùng React Hook Form + Zod cho form/validation, Sonner cho toast; TanStack Table cho bảng cần lọc/sắp xếp/phân trang; Recharts cho biểu đồ khi cần.
4. Chỉ cài component và package thật sự sử dụng, tránh framework UI thứ hai và dependency dư thừa.
5. Tái sử dụng các component nghiệp vụ: ProductCard, ProductForm, StatusBadge, PageHeader, DataTable, ConfirmDialog; tránh lặp code giữa các trang.
6. Giữ giao diện tiếng Việt, responsive, nhất quán, hỗ trợ loading/empty/error, nhãn form, điều hướng bàn phím và độ tương phản phù hợp.
7. UI không được thay thế kiểm tra quyền/validation ở server; không tự thêm animation phức tạp làm chậm triển khai.
8. Khi nghiệm thu phase có UI, kiểm tra component tái sử dụng, tính responsive, lỗi form và build.
