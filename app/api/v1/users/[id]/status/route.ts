import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin, logUserActivity } from "@/lib/auth/middleware";
import { UserRepo } from "@/lib/db";

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
    const { status, role } = body;

    const updates: any = {};
    if (status && ["active", "inactive", "suspended"].includes(status)) {
      updates.status = status;
    }
    if (role && ["admin", "user"].includes(role)) {
      updates.role = role;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update. Allowed: status, role." },
        { status: 400 }
      );
    }

    const updatedUser = await UserRepo.update(params.id, updates);
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    await logUserActivity(req, {
      userId: String(auth.user._id),
      userName: auth.user.name,
      userEmail: auth.user.email,
      action: "USER_STATUS_UPDATE",
      description: `Admin updated user (${updatedUser.email}): status=${updatedUser.status}, role=${updatedUser.role}`,
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({
      success: true,
      message: "User status updated successfully.",
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update user status." },
      { status: 500 }
    );
  }
}

