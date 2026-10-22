export default function ModuleSelector({ modules, selected, onChange }) {
  const groups = modules.reduce((result, module) => {
    const group = module.group || 'ERP modules';
    result[group] ||= [];
    result[group].push(module);
    return result;
  }, {});
  return (
    <div className="grid gap-4 pt-2">
      {Object.entries(groups).map(([group, items]) => (
        <fieldset className="min-w-0 rounded-lg border border-[#e4e4e7] p-4 dark:border-[#3f3f46]" key={group}>
          <legend className="px-2 text-sm font-medium text-[#52525b] dark:text-[#d4d4d8]">{group}</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {items.map((module) => (
              <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-md border border-[#e4e4e7] bg-white px-3 py-2.5 text-sm text-[#3f3f46] transition-colors hover:bg-[#fafafa] has-[:checked]:border-[#a1a1aa] has-[:checked]:bg-[#f4f4f5] dark:border-[#3f3f46] dark:bg-[#18181b] dark:text-[#d4d4d8] dark:hover:bg-[#202024] dark:has-[:checked]:bg-[#27272a]" key={module.key}>
                <input className="size-4 accent-[#18181b] dark:accent-[#fafafa]" type="checkbox" checked={selected.includes(module.key)} onChange={() => onChange(module.key)} />
                <span>{module.label}</span>
              </label>
            ))}
          </div>
        </fieldset>
      ))}
    </div>
  );
}
