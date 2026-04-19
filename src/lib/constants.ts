export const APP_NAME = "Zambia.net Marketplace";

export const CATEGORIES_WITH_SUBS = [
  {
    name: "Property",
    slug: "property",
    icon: "🏠",
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
    subcategories: [
      { name: "Cars", slug: "vehicles-cars" },
      { name: "Trucks", slug: "vehicles-trucks" },
      { name: "Motorcycles", slug: "vehicles-motorcycles" },
      { name: "Parts & Accessories", slug: "vehicles-parts" },
      { name: "Equipment & Machinery", slug: "vehicles-equipment" },
    ],
  },
  {
    name: "Jobs",
    slug: "jobs",
    icon: "💼",
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
    subcategories: [
      { name: "Clothing", slug: "fashion-clothing" },
      { name: "Shoes", slug: "fashion-shoes" },
      { name: "Accessories", slug: "fashion-accessories" },
    ],
  },
  {
    name: "Miscellaneous",
    slug: "miscellaneous",
    icon: "📦",
    subcategories: [
      { name: "Books & Stationery", slug: "misc-books" },
      { name: "Pets & Animals", slug: "misc-pets" },
      { name: "Sports & Fitness", slug: "misc-sports" },
      { name: "Hobbies & Collectibles", slug: "misc-hobbies" },
      { name: "Kids & Baby", slug: "misc-kids" },
      { name: "Health & Beauty", slug: "misc-health" },
      { name: "Food & Agriculture", slug: "misc-food" },
      { name: "Other", slug: "misc-other" },
    ],
  },
];

export const LISTING_LIMITS = {
  FREE_MAX_LISTINGS: 3,
  FREE_MAX_IMAGES: 4,
  PAID_MAX_IMAGES: 4,
  FREE_EXPIRY_DAYS: 30,
  PAID_EXPIRY_DAYS: 60,
};

export const PRICE_TYPE_LABELS: Record<string, string> = {
  FIXED: "Fixed Price",
  NEGOTIABLE: "Negotiable",
  FREE: "Free",
  SWAP: "Swap / Trade",
  CONTACT: "Contact for Price",
};

export const CONDITION_LABELS: Record<string, string> = {
  NEW: "Brand New",
  USED: "Used",
  REFURBISHED: "Refurbished",
};

// Boost pricing (amounts in ZMW ngwee - Paystack uses smallest currency unit)
export const BOOST_PLANS = [
  { id: "boost_7", label: "7 Days", days: 7, price: 50, priceNgwee: 5000 },
  { id: "boost_14", label: "14 Days", days: 14, price: 80, priceNgwee: 8000 },
  { id: "boost_30", label: "30 Days", days: 30, price: 120, priceNgwee: 12000 },
];

export const FEATURE_PLANS = [
  { id: "feature_7", label: "7 Days", days: 7, price: 100, priceNgwee: 10000 },
  { id: "feature_14", label: "14 Days", days: 14, price: 180, priceNgwee: 18000 },
  { id: "feature_30", label: "30 Days", days: 30, price: 300, priceNgwee: 30000 },
];

export const SUBSCRIPTION_PLANS = [
  {
    id: "basic",
    name: "Basic",
    price: 150,
    priceNgwee: 15000,
    features: ["10 active listings", "Basic analytics", "60-day listing expiry"],
  },
  {
    id: "standard",
    name: "Standard",
    price: 300,
    priceNgwee: 30000,
    features: ["25 active listings", "Full analytics", "90-day listing expiry", "1 free boost/month"],
  },
  {
    id: "premium",
    name: "Premium",
    price: 500,
    priceNgwee: 50000,
    features: ["Unlimited listings", "Full analytics", "90-day listing expiry", "3 free boosts/month", "Priority support"],
  },
];

export const VERIFICATION_FEE = { price: 25, priceNgwee: 2500 };

export const BANNER_PLANS = [
  { id: "banner_homepage_7", label: "Homepage - 7 Days", placement: "homepage", days: 7, price: 200, priceNgwee: 20000 },
  { id: "banner_homepage_14", label: "Homepage - 14 Days", placement: "homepage", days: 14, price: 350, priceNgwee: 35000 },
  { id: "banner_category_7", label: "Category Page - 7 Days", placement: "category", days: 7, price: 100, priceNgwee: 10000 },
  { id: "banner_category_14", label: "Category Page - 14 Days", placement: "category", days: 14, price: 180, priceNgwee: 18000 },
];

// Premium vertical packages
export const SERVICE_PROVIDER_PLANS = [
  {
    id: "service_basic",
    name: "Basic",
    price: 100,
    priceNgwee: 10000,
    features: ["5 service listings", "Profile page", "WhatsApp & Telegram contact"],
  },
  {
    id: "service_pro",
    name: "Professional",
    price: 250,
    priceNgwee: 25000,
    features: ["15 service listings", "Profile page", "Priority in search", "Lead notifications", "Response analytics"],
  },
  {
    id: "service_premium",
    name: "Premium",
    price: 500,
    priceNgwee: 50000,
    features: ["Unlimited listings", "Featured profile", "Top of search", "Lead notifications", "Full analytics", "Verified badge"],
  },
];

