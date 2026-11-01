import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/middleware";
import { UserRepo } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const status = searchParams.get("status") || undefined;
  const role = searchParams.get("role") || undefined;

  const users = await UserRepo.getAll({ search, status, role });
  return NextResponse.json({
    success: true,
    total: users.length,
    users,
  });
}

