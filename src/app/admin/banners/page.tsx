import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import BannerAdminClient from "./BannerAdminClient";

export const dynamic = "force-dynamic";

export default async function AdminBannersPage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    redirect("/");
  }

  const banners = await prisma.bannerAd.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serialized = banners.map((b) => ({
    id: b.id,
    title: b.title,
    imageUrl: b.imageUrl,
    targetUrl: b.targetUrl,
    placement: b.placement,
    impressions: b.impressions,
    clicks: b.clicks,
    isActive: b.isActive,
    startsAt: b.startsAt.toISOString(),
    expiresAt: b.expiresAt.toISOString(),
    createdAt: b.createdAt.toISOString(),
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Banner Ads Management</h1>
      <BannerAdminClient banners={serialized} />
    </div>
  );
}
