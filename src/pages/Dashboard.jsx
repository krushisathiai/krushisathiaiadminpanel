import { useState, useEffect } from 'react';
import {
  Users, Microscope, Bug, CheckCircle, Bell,
  MessageSquare, Clock, Leaf, TrendingUp
} from 'lucide-react';
import { getDashboard } from '../api/adminApi';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  const map = { 'High Risk': 'b-red', 'Medium Risk': 'b-amber', 'Low Risk': 'b-green' };
  return <span className={`badge ${map[sev] || 'b-gray'}`}>{sev}</span>;
};

const StatCard = ({ icon: Icon, val, label, cls }) => (
  <div className="stat-card">
    <div className={`stat-icon-wrap ${cls}`}><Icon size={20} /></div>
    <div className="stat-val">{val ?? <span style={{ opacity: .3 }}>—</span>}</div>
    <div className="stat-label">{label}</div>
  </div>
);

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

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
    d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  if (loading) return <div className="spin-wrap"><div className="spinner" /><span>Loading dashboard...</span></div>;

  if (err) return (
    <div className="empty">
      <Bug size={44} />
      <h3>Connection Failed</h3>
      <p>{err}</p>
    </div>
  );

  const s = data?.stats || {};

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dashboard</h1>
          <p>Platform overview — {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="stat-grid">
        <StatCard icon={Users}         val={s.total_users}       label="Total Farmers"     cls="si-green" />
        <StatCard icon={Microscope}     val={s.total_scans}       label="Total Scans"       cls="si-blue" />
        <StatCard icon={Bug}            val={s.diseases_detected} label="Diseases Found"    cls="si-red" />
        <StatCard icon={CheckCircle}    val={s.healthy_plants}    label="Healthy Plants"    cls="si-lime" />
        <StatCard icon={Bell}           val={s.total_alerts}      label="Alerts Sent"       cls="si-amber" />
        <StatCard icon={MessageSquare}  val={s.total_questions}   label="Questions"         cls="si-teal" />
        <StatCard icon={Clock}          val={s.pending_questions} label="Pending Q&A"       cls="si-amber" />
      </div>

      <div className="dash-grid">
        {/* Recent Scans */}
        <div className="card">
          <div className="card-head">
            <div className="card-title"><Leaf size={16} /> Recent Scans</div>
            <span className="card-sub">Latest detections</span>
          </div>
          {!data?.recent_scans?.length ? (
            <div className="empty" style={{ padding: 32 }}><Leaf size={32} /><p>No scans yet</p></div>
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
                  {data.recent_scans.map(sc => (
                    <tr key={sc.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="avatar">{sc.user_name?.[0]}</div>
                          <span className="fw-600 tc-1" style={{ fontSize: 13 }}>{sc.user_name}</span>
                        </div>
                      </td>
                      <td><span className="badge b-green">{sc.crop_name}</span></td>
                      <td className="fw-600 tc-1" style={{ fontSize: 13 }}>{sc.disease_name}</td>
                      <td><SevBadge sev={sc.severity} /></td>
                      <td className="tc-5 fs-12">{timeAgo(sc.scanned_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Recent users */}
          <div className="card">
            <div className="card-head">
              <div className="card-title"><Users size={16} /> New Farmers</div>
              <span className="card-sub">Recently joined</span>
            </div>
            <div className="activity-list" style={{ padding: '0 18px' }}>
              {data?.recent_users?.map(u => (
                <div key={u.id} className="activity-item">
                  <div className="avatar">{u.full_name?.[0]}</div>
                  <div className="user-row-info">
                    <p className="fw-600 tc-1 fs-13">{u.full_name}</p>
                    <span className="tc-5 fs-12">{u.mobile_number} · {fmtDate(u.created_at)}</span>
                  </div>
                </div>
              ))}
              {!data?.recent_users?.length && (
                <div className="empty" style={{ padding: 24 }}><p>No users yet</p></div>
              )}
            </div>
          </div>

          {/* Disease distribution */}
          {data?.disease_distribution?.length > 0 && (
            <div className="card">
              <div className="card-head">
                <div className="card-title"><TrendingUp size={16} /> Top Diseases</div>
              </div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {data.disease_distribution.map((d, i) => {
                  const max = data.disease_distribution[0]?.count || 1;
                  const pct = Math.round((d.count / max) * 100);
                  return (
                    <div key={i}>
                      <div className="flex items-center gap-2" style={{ justifyContent: 'space-between', marginBottom: 4 }}>
                        <span className="fs-13 tc-1">{d.disease_name}</span>
                        <span className="fs-12 tc-5">{d.count}</span>
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
