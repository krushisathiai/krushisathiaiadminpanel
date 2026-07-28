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
      <div className="page-head" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '28px', color: '#111827', margin: 0 }}>Users</h1>
          <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '4px' }}>Manage all registered farmers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#059669', border: 'none', color: '#fff', fontWeight: 500 }}>
            <Plus size={18} /> Add Farmer
          </button>
          <button className="btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', background: '#fff', border: '1px solid #d1d5db', color: '#374151', fontWeight: 500 }}>
            <Download size={18} /> Export CSV
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stat-cards-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '24px' }}>
        {stats.map((s, i) => (
          <div key={i} className="stat-card-white" style={{ background: '#fff', borderRadius: '12px', padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid #e5e7eb', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
            <div className={`stat-icon-${s.color}`} style={{ width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: s.color === 'green' ? '#ecfdf5' : s.color === 'purple' ? '#f3e8ff' : '#fff7ed', color: s.color === 'green' ? '#059669' : s.color === 'purple' ? '#9333ea' : '#ea580c' }}>
              <s.icon size={24} />
            </div>
            <div>
              <div style={{ color: '#6b7280', fontSize: '13px', fontWeight: 500 }}>{s.label}</div>
              <div style={{ fontSize: '24px', fontWeight: 700, color: '#111827', margin: '2px 0' }}>{s.val}</div>
              <div style={{ fontSize: '12px', fontWeight: 500, color: s.color === 'green' ? '#059669' : '#ea580c' }}>{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card" style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        {/* Toolbar */}
        <div className="tbl-toolbar" style={{ padding: '16px 20px', borderBottom: '1px solid #e5e7eb', display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', background: '#fff' }}>
          <form onSubmit={handleSearch} style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#9ca3af' }} />
            <input
              type="text"
              placeholder="Search by name, mobile, email..."
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              style={{ width: '100%', padding: '10px 12px 10px 36px', border: '1px solid #d1d5db', borderRadius: '8px', fontSize: '14px', color: '#111827', outline: 'none' }}
            />
          </form>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" className="filter-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <MapPin size={16} color="#6b7280" /> All Locations <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" className="filter-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <Leaf size={16} color="#6b7280" /> All Crops <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" className="filter-dropdown" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <CheckSquare size={16} color="#6b7280" /> All Status <ChevronDown size={16} color="#9ca3af" />
            </button>
            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', background: '#fff', border: '1px solid #d1d5db', borderRadius: '8px', color: '#374151', fontSize: '14px', cursor: 'pointer' }}>
              <Filter size={16} color="#6b7280" /> Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="spin-wrap" style={{ padding: '40px', textAlign: 'center' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : users.length === 0 ? (
          <div className="empty" style={{ padding: '60px 20px', textAlign: 'center', color: '#6b7280' }}>
            <UsersIcon size={48} style={{ margin: '0 auto 16px', opacity: 0.5 }} />
            <h3>No Users Found</h3>
            <p>{search ? `No results for "${search}"` : 'No users yet'}</p>
          </div>
        ) : (
          <div className="tbl-wrap" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', minWidth: '1000px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #e5e7eb', background: '#fff' }}>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, width: '40px' }}>#</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>USER</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>ROLE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>MOBILE</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>LOCATION</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>MAIN CROP</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>SCANS</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>STATUS</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'left' }}>JOINED</th>
                  <th style={{ padding: '16px', color: '#6b7280', fontSize: '12px', fontWeight: 600, textAlign: 'center' }}>ACTIONS</th>
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
                    <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6', background: '#fff', transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = '#f9fafb'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>
                      <td style={{ padding: '16px', textAlign: 'center' }}><Square size={16} color="#d1d5db" /></td>
                      <td style={{ padding: '16px', color: '#6b7280', fontSize: '14px', fontWeight: 500 }}>{num}</td>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: avatarColor, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: '14px' }}>
                            {initials}
                          </div>
                          <div>
                            <div style={{ color: '#111827', fontWeight: 500, fontSize: '14px' }}>{u.full_name || 'Unknown'}</div>
                            <div style={{ color: '#9ca3af', fontSize: '12px' }}>{u.email || `ID #${u.id}`}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <select
                          value={u.role || 'user'}
                          onChange={e => handleRoleChange(u.id, e.target.value)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 600,
                            border: '1px solid #d1d5db',
                            background: u.role === 'admin' ? '#fef2f2' : u.role === 'shop_owner' ? '#eff6ff' : '#f0fdf4',
                            color: u.role === 'admin' ? '#ef4444' : u.role === 'shop_owner' ? '#3b82f6' : '#16a34a',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="user">🌾 Farmer</option>
                          <option value="shop_owner">🛍️ Shop Owner</option>
                          <option value="admin">👑 Admin</option>
                        </select>
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Phone size={14} color="#9ca3af" />
                          {u.mobile_number || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={14} color="#9ca3af" />
                          {u.location || 'Unknown'}
                        </div>
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Leaf size={14} color="#10b981" />
                          {u.main_crop || '—'}
                        </div>
                      </td>
                      <td style={{ padding: '16px' }}>
                        <span style={{ background: '#ecfdf5', color: '#059669', padding: '4px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          {String(scansCount).padStart(2, '0')}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>
                        {status === 'Active' && <span style={{ color: '#059669', background: '#ecfdf5', border: '1px solid #a7f3d0', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Active</span>}
                        {status === 'Pending' && <span style={{ color: '#d97706', background: '#fffbeb', border: '1px solid #fde68a', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Pending</span>}
                        {status === 'Blocked' && <span style={{ color: '#dc2626', background: '#fef2f2', border: '1px solid #fecaca', padding: '4px 12px', borderRadius: '16px', fontSize: '12px', fontWeight: 500 }}>Blocked</span>}
                      </td>
                      <td style={{ padding: '16px', color: '#4b5563', fontSize: '14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Calendar size={14} color="#9ca3af" />
                          {fmtDate(u.created_at)}
                        </div>
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderTop: '1px solid #e5e7eb', background: '#fff', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ color: '#6b7280', fontSize: '14px' }}>
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, pg.total_users || users.length)} of {pg.total_users || users.length} farmers
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
          title="Delete Farmer"
          msg={`Are you sure you want to delete ${confirmDelete.name}? This action cannot be undone.`}
          onConfirm={() => { handleDelete(confirmDelete.id, confirmDelete.name); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
