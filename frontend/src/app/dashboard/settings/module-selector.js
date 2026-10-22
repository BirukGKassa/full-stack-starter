export default function ModuleSelector({ modules, selected, onChange }) {
  const groups = modules.reduce((result, module) => {
    const group = module.group || 'ERP modules';
    result[group] ||= [];
    result[group].push(module);
    return result;
  }, {});
  return (
    <div className="grid gap-3 mt-[8px]">
      {Object.entries(groups).map(([group, items]) => (
        <fieldset className="group/prod-assignment-group min-w-0 p-[9px] border border-[#e6ebe4] rounded-lg [&_legend]:py-0 px-1.5 [&_legend]:text-[#637468] [&_legend]:text-[10px] [&_legend]:font-bold dark:border-[#35443a] dark:bg-[#151f19] dark:[&_legend]:text-[#b0beb3]" key={group}>
          <legend>{group}</legend>
          <div className="grid grid-cols-2 gap-2 mt-[8px] [&_label]:flex [&_label]:items-center [&_label]:gap-[7px] [&_label]:min-h-[30px] [&_label]:py-1.5 px-2 [&_label]:border border-[#e6ebe4] [&_label]:rounded-md [&_label]:bg-[#fbfcf9] [&_label]:text-[#58695d] [&_label]:text-[9px] [&_label]:cursor-pointer [&_input]:accent-[#315b3a] max-[480px]:grid-cols-[minmax(0,_1fr)] dark:[&_label]:border-[#35473a] dark:[&_label]:bg-[#151f19] dark:[&_label]:text-[#c1cec3] grid-cols-[repeat(auto-fill,_minmax(175px,_1fr))] mt-[7px] [&_label]:min-h-10 [&_label]:py-2 px-2.5 [&_label]:border-[#e2e9e1] [&_label]:rounded-lg [&_label]:bg-[#fbfdf9] [&_label]:text-[#405648] [&_label]:text-[11px] [&_label]:transition-[border-color,background,box-shadow] duration-150 [&_label:has(input:checked)]:border-[#a6c39c] [&_label:has(input:checked)]:bg-[#f1f7ee] [&_label:has(input:checked)]:shadow-[inset_0_0_0_1px_#dcebd6] [&_label:has(input:checked)]:text-[#294d32] [&_input]:w-4 [&_input]:min-w-4 [&_input]:h-4 [&_input]:min-h-4 [&_input]:flex-[0_0_16px] [&_input]:m-0 [&_input]:p-0 [&_label_>_span]:text-inherit [&_label_>_span]:text-[11px] [&_label_>_span]:font-semibold dark:[&_label]:text-[#c9d6cb] dark:[&_label:has(input:checked)]:border-[#567454] dark:[&_label:has(input:checked)]:bg-[#243528] dark:[&_label:has(input:checked)]:shadow-[inset_0_0_0_1px_#344c37] dark:[&_label:has(input:checked)]:text-[#d5e8ce] [.group\/prod-assignment-group_&]:m-0">{items.map((module) => (
            <label key={module.key}>
              <input type="checkbox" checked={selected.includes(module.key)} onChange={() => onChange(module.key)} />
              <span>{module.label}</span>
            </label>
          ))}</div>
        </fieldset>
      ))}
    </div>
  );
}
