import { NextRequest } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { hashPassword, signToken } from "@/lib/auth";
import { success, error } from "@/lib/api";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, phone, password, email, location } = body;

    // Validate required fields
    if (!name || !phone || !password) {
      return error("Name, phone, and password are required");
    }

    // Check phone uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { phone },
    });

    if (existingUser) {
      return error("Phone number already registered", 409);
    }

    // Check email uniqueness if provided
    if (email) {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        return error("Email already registered", 409);
      }
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        phone,
        passwordHash,
        email: email || null,
        location: location || null,
      },
      select: {
        id: true,
        name: true,
        phone: true,
        email: true,
        role: true,
        isVerified: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
      },
    });

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

    return success({ user }, 201);
  } catch (err) {
    console.error("Registration error:", err);
    return error("Internal server error", 500);
  }
}
