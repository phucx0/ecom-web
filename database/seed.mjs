import { createHash } from "node:crypto";

// IDs cố định có tiền tố demo để chạy lại không tạo thêm dữ liệu trùng.
// Script seed bổ sung password_hash từ biến môi trường trước khi ghi user.
export function createSeedDocuments() {
  const reference = Date.parse("2026-11-15T08:00:00.000Z");
  const date = (daysAgo, hoursLater = 0) =>
    new Date(reference - daysAgo * 86400000 + hoursLater * 3600000).toISOString();
  const users = [
    { name: "Nguyễn Minh An (Demo)", email: "an.demo@example.com", phone: "0900000001" },
    { name: "Trần Thanh Bình (Demo)", email: "binh.demo@example.com", phone: "0900000002" },
  ].map((user) => ({
    _id: `user:email:${createHash("sha256").update(user.email).digest("hex")}`,
    type: "user",
    ...user,
    role: "customer",
    account_status: "active",
    created_at: date(30),
  }));
  const categories = [
    { _id: "category:demo-stationery", name: "Văn phòng phẩm", slug: "demo-van-phong-pham" },
    { _id: "category:demo-accessories", name: "Phụ kiện máy tính", slug: "demo-phu-kien-may-tinh" },
    { _id: "category:demo-home", name: "Đồ dùng gia đình", slug: "demo-do-dung-gia-dinh" },
  ].map((category) => ({ ...category, type: "category", is_active: true }));
  // Stock là tồn kho còn lại của bộ mẫu, đã tính các đơn reserved bên dưới.
  const products = [
    {
      _id: "product:demo-notebook", name: "Sổ tay A5", slug: "demo-so-tay-a5",
      category_id: categories[0]._id, price: 65000, stock: 45,
      description: "Sổ tay A5 bìa cứng, 160 trang giấy kẻ ngang.",
    },
    {
      _id: "product:demo-pens", name: "Bộ 5 bút bi", slug: "demo-bo-5-but-bi",
      category_id: categories[0]._id, price: 35000, stock: 80,
      description: "Bộ 5 bút bi mực xanh, ngòi 0.5 mm.",
    },
    {
      _id: "product:demo-keyboard", name: "Bàn phím cơ 75%", slug: "demo-ban-phim-co-75",
      category_id: categories[1]._id, price: 850000, stock: 12,
      description: "Bàn phím cơ có dây, bố cục 75%, kết nối USB-C.",
    },
    {
      _id: "product:demo-mouse", name: "Chuột không dây", slug: "demo-chuot-khong-day",
      category_id: categories[1]._id, price: 320000, stock: 25,
      description: "Chuột không dây nhỏ gọn, kết nối qua đầu thu USB.",
    },
    {
      _id: "product:demo-bottle", name: "Bình giữ nhiệt 500 ml", slug: "demo-binh-giu-nhiet-500ml",
      category_id: categories[2]._id, price: 190000, stock: 0,
      description: "Bình inox hai lớp dung tích 500 ml. Mẫu minh họa sản phẩm hết hàng.",
    },
    {
      _id: "product:demo-lamp", name: "Đèn bàn LED", slug: "demo-den-ban-led",
      category_id: categories[2]._id, price: 450000, stock: 18,
      description: "Đèn bàn LED điều chỉnh độ sáng. Mẫu minh họa sản phẩm ngừng bán.",
      is_active: false,
    },
  ].map((product) => ({
    type: "product", images: [], is_active: true, created_at: date(20), ...product,
  }));
  const scenarios = [
    { key: "pending", daysAgo: 0, user: 0, items: [[0, 2], [1, 1]], states: ["pending"] },
    { key: "confirmed", daysAgo: 1, user: 1, items: [[2, 1]], states: ["pending", "confirmed"] },
    { key: "packing", daysAgo: 2, user: 0, items: [[3, 1], [1, 2]], states: ["pending", "confirmed", "packing"] },
    { key: "shipping", daysAgo: 3, user: 1, items: [[3, 2]], states: ["pending", "confirmed", "packing", "shipping"] },
    { key: "delivered-1", daysAgo: 5, user: 0, items: [[2, 1], [3, 1]], states: ["pending", "confirmed", "packing", "shipping", "delivered"] },
    { key: "cancelled", daysAgo: 4, user: 1, items: [[0, 3]], states: ["pending", "confirmed", "cancelled"] },
    { key: "failed", daysAgo: 6, user: 0, items: [[0, 1], [3, 1]], states: ["pending", "confirmed", "packing", "shipping", "failed"] },
    { key: "delivered-2", daysAgo: 8, user: 1, items: [[0, 2], [1, 2]], states: ["pending", "confirmed", "packing", "shipping", "delivered"] },
  ];
  const orders = scenarios.map((scenario) => {
    const user = users[scenario.user];
    const items = scenario.items.map(([index, quantity]) => ({
      product_id: products[index]._id, name: products[index].name,
      quantity, unit_price: products[index].price,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unit_price, 0);
    const shipping_fee = subtotal >= 500000 ? 0 : 30000;
    const status = scenario.states.at(-1);
    const idempotency_key = `demo-checkout-${scenario.key}`;
    return {
      _id: `order:${createHash("sha256").update(`${user._id}:${idempotency_key}`).digest("hex")}`,
      type: "order", user_id: user._id,
      customer: { name: user.name, phone: user.phone },
      shipping_address: { line1: "140 Lê Trọng Tấn, phường Tây Thạnh", city: "Thành phố Hồ Chí Minh" },
      items, subtotal, shipping_fee, total: subtotal + shipping_fee,
      payment_method: "COD", payment_status: status === "delivered" ? "paid" : "unpaid",
      status, created_at: date(scenario.daysAgo),
      status_history: scenario.states.map((state, index) => ({ status: state, at: date(scenario.daysAgo, index * 2) })),
      idempotency_key, inventory_state: status === "cancelled" ? "released" : "reserved",
    };
  });
  const deliveries = orders.filter((order) => ["shipping", "delivered", "failed"].includes(order.status))
    .map((order, index) => ({
      _id: `delivery:demo-${index + 1}`, type: "delivery", order_id: order._id,
      carrier: "Vận chuyển Demo", tracking_code: `DEMO2026${String(index + 1).padStart(4, "0")}`,
      status: order.status,
      history: order.status_history.filter((entry) => ["shipping", "delivered", "failed"].includes(entry.status)),
    }));
  return [...users, ...categories, ...products, ...orders, ...deliveries];
}
