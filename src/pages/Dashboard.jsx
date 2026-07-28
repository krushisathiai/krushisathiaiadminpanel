import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Microscope, Bug, CheckCircle, Bell,
  MessageSquare, Clock, Leaf, TrendingUp
} from 'lucide-react';
import { getDashboard } from '../api/adminApi';

const SevBadge = ({ sev }) => {
  if (!sev) return <span style={{ color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>—</span>;
  if (sev === 'High Risk') return <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>High Risk</span>;
  if (sev === 'Medium Risk') return <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Medium Risk</span>;
  return <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Low Risk</span>;
};

const StatCard = ({ icon: Icon, val, label, color, onClick }) => (
  <div 
    onClick={onClick}
    style={{ 
      background: '#fff', 
      borderRadius: '12px', 
      padding: '20px', 
      display: 'flex', 
      alignItems: 'center', 
      gap: '16px', 
      border: '1px solid #e5e7eb', 
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.2s ease',
      transform: 'translateY(0)',
    }}
    onMouseEnter={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.1)'; } }}
    onMouseLeave={(e) => { if(onClick) { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)'; } }}
  >
    <div style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: color === 'green' ? '#ecfdf5' : color === 'red' ? '#fef2f2' : color === 'blue' ? '#eff6ff' : color === 'amber' ? '#fffbeb' : color === 'teal' ? '#f0fdfa' : '#f3f4f6', color: color === 'green' ? '#059669' : color === 'red' ? '#dc2626' : color === 'blue' ? '#3b82f6' : color === 'amber' ? '#d97706' : color === 'teal' ? '#0d9488' : '#6b7280' }}>
      <Icon size={24} />
    </div>
    <div>
      <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>{label}</div>
      <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '2px 0' }}>{val ?? <span style={{ opacity: .3 }}>—</span>}</div>
    </div>
  </div>
);

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
      <div className="page-head" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Dashboard</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Platform overview — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
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
        <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
          <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><Leaf size={18} color="#059669" /> Recent Scans</div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Latest disease detections</div>
            </div>
          </div>
          {!data?.recent_scans?.length ? (
            <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}><Leaf size={32} style={{ margin: '0 auto 16px', opacity: 0.5 }} /><p>No scans yet</p></div>
          ) : (
            <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                    <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>Farmer</th>
                    <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>Crop</th>
                    <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>Disease</th>
                    <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>Severity</th>
                    <th style={{ padding: '12px 20px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', textTransform: 'uppercase' }}>When</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_scans.map((sc, i) => {
                    const initials = sc.user_name?.substring(0,1).toUpperCase() || 'U';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    return (
                      <tr key={sc.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '12px' }}>
                              {initials}
                            </div>
                            <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{sc.user_name}</div>
                          </div>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#4b5563', fontSize: '14px' }}>
                          <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{sc.crop_name}</span>
                        </td>
                        <td style={{ padding: '16px 20px', color: '#111827', fontWeight: 500, fontSize: '14px' }}>{sc.disease_name}</td>
                        <td style={{ padding: '16px 20px' }}><SevBadge sev={sc.severity} /></td>
                        <td style={{ padding: '16px 20px', color: '#6b7280', fontSize: '13px' }}>{timeAgo(sc.scanned_at)}</td>
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
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
            <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><Users size={18} color="#3b82f6" /> New Farmers</div>
              <div style={{ color: '#6b7280', fontSize: '13px', marginTop: '4px' }}>Recently joined</div>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {data?.recent_users?.map((u, i) => {
                const initials = u.full_name?.substring(0,1).toUpperCase() || 'U';
                const avatarColor = avatarColors[i % avatarColors.length];
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < data.recent_users.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{u.full_name}</div>
                      <div style={{ color: '#6b7280', fontSize: '12px' }}>{u.mobile_number} · {fmtDate(u.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              {!data?.recent_users?.length && (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: '#6b7280' }}>No users yet</div>
              )}
            </div>
          </div>

          {/* Disease distribution */}
          {data?.disease_distribution?.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
              <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#111827', fontWeight: 600, fontSize: '16px' }}><TrendingUp size={18} color="#dc2626" /> Top Diseases</div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.disease_distribution.map((d, i) => {
                  const max = data.disease_distribution[0]?.count || 1;
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: '#374151', fontWeight: 500 }}>{d.disease_name}</span>
                        <span style={{ color: '#6b7280' }}>{d.count} scans</span>
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
