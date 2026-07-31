import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, X, Megaphone, CloudRain, Sprout, Droplets, Clock, Info, Bug, Square, Eye, Edit } from 'lucide-react';
import { getAlerts, createAlert, deleteAlert } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_CFG = {
  general:    { icon: Megaphone,  cls: '', label: 'General' },
  disease:    { icon: Bug,        cls: 'b-red', label: 'Disease' },
  weather:    { icon: CloudRain,  cls: 'b-blue', label: 'Weather' },
  fertilizer: { icon: Sprout,     cls: 'b-green', label: 'Fertilizer' },
  spray:      { icon: Droplets,   cls: 'b-blue', label: 'Spray' },
  reminder:   { icon: Clock,      cls: 'b-amber', label: 'Reminder' },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || { icon: Info, cls: '', label: type };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.cls}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
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

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Alerts</h1>
          <p>{pg.total_alerts || 0} alerts total</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          <Plus size={18} /> New Alert
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
          </div>
        ) : alerts.length === 0 ? (
          <div className="empty">
            <Bell size={48} />
            <h3>No Alerts Found</h3>
            <p>Create your first alert for farmers</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ width: '40px' }}>#</th>
                  <th>TYPE</th>
                  <th>TITLE</th>
                  <th>MESSAGE</th>
                  <th>STATUS</th>
                  <th>CREATED</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((al, i) => {
                  const num = (page - 1) * 10 + i + 1;
                  const isScheduled = al.scheduled_at && new Date(al.scheduled_at) > new Date();
                  return (
                    <tr key={al.id}>
                      <td style={{ textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td>{num}</td>
                      <td><TypeBadge type={al.type} /></td>
                      <td style={{ fontWeight: 600 }}>{al.title}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{al.message}</td>
                      <td>
                        {isScheduled ? (
                          <span className="badge b-amber">Scheduled</span>
                        ) : (
                          <span className="badge b-green">Sent</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{fmtDate(al.created_at)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} title="View">
                            <Eye size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: deleting === al.id ? 0.5 : 1 }} 
                            onClick={() => setConfirmDelete(al)}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && alerts.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_alerts || alerts.length)} of {pg.total_alerts || alerts.length} alerts
            </div>
            
            <div className="pagination">
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                className="pg-btn"
              >
                {'<'}
              </button>
              
              <button className="pg-btn active">
                {page}
              </button>
              
              {pg.total_pages > page && (
                <button 
                  onClick={() => setPage(p => p + 1)}
                  className="pg-btn"
                >
                  {page + 1}
                </button>
              )}
              
              {pg.total_pages > page + 1 && (
                <span style={{ color: '#9ca3af', margin: '0 4px' }}>...</span>
              )}
              
              {pg.total_pages > page + 1 && (
                <button 
                  onClick={() => setPage(pg.total_pages)}
                  className="pg-btn"
                >
                  {pg.total_pages}
                </button>
              )}

              <button 
                onClick={() => setPage(p => Math.min(pg.total_pages || 1, p + 1))}
                disabled={!pg.total_pages || page === pg.total_pages}
                className="pg-btn"
              >
                {'>'}
              </button>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="overlay">
          <div className="modal">
            <div className="modal-hd">
              <h2>Create New Alert</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreate} className="modal-body">
              <div className="form-group">
                <label className="form-label">Alert Type</label>
                <div className="sel-wrap">
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="sel"
                    style={{ width: '100%' }}
                  >
                    {TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                  </select>
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Title</label>
                <input 
                  required 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  className="inp"
                />
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Message</label>
                <textarea 
                  required 
                  rows={4}
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})}
                  className="textarea"
                />
              </div>

              <div className="modal-ft" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating...' : 'Send Alert'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Alert"
          msg={`Are you sure you want to delete "${confirmDelete.title}"?`}
          onConfirm={() => { handleDelete(confirmDelete.id, confirmDelete.title); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
