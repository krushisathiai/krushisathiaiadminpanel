import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Leaf, X, Download, Filter, ChevronDown, Square, CheckSquare, Eye, Edit } from 'lucide-react';
import { getScans, deleteScan } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge">—</span>;
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
          <h1>Plant Scans</h1>
          <p>{pg.total_scans || 0} total scans recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-secondary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} className="search-wrap" style={{ flex: 1, minWidth: '250px' }}>
            <span className="search-ico"><Search /></span>
            <input
              type="text"
              className="inp with-icon"
              placeholder="Search crop, disease, farmer..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div className="sel-wrap">
              <select
                value={severity}
                onChange={e => { setSeverity(e.target.value); setPage(1); }}
                className="sel"
              >
                <option value="">All Severities</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
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
            <button type="button" className="btn btn-secondary btn-sm">
              <Filter size={16} /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
          </div>
        ) : scans.length === 0 ? (
          <div className="empty">
            <Leaf size={48} />
            <h3>No Scans Found</h3>
            <p>{search ? `No results for "${search}"` : 'No scans recorded'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ width: '40px' }}>#</th>
                  <th style={{ width: '60px' }}>IMAGE</th>
                  <th>FARMER</th>
                  <th>CROP</th>
                  <th>DISEASE</th>
                  <th>SEVERITY</th>
                  <th>CONFIDENCE</th>
                  <th>WHEN</th>
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
                      <td style={{ textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td>{num}</td>
                      <td>
                        {sc.image_url ? (
                          <img
                            src={`${API}${sc.image_url}`}
                            alt="crop"
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                            <img alt="" src="" style={{ display: 'none' }} onError={e => {}} />
                            <Leaf size={20} />
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{sc.user_name || 'Unknown'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{sc.user_mobile || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge b-green">{sc.crop_name || '—'}</span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{sc.disease_name}</td>
                      <td><SevBadge sev={sc.severity} /></td>
                      <td>
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>
                          {sc.confidence_score ? `${parseFloat(sc.confidence_score).toFixed(1)}%` : '—'}
                        </span>
                      </td>
                      <td>{timeAgo(sc.scanned_at)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} title="View">
                            <Eye size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: deleting === sc.id ? 0.5 : 1 }} 
                            onClick={() => setConfirmDelete({ id: sc.id })}
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
        {!loading && scans.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_scans || scans.length)} of {pg.total_scans || scans.length} scans
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete Scan"
          msg={`Are you sure you want to delete this scan record? This action cannot be undone.`}
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
