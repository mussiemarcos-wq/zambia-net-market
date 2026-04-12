import { cookies } from "next/headers";
import { success, error } from "@/lib/api";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });

    return success({ message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    return error("Internal server error", 500);
  }
}
