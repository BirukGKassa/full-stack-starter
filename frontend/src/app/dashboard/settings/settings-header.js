import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';

export default function SettingsHeader() {
  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#e4e4e7] pb-5 dark:border-[#27272a]">
        <div className="space-y-2"><Brand /><p className="text-sm text-[#71717a] dark:text-[#a1a1aa]">Administration and workspace access</p></div>
        <Link className="inline-flex h-9 items-center justify-center rounded-md border border-[#e4e4e7] bg-white px-3 text-sm font-medium text-[#18181b] transition-colors hover:bg-[#f4f4f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#a1a1aa] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#fafafa] dark:hover:bg-[#27272a]" to="/dashboard">← Dashboard</Link>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-medium text-[#71717a] dark:text-[#a1a1aa]">Administration</p>
        <h1 className="text-3xl font-semibold tracking-tight text-[#18181b] dark:text-[#fafafa]">User access</h1>
        <p className="max-w-2xl text-sm leading-6 text-[#71717a] dark:text-[#a1a1aa]">Create accounts, assign implemented production tasks, and manage workspace access.</p>
      </div>
    </>
  );
}
