export default function BrandIcon({ className = '' }) {
  return (
    <span className={`relative inline-block w-[27px] h-[27px] flex-[0_0_auto] [&_img]:absolute [&_img]:inset-0 [&_img]:w-[100%] [&_img]:h-[100%] [&_img]:object-contain [.group\/lyu-preview-mark&]:w-[26px] [.group\/lyu-preview-mark&]:h-[26px] [.group\/lyu-cta-mark&]:absolute [.group\/lyu-cta-mark&]:right-[34%] [.group\/lyu-cta-mark&]:bottom-[-75px] [.group\/lyu-cta-mark&]:w-[250px] [.group\/lyu-cta-mark&]:h-[250px] [.group\/lyu-cta-mark&]:opacity-[.04]${className}`} aria-hidden="true">
      <img className="[.group\/lyu-logo-contrast_&]:hidden [.group\/brand-light_&]:hidden dark:hidden" src="/assets/dark-logo.svg" alt="" />
      <img className="hidden [.group\/lyu-logo-contrast_&]:block [.group\/brand-light_&]:block dark:block" src="/assets/light-logo.svg" alt="" />
    </span>
  );
}
