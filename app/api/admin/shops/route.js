import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const db = await getDb();

    const shops = await db.shop.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({
      shops,
    });
  } catch (error) {
    console.error("ADMIN SHOPS API ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load shops.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}