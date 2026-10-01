import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Shop ID is required." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const shop = await db.shop.findUnique({
      where: {
        id,
      },
      include: {
        products: {
          include: {
            inventory: true,
          },
          orderBy: {
            updatedAt: "desc",
          },
        },
      },
    });

    // Shop does not exist
    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found." },
        { status: 404 }
      );
    }

    // Only approved shops are publicly visible
    if (shop.status !== "approved") {
      return NextResponse.json(
        { error: "Shop is not available." },
        { status: 404 }
      );
    }

    const result = {
      id: shop.id,
      name: shop.name,
      status: shop.status,
      address: shop.address,
      city: shop.city,
      phone: shop.phone,
      latitude: shop.latitude,
      longitude: shop.longitude,

      products: shop.products.map((product) => ({
        id: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        category: product.category,
        description: product.description,
        price: Number(product.price),
        stock: product.inventory?.quantity ?? 0,
      })),
    };

    return NextResponse.json({
      shop: result,
    });
  } catch (error) {
    console.error("SHOP API ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load shop.",
      },
      {
        status: 500,
      }
    );
  }
}