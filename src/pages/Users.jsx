import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Trash2, Users as UsersIcon, Phone, MapPin, Leaf, Calendar, CheckSquare, Shield
} from 'lucide-react';
import { getUsers, deleteUser, updateUserRole } from '../api/adminApi';
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
      if (r.data.success) { 
        setUsers(r.data.users); 
        setPg(r.data.pagination); 
      }
    } catch { 
      addToast('Failed to fetch users', 'err'); 
    }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = (e) => { e.preventDefault(); setPage(1); setSearch(searchInput); };

  const handleDelete = async (id, name) => {
    setDeleting(id);
    try {
      await deleteUser(id);
      addToast(`User "${name}" deleted`, 'ok');
      fetchUsers();
    } catch (e) { addToast(e.response?.data?.message || 'Delete failed', 'err'); }
    finally { setDeleting(null); }
  };

  const handleRoleChange = async (id, newRole) => {
    try {
      const res = await updateUserRole(id, newRole);
      if (res.data.success) {
        addToast(`User role updated to ${newRole}`, 'ok');
        fetchUsers();
      }
    } catch (e) {
      addToast(e.response?.data?.message || 'Failed to update user role', 'err');
    }
  };

  const fmtDate = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const avatarColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>User & Role Management</h1>
          <p>Manage registered farmers, shop owners, and system administrators</p>
        </div>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '240px' }}>
            <div className="search-wrap">
              <span className="search-ico"><Search size={16} /></span>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search by farmer name, mobile number or location..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading users...</span></div>
        ) : users.length === 0 ? (
          <div className="empty">
            <UsersIcon size={48} />
            <h3>No Users Found</h3>
            <p>{search ? `No results found for "${search}"` : 'No users registered yet'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>USER</th>
                  <th>ROLE</th>
                  <th>MOBILE</th>
                  <th>LOCATION</th>
                  <th>MAIN CROP</th>
                  <th>SCANS</th>
                  <th>STATUS</th>
                  <th>JOINED</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const num = (page - 1) * 10 + i + 1;
                  const status = u.is_verified ? 'Active' : 'Pending';
                  const scansCount = u.scan_count || 0;
                  const initials = u.full_name?.substring(0,1).toUpperCase() || 'U';
                  const avatarColor = avatarColors[i % avatarColors.length];
                  
                  return (
                    <tr key={u.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{num}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div className="avatar" style={{ background: avatarColor }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{u.full_name || 'Unknown User'}</div>
                            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{u.email || `ID #${u.id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          className="sel"
                          value={u.role || 'user'}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '20px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: '1px solid var(--border-strong)',
                            background: u.role === 'admin' ? 'rgba(239, 68, 68, 0.15)' : u.role === 'shop_owner' ? 'rgba(59, 130, 246, 0.15)' : 'rgba(34, 197, 94, 0.15)',
                            color: u.role === 'admin' ? 'var(--red)' : u.role === 'shop_owner' ? 'var(--blue)' : 'var(--primary-light)',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="user" style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}>🌾 Farmer</option>
                          <option value="shop_owner" style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}>🛍️ Shop Owner</option>
                          <option value="admin" style={{ background: 'var(--bg-1)', color: 'var(--text-1)' }}>👑 Admin</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                          <Phone size={14} color="var(--text-muted)" />
                          {u.mobile_number || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                          <MapPin size={14} color="var(--text-muted)" />
                          {u.location || 'Maharashtra'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-2)' }}>
                          <Leaf size={14} color="var(--primary)" />
                          {u.main_crop || '—'}
                        </div>
                      </td>
                      <td>
                        <span className="badge b-green">
                          {String(scansCount).padStart(2, '0')}
                        </span>
                      </td>
                      <td>
                        {status === 'Active' ? (
                          <span className="badge b-green">Active</span>
                        ) : (
                          <span className="badge b-amber">Pending</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="var(--text-muted)" />
                          {fmtDate(u.created_at)}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button 
                          className="btn btn-sm btn-danger btn-icon"
                          onClick={() => setConfirmDelete({ id: u.id, name: u.full_name })}
                          title="Delete User"
                          disabled={deleting === u.id}
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
        {!loading && users.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_users || users.length)} of {pg.total_users || users.length} users
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
          title="Delete User"
          msg={`Are you sure you want to delete ${confirmDelete.name}? This action cannot be undone.`}
          onConfirm={() => { handleDelete(confirmDelete.id, confirmDelete.name); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
