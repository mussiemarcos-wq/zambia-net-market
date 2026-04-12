export function formatPrice(price: number | string | null | undefined): string {
  if (price == null) return "Contact for price";
  const num = typeof price === "string" ? parseFloat(price) : price;
  return "K" + new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

export function timeAgo(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4) return `${weeks}w ago`;
  return d.toLocaleDateString();
}

export function generateWhatsAppLink(
  phone: string,
  listingTitle: string,
  price?: string | null
): string {
  const cleanPhone = phone.replace(/\D/g, "");
  const priceText = price ? ` - ${price}` : "";
  const message = encodeURIComponent(
    `Hi, I'm interested in your listing: "${listingTitle}"${priceText} on Zambia.net Market`
  );
  return `https://wa.me/${cleanPhone}?text=${message}`;
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
