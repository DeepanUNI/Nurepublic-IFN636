import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../api';

const STATES = ['QLD', 'NSW', 'VIC', 'ACT', 'TAS', 'SA', 'WA', 'NT'];

// read the logged-in user (saved at login) to pre-fill name and email
function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || {};
  } catch {
    return {};
  }
}

export default function Checkout() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [result, setResult] = useState(null);
  const [details, setDetails] = useState(() => {
    const user = getStoredUser();
    return {
      fullName: user.name || '',
      email: user.email || '',
      phone: '',
      street: '',
      city: '',
      state: 'QLD',
      postcode: '',
    };
  });

  useEffect(() => {
    apiFetch('/cart')
      .then((data) => {
        setItems(data.items);
        setTotal(data.total);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // one handler for every field — uses the input's name to know which one changed
  const handleChange = (e) => setDetails({ ...details, [e.target.name]: e.target.value });

  const handlePlaceOrder = async (e) => {
    e.preventDefault(); // stop the form reloading the page
    setError('');
    setPlacing(true);
    try {
      const data = await apiFetch('/orders/checkout', {
        method: 'POST',
        body: { customer: details },
      });
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  // confirmation screen after a successful checkout
  if (result) {
    const c = result.customer;
    return (
      <div className="container">
        <h2>Order complete 🎉</h2>
        <p>
          Thanks {c.fullName}! You bought {result.orders.length} item(s) for ${result.total.toFixed(2)}.
        </p>
        <p>
          Delivering to: {c.street}, {c.city} {c.state} {c.postcode}
        </p>
        {result.skipped > 0 && (
          <p className="info">{result.skipped} item(s) were skipped because you already own them.</p>
        )}
        <Link to="/library">Go to My Library</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h2>Checkout</h2>
      {error && <p className="error">{error}</p>}

      {items.length === 0 ? (
        <p>
          Your cart is empty. <Link to="/products">Browse products</Link>
        </p>
      ) : (
        <div className="checkout-layout">
          <form className="checkout-form" onSubmit={handlePlaceOrder}>
            <h3>Delivery details</h3>
            <input name="fullName" placeholder="Full name" value={details.fullName} onChange={handleChange} required />
            <input name="email" type="email" placeholder="Email" value={details.email} onChange={handleChange} required />
            <input name="phone" type="tel" placeholder="Phone (e.g. 0412 345 678)" value={details.phone} onChange={handleChange} required />
            <input name="street" placeholder="Street address" value={details.street} onChange={handleChange} required />
            <input name="city" placeholder="Suburb / City" value={details.city} onChange={handleChange} required />
            <div className="form-row">
              <select name="state" value={details.state} onChange={handleChange} required>
                {STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <input
                name="postcode"
                placeholder="Postcode"
                value={details.postcode}
                onChange={handleChange}
                inputMode="numeric"
                pattern="[0-9]{4}"
                maxLength={4}
                title="4-digit postcode"
                required
              />
            </div>
            <button type="submit" disabled={placing}>
              {placing ? 'Placing order...' : `Place order · $${total.toFixed(2)}`}
            </button>
            <Link to="/cart">← Back to cart</Link>
          </form>

          <div className="checkout-summary">
            <h3>Order summary</h3>
            <ul className="checkout-list">
              {items.map((item) => (
                <li key={item.product._id}>
                  <span>{item.product.title}</span>
                  <span>${item.product.price.toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="price">Total: ${total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
}
