import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit, Bug, Filter, ChevronDown, X, Square } from 'lucide-react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span style={{ color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>—</span>;
  if (sev === 'High' || sev === 'High Risk') return <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>High Risk</span>;
  if (sev === 'Medium' || sev === 'Medium Risk') return <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Medium Risk</span>;
  return <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Low Risk</span>;
};

export default function Diseases() {
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [severity, setSeverity] = useState('');
  
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium'
  });
  
  const { addToast } = useToast();

  const fetchDiseases = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getDiseases({ search, severity });
      if (r.data.success) { setDiseases(r.data.diseases); }
    } catch { addToast('Failed to load diseases', 'err'); }
    finally { setLoading(false); }
  }, [search, severity]);

  useEffect(() => { fetchDiseases(); }, [fetchDiseases]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); };
  const clearAll = () => { setSearch(''); setSearchInput(''); setSeverity(''); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await updateDisease(editing.id, form);
        addToast('Disease updated!', 'ok');
      } else {
        await createDisease(form);
        addToast('Disease added!', 'ok');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' });
      fetchDiseases();
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to save', 'err');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await deleteDisease(id);
      addToast(`Deleted ${name}`, 'ok');
      fetchDiseases();
    } catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      crop_name: d.crop_name || '',
      disease_name: d.disease_name || '',
      symptoms: d.symptoms || '',
      treatment: d.treatment || '',
      prevention: d.prevention || '',
      severity_level: d.severity_level || 'Medium',
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="responsive-page-head">
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Crop Diseases</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Manage the knowledge base of diseases</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setForm({ crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' }); setShowModal(true); }}
          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#059669', border: 'none', color: '#fff', fontWeight: 500, cursor: 'pointer' }}
        >
          <Plus size={18} /> Add Disease
        </button>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="tbl-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#fff' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by crop or disease name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none' }}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={severity}
                onChange={e => { setSeverity(e.target.value); }}
                style={{ appearance: 'none', padding: '10px 36px 10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All Severities</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
              <ChevronDown size={16} color="#9ca3af" style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
            </div>
            <button type="submit" onClick={handleSearch} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <Search size={16} color="#6b7280" /> Search
            </button>
            {(search || severity) && (
              <button type="button" onClick={clearAll} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#ef4444', fontSize: '14px', cursor: 'pointer' }}>
                <X size={16} color="#ef4444" /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : diseases.length === 0 ? (
          <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            <Bug size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Diseases Found</h3>
            <p>{search ? `No results for "${search}"` : 'Database is empty'}</p>
          </div>
        ) : (
          <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '900px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>CROP</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>DISEASE NAME</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>SEVERITY</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>TREATMENT</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((d, i) => (
                  <tr key={d.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                    <td style={{ padding: '16px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                    <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                      <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{d.crop_name}</span>
                    </td>
                    <td style={{ padding: '16px', color: '#111827', fontWeight: 600, fontSize: '14px' }}>{d.disease_name}</td>
                    <td style={{ padding: '16px' }}><SevBadge sev={d.severity_level} /></td>
                    <td style={{ padding: '16px', color: '#6b7280', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.treatment || '—'}</td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                        <button onClick={() => openEdit(d)} style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} title="Edit">
                          <Edit size={16} />
                        </button>
                        <button 
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: deleting === d.id ? 0.5 : 1 }} 
                          onClick={() => setConfirmDelete(d)}
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div className="modal-content" style={{ background: '#fff', borderRadius: '12px', width: '100%', maxWidth: '600px', padding: '24px', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
            <button onClick={() => setShowModal(false)} style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
              <X size={20} />
            </button>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', margin: '0 0 20px' }}>
              {editing ? 'Edit Disease' : 'Add New Disease'}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Crop Name</label>
                  <input required value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Disease Name</label>
                  <input required value={form.disease_name} onChange={e => setForm({...form, disease_name: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
                </div>
              </div>
              
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Severity Level</label>
                <select value={form.severity_level} onChange={e => setForm({...form, severity_level: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none' }}>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Symptoms</label>
                <textarea rows={2} value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Treatment</label>
                <textarea rows={3} value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 500, color: '#374151', marginBottom: '6px' }}>Prevention</label>
                <textarea rows={2} value={form.prevention} onChange={e => setForm({...form, prevention: e.target.value})} style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', outline: 'none', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '8px 16px', border: '1px solid #d1d5db', background: '#fff', borderRadius: '8px', color: '#374151', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                <button type="submit" disabled={saving} style={{ padding: '8px 16px', border: 'none', background: '#059669', borderRadius: '8px', color: '#fff', fontWeight: 500, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                  {saving ? 'Saving...' : 'Save Disease'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Disease"
          msg={`Are you sure you want to delete "${confirmDelete.disease_name}"?`}
          onConfirm={() => { handleDelete(confirmDelete.id, confirmDelete.disease_name); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
