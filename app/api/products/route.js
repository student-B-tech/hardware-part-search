import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { getSession } from '../../../lib/auth';

async function getShop(db, userId) {
  return db.shop.findUnique({ where: { ownerId: String(userId) } });
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const db = await getDb();
  const shop = await getShop(db, session.userId);
  if (!shop) return NextResponse.json({ products: [] });
  const products = await db.product.findMany({
    where: { shopId: shop.id },
    include: { inventory: true },
    orderBy: { updatedAt: 'desc' },
  });
  return NextResponse.json({ products });
}

export async function POST(request) {
  const session = await getSession();
  if (!session || session.role !== 'shopkeeper') {
    return NextResponse.json({ error: 'Shopkeeper access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const sku = String(body.sku || '').trim();
    const category = String(body.category || '').trim();
    const brand = String(body.brand || '').trim();
    const price = Number(body.price);
    const quantity = Number(body.quantity);

    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'Enter a valid product name, price and stock quantity.' }, { status: 400 });
    }

    const db = await getDb();
    const shop = await getShop(db, session.userId);
    if (!shop) return NextResponse.json({ error: 'Create your shop profile first.' }, { status: 400 });

    const product = await db.product.create({
      data: {
        shopId: shop.id,
        name,
        sku: sku || null,
        category: category || null,
        brand: brand || null,
        price,
        inventory: { create: { quantity } },
      },
      include: { inventory: true },
    });

    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to add product.' }, { status: 500 });
  }
}

export async function PATCH(request) {
  const session = await getSession();
  if (!session || session.role !== 'shopkeeper') {
    return NextResponse.json({ error: 'Shopkeeper access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const id = String(body.id || '');
    if (!id) return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });

    const db = await getDb();
    const shop = await getShop(db, session.userId);
    if (!shop) return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });

    const existing = await db.product.findFirst({ where: { id, shopId: shop.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    const price = Number(body.price);
    const quantity = Number(body.quantity);
    const name = String(body.name || '').trim();
    if (!name || !Number.isFinite(price) || price < 0 || !Number.isInteger(quantity) || quantity < 0) {
      return NextResponse.json({ error: 'Invalid product details.' }, { status: 400 });
    }

    const product = await db.product.update({
      where: { id },
      data: {
        name,
        price,
        sku: String(body.sku || '').trim() || null,
        category: String(body.category || '').trim() || null,
        brand: String(body.brand || '').trim() || null,
        inventory: { upsert: { create: { quantity }, update: { quantity } } },
      },
      include: { inventory: true },
    });
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to update product.' }, { status: 500 });
  }
}

export async function DELETE(request) {
  const session = await getSession();
  if (!session || session.role !== 'shopkeeper') {
    return NextResponse.json({ error: 'Shopkeeper access required.' }, { status: 403 });
  }
  try {
    const body = await request.json();
    const id = String(body.id || '');
    const db = await getDb();
    const shop = await getShop(db, session.userId);
    if (!shop) return NextResponse.json({ error: 'Shop not found.' }, { status: 404 });

    const existing = await db.product.findFirst({ where: { id, shopId: shop.id } });
    if (!existing) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });

    await db.product.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to delete product. Products used in bills cannot be deleted.' }, { status: 500 });
  }
}
