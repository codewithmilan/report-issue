import { NextRequest, NextResponse } from "next/server";
import { UserRepo } from "@/lib/db";
import { signJwt, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { logUserActivity } from "@/lib/auth/middleware";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, phone } = body;

    // 1. Validation
    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json(
        { error: "Full name must be at least 2 characters long." },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // 2. Prevent role escalation during registration (enforce 'user' role)
    const newUser = await UserRepo.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: "user",
      phone: phone || "",
    });

    // 3. Generate JWT
    const token = signJwt({
      id: String(newUser._id),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
    });

    // 4. Log activity
    await logUserActivity(req, {
      userId: String(newUser._id),
      userName: newUser.name,
      userEmail: newUser.email,
      action: "REGISTER",
      description: `New user registered account: ${newUser.email}`,
    });

    // 5. Construct response with httpOnly cookie
    const { password: _, ...safeUser } = newUser;
    const response = NextResponse.json({
      success: true,
      message: "Registration successful",
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
      { error: err.message || "Registration failed. Please try again." },
      { status: 400 }
    );
  }
}

