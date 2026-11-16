# Hướng dẫn cài đặt và sử dụng CouchDB và website Retail Shop

Tài liệu hướng dẫn chạy dự án trên Windows bằng PowerShell, từ cài CouchDB đến mua hàng, quản trị và sao lưu dữ liệu. Thực hiện các bước cài đặt theo thứ tự; các lệnh chạy tại thư mục gốc dự án, nơi có `package.json`.

## 1. Chuẩn bị môi trường

| Thành phần | Yêu cầu / mục đích |
|---|---|
| Node.js và npm | Dùng Node.js 24.x để phù hợp cả website và bộ kiểm thử hiện tại |
| Apache CouchDB | Dùng CouchDB 3.x để lưu dữ liệu JSON |
| Trình duyệt | Chrome, Edge hoặc Firefox để mở website và Fauxton |
| Mã nguồn dự án | Đã tải hoặc sao chép về máy |

Next.js trong dự án yêu cầu Node.js từ 20.9, nhưng Vitest hiện tại yêu cầu `^22.12.0 || ^24.0.0 || >=26.0.0`. Vì vậy, hướng dẫn này dùng Node.js 24.x cho toàn bộ thao tác. Có thể tải bộ cài tại [trang Node.js](https://nodejs.org/en/download).

Sau khi cài Node.js, mở lại PowerShell và kiểm tra:

```powershell
node --version
npm.cmd --version

# Thay đường dẫn nếu lưu mã nguồn ở vị trí khác.
Set-Location 'D:\HUIT\NoSQL\Web'
```

Các ví dụ dùng `npm.cmd` để tránh lỗi PowerShell chặn thực thi `npm.ps1`.

## 2. Cài đặt CouchDB

### 2.1. Cài bằng bộ cài Windows

1. Vào [trang tải Apache CouchDB](https://couchdb.apache.org/#download), chọn bộ cài Windows của nhánh 3.x.
2. Chạy bộ cài; chọn thư mục không có khoảng trắng, ví dụ `C:\CouchDB`.
3. Nếu bộ cài có tùy chọn cài dưới dạng Windows Service, chọn để CouchDB chạy cùng Windows.
4. Tạo tài khoản quản trị CouchDB khi được yêu cầu và ghi nhớ thông tin đăng nhập.
5. Hoàn tất cài đặt, khởi động lại máy nếu bộ cài yêu cầu.

Tham khảo [hướng dẫn cài trên Windows của Apache](https://docs.couchdb.org/en/stable/install/windows.html).

### 2.2. Hoàn tất thiết lập một node

1. Mở [Fauxton Setup](http://127.0.0.1:5984/_utils/#setup).
2. Chọn **Single-Node Setup** nếu hệ thống chưa được cấu hình.
3. Thiết lập hoặc xác nhận tài khoản quản trị CouchDB.
4. Với môi trường local, dùng địa chỉ lắng nghe `127.0.0.1` và cổng `5984`.
5. Hoàn tất thiết lập, sau đó mở [Fauxton](http://127.0.0.1:5984/_utils/).

Fauxton là giao diện quản trị đi kèm CouchDB. Thiết lập một node tạo các database hệ thống cần thiết. Xem [Single Node Setup](https://docs.couchdb.org/en/stable/setup/single-node.html).

### 2.3. Kiểm tra CouchDB đã chạy

```powershell
Test-NetConnection 127.0.0.1 -Port 5984
Invoke-RestMethod -Uri 'http://127.0.0.1:5984/' -Method Get
```

`TcpTestSucceeded` phải là `True`. Lệnh thứ hai thường trả thông tin có `couchdb` và `version`; nếu máy yêu cầu xác thực, đăng nhập qua Fauxton để kiểm tra tiếp.

Nếu không kết nối được, mở **Services** từ Start hoặc chạy `services.msc`, tìm dịch vụ CouchDB và kiểm tra trạng thái. Với bản cài không dùng service, cần khởi động CouchDB theo cách đã chọn khi cài.

## 3. Cài đặt website và cấu hình kết nối

### 3.1. Cài thư viện

Tại thư mục gốc dự án:

```powershell
npm.cmd ci
```

Lệnh này cài các phiên bản theo `package-lock.json`. Nếu bản mã nguồn được cung cấp không có lockfile, dùng `npm.cmd install`.

### 3.2. Tạo file cấu hình

Chỉ sao chép file mẫu khi chưa có `.env.local`:

```powershell
if (-not (Test-Path -LiteralPath '.env.local')) {
    Copy-Item -LiteralPath '.env.example' -Destination '.env.local'
}
```

Mở `.env.local` trong trình soạn thảo. Cấu hình các giá trị sau; những chuỗi `THAY_...` phải được thay bằng giá trị riêng của bạn:

```dotenv
COUCHDB_URL=http://127.0.0.1:5984
COUCHDB_DATABASE=retail_shop
COUCHDB_USERNAME=THAY_TEN_QUAN_TRI_COUCHDB
COUCHDB_PASSWORD=THAY_MAT_KHAU_COUCHDB
COUCHDB_TIMEOUT_MS=5000

SESSION_SECRET=THAY_CHUOI_NGAU_NHIEN_IT_NHAT_32_KY_TU
SESSION_TTL_SECONDS=28800

ADMIN_EMAIL=admin@example.com
ADMIN_NAME="Quản trị viên"
ADMIN_PASSWORD=THAY_MAT_KHAU_ADMIN_WEBSITE
```

| Biến | Cách điền |
|---|---|
| `COUCHDB_URL` | Địa chỉ server CouchDB, không thêm tên database hay `/_utils/` |
| `COUCHDB_DATABASE` | Tên database nghiệp vụ, mặc định `retail_shop` |
| `COUCHDB_USERNAME`, `COUCHDB_PASSWORD` | Tài khoản CouchDB đã tạo ở bước 2, có quyền tạo database và design document |
| `COUCHDB_TIMEOUT_MS` | Thời gian chờ kết nối, mặc định 5.000 mili giây |
| `SESSION_SECRET` | Chuỗi bí mật ngẫu nhiên ít nhất 32 ký tự để ký phiên đăng nhập |
| `SESSION_TTL_SECONDS` | Thời hạn phiên đăng nhập, mặc định 28.800 giây = 8 giờ |
| `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` | Thông tin tạo Admin website lần đầu; chọn mật khẩu riêng ít nhất 12 ký tự |

Sinh `SESSION_SECRET` bằng lệnh sau rồi dán kết quả vào `.env.local`:

```powershell
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

Thông tin CouchDB và `SESSION_SECRET` chỉ dùng phía server; không thêm tiền tố `NEXT_PUBLIC_`. Giữ `.env.local` ở máy của bạn, không commit vào Git. Để các lệnh Node và Next.js đọc cấu hình nhất quán, nên chọn mật khẩu local không chứa ký tự `$`; Next.js có cơ chế mở rộng biến khi gặp ký tự này. Giá trị chứa `#` cần được đặt trong dấu nháy.

### 3.3. Phân biệt các tài khoản

| Tài khoản | Đăng nhập ở đâu? | Dùng để làm gì? |
|---|---|---|
| Quản trị CouchDB | Fauxton, cổng `5984` | Quản trị server, database, index và document |
| Admin website | `/login` trên website, rồi vào `/admin` | Quản lý sản phẩm, danh mục, đơn hàng, tài khoản và backup |
| Khách hàng website | `/register` hoặc `/login` | Mua hàng, xem và hủy đơn theo quyền được cấp |

Tài khoản CouchDB không tự trở thành Admin website. Các tài khoản website được lưu dưới dạng document `type: "user"` trong `retail_shop`, có mật khẩu được băm.

## 4. Khởi tạo dữ liệu và Admin website

### 4.1. Tạo database, index và view

```powershell
npm.cmd run db:init
```

Lệnh này tự đọc `.env.local`, tạo database nếu chưa tồn tại, bổ sung 8 Mango index và `_design/reports` với hai view `orders_by_status`, `revenue_by_day`. Không cần tạo bảng hay chạy SQL.

Sau khi hoàn tất, vào Fauxton, làm mới danh sách database và mở `retail_shop`. Database mới chưa có dữ liệu bán hàng cho đến khi seed hoặc thêm dữ liệu qua website.

### 4.2. Nạp dữ liệu mẫu để trải nghiệm

Chọn một mật khẩu demo ít nhất 10 ký tự, gồm chữ hoa, chữ thường, chữ số và tối đa 72 byte UTF-8. Thay giá trị trong ví dụ trước khi chạy:

```powershell
$env:SEED_CUSTOMER_PASSWORD = 'ThayMatKhauDemo2026!'
npm.cmd run db:seed
Remove-Item Env:SEED_CUSTOMER_PASSWORD
```

Trên database trống, bộ mẫu tạo 23 document nghiệp vụ:

| Loại | Số lượng | Nội dung |
|---|---:|---|
| `user` | 2 | `an.demo@example.com`, `binh.demo@example.com`, vai trò customer |
| `category` | 3 | Các danh mục hàng hóa mẫu |
| `product` | 6 | Bao gồm cả sản phẩm hết hàng và ngừng bán |
| `order` | 8 | Các trạng thái đơn hàng để thử nghiệm |
| `delivery` | 4 | Các trường hợp giao hàng mẫu |

Hai khách hàng demo dùng mật khẩu bạn vừa đặt. Tài khoản Admin được tạo riêng ở bước tiếp theo. Có thể dùng `npm.cmd run db:setup` thay cho cả `db:init` và `db:seed` khi đã đặt `SEED_CUSTOMER_PASSWORD`.

Chạy lại seed sẽ bỏ qua ID đã có hoặc đã xóa; không reset database, không đổi mật khẩu khách hàng đã tồn tại và không trừ kho thêm. Nếu cần xử lý dữ liệu đã có, xem mô tả trong [README](../README.md) và [schema CouchDB](COUCHDB_SCHEMA.md).

### 4.3. Tạo Admin website

Kiểm tra đã thay `ADMIN_EMAIL`, `ADMIN_NAME`, `ADMIN_PASSWORD` trong `.env.local`, sau đó chạy:

```powershell
node --env-file=.env.local scripts/init-admin.mjs
```

Kết quả mong đợi: `Đã tạo tài khoản Admin an toàn. Không ghi mật khẩu ra log.`

**Lưu ý về script hiện tại:** `npm.cmd run admin:init` chỉ chạy `node scripts/init-admin.mjs`, không tự nạp `.env.local`. Lệnh có `--env-file` ở trên nạp cấu hình đầy đủ. Nếu dùng `npm.cmd run admin:init`, cần tự đặt toàn bộ biến CouchDB và Admin trong shell trước.

Script chỉ tạo mới, không ghi đè tài khoản có cùng email và không dùng để đổi mật khẩu. Sau khi tạo thành công, có thể xóa dòng `ADMIN_PASSWORD` khỏi `.env.local`; website không cần biến này để đăng nhập thông thường.

## 5. Khởi chạy và dừng website

### 5.1. Chạy để học tập và phát triển

```powershell
npm.cmd run dev
```

Giữ cửa sổ PowerShell này mở. Khi terminal báo sẵn sàng, mở [website Retail Shop](http://localhost:3000). Nếu cổng `3000` bận, đọc địa chỉ thực tế trong terminal hoặc chọn cổng khác:

```powershell
npm.cmd run dev -- --port 3001
```

Kiểm tra kết nối database tại [API health](http://localhost:3000/api/health), hoặc mở PowerShell khác và chạy:

```powershell
Invoke-RestMethod -Uri 'http://localhost:3000/api/health' -Method Get
```

Khi thành công, API trả nội dung tương đương:

```json
{
  "status": "ok",
  "database": "retail_shop",
  "details": { "connected": true }
}
```

Nếu dùng cổng `3001`, thay cổng trong các URL kiểm tra. Nhấn **Ctrl+C** ở cửa sổ chạy website để dừng. Thay cấu hình `.env.local` thì dừng và chạy lại website.

### 5.2. Chạy bản build

```powershell
npm.cmd run build
npm.cmd run start
```

Chỉ chạy `start` khi `build` thành công. Khi triển khai bản production, cấu hình HTTPS vì cookie phiên đăng nhập được đặt `Secure` trong chế độ này. Để thử luồng đăng nhập local, dùng `npm.cmd run dev`.

Website cần Node.js server để xử lý API, phiên đăng nhập và CouchDB. Máy chủ cần lưu bền vững các thư mục `uploads/products/` và `.data/backups/`.

## 6. Sử dụng CouchDB qua Fauxton

### 6.1. Xem database và document

1. Mở [Fauxton](http://127.0.0.1:5984/_utils/), đăng nhập bằng tài khoản CouchDB.
2. Chọn database `retail_shop`.
3. Mở **All Documents**, chọn một document để xem JSON.
4. Quan sát `_id` là định danh, `_rev` là revision hiện tại, `type` phân loại dữ liệu nghiệp vụ.

Ví dụ ID sản phẩm mẫu là `product:demo-notebook`. CouchDB lưu các loại document trong cùng database; quan hệ được biểu diễn bằng các trường như `category_id`, `user_id`, `order_id`. Xem [COUCHDB_SCHEMA.md](COUCHDB_SCHEMA.md) để biết trường bắt buộc.

Nên cập nhật dữ liệu nghiệp vụ qua website để áp dụng kiểm tra dữ liệu, tồn kho và trạng thái đơn hàng. Khi thực hành sửa/xóa JSON trực tiếp trong Fauxton, dùng database thử nghiệm và giữ đúng `_rev`; sửa trực tiếp có thể bỏ qua quy tắc nghiệp vụ của website.

### 6.2. Tìm document bằng Mango Query

Trong database, mở **Mango Query**, nhập truy vấn rồi thực thi. Ví dụ tìm sản phẩm đang bán:

```json
{
  "selector": {
    "type": "product",
    "is_active": true
  },
  "fields": ["_id", "name", "price", "stock", "is_active"],
  "limit": 20
}
```

Ví dụ tìm đơn chờ xác nhận:

```json
{
  "selector": {
    "type": "order",
    "status": "pending"
  },
  "fields": ["_id", "customer", "status", "total"],
  "limit": 20
}
```

`selector` xác định điều kiện; `fields` chọn trường trả về; `limit` giới hạn số kết quả. Xem [tài liệu Mango Query](https://docs.couchdb.org/en/stable/api/database/find.html).

### 6.3. Xem index và thống kê bằng view

Các index được định nghĩa trong [database/indexes.json](../database/indexes.json). Mở **Mango Indexes** trong Fauxton để đối chiếu sau khi chạy `db:init`.

Trong phần **Design Documents**, mở `_design/reports` và chọn view, hoặc mở các địa chỉ sau trên trình duyệt đã đăng nhập Fauxton:

- [Số đơn theo trạng thái](http://127.0.0.1:5984/retail_shop/_design/reports/_view/orders_by_status?group=true).
- [Doanh thu theo ngày](http://127.0.0.1:5984/retail_shop/_design/reports/_view/revenue_by_day?group=true).

Tham số `group=true` nhóm kết quả theo key của view; xem [API view của CouchDB](https://docs.couchdb.org/en/stable/api/ddoc/views.html).

Trong dự án, doanh thu chỉ tính đơn có `status=delivered` và `payment_status=paid`, nhóm theo ngày tạo đơn. Bộ mẫu có doanh thu 1.400.000 VND trong tháng 11/2026; chọn khoảng ngày phù hợp khi xem dashboard. Chuyển đơn sang đã giao hiện không tự chuyển trạng thái thanh toán sang `paid`.

## 7. Sử dụng website với vai trò khách hàng

### 7.1. Đăng ký và đăng nhập

1. Mở `/register`, nhập họ tên, email, số điện thoại và mật khẩu.
2. Mật khẩu đăng ký cần ít nhất 10 ký tự, gồm chữ hoa, chữ thường và chữ số.
3. Hoặc mở `/login`, dùng `an.demo@example.com` hay `binh.demo@example.com` với mật khẩu đã chọn khi seed.
4. Mở `/account/profile` để xem và cập nhật hồ sơ.

### 7.2. Tìm sản phẩm và đặt hàng

1. Mở `/products`, tìm theo tên/mô tả, chọn danh mục và sắp xếp rồi nhấn **Áp dụng**.
2. Mở chi tiết sản phẩm, xem ảnh, giá và tồn kho.
3. Chọn số lượng, thêm vào giỏ hàng.
4. Mở `/cart` để điều chỉnh số lượng hoặc bỏ sản phẩm.
5. Đăng nhập rồi mở `/checkout`, điền thông tin người nhận, số điện thoại, địa chỉ và thành phố.
6. Kiểm tra tổng tiền, xác nhận đặt hàng. Phương thức hiện tại là **COD — thanh toán khi nhận hàng**.
7. Mở `/orders` hoặc `/account/orders` để xem đơn vừa tạo và lịch sử trạng thái.

Phí vận chuyển hiện tại là 30.000 VND; miễn phí khi tổng tiền hàng từ 500.000 VND. Server tính lại giá, tồn kho và tổng tiền khi tạo đơn. Sản phẩm ngừng bán hoặc hết hàng không thể đặt mua.

### 7.3. Theo dõi và hủy đơn

Mở chi tiết đơn để xem sản phẩm, địa chỉ nhận, tiến trình xử lý và thông tin vận chuyển khi có. Khách hàng chỉ hủy được đơn của mình ở trạng thái `pending` hoặc `confirmed`; xác nhận qua nút hủy trên giao diện.

Tồn kho được giữ ngay khi tạo đơn thành công. Hủy đơn hợp lệ sẽ hoàn lại tồn kho. Có thể đăng xuất rồi đăng nhập bằng tài khoản khác để kiểm tra phân quyền.

## 8. Sử dụng website với vai trò Admin

Đăng nhập tại `/login` bằng tài khoản đã tạo ở bước 4.3, sau đó mở `/admin`.

| Trang | Chức năng |
|---|---|
| `/admin` | Chỉ số vận hành, biểu đồ doanh thu, lọc ngày và trạng thái |
| `/admin/categories` | Thêm, sửa, xóa danh mục theo điều kiện ứng dụng |
| `/admin/products` | Quản lý giá, tồn kho, trạng thái bán và ảnh sản phẩm |
| `/admin/orders` | Xem đơn, cập nhật trạng thái xử lý |
| `/admin/deliveries` | Xem thông tin và lịch sử giao hàng |
| `/admin/customers` | Xem hồ sơ khách hàng và đơn hàng liên quan |
| `/admin/users` | Quản lý tên, số điện thoại, trạng thái tài khoản |
| `/admin/database` | Kiểm tra kết nối CouchDB, số document, index và view |
| `/admin/database/documents` | Xem document theo loại; trường bí mật được che |
| `/admin/database/backups` | Tạo, tải và khôi phục backup |

### 8.1. Quản lý danh mục, sản phẩm và ảnh

1. Tạo danh mục tại `/admin/categories` trước khi thêm sản phẩm.
2. Mở `/admin/products`, chọn thêm sản phẩm và nhập thông tin: tên, slug, danh mục, giá, tồn kho, mô tả và trạng thái.
3. Chọn ảnh từ máy, xem trước và chọn ảnh đại diện rồi lưu sản phẩm.
4. Mở `/products` để đối chiếu sản phẩm đang bán. Khi sửa dữ liệu, lưu thành công rồi làm mới trang cửa hàng.

Giá và tồn kho dùng số nguyên không âm. Slug phải duy nhất và phù hợp URL. Ảnh chấp nhận JPG, PNG, WebP, GIF, tối đa 5 MB/file và 10 ảnh/sản phẩm. Server chuyển ảnh thành WebP; GIF lấy khung hình đầu tiên. Ảnh được lưu tại `uploads/products/`, CouchDB lưu đường dẫn.

Gỡ ảnh khỏi sản phẩm chỉ bỏ liên kết, không xóa file trên ổ đĩa. Khi chuyển máy cần sao chép cả thư mục ảnh.

### 8.2. Xử lý đơn hàng và giao hàng

Mở `/admin/orders`, chọn chi tiết đơn và chuyển lần lượt theo luồng:

```text
pending → confirmed → packing → shipping → delivered
Chờ xác nhận → Đã xác nhận → Đóng gói → Đang giao → Đã giao
```

Khi bàn giao vận chuyển, nhập **đơn vị vận chuyển** và **mã theo dõi**. Website ghi lịch sử và cập nhật document giao hàng tương ứng.

Các nhánh khác được hỗ trợ:

- `pending`, `confirmed`, `packing` → `cancelled`: Admin hủy đơn và hoàn kho.
- `shipping` → `failed`: ghi nhận giao thất bại.
- `failed` → `shipping`: thử giao lại; hoặc `failed` → `cancelled` để hủy và hoàn kho.
- `delivered`, `cancelled`: trạng thái kết thúc, không có bước chuyển tiếp.

### 8.3. Quản lý tài khoản

Vào `/admin/users`, chọn tài khoản, sửa tên, số điện thoại hoặc trạng thái hoạt động rồi xác nhận lưu. Tài khoản `disabled` bị chặn đăng nhập. Giao diện không cho đổi vai trò, không cho tự khóa tài khoản đang dùng và có kiểm tra bảo vệ Admin hoạt động cuối cùng.

## 9. Sao lưu và khôi phục dữ liệu

### 9.1. Tạo và tải backup

1. Đăng nhập Admin, mở `/admin/database/backups`.
2. Chọn **Tạo backup**, xác nhận và đợi thông báo hoàn tất.
3. Chọn **Tải xuống** ở bản backup sẵn sàng.
4. Lưu file JSON ở nơi riêng tư. Sao chép thêm `uploads/products/` để giữ ảnh local.

Backup phía server nằm tại `.data/backups/`. File chứa document hiện tại, design document, CouchDB attachment nếu có và thông tin kiểm tra SHA-256; có thể chứa hồ sơ người dùng cùng mật khẩu đã băm. File JSON không chứa ảnh trong `uploads/products/` và không thay thế bản sao toàn bộ cấu hình server CouchDB.

### 9.2. Khôi phục vào database thử nghiệm mới

1. Tại trang backup, chọn file JSON được xuất bởi chức năng backup của website, tối đa 25 MiB.
2. Nhập database đích mới, ví dụ `retail_shop_restore_demo`.
3. Tên đích phải khớp `retail_shop_restore_[a-z0-9_]{3,40}`, chưa tồn tại và khác database đang dùng.
4. Nhập chính xác `RESTORE`, chọn **Kiểm tra và restore**, rồi xác nhận.
5. Đợi thông báo số document đã khôi phục và xác minh; mở Fauxton để kiểm tra database mới.

Restore không ghi đè database đã tồn tại và không tự chuyển website sang database mới. Để chạy website với dữ liệu đã khôi phục, kiểm tra dữ liệu trước, đổi `COUCHDB_DATABASE` trong `.env.local` sang tên đích rồi khởi động lại website. Nếu chuyển máy, chép lại thư mục ảnh vào đúng `uploads/products/`.

File JSON bất kỳ, file sửa nội dung hoặc sai định dạng/checksum sẽ bị từ chối. Snapshot lưu revision hiện tại; không có toàn bộ lịch sử revision. Nếu restore lỗi sau khi tạo database đích, database thử nghiệm có thể còn lại để kiểm tra. Xem [chi tiết backup/restore](PHASE_8_AUDIT_AND_BACKUP.md).

## 10. Lỗi thường gặp

| Hiện tượng | Cách kiểm tra và xử lý |
|---|---|
| `node` hoặc `npm.cmd` không được nhận diện | Cài Node.js, mở lại terminal và kiểm tra PATH |
| Cảnh báo `EBADENGINE` hoặc Vitest không chạy | Kiểm tra `node --version`; dùng Node.js 24.x với bộ thư viện hiện tại |
| Không mở được Fauxton, cổng `5984` không kết nối | Kiểm tra dịch vụ CouchDB, cổng và địa chỉ; thử `Test-NetConnection` ở bước 2.3 |
| CouchDB trả `401`/`403` | Kiểm tra username/password CouchDB và quyền của tài khoản trong `.env.local` |
| Website hoặc `/api/health` trả `503` | Kiểm tra CouchDB, tên database, cấu hình; chạy `db:init` nếu chưa tạo database, sau đó khởi động lại website |
| Script báo thiếu biến CouchDB dù đã sửa `.env.local` | Chạy tại thư mục gốc; kiểm tra tên file không bị thành `.env.local.txt`; biến shell đã có được ưu tiên hơn giá trị trong file |
| Tạo Admin báo thiếu biến môi trường | Dùng `node --env-file=.env.local scripts/init-admin.mjs` hoặc đặt đủ biến trong shell |
| Tạo Admin báo đã tồn tại | Đăng nhập bằng tài khoản cũ; đổi `ADMIN_PASSWORD` rồi chạy lại không đặt lại mật khẩu |
| Website trống sản phẩm | Nạp seed hoặc thêm danh mục/sản phẩm qua Admin; kiểm tra trạng thái đang bán và bộ lọc |
| Không đăng nhập được khách hàng mẫu | Dùng mật khẩu tại lần seed đầu; chạy lại seed không đổi mật khẩu đã lưu |
| `403` khi vào Admin | Đăng nhập bằng Admin website, không dùng tài khoản CouchDB hay customer |
| Cổng `3000` bận | Dừng tiến trình cũ hoặc dùng `npm.cmd run dev -- --port 3001` |
| Lưu dữ liệu báo `409 CONFLICT` | Làm mới để lấy revision mới nhất, kiểm tra lại rồi lưu; không tự đoán hoặc ghi đè `_rev` |
| Sản phẩm không thêm vào giỏ / không đặt được | Kiểm tra tồn kho, trạng thái sản phẩm, danh mục và số lượng đặt |
| Dashboard doanh thu bằng 0 | Kiểm tra khoảng ngày; view chỉ tính đơn `delivered` và `paid` |
| Ảnh mất sau khi chuyển máy | Chép lại `uploads/products/`; backup JSON không kèm ảnh local |
| Restore bị từ chối | Dùng file backup đúng định dạng và checksum, đúng giới hạn dung lượng, nhập `RESTORE` và chọn tên database mới hợp lệ |

## 11. Kiểm tra sau cài đặt và tài liệu liên quan

Trước khi dùng dữ liệu thật, có thể kiểm tra quy trình bằng dữ liệu demo:

1. `/api/health` trả `status: "ok"` và `connected: true`.
2. Khách hàng đăng nhập, xem sản phẩm và tạo được một đơn COD.
3. Admin nhìn thấy đơn và chuyển được trạng thái theo luồng.
4. Fauxton hiển thị document và revision tương ứng.
5. Tạo backup, tải file và thử restore vào database mới thành công.

Các lệnh kiểm tra mã nguồn có sẵn:

```powershell
npm.cmd run lint
npm.cmd run typecheck
npm.cmd run test
npm.cmd run build
```

Xem thêm [README dự án](../README.md), [schema CouchDB](COUCHDB_SCHEMA.md), [quy tắc nghiệp vụ](BUSINESS_RULES.md), [API contract](API_CONTRACT.md) và [hướng dẫn Postman](../postman/README.md).