export const LEAD_FEE = { price: 5, priceNgwee: 500 }; // Per lead/enquiry

export const JOB_POSTING_PLANS = [
  {
    id: "job_single",
    name: "Single Posting",
    price: 50,
    priceNgwee: 5000,
    days: 30,
    features: ["1 job listing", "30-day visibility", "Basic applicant tracking"],
  },
  {
    id: "job_pack_5",
    name: "5-Pack",
    price: 200,
    priceNgwee: 20000,
    days: 60,
    features: ["5 job listings", "60-day visibility", "Applicant tracking", "Featured in Jobs"],
  },
  {
    id: "job_unlimited",
    name: "Recruiter Monthly",
    price: 500,
    priceNgwee: 50000,
    days: 30,
    features: ["Unlimited job listings", "60-day visibility", "Full applicant tracking", "Featured placement", "Company profile", "CV database access"],
  },
];

export const PROPERTY_AGENT_PLANS = [
  {
    id: "agent_starter",
    name: "Starter",
    price: 200,
    priceNgwee: 20000,
    features: ["10 property listings", "Agent profile page", "Contact tracking", "60-day listing expiry"],
  },
  {
    id: "agent_professional",
    name: "Professional",
    price: 500,
    priceNgwee: 50000,
    features: ["50 property listings", "Featured agent profile", "Lead notifications", "Priority placement", "Full analytics", "90-day expiry"],
  },
  {
    id: "agent_agency",
    name: "Agency",
    price: 1500,
    priceNgwee: 150000,
    features: ["Unlimited listings", "Agency branding page", "Multiple agent accounts", "Top of search", "Full analytics", "Verified agency badge", "API access"],
  },
];

// Promoted / Sponsored Categories
export const SPONSORED_CATEGORY_PLANS = [
  {
    id: "sponsor_category_7",
    name: "Category Sponsor - 7 Days",
    days: 7,
    price: 500,
    priceNgwee: 50000,
    features: ["Logo on category page", "Branded category header", "All listings see your brand"],
  },
  {
    id: "sponsor_category_30",
    name: "Category Sponsor - 30 Days",
    days: 30,
    price: 1500,
    priceNgwee: 150000,
    features: ["Logo on category page", "Branded category header", "All listings see your brand", "Monthly analytics report"],
  },
  {
    id: "sponsor_homepage",
    name: "Homepage Sponsor - 30 Days",
    days: 30,
    price: 5000,
    priceNgwee: 500000,
    features: ["Logo on homepage", "Featured brand section", "Top visibility across all categories"],
  },
];

// Auto-Dealer Packages
export const AUTO_DEALER_PLANS = [
  {
    id: "dealer_starter",
    name: "Starter",
    price: 300,
    priceNgwee: 30000,
    features: ["15 vehicle listings", "Dealer profile page", "Contact tracking", "60-day listing expiry"],
  },
  {
    id: "dealer_professional",
    name: "Professional",
    price: 800,
    priceNgwee: 80000,
    features: ["50 vehicle listings", "Featured dealer profile", "Lead notifications", "Priority in search", "Full analytics", "90-day expiry"],
  },
  {
    id: "dealer_enterprise",
    name: "Enterprise",
    price: 2000,
    priceNgwee: 200000,
    features: ["Unlimited listings", "Branded dealership page", "Inventory management", "Top of search", "Full analytics", "API access", "Verified dealer badge"],
  },
];

// Data & Insights Subscriptions
export const DATA_INSIGHTS_PLANS = [
  {
    id: "insights_basic",
    name: "Market Watch",
    price: 200,
    priceNgwee: 20000,
    features: ["Weekly market trends report", "Category price averages", "Top searched items", "Basic demand data"],
  },
  {
    id: "insights_professional",
    name: "Business Intelligence",
    price: 1000,
    priceNgwee: 100000,
    features: ["Daily market trends", "Price history & forecasts", "Demand heatmaps by location", "Competitor analysis", "Custom category reports", "Export to CSV"],
  },
  {
    id: "insights_enterprise",
    name: "Enterprise Data",
    price: 5000,
    priceNgwee: 500000,
    features: ["Real-time market data", "Full API access", "Custom dashboards", "Predictive analytics", "Dedicated account manager", "White-label reports"],
  },
];

// API Access Plans
export const API_ACCESS_PLANS = [
  {
    id: "api_starter",
    name: "Starter API",
    price: 500,
    priceNgwee: 50000,
    features: ["1,000 API calls/month", "Read-only access", "Listing search & browse", "Category data"],
  },
  {
    id: "api_business",
    name: "Business API",
    price: 2000,
    priceNgwee: 200000,
    features: ["10,000 API calls/month", "Read + Write access", "Bulk listing upload", "Inventory sync", "Webhook notifications"],
  },
  {
    id: "api_enterprise",
    name: "Enterprise API",
    price: 10000,
    priceNgwee: 1000000,
    features: ["Unlimited API calls", "Full read/write access", "Real-time webhooks", "Dedicated support", "Custom endpoints", "SLA guarantee"],
  },
];
