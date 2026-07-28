import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BREADCRUMBS = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/scans': 'Plant Scans',
  '/diseases': 'Crop Diseases',
  '/fertilizers': 'Fertilizer Guide Management',
  '/shop-products': 'Shop Listings',
  '/alerts': 'Alerts',
  '/expert-questions': 'Expert Q&A',
  '/privacy-policy': 'Privacy Policy',
};

export default function Topbar({ setMobileOpen }) {
  const location = useLocation();
  const page = BREADCRUMBS[location.pathname] || 'Admin';
  const { admin } = useAuth();
  
  const initials = admin?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

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
        <div className="topbar-icon-btn">
          <Bell size={18} />
          <span className="topbar-badge">3</span>
        </div>
        
        <div className="topbar-user">
          <div className="topbar-avatar">
            {initials}
          </div>
          <span className="topbar-username">{admin?.name || 'Admin'}</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
      </div>
    </div>
  );
}
