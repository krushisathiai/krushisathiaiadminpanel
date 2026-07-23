import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, X, Megaphone, CloudRain, Sprout, Droplets, Clock, Info, Bug } from 'lucide-react';
import { getAlerts, createAlert, deleteAlert } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';


const TYPE_CFG = {
  general:    { icon: Megaphone,  cls: 'b-gray',  label: 'General' },
  disease:    { icon: Bug,        cls: 'b-red',   label: 'Disease' },
  weather:    { icon: CloudRain,  cls: 'b-blue',  label: 'Weather' },
  fertilizer: { icon: Sprout,     cls: 'b-green', label: 'Fertilizer' },
  spray:      { icon: Droplets,   cls: 'b-blue',  label: 'Spray' },
  reminder:   { icon: Clock,      cls: 'b-amber', label: 'Reminder' },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || { icon: Info, cls: 'b-gray', label: type };
  const Icon = cfg.icon;
  return <span className={`badge ${cfg.cls}`}><Icon size={11} /> {cfg.label}</span>;
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
      addToast('Alert created!', 'ok');
      setShowModal(false);
      setForm({ title: '', message: '', type: 'general', scheduled_at: '' });
      fetchAlerts();
    } catch (e) { addToast(e.response?.data?.message || 'Create failed', 'err'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    setDeleting(id);
    try { await deleteAlert(id); addToast('Alert deleted', 'ok'); fetchAlerts(); }
    catch { addToast('Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Alerts</h1>
          <p>{pg.total_alerts || 0} alerts total</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={15} /> New Alert
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading...</span></div>
        ) : alerts.length === 0 ? (
          <div className="empty"><Bell /><h3>No Alerts</h3><p>Create your first alert for farmers</p></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Type</th>
                  <th>Title</th>
                  <th>Message</th>
                  <th>Target</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((a, i) => (
                  <tr key={a.id}>
                    <td className="tc-5 fs-12">{(page - 1) * 10 + i + 1}</td>
                    <td><TypeBadge type={a.type} /></td>
                    <td className="fw-600 tc-1 fs-13" style={{ maxWidth: 180 }}>{a.title}</td>
                    <td className="tc-5 fs-12" style={{ maxWidth: 220 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.message}</div>
                    </td>
                    <td>
                      {a.user_name
                        ? <span className="badge b-blue">{a.user_name}</span>
                        : <span className="badge b-green"><Megaphone size={10} /> All Users</span>
                      }
                    </td>
                    <td>
                      {a.is_read
                        ? <span className="badge b-gray">Read</span>
                        : <span className="badge b-amber">Unread</span>
                      }
                    </td>
                    <td className="tc-5 fs-12">{fmtDate(a.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => setConfirmDelete({ id: a.id, title: a.title })}
                        disabled={deleting === a.id}
                        title="Delete"
                      >
                        {deleting === a.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {pg.total_pages > 1 && (
          <div className="tbl-footer">
            <span className="pg-info">Page {pg.current_page} of {pg.total_pages}</span>
            <div className="pagination">
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === pg.total_pages}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-hd">
              <h3><Bell size={18} /> Create Alert</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Title *</label>
                  <input type="text" className="inp" placeholder="Alert title..." value={form.title}
                    onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Message *</label>
                  <textarea className="textarea" placeholder="Write your message for farmers..."
                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="sel w-full" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Schedule (Optional)</label>
                  <input type="datetime-local" className="inp" value={form.scheduled_at}
                    onChange={e => setForm(f => ({ ...f, scheduled_at: e.target.value }))} />
                </div>
                <p className="tc-5 fs-12">This alert will be broadcast to all farmers.</p>
              </div>
              <div className="modal-ft">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : <><Bell size={14} /> Create Alert</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete.id, confirmDelete.title)}
        title="Confirm Delete"
        message={`Are you sure you want to delete the alert "${confirmDelete?.title}"? This cannot be undone.`}
      />
    </>
  );
}
