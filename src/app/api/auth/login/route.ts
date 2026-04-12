import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { verifyPassword, signToken } from "@/lib/auth";
import { success, error, unauthorized, forbidden } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, password } = body;

    // Validate required fields
    if (!phone || !password) {
      return error("Phone and password are required");
    }

    // Find user by phone
    const user = await prisma.user.findUnique({
      where: { phone },
    });

    if (!user) {
      return unauthorized("Invalid phone or password");
    }

    // Verify password
    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      return unauthorized("Invalid phone or password");
    }

    // Check if banned
    if (user.isBanned) {
      return forbidden("Your account has been banned");
    }

    // Sign JWT and set cookie
    const token = signToken({ userId: user.id, role: user.role });
    const cookieStore = await cookies();
    cookieStore.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    // Return user data without password
    const { passwordHash: _, ...userData } = user;

    return success({ user: userData });
  } catch (err) {
    console.error("Login error:", err);
    return error("Internal server error", 500);
  }
}
