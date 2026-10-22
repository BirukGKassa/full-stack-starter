import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom';
import { authClient } from '../../lib/auth-client.js';
import Brand from '../components/brand.js';

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
  const { data: session, isPending, refetch: refreshSession } = authClient.useSession();

  useEffect(() => {
    if (setupToken) return;
    let active = true;
    fetch('/api/public/system')
      .then((response) => response.ok ? response.json() : Promise.reject(new Error(`Setup status unavailable (${response.status})`)))
      .then((result) => { if (active) setAdminSetupLink(result.adminSetupLink || null); })
      .catch((loadError) => console.error('Could not load administrator setup link:', loadError));
    return () => { active = false; };
  }, [setupToken]);

  if (!isPending && session?.user && !isInitialSetup) return <Navigate to="/dashboard" replace />;

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
        const refreshedSession = await refreshSession();
        if (!refreshedSession.data?.user) throw new Error('Sign-in succeeded, but your session could not be confirmed. Please try again.');
        navigate('/dashboard', { replace: true });
      }
    } catch (submitError) {
      setError(submitError.message || 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4 py-10">
      <section className="w-full max-w-md space-y-6 rounded-xl border border-border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
        <header className="space-y-5">
          <Brand className="!m-0 text-2xl" />
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Lyu ERP workspace</p>
            <h1 className="text-2xl font-semibold tracking-tight">{isInitialSetup ? 'Set up your workspace owner' : 'Welcome back'}</h1>
            <p className="text-sm leading-6 text-muted-foreground">{isInitialSetup ? 'Create the owner account using your configured workspace email.' : 'Sign in with your email, username, or employee ID.'}</p>
          </div>
        </header>
        <form onSubmit={handleSubmit} className="grid gap-4 [&_label]:grid [&_label]:gap-2 [&_label]:text-sm [&_label]:font-medium [&_input]:h-10 [&_input]:w-full [&_input]:rounded-md [&_input]:border [&_input]:border-input [&_input]:bg-background [&_input]:px-3 [&_input]:text-sm [&_input]:text-foreground [&_input]:outline-none [&_input::placeholder]:text-muted-foreground [&_input:focus]:border-ring">
          {isInitialSetup ? <>
            <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} /></label>
            <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} /></label>
            <label>Workspace owner email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" minLength={12} maxLength={128} required /></label>
          </> : <>
            <label>Email, username, or employee ID<input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your account ID" required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /></label>
          </>}
          {error && <p role="alert" className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <button className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50" type="submit" disabled={busy}>{busy ? 'One moment…' : isInitialSetup ? 'Create administrator' : 'Sign in'}</button>
        </form>
        {!isInitialSetup && <p className="text-center text-xs leading-5 text-muted-foreground">Account access is managed by your Lyu ERP administrator. Public registration is disabled.</p>}
        {!isInitialSetup && adminSetupLink && <p className="text-center text-sm"><a className="font-medium underline underline-offset-4" href={adminSetupLink}>Initial administrator setup</a></p>}
        {isInitialSetup && <p className="text-center text-xs leading-5 text-muted-foreground">This private setup link works only before the first administrator has been created.</p>}
      </section>
    </main>
  );
}
