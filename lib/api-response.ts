import { NextResponse } from "next/server";
import { AuthError } from "@/lib/auth/users";
export function apiError(error: unknown) { if (error instanceof AuthError) return NextResponse.json({ error: { code: error.code, message: error.message } }, { status: error.status }); return NextResponse.json({ error: { code: "INTERNAL_ERROR", message: "Không thể xử lý yêu cầu." } }, { status: 500 }); }
