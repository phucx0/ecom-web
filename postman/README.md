# Postman — Retail Shop

Import hai file vào Postman:

- [Retail Shop.postman_collection.json](<Retail Shop.postman_collection.json>)
- [Retail Shop Local.postman_environment.json](<Retail Shop Local.postman_environment.json>)

Collection bám theo các route đang triển khai trong `app/api`, gồm public catalog, authentication, profile, orders, admin CRUD, users và database/backup. Không có request cho endpoint reports chưa được triển khai.

## Chuẩn bị

1. Cấu hình `.env.local`, khởi tạo CouchDB bằng `npm.cmd run db:init`, rồi chạy ứng dụng bằng `npm.cmd run dev`.
2. Muốn dùng sản phẩm và khách hàng demo: đặt `SEED_CUSTOMER_PASSWORD` rồi chạy `npm.cmd run db:seed` theo README gốc. Tạo admin riêng bằng `npm.cmd run admin:init`.
3. Chọn environment **Retail Shop Local**. Điền `customer_password` bằng mật khẩu đã dùng khi seed và `admin_password` bằng mật khẩu admin. Sửa email nếu dùng tài khoản khác. Các mật khẩu trong file mẫu được để trống.
4. `base_url` mặc định là `http://localhost:3000`, không có dấu `/` cuối. Khi chạy production, dùng HTTPS để cookie `Secure` được gửi.

Ứng dụng xác thực bằng cookie `retail_session`. Giữ cookie jar của Postman được bật; không cần Bearer token hay credentials CouchDB. Dùng cùng hostname cho mọi request. Đăng nhập admin sẽ thay session customer và ngược lại.

## Các luồng chạy

Gửi từng request hoặc chọn đúng các request cần chạy trong Runner. **Không chạy toàn bộ collection một lượt**: hủy đơn và giao hàng là hai nhánh khác nhau, đăng xuất làm mất session, còn restore cần chọn file.

### Public và customer

1. Gửi **Health**, danh mục, sản phẩm và chi tiết sản phẩm trong folder `01`.
2. Trong folder `02`, dùng **Đăng nhập customer** với tài khoản đã có. Nếu muốn **Đăng ký customer**, đổi `customer_email` sang email mới và đặt mật khẩu ít nhất 10 ký tự, gồm chữ hoa, chữ thường, số; tối đa 72 byte UTF-8.
3. Gửi **Tài khoản đang đăng nhập** hoặc **Cập nhật hồ sơ** nếu cần. Chưa chạy **Đăng xuất** khi còn thao tác với đơn hàng.
4. Trong folder `03`, gửi **Tạo đơn COD**. Script lưu `order_id`, `order_rev` và giữ nguyên `idempotency_key`. Gửi lại cùng request trả cùng đơn, HTTP 200 với `meta.replayed=true`; lần tạo mới trả 201.
5. Xóa giá trị `idempotency_key` ở **Collection → Variables** để request tự sinh key mới cho đơn tiếp theo. Sản phẩm mặc định là `product:demo-notebook`; nếu không seed, sửa `checkout_product_slug` rồi gọi chi tiết sản phẩm để lấy `checkout_product_id`.
6. Xem danh sách/chi tiết đơn. Chọn **Customer hủy đơn** khi đơn đang `pending`/`confirmed`, hoặc giữ đơn để chạy luồng admin giao hàng. Tạo đơn làm giảm tồn kho; hủy đơn hoàn tồn kho.

### Admin

1. Gửi **Đăng nhập admin** và **Kiểm tra quyền admin** trong folder `04`.
2. Với một đơn `pending` chưa hủy, gửi lần lượt **confirmed → packing → shipping → delivered**. Mỗi response lưu revision mới; request shipping có sẵn body đơn vị vận chuyển và mã theo dõi.
3. Folder `05`: tạo danh mục → cập nhật danh mục → tạo sản phẩm → cập nhật sản phẩm → xóa sản phẩm → xóa danh mục. Các biến `catalog_*` chỉ dành cho dữ liệu thử nghiệm, tách khỏi sản phẩm checkout. Các request tạo tự sinh slug mới.
4. Folder `06`: lấy danh sách → chi tiết tài khoản → cập nhật. `managed_user_id` mặc định lấy từ lần đăng nhập/đăng ký customer; có thể sửa trong Collection Variables. Request chi tiết lưu đủ `_rev`, tên, số điện thoại và trạng thái để cập nhật. Muốn khóa tài khoản, sửa `account_status` thành `disabled` trong body.

PATCH danh mục/sản phẩm yêu cầu đủ các trường như body mẫu; DELETE truyền revision qua query `rev`. Nếu gặp `409 CONFLICT`, đọc lại danh sách admin để cập nhật revision của sản phẩm/danh mục đang chọn, hoặc đọc chi tiết đơn/tài khoản rồi gửi lại. Không thay `_rev` bằng giá trị đoán.

### Backup và restore

1. Đăng nhập admin rồi gửi **Tổng quan database**, **Danh sách backup** hoặc **Tạo backup**. Script lưu `backup_id` của bản được tạo hoặc bản hợp lệ mới nhất từ danh sách.
2. Gửi **Tải backup JSON**, dùng **Save Response → Save to a file** hoặc **Send and Download** để lưu file. File chứa dữ liệu nhạy cảm; không commit vào repository.
3. Mở request **Restore backup**, chọn file JSON ở **Body → form-data → file**. File tối đa 25 MiB; để Postman tự tạo header multipart.
4. Đặt `restore_database` trong Collection Variables thành tên mới, ví dụ `retail_shop_restore_postman_demo`. Tên phải khớp `retail_shop_restore_[a-z0-9_]{3,40}`, chưa tồn tại và khác database đang dùng. Giữ `confirmation=RESTORE` rồi gửi. Restore tạo database mới và không tự xóa database này.

## Biến và kiểm tra response

- **Environment**: địa chỉ ứng dụng, email, mật khẩu và thông tin customer. Chỉ điền mật khẩu trong Postman; không xuất và commit environment đã chứa mật khẩu thật.
- **Collection Variables**: các ID, `_rev`, slug thử nghiệm, key tạo đơn và database restore. Script cập nhật các biến này sau response thành công; tránh tạo biến environment cùng tên vì environment có độ ưu tiên cao hơn.
- Mỗi request có kiểm tra status thành công; các request quan trọng còn kiểm tra role, kết nối CouchDB, replay hoặc cấu trúc dữ liệu. Request lỗi sẽ hiện test thất bại để bạn đọc response; các request này được thiết kế cho luồng thành công.
- `400`: kiểm tra body/key/file; `401`: đăng nhập lại; `403`: kiểm tra role hoặc header Origin tự thêm; `409`: revision cũ, slug trùng, chuyển trạng thái sai hoặc database đích tồn tại; `503`: kiểm tra kết nối CouchDB.

Các thao tác trong collection chưa được chạy vào database khi tạo file. Collection không chứa mật khẩu, session hoặc bản backup thật.
