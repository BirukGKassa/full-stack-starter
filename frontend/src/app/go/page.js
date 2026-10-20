import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';

export default function GoPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && session?.user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const identifier = email.trim();
      const result = identifier.includes('@')
        ? await authClient.signIn.email({ email: identifier, password })
        : await authClient.signIn.username({ username: identifier, password });
      if (result.error) throw new Error(result.error.message || 'We could not complete that request.');
      navigate('/dashboard', { replace: true });
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-aside"><Link to="/" className="brand brand-light"><span className="brand-mark"><span /></span><span>LYU<span className="brand-dot"> ERP</span></span></Link><div className="auth-aside-copy"><span className="auth-sun">✳</span><p className="eyebrow eyebrow-light">PRODUCTION, QUALITY, AND PEOPLE</p><h1>Every shift<br />starts with<br /><em>clarity.</em></h1><p>Sign in to your Lyu ERP factory workspace.</p></div><span className="auth-aside-footer">LYU ERP OPERATIONS <span>↗</span></span></div>
      <div className="auth-main"><div className="auth-form-wrap">
        <div className="auth-mobile-brand"><Link to="/" className="brand"><span className="brand-mark"><span /></span><span>LYU<span className="brand-dot"> ERP</span></span></Link></div>
        <p className="eyebrow"><span className="eyebrow-line" /> LYU ERP OPERATIONS</p>
        <h2>Welcome back to<br /><span>the factory floor.</span></h2>
        <p className="auth-intro">Sign in to your assigned factory workspace.</p>
        <form onSubmit={handleSubmit} className="auth-form">
          <label>Email or username<input autoComplete="username" type="text" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com or username" required /></label>
          <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : 'Sign in'} <span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-terms">By continuing, you agree to keep things thoughtful and kind.</p>
      </div></div>
    </section>
  );
}
