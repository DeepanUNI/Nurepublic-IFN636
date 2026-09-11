import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiFetch } from '../api';

export default function ProductDetail({ user }) {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [message, setMessage] = useState('');

    useEffect(() => {
        apiFetch(`/products/${id}`)
         .then((data) => setProduct(data))
         .catch(() => setProduct(null));
    }, [id]);


    const handlePurchase = async () => {
    try {
      await apiFetch('/orders/purchase', { method: 'POST', body: { productId: id } });
      setMessage('Purchase successful! Check My Library.');
    } catch (err) {
      setMessage(err.message);
    }
    };

    if(!product) return <p>Loading...</p>;

    return(
        <div className="product-detail">
          <h2>{product.title}</h2>
          <p className="category">{product.category}</p>
          <p>{product.description}</p>
          <p className="price">${product.price.toFixed(2)}</p>
          {message && <p className="info">{message}</p>}
          {user?.role === 'user' && <button onClick={handlePurchase}>Purchase</button>}
    </div>
    );
}