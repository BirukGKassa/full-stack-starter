import { Link } from 'react-router-dom';
import BrandIcon from './brand-icon.js';

export { default as BrandIcon } from './brand-icon.js';

export default function Brand({ className = '' }) {
  return (
    <Link to="/" className={`group/brand inline-flex items-center gap-2.5 font-extrabold text-[20px] font-['Manrope',_sans-serif] tracking-[-1.2px] text-[#123e32]   mr-0 mb-[53px] ml-2 max-[680px]:text-lg max-[680px]: dark:text-[#e1ebe2]${className}`} aria-label="Lyu ERP home">
      <BrandIcon />
      <span>LYU<span className="text-[#91aa55]"> ERP</span></span>
    </Link>
  );
}
