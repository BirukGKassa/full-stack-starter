export const companies = [
  { code: 'AMH', name: 'Aluminum extrusion' },
  { code: 'AMR', name: 'PP woven bags' },
  { code: 'KORKI', name: 'Bottle closures' },
  { code: 'RASA', name: 'Flour milling' },
];

export const navigation = [
  { id: 'overview', label: 'Overview', icon: '◫', group: 'WORKSPACE' },
  { id: 'production', label: 'Production entry', icon: '＋', group: 'DATA ENTRY' },
  { id: 'downtime', label: 'Machine downtime', icon: '◷', group: 'DATA ENTRY' },
  { id: 'products', label: 'Products & BOMs', icon: '◇', group: 'OPERATIONS' },
  { id: 'orders', label: 'Work orders', icon: '▤', group: 'OPERATIONS' },
  { id: 'machines', label: 'Machines & tools', icon: '⚙', group: 'OPERATIONS' },
  { id: 'quality', label: 'Quality & traceability', icon: '◉', group: 'OPERATIONS' },
  { id: 'reports', label: 'Reports', icon: '▥', group: 'INSIGHTS' },
];

export const resourceErrors = {
  boms: 'Bill of materials', workCenters: 'Work centers', orders: 'Work orders',
  productionLogs: 'Production logs', downtime: 'Downtime logs', downtimeReasons: 'Downtime reasons',
  qualityInspections: 'Quality inspections', tools: 'Factory tools', materialLots: 'Material traceability',
  machineOee: 'Machine OEE',
};
