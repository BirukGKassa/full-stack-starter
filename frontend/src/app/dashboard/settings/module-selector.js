export default function ModuleSelector({ modules, selected, onChange }) {
  const groups = modules.reduce((result, module) => {
    const group = module.group || 'ERP modules';
    result[group] ||= [];
    result[group].push(module);
    return result;
  }, {});
  return (
    <div className="prod-assignment-groups">
      {Object.entries(groups).map(([group, items]) => (
        <fieldset className="prod-assignment-group" key={group}>
          <legend>{group}</legend>
          <div className="prod-module-checks">{items.map((module) => (
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
