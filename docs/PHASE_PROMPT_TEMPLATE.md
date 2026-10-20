# Prompt mẫu để giao Codex một phase

Hãy đọc `PROJECT_RULES.md` và `TASKS.md` trước.

Chỉ triển khai **Phase [N]**. Đầu tiên kiểm tra hiện trạng code, database và các điều kiện phụ thuộc của phase này; báo ngắn kế hoạch thực hiện. Sau đó thực hiện lần lượt từng task của Phase [N] trong TASKS.md, tự chạy kiểm thử cần thiết và sửa lỗi phát hiện được.

Không triển khai task thuộc phase khác, không xóa hay reset `retail_shop`, không làm thay đổi dữ liệu hiện có ngoài phạm vi đã được duyệt. Không dùng mock data thay cho kết nối CouchDB thật.

Khi kết thúc, cập nhật trạng thái các task đã thực sự nghiệm thu, liệt kê file đã sửa, kết quả kiểm thử, các giới hạn hoặc rủi ro còn lại. **DỪNG và chờ tôi xác nhận** trước khi chuyển sang phase kế tiếp.


Khi phase có giao diện, tuân thủ mục UI library trong `PROJECT_RULES.md`: ưu tiên shadcn/ui và component tái sử dụng; chỉ cài dependency khi thật sự cần, không tự xây lại UI primitives.
