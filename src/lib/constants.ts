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
