import { NextRequest, NextResponse } from "next/server";
import { verifyUserOwnership } from "@/lib/auth/middleware";
import { UserRepo, ActivityRepo, IssueRepo } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyUserOwnership(req, params.id);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  const targetUser = await UserRepo.findById(params.id);
  if (!targetUser) {
    return NextResponse.json({ error: "User not found." }, { status: 404 });
  }

  const { password: _, ...safeUser } = targetUser;
  const activityHistory = await ActivityRepo.getAll({ userId: params.id, limit: 20 });
  const userIssues = await IssueRepo.findByUserId(params.id);

  return NextResponse.json({
    success: true,
    user: safeUser,
    activityHistory,
    totalIssues: userIssues.length,
    issues: userIssues,
  });
}

