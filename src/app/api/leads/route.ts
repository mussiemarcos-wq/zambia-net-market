import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  // Find all leads (notifications with type LEAD) for this user
  const notifications = await prisma.notification.findMany({
    where: {
      userId: user.id,
      type: "LEAD",
    },
    orderBy: { createdAt: "desc" },
  });

  // Parse lead data from notification data field
  const leads = notifications.map((n) => {
    const data = (n.data as Record<string, unknown>) || {};
    return {
      id: n.id,
      listingTitle: (data.listingTitle as string) || "Unknown listing",
      buyerName: (data.buyerName as string) || "Anonymous",
      contactMethod: (data.contactMethod as string) || "whatsapp",
      status: (data.status as string) || "new",
      createdAt: n.createdAt.toISOString(),
    };
  });

  // Calculate stats
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const totalThisMonth = leads.filter(
    (l) => new Date(l.createdAt) >= startOfMonth
  ).length;
  const converted = leads.filter((l) => l.status === "converted").length;
  const conversionRate =
    leads.length > 0 ? Math.round((converted / leads.length) * 100) : 0;

  return success({
    leads,
    stats: {
      totalThisMonth,
      totalAll: leads.length,
      converted,
      conversionRate,
    },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { listingId, buyerName, contactMethod } = body;

  if (!listingId) {
    return error("listingId is required");
  }

  if (!contactMethod || !["whatsapp", "telegram"].includes(contactMethod)) {
    return error("contactMethod must be 'whatsapp' or 'telegram'");
  }

  // Find the listing and its owner
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    select: {
      id: true,
      title: true,
      userId: true,
      category: { select: { slug: true } },
    },
  });

  if (!listing) {
    return error("Listing not found", 404);
  }

  // Only create lead notifications for service listings
  if (listing.category.slug !== "services") {
    return success({ message: "Not a services listing, skipped" });
  }

  const contactLabel = contactMethod === "whatsapp" ? "WhatsApp" : "Telegram";
  const buyerDisplay = buyerName || "Someone";

  // Create a notification for the seller
  const notification = await prisma.notification.create({
    data: {
      userId: listing.userId,
      type: "LEAD",
      title: "New Enquiry!",
      body: `${buyerDisplay} is interested in "${listing.title}" via ${contactLabel}.`,
      data: {
        listingId: listing.id,
        listingTitle: listing.title,
        buyerName: buyerName || "Anonymous",
        contactMethod,
        status: "new",
      },
    },
  });

  return success({ lead: { id: notification.id } }, 201);
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return unauthorized();

  const body = await req.json();
  const { leadId, status } = body;

  if (!leadId || !status) {
    return error("leadId and status are required");
  }

  if (!["new", "contacted", "converted"].includes(status)) {
    return error("status must be 'new', 'contacted', or 'converted'");
  }

  // Find the notification and verify ownership
  const notification = await prisma.notification.findUnique({
    where: { id: leadId },
  });

  if (!notification || notification.userId !== user.id) {
    return error("Lead not found", 404);
  }

  // Update the data JSON field with new status
  const existingData = (notification.data as Record<string, unknown>) || {};
  await prisma.notification.update({
    where: { id: leadId },
    data: {
      data: { ...existingData, status },
      isRead: status !== "new",
    },
  });

  return success({ message: "Lead status updated" });
}
