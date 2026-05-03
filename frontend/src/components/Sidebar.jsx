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
  HiOutlineLogout,
  HiOutlineUserCircle,
  HiOutlineFolderAdd,
  HiOutlineLightningBolt,
} from 'react-icons/hi';

function Sidebar({ open, onClose, user, onLogout }) {
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
    { to: '/projects', icon: <HiOutlineFolderAdd />, label: 'Project Tracker' },
    { to: '/memory', icon: <HiOutlineLightningBolt />, label: 'Memory Bank' },
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
        
        <div className="sidebar-footer">
          <div className="user-profile">
            <HiOutlineUserCircle className="user-avatar" />
            <div className="user-info">
              <span className="user-name">{user?.username || 'User'}</span>
              <span className="user-role">Administrator</span>
            </div>
            <button className="logout-btn" onClick={onLogout} title="Logout">
              <HiOutlineLogout />
            </button>
          </div>
        </div>

        <style>{`
          .sidebar-footer {
            margin-top: auto;
            padding: 16px;
            border-top: 1px solid var(--border-color);
          }
          .user-profile {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 8px 12px;
            background: rgba(255, 255, 255, 0.03);
            border-radius: var(--radius-sm);
          }
          .user-avatar {
            font-size: 1.8rem;
            color: var(--accent-primary);
            flex-shrink: 0;
          }
          .user-info {
            display: flex;
            flex-direction: column;
            min-width: 0;
            flex: 1;
          }
          .user-name {
            font-size: 0.85rem;
            font-weight: 700;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }
          .user-role {
            font-size: 0.7rem;
            color: var(--text-muted);
          }
          .logout-btn {
            background: transparent;
            border: none;
            color: var(--text-muted);
            font-size: 1.2rem;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
            transition: all 0.2s;
          }
          .logout-btn:hover {
            color: var(--error);
            background: rgba(239, 68, 68, 0.1);
          }
        `}</style>
      </aside>
    </>
  );
}

export default Sidebar;
