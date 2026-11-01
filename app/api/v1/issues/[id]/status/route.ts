import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, logUserActivity } from "@/lib/auth/middleware";
import { IssueRepo } from "@/lib/db";

// PATCH /api/v1/issues/:id/status (Admin Only)
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await verifyAdmin(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const body = await req.json();
    const { status, adminRemarks } = body;

    const validStatuses = ["pending", "in_progress", "resolved", "rejected"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(", ")}` },
        { status: 400 }
      );
    }

    const updatedIssue = await IssueRepo.updateStatus(
      params.id,
      status as any,
      typeof adminRemarks === "string" ? adminRemarks : undefined
    );

    if (!updatedIssue) {
      return NextResponse.json({ error: "Issue not found." }, { status: 404 });
    }

    await logUserActivity(req, {
      userId: String(auth.user._id),
      userName: auth.user.name,
      userEmail: auth.user.email,
      action: "ISSUE_STATUS_UPDATE",
      description: `Admin updated issue #${params.id} ("${updatedIssue.title}") status to "${status}"`,
    });

    return NextResponse.json({
      success: true,
      message: "Issue status updated successfully.",
      issue: updatedIssue,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update issue status." },
      { status: 500 }
    );
  }
}

