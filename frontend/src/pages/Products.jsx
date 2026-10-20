import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'title_asc', label: 'Title: A to Z' },
];

export default function Products({user}) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', category: '' });
    const [purchaseMessage, setPurchaseMessage] = useState('');


    // New search and sort//
        const [search, setSearch] = useState('');
        const [debouncedSearch, setDebouncedSearch] = useState('');
        const [sort, setSort] = useState('newest');

        useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(timer);
    }, [search]);


const loadProducts = async () => {
        try{
            // NEW...... send search + sort to the backend
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            params.set('sort', sort);
            const data = await apiFetch(`/products?${params.toString()}`);
            setProducts(data);
            setError('');
        } catch (err) {
          setError(err.message);
        }
    };

    useEffect(() => {
          loadProducts();
    
    }, [debouncedSearch, sort]); // NEW: reload when search or sort changes

    const handlePurchase = async (productId) => {
        setPurchaseMessage('');
        try{
            await apiFetch('/orders/purchase', {method: 'POST', body: { productId }});
            setPurchaseMessage('Purchase successful! Check My Library.');

            } catch (err) {
      setPurchaseMessage(err.message);
    }
};

const handleAddProduct = async (e) =>{
    e.preventDefault();
    try{
        await apiFetch('/products', {
            method: 'POST',
            body: { ...newProduct, price: Number(newProduct.price) },
    });
    setNewProduct({ title: '', description: '', price: '', category: '' });
    loadProducts();
    } catch (err) {
      setError(err.message);
    }
};

const handleDelete= async (id) => {
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      loadProducts();
    } catch (err) {
      setError(err.message);
    }
};

return (
<>
    <div className="hero">
        <h1>Nu <span>Republic</span> Marketplace</h1>
        <p>Browse and instantly own digital goods from independent creators.</p>
      </div>

      <div className="container">
        {error && <p className="error">{error}</p>}
        {purchaseMessage && <p className="info">{purchaseMessage}</p>}

        {user?.role === 'admin' && (
          <div className="admin-panel">
            <h3>Add Product (Admin)</h3>
            <form onSubmit={handleAddProduct}>
              <input
                placeholder="Title"
                value={newProduct.title}
                onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                required
              />
              <input
                placeholder="Category"
                value={newProduct.category}
                onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                required
              />
              <input
                type="number"
                min="0"
                placeholder="Price"
                value={newProduct.price}
                onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newProduct.description}
                onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                required
              />
              <button type="submit">Add Product</button>
            </form>
          </div>
        )}

        {/* Assessment 2   search& sort toolbar */}
        <div className="toolbar">
          <input
            type="search"
            placeholder="Search by title, description or category"
            value={search}
            maxLength={100}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search products"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <span className="result-count">{products.length} result{products.length === 1 ? '' : 's'}</span>
        </div>

        <div className="product-grid">
          {products.length === 0 && (
            <p>{debouncedSearch ? `No products match "${debouncedSearch}".` : 'No products listed yet.'}</p>
          )}
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <h3><Link to={`/products/${p._id}`}>{p.title}</Link></h3>
              <p className="category">{p.category}</p>
              <p className="price">${p.price.toFixed(2)}</p>
              {user?.role === 'user' && (
                <button onClick={() => handlePurchase(p._id)}>Purchase</button>
              )}
              {user?.role === 'admin' && (
                <button className="danger" onClick={() => handleDelete(p._id)}>Delete</button>
              )}
            </div>
          ))}
        </div>
      </div>
      </>

);
 }