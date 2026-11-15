"use client";
import { Button } from "@/components/ui/button";
export default function ErrorPage({reset}:{error:Error&{digest?:string};reset:()=>void}) {return <div className="panel border-red-200 p-6 sm:p-8"><h1 className="text-xl font-semibold">Không thể tải khu vực quản trị</h1><p role="alert" className="mt-3 text-sm text-muted-foreground">Không thể lấy dữ liệu. Kiểm tra kết nối và thử tải lại.</p><Button className="mt-5" onClick={reset}>Thử lại</Button></div>;}
