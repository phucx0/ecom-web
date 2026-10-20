import { NextResponse } from "next/server";
import { catalogApiError } from "@/lib/catalog/api";
import { productBySlug } from "@/lib/catalog/repository";
export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){try{return NextResponse.json({data:await productBySlug((await params).slug)})}catch(e){return catalogApiError(e)}}
