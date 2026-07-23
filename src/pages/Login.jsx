import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Mail, Lock, Eye, EyeOff, AlertCircle,
  Users, Leaf, BarChart3, Shield, ChevronRight, CheckCircle2, User, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const FEATURES = [
  { icon: BarChart3, title: 'Real-time Dashboard', desc: 'Monitor all platform stats and activities' },
  { icon: Users, title: 'User Management', desc: 'Manage registered farmers and users' },
  { icon: Leaf, title: 'Scan Analytics', desc: 'Track all crop disease scans and reports' },
  { icon: Shield, title: 'Secure Access', desc: 'Role-based secure admin access' },
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
            <img src="/logo.png" alt="Krushi Sathi Logo" onError={(e) => { e.target.src = '/vite.svg'; }} />
          </div>
          <h1>Krushi <span>Sathi</span></h1>
          <div className="login-badge">AI-Powered Farming Assistant</div>
          <p>A smart platform for Indian farmers to manage crops, scan diseases, get expert advice and grow better.</p>

          <div className="login-features">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div className="login-feature" key={title}>
                <div className="login-feature-icon"><Icon size={20} /></div>
                <div className="login-feature-content">
                  <p>{title}</p>
                  <span>{desc}</span>
                </div>
                <ChevronRight size={16} className="login-feature-chevron" />
              </div>
            ))}
          </div>

          <div className="login-trusted">
            <CheckCircle2 size={16} color="#22c55e" />
            Trusted by <span>10,000+</span> farmers across India
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-badge">
            <Shield size={14} /> Admin Access
          </div>
          <h2>Admin <span>Sign In</span></h2>
          <p>Enter your credentials to access the admin dashboard</p>

          {error && (
            <div className="login-err">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <div className="login-form-group">
              <label>Email Address</label>
              <div className="login-input-wrap">
                <Mail size={16} className="search-ico" />
                <input
                  id="admin-email"
                  type="email"
                  className="login-input"
                  placeholder="admin@krushisathi.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="login-form-group">
              <label>Password</label>
              <div className="login-input-wrap">
                <Lock size={16} className="search-ico" />
                <input
                  id="admin-password"
                  type={showPass ? 'text' : 'password'}
                  className="login-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pass-eye" onClick={() => setShowPass(s => !s)}>
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="login-checkbox">
                <input type="checkbox" defaultChecked /> Remember me
              </label>
              <a href="#" className="login-forgot" onClick={(e) => e.preventDefault()}>Forgot Password?</a>
            </div>

            <button
              id="admin-login-btn"
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: 16, height: 16, borderWidth: 2, borderColor: '#fff', borderTopColor: 'transparent' }} />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} /> Sign In
                </>
              )}
            </button>
          </form>

          <div className="login-divider">
            <span>or continue with</span>
          </div>

          <button className="login-google">
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            Continue with Google
          </button>

          <div className="login-creds">
            <div className="login-creds-title">Default Credentials</div>
            <div className="login-creds-row">
              <div className="login-cred-pill">
                <User size={14} /> admin@krushisathi.com
              </div>
              <div className="login-cred-pill">
                <Lock size={14} /> Admin@2024
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
