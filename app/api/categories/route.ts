import { NextResponse } from "next/server";
import { catalogApiError } from "@/lib/catalog/api";
import { listCategories } from "@/lib/catalog/repository";
export async function GET(){try{return NextResponse.json({data:await listCategories()})}catch(e){return catalogApiError(e)}}
