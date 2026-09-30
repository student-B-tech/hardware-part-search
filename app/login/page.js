'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault(); setError(''); setLoading(true);
    const res = await fetch('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(data.error || 'Login failed');
    router.push('/dashboard'); router.refresh();
  }

  return <main className="auth-shell"><div className="auth-card">
    <Link href="/" className="brand"><span className="brand-icon">⚙</span><span><b>PartNear</b><small>FIND HARDWARE. NEAR YOU.</small></span></Link>
    <div className="auth-heading"><p>WELCOME BACK</p><h1>Sign in to PartNear</h1><span>Find parts faster or manage your shop.</span></div>
    <form onSubmit={submit} className="auth-form">
      <label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
      <label>Password<input type="password" required value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="••••••••" /></label>
      {error && <div className="form-error">{error}</div>}
      <button disabled={loading}>{loading ? 'Signing in…' : 'Sign in →'}</button>
    </form>
    <p className="auth-switch">New to PartNear? <Link href="/register">Create an account</Link></p>
  </div></main>;
}
