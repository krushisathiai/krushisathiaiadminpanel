import { useLocation } from 'react-router-dom';
import { Menu, ChevronRight, Bell, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BREADCRUMBS = {
  '/': 'Dashboard',
  '/users': 'Users',
  '/scans': 'Plant Scans',
  '/diseases': 'Crop Diseases',
  '/urea-requests': 'Urea Allocation Requests',
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

        
        <div style={{ position: 'relative', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '36px', height: '36px', borderRadius: '50%', background: '#f3f4f6' }}>
          <Bell size={18} color="#4b5563" />
          <span style={{ position: 'absolute', top: '-2px', right: '-2px', background: '#ef4444', color: '#fff', fontSize: '10px', fontWeight: 'bold', width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff' }}>3</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', paddingLeft: '8px', borderLeft: '1px solid #e5e7eb' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#059669', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px' }}>
            {initials}
          </div>
          <span style={{ fontSize: '14px', color: '#374151', fontWeight: 500 }}>Admin</span>
          <ChevronDown size={14} color="#9ca3af" />
        </div>
      </div>
    </div>
  );
}
