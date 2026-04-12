import { prisma } from "@/lib/db";
import { success, error } from "@/lib/api";
import { CATEGORIES_WITH_SUBS } from "@/lib/constants";

export async function POST() {
  try {
    let categoriesUpserted = 0;
    let subcategoriesUpserted = 0;

    for (let i = 0; i < CATEGORIES_WITH_SUBS.length; i++) {
      const cat = CATEGORIES_WITH_SUBS[i];

      const category = await prisma.category.upsert({
        where: { slug: cat.slug },
        update: {
          name: cat.name,
          icon: cat.icon,
          sortOrder: i,
        },
        create: {
          name: cat.name,
          slug: cat.slug,
          icon: cat.icon,
          sortOrder: i,
          isActive: true,
        },
      });
      categoriesUpserted++;

      for (let j = 0; j < cat.subcategories.length; j++) {
        const sub = cat.subcategories[j];

        await prisma.subcategory.upsert({
          where: { slug: sub.slug },
          update: {
            name: sub.name,
            categoryId: category.id,
            sortOrder: j,
          },
          create: {
            name: sub.name,
            slug: sub.slug,
            categoryId: category.id,
            sortOrder: j,
            isActive: true,
          },
        });
        subcategoriesUpserted++;
      }
    }

    return success({
      message: "Categories seeded successfully",
      categoriesUpserted,
      subcategoriesUpserted,
    }, 201);
  } catch (err) {
    console.error("Failed to seed categories:", err);
    return error("Failed to seed categories", 500);
  }
}
