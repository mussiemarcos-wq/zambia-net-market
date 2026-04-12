import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const CATEGORIES = [
  {
    name: "Property",
    slug: "property",
    icon: "🏠",
    sortOrder: 1,
    subcategories: [
      { name: "Rentals", slug: "property-rentals" },
      { name: "Sales", slug: "property-sales" },
      { name: "Land", slug: "property-land" },
      { name: "Commercial", slug: "property-commercial" },
      { name: "Roommates", slug: "property-roommates" },
    ],
  },
  {
    name: "Vehicles",
    slug: "vehicles",
    icon: "🚗",
    sortOrder: 2,
    subcategories: [
      { name: "Cars", slug: "vehicles-cars" },
      { name: "Trucks", slug: "vehicles-trucks" },
      { name: "Motorcycles", slug: "vehicles-motorcycles" },
      { name: "Parts & Accessories", slug: "vehicles-parts" },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "💼",
    sortOrder: 3,
    subcategories: [
      { name: "Full-time", slug: "jobs-fulltime" },
      { name: "Part-time", slug: "jobs-parttime" },
      { name: "Freelance", slug: "jobs-freelance" },
      { name: "Skilled Trades", slug: "jobs-trades" },
    ],
  },
  {
    name: "Services",
    slug: "services",
    icon: "🔧",
    sortOrder: 4,
    subcategories: [
      { name: "Plumbing", slug: "services-plumbing" },
      { name: "Electrical", slug: "services-electrical" },
      { name: "Construction", slug: "services-construction" },
      { name: "Cleaning", slug: "services-cleaning" },
      { name: "Transport", slug: "services-transport" },
    ],
  },
  {
    name: "Building Materials",
    slug: "building-materials",
    icon: "🧱",
    sortOrder: 5,
    subcategories: [
      { name: "Cement & Sand", slug: "building-cement" },
      { name: "Timber", slug: "building-timber" },
      { name: "Steel & Metal", slug: "building-steel" },
      { name: "Tools & Hardware", slug: "building-tools" },
    ],
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📱",
    sortOrder: 6,
    subcategories: [
      { name: "Phones", slug: "electronics-phones" },
      { name: "Laptops & Computers", slug: "electronics-laptops" },
      { name: "TVs & Audio", slug: "electronics-tvs" },
      { name: "Appliances", slug: "electronics-appliances" },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "🪑",
    sortOrder: 7,
    subcategories: [
      { name: "Home Furniture", slug: "furniture-home" },
      { name: "Office Furniture", slug: "furniture-office" },
      { name: "Garden & Outdoor", slug: "furniture-garden" },
    ],
  },
  {
    name: "Fashion",
    slug: "fashion",
    icon: "👗",
    sortOrder: 8,
    subcategories: [
      { name: "Clothing", slug: "fashion-clothing" },
      { name: "Shoes", slug: "fashion-shoes" },
      { name: "Accessories", slug: "fashion-accessories" },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  // Create categories and subcategories
  for (const cat of CATEGORIES) {
    const category = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, icon: cat.icon, sortOrder: cat.sortOrder },
      create: {
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        sortOrder: cat.sortOrder,
      },
    });

    for (const sub of cat.subcategories) {
      await prisma.subcategory.upsert({
        where: { slug: sub.slug },
        update: { name: sub.name, categoryId: category.id },
        create: {
          name: sub.name,
          slug: sub.slug,
          categoryId: category.id,
        },
      });
    }
    console.log(`  ✓ ${cat.name} (${cat.subcategories.length} subcategories)`);
  }

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12);
  await prisma.user.upsert({
    where: { phone: "+1000000000" },
    update: {},
    create: {
      name: "Admin",
      phone: "+1000000000",
      email: "admin@markethub.com",
      passwordHash: adminPassword,
      role: "SUPER_ADMIN",
      isVerified: true,
      location: "Headquarters",
    },
  });
  console.log("  ✓ Admin user created (phone: +1000000000, password: admin123)");

  // Create demo seller
  const sellerPassword = await bcrypt.hash("seller123", 12);
  const seller = await prisma.user.upsert({
    where: { phone: "+1111111111" },
    update: {},
    create: {
      name: "Demo Seller",
      phone: "+1111111111",
      email: "seller@markethub.com",
      passwordHash: sellerPassword,
      role: "SELLER",
      isVerified: true,
      location: "Downtown",
    },
  });
  console.log("  ✓ Demo seller created (phone: +1111111111, password: seller123)");

  // Create sample listings
  const categories = await prisma.category.findMany({
    include: { subcategories: true },
  });

  const sampleListings = [
    {
      title: "3 Bedroom House for Rent - Central Location",
      description:
        "Spacious 3 bedroom house with garden, parking, and modern finishes. Close to schools and shops.",
      price: 1200,
      priceType: "FIXED" as const,
      categorySlug: "property",
      subSlug: "property-rentals",
      condition: "USED" as const,
      location: "Central",
    },
    {
      title: "2018 Toyota Hilux Double Cab",
      description:
        "Well maintained, full service history. 85,000 km. New tyres, leather seats.",
      price: 25000,
      priceType: "NEGOTIABLE" as const,
      categorySlug: "vehicles",
      subSlug: "vehicles-trucks",
      condition: "USED" as const,
      location: "Industrial Area",
    },
    {
      title: "iPhone 15 Pro Max 256GB - Brand New Sealed",
      description:
        "Brand new, sealed in box. Full warranty. Natural Titanium colour.",
      price: 999,
      priceType: "FIXED" as const,
      categorySlug: "electronics",
      subSlug: "electronics-phones",
      condition: "NEW" as const,
      location: "City Centre",
    },
    {
      title: "Experienced Plumber Available",
      description:
        "Licensed plumber with 10+ years experience. Available for repairs, installations, and maintenance. Free quotes.",
      price: null,
      priceType: "CONTACT" as const,
      categorySlug: "services",
      subSlug: "services-plumbing",
      condition: "NEW" as const,
      location: "All Areas",
    },
    {
      title: "Office Desk and Chair Set",
      description:
        "Modern office desk with drawers and ergonomic chair. Perfect condition, barely used.",
      price: 350,
      priceType: "NEGOTIABLE" as const,
      categorySlug: "furniture",
      subSlug: "furniture-office",
      condition: "USED" as const,
      location: "Suburb",
    },
    {
      title: "Software Developer - Full Stack (Remote)",
      description:
        "Hiring a full-stack developer. React/Node.js experience required. Remote work, competitive salary.",
      price: null,
      priceType: "CONTACT" as const,
      categorySlug: "jobs",
      subSlug: "jobs-fulltime",
      condition: "NEW" as const,
      location: "Remote",
    },
    {
      title: "50 Bags Portland Cement - Wholesale Price",
      description:
        "PPC cement, 50kg bags. Minimum order 10 bags. Delivery available.",
      price: 8,
      priceType: "FIXED" as const,
      categorySlug: "building-materials",
      subSlug: "building-cement",
      condition: "NEW" as const,
      location: "Industrial Zone",
    },
    {
      title: "Designer Sneakers Collection - Size 10",
      description:
        "Various designer sneakers, all size 10 US. Nike, Adidas, Jordan. Good condition.",
      price: 150,
      priceType: "NEGOTIABLE" as const,
      categorySlug: "fashion",
      subSlug: "fashion-shoes",
      condition: "USED" as const,
      location: "Mall Area",
    },
  ];

  for (const listing of sampleListings) {
    const cat = categories.find((c) => c.slug === listing.categorySlug);
    const sub = cat?.subcategories.find((s) => s.slug === listing.subSlug);
    if (!cat) continue;

    await prisma.listing.create({
      data: {
        title: listing.title,
        description: listing.description,
        price: listing.price,
        priceType: listing.priceType,
        categoryId: cat.id,
        subcategoryId: sub?.id,
        condition: listing.condition,
        location: listing.location,
        status: "ACTIVE",
        userId: seller.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
    console.log(`  ✓ Listing: ${listing.title.slice(0, 40)}...`);
  }

  console.log("\nSeeding complete!");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
