import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: '▦' },
  { to: '/records', label: 'Records', icon: '☰' },
  { to: '/summary', label: 'Summary', icon: '◑' },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <span className="brand-icon">₹</span>
        <span className="brand-name">FinanceApp</span>
      </div>
      <nav className="sidebar-nav">
        {navItems.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">Finance Dashboard v1.0</div>
    </aside>
  );
}
