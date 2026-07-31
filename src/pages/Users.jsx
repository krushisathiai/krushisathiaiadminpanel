import { useState, useEffect, useCallback } from 'react';
import { 
  Search, Trash2, Users as UsersIcon, X, Plus, Download, 
  MapPin, Phone, Leaf, Calendar, Eye, Edit, Filter, ChevronDown, CheckSquare, Square
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

  // Stats using real data where available, otherwise placeholders
  const stats = [
    { label: 'Total Users', val: pg.total_users || 0, sub: 'Registered farmers', icon: UsersIcon, color: 'green' },
    { label: 'Active Today', val: '—', sub: 'Active sessions', icon: CheckSquare, color: 'green' },
    { label: 'Total Scans', val: '—', sub: 'Across all users', icon: Leaf, color: 'purple' },
    { label: 'Pending Requests', val: '—', sub: 'Awaiting review', icon: Calendar, color: 'orange' },
  ];

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Users</h1>
          <p>Manage all registered farmers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary">
            <Plus size={18} /> Add Farmer
          </button>
          <button className="btn btn-secondary">
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-grid">
        {stats.map((s, i) => (
          <div key={i} className="stat-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div className={`stat-icon-wrap ${s.color === 'green' ? 'si-green' : s.color === 'purple' ? 'si-blue' : 'si-amber'}`}>
                <s.icon size={22} />
              </div>
              <div>
                <div className="stat-label">{s.label}</div>
                <div className="stat-val">{s.val}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>{s.sub}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="tbl-toolbar">
          <form onSubmit={handleSearch} className="search-wrap" style={{ flex: 1, minWidth: '250px' }}>
            <span className="search-ico"><Search /></span>
            <input
              type="text"
              className="inp with-icon"
              placeholder="Search by name, mobile, email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-secondary btn-sm">
              <MapPin size={16} color="#6b7280" /> All Locations <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" className="btn btn-secondary btn-sm">
              <Leaf size={16} color="#6b7280" /> All Crops <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" className="btn btn-secondary btn-sm">
              <CheckSquare size={16} color="#6b7280" /> All Status <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" className="btn btn-secondary btn-sm">
              <Filter size={16} color="#6b7280" /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
          </div>
        ) : users.length === 0 ? (
          <div className="empty">
            <UsersIcon size={48} />
            <h3>No Users Found</h3>
            <p>{search ? `No results for "${search}"` : 'No users yet'}</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ width: '40px' }}>#</th>
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
                  const avatarColors = ['#10b981', '#f59e0b', '#8b5cf6', '#3b82f6', '#14b8a6'];
                  const avatarColor = avatarColors[i % avatarColors.length];
                  
                  return (
                    <tr key={u.id}>
                      <td style={{ textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td>{num}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500 }}>{u.full_name || 'Unknown'}</div>
                            <div style={{ color: 'var(--text-muted)', fontSize: '12px' }}>{u.email || `ID #${u.id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <select
                          value={u.role || 'user'}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          className="sel"
                          style={{
                            padding: '4px 8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            background: u.role === 'admin' ? '#fef2f2' : u.role === 'shop_owner' ? '#eff6ff' : '#f0fdf4',
                            color: u.role === 'admin' ? '#ef4444' : u.role === 'shop_owner' ? '#3b82f6' : '#16a34a',
                          }}
                        >
                          <option value="user">🌾 Farmer</option>
                          <option value="shop_owner">🛍️ Shop Owner</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#9ca3af" />
                          {u.mobile_number || '—'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#9ca3af" />
                          {u.location || 'Unknown'}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Leaf size={14} color="#10b981" />
                          {u.main_crop || '—'}
                        </div>
                      </td>
                      <td>
                        <span className="badge b-green">
                          {String(scansCount).padStart(2, '0')}
                        </span>
                      </td>
                      <td>
                        {status === 'Active' && <span className="badge b-green">Active</span>}
                        {status === 'Pending' && <span className="badge b-amber">Pending</span>}
                        {status === 'Blocked' && <span className="badge b-red">Blocked</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#9ca3af" />
                          {fmtDate(u.created_at)}
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                          <button style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer', padding: 0 }} title="View">
                            <Eye size={16} />
                          </button>
                          <button style={{ background: 'none', border: 'none', color: '#10b981', cursor: 'pointer', padding: 0 }} title="Edit">
                            <Edit size={16} />
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: 0, opacity: deleting === u.id ? 0.5 : 1 }} 
                            onClick={() => setConfirmDelete({ id: u.id, name: u.full_name })}
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

        {/* Footer / Pagination */}
        {!loading && users.length > 0 && (
          <div className="tbl-footer">
            <div className="pg-info">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_users || users.length)} of {pg.total_users || users.length} farmers
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
          title="Delete Farmer"
          msg={`Are you sure you want to delete ${confirmDelete.name}? This action cannot be undone.`}
          onConfirm={() => { handleDelete(confirmDelete.id, confirmDelete.name); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
