import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";
export async function GET() { const user = await currentUser(); if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 }); if (user.role !== "admin") return NextResponse.json({ error: { code: "FORBIDDEN", message: "Bạn không có quyền quản trị." } }, { status: 403 }); return NextResponse.json({ data: { authorized: true } }); }
