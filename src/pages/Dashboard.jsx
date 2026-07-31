import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Microscope, Bug, CheckCircle, Bell,
  MessageSquare, Clock, Leaf, TrendingUp
} from 'lucide-react';
import { getDashboard } from '../api/adminApi';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  if (sev === 'High Risk') return <span className="badge b-red">High Risk</span>;
  if (sev === 'Medium Risk') return <span className="badge b-amber">Medium Risk</span>;
  return <span className="badge b-green">Low Risk</span>;
};

const COLOR_MAP = {
  green:  { bg: '#ecfdf5', color: '#059669' },
  red:    { bg: '#fef2f2', color: '#dc2626' },
  blue:   { bg: '#eff6ff', color: '#3b82f6' },
  amber:  { bg: '#fffbeb', color: '#d97706' },
  teal:   { bg: '#f0fdfa', color: '#0d9488' },
  default:{ bg: '#f3f4f6', color: '#6b7280' },
};

const StatCard = ({ icon: Icon, val, label, color, onClick }) => {
  const c = COLOR_MAP[color] || COLOR_MAP.default;
  return (
    <div 
      onClick={onClick}
      className="card"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '16px', 
        padding: '20px',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; } }}
      onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = ''; } }}
    >
      <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: c.bg, color: c.color, flexShrink: 0 }}>
        <Icon size={24} />
      </div>
      <div>
        <div style={{ color: 'var(--text-muted)', fontSize: '13px', fontWeight: 500 }}>{label}</div>
        <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '2px 0' }}>{val ?? <span style={{ opacity: .3 }}>—</span>}</div>
      </div>
    </div>
  );
};


export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getDashboard()
      .then(r => { if (r.data.success) setData(r.data); })
      .catch(e => setErr(e.response?.data?.message || 'Connection timeout. Backend server might be waking up, please wait a few seconds and refresh.'))
      .finally(() => setLoading(false));
  }, []);

  const timeAgo = (d) => {
    if (!d) return '—';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  const fmtDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="spin-wrap"><div className="spinner" /><span>Loading dashboard...</span></div>;

  if (err) return (
    <div className="empty">
      <Bug size={44} />
      <h3>Connection Failed</h3>
      <p>{err}</p>
    </div>
  );

  const s = data?.stats || {};
  const avatarColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Platform overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="responsive-stats-grid">
        <StatCard icon={Users}         val={s.total_users}       label="Total Farmers"     color="green" onClick={() => navigate('/users')} />
        <StatCard icon={Microscope}     val={s.total_scans}       label="Total Scans"       color="blue"  onClick={() => navigate('/scans')} />
        <StatCard icon={Bug}            val={s.diseases_detected} label="Diseases Found"    color="red"   onClick={() => navigate('/scans')} />
        <StatCard icon={CheckCircle}    val={s.healthy_plants}    label="Healthy Plants"    color="green" onClick={() => navigate('/scans')} />
        <StatCard icon={Bell}           val={s.total_alerts}      label="Alerts Sent"       color="amber" onClick={() => navigate('/alerts')} />
        <StatCard icon={MessageSquare}  val={s.total_questions}   label="Questions"         color="teal"  onClick={() => navigate('/expert-questions')} />
      </div>

      <div className="responsive-dash-grid">
        {/* Recent Scans */}
        <div className="card" style={{ padding: 0 }}>
          <div className="tbl-toolbar" style={{ borderBottom: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><Leaf size={18} color="#059669" /> Recent Scans</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Latest disease detections</div>
            </div>
          </div>
          {!data?.recent_scans?.length ? (
            <div className="empty"><Leaf size={32} /><p>No scans yet</p></div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Disease</th>
                    <th>Severity</th>
                    <th>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_scans.map((sc, i) => {
                    const initials = sc.user_name?.substring(0,1).toUpperCase() || 'U';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    return (
                      <tr key={sc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px', flexShrink: 0 }}>
                              {initials}
                            </div>
                            <div style={{ fontWeight: 500 }}>{sc.user_name}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge b-green">{sc.crop_name}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{sc.disease_name}</td>
                        <td><SevBadge sev={sc.severity} /></td>
                        <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{timeAgo(sc.scanned_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Recent users */}
          <div className="card" style={{ padding: 0 }}>
            <div className="tbl-toolbar" style={{ borderBottom: '1px solid #e2e8f0' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><Users size={18} color="#3b82f6" /> New Farmers</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>Recently joined</div>
              </div>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {data?.recent_users?.map((u, i) => {
                const initials = u.full_name?.substring(0,1).toUpperCase() || 'U';
                const avatarColor = avatarColors[i % avatarColors.length];
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < data.recent_users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px', flexShrink: 0 }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 500, fontSize: '14px' }}>{u.full_name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.mobile_number} · {fmtDate(u.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              {!data?.recent_users?.length && (
                <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)' }}>No users yet</div>
              )}
            </div>
          </div>

          {/* Disease distribution */}
          {data?.disease_distribution?.length > 0 && (
            <div className="card" style={{ padding: 0 }}>
              <div className="tbl-toolbar" style={{ borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><TrendingUp size={18} color="#dc2626" /> Top Diseases</div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.disease_distribution.map((d, i) => {
                  const max = data.disease_distribution[0]?.count || 1;
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ fontWeight: 500 }}>{d.disease_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{d.count} scans</span>
                      </div>
                      <div style={{ height: '6px', background: '#f3f4f6', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#ef4444', borderRadius: '3px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
