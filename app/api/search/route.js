import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q")?.trim() || "";

    if (!q) {
      return NextResponse.json({ products: [] });
    }

    const db = await getDb();

    const products = await db.product.findMany({
      where: {
        shop: {
          status: "approved",
        },

        OR: [
          {
            name: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            sku: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            brand: {
              contains: q,
              mode: "insensitive",
            },
          },
          {
            category: {
              contains: q,
              mode: "insensitive",
            },
          },
        ],
      },

      include: {
        inventory: true,
        shop: true,
      },

      orderBy: {
        updatedAt: "desc",
      },

      take: 30,
    });

    const result = products.map((product) => ({
      id: product.id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      price: Number(product.price),
      stock: product.inventory?.quantity ?? 0,

      shop: {
        id: product.shop.id,
        name: product.shop.name,
        address: product.shop.address,
        city: product.shop.city,
        phone: product.shop.phone,
        latitude: product.shop.latitude,
        longitude: product.shop.longitude,
      },
    }));

    return NextResponse.json({
      products: result,
    });
  } catch (error) {
    console.error("SEARCH ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to search products",
      },
      {
        status: 500,
      }
    );
  }
}