import { Link, useNavigate } from 'react-router-dom';

export default function NavBar({ user, onLogout }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/products" className="brand">Nu <span>Republic</span></Link>
      <div className="nav-links">
        {user ? (
          <>
            <Link to="/products">Browse</Link>
            {user.role === 'user' && <Link to="/library">My Library</Link>}
            <span className="user-info">{user.name} ({user.role})</span>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/signup">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
}
