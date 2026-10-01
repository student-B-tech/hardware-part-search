import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

export async function POST(request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    if (session.role !== "shopkeeper") {
      return NextResponse.json(
        { error: "Only shopkeepers can create bills." },
        { status: 403 }
      );
    }

    const body = await request.json();

    const { items, paymentMode } = body;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Bill must contain at least one product." },
        { status: 400 }
      );
    }

    const db = await getDb();

    const shop = await db.shop.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found." },
        { status: 404 }
      );
    }

    const result = await db.$transaction(
  async (tx) => {
      let total = 0;
      const billItems = [];

      for (const item of items) {
        const quantity = Number(item.quantity);

        if (!item.productId || !Number.isInteger(quantity) || quantity <= 0) {
          throw new Error("Invalid product or quantity.");
        }

        const product = await tx.product.findFirst({
          where: {
            id: item.productId,
            shopId: shop.id,
          },
          include: {
            inventory: true,
          },
        });

        if (!product) {
          throw new Error("Product not found in your shop.");
        }

        const stock = product.inventory?.quantity ?? 0;

        if (stock < quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${stock}`
          );
        }

        const unitPrice = Number(product.price);
        const itemTotal = unitPrice * quantity;

        total += itemTotal;

        billItems.push({
          productId: product.id,
          quantity,
          unitPrice: product.price,
        });

        await tx.inventory.update({
          where: {
            productId: product.id,
          },
          data: {
            quantity: {
              decrement: quantity,
            },
          },
        });
      }

      const bill = await tx.bill.create({
        data: {
          shopId: shop.id,
          total: total.toFixed(2),
          paymentMode: paymentMode || "cash",
          source: "manual",
          items: {
            create: billItems,
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
      return bill;
    },
    {
      timeout: 15000,
    }
  );

    return NextResponse.json(
      {
        message: "Bill created successfully.",
        bill: result,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("BILL CREATE ERROR:", error);

    return NextResponse.json(
      {
        error: error.message || "Unable to create bill.",
      },
      { status: 500 }
    );
  }
}
export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Please login first." },
        { status: 401 }
      );
    }

    if (session.role !== "shopkeeper") {
      return NextResponse.json(
        { error: "Only shopkeepers can view bills." },
        { status: 403 }
      );
    }

    const db = await getDb();

    const shop = await db.shop.findUnique({
      where: {
        ownerId: session.userId,
      },
    });

    if (!shop) {
      return NextResponse.json(
        { error: "Shop not found." },
        { status: 404 }
      );
    }

    const bills = await db.bill.findMany({
      where: {
        shopId: shop.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    const result = bills.map((bill) => ({
      id: bill.id,
      invoiceNo: bill.invoiceNo,
      total: Number(bill.total),
      paymentMode: bill.paymentMode,
      source: bill.source,
      createdAt: bill.createdAt,

      items: bill.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.product.name,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        subtotal: Number(item.unitPrice) * item.quantity,
      })),
    }));

    return NextResponse.json({
      bills: result,
    });
  } catch (error) {
    console.error("BILL HISTORY ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load bill history.",
      },
      { status: 500 }
    );
  }
}