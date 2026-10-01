import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request, { params }) {
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

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "Shop ID is required." },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!["approved", "rejected", "pending"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid shop status." },
        { status: 400 }
      );
    }

    const db = getDb();

    const existingShop = await db.shop.findUnique({
      where: {
        id,
      },
    });

    if (!existingShop) {
      return NextResponse.json(
        { error: "Shop not found." },
        { status: 404 }
      );
    }

    const shop = await db.shop.update({
      where: {
        id,
      },
      data: {
        status,
      },
    });

    return NextResponse.json({
      message: `Shop ${status} successfully.`,
      shop,
    });
  } catch (error) {
    console.error("ADMIN SHOP STATUS ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to update shop status.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}