import { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Leaf, Bell, MessageSquare,
  Shield, ChevronLeft, LogOut, Menu, X, ShoppingBag, Sprout
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { FaUserCheck } from 'react-icons/fa';

const NAV = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', tip: 'Dashboard' },
  { to: '/users', icon: Users, label: 'Users', tip: 'Users' },
  { to: '/active-users', icon: FaUserCheck, label: 'Active Users', tip: 'Active Users' },
  { to: '/scans', icon: Leaf, label: 'Plant Scans', tip: 'Scans' },
  { to: '/diseases', icon: Leaf, label: 'Crop Diseases', tip: 'Diseases' },
  { to: '/fertilizers', icon: Sprout, label: 'Fertilizer Guide', tip: 'Fertilizers' },
  { to: '/shop-products', icon: ShoppingBag, label: 'Shop Listings', tip: 'Shop Products' },
  { to: '/alerts', icon: Bell, label: 'Alerts', tip: 'Alerts' },
  { to: '/expert-questions', icon: MessageSquare, label: 'Expert Q&A', tip: 'Expert Q&A' },
  { to: '/privacy-policy', icon: Shield, label: 'Privacy Policy', tip: 'Privacy' },
];

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = admin?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'A';

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="mob-overlay"
          style={{ display: 'block' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mob-open' : ''}`}>
        {/* Brand */}
        <div className="sb-brand">
          <img src="/logo.png" alt="Krushi Sathi Logo" className="sb-logo-img" onError={(e) => { e.target.src = '/vite.svg'; }} />
          <div className="sb-brand-text">
            <h2>Krushi Sathi</h2>
            <span>Admin Panel</span>
          </div>

          {/* Mobile close */}
          <button
            onClick={() => setMobileOpen(false)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
            className="sb-close-btn"
            id="sidebar-close-btn"
          >
            <X size={18} />
          </button>
        </div>

        {/* Collapse toggle (desktop) */}
        <button
          className="sb-toggle"
          onClick={() => setCollapsed(c => !c)}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronLeft size={14} />
        </button>

        {/* Nav */}
        <nav className="sb-nav">
          <div className="sb-section-label">Main Menu</div>
          {NAV.map(({ to, icon: Icon, label, tip }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              data-tip={tip}
              className={({ isActive }) => `sb-item ${isActive ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              <span className="sb-icon"><Icon size={18} /></span>
              <span className="sb-label">{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="sb-footer">
          {/* User info */}
          <div className="sb-user">
            <div className="sb-avatar">{initials}</div>
            <div className="sb-user-info">
              <p>{admin?.name || 'Admin'}</p>
              <span>{admin?.email || 'admin@krushisathi.com'}</span>
            </div>
          </div>
          <div className="sb-divider" style={{ margin: '8px 0' }} />
          {/* Logout */}
          <button className="sb-logout" onClick={handleLogout} data-tip="Logout" id="sidebar-logout-btn">
            <span className="sb-icon"><LogOut size={18} /></span>
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
