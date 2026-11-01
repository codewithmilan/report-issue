import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/middleware";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  const { password: _, ...safeUser } = auth.user;
  return NextResponse.json({
    success: true,
    user: safeUser,
  });
}

