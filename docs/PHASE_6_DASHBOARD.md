# Phase 6 — Dashboard

Dashboard quản trị tại `/admin` chỉ dành cho tài khoản `admin` và đọc dữ liệu trực tiếp từ database `retail_shop`.

## Nguồn số liệu

- KPI số đơn dùng View `_design/reports/orders_by_status?group=true`.
- Doanh thu theo ngày dùng View `_design/reports/revenue_by_day?group=true` và hỗ trợ `startkey`/`endkey`.
- Danh sách đơn gần đây dùng Mango query trên document `type = order`, sau đó áp dụng bộ lọc trạng thái và ngày.
- Dashboard không ghi hoặc thay đổi document CouchDB.

Ngày 2026-10-20, View trạng thái trả về 2 đơn `delivered`. View doanh thu không có dòng dữ liệu vì design document hiện chỉ tính đơn có đồng thời `status = delivered` và `payment_status = paid`; các đơn COD hiện tại vẫn mang `payment_status = unpaid`. Giao diện hiển thị cảnh báo này thay vì tự suy diễn doanh thu hoặc sửa schema.

## Giao diện và khả năng truy cập

- KPI responsive từ một đến bốn cột.
- Biểu đồ Recharts co giãn theo vùng chứa và có nhãn hỗ trợ.
- Form lọc có label; bảng có tiêu đề cột và thao tác có tên rõ ràng.
- Navigation có `aria-current`, focus-visible; vùng phân trang có nhãn.
- Có loading skeleton, empty state, error boundary và cảnh báo trạng thái doanh thu.
