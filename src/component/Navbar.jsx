// src/component/Navbar.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { logoutUser } from '../services/authService';
import logoImg from '../assets/logo.png'; 

const Navbar = () => {
  const { currentUser, userData, isAdmin } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logoutUser();
      navigate('/');
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container} className="container">
        
        {/* Logo */}
        <Link to="/" style={styles.logoContainer}>
          <img src={logoImg} alt="Loto Aura Logo" style={styles.logoImg} />
        </Link>

        {/* Enlaces Principales */}
        <div style={styles.links}>
          <Link to="/" style={styles.link}>Inicio</Link>
          <Link to="/catalogo" style={styles.link}>Catálogo</Link>
          <Link to="/ofertas" style={styles.link}>Promociones</Link>
          <Link to="/significados" style={styles.link}>Mundo Floral</Link>
          <Link to="/servicios" style={styles.link}>Servicios</Link>
          <Link to="/contacto" style={styles.link}>Contacto</Link>
          
          {isAdmin ? (
            <Link to="/admin" style={{...styles.link, color: 'var(--primary-pink)', fontWeight: 'bold'}}>
              Dashboard Admin
            </Link>
          ) : (
            currentUser && (
              <Link to="/mis-pedidos" style={{...styles.link, color: 'var(--primary-pink)', fontWeight: 'bold'}}>
                Mis Pedidos
              </Link>
            )
          )}
        </div>

        {/* Iconos y Sesión */}
        <div style={styles.icons}>
          
          {!isAdmin && (
            <button style={styles.cartWrapper} onClick={() => navigate('/carrito')}>
              <span style={styles.cartIcon}>🛒</span>
              {getItemCount() > 0 && <span style={styles.cartBadge}>{getItemCount()}</span>}
            </button>
          )}
          
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '14px', color: 'var(--text-light)', fontWeight: 'bold' }}>
                {userData?.name}
              </span>
              <button onClick={handleLogout} style={styles.authBtn}>Salir</button>
            </div>
          ) : (
            <Link to="/login"><button style={styles.authBtn}>Ingresar</button></Link>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  nav: { backgroundColor: 'var(--white)', boxShadow: '0 2px 15px rgba(0,0,0,0.08)', position: 'sticky', top: 0, zIndex: 1000 },
  container: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '80px', flexWrap: 'wrap' },
  logoContainer: { display: 'flex', alignItems: 'center', height: '100%' },
  logoImg: { height: '60px', objectFit: 'contain' }, 
  links: { display: 'flex', gap: '18px', alignItems: 'center', flexWrap: 'wrap' },
  link: { fontSize: '14px', fontWeight: '600', color: 'var(--text-light)', transition: 'color 0.3s', textDecoration: 'none' },
  icons: { display: 'flex', alignItems: 'center', gap: '20px' },
  cartWrapper: { position: 'relative', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' },
  cartIcon: { fontSize: '24px' },
  cartBadge: { position: 'absolute', top: '-8px', right: '-8px', backgroundColor: 'var(--primary-pink)', color: 'white', fontSize: '11px', fontWeight: 'bold', width: '18px', height: '18px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  authBtn: { backgroundColor: 'transparent', border: '2px solid var(--primary-pink)', color: 'var(--primary-pink)', padding: '6px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '14px', transition: 'all 0.3s' }
};

export default Navbar;