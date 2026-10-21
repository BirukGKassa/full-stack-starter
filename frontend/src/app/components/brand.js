import { Link } from 'react-router-dom';

export function BrandIcon({ className = '' }) {
  return (
    <span className={`brand-logo-icon ${className}`} aria-hidden="true">
      <img className="brand-logo-on-light" src="/assets/dark-logo.svg" alt="" />
      <img className="brand-logo-on-dark" src="/assets/light-logo.svg" alt="" />
    </span>
  );
}

export default function Brand({ className = '' }) {
  return (
    <Link to="/" className={`brand ${className}`} aria-label="Lyu ERP home">
      <BrandIcon />
      <span>LYU<span className="brand-dot"> ERP</span></span>
    </Link>
  );
}
