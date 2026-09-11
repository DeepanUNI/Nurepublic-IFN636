import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import NavBar from './components/NavBar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import MyLibrary from './pages/MyLibrary';

export default function App() {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  return (
    <>
      <NavBar user={user} onLogout={() => setUser(null)} />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route
            path="/products"
            element={
              <ProtectedRoute user={user}>
                <Products user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/products/:id"
            element={
              <ProtectedRoute user={user}>
                <ProductDetail user={user} />
              </ProtectedRoute>
            }
          />
          <Route
            path="/library"
            element={
              <ProtectedRoute user={user}>
                <MyLibrary />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
