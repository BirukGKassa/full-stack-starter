import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';

async function submitJson(url, body) {
  const response = await fetch(url, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.message || 'The request could not be completed.');
  return result;
}

export default function GoPage() {
  const [params] = useSearchParams();
  const [identifier, setIdentifier] = useState('');
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [adminSetupLink, setAdminSetupLink] = useState(null);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const setupToken = params.get('setup') || '';
  const isInitialSetup = Boolean(setupToken);
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (setupToken) return;
    let active = true;
    fetch('/api/public/system')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Setup status unavailable (${response.status})`)))
      .then((result) => { if (active) setAdminSetupLink(result.adminSetupLink || null); })
      .catch((loadError) => console.error('Could not load administrator setup link:', loadError));
    return () => { active = false; };
  }, [setupToken]);

  if (!isPending && session?.user) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (isInitialSetup) {
        await submitJson('/api/bootstrap/admin', { setupToken, name, username, email, password });
        navigate('/go', { replace: true });
      } else {
        const result = await submitJson('/api/auth/sign-in/identifier', { identifier, password });
        if (result.message && result.status >= 400) throw new Error(result.message);
        navigate('/dashboard', { replace: true });
      }
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="auth-shell">
      <div className="auth-aside">
        <Link to="/" className="brand brand-light"><span className="brand-mark"><span /></span><span>LYU<span className="brand-dot"> ERP</span></span></Link>
        <div className="auth-aside-copy"><span className="auth-sun">✳</span><p className="eyebrow eyebrow-light">ONE CONNECTED BUSINESS SYSTEM</p><h1>Every team<br />works with<br /><em>clarity.</em></h1><p>Secure access to your Lyu ERP workspace.</p></div>
        <span className="auth-aside-footer">LYU ERP OPERATIONS <span>↗</span></span>
      </div>
      <div className="auth-main"><div className="auth-form-wrap">
        <div className="auth-mobile-brand"><Link to="/" className="brand"><span className="brand-mark"><span /></span><span>LYU<span className="brand-dot"> ERP</span></span></Link></div>
        <p className="eyebrow"><span className="eyebrow-line" /> LYU ERP OPERATIONS</p>
        <h2>{isInitialSetup ? 'Initial administrator' : 'Welcome back to'}<br /><span>{isInitialSetup ? 'secure setup.' : 'your workspace.'}</span></h2>
        <p className="auth-intro">{isInitialSetup ? 'Create the first administrator account. The email must be listed in LYU_ADMIN_EMAILS.' : 'Sign in with your email, username, or employee ID.'}</p>
        <form onSubmit={handleSubmit} className="auth-form">
          {isInitialSetup ? <>
            <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} /></label>
            <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} /></label>
            <label>Administrator email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" minLength={12} maxLength={128} required /></label>
          </> : <>
            <label>Email, username, or employee ID<input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your account ID" required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /></label>
          </>}
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : isInitialSetup ? 'Create administrator' : 'Sign in'} <span aria-hidden="true">↗</span></button>
        </form>
        {!isInitialSetup && <p className="auth-terms">Account access is managed by your Lyu ERP administrator. Public registration is disabled.</p>}
        {!isInitialSetup && adminSetupLink && <p className="auth-switch"><a href={adminSetupLink}>Initial administrator setup</a></p>}
        {isInitialSetup && <p className="auth-terms">This private setup link works only before the first administrator has been created.</p>}
      </div></div>
    </section>
  );
}
