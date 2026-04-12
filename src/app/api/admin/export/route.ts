import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { unauthorized, error } from "@/lib/api";

function escapeCsv(value: string | null | undefined): string {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsvRow(values: (string | null | undefined)[]): string {
  return values.map(escapeCsv).join(",");
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return error("Forbidden", 403);
    }

    const type = request.nextUrl.searchParams.get("type");

    if (type === "users") {
      const users = await prisma.user.findMany({
        select: {
          name: true,
          phone: true,
          email: true,
          role: true,
          isVerified: true,
          isBanned: true,
          location: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      });

      const header = toCsvRow([
        "Name",
        "Phone",
        "Email",
        "Role",
        "Verified",
        "Banned",
        "Location",
        "Joined Date",
      ]);
      const rows = users.map((u) =>
        toCsvRow([
          u.name,
          u.phone,
          u.email,
          u.role,
          u.isVerified ? "Yes" : "No",
          u.isBanned ? "Yes" : "No",
          u.location,
          u.createdAt.toISOString().split("T")[0],
        ])
      );

      const csv = [header, ...rows].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="users-${Date.now()}.csv"`,
        },
      });
    }

    if (type === "listings") {
      const listings = await prisma.listing.findMany({
        select: {
          title: true,
          price: true,
          status: true,
          viewsCount: true,
          whatsappClicks: true,
          createdAt: true,
          category: { select: { name: true } },
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const header = toCsvRow([
        "Title",
        "Category",
        "Price",
        "Status",
        "Views",
        "WhatsApp Clicks",
        "Seller Name",
        "Created Date",
      ]);
      const rows = listings.map((l) =>
        toCsvRow([
          l.title,
          l.category.name,
          l.price != null ? String(l.price) : "",
          l.status,
          String(l.viewsCount),
          String(l.whatsappClicks),
          l.user.name,
          l.createdAt.toISOString().split("T")[0],
        ])
      );

      const csv = [header, ...rows].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="listings-${Date.now()}.csv"`,
        },
      });
    }

    if (type === "payments") {
      const payments = await prisma.payment.findMany({
        select: {
          type: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          createdAt: true,
          user: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });

      const header = toCsvRow([
        "User Name",
        "Type",
        "Amount",
        "Currency",
        "Status",
        "Provider",
        "Date",
      ]);
      const rows = payments.map((p) =>
        toCsvRow([
          p.user.name,
          p.type,
          String(p.amount),
          p.currency,
          p.status,
          p.provider,
          p.createdAt.toISOString().split("T")[0],
        ])
      );

      const csv = [header, ...rows].join("\n");
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="payments-${Date.now()}.csv"`,
        },
      });
    }

    return error("Invalid export type. Use: users, listings, or payments");
  } catch (err) {
    console.error("GET /api/admin/export error:", err);
    return error("Failed to generate export", 500);
  }
}
