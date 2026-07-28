import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Sidebar from './components/Sidebar';
import Topbar from './components/Header';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Scans from './pages/Scans';
import Alerts from './pages/Alerts';
import ExpertQuestions from './pages/ExpertQuestions';
import PrivacyPolicy from './pages/PrivacyPolicy';
import Diseases from './pages/Diseases';
import Fertilizers from './pages/Fertilizers';
import ShopProducts from './pages/ShopProducts';

function ProtectedLayout() {
  const { admin, loading } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', color: 'var(--t5)' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🌾</div>
          <div className="spinner" style={{ margin: '0 auto 12px' }} />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!admin) return <Navigate to="/login" replace />;

  return (
    <div className="layout">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />
      <div className="main">
        <Topbar setMobileOpen={setMobileOpen} />
        <div className="page">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/users" element={<Users />} />
            <Route path="/scans" element={<Scans />} />
            <Route path="/diseases" element={<Diseases />} />
            <Route path="/fertilizers" element={<Fertilizers />} />
            <Route path="/shop-products" element={<ShopProducts />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/expert-questions" element={<ExpertQuestions />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

function LoginGuard() {
  const { admin, loading } = useAuth();
  if (loading) return null;
  if (admin) return <Navigate to="/" replace />;
  return <Login />;
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route path="/login" element={<LoginGuard />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
