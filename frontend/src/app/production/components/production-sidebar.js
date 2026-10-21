import { Link } from 'react-router-dom';
import Brand from '../../components/brand.js';
import { navigation } from '../constants.js';

export default function ProductionSidebar({ user, access, isAdmin, activeView, activeDowntime, onNavigate }) {
  return (
    <aside className="prod-sidebar">
      <Brand className="prod-brand" />
      {['WORKSPACE', 'DATA ENTRY', 'OPERATIONS', 'INSIGHTS'].map((group) => (
        <div className="prod-nav-group" key={group}>
          <p>{group}</p>
          {navigation.filter((item) => item.group === group && (isAdmin || access?.modules?.includes(item.id))).map((item) => (
            <button key={item.id} onClick={() => onNavigate(item.id)} className={`prod-nav-link ${activeView === item.id ? 'prod-nav-link-active' : ''}`}>
              <span>{item.icon}</span>{item.label}{item.id === 'downtime' && activeDowntime.length > 0 && <i>{activeDowntime.length}</i>}
            </button>
          ))}
        </div>
      ))}
      <div className="prod-sidebar-bottom">
        <div className="prod-user"><span>{user.name?.[0]?.toUpperCase() || 'U'}</span><div><strong>{user.name}</strong><small>Production workspace</small></div></div>
        <Link to="/dashboard" className="prod-back-link">← Personal dashboard</Link>
      </div>
    </aside>
  );
}
