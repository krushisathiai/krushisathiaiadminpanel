import { useState, useEffect, useCallback } from 'react';
import { Bell, Plus, Trash2, X, Megaphone, CloudRain, Sprout, Droplets, Clock, Info, Bug, Square, Eye, Edit } from 'lucide-react';
import { getAlerts, createAlert, deleteAlert } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const TYPE_CFG = {
  general:    { icon: Megaphone,  bg: '#f3f4f6', color: '#4b5563', label: 'General' },
  disease:    { icon: Bug,        bg: '#fef2f2', color: '#dc2626', label: 'Disease' },
  weather:    { icon: CloudRain,  bg: '#eff6ff', color: '#3b82f6', label: 'Weather' },
  fertilizer: { icon: Sprout,     bg: '#ecfdf5', color: '#059669', label: 'Fertilizer' },
  spray:      { icon: Droplets,   bg: '#eff6ff', color: '#3b82f6', label: 'Spray' },
  reminder:   { icon: Clock,      bg: '#fffbeb', color: '#d97706', label: 'Reminder' },
};

const TypeBadge = ({ type }) => {
  const cfg = TYPE_CFG[type] || { icon: Info, bg: '#f3f4f6', color: '#6b7280', label: type };
  const Icon = cfg.icon;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: cfg.bg, color: cfg.color, padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
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
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Alerts</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{pg.total_alerts || 0} alerts total</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#059669', border: 'none', color: '#fff', fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={18} /> New Alert
        </button>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {loading ? (
          <div className="spin-wrap" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : alerts.length === 0 ? (
          <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            <Bell size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Alerts Found</h3>
            <p>Create your first alert for farmers</p>
          </div>
        ) : (
          <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px' }}>#</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>TYPE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>TITLE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>MESSAGE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>CREATED</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {alerts.map((al, i) => {
                  const num = (page - 1) * 10 + i + 1;
                  const isScheduled = al.scheduled_at && new Date(al.scheduled_at) > new Date();
                  return (
                    <tr key={al.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={{ padding: '16px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{num}</td>
                      <td style={{ padding: '16px' }}><TypeBadge type={al.type} /></td>
                      <td style={{ padding: '16px', color: '#111827', fontWeight: 600, fontSize: '14px' }}>{al.title}</td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{al.message}</td>
                      <td style={{ padding: '16px' }}>
                        {isScheduled ? (
                          <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Scheduled</span>
                        ) : (
                          <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Sent</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px' }}>{fmtDate(al.created_at)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
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
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '24px', position: 'relative' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>Create New Alert</h2>
            
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Alert Type</label>
                <select 
                  value={form.type} 
                  onChange={e => setForm({...form, type: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                >
                  {TYPES.map(t => <option key={t.val} value={t.val}>{t.label}</option>)}
                </select>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Title</label>
                <input 
                  required 
                  value={form.title} 
                  onChange={e => setForm({...form, title: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Message</label>
                <textarea 
                  required 
                  rows={4}
                  value={form.message} 
                  onChange={e => setForm({...form, message: e.target.value})}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '8px', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', border: 'none', background: '#059669', borderRadius: '8px', color: '#fff', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
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
