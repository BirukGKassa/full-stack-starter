export default function BrandIcon({ className = '' }) {
  return (
    <span className={`brand-logo-icon ${className}`} aria-hidden="true">
      <img className="brand-logo-on-light" src="/assets/dark-logo.svg" alt="" />
      <img className="brand-logo-on-dark" src="/assets/light-logo.svg" alt="" />
    </span>
  );
}
