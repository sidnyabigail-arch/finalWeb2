// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './index.css'; 

import Navbar from './component/Navbar';
import Home from './pages/Home';
import Catalog from './pages/Catalog'; 
import Login from './pages/Login';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout'; 
import AdminDashboard from './pages/AdminDashboard';
import ClientHistory from './pages/ClientHistory'; // <--- Nueva Importación
import Services from './pages/Services';
import Offers from './pages/Offers';
import Meanings from './pages/Meanings';
import TrackOrder from './pages/TrackOrder';
import Contact from './pages/Contact';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalogo" element={<Catalog />} /> 
            <Route path="/servicios" element={<Services />} />
            <Route path="/ofertas" element={<Offers />} />
            <Route path="/significados" element={<Meanings />} />
            <Route path="/rastrear" element={<TrackOrder />} />
            <Route path="/contacto" element={<Contact />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/carrito" element={<Cart />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Historial del Cliente Logueado */}
            <Route path="/mis-pedidos" element={<ClientHistory />} />
            
            {/* Dashboard del Admin */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;