'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('customer');
  const [form, setForm] = useState({ name: '', email: '', password: '', shopName: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, role }) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'Registration failed');
    router.push('/dashboard'); router.refresh();
  }

  return <main className="auth-shell"><div className="auth-card wide">
    <Link href="/" className="brand"><span className="brand-icon">⚙</span><span><b>PartNear</b><small>FIND HARDWARE. NEAR YOU.</small></span></Link>
    <div className="auth-heading"><p>GET STARTED</p><h1>Create your PartNear account</h1><span>Choose how you want to use the platform.</span></div>
    <div className="role-grid"><button type="button" className={role==='customer'?'role-card active':'role-card'} onClick={()=>setRole('customer')}><span>🔎</span><b>Customer</b><small>Find parts near me</small></button><button type="button" className={role==='shopkeeper'?'role-card active':'role-card'} onClick={()=>setRole('shopkeeper')}><span>🏪</span><b>Shopkeeper</b><small>Manage my shop & inventory</small></button></div>
    <form onSubmit={submit} className="auth-form two-col">
      <label>Full name<input required value={form.name} onChange={e=>update('name',e.target.value)} placeholder="Your name" /></label>
      <label>Email<input type="email" required value={form.email} onChange={e=>update('email',e.target.value)} placeholder="you@example.com" /></label>
      <label>Password<input type="password" minLength={6} required value={form.password} onChange={e=>update('password',e.target.value)} placeholder="At least 6 characters" /></label>
      {role==='shopkeeper' && <label>Shop name<input required value={form.shopName} onChange={e=>update('shopName',e.target.value)} placeholder="Your hardware shop" /></label>}
      {error && <div className="form-error full">{error}</div>}
      <button className="full" disabled={loading}>{loading ? 'Creating account…' : `Create ${role} account →`}</button>
    </form>
    <p className="auth-switch">Already have an account? <Link href="/login">Sign in</Link></p>
  </div></main>;
}
