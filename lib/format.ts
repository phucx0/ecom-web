const currency = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const dateTime = new Intl.DateTimeFormat("vi-VN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Bangkok" });
export function formatPrice(amount: number) { return currency.format(amount); }
export function formatDate(value: string) { return dateTime.format(new Date(value)); }
