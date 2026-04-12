interface ListingForJsonLd {
  id: string;
  title: string;
  description: string | null;
  price: unknown;
  images: { url: string }[];
  user: { name: string };
}

export function generateListingJsonLd(listing: ListingForJsonLd) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:7333";

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description ?? undefined,
    image: listing.images.map((img) => img.url),
    url: `${appUrl}/listings/${listing.id}`,
    offers: {
      "@type": "Offer",
      price: listing.price ? Number(listing.price) : 0,
      priceCurrency: "ZMW",
      availability: "https://schema.org/InStock",
    },
    seller: {
      "@type": "Person",
      name: listing.user.name,
    },
  };
}
