import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Microscope, Bug, CheckCircle, Bell,
  MessageSquare, Leaf, TrendingUp
} from 'lucide-react';
import { getDashboard } from '../api/adminApi';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  if (sev === 'High Risk') return <span className="badge b-red">High Risk</span>;
  if (sev === 'Medium Risk') return <span className="badge b-amber">Medium Risk</span>;
  return <span className="badge b-green">Low Risk</span>;
};

const StatCard = ({ icon: Icon, val, label, colorClass, onClick }) => (
  <div
    className="stat-card"
    onClick={onClick}
    style={{ cursor: onClick ? 'pointer' : 'default' }}
  >
    <div className={`stat-icon-wrap ${colorClass}`}>
      <Icon />
    </div>
    <div>
      <div className="stat-val">{val ?? <span style={{ opacity: .3 }}>—</span>}</div>
      <div className="stat-label">{label}</div>
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
      .catch(e => setErr(e.response?.data?.message || 'Connection timeout. Server waking up, please wait...'))
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

  if (loading) return <div className="spin-wrap"><div className="spinner" /><span>Loading platform dashboard...</span></div>;

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
          <h1>Dashboard Overview</h1>
          <p>Real-time platform insights — {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        <StatCard icon={Users}         val={s.total_users}       label="Registered Farmers" colorClass="si-green" onClick={() => navigate('/users')} />
        <StatCard icon={Microscope}     val={s.total_scans}       label="Total Crop Scans"   colorClass="si-blue"  onClick={() => navigate('/scans')} />
        <StatCard icon={Bug}            val={s.diseases_detected} label="Diseases Found"    colorClass="si-red"   onClick={() => navigate('/scans')} />
        <StatCard icon={CheckCircle}    val={s.healthy_plants}    label="Healthy Crops"     colorClass="si-green" onClick={() => navigate('/scans')} />
        <StatCard icon={Bell}           val={s.total_alerts}      label="Broadcast Alerts"  colorClass="si-amber" onClick={() => navigate('/alerts')} />
        <StatCard icon={MessageSquare}  val={s.total_questions}   label="Farmer Questions"  colorClass="si-teal"  onClick={() => navigate('/expert-questions')} />
      </div>

      <div className="responsive-dash-grid">
        {/* Recent Scans */}
        <div className="card">
          <div className="card-head">
            <div>
              <div className="card-title"><Leaf size={18} /> Recent Plant Diagnostics</div>
              <div className="card-sub">Latest disease detections submitted by farmers</div>
            </div>
          </div>
          {!data?.recent_scans?.length ? (
            <div className="empty"><Leaf size={32} /><p>No scans recorded yet</p></div>
          ) : (
            <div className="tbl-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Farmer</th>
                    <th>Crop</th>
                    <th>Disease</th>
                    <th>Severity</th>
                    <th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_scans.map((sc, i) => {
                    const initials = sc.user_name?.substring(0,1).toUpperCase() || 'U';
                    const avatarColor = avatarColors[i % avatarColors.length];
                    return (
                      <tr key={sc.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="avatar" style={{ background: avatarColor }}>
                              {initials}
                            </div>
                            <div style={{ fontWeight: 600 }}>{sc.user_name}</div>
                          </div>
                        </td>
                        <td>
                          <span className="badge b-green">{sc.crop_name}</span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{sc.disease_name}</td>
                        <td><SevBadge sev={sc.severity} /></td>
                        <td style={{ color: 'var(--text-muted)' }}>{timeAgo(sc.scanned_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* New Farmers */}
          <div className="card">
            <div className="card-head">
              <div>
                <div className="card-title"><Users size={18} color="var(--blue)" /> New Registrations</div>
                <div className="card-sub">Recently registered users</div>
              </div>
            </div>
            <div style={{ padding: '12px 20px' }}>
              {data?.recent_users?.map((u, i) => {
                const initials = u.full_name?.substring(0,1).toUpperCase() || 'U';
                const avatarColor = avatarColors[i % avatarColors.length];
                return (
                  <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0', borderBottom: i < data.recent_users.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="avatar" style={{ background: avatarColor }}>
                      {initials}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{u.full_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.mobile_number} · {fmtDate(u.created_at)}</div>
                    </div>
                  </div>
                );
              })}
              {!data?.recent_users?.length && (
                <div className="empty"><p>No users yet</p></div>
              )}
            </div>
          </div>

          {/* Top Diseases */}
          {data?.disease_distribution?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div>
                  <div className="card-title"><TrendingUp size={18} color="var(--red)" /> Top Crop Diseases</div>
                  <div className="card-sub">Most prevalent disease detections</div>
                </div>
              </div>
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {data.disease_distribution.map((d, i) => {
                  const max = data.disease_distribution[0]?.count || 1;
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={i}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                        <span style={{ color: 'var(--text-1)', fontWeight: 500 }}>{d.disease_name}</span>
                        <span style={{ color: 'var(--text-muted)' }}>{d.count} scans</span>
                      </div>
                      <div className="progress-bar-track">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
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
