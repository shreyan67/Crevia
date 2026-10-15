"use server";

import { prisma } from "@/lib/prisma";

export interface ProductWithDetails {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  categoryId: string;
  category: {
    id: string;
    name: string;
  };
  images: string;
  variants: Array<{
    id: string;
    weight: number | null;
    flavor: string | null;
    priceAdjustment: number;
  }>;
}

/**
 * Fetch products from PostgreSQL with optional category filtering and search
 */
export async function getProducts(options?: {
  category?: string;
  search?: string;
}): Promise<ProductWithDetails[]> {
  try {
    const where: any = {};

    if (options?.category && options.category !== "All") {
      where.category = {
        name: {
          equals: options.category,
          mode: "insensitive",
        },
      };
    }

    if (options?.search && options.search.trim().length > 0) {
      where.OR = [
        { name: { contains: options.search.trim(), mode: "insensitive" } },
        { description: { contains: options.search.trim(), mode: "insensitive" } },
      ];
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    return products;
  } catch (error) {
    console.error("[getProducts] Error fetching products from PostgreSQL:", error);
    return [];
  }
}

/**
 * Fetch a single product by ID from PostgreSQL
 */
export async function getProductById(id: string): Promise<ProductWithDetails | null> {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        variants: true,
      },
    });

    return product;
  } catch (error) {
    console.error("[getProductById] Error fetching product from PostgreSQL:", error);
    return null;
  }
}

/**
 * Fetch all categories with product counts
 */
export async function getCategories() {
  try {
    return await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (error) {
    console.error("[getCategories] Error fetching categories:", error);
    return [];
  }
}
