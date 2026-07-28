import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, X, Megaphone, CloudRain, Sprout, Droplets, Clock, Info, Bug } from 'lucide-react';
import { getAlerts, createAlert, deleteAlert } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_CFG = {
  general:    { icon: Megaphone,  bClass: 'b-gray', label: 'General' },
  disease:    { icon: Bug,        bClass: 'b-red', label: 'Disease' },
  weather:    { icon: CloudRain,  bClass: 'b-blue', label: 'Weather' },
  fertilizer: { icon: Sprout,     bClass: 'b-green', label: 'Fertilizer' },
  spray:      { icon: Droplets,   bClass: 'b-blue', label: 'Spray' },
  reminder:   { icon: Clock,      bClass: 'b-amber', label: 'Reminder' },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || { icon: Info, bClass: 'b-gray', label: type };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.bClass}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
};

const TYPES = Object.entries(TYPE_CFG).map(([val, { label }]) => ({ val, label }));

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [pg, setPg] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [form, setForm] = useState({ title: '', message: '', type: 'general', scheduled_at: '' });
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  const fetchAlerts = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getAlerts({ page, limit: 10 });
      if (r.data.success) { setAlerts(r.data.alerts); setPg(r.data.pagination); }
    } catch { addToast('Failed to load alerts', 'err'); }
    finally { setLoading(false); }
  }, [page]);

  useEffect(() => { fetchAlerts(); }, [fetchAlerts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await createAlert(form);
      addToast('Broadcast alert created!', 'ok');
      setShowModal(false);
      setForm({ title: '', message: '', type: 'general', scheduled_at: '' });
      fetchAlerts();
    } catch (e) { addToast(e.response?.data?.message || 'Create failed', 'err'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try { await deleteAlert(id); addToast('Alert deleted', 'ok'); fetchAlerts(); }
    catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="responsive-page-head">
        <div>
          <h1>Broadcast Alerts</h1>
          <p>Send agricultural weather, crop disease, and fertilizer notifications to registered farmers</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Broadcast New Alert
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading alerts...</span></div>
        ) : alerts.length === 0 ? (
          <div className="empty">
            <Bell size={48} />
            <h3>No Alerts Found</h3>
            <p>Create broadcast alerts to inform farmers about weather or crop advisories.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>TYPE</th>
                  <th>TITLE</th>
                  <th>MESSAGE</th>
                  <th>RECIPIENT</th>
                  <th>DATE</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a) => (
                  <tr key={a.id}>
                    <td><TypeBadge type={a.type} /></td>
                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{a.title}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '320px' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {a.message}
                      </div>
                    </td>
                    <td>
                      <span className="badge b-gray">{a.user_name || 'All Farmers (Broadcast)'}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>{fmtDate(a.created_at)}</td>
                    <td style={{ textAlign: 'center' }}>
                      <button 
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => setConfirmDelete({ id: a.id, title: a.title })}
                        title="Delete Alert"
                        disabled={deleting === a.id}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination */}
        {!loading && alerts.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_alerts || alerts.length)} of {pg.total_alerts || alerts.length} alerts
            </div>
            
            <div className="pagination">
              <button 
                className="pg-btn"
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
              >
                {'<'}
              </button>
              
              <button className="pg-btn active">
                {page}
              </button>
              
              <button 
                className="pg-btn"
                onClick={() => setPage(p => Math.min(pg.total_pages || 1, p + 1))}
                disabled={!pg.total_pages || page === pg.total_pages}
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-hd">
              <h3><Bell /> Broadcast New Alert</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label className="form-label">Alert Category</label>
                <select className="sel" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                  {TYPES.map(t => (
                    <option key={t.val} value={t.val}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Alert Title</label>
                <input type="text" className="inp" placeholder="e.g. Heavy Rainfall Advisory 🌧️" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
              </div>

              <div className="form-group">
                <label className="form-label">Message Content</label>
                <textarea className="textarea" rows="4" placeholder="Detailed advice for farmers..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required />
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Broadcasting...' : 'Broadcast Alert'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Alert"
          msg={`Are you sure you want to delete "${confirmDelete.title}"?`}
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
