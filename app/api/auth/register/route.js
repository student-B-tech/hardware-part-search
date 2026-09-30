import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDb } from '../../../../lib/db';
import { createSession, setSessionCookie } from '../../../../lib/auth';

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = body.role === 'shopkeeper' ? 'shopkeeper' : 'customer';
    const shopName = String(body.shopName || '').trim();

    if (!name || !email || password.length < 6) {
      return NextResponse.json({ error: 'Name, email and a password of at least 6 characters are required.' }, { status: 400 });
    }
    if (role === 'shopkeeper' && !shopName) {
      return NextResponse.json({ error: 'Shop name is required for a shopkeeper account.' }, { status: 400 });
    }

    const db = await getDb();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        role,
        ...(role === 'shopkeeper'
          ? { shop: { create: { name: shopName, status: 'pending' } } }
          : {}),
      },
    });

    const token = await createSession(user);
    await setSessionCookie(token);

    return NextResponse.json({ ok: true, role });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Unable to create account. Check your Neon database configuration.' }, { status: 500 });
  }
}
