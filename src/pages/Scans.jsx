import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Leaf, X } from 'lucide-react';
import { getScans, deleteScan } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span className="badge b-gray">—</span>;
  const m = { 'High Risk': 'b-red', 'Medium Risk': 'b-amber', 'Low Risk': 'b-green' };
  return <span className={`badge ${m[sev] || 'b-gray'}`}>{sev}</span>;
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
  const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Plant Scans</h1>
          <p>{pg.total_scans || 0} total scans recorded</p>
        </div>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, maxWidth: 280 }}>
              <div className="search-ico"><Search /></div>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Crop, disease, farmer..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
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
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
            {(search || severity) && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearAll}>
                <X size={13} /> Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading...</span></div>
        ) : scans.length === 0 ? (
          <div className="empty"><Leaf /><h3>No Scans Found</h3><p>{search ? `No results for "${search}"` : 'No scans recorded'}</p></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Image</th>
                  <th>Farmer</th>
                  <th>Crop</th>
                  <th>Disease</th>
                  <th>Severity</th>
                  <th>Confidence</th>
                  <th>When</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((sc, i) => (
                  <tr key={sc.id}>
                    <td className="tc-5 fs-12">{(page - 1) * 10 + i + 1}</td>
                    <td>
                      {sc.image_url ? (
                        <img
                          src={`${API}${sc.image_url}`}
                          alt="crop"
                          style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border)' }}
                          onError={e => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div style={{ width: 40, height: 40, borderRadius: 8, background: 'var(--bg-4)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--t5)' }}>
                          <Leaf size={18} />
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar">{sc.user_name?.[0]}</div>
                        <div>
                          <div className="fw-600 tc-1 fs-13">{sc.user_name}</div>
                          <div className="tc-5 fs-12">{sc.user_mobile}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="badge b-green">{sc.crop_name || '—'}</span></td>
                    <td className="fw-600 tc-1 fs-13">{sc.disease_name}</td>
                    <td><SevBadge sev={sc.severity} /></td>
                    <td>
                      <span style={{ color: 'var(--green-400)', fontWeight: 700, fontSize: 13 }}>
                        {sc.confidence_score ? `${parseFloat(sc.confidence_score).toFixed(1)}%` : '—'}
                      </span>
                    </td>
                    <td className="tc-5 fs-12">{timeAgo(sc.scanned_at)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => setConfirmDelete({ id: sc.id })}
                        disabled={deleting === sc.id}
                        title="Delete scan"
                      >
                        {deleting === sc.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
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
            <span className="pg-info">Page {pg.current_page} of {pg.total_pages} · {pg.total_scans} scans</span>
            <div className="pagination">
              <button className="pg-btn" onClick={() => setPage(p => p - 1)} disabled={page === 1}>‹</button>
              {Array.from({ length: Math.min(5, pg.total_pages) }, (_, i) => i + 1).map(p => (
                <button key={p} className={`pg-btn ${p === page ? 'active' : ''}`} onClick={() => setPage(p)}>{p}</button>
              ))}
              <button className="pg-btn" onClick={() => setPage(p => p + 1)} disabled={page === pg.total_pages}>›</button>
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={() => handleDelete(confirmDelete.id)}
        title="Confirm Delete"
        message="Are you sure you want to delete this plant scan history record permanently?"
      />
    </>
  );
}
