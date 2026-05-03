import { NavLink } from 'react-router-dom';
import {
  HiOutlineChartBar,
  HiOutlinePlusCircle,
  HiOutlineClipboardList,
  HiOutlineBeaker,
  HiOutlineTerminal,
  HiOutlineExclamation,
  HiOutlineTrendingUp,
  HiOutlineBookOpen,
} from 'react-icons/hi';

function Sidebar({ open, onClose }) {
  const mainLinks = [
    { to: '/', icon: <HiOutlineChartBar />, label: 'Dashboard' },
    { to: '/new', icon: <HiOutlinePlusCircle />, label: 'New Entry' },
    { to: '/entries', icon: <HiOutlineClipboardList />, label: 'All Entries' },
  ];

  const toolLinks = [
    { to: '/labs', icon: <HiOutlineBeaker />, label: 'Lab Logger' },
    { to: '/commands', icon: <HiOutlineTerminal />, label: 'Commands' },
    { to: '/errors', icon: <HiOutlineExclamation />, label: 'Error Memory' },
    { to: '/reports', icon: <HiOutlineTrendingUp />, label: 'Reports & XP' },
    { to: '/interview', icon: <HiOutlineBookOpen />, label: 'Interview Helper' },
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
            <span>Study Companion</span>
          </h1>
        </div>
        <nav className="sidebar-nav">
          {/* Main Section */}
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '8px 16px 4px', fontWeight: 700 }}>
            Daily Tracker
          </div>
          {mainLinks.map((link) => (
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

          {/* Tools Section */}
          <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '20px 16px 4px', fontWeight: 700 }}>
            DevOps Tools
          </div>
          {toolLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              {link.icon}
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Phase 2 — Enhanced
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            v2.0.0
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
