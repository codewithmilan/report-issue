import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, logUserActivity } from "@/lib/auth/middleware";
import { UserRepo } from "@/lib/db";
import { syncUserToSupabase } from "@/lib/supabase/sync";

export async function PATCH(req: NextRequest) {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return NextResponse.json({ error: auth.error }, { status: auth.status || 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, avatar } = body;

    const updates: any = {};
    if (name && typeof name === "string") updates.name = name.trim();
    if (phone !== undefined) updates.phone = String(phone).trim();
    if (avatar !== undefined) updates.avatar = String(avatar).trim();

    // Prevent privilege escalation: ignore any role or status changes here
    delete updates.role;
    delete updates.status;
    delete updates.email;
    delete updates.password;

    const updatedUser = await UserRepo.update(String(auth.user._id), updates);
    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update profile." }, { status: 400 });
    }

    // Sync profile updates to Supabase
    syncUserToSupabase({
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
    }).catch((e) => console.warn("[Supabase Profile Sync Warning]", e.message));

    await logUserActivity(req, {
      userId: String(auth.user._id),
      userName: updatedUser.name,
      userEmail: updatedUser.email,
      action: "PROFILE_UPDATE",
      description: `User updated profile information`,
    });

    const { password: _, ...safeUser } = updatedUser;
    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update profile." },
      { status: 500 }
    );
  }
}

