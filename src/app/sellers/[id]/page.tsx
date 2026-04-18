import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { generateWhatsAppLink } from "@/lib/utils";
import ListingCard from "@/components/ListingCard";
import StarRating from "@/components/StarRating";
import ReviewList from "@/components/ReviewList";
import {
  BadgeCheck,
  MapPin,
  Calendar,
  Star,
  MessageCircle,
  UserPlus,
  Store,
  Clock,
  Phone,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: SellerPageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { name: true },
  });

  if (!user) {
    return { title: "Seller Not Found" };
  }

  return {
    title: `${user.name} - Seller Profile`,
  };
}

export default async function SellerProfilePage({ params }: SellerPageProps) {
  const { id } = await params;
  const currentUser = await getCurrentUser();

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      businessProfile: true,
      _count: {
        select: {
          listings: {
            where: { status: "ACTIVE" },
          },
          followers: true,
        },
      },
    },
  });

  if (!user) {
    notFound();
  }

  // Fetch reviews for average rating
  const reviewAgg = await prisma.review.aggregate({
    where: { sellerId: id },
    _avg: { rating: true },
    _count: { rating: true },
  });

  const avgRating = reviewAgg._avg.rating
    ? Math.round(reviewAgg._avg.rating * 10) / 10
    : 0;
  const reviewCount = reviewAgg._count.rating;

  // Fetch active listings
  const listings = await prisma.listing.findMany({
    where: { userId: id, status: "ACTIVE" },
    include: {
      images: {
        orderBy: { sortOrder: "asc" },
        select: { url: true, thumbnailUrl: true },
      },
      category: { select: { name: true } },
      user: {
        select: {
          id: true,
          name: true,
          isVerified: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: [
      { isBoosted: "desc" },
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
  });

  // Serialize listings for the client component
  const serializedListings = listings.map((listing) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price ? Number(listing.price) : null,
    priceType: listing.priceType,
    location: listing.location,
    condition: listing.condition,
    isFeatured: listing.isFeatured,
    isBoosted: listing.isBoosted,
    viewsCount: listing.viewsCount,
    createdAt: listing.createdAt.toISOString(),
    images: listing.images,
    user: listing.user,
    category: listing.category,
  }));

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const initial = user.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Seller Profile Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
              ) : (
                <span className="text-3xl font-bold text-blue-600">
                  {initial}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.name}
                </h1>
                {user.isVerified && (
                  <BadgeCheck className="w-6 h-6 text-blue-600 flex-shrink-0" />
                )}
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-500">
                {user.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {user.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Member since {memberSince}
                </span>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-6 mt-4">
                <div className="flex items-center gap-1.5">
                  <StarRating rating={avgRating} size="sm" />
                  <span className="font-semibold text-gray-900">
                    {avgRating > 0 ? avgRating.toFixed(1) : "N/A"}
                  </span>
                  <span className="text-sm text-gray-500">
                    ({reviewCount} {reviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {user._count.listings}
                  </span>{" "}
                  active {user._count.listings === 1 ? "listing" : "listings"}
                </div>
                <div className="text-sm text-gray-500">
                  <span className="font-semibold text-gray-900">
                    {user._count.followers}
                  </span>{" "}
                  {user._count.followers === 1 ? "follower" : "followers"}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex flex-wrap gap-3 mt-5">
                {user.phone && (
                  <a
                    href={generateWhatsAppLink(
                      user.phone,
                      `Inquiry from ${user.name}'s profile`
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-xl font-medium text-sm hover:bg-green-700 transition"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                )}
                <button
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium text-sm hover:bg-blue-700 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  Follow
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Business Profile */}
        {user.businessProfile && (
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Store className="w-5 h-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-gray-900">
                {user.businessProfile.businessName}
              </h2>
            </div>

            {user.businessProfile.description && (
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                {user.businessProfile.description}
              </p>
            )}

            {user.businessProfile.operatingHours && (
              <div className="flex items-start gap-2 text-sm text-gray-500">
                <Clock className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div>
                  <span className="font-medium text-gray-700">
                    Operating Hours:
                  </span>{" "}
                  {typeof user.businessProfile.operatingHours === "string"
                    ? user.businessProfile.operatingHours
                    : JSON.stringify(user.businessProfile.operatingHours)}
                </div>
              </div>
            )}

            {user.businessProfile.website && (
              <div className="flex items-center gap-2 text-sm text-blue-600 mt-2">
                <Phone className="w-4 h-4" />
                <a
                  href={user.businessProfile.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  {user.businessProfile.website}
                </a>
              </div>
            )}
          </div>
        )}

        {/* Listings Section */}
        <div id="listings" className="scroll-mt-20">
          <h2 className="text-xl font-bold text-gray-900 mb-5">
            Listings ({serializedListings.length})
          </h2>

          {serializedListings.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {serializedListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <p className="text-gray-500">
                This seller has no active listings at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Reviews Section */}
        <div id="reviews" className="mt-10 scroll-mt-20">
          <ReviewList
            sellerId={id}
            sellerName={user.name}
            currentUserId={currentUser?.id}
          />
        </div>
      </div>
    </div>
  );
}
