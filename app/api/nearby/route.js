import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const q = searchParams.get("q")?.trim() || "";

    const userLat = Number(searchParams.get("lat"));
    const userLng = Number(searchParams.get("lng"));

    if (!q) {
      return NextResponse.json({
        products: [],
      });
    }

    const db = await getDb();

    const products = await db.product.findMany({
      where: {
        AND: [
          {
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
          {
            inventory: {
              quantity: {
                gt: 0,
              },
            },
          },
        ],
      },

      include: {
        inventory: true,
        shop: true,
      },

      take: 50,
    });

    const result = products.map((product) => {
      let distance = null;

      if (
        Number.isFinite(userLat) &&
        Number.isFinite(userLng) &&
        product.shop.latitude !== null &&
        product.shop.longitude !== null
      ) {
        distance = calculateDistance(
          userLat,
          userLng,
          product.shop.latitude,
          product.shop.longitude
        );
      }

      return {
        id: product.id,
        name: product.name,
        sku: product.sku,
        brand: product.brand,
        category: product.category,
        price: Number(product.price),
        stock: product.inventory?.quantity ?? 0,

        distance:
          distance !== null
            ? Number(distance.toFixed(2))
            : null,

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
    });

    result.sort((a, b) => {
      if (a.distance === null) return 1;
      if (b.distance === null) return -1;

      return a.distance - b.distance;
    });

    return NextResponse.json({
      products: result,
    });
  } catch (error) {
    console.error("NEARBY SEARCH ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to find nearby products",
      },
      {
        status: 500,
      }
    );
  }
}