import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function MyLibrary(){
    const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');

  useInsertionEffect(()=>{
    apiFetch('/orders/my-library')
    .then((data) => setOrders(data))
    .catch((err)=> setError(err.message));
  }, []);

return (
    <div className="container">
      <h2>My Library</h2>
      {error && <p className="error">{error}</p>}
      {orders.length === 0 && <p>You haven't purchased anything yet.</p>}
      <div className="product-grid">
        {orders.map((order) => (
          <div className="product-card" key={order._id}>
            <h3>{order.product?.title}</h3>
            <p className="category">{order.product?.category}</p>
            <p>Purchased: {new Date(order.purchasedAt).toLocaleDateString()}</p>
            <p className="price">${order.pricePaid.toFixed(2)}</p>
          </div>
        ))}
      </div>
    </div>
  );
}