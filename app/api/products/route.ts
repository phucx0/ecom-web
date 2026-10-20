import { NextResponse } from "next/server";
import { catalogApiError } from "@/lib/catalog/api";
import { listProducts } from "@/lib/catalog/repository";
export async function GET(request:Request){try{const u=new URL(request.url);const data=await listProducts({categoryId:u.searchParams.get("category")||undefined,search:u.searchParams.get("q")||undefined});return NextResponse.json({data})}catch(e){return catalogApiError(e)}}
