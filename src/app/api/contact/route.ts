import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { name, email, phone, subject, message } = body;

  if (!name || !email || !subject || !message) {
    return error("Name, email, subject, and message are required");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return error("Invalid email address");
  }

  const validSubjects = ["General", "Support", "Business", "Report Issue", "Partnership"];
  if (!validSubjects.includes(subject)) {
    return error("Invalid subject");
  }

  // Find all admin users
  const admins = await prisma.user.findMany({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  // Create a notification for each admin
  if (admins.length > 0) {
    await prisma.notification.createMany({
      data: admins.map((admin) => ({
        userId: admin.id,
        type: "CONTACT_FORM",
        title: `Contact Form: ${subject}`,
        body: `From: ${name} (${email}${phone ? `, ${phone}` : ""})\n\n${message}`,
        data: JSON.parse(JSON.stringify({ name, email, phone, subject, message })),
      })),
    });
  }

  return success({ message: "Your message has been sent. We will get back to you within 24 hours." });
}
