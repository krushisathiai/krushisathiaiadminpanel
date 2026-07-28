import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Leaf, X, ChevronDown } from 'lucide-react';
import { getScans, deleteScan } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  if (sev === 'High Risk') return <span className="badge b-red">High Risk</span>;
  if (sev === 'Medium Risk') return <span className="badge b-amber">Medium Risk</span>;
  return <span className="badge b-green">Low Risk</span>;
};

export default function Scans() {
  const [scans, setScans] = useState([]);
  const [pg, setPg] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [severity, setSeverity] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { addToast } = useToast();
  const API = import.meta.env.VITE_API_URL || 'https://krushisathi-backend.onrender.com';

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getScans({ page, limit: 10, search, severity });
      if (r.data.success) { setScans(r.data.scans); setPg(r.data.pagination); }
    } catch { addToast('Failed to fetch scans', 'err'); }
    finally { setLoading(false); }
  }, [page, search, severity]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };
  const clearAll = () => { setSearch(''); setSearchInput(''); setSeverity(''); setPage(1); };

  const handleDelete = async (id) => {
    setDeleting(id);
    try { await deleteScan(id); addToast('Scan deleted', 'ok'); fetchScans(); }
    catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const timeAgo = (d) => {
    if (!d) return '—';
    const m = Math.floor((Date.now() - new Date(d)) / 60000);
    if (m < 60) return `${m}m ago`;
    if (m < 1440) return `${Math.floor(m / 60)}h ago`;
    return `${Math.floor(m / 1440)}d ago`;
  };

  const avatarColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Plant Diagnostic Scans</h1>
          <p>Monitor crop disease scans, AI confidence scores, and diagnostic reports</p>
        </div>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px' }}>
            <div className="search-wrap">
              <span className="search-ico"><Search size={16} /></span>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search crop, disease name or farmer..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
          </form>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <select
              className="sel"
              value={severity}
              onChange={e => { setSeverity(e.target.value); setPage(1); }}
            >
              <option value="">All Severities</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
            </select>

            {(search || severity) && (
              <button type="button" className="btn btn-ghost" onClick={clearAll}>
                <X size={15} /> Clear
              </button>
            )}
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading diagnostic scans...</span></div>
        ) : scans.length === 0 ? (
          <div className="empty">
            <Leaf size={48} />
            <h3>No Diagnostic Scans Found</h3>
            <p>{search ? `No results for "${search}"` : 'No scans recorded yet'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>IMAGE</th>
                  <th>FARMER</th>
                  <th>CROP</th>
                  <th>DISEASE</th>
                  <th>SEVERITY</th>
                  <th>CONFIDENCE</th>
                  <th>TIME</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((sc, i) => {
                  const num = (page - 1) * 10 + i + 1;
                  const initials = sc.user_name?.substring(0,1).toUpperCase() || 'U';
                  const avatarColor = avatarColors[i % avatarColors.length];
                  
                  return (
                    <tr key={sc.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{num}</td>
                      <td>
                        {sc.image_url ? (
                          <img
                            src={`${API}${sc.image_url}`}
                            alt="crop scan"
                            style={{ width: 42, height: 42, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border-strong)' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 42, height: 42, borderRadius: 8, background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>
                            <Leaf size={20} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div className="avatar" style={{ background: avatarColor }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{sc.user_name || 'Unknown'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{sc.user_mobile || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge b-green">{sc.crop_name || '—'}</span>
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{sc.disease_name}</td>
                      <td><SevBadge sev={sc.severity} /></td>
                      <td>
                        <span style={{ color: 'var(--primary-light)', fontWeight: 700, fontSize: 13 }}>
                          {sc.confidence_score ? `${parseFloat(sc.confidence_score).toFixed(1)}%` : '—'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{timeAgo(sc.scanned_at)}</td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-sm btn-danger btn-icon"
                          onClick={() => setConfirmDelete({ id: sc.id })}
                          title="Delete Scan Record"
                          disabled={deleting === sc.id}
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer / Pagination */}
        {!loading && scans.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_scans || scans.length)} of {pg.total_scans || scans.length} scans
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete Scan Record"
          msg="Are you sure you want to delete this scan record? This action cannot be undone."
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
