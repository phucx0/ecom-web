import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/types";
export async function GET() { const user = await currentUser(); if (!user) return NextResponse.json({ error: { code: "UNAUTHORIZED", message: "Bạn chưa đăng nhập." } }, { status: 401 }); return NextResponse.json({ data: toSafeUser(user) }); }
