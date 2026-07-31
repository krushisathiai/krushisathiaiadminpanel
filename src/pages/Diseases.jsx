import { useState, useEffect, useCallback } from 'react';
import { Search, Plus, Trash2, Edit, Bug, Filter, ChevronDown, X, Square } from 'lucide-react';
import { getDiseases, createDisease, updateDisease, deleteDisease } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge">—</span>;
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
      <div className="page-head">
        <div>
          <h1>Crop Diseases</h1>
          <p>Manage the knowledge base of diseases</p>
        </div>
        <button 
          onClick={() => { setEditing(null); setForm({ crop_name: '', disease_name: '', symptoms: '', treatment: '', prevention: '', severity_level: 'Medium' }); setShowModal(true); }}
          className="btn btn-primary"
        >
          <Plus size={18} /> Add Disease
        </button>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} className="search-wrap" style={{ flex: 1, minWidth: '250px' }}>
            <span className="search-ico"><Search /></span>
            <input
              type="text"
              className="inp with-icon"
              placeholder="Search by crop or disease name..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="sel-wrap">
              <select
                value={severity}
                onChange={e => { setSeverity(e.target.value); }}
                className="sel"
              >
                <option value="">All Severities</option>
                <option value="High">High Risk</option>
                <option value="Medium">Medium Risk</option>
                <option value="Low">Low Risk</option>
              </select>
            </div>
            
            <button type="submit" onClick={handleSearch} className="btn btn-secondary btn-sm">
              <Search size={16} /> Search
            </button>
            {(search || severity) && (
              <button type="button" onClick={clearAll} className="btn btn-danger btn-sm" style={{ background: 'var(--red)', borderColor: 'var(--red)', color: '#fff' }}>
                <X size={16} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
          </div>
        ) : diseases.length === 0 ? (
          <div className="empty">
            <Bug size={48} />
            <h3>No Diseases Found</h3>
            <p>{search ? `No results for "${search}"` : 'Database is empty'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th>CROP</th>
                  <th>DISEASE NAME</th>
                  <th>SEVERITY</th>
                  <th>TREATMENT</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {diseases.map((d, i) => (
                  <tr key={d.id}>
                    <td style={{ textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                    <td>
                      <span className="badge b-green">{d.crop_name}</span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{d.disease_name}</td>
                    <td><SevBadge sev={d.severity_level} /></td>
                    <td style={{ color: 'var(--text-muted)', fontSize: '13px', maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.treatment || '—'}</td>
                    <td>
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
        <div className="overlay">
          <div className="modal">
            <div className="modal-hd">
              <h2>{editing ? 'Edit Disease' : 'Add New Disease'}</h2>
              <button className="close-btn" onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSave} className="modal-body">
              <div style={{ display: 'flex', gap: '16px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Crop Name</label>
                  <input required className="inp" value={form.crop_name} onChange={e => setForm({...form, crop_name: e.target.value})} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Disease Name</label>
                  <input required className="inp" value={form.disease_name} onChange={e => setForm({...form, disease_name: e.target.value})} />
                </div>
              </div>
              
              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Severity Level</label>
                <div className="sel-wrap">
                  <select className="sel" value={form.severity_level} onChange={e => setForm({...form, severity_level: e.target.value})} style={{ width: '100%' }}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Symptoms</label>
                <textarea className="textarea" rows={2} value={form.symptoms} onChange={e => setForm({...form, symptoms: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Treatment</label>
                <textarea className="textarea" rows={3} value={form.treatment} onChange={e => setForm({...form, treatment: e.target.value})} />
              </div>

              <div className="form-group" style={{ marginTop: '12px' }}>
                <label className="form-label">Prevention</label>
                <textarea className="textarea" rows={2} value={form.prevention} onChange={e => setForm({...form, prevention: e.target.value})} />
              </div>

              <div className="modal-ft" style={{ marginTop: '20px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
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
