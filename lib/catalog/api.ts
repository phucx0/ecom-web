import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth/session";
import { CatalogError } from "./repository";
import { CouchDbError } from "@/lib/couchdb/errors";
export async function requireAdminApi(){const u=await currentUser();if(!u)return NextResponse.json({error:{code:"UNAUTHORIZED",message:"Bạn chưa đăng nhập."}},{status:401});if(u.role!=="admin")return NextResponse.json({error:{code:"FORBIDDEN",message:"Bạn không có quyền quản trị."}},{status:403});return null}
export function catalogApiError(e:unknown){if(e instanceof CatalogError)return NextResponse.json({error:{code:e.code,message:e.message}},{status:e.status});if(e instanceof CouchDbError)return NextResponse.json({error:{code:e.code,message:e.status===409?"Document đã thay đổi. Hãy tải lại.":"Không thể truy cập dữ liệu."}},{status:e.status});return NextResponse.json({error:{code:"INTERNAL_ERROR",message:"Không thể xử lý yêu cầu."}},{status:500})}
