import { NavLink } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
} from 'react-icons/hi';

function Sidebar({ open, onClose }) {
  const links = [
    { to: '/', icon: <HiOutlineChartBar />, label: 'Dashboard' },
    { to: '/new', icon: <HiOutlinePlusCircle />, label: 'New Entry' },
    { to: '/entries', icon: <HiOutlineClipboardList />, label: 'All Entries' },
  ];

  return (
    <>
      {open && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.4)',
            zIndex: 99,
          }}
          onClick={onClose}
        />
      )}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🚀</div>
          <h1>
            DevOps Tracker
            <span>Daily Work Companion</span>
          </h1>
        </div>
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
              end={link.to === '/'}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Phase 1 — MVP
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
