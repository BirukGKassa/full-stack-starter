import { Link } from 'react-router-dom';
import BrandIcon from './brand-icon.js';

export { default as BrandIcon } from './brand-icon.js';

export default function Brand({ className = '' }) {
  return (
    <Link to="/" className={`brand ${className}`} aria-label="Lyu ERP home">
      <BrandIcon />
      <span>LYU<span className="brand-dot"> ERP</span></span>
    </Link>
  );
}
