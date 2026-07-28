import { useState, useEffect } from 'react';
import {
  Package, Search, Filter, Trash2, CheckCircle, Clock, XCircle,
  RefreshCw, AlertCircle
} from 'lucide-react';
import { getUreaRequests, updateUreaStatus, deleteUreaRequest } from '../api/adminApi';
import { useToast } from '../context/ToastContext';

export default function UreaRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total_pages: 1, total_requests: 0 });
  const { addToast } = useToast();

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await getUreaRequests({ page, limit: 10, status: statusFilter });
      if (res.data.success) {
        setRequests(res.data.requests);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      addToast('Failed to load Urea requests', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [page, statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await updateUreaStatus(id, newStatus);
      if (res.data.success) {
        addToast(`Request marked as ${newStatus}`, 'ok');
        fetchRequests();
      }
    } catch (err) {
      addToast('Failed to update status', 'err');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this urea request?')) return;
    try {
      const res = await deleteUreaRequest(id);
      if (res.data.success) {
        addToast('Urea request deleted', 'ok');
        fetchRequests();
      }
    } catch (err) {
      addToast('Failed to delete request', 'err');
    }
  };

  const filteredRequests = requests.filter(r =>
    r.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.mobile_number?.includes(search) ||
    r.location?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span className="badge badge-success"><CheckCircle size={12} /> Approved</span>;
      case 'Rejected':
        return <span className="badge badge-danger"><XCircle size={12} /> Rejected</span>;
      default:
        return <span className="badge badge-warning"><Clock size={12} /> Pending</span>;
    }
  };

  return (
    <div className="content-page">
      <div className="page-header">
        <div>
          <h1>Urea Allocation Requests</h1>
          <p>Manage government urea quota requests submitted by registered farmers</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchRequests}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <div className="search-box" style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by farmer name, mobile or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>

        <select
          className="select-field"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          style={{ width: '180px' }}
        >
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading urea requests...</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
            <Package size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3>No Urea Requests Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>No allocation requests match the filter criteria.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Farmer Name</th>
                  <th>Mobile</th>
                  <th>Location</th>
                  <th>Bags Requested</th>
                  <th>Requested Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>#{req.id}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{req.full_name}</div>
                      {req.note && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Note: {req.note}</div>}
                    </td>
                    <td>{req.mobile_number}</td>
                    <td>{req.location}</td>
                    <td>
                      <span className="badge badge-info" style={{ fontWeight: 700 }}>
                        {req.quantity} {req.quantity === 1 ? 'Bag' : 'Bags'}
                      </span>
                    </td>
                    <td>{new Date(req.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                    <td>{getStatusBadge(req.status)}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        {req.status !== 'Approved' && (
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => handleStatusChange(req.id, 'Approved')}
                            title="Approve Request"
                          >
                            Approve
                          </button>
                        )}
                        {req.status !== 'Rejected' && (
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => handleStatusChange(req.id, 'Rejected')}
                            title="Reject Request"
                          >
                            Reject
                          </button>
                        )}
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleDelete(req.id)}
                          title="Delete Request"
                        >
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
    </div>
  );
}
