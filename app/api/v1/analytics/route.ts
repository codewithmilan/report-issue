import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth/middleware";
import { UserRepo, IssueRepo } from "@/lib/db";

export async function GET(req: NextRequest) {
  const auth = await verifyAdmin(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 403 });
  }

  try {
    const allUsers = await UserRepo.getAll();
    const allIssues = await IssueRepo.getAll();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const totalUsers = allUsers.length;
    const activeUsers = allUsers.filter((u) => u.status === "active").length;
    const inactiveUsers = allUsers.filter((u) => u.status === "inactive" || u.status === "suspended").length;
    const suspendedUsers = allUsers.filter((u) => u.status === "suspended").length;
    const newUsersToday = allUsers.filter(
      (u) => new Date(u.createdAt || 0) >= startOfToday
    ).length;

    const totalIssues = allIssues.length;
    const pendingIssues = allIssues.filter((i) => i.status === "pending").length;
    const inProgressIssues = allIssues.filter((i) => i.status === "in_progress").length;
    const resolvedIssues = allIssues.filter((i) => i.status === "resolved").length;
    const rejectedIssues = allIssues.filter((i) => i.status === "rejected").length;
    const issuesToday = allIssues.filter(
      (i) => new Date(i.createdAt || 0) >= startOfToday
    ).length;

    // Distributions
    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {
      pending: pendingIssues,
      in_progress: inProgressIssues,
      resolved: resolvedIssues,
      rejected: rejectedIssues,
    };

    allIssues.forEach((issue) => {
      const cat = issue.category || "Other";
      categoryDistribution[cat] = (categoryDistribution[cat] || 0) + 1;

      const pri = issue.priority || "medium";
      priorityDistribution[pri] = (priorityDistribution[pri] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers,
        suspendedUsers,
        newUsersToday,
        totalIssues,
        pendingIssues,
        inProgressIssues,
        resolvedIssues,
        rejectedIssues,
        issuesToday,
      },
      charts: {
        categoryDistribution,
        priorityDistribution,
        statusDistribution,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to generate analytics data." },
      { status: 500 }
    );
  }
}

