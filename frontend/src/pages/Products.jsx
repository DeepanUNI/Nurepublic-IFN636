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

        // FR04 filters: category + price range
        const [categories, setCategories] = useState([]);
        const [category, setCategory] = useState('');
        const [minPrice, setMinPrice] = useState('');
        const [maxPrice, setMaxPrice] = useState('');
        const [debouncedMin, setDebouncedMin] = useState('');
        const [debouncedMax, setDebouncedMax] = useState('');

        // wait until the user stops typing before asking the backend
        useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(search);
            setDebouncedMin(minPrice);
            setDebouncedMax(maxPrice);
        }, 300);
        return () => clearTimeout(timer);
    }, [search, minPrice, maxPrice]);

    const loadCategories = async () => {
        try {
            setCategories(await apiFetch('/products/categories'));
        } catch {
            setCategories([]);
        }
    };

    useEffect(() => {
        loadCategories();
    }, []);

    const filtersActive = Boolean(search || category || minPrice || maxPrice);
    const clearFilters = () => {
        setSearch('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
    };


const loadProducts = async () => {
        try{
            // NEW...... send search + sort to the backend
            const params = new URLSearchParams();
            if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim());
            if (category) params.set('category', category);
            if (debouncedMin !== '') params.set('minPrice', debouncedMin);
            if (debouncedMax !== '') params.set('maxPrice', debouncedMax);
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
    
    }, [debouncedSearch, sort, category, debouncedMin, debouncedMax]); // reload when search, sort or filters change

    const handlePurchase = async (productId) => {
        setPurchaseMessage('');
        try{
            await apiFetch('/orders/purchase', {method: 'POST', body: { productId }});
            setPurchaseMessage('Purchase successful! Check My Library.');
        } catch (err) {
            setPurchaseMessage(err.message);
        }
    };

    const handleAddToCart = async (productId) => {
        setPurchaseMessage('');
        try {
            await apiFetch('/cart', { method: 'POST', body: { productId } });
            setPurchaseMessage('Added to cart.');
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
    loadCategories();
    } catch (err) {
      setError(err.message);
    }
};

const handleDelete= async (id) => {
    try {
      await apiFetch(`/products/${id}`, { method: 'DELETE' });
      loadProducts();
      loadCategories();
    } catch (err) {
      setError(err.message);
    }
};

return (
<>
    <div className="hero">
        <h1>Nu <span>Republic</span> Marketplace</h1>
        <p>Browse and buy quality headphones, earbuds and headsets.</p>
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
          <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Filter by category">
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            type="number"
            min="0"
            placeholder="Min $"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            aria-label="Minimum price"
            className="price-filter"
          />
          <input
            type="number"
            min="0"
            placeholder="Max $"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            aria-label="Maximum price"
            className="price-filter"
          />
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Sort products">
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          {filtersActive && (
            <button type="button" className="clear-filters" onClick={clearFilters}>Clear filters</button>
          )}
          <span className="result-count">{products.length} result{products.length === 1 ? '' : 's'}</span>
        </div>

        <div className="product-grid">
          {products.length === 0 && (
            <p>{filtersActive ? 'No products found.' : 'No products listed yet.'}</p>
          )}
          {products.map((p) => (
            <div className="product-card" key={p._id}>
              <h3><Link to={`/products/${p._id}`}>{p.title}</Link></h3>
              <p className="category">{p.category}</p>
              <p className="price">${p.price.toFixed(2)}</p>
              {user?.role === 'user' && (
                <>
                  <button onClick={() => handleAddToCart(p._id)}>Add to cart</button>
                  <button onClick={() => handlePurchase(p._id)}>Buy now</button>
                </>
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