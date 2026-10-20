import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiFetch } from '../api';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // every cart endpoint returns { items, total }, so one function updates the page
  const applyCart = (data) => {
    setItems(data.items);
    setTotal(data.total);
  };

  useEffect(() => {
    apiFetch('/cart')
      .then(applyCart)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setError('');
    try {
      const data = await apiFetch(`/cart/${productId}`, { method: 'DELETE' });
      applyCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = async () => {
    setError('');
    try {
      const data = await apiFetch('/cart', { method: 'DELETE' });
      applyCart(data);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>My Cart</h2>
      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <>
          <div className="product-grid">
            {items.map((item) => (
              <div className="product-card" key={item.product._id}>
                <h3>
                  <Link to={`/products/${item.product._id}`}>{item.product.title}</Link>
                </h3>
                <p className="category">{item.product.category}</p>
                <p className="price">${item.product.price.toFixed(2)}</p>
                <button className="danger" onClick={() => handleRemove(item.product._id)}>
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <p className="price">Total: ${total.toFixed(2)}</p>
            <button className="danger" onClick={handleClear}>Clear cart</button>
            <button onClick={() => navigate('/checkout')}>Proceed to checkout</button>
          </div>
        </>
      )}
    </div>
  );
}