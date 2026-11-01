import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, logUserActivity } from "@/lib/auth/middleware";
import { IssueRepo } from "@/lib/db";
import { syncIssueToSupabase } from "@/lib/supabase/sync";

// GET /api/v1/issues
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const status = searchParams.get("status") || undefined;
    const category = searchParams.get("category") || undefined;
    const priority = searchParams.get("priority") || undefined;

    const issues = await IssueRepo.getAll({ search, status, category, priority });
    return NextResponse.json({
      success: true,
      total: issues.length,
      issues,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch issues." },
      { status: 500 }
    );
  }
}

// POST /api/v1/issues
export async function POST(req: NextRequest) {
  // 1. Authenticate user strictly via JWT
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const {
      title,
      description,
      category,
      imageUrl,
      location,
      latitude,
      longitude,
      priority,
    } = body;

    // 2. Validate required inputs
    if (!title || typeof title !== "string" || title.trim().length < 5) {
      return NextResponse.json(
        { error: "Issue title must be at least 5 characters long." },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string" || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Issue description must be at least 10 characters long." },
        { status: 400 }
      );
    }

    if (!category || typeof category !== "string") {
      return NextResponse.json(
        { error: "Please select an issue category." },
        { status: 400 }
      );
    }

    // 3. Security: ALWAYS use authenticated JWT user credentials - never trust client payload for identity
    const newIssue = await IssueRepo.create({
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      userId: String(auth.user._id),
      userName: auth.user.name,
      userEmail: auth.user.email,
      userAvatar: auth.user.avatar || "",
      imageUrl: imageUrl || "",
      location: location || "",
      latitude: typeof latitude === "number" ? latitude : null,
      longitude: typeof longitude === "number" ? longitude : null,
      priority: ["low", "medium", "high", "urgent"].includes(priority) ? priority : "medium",
    });

    // 3.1 Sync issue to Supabase public.civic_issues
    syncIssueToSupabase({
      title: newIssue.title,
      description: newIssue.description,
      category: newIssue.category,
      userEmail: auth.user.email,
      location: newIssue.location,
      latitude: newIssue.latitude || undefined,
      longitude: newIssue.longitude || undefined,
      status: newIssue.status,
      priority: newIssue.priority,
      imageUrl: newIssue.imageUrl,
      createdAt: newIssue.createdAt,
      updatedAt: newIssue.updatedAt,
    }).catch((e) => console.warn("[Supabase Issue Sync Warning]", e.message));

    // 4. Log activity
    await logUserActivity(req, {
      userId: String(auth.user._id),
      userName: auth.user.name,
      userEmail: auth.user.email,
      action: "ISSUE_CREATE",
      description: `Reported civic issue: "${newIssue.title}" in category "${newIssue.category}"`,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Issue reported successfully.",
        issue: newIssue,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create issue." },
      { status: 500 }
    );
  }
}

