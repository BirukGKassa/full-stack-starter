import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';

export default function SettingsHeader() {
  return (
    <>
      <div className="erp-dashboard-top">
        <div><Brand /><p className="prod-eyebrow">LYU ERP · ADMINISTRATION</p><p>System access and accounts</p></div>
        <Link className="prod-button prod-button-outline" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="prod-page-heading"><p className="prod-eyebrow">ADMINISTRATION · ACCESS CONTROL</p><h1>System settings</h1><p>Create accounts, assign production modules, and manage account access.</p></div>
    </>
  );
}
