import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Leaf, X, Download, Filter, ChevronDown, Square, CheckSquare, Eye, Edit } from 'lucide-react';
import { getScans, deleteScan } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const SevBadge = ({ sev }) => {
  if (!sev) return <span style={{ color: '#6b7280', background: '#f3f4f6', border: '1px solid #e5e7eb', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>—</span>;
  if (sev === 'High Risk') return <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>High Risk</span>;
  if (sev === 'Medium Risk') return <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Medium Risk</span>;
  return <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Low Risk</span>;
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
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Plant Scans</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>{pg.total_scans || 0} total scans recorded</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#fff', border: '1px solid #d1d5db', color: '#374151', fontWeight: 500 }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <div className="tbl-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#fff' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search crop, disease, farmer..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none' }}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <div style={{ position: 'relative' }}>
              <select
                value={severity}
                onChange={e => { setSeverity(e.target.value); setPage(1); }}
                style={{ appearance: 'none', padding: '10px 36px 10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer', outline: 'none' }}
              >
                <option value="">All Severities</option>
                <option value="High Risk">High Risk</option>
                <option value="Medium Risk">Medium Risk</option>
                <option value="Low Risk">Low Risk</option>
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
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <Filter size={16} color="#6b7280" /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : scans.length === 0 ? (
          <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            <Leaf size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Scans Found</h3>
            <p>{search ? `No results for "${search}"` : 'No scans recorded'}</p>
          </div>
        ) : (
          <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px' }}>#</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left', width: '60px' }}>IMAGE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>FARMER</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>CROP</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>DISEASE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>SEVERITY</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>CONFIDENCE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>WHEN</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((sc, i) => {
                  const num = (page - 1) * 10 + i + 1;
                  const initials = sc.user_name?.substring(0,1).toUpperCase() || 'U';
                  const avatarColor = avatarColors[i % avatarColors.length];
                  
                  return (
                    <tr key={sc.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={{ padding: '16px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{num}</td>
                      <td style={{ padding: '16px' }}>
                        {sc.image_url ? (
                          <img
                            src={`${API}${sc.image_url}`}
                            alt="crop"
                            style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover', border: '1px solid #e5e7eb' }}
                            onError={e => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div style={{ width: 44, height: 44, borderRadius: 8, background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af', border: '1px solid #e5e7eb' }}>
                            <Leaf size={20} />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{sc.user_name || 'Unknown'}</div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>{sc.user_mobile || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>{sc.crop_name || '—'}</span>
                      </td>
                      <td style={{ padding: '16px', color: '#111827', fontWeight: 500, fontSize: '14px' }}>{sc.disease_name}</td>
                      <td style={{ padding: '16px' }}><SevBadge sev={sc.severity} /></td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ color: '#059669', fontWeight: 700, fontSize: 13 }}>
                          {sc.confidence_score ? `${parseFloat(sc.confidence_score).toFixed(1)}%` : '—'}
                        </span>
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px' }}>{timeAgo(sc.scanned_at)}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_scans || scans.length)} of {pg.total_scans || scans.length} scans
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button 
                onClick={() => setPage(p => Math.max(1, p - 1))} 
                disabled={page === 1}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '6px', color: page === 1 ? '#d1d5db' : '#374151', cursor: page === 1 ? 'not-allowed' : 'pointer' }}
              >
                {'<'}
              </button>
              
              <button style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', background: '#059669', color: '#fff', borderRadius: '6px', fontWeight: 500, cursor: 'pointer' }}>
                {page}
              </button>
              
              {pg.total_pages > page && (
                <button 
                  onClick={() => setPage(p => p + 1)}
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: '6px', cursor: 'pointer' }}
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
                  style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', color: '#374151', borderRadius: '6px', cursor: 'pointer' }}
                >
                  {pg.total_pages}
                </button>
              )}

              <button 
                onClick={() => setPage(p => Math.min(pg.total_pages || 1, p + 1))}
                disabled={!pg.total_pages || page === pg.total_pages}
                style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e5e7eb', background: '#fff', borderRadius: '6px', color: (!pg.total_pages || page === pg.total_pages) ? '#d1d5db' : '#374151', cursor: (!pg.total_pages || page === pg.total_pages) ? 'not-allowed' : 'pointer' }}
              >
                {'>'}
              </button>
              
              <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid #e5e7eb', borderRadius: '6px', padding: '4px 12px', background: '#fff', cursor: 'pointer' }}>
                <span style={{ fontSize: '14px', color: '#374151' }}>10 / page</span>
                <ChevronDown size={14} color="#9ca3af" />
              </div>
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
