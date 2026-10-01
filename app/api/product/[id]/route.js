import { NextResponse } from "next/server";
import { getDb } from "../../../../lib/db";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const product = await db.product.findUnique({
      where: {
        id,
      },
      include: {
        inventory: true,
        shop: true,
      },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Product not found." },
        { status: 404 }
      );
    }

    // Only products from approved shops are publicly visible
    if (product.shop.status !== "approved") {
      return NextResponse.json(
        { error: "Product is not available." },
        { status: 404 }
      );
    }

    const result = {
      id: product.id,
      name: product.name,
      sku: product.sku,
      brand: product.brand,
      category: product.category,
      description: product.description,
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
    };

    return NextResponse.json({
      product: result,
    });
  } catch (error) {
    console.error("PRODUCT API ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load product.",
      },
      {
        status: 500,
      }
    );
  }
}