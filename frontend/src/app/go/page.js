import { useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';

export default function GoPage() {
  const [params, setParams] = useSearchParams();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();
  const mode = params.get('mode') === 'signup' ? 'signup' : 'signin';
  const isSignup = mode === 'signup';
  const { data: session, isPending } = authClient.useSession();

  if (!isPending && session?.user) return <Navigate to="/dashboard" replace />;

  const changeMode = (nextMode) => {
    setError('');
    setParams(nextMode === 'signup' ? { mode: 'signup' } : { mode: 'signin' });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = isSignup
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
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
        <h2>{isSignup ? 'Create your' : 'Welcome back to'}<br /><span>{isSignup ? 'Lyu ERP account.' : 'the factory floor.'}</span></h2>
        <p className="auth-intro">{isSignup ? 'Create an account, then ask your administrator to assign production modules.' : 'Sign in to your assigned factory workspace.'}</p>
        <div className="auth-tabs"><button className={!isSignup ? 'active' : ''} onClick={() => changeMode('signin')} type="button">Sign in</button><button className={isSignup ? 'active' : ''} onClick={() => changeMode('signup')} type="button">Create account</button></div>
        <form onSubmit={handleSubmit} className="auth-form">
          {isSignup && <label>Your name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Alex Morgan" required maxLength={80} /></label>}
          <label>Email address<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required /></label>
          <label>Password<input autoComplete={isSignup ? 'new-password' : 'current-password'} type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" minLength={8} required /></label>
          {error && <p role="alert" className="form-error">{error}</p>}
          <button className="button button-dark auth-submit" type="submit" disabled={busy}>{busy ? 'One moment…' : isSignup ? 'Create your account' : 'Sign in'} <span aria-hidden="true">↗</span></button>
        </form>
        <p className="auth-switch">{isSignup ? 'Already have an account?' : 'New around here?'} <button type="button" onClick={() => changeMode(isSignup ? 'signin' : 'signup')}>{isSignup ? 'Sign in' : 'Create an account'}</button></p>
        <p className="auth-terms">By continuing, you agree to keep things thoughtful and kind.</p>
      </div></div>
    </section>
  );
}
