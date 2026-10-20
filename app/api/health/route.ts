import { NextResponse } from "next/server";
import { couchDatabaseName, couchRequest } from "@/lib/couchdb/client";

type DatabaseInfo = { db_name: string };

export async function GET() {
  const database = couchDatabaseName();
  try {
    const info = await couchRequest<DatabaseInfo>();
    return NextResponse.json({ status: "ok", database: info.db_name, details: { connected: true } });
  } catch {
    return NextResponse.json(
      { status: "error", database, details: { connected: false }, error: { code: "DATABASE_UNAVAILABLE", message: "Không thể kết nối cơ sở dữ liệu." } },
      { status: 503 },
    );
  }
}
