import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authClient } from '../../../lib/auth-client.js';

export default function ProductionAccountMenu({ user, isOwner }) {
  const [error, setError] = useState('');
  const [signingOut, setSigningOut] = useState(false);
  const navigate = useNavigate();

  async function signOut() {
    setSigningOut(true);
    setError('');
    try {
      await authClient.signOut();
      navigate('/go?mode=signin', { replace: true });
    } catch (signOutError) {
      setError(signOutError.message || 'Could not sign out. Please try again.');
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <details className="group relative">
      <summary className="grid h-9 w-9 cursor-pointer list-none place-items-center rounded-full bg-[#dcebd4] text-sm font-bold text-[#315b3a] marker:hidden dark:bg-[#304535] dark:text-[#d0e5c4]" aria-label="Open account menu">
        {user.name?.trim().charAt(0).toUpperCase() || 'U'}
      </summary>
      <div className="absolute right-0 top-[calc(100%_+_9px)] z-30 grid w-[min(270px,_calc(100vw_-_36px))] gap-1 rounded-xl border border-[#e2e8df] bg-[#fffefa] p-2 shadow-[0_14px_36px_#172c201c] dark:border-[#35463b] dark:bg-[#19251e]">
        <div className="grid gap-1 border-b border-[#edf0ea] px-2.5 pb-3 pt-2 dark:border-[#35463b]">
          <strong className="text-xs text-[#334b39] dark:text-[#d5e1d6]">{user.name}</strong>
          <small className="text-[10px] text-[#849187] dark:text-[#a1afa4]">{isOwner ? 'Workspace owner' : user.email}</small>
        </div>
        <Link className="rounded-lg px-2.5 py-2.5 text-left text-[11px] font-semibold text-[#425b48] no-underline hover:bg-[#f3f7f0] dark:text-[#d5e1d6] dark:hover:bg-[#26372b]" to="/dashboard/security">Change password</Link>
        <button className="rounded-lg border-0 bg-transparent px-2.5 py-2.5 text-left text-[11px] font-semibold text-[#425b48] hover:bg-[#f3f7f0] disabled:opacity-60 dark:text-[#d5e1d6] dark:hover:bg-[#26372b]" type="button" onClick={signOut} disabled={signingOut}>{signingOut ? 'Signing out…' : 'Sign out'}</button>
        {error && <p className="m-0 rounded bg-[#fbefeb] p-2 text-[10px] text-[#a44b3f]" role="alert">{error}</p>}
      </div>
    </details>
  );
}
