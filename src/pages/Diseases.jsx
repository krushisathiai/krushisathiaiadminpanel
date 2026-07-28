import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit, Bug, X } from 'lucide-react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  if (sev === 'High' || sev === 'High Risk') return <span className="badge b-red">High Risk</span>;
  if (sev === 'Medium' || sev === 'Medium Risk') return <span className="badge b-amber">Medium Risk</span>;
  return <span className="badge b-green">Low Risk</span>;
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
        addToast('Disease record updated!', 'ok');
      } else {
        await createDisease(form);
        addToast('New disease added!', 'ok');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' });
      fetchDiseases();
    } catch (e) { addToast(e.response?.data?.message || 'Save failed', 'err'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    setDeleting(id);
    try { await deleteDisease(id); addToast('Disease deleted', 'ok'); fetchDiseases(); }
    catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const openAdd = () => {
    setEditing(null);
    setForm({ crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' });
    setShowModal(true);
  };

  const openEdit = (d) => {
    setEditing(d);
    setForm({
      crop_name: d.crop_name,
      disease_name: d.disease_name,
      symptoms: d.symptoms || '',
      treatment: d.treatment || '',
      prevention: d.prevention || '',
      severity_level: d.severity_level || 'Medium'
    });
    setShowModal(true);
  };

  return (
    <>
      <div className="responsive-page-head">
        <div>
          <h1>Crop Disease Knowledge Base</h1>
          <p>Manage plant diseases, symptoms, treatment guidelines, and prevention methods</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} /> Add Disease Record
        </button>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px' }}>
            <div className="search-wrap">
              <span className="search-ico"><Search size={16} /></span>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search crop or disease name..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
          </form>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="sel"
              value={severity}
              onChange={e => setSeverity(e.target.value)}
            >
              <option value="">All Severity Levels</option>
              <option value="High">High Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="Low">Low Risk</option>
            </select>

            {(search || severity) && (
              <button type="button" className="btn btn-ghost" onClick={clearAll}>
                <X size={15} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading disease records...</span></div>
        ) : diseases.length === 0 ? (
          <div className="empty">
            <Bug size={48} />
            <h3>No Disease Records Found</h3>
            <p>{search ? `No results for "${search}"` : 'No diseases in database yet'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>CROP</th>
                  <th>DISEASE NAME</th>
                  <th>SYMPTOMS</th>
                  <th>TREATMENT</th>
                  <th>SEVERITY</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((d) => (
                  <tr key={d.id}>
                    <td>
                      <span className="badge b-green">{d.crop_name}</span>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{d.disease_name}</td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '250px' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {d.symptoms || '—'}
                      </div>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '250px' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {d.treatment || '—'}
                      </div>
                    </td>
                    <td><SevBadge sev={d.severity_level} /></td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={() => openEdit(d)} title="Edit Record">
                          <Edit size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete({ id: d.id, name: d.disease_name })} title="Delete Record">
                          <Trash2 size={14} />
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="overlay">
          <div className="modal" style={{ maxWidth: '580px' }}>
            <div className="modal-hd">
              <h3><Bug /> {editing ? 'Edit Disease Record' : 'Add New Disease'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Crop Name</label>
                  <input type="text" className="inp" placeholder="e.g. Tomato" value={form.crop_name} onChange={e => setForm({ ...form, crop_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Disease Name</label>
                  <input type="text" className="inp" placeholder="e.g. Early Blight" value={form.disease_name} onChange={e => setForm({ ...form, disease_name: e.target.value })} required />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Severity Level</label>
                <select className="sel" value={form.severity_level} onChange={e => setForm({ ...form, severity_level: e.target.value })}>
                  <option value="Low">Low Risk</option>
                  <option value="Medium">Medium Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Symptoms</label>
                <textarea className="textarea" rows="3" placeholder="Describe symptoms..." value={form.symptoms} onChange={e => setForm({ ...form, symptoms: e.target.value })} />
              </div>

              <div className="form-group">
                <label className="form-label">Treatment Advice</label>
                <textarea className="textarea" rows="3" placeholder="Fungicide / Spray recommendations..." value={form.treatment} onChange={e => setForm({ ...form, treatment: e.target.value })} />
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : 'Save Record'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Disease Record"
          msg={`Are you sure you want to delete "${confirmDelete.name}"?`}
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
