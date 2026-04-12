export const CACHE_KEYS = {
  CATEGORIES: "categories",
  LISTING: (id: string) => `listing:${id}`,
  SEARCH: (params: string) => `search:${params}`,
} as const;
