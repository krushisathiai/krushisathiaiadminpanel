import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight } from 'lucide-react';

const BREADCRUMBS = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/scans': 'Plant Scans',
  '/alerts': 'Alerts',
  '/expert-questions': 'Expert Q&A',
  '/privacy-policy': 'Privacy Policy',
};

export default function Topbar({ setMobileOpen }) {
  const location = useLocation();
  const page = BREADCRUMBS[location.pathname] || 'Admin';

  return (
    <div className="topbar">
      {/* Mobile hamburger */}
      <button
        className="mob-menu-btn"
        onClick={() => setMobileOpen(true)}
        id="topbar-menu-btn"
      >
        <Menu size={18} />
      </button>

      {/* Breadcrumb */}
      <div className="topbar-breadcrumb">
        <span className="crumb-home">Admin</span>
        <ChevronRight className="crumb-sep" size={14} />
        <span className="crumb-active">{page}</span>
      </div>

      {/* Right */}
      <div className="topbar-right">
        <div className="topbar-status">
          <div className="topbar-status-dot" />
          API Online
        </div>
      </div>
    </div>
  );
}
