import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import logo from '../assets/logo.png';

function NavItem({ item }) {
  const content = (
    <>
      {item.icon ? <item.icon size={18} /> : null}
      <span>{item.label}</span>
    </>
  );

  if (item.to) {
    return (
      <Link to={item.to} className={`rf-dashboard-nav-item${item.active ? ' is-active' : ''}`}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={item.onClick} className={`rf-dashboard-nav-item${item.active ? ' is-active' : ''}`}>
      {content}
    </button>
  );
}

export default function DashboardFrame({
  badge = 'Panel',
  badgeTone = 'admin',
  brandName = 'repairflow',
  subtitle = '',
  navItems = [],
  user,
  onLogout,
  headerTitle,
  headerActions,
  children,
}) {
  return (
    <div className="rf-dashboard-shell">
      <aside className="rf-dashboard-sidebar">
        <div className="rf-dashboard-brand">
          <div className="rf-dashboard-brand-mark">
            <img src={logo} alt="RepairFlow logo" className="rf-dashboard-brand-logo" />
          </div>
          <div className="rf-dashboard-brand-copy">
            <div className="rf-dashboard-brand-name">{brandName}</div>
            <div className={`rf-dashboard-brand-badge rf-dashboard-brand-badge--${badgeTone}`}>{badge}</div>
            {subtitle ? <p className="rf-dashboard-brand-subtitle">{subtitle}</p> : null}
          </div>
        </div>

        <nav className="rf-dashboard-nav">
          {navItems.map((item) => (
            <NavItem key={item.key || item.label} item={item} />
          ))}
        </nav>

        <div className="rf-dashboard-sidebar-footer">
          {user ? (
            <div className="rf-dashboard-userbox">
              <strong>{`${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}</strong>
              <span>{user.email}</span>
            </div>
          ) : null}

          {user && onLogout ? (
            <button type="button" onClick={onLogout} className="rf-dashboard-logout">
              <LogOut size={18} />
              <span>Wyloguj się</span>
            </button>
          ) : null}
        </div>
      </aside>

      <main className="rf-dashboard-main">
        <header className="rf-dashboard-topbar">
          <h1>{headerTitle}</h1>
          {headerActions ? <div className="rf-dashboard-topbar-actions">{headerActions}</div> : null}
        </header>

        <section className="rf-dashboard-content">{children}</section>
      </main>
    </div>
  );
}
