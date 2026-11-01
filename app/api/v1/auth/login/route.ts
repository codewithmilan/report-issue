import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { UserRepo } from "@/lib/db";
import { signJwt, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { logUserActivity } from "@/lib/auth/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Please provide both email and password." },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await UserRepo.findByEmail(cleanEmail);

    if (!user || !user.password) {
      // Log failed attempt
      await logUserActivity(req, {
        userEmail: cleanEmail,
        action: "LOGIN_FAILED",
        description: `Failed login attempt for non-existent email: ${cleanEmail}`,
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Check account status
    if (user.status === "suspended") {
      await logUserActivity(req, {
        userId: String(user._id),
        userName: user.name,
        userEmail: user.email,
        action: "LOGIN_BLOCKED",
        description: `Suspended user attempted login: ${user.email}`,
      });

      return NextResponse.json(
        { error: "Access Denied: Your account has been suspended by an administrator." },
        { status: 403 }
      );
    }

    if (user.status === "inactive") {
      return NextResponse.json(
        { error: "Access Denied: Your account is currently inactive. Please contact support." },
        { status: 403 }
      );
    }

    // Compare bcrypt password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      await logUserActivity(req, {
        userId: String(user._id),
        userName: user.name,
        userEmail: user.email,
        action: "LOGIN_FAILED",
        description: `Failed login attempt (incorrect password) for: ${user.email}`,
      });

      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    // Update last login timestamp
    await UserRepo.updateLastLogin(String(user._id));

    // Sign JWT
    const token = signJwt({
      id: String(user._id),
      email: user.email,
      role: user.role,
      name: user.name,
    });

    // Log success
    await logUserActivity(req, {
      userId: String(user._id),
      userName: user.name,
      userEmail: user.email,
      action: "LOGIN_SUCCESS",
      description: `User successfully signed in: ${user.email} (${user.role})`,
    });

    const { password: _, ...safeUser } = user;
    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: safeUser,
      token,
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}

