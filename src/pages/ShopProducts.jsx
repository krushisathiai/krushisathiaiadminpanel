import { useState, useEffect } from 'react';
import { ShoppingBag, Search, Trash2, RefreshCw, Store, MapPin, Tag } from 'lucide-react';
import { getShopProducts, deleteShopProduct } from '../api/adminApi';
import { useToast } from '../context/ToastContext';

export default function ShopProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { addToast } = useToast();

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await getShopProducts();
      if (res.data.success) {
        setProducts(res.data.products);
      }
    } catch (err) {
      addToast('Failed to load shop products', 'err');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to remove this shop product listing?')) return;
    try {
      const res = await deleteShopProduct(id);
      if (res.data.success) {
        addToast('Product removed successfully', 'ok');
        fetchProducts();
      }
    } catch (err) {
      addToast('Failed to delete product', 'err');
    }
  };

  const categories = [...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.shop_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.company?.toLowerCase().includes(search.toLowerCase()) ||
      p.shop_location?.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = !categoryFilter || p.category === categoryFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Shop Products & Listings</h1>
          <p>Manage agricultural inventory listed by local shop owners across regions</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchProducts}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card">
        {/* Search + Filter toolbar */}
        <div className="tbl-toolbar">
          <div className="search-wrap" style={{ flex: 1, minWidth: '240px' }}>
            <span className="search-ico"><Search /></span>
            <input
              type="text"
              className="inp with-icon"
              placeholder="Search product, shop name, brand or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <select
            className="sel"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{ width: '200px' }}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="spin-wrap">
            <div className="spinner" />
            <p style={{ marginTop: '12px', color: 'var(--text-muted)' }}>Loading products...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">
            <ShoppingBag size={48} />
            <h3>No Shop Products Found</h3>
            <p>No products match your search or filter criteria.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category / Brand</th>
                  <th>Shop Seva Kendra</th>
                  <th>Location</th>
                  <th>Price & Unit</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{prod.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{prod.id}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Tag size={12} />{prod.category}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prod.company}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><Store size={14} />{prod.shop_name || prod.owner_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Owner: {prod.owner_name}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} />{prod.shop_location || 'N/A'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: '#059669' }}>₹{parseFloat(prod.price).toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per {prod.unit || 'pack'}</div>
                    </td>
                    <td>
                      <span className={`badge ${prod.stock_quantity > 10 ? 'b-green' : 'b-amber'}`}>
                        {prod.stock_quantity} available
                      </span>
                    </td>
                    <td>
                      <span className="badge b-blue">{prod.status}</span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(prod.id)}
                        title="Delete Product Listing"
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
