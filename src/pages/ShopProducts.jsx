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
      <div className="responsive-page-head">
        <div>
          <h1>Agro Shop Products & Inventory</h1>
          <p>Manage agricultural inventory and product listings across local Seva Kendras</p>
        </div>
        <button className="btn btn-ghost" onClick={fetchProducts}>
          <RefreshCw size={16} /> Refresh
        </button>
      </div>

      <div className="card">
        <div className="tbl-toolbar">
          <form onSubmit={(e) => e.preventDefault()} style={{ flex: 1, minWidth: '240px' }}>
            <div className="search-wrap">
              <span className="search-ico"><Search size={16} /></span>
              <input
                type="text"
                className="inp with-icon"
                placeholder="Search product, store name, brand or city..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </form>

          <select
            className="sel"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="spin-wrap"><div className="spinner" /><span>Loading shop products...</span></div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty">
            <ShoppingBag size={48} />
            <h3>No Shop Products Found</h3>
            <p>No product listings match your search or category filter.</p>
          </div>
        ) : (
          <div className="tbl-wrap">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT</th>
                  <th>CATEGORY / BRAND</th>
                  <th>AGRO SEVA KENDRA</th>
                  <th>LOCATION</th>
                  <th>PRICE & UNIT</th>
                  <th>STOCK</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'center' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((prod) => (
                  <tr key={prod.id}>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{prod.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ID: #{prod.id}</div>
                    </td>
                    <td>
                      <div><Tag size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--primary)' }} />{prod.category}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{prod.company}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}><Store size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--blue)' }} />{prod.shop_name || prod.owner_name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Owner: {prod.owner_name}</div>
                    </td>
                    <td>
                      <div style={{ color: 'var(--text-2)' }}><MapPin size={12} style={{ display: 'inline', marginRight: 4, color: 'var(--text-muted)' }} />{prod.shop_location || 'Maharashtra'}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--primary-light)' }}>₹{parseFloat(prod.price).toFixed(2)}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>per {prod.unit || 'pack'}</div>
                    </td>
                    <td>
                      <span className={`badge ${prod.stock_quantity > 10 ? 'b-green' : 'b-amber'}`}>
                        {prod.stock_quantity} in stock
                      </span>
                    </td>
                    <td>
                      <span className="badge b-blue">{prod.status}</span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <button
                        className="btn btn-sm btn-danger btn-icon"
                        onClick={() => handleDelete(prod.id)}
                        title="Remove Product Listing"
                      >
                        <Trash2 size={15} />
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
