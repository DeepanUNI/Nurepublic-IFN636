import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { apiFetch } from '../api';

export default function login({onLogin}) {
    const [form,setForm] = useState({ email: '', password: '' });
    const [error,setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await api.post('/auth/login', form);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            onLogin(res.data.user);
            navigate('/products');

        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }

    };

    return(
        <div className="auth-page">
            <h2>Log In</h2>
            {error && <p className="error">{error}</p>}
            <form onSubmit={handleSubmit}>
              <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required />
              <button type="submit">Log In</button>
      </form>
      <p>No Account? <Link to="/signup">Sign up</Link></p>
        </div>
    );




    }    

