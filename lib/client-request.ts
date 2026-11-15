export async function clientRequest<T = unknown>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try { response=await fetch(url,init); } catch { throw new Error("Không thể kết nối. Kiểm tra mạng rồi thử lại."); }
  let body;
  try { body=await response.json(); } catch { throw new Error("Không thể đọc phản hồi. Vui lòng thử lại."); }
  if(!response.ok) throw new Error(body.error?.message||"Không thể xử lý yêu cầu. Vui lòng thử lại.");
  return body.data as T;
}
