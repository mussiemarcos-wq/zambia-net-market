import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin, BadgeCheck, Clock, Eye, ChevronRight, Star } from "lucide-react";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { formatPrice, timeAgo } from "@/lib/utils";
import { CONDITION_LABELS, PRICE_TYPE_LABELS } from "@/lib/constants";
import { ListingStatus, Prisma } from "@prisma/client";
import { generateListingJsonLd } from "@/lib/seo";
import { detectScamSignals } from "@/lib/scam-detector";
import { calculateQualityScore } from "@/lib/listing-quality";
import { calculateResponseRate } from "@/lib/response-rate";
import { calculateDealScore } from "@/lib/deal-score";
import ListingActions from "./ListingActions";
import ListingLocationMap from "./ListingLocationMap";
import SocialProof from "@/components/SocialProof";
import ScamWarning from "@/components/ScamWarning";
import QualityScore from "@/components/QualityScore";
import ResponseRate from "@/components/ResponseRate";
import DealScoreBadge from "@/components/DealScoreBadge";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    select: {
      title: true,
      description: true,
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
  });

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  const description = listing.description
    ? listing.description.length > 160
      ? listing.description.slice(0, 157) + "..."
      : listing.description
    : `Check out ${listing.title} on Zambia.net Marketplace`;

  const images = listing.images.map((img) => img.url);

  return {
    title: `${listing.title} | Zambia.net Marketplace`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: listing.title,
      description,
      images,
    },
  };
}

