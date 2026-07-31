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
    <>
      <div className="page-head">
        <div>
          <h1><Sprout style={{ color: 'var(--primary)', marginRight: '8px', verticalAlign: 'middle' }} /> Fertilizer Guide Management</h1>
          <p>Configure crop-wise nutrient doses and soil fertilization schedules for farmers</p>
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

      <div className="tbl-toolbar" style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        <div className="search-wrap" style={{ flex: 1 }}>
          <span className="search-ico"><Search /></span>
          <input
            type="text"
            className="inp with-icon"
            placeholder="Search by crop, fertilizer name or soil type..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
            <p>Loading fertilizer recommendations...</p>
          </div>
        ) : filteredFertilizers.length === 0 ? (
          <div className="empty">
            <Sprout size={48} />
            <h3>No Fertilizer Recommendations Found</h3>
            <p>Add nutrient schedules to help farmers optimize yield.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
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
                      <span className="badge b-blue">{item.fertilizer_type || 'NPK'}</span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#fbbf24' }}>{item.dose || 'As per soil test'}</div>
                    </td>
                    <td>
                      <span className="badge b-amber">{item.stage || 'General'}</span>
                    </td>
                    <td>
                      <div style={{ fontSize: '12px', color: 'var(--text-sub)', maxWidth: '280px' }}>
                        {item.notes || item.application_method || 'Follow safety precautions during application.'}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-sm btn-secondary btn-icon" onClick={() => handleOpenEdit(item)}>
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => handleDelete(item.id)}>
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
        <div className="overlay" style={{ zIndex: 300 }}>
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-hd">
              <h3>
                <Sprout />
                {editItem ? 'Edit Fertilizer Guide' : 'Add Fertilizer Guide'}
              </h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={14} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Crop Name</label>
                  <input type="text" className="inp" placeholder="e.g. Tomato, Wheat" value={formData.crop_name} onChange={e => setFormData({ ...formData, crop_name: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <select className="sel" value={formData.soil_type} onChange={e => setFormData({ ...formData, soil_type: e.target.value })} style={{ width: '100%' }}>
                    <option value="Black Soil">Black Soil (काळी जमीन)</option>
                    <option value="Red Soil">Red Soil (तांबडी जमीन)</option>
                    <option value="Alluvial Soil">Alluvial Soil (गाळाची जमीन)</option>
                    <option value="Sandy Loam">Sandy Loam (वाळूमिश्रित)</option>
                    <option value="Clay Soil">Clay Soil (चिकनमाती)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Fertilizer Name</label>
                  <input type="text" className="inp" placeholder="e.g. NPK 19:19:19, Urea" value={formData.fertilizer_name} onChange={e => setFormData({ ...formData, fertilizer_name: e.target.value })} required style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="sel" value={formData.fertilizer_type} onChange={e => setFormData({ ...formData, fertilizer_type: e.target.value })} style={{ width: '100%' }}>
                    <option value="NPK">NPK Complex</option>
                    <option value="Organic">Organic / Vermicompost</option>
                    <option value="Micronutrient">Micronutrient (Zinc/Boron)</option>
                    <option value="Bio-Fertilizer">Bio-Fertilizer</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Dose / Acre</label>
                  <input type="text" className="inp" placeholder="e.g. 50 kg per acre" value={formData.dose} onChange={e => setFormData({ ...formData, dose: e.target.value })} style={{ width: '100%' }} />
                </div>
                <div className="form-group">
                  <label className="form-label">Crop Stage</label>
                  <input type="text" className="inp" placeholder="e.g. Vegetative, Flowering" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} style={{ width: '100%' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Notes / Instructions</label>
                <textarea className="textarea" placeholder="Application tips..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} style={{ width: '100%' }} />
              </div>

              <div className="modal-ft" style={{ marginTop: '8px' }}>
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update Recommendation' : 'Add Recommendation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
