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
    <section className="min-h-[calc(100vh_-_86px)] grid grid-cols-[.84fr_1.16fr] bg-[#fffefa] max-[900px]:grid-cols-[.75fr_1.25fr] max-[680px]:min-h-[calc(100vh_-_72px)] max-[680px]:grid-cols-[1fr] dark:bg-[#111a16]">
      <div className="[&_h1]:font-semibold [&_h1]:text-[clamp(57px,_6.3vw,_88px)] [&_h1]:leading-[.99] [&_h1]:font-['Manrope',_sans-serif] [&_h1]:tracking-[-6px] [&_h1]:text-[#13251e] [&_h1]:mt-[23px] mx-0 mb-[19px] relative overflow-hidden min-h-[650px] bg-[#163e33] text-white py-[42px] px-[12%] flex flex-col justify-between [&::after]:content-[''] [&::after]:absolute [&::after]:w-[480px] [&::after]:h-[480px] [&::after]:rounded-full [&::after]:border border-[#ffffff16] [&::after]:right-[-210px] [&::after]:bottom-[-120px] [&::after]:shadow-[0_0_0_38px_#ffffff06,_0_0_0_80px_#ffffff06] [&_h1]:text-white [&_h1]:text-[clamp(48px,_5vw,_68px)] [&_h1]:tracking-[-4px] [&_h1]:my-[23px] mx-0 [&_h1_em]:text-[#d1e8b5] [&_h1_em]:italic [&_h1_em]:font-normal [&_h1_em]:text-[1em] [&_h1_em]:font-['Georgia',_serif] [&_h1_em]:tracking-[-3px] max-[900px]:py-[35px] px-[10%] max-[680px]:hidden">
        <Brand className="group/brand-light text-[#f4f7f0] dark:text-[#f4f7f0]" />
        <div className="relative z-[1] py-[50px] px-0 [&_>_p:last-child]:text-[#bdc9be] [&_>_p:last-child]:text-[13px] dark:[&_>_p:last-child]:text-[#c2d3c5]"><span className="text-[#c6e5a6] text-[28px]">✳</span><p className="text-[#76877d] font-medium text-[10px] font-['DM_Mono',_monospace] tracking-[1.45px] flex items-center gap-[9px]    [.group\/lyu-cta_&]:text-[#aec0ad] text-[#b0c0b2] mt-[24px]">ONE CONNECTED BUSINESS SYSTEM</p><h1>Every team<br />works with<br /><em>clarity.</em></h1><p>Secure access to your Lyu ERP workspace.</p></div>
        <span className="text-[#b1c1b2] text-[8px] font-['DM_Mono'] tracking-[1px] [&_span]:text-[#d1e8b5] dark:text-[#c2d3c5]">LYU ERP OPERATIONS <span>↗</span></span>
      </div>
      <div className="grid place-items-center py-[55px] px-[9%] max-[680px]:pt-[34px] px-[7%] pb-[50px] max-[680px]:items-start dark:border-[#2b3a30] dark:bg-[#17221b] dark:text-[#dbe5dc]"><div className="[&_h2]:font-semibold [&_h2]:text-[clamp(57px,_6.3vw,_88px)] [&_h2]:leading-[.99] [&_h2]:font-['Manrope',_sans-serif] [&_h2]:tracking-[-6px] [&_h2]:text-[#13251e] [&_h2]:mt-[23px] mx-0 mb-[19px] w-[min(400px,_100%)] [&_h2]:text-[39px] [&_h2]:tracking-[-2px] [&_h2]:leading-[1.08] [&_h2]:mt-[19px] mx-0 mb-[11px] [&_h2_span]:text-[#6b8a6f] [&_h2_span]:italic [&_h2_span]:font-normal [&_h2_span]:text-[1em] [&_h2_span]:font-['Georgia',_serif] max-[680px]:max-w-[410px] max-[680px]:m-[auto] max-[680px]:[&_h2]:text-[38px] dark:[&_h2]:text-[#e3ebe4]">
        <div className="hidden max-[680px]:block max-[680px]:mb-[48px]"><Brand /></div>
        <p className="text-[#76877d] font-medium text-[10px] font-['DM_Mono',_monospace] tracking-[1.45px] flex items-center gap-[9px]    [.group\/lyu-cta_&]:text-[#aec0ad]"><span className="w-[19px] h-px bg-[#91aa55]" /> LYU ERP OPERATIONS</p>
        <h2>{isInitialSetup ? 'Initial administrator' : 'Welcome back to'}<br /><span>{isInitialSetup ? 'secure setup.' : 'your workspace.'}</span></h2>
        <p className="text-[#89938b] text-xs mb-[25px] dark:text-[#9dab9f]">{isInitialSetup ? 'Create the workspace owner account using the configured owner email.' : 'Sign in with your email, username, or employee ID.'}</p>
        <form onSubmit={handleSubmit} className="grid gap-[13px] [&_label]:grid [&_label]:gap-[7px] [&_label]:text-[10px] [&_label]:text-[#526157] [&_label]:font-semibold [&_input]:h-[43px] [&_input]:w-[100%] [&_input]:border border-[#e2e7de] [&_input]:rounded-[5px] [&_input]:py-0 px-3 [&_input]:bg-[#fffefa] [&_input]:text-xs [&_input]:text-[#1f3228] [&_input::placeholder]:text-[#b2bbb2] [&_input:focus]:border-[#769878] [&_input:focus]:outline-[2px_solid_#d7e7d0] dark:[&_label]:text-[#e3ebe4] dark:[&_input]:border-[#36463b] dark:[&_input]:bg-[#1a261f] dark:[&_input]:text-[#e2ebe3] dark:[&_input::placeholder]:text-[#99a99c]">
          {isInitialSetup ? <>
            <label>Full name<input autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} required maxLength={255} /></label>
            <label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required minLength={3} maxLength={30} /></label>
            <label>Workspace owner email<input autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 12 characters" minLength={12} maxLength={128} required /></label>
          </> : <>
            <label>Email, username, or employee ID<input autoComplete="username" value={identifier} onChange={(event) => setIdentifier(event.target.value)} placeholder="Enter your account ID" required /></label>
            <label>Password<input autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" required /></label>
          </>}
          {error && <p role="alert" className="m-0 text-[#a44b3f] bg-[#fbefeb] rounded-[5px] p-2.5 text-[11px]">{error}</p>}
          <button className="group/button inline-flex items-center justify-center gap-[18px] rounded-full py-[15px] px-[22px] text-[13px] font-bold transition-[transform,background,box-shadow] duration-200 [&:hover]:translate-y-[-2px]   [.group\/lyu-cta_&]:z-[1] text-[#f7f8f4] bg-[#153f33] shadow-[0_9px_22px_#153f3321] [&:hover]:bg-[#205342] [&:hover]:shadow-[0_12px_28px_#153f3333] w-[100%] mt-[6px] border-0 cursor-pointer [&:disabled]:opacity-[.65] [&:disabled]:cursor-wait" type="submit" disabled={busy}>{busy ? 'One moment…' : isInitialSetup ? 'Create administrator' : 'Sign in'} <span aria-hidden="true">↗</span></button>
        </form>
        {!isInitialSetup && <p className="mt-7 mx-0 mb-0 text-center text-[#a3aba3] text-[9px] dark:text-[#9faea2]">Account access is managed by your Lyu ERP administrator. Public registration is disabled.</p>}
        {!isInitialSetup && adminSetupLink && <p className="mt-[20px] text-center text-[#89938b] text-[11px] [&_button]:text-[#376947] [&_button]:bg-[none] [&_button]:border-0 [&_button]:font-bold [&_button]:cursor-pointer dark:text-[#9dab9f]"><a href={adminSetupLink}>Initial administrator setup</a></p>}
        {isInitialSetup && <p className="mt-7 mx-0 mb-0 text-center text-[#a3aba3] text-[9px] dark:text-[#9faea2]">This private setup link works only before the first administrator has been created.</p>}
      </div></div>
    </section>
  );
}
