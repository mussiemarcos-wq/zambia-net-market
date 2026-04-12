import { ImageResponse } from "next/og";
import { prisma } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const listing = await prisma.listing.findUnique({
      where: { id },
      select: {
        title: true,
        price: true,
        priceType: true,
        location: true,
        category: { select: { name: true } },
      },
    });

    if (!listing) {
      return new Response("Listing not found", { status: 404 });
    }

    const priceDisplay =
      listing.priceType === "FREE"
        ? "Free"
        : listing.priceType === "CONTACT"
          ? "Contact for Price"
          : formatPrice(listing.price as unknown as number);

    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#ffffff",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          {/* Blue header bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor: "#1d4ed8",
              padding: "24px 48px",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#ffffff",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "20px",
                  fontWeight: 700,
                  color: "#1d4ed8",
                }}
              >
                Z
              </div>
              <span
                style={{
                  color: "#ffffff",
                  fontSize: "24px",
                  fontWeight: 700,
                }}
              >
                Zambia.net Marketplace
              </span>
            </div>
            {listing.category?.name && (
              <span
                style={{
                  color: "#bfdbfe",
                  fontSize: "18px",
                  fontWeight: 500,
                }}
              >
                {listing.category.name}
              </span>
            )}
          </div>

          {/* Main content area */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
              padding: "48px",
              justifyContent: "center",
              gap: "24px",
            }}
          >
            {/* Category tag */}
            {listing.category?.name && (
              <div
                style={{
                  display: "flex",
                }}
              >
                <span
                  style={{
                    backgroundColor: "#eff6ff",
                    color: "#1d4ed8",
                    fontSize: "18px",
                    fontWeight: 600,
                    padding: "6px 16px",
                    borderRadius: "20px",
                  }}
                >
                  {listing.category.name}
                </span>
              </div>
            )}

            {/* Listing title */}
            <h1
              style={{
                fontSize: "52px",
                fontWeight: 800,
                color: "#111827",
                lineHeight: 1.15,
                margin: 0,
                maxWidth: "900px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
              }}
            >
              {listing.title}
            </h1>

            {/* Price */}
            <p
              style={{
                fontSize: "48px",
                fontWeight: 800,
                color: "#1d4ed8",
                margin: 0,
              }}
            >
              {priceDisplay}
            </p>

            {/* Location */}
            {listing.location && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                }}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#6b7280"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span
                  style={{
                    fontSize: "22px",
                    color: "#6b7280",
                    fontWeight: 500,
                  }}
                >
                  {listing.location}
                </span>
              </div>
            )}
          </div>

          {/* Bottom CTA bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f0f9ff",
              borderTop: "2px solid #bfdbfe",
              padding: "20px 48px",
              width: "100%",
            }}
          >
            <span
              style={{
                color: "#1d4ed8",
                fontSize: "20px",
                fontWeight: 600,
              }}
            >
              View on Zambia.net Marketplace
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch {
    return new Response("Error generating image", { status: 500 });
  }
}
