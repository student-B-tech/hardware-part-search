import { NextResponse } from "next/server";
import { createWorker } from "tesseract.js";

export async function POST(request) {
  let worker;

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "Bill image is required." },
        { status: 400 }
      );
    }

    if (!file.type?.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image files are allowed." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Image size must be less than 10 MB." },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const imageBuffer = Buffer.from(bytes);

    console.log("Starting OCR...");

    worker = await createWorker("eng");

    const result = await worker.recognize(imageBuffer);

    const text = result.data.text?.trim() || "";

    console.log("OCR TEXT:");
    console.log(text);

    if (!text) {
      return NextResponse.json(
        { error: "No readable text found in the bill image." },
        { status: 400 }
      );
    }

    const bill = extractBillData(text);

    return NextResponse.json({
      message: "Bill scanned successfully.",
      ocrText: text,
      bill,
    });
  } catch (error) {
    console.error("OCR SCANNER ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "Unable to scan bill.",
      },
      { status: 500 }
    );
  } finally {
    if (worker) {
      await worker.terminate();
    }
  }
}

function extractBillData(text) {
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  const items = [];

  for (const line of lines) {
    const match = line.match(
      /^(.+?)\s+(\d+)\s+(\d+(?:\.\d{1,2})?)\s+(\d+(?:\.\d{1,2})?)$/
    );

    if (match) {
      const productName = match[1].trim();
      const quantity = Number(match[2]);
      const unitPrice = Number(match[3]);
      const total = Number(match[4]);

      if (productName && quantity > 0) {
        items.push({
          productName,
          quantity,
          unitPrice,
          total,
        });
      }
    }
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.total,
    0
  );

  return {
    items,
    subtotal,
    tax: 0,
    total: subtotal,
  };
}