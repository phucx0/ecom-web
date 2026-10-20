import { NextResponse } from "next/server";
import { apiError } from "@/lib/api-response";
import { setSession } from "@/lib/auth/session";
import { toSafeUser } from "@/lib/auth/types";
import { registerUser } from "@/lib/auth/users";
export async function POST(request: Request) { try { const user = await registerUser(await request.json()); await setSession(user); return NextResponse.json({ data: toSafeUser(user) }, { status: 201 }); } catch (error) { return apiError(error); } }
