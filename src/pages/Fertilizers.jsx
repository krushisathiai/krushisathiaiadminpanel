import { useState, useEffect } from 'react';
import { Sprout, Plus, Search, Edit2, Trash2, RefreshCw, X, Layers, CheckCircle } from 'lucide-react';
import { getFertilizers, createFertilizer, updateFertilizer, deleteFertilizer } from '../api/adminApi';
import { useToast } from '../context/ToastContext';

export default function Fertilizers() {
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    crop_name: '',
    soil_type: 'Black Soil',
    fertilizer_name: '',
    fertilizer_type: 'NPK',
    dose: '',
    stage: 'Vegetative',
    application_method: '',
    notes: '',
  });

  const fetchFertilizers = async () => {
    setLoading(true);
    try {
      const res = await getFertilizers();
      if (res.data.success) {
        setFertilizers(res.data.fertilizers);
      }
    } catch (err) {
      addToast('Failed to load fertilizer guide', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFertilizers();
  }, []);

  const handleOpenAdd = () => {
    setEditItem(null);
    setFormData({
      crop_name: '',
      soil_type: 'Black Soil',
      fertilizer_name: '',
      fertilizer_type: 'NPK',
      dose: '1 kg per acre',
      stage: 'Vegetative Stage',
      application_method: 'Soil application or fertigation',
      notes: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (item) => {
    setEditItem(item);
    setFormData({
      crop_name: item.crop_name || '',
      soil_type: item.soil_type || 'Black Soil',
      fertilizer_name: item.fertilizer_name || '',
      fertilizer_type: item.fertilizer_type || 'NPK',
      dose: item.dose || '',
      stage: item.stage || '',
      application_method: item.application_method || '',
      notes: item.notes || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editItem) {
        const res = await updateFertilizer(editItem.id, formData);
        if (res.data.success) {
          addToast('Fertilizer guide updated successfully', 'ok');
          setShowModal(false);
          fetchFertilizers();
        }
      } else {
        const res = await createFertilizer(formData);
        if (res.data.success) {
          addToast('Fertilizer guide added successfully', 'ok');
          setShowModal(false);
          fetchFertilizers();
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to save fertilizer guide', 'err');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this fertilizer recommendation?')) return;
    try {
      const res = await deleteFertilizer(id);
      if (res.data.success) {
        addToast('Fertilizer recommendation deleted', 'ok');
        fetchFertilizers();
      }
    } catch (err) {
      addToast('Failed to delete fertilizer recommendation', 'err');
    }
  };

  const filteredFertilizers = fertilizers.filter(f =>
    f.crop_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.fertilizer_name?.toLowerCase().includes(search.toLowerCase()) ||
    f.soil_type?.toLowerCase().includes(search.toLowerCase()) ||
    f.stage?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="content-page">
      <div className="responsive-page-head">
        <div>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Sprout color="var(--primary)" /> Fertilizer Guide Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure crop-wise nutrient doses and soil fertilization schedules for farmers</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-secondary" onClick={fetchFertilizers}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Recommendation
          </button>
        </div>
      </div>

      <div className="filter-bar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="search-box" style={{ flex: 1, position: 'relative' }}>
          <Search size={16} className="search-icon" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search by crop, fertilizer name or soil type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading-container" style={{ padding: '40px', textAlign: 'center' }}>
            <div className="spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading fertilizer recommendations...</p>
          </div>
        ) : filteredFertilizers.length === 0 ? (
          <div className="empty-state" style={{ padding: '40px', textAlign: 'center' }}>
            <Sprout size={48} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
            <h3>No Fertilizer Recommendations Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>Add nutrient schedules to help farmers optimize yield.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Crop & Soil</th>
                  <th>Fertilizer Name</th>
                  <th>Type</th>
                  <th>Dose</th>
                  <th>Growth Stage</th>
                  <th>Application Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFertilizers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{item.crop_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.soil_type || 'All Soil Types'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{item.fertilizer_name}</div>
                    </td>
                    <td>
                      <span className="badge badge-info">{item.fertilizer_type || 'NPK'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fbbf24' }}>{item.dose || 'As per soil test'}</div>
                    </td>
                    <td>
                      <span className="badge badge-warning">{item.stage || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', maxWidth: '280px' }}>
                        {item.notes || item.application_method || 'Follow safety precautions during application.'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(item.id)}>
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

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="card" style={{ width: '100%', maxWidth: '560px', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{editItem ? 'Edit Fertilizer Guide' : 'Add Fertilizer Guide'}</h3>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Crop Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Tomato, Wheat" value={formData.crop_name} onChange={e => setFormData({ ...formData, crop_name: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Soil Type</label>
                  <select className="select-field" value={formData.soil_type} onChange={e => setFormData({ ...formData, soil_type: e.target.value })} style={{ width: '100%' }}>
                    <option value="Black Soil">Black Soil (काळी जमीन)</option>
                    <option value="Red Soil">Red Soil (तांबडी जमीन)</option>
                    <option value="Alluvial Soil">Alluvial Soil (गाळाची जमीन)</option>
                    <option value="Sandy Loam">Sandy Loam (वाळूमिश्रित)</option>
                    <option value="Clay Soil">Clay Soil (चिकनमाती)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Fertilizer Name</label>
                  <input type="text" className="input-field" placeholder="e.g. NPK 19:19:19, Urea" value={formData.fertilizer_name} onChange={e => setFormData({ ...formData, fertilizer_name: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Type</label>
                  <select className="select-field" value={formData.fertilizer_type} onChange={e => setFormData({ ...formData, fertilizer_type: e.target.value })} style={{ width: '100%' }}>
                    <option value="NPK">NPK Complex</option>
                    <option value="Organic">Organic / Vermicompost</option>
                    <option value="Micronutrient">Micronutrient (Zinc/Boron)</option>
                    <option value="Bio-Fertilizer">Bio-Fertilizer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Dose / Acre</label>
                  <input type="text" className="input-field" placeholder="e.g. 50 kg per acre" value={formData.dose} onChange={e => setFormData({ ...formData, dose: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Crop Stage</label>
                  <input type="text" className="input-field" placeholder="e.g. Vegetative, Flowering" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, marginBottom: '6px' }}>Notes / Instructions</label>
                <textarea className="input-field" rows="3" placeholder="Application tips..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%', resize: 'vertical' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update Recommendation' : 'Add Recommendation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
