import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle,
  Users, Leaf, BarChart3, Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FEATURES = [
  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Monitor all platform stats' },
  { icon: Users, title: 'User Management', desc: 'Manage registered farmers' },
  { icon: Leaf, title: 'Scan Analytics', desc: 'Track all crop disease scans' },
  { icon: Shield, title: 'Secure Access', desc: 'JWT-protected admin portal' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPass, setShowPass] = useState(false);

  const { login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.success) {
        addToast('Welcome back, Admin!', 'ok');
        navigate('/');
      } else {
        setError(result.message || 'Invalid credentials');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Cannot connect to server. Backend might be waking up, please wait a moment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left panel */}
      <div className="login-left">
        <div className="login-left-content">
          <div className="login-brand-icon">
            <img src="/logo.png" alt="Krushi Sathi Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={(e) => { e.target.src = '/vite.svg'; }} />
          </div>
          <h1>Krushi Sathi</h1>
          <p>AI-powered farming assistant for Indian farmers. Manage your platform from one place.</p>

          <div className="login-features" style={{ marginTop: 24, maxWidth: 340 }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div className="login-feature" key={title}>
                <div className="login-feature-icon"><Icon /></div>
                <div>
                  <p>{title}</p>
                  <span>{desc}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <h2>Admin Sign In</h2>
          <p>Enter your credentials to access the dashboard</p>

          {error && (
            <div className="login-err">
              <AlertCircle />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="search-wrap">
                <div className="search-ico"><Mail size={15} /></div>
                <input
                  id="admin-email"
                  type="email"
                  className="inp with-icon"
                  placeholder="admin@krushisathi.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="pass-wrap">
                <div className="search-ico" style={{ left: 10 }}><Lock size={15} /></div>
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  className="inp with-icon"
                  placeholder="Enter your password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pass-eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="btn btn-primary login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 15, height: 15, borderWidth: 2 }} />
                  Signing in...
                </>
              ) : (
                <>
                  Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-hint">
            Default: <code>admin@krushisathi.com</code> / <code>Admin@2024</code>
          </div>
        </div>
      </div>
    </div>
  );
}
