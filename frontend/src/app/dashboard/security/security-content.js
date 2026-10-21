import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import ChangePasswordForm from './change-password-form.js';
import SessionList from './session-list.js';

export default function SecurityContent({ error, message, saving, sessions, loading, onPasswordChange, onRefresh, onRevoke }) {
  return (
    <main className="erp-dashboard erp-system-page">
      <div className="erp-dashboard-top">
        <div><Brand /><p className="prod-eyebrow">LYU ERP · ACCOUNT SECURITY</p><p>Protect your account and devices</p></div>
        <Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="prod-page-heading"><p className="prod-eyebrow">YOUR ACCOUNT</p><h1>Password and sessions</h1><p>Update your password and sign out sessions you do not recognize.</p></div>
      {error && <section className="prod-card prod-api-warning" role="alert"><strong>Action could not be completed</strong><p>{error}</p></section>}
      {message && <section className="prod-card prod-security-success" role="status">{message}</section>}
      <div className="flex w-full gap-4">
        <ChangePasswordForm saving={saving} onSubmit={onPasswordChange} />
        <SessionList sessions={sessions} loading={loading} saving={saving} onRefresh={onRefresh} onRevoke={onRevoke} />
      </div>
    </main>
  );
}
