import { useEffect, useState } from 'react';
import { apiFetch } from '../api';

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch('/orders/all')
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Each product is its own order document, so group the ones from the same checkout.
  // "Buy now" orders have no checkoutId, so each one becomes its own group.
  const groups = [];
  const byKey = {};
  for (const order of orders) {
    const key = order.checkoutId || order._id;
    if (!byKey[key]) {
      byKey[key] = {
        key,
        date: order.createdAt || order.purchasedAt,
        account: order.user,
        customer: order.customer,
        items: [],
        total: 0,
      };
      groups.push(byKey[key]);
    }
    byKey[key].items.push(order);
    byKey[key].total += Number(order.pricePaid || 0);
  }

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>All Orders</h2>
      {error && <p className="error">{error}</p>}
      {!error && groups.length === 0 && <p>No orders yet.</p>}

      {groups.map((g) => (
        <div className="order-card" key={g.key}>
          <div className="order-header">
            <strong>{new Date(g.date).toLocaleString()}</strong>
            <span className="price">${g.total.toFixed(2)}</span>
          </div>

          <p className="category">
            Account: {g.account ? `${g.account.name} (${g.account.email})` : 'Deleted user'}
          </p>

          {g.customer ? (
            <div className="order-customer">
              <p><strong>{g.customer.fullName}</strong></p>
              <p>{g.customer.email} · {g.customer.phone}</p>
              <p>{g.customer.street}, {g.customer.city} {g.customer.state} {g.customer.postcode}</p>
            </div>
          ) : (
            <p className="info">No delivery details (bought with "Buy now")</p>
          )}

          <ul className="checkout-list">
            {g.items.map((o) => (
              <li key={o._id}>
                <span>{o.product?.title || 'Deleted product'}</span>
                <span>${Number(o.pricePaid || 0).toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
