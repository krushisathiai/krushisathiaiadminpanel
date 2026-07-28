import { useState, useEffect } from 'react';
import { Sprout, Plus, Search, Edit2, Trash2, RefreshCw, X } from 'lucide-react';
import { getFertilizers, createFertilizer, updateFertilizer, deleteFertilizer } from '../api/adminApi';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

export default function Fertilizers() {
  const [fertilizers, setFertilizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
      <div className="responsive-page-head">
        <div>
          <h1>Fertilizer Schedule Management</h1>
          <p>Configure crop-wise nutrient doses and soil fertilization schedules for farmers</p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-ghost" onClick={fetchFertilizers}>
            <RefreshCw size={16} /> Refresh
          </button>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} /> Add Recommendation
          </button>
        </div>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={(e) => e.preventDefault()} style={{ flex: 1, minWidth: '240px' }}>
            <div className="search-wrap">
              <span className="search-ico"><Search size={16} /></span>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search by crop, fertilizer name or soil type..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </form>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading fertilizer recommendations...</span></div>
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
                  <th>CROP & SOIL</th>
                  <th>FERTILIZER NAME</th>
                  <th>TYPE</th>
                  <th>DOSE</th>
                  <th>GROWTH STAGE</th>
                  <th>NOTES</th>
                  <th style={{ textAlign: 'center' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredFertilizers.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>{item.crop_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{item.soil_type || 'All Soil Types'}</div>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--text-1)' }}>{item.fertilizer_name}</td>
                    <td>
                      <span className="badge b-blue">{item.fertilizer_type || 'NPK'}</span>
                    </td>
                    <td>
                      <span className="badge b-amber">{item.dose || 'As per soil test'}</span>
                    </td>
                    <td>
                      <span className="badge b-green">{item.stage || 'General'}</span>
                    </td>
                    <td style={{ color: 'var(--text-muted)', maxWidth: '280px' }}>
                      <div style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {item.notes || item.application_method || 'Follow safety precautions.'}
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        <button className="btn btn-sm btn-ghost btn-icon" onClick={() => handleOpenEdit(item)} title="Edit Record">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-sm btn-danger btn-icon" onClick={() => setConfirmDelete({ id: item.id, name: `${item.crop_name} - ${item.fertilizer_name}` })} title="Delete Record">
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
        <div className="overlay">
          <div className="modal" style={{ maxWidth: '560px' }}>
            <div className="modal-hd">
              <h3><Sprout /> {editItem ? 'Edit Fertilizer Guide' : 'Add Fertilizer Guide'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}><X size={16} /></button>
            </div>

            <form onSubmit={handleSubmit} className="modal-body">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Crop Name</label>
                  <input type="text" className="inp" placeholder="e.g. Tomato, Wheat" value={formData.crop_name} onChange={e => setFormData({ ...formData, crop_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Soil Type</label>
                  <select className="sel" value={formData.soil_type} onChange={e => setFormData({ ...formData, soil_type: e.target.value })}>
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
                  <input type="text" className="inp" placeholder="e.g. NPK 19:19:19, Urea" value={formData.fertilizer_name} onChange={e => setFormData({ ...formData, fertilizer_name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Type</label>
                  <select className="sel" value={formData.fertilizer_type} onChange={e => setFormData({ ...formData, fertilizer_type: e.target.value })}>
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
                  <input type="text" className="inp" placeholder="e.g. 50 kg per acre" value={formData.dose} onChange={e => setFormData({ ...formData, dose: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Crop Stage</label>
                  <input type="text" className="inp" placeholder="e.g. Vegetative, Flowering" value={formData.stage} onChange={e => setFormData({ ...formData, stage: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Application Notes</label>
                <textarea className="textarea" rows="3" placeholder="Application tips..." value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} />
              </div>

              <div className="modal-ft">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editItem ? 'Update Guide' : 'Add Recommendation'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmDelete && (
        <ConfirmModal
          title="Delete Fertilizer Recommendation"
          msg={`Are you sure you want to delete "${confirmDelete.name}"?`}
          onConfirm={() => { handleDelete(confirmDelete.id); setConfirmDelete(null); }}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </>
  );
}
