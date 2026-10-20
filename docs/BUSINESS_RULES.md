# Quy trình đơn hàng và giao hàng

## State machine

Luồng chuẩn: `pending -> confirmed -> packing -> shipping -> delivered`.

- `cancelled`: cho phép từ `pending`, `confirmed`; từ `packing` chỉ Admin và chỉ khi chưa bàn giao vận chuyển.
- `failed`: chỉ từ `shipping`, biểu thị giao thất bại. Có thể retry về `shipping` bằng một delivery attempt mới/được ghi history; quá giới hạn thì hủy và hoàn kho.
- `delivered`, `cancelled` là terminal. Mọi chuyển trạng thái phải được server kiểm tra và append `status_history` cùng timestamp.

## Tồn kho

- Server đọc lại product và tính giá; không tin giá/tổng từ client.
- Trừ stock khi chuyển `pending -> confirmed`, dùng `_rev` từng product.
- Nếu một cập nhật thất bại, hoàn tác các product đã trừ bằng `_rev` mới nhất; ghi nhận lỗi để đối soát. Không tuyên bố tính nguyên tử nhiều document.
- Hủy trước khi confirmed: không hoàn stock. Hủy sau confirmed hoặc giao thất bại kết thúc: hoàn đúng một lần.

## Retry và idempotency

- Tạo order yêu cầu `Idempotency-Key`; lưu khóa/quan hệ bằng ID xác định để cùng user + key trả lại cùng order.
- Retry conflict tối đa 3 lần với backoff và đọc `_rev` mới; không retry validation/authorization.
- Các thao tác chuyển trạng thái phải kiểm tra trạng thái hiện tại, nên gửi lại cùng lệnh không tạo history hoặc hoàn/trừ kho lần hai.
- Tracking code duy nhất theo kiểm tra server. Một order chỉ có một delivery đang hoạt động.
