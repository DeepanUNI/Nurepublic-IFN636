import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Products({user}) {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState('');
    const [newProduct, setNewProduct] = useState({ title: '', description: '', price: '', category: '' });
    const [purchaseMessage, setPurchaseMessage] = useState('');

    const loadProducts = async () => {
        try{
            const data = await apiFetch('/produts');
            setProducts(data);
        } catch (err) {
          setError(err.message);
        }
    };

    useEffect(() => {
          loadProducts();
    }, []);

    const handlePurchase = async (productID) => {
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
    setNewProducts({ title: '', description: '', price: '', category: '' });
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

        <div className="product-grid">
          {products.length === 0 && <p>No products listed yet.</p>}
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
    