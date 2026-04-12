import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import ListingCard from "@/components/ListingCard";
import { Heart } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Favourites - Zambia.net Market",
};

export default async function FavouritesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const favourites = await prisma.favourite.findMany({
    where: { userId: user.id },
    include: {
      listing: {
        include: {
          images: {
            orderBy: { sortOrder: "asc" },
            take: 1,
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
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const listings = favourites.map((fav) => ({
    id: fav.listing.id,
    title: fav.listing.title,
    price: fav.listing.price ? fav.listing.price.toString() : null,
    priceType: fav.listing.priceType,
    location: fav.listing.location,
    condition: fav.listing.condition,
    isFeatured: fav.listing.isFeatured,
    isBoosted: fav.listing.isBoosted,
    viewsCount: fav.listing.viewsCount,
    createdAt: fav.listing.createdAt.toISOString(),
    images: fav.listing.images.map((img) => ({
      url: img.url,
      thumbnailUrl: img.thumbnailUrl,
    })),
    user: fav.listing.user,
    category: fav.listing.category,
  }));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Saved Listings</h1>
        <p className="text-sm text-gray-500 mt-1">
          {listings.length > 0
            ? `You have ${listings.length} saved listing${listings.length !== 1 ? "s" : ""}.`
            : "Your saved listings will appear here."}
        </p>
      </div>

      {listings.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            No saved listings yet
          </h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Browse listings to save your favourites. Tap the heart icon on any
            listing to add it here.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
          >
            Browse Listings
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} isFavourited />
          ))}
        </div>
      )}
    </div>
  );
}
