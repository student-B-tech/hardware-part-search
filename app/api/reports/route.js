import { NextResponse } from "next/server";
import { getDb } from "../../../lib/db";
import { getSession } from "../../../lib/auth";

function getDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
}

function formatMonthLabel(date) {
  return date.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
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
        { error: "Only shopkeepers can view reports." },
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
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });

    const totalSales = bills.reduce(
      (sum, bill) => sum + Number(bill.total),
      0
    );

    const totalBills = bills.length;

    const totalItemsSold = bills.reduce(
      (sum, bill) =>
        sum +
        bill.items.reduce(
          (itemSum, item) => itemSum + item.quantity,
          0
        ),
      0
    );

    const today = new Date();

    const todaySales = bills
      .filter((bill) => {
        const billDate = new Date(bill.createdAt);

        return (
          billDate.getFullYear() === today.getFullYear() &&
          billDate.getMonth() === today.getMonth() &&
          billDate.getDate() === today.getDate()
        );
      })
      .reduce((sum, bill) => sum + Number(bill.total), 0);

    // Payment summary
    const paymentSummary = {
      cash: 0,
      upi: 0,
      card: 0,
    };

    bills.forEach((bill) => {
      const mode = (bill.paymentMode || "cash").toLowerCase();
      const amount = Number(bill.total);

      if (mode === "cash") {
        paymentSummary.cash += amount;
      } else if (mode === "upi") {
        paymentSummary.upi += amount;
      } else if (mode === "card") {
        paymentSummary.card += amount;
      }
    });

    // --------------------------------------------------
    // 7 DAYS SALES
    // --------------------------------------------------

    const sevenDays = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const sales = bills
        .filter((bill) => {
          const billDate = new Date(bill.createdAt);

          return billDate >= date && billDate < nextDate;
        })
        .reduce((sum, bill) => sum + Number(bill.total), 0);

      sevenDays.push({
        date: getDateKey(date),
        label: formatDateLabel(date),
        sales,
      });
    }

    // --------------------------------------------------
    // 1 MONTH SALES - LAST 30 DAYS
    // --------------------------------------------------

    const oneMonth = [];

    for (let i = 29; i >= 0; i--) {
      const date = new Date();

      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - i);

      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const sales = bills
        .filter((bill) => {
          const billDate = new Date(bill.createdAt);

          return billDate >= date && billDate < nextDate;
        })
        .reduce((sum, bill) => sum + Number(bill.total), 0);

      oneMonth.push({
        date: getDateKey(date),
        label: formatDateLabel(date),
        sales,
      });
    }

    // --------------------------------------------------
    // 1 YEAR SALES - LAST 12 MONTHS
    // --------------------------------------------------

    const oneYear = [];

    for (let i = 11; i >= 0; i--) {
      const date = new Date();

      date.setDate(1);
      date.setHours(0, 0, 0, 0);
      date.setMonth(date.getMonth() - i);

      const nextMonth = new Date(date);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      const sales = bills
        .filter((bill) => {
          const billDate = new Date(bill.createdAt);

          return billDate >= date && billDate < nextMonth;
        })
        .reduce((sum, bill) => sum + Number(bill.total), 0);

      oneYear.push({
        month: getMonthKey(date),
        label: formatMonthLabel(date),
        sales,
      });
    }

    return NextResponse.json({
      report: {
        totalSales,
        todaySales,
        totalBills,
        totalItemsSold,
        paymentSummary,

        charts: {
          sevenDays,
          oneMonth,
          oneYear,
        },
      },
    });
  } catch (error) {
    console.error("REPORT API ERROR:", error);

    return NextResponse.json(
      {
        error: "Unable to load sales report.",
      },
      { status: 500 }
    );
  }
}