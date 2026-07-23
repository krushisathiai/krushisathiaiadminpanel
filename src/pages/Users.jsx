import { useState, useEffect, useCallback } from 'react';
import { Search, Trash2, Users as UsersIcon, X } from 'lucide-react';
import { getUsers, deleteUser } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function Users() {
  const [users, setUsers] = useState([]);
  const [pg, setPg] = useState({});
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [deleting, setDeleting] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const { addToast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const r = await getUsers({ page, limit: 10, search });
      if (r.data.success) { setUsers(r.data.users); setPg(r.data.pagination); }
    } catch { addToast('Failed to fetch users', 'err'); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };
  const clearSearch = () => { setSearch(''); setSearchInput(''); setPage(1); };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await deleteUser(id);
      addToast(`User "${name}" deleted`, 'ok');
      fetchUsers();
    } catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>{pg.total_users || 0} registered farmers</p>
        </div>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8, flex: 1, flexWrap: 'wrap' }}>
            <div className="search-wrap" style={{ flex: 1, maxWidth: 320 }}>
              <div className="search-ico"><Search /></div>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search name, mobile, email..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">Search</button>
            {search && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={clearSearch}>
                <X size={13} /> Clear
              </button>
            )}
          </form>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading...</span></div>
        ) : users.length === 0 ? (
          <div className="empty"><UsersIcon /><h3>No Users Found</h3><p>{search ? `No results for "${search}"` : 'No users yet'}</p></div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Farmer</th>
                  <th>Mobile</th>
                  <th>Email</th>
                  <th>Location</th>
                  <th>Crop</th>
                  <th>Scans</th>
                  <th>Joined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => (
                  <tr key={u.id}>
                    <td className="tc-5 fs-12">{(page - 1) * 10 + i + 1}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="avatar">{u.full_name?.[0]?.toUpperCase()}</div>
                        <div>
                          <div className="fw-600 tc-1 fs-13">{u.full_name}</div>
                          <div className="tc-5 fs-12">ID #{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td>{u.mobile_number}</td>
                    <td className="tc-5">{u.email || '—'}</td>
                    <td className="tc-5">{u.location || '—'}</td>
                    <td>{u.main_crop ? <span className="badge b-green">{u.main_crop}</span> : <span className="tc-5">—</span>}</td>
                    <td><span className="badge b-blue">{u.scan_count}</span></td>
                    <td className="tc-5 fs-12">{fmtDate(u.created_at)}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-icon btn-sm"
                        onClick={() => setConfirmDelete({ id: u.id, name: u.full_name })}
                        disabled={deleting === u.id}
                        title="Delete user"
                      >
                        {deleting === u.id ? <div className="spinner" style={{ width: 12, height: 12 }} /> : <Trash2 size={13} />}
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
            <span className="pg-info">Page {pg.current_page} of {pg.total_pages} · {pg.total_users} users</span>
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
        onConfirm={() => handleDelete(confirmDelete.id, confirmDelete.name)}
        title="Confirm Delete"
        message={`Are you sure you want to delete user "${confirmDelete?.name}"? This will delete all of their data permanently.`}
      />
    </>
  );
}
