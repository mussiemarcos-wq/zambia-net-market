import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { success, error, unauthorized } from "@/lib/api";
import { LISTING_LIMITS } from "@/lib/constants";
import { ListingStatus, Prisma } from "@prisma/client";
import { detectScamSignals } from "@/lib/scam-detector";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;

    const page = Math.max(1, parseInt(searchParams.get("page") || "1"));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20")));
    const category = searchParams.get("category");
    const subcategory = searchParams.get("subcategory");
    const search = searchParams.get("search");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const condition = searchParams.get("condition");
    const location = searchParams.get("location");
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");
    const radius = parseFloat(searchParams.get("radius") || "10");
    const sort = searchParams.get("sort") || "newest";

    const where: Prisma.ListingWhereInput = {
      status: ListingStatus.ACTIVE,
    };

    if (category) {
      // Support both slug and UUID for category filter
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(category);
      if (isUuid) {
        where.categoryId = category;
      } else {
        where.category = { slug: category };
      }
    }

    if (subcategory) {
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subcategory);
      if (isUuid) {
        where.subcategoryId = subcategory;
      } else {
        where.subcategory = { slug: subcategory };
      }
    }

    if (search) {
      where.title = { contains: search, mode: "insensitive" };
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = new Prisma.Decimal(minPrice);
      if (maxPrice) where.price.lte = new Prisma.Decimal(maxPrice);
    }

    if (condition) {
      where.condition = condition as Prisma.EnumItemConditionFilter;
    }

    if (location) {
      where.location = { contains: location, mode: "insensitive" };
    }

    if (lat && lng) {
      const latNum = parseFloat(lat);
      const lngNum = parseFloat(lng);
      const deltaLat = radius / 111;
      const deltaLng = radius / (111 * Math.cos(latNum * Math.PI / 180));
      where.latitude = {
        not: null,
        gte: new Prisma.Decimal(latNum - deltaLat),
        lte: new Prisma.Decimal(latNum + deltaLat),
      };
      where.longitude = {
        not: null,
        gte: new Prisma.Decimal(lngNum - deltaLng),
        lte: new Prisma.Decimal(lngNum + deltaLng),
      };
    }

    // Build sort order: boosted first, then featured, then user-selected sort
    const orderBy: Prisma.ListingOrderByWithRelationInput[] = [
      { isBoosted: "desc" },
      { isFeatured: "desc" },
    ];

    switch (sort) {
      case "price_asc":
        orderBy.push({ price: "asc" });
        break;
      case "price_desc":
        orderBy.push({ price: "desc" });
        break;
      case "popular":
        orderBy.push({ viewsCount: "desc" });
        break;
      case "newest":
      default:
        orderBy.push({ createdAt: "desc" });
        break;
    }

    const skip = (page - 1) * limit;

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: {
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
          },
          user: {
            select: {
              id: true,
              name: true,
              isVerified: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    // Fire-and-forget: log search query to SearchLog for demand gap analysis
    if (search) {
      const user = await getCurrentUser().catch(() => null);
      prisma.searchLog.create({
        data: {
          query: search,
          resultCount: total,
          categorySlug: category || null,
          userId: user?.id || null,
        },
      }).catch(() => {});
    }

    return success({ listings, total, page, totalPages });
  } catch (err) {
    console.error("GET /api/listings error:", err);
    return error("Failed to fetch listings", 500);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();

    // Phone verification required to post listings (anti-spam measure)
    if (!user.isPhoneVerified && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return error(
        "Please verify your phone number before posting a listing.",
        403
      );
    }

    const body = await request.json();
    const { title, description, price, priceType, categoryId, subcategoryId, condition, location, latitude, longitude } = body;

    if (!title || !categoryId) {
      return error("Title and category are required");
    }

    // Enforce listing limit for free (MEMBER) users
    if (user.role === "MEMBER") {
      const activeCount = await prisma.listing.count({
        where: {
          userId: user.id,
          status: ListingStatus.ACTIVE,
        },
      });

      if (activeCount >= LISTING_LIMITS.FREE_MAX_LISTINGS) {
        return error(
          `Free accounts are limited to ${LISTING_LIMITS.FREE_MAX_LISTINGS} active listings. Upgrade to post more.`,
          403
        );
      }
    }

    // Determine expiry based on role
    const isPaidRole = user.role !== "MEMBER";
    const expiryDays = isPaidRole
      ? LISTING_LIMITS.PAID_EXPIRY_DAYS
      : LISTING_LIMITS.FREE_EXPIRY_DAYS;

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    // Run scam detection before creating the listing
    const scamResult = await detectScamSignals(
      {
        title,
        description: description || null,
        price: price != null ? new Prisma.Decimal(price) : null,
        categoryId,
      },
      prisma
    );

    // Determine listing status based on scam score
    const listingStatus = scamResult.score > 60 ? "DRAFT" as const : "ACTIVE" as const;

    const listing = await prisma.listing.create({
      data: {
        userId: user.id,
        title,
        description: description || null,
        price: price != null ? new Prisma.Decimal(price) : null,
        priceType: priceType || "FIXED",
        categoryId,
        subcategoryId: subcategoryId || null,
        condition: condition || "USED",
        location: location || null,
        latitude: latitude != null ? new Prisma.Decimal(latitude) : null,
        longitude: longitude != null ? new Prisma.Decimal(longitude) : null,
        status: listingStatus,
        expiresAt,
      },
      include: {
        images: true,
        category: { select: { id: true, name: true, slug: true } },
        subcategory: { select: { id: true, name: true, slug: true } },
      },
    });

    return success(
      {
        ...listing,
        _meta: {
          scamScore: scamResult.score,
          scamWarnings: scamResult.warnings,
          flaggedForReview: scamResult.score > 30,
          statusOverride:
            scamResult.score > 60
              ? "Listing saved as draft due to high risk signals. Please review and edit before publishing."
              : null,
        },
      },
      201
    );
  } catch (err) {
    console.error("POST /api/listings error:", err);
    return error("Failed to create listing", 500);
  }
}
