import { NextResponse } from 'next/server';
import { getDb } from '../../../lib/db';
import { getSession } from '../../../lib/auth';

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  const db = await getDb();

  const shop = await db.shop.findUnique({
    where: {
      ownerId: String(session.userId),
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  return NextResponse.json({ shop });
}

export async function PUT(request) {
  const session = await getSession();

  if (!session || session.role !== 'shopkeeper') {
    return NextResponse.json(
      { error: 'Shopkeeper access required.' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();

    const name = String(body.name || '').trim();
    const address = String(body.address || '').trim();
    const city = String(body.city || '').trim();
    const phone = String(body.phone || '').trim();

    const latitude =
      body.latitude !== undefined &&
      body.latitude !== null &&
      body.latitude !== ''
        ? Number(body.latitude)
        : null;

    const longitude =
      body.longitude !== undefined &&
      body.longitude !== null &&
      body.longitude !== ''
        ? Number(body.longitude)
        : null;

    if (!name) {
      return NextResponse.json(
        { error: 'Shop name is required.' },
        { status: 400 }
      );
    }

    if (
      latitude !== null &&
      (!Number.isFinite(latitude) ||
        latitude < -90 ||
        latitude > 90)
    ) {
      return NextResponse.json(
        { error: 'Invalid latitude.' },
        { status: 400 }
      );
    }

    if (
      longitude !== null &&
      (!Number.isFinite(longitude) ||
        longitude < -180 ||
        longitude > 180)
    ) {
      return NextResponse.json(
        { error: 'Invalid longitude.' },
        { status: 400 }
      );
    }

    const db = await getDb();

    const shop = await db.shop.upsert({
      where: {
        ownerId: String(session.userId),
      },

      update: {
        name,
        address: address || null,
        city: city || null,
        phone: phone || null,
        latitude,
        longitude,
      },

      create: {
        ownerId: String(session.userId),
        name,
        address: address || null,
        city: city || null,
        phone: phone || null,
        latitude,
        longitude,
        status: 'pending',
      },
    });

    return NextResponse.json({
      ok: true,
      shop,
    });
  } catch (error) {
    console.error('SHOP SAVE ERROR:', error);

    return NextResponse.json(
      { error: 'Unable to save shop.' },
      { status: 500 }
    );
  }
}