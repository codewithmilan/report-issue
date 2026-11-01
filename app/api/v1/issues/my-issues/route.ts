import { NextRequest, NextResponse } from "next/server";
import { authenticateUser } from "@/lib/auth/middleware";
import { IssueRepo } from "@/lib/db";

// GET /api/v1/issues/my-issues
export async function GET(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const userIssues = await IssueRepo.findByUserId(String(auth.user._id));
    return NextResponse.json({
      success: true,
      total: userIssues.length,
      issues: userIssues,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to retrieve your reported issues." },
      { status: 500 }
    );
  }
}

