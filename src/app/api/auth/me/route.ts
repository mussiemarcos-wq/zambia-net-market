import { getCurrentUser } from "@/lib/auth";
import { success, unauthorized, error } from "@/lib/api";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return unauthorized("Not authenticated");
    }

    return success(user);
  } catch (err) {
    console.error("Get current user error:", err);
    return error("Internal server error", 500);
  }
}
