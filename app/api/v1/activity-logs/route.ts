import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/middleware";
import { ActivityRepo } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const filterUserId = searchParams.get("userId");

    // If normal user, enforce that they ONLY see their own logs
    if (auth.user.role !== "admin") {
      const logs = await ActivityRepo.getAll({
        userId: String(auth.user._id),
        limit,
      });
      return NextResponse.json({
        success: true,
        total: logs.length,
        logs,
      });
    }

    // Admin can see all or filter by specific user
    const logs = await ActivityRepo.getAll({
      userId: filterUserId || undefined,
      limit,
    });

    return NextResponse.json({
      success: true,
      total: logs.length,
      logs,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve activity logs." },
      { status: 500 }
    );
  }
}