export default async function ListingDetailPage({ params }: PageProps) {
  const { id } = await params;

  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      user: {
        select: {
          id: true,
          name: true,
          phone: true,
          isVerified: true,
          avatarUrl: true,
          location: true,
          createdAt: true,
        },
      },
      category: { select: { id: true, name: true, slug: true } },
      subcategory: { select: { id: true, name: true, slug: true } },
    },
  });

  if (!listing) notFound();

  // Increment views in the background
  prisma.listing
    .update({
      where: { id },
      data: { viewsCount: { increment: 1 } },
    })
    .catch(() => {});

  // Fetch favourites count for social proof
  const favouritesCount = await prisma.favourite.count({
    where: { listingId: id },
  });

  // Fetch seller review stats
  const sellerReviewAgg = await prisma.review.aggregate({
    where: { sellerId: listing.user.id },
    _avg: { rating: true },
    _count: { rating: true },
  });
  const sellerAvgRating = sellerReviewAgg._avg.rating
    ? Math.round(sellerReviewAgg._avg.rating * 10) / 10
    : 0;
  const sellerReviewCount = sellerReviewAgg._count.rating;

  // Trust & Safety: compute scores in parallel
  const currentUser = await getCurrentUser().catch(() => null);

  const [scamResult, qualityResult, responseRateResult, dealScoreResult] =
    await Promise.all([
      detectScamSignals(
        {
          title: listing.title,
          description: listing.description,
          price: listing.price,
          categoryId: listing.categoryId,
        },
        prisma
      ),
      Promise.resolve(
        calculateQualityScore({
          title: listing.title,
          description: listing.description,
          price: listing.price,
          priceType: listing.priceType,
          location: listing.location,
          condition: listing.condition,
          categoryId: listing.categoryId,
          subcategoryId: listing.subcategoryId,
          images: listing.images,
        })
      ),
      calculateResponseRate(listing.user.id),
      calculateDealScore(
        {
          price: listing.price,
          priceType: listing.priceType,
          categoryId: listing.categoryId,
        },
        prisma
      ),
    ]);

  const isOwner = currentUser?.id === listing.user.id;

  // Fetch similar listings with improved relevance
  const similarWhere: Prisma.ListingWhereInput = {
    categoryId: listing.categoryId,
    id: { not: listing.id },
    status: ListingStatus.ACTIVE,
  };

  // Prefer similar location if listing has one
  if (listing.location) {
    similarWhere.location = { contains: listing.location, mode: "insensitive" };
  }

  // Prefer similar price range (within 50%) if listing has a price
  if (listing.price) {
    const priceNum = Number(listing.price);
    const lowerBound = new Prisma.Decimal(priceNum * 0.5);
    const upperBound = new Prisma.Decimal(priceNum * 1.5);
    similarWhere.price = { gte: lowerBound, lte: upperBound };
  }

  let similarListings = await prisma.listing.findMany({
    where: similarWhere,
    take: 4,
    orderBy: [
      { isBoosted: "desc" },
      { isFeatured: "desc" },
      { createdAt: "desc" },
    ],
    include: {
      images: { take: 1, orderBy: { sortOrder: "asc" } },
      user: {
        select: { id: true, name: true, isVerified: true, avatarUrl: true },
      },
      category: { select: { name: true } },
    },
  });

  // If too few results with strict filters, relax to just same category
  if (similarListings.length < 4) {
    similarListings = await prisma.listing.findMany({
      where: {
        categoryId: listing.categoryId,
        id: { not: listing.id },
        status: ListingStatus.ACTIVE,
      },
      take: 4,
      orderBy: [
        { isBoosted: "desc" },
        { isFeatured: "desc" },
        { createdAt: "desc" },
      ],
      include: {
        images: { take: 1, orderBy: { sortOrder: "asc" } },
        user: {
          select: { id: true, name: true, isVerified: true, avatarUrl: true },
        },
        category: { select: { name: true } },
      },
    });
  }

  const mainImage = listing.images[0]?.url ?? null;
  const priceDisplay =
    listing.priceType === "FREE"
      ? "Free"
      : listing.priceType === "CONTACT"
        ? "Contact for Price"
        : formatPrice(listing.price as unknown as number);

  const jsonLd = generateListingJsonLd(listing);

  return (
    <div className="min-h-screen bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-1 text-sm text-gray-500 mb-4">
          <Link href="/" className="hover:text-blue-600">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href={`/?category=${listing.category.slug}`} className="hover:text-blue-600">
            {listing.category.name}
          </Link>
          {listing.subcategory && (
            <>
              <ChevronRight className="w-4 h-4" />
              <span className="text-gray-700">{listing.subcategory.name}</span>
            </>
          )}
        </nav>

        {/* Scam warning banner */}
        {scamResult.warnings.length > 0 && (
          <ScamWarning
            warnings={scamResult.warnings}
            isHighRisk={scamResult.isHighRisk}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column: images + details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image gallery */}
            <ImageGallery
              images={listing.images}
              title={listing.title}
            />

            {/* Title and price */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {listing.title}
                  </h1>
                  <p className="text-3xl font-bold text-blue-600 mt-2">
                    {priceDisplay}
                    {listing.priceType === "NEGOTIABLE" && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {PRICE_TYPE_LABELS.NEGOTIABLE}
                      </span>
                    )}
                    {listing.priceType === "SWAP" && (
                      <span className="text-sm font-normal text-gray-500 ml-2">
                        {PRICE_TYPE_LABELS.SWAP}
                      </span>
                    )}
                  </p>
                  {dealScoreResult.score && (
                    <div className="mt-2">
                      <DealScoreBadge
                        score={dealScoreResult.score}
                        percentage={dealScoreResult.percentage}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap items-center gap-3 mt-4 text-sm text-gray-500">
                {listing.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Posted {timeAgo(listing.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {listing.viewsCount + 1} views
                </span>
                <span className="inline-flex items-center bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">
                  {CONDITION_LABELS[listing.condition] || listing.condition}
                </span>
              </div>

              {/* Social proof indicators */}
              <SocialProof
                viewsCount={listing.viewsCount + 1}
                favouritesCount={favouritesCount}
                whatsappClicks={listing.whatsappClicks}
                createdAt={listing.createdAt.toISOString()}
              />
            </div>

            {/* Description */}
            {listing.description && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Description
                </h2>
                <div className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {listing.description}
                </div>
              </div>
            )}

            {/* Location Map */}
            {listing.latitude != null && listing.longitude != null && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">
                  Location
                </h2>
                <ListingLocationMap
                  latitude={Number(listing.latitude)}
                  longitude={Number(listing.longitude)}
                  title={listing.title}
                />
              </div>
            )}
          </div>

          {/* Right column: actions + seller info */}
          <div className="space-y-4">
            {/* Actions */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <ListingActions
                listingId={listing.id}
                sellerPhone={listing.user.phone}
                listingTitle={listing.title}
                listingPrice={listing.price as unknown as string | number | null}
              />
            </div>

            {/* Quality score - visible only to listing owner */}
            {isOwner && (
              <QualityScore
                score={qualityResult.score}
                grade={qualityResult.grade}
                tips={qualityResult.tips}
              />
            )}

            {/* Seller info */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Seller
              </h3>
              <Link
                href={`/sellers/${listing.user.id}`}
                className="flex items-center gap-3 group"
              >
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {listing.user.avatarUrl ? (
                    <img
                      src={listing.user.avatarUrl}
                      alt={listing.user.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-lg text-gray-500 font-medium">
                      {listing.user.name[0]}
                    </span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {listing.user.name}
                    </span>
                    {listing.user.isVerified && (
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Member since{" "}
                    {new Date(listing.user.createdAt).toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )}
                  </p>
                </div>
              </Link>
              {sellerAvgRating > 0 && (
                <div className="flex items-center gap-1.5 mt-2 ml-15">
                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm font-medium text-gray-900">
                    {sellerAvgRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-gray-500">
                    ({sellerReviewCount} {sellerReviewCount === 1 ? "review" : "reviews"})
                  </span>
                </div>
              )}
              <ResponseRate
                rate={responseRateResult.rate}
                label={responseRateResult.label}
              />
              {listing.user.location && (
                <p className="flex items-center gap-1 text-sm text-gray-500 mt-3">
                  <MapPin className="w-3.5 h-3.5" />
                  {listing.user.location}
                </p>
              )}
              <div className="flex gap-2 mt-4">
                <Link
                  href={`/sellers/${listing.user.id}`}
                  className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  View all listings
                </Link>
                <Link
                  href={`/sellers/${listing.user.id}#reviews`}
                  className="flex-1 text-center py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Reviews
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Similar listings */}
        {similarListings.length > 0 && (
          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Similar Listings
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarListings.map((item) => {
                const imgUrl =
                  item.images[0]?.url ?? null;
                const itemPrice =
                  item.priceType === "FREE"
                    ? "Free"
                    : item.priceType === "CONTACT"
                      ? "Contact"
                      : formatPrice(item.price as unknown as number);

                return (
                  <Link
                    key={item.id}
                    href={`/listings/${item.id}`}
                    className="group block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="aspect-[4/3] bg-gray-100">
                      {imgUrl ? (
                        <img
                          src={imgUrl}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
                          📦
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-base font-bold text-blue-600 mt-1">
                        {itemPrice}
                      </p>
                      {item.location && (
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          {item.location}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Image Gallery (server component) ─── */

function ImageGallery({
  images,
  title,
}: {
  images: { id: string; url: string; thumbnailUrl: string | null }[];
  title: string;
}) {
  if (images.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="aspect-[16/10] bg-gray-100 flex items-center justify-center text-gray-400">
          <div className="text-center">
            <span className="text-6xl block mb-2">📷</span>
            <span className="text-sm">No images available</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Main image */}
      <div className="aspect-[16/10] bg-gray-100">
        <img
          src={images[0].url}
          alt={title}
          className="w-full h-full object-contain bg-gray-50"
        />
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 p-3 overflow-x-auto">
          {images.map((img) => (
            <div
              key={img.id}
              className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-colors cursor-pointer"
            >
              <img
                src={img.thumbnailUrl || img.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
