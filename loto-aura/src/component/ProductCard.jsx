// src/component/ProductCard.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProductCard = ({ product, onClickCard }) => {
  const { cart, addToCart } = useCart();
  const { currentUser, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Estados para Modales propios
  const [showAuthWarning, setShowAuthWarning] = useState(false);
  const [showStockWarning, setShowStockWarning] = useState(false);

  const handleAdd = (e) => {
    e.stopPropagation(); 
    
    // Validación 1: Debe iniciar sesión
    if (!currentUser) {
      return setShowAuthWarning(true);
    }

    // Validación 2: Control de Stock Estricto
    const itemInCart = cart.find(item => item.id === product.id);
    const currentQtyInCart = itemInCart ? itemInCart.quantity : 0;

    if (currentQtyInCart >= product.stock) {
      return setShowStockWarning(true);
    }

    addToCart(product);
  };

  const displayImage = product.images && product.images.length > 0 && product.images[0] !== '' 
    ? <img src={product.images[0]} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
    : <div style={styles.placeholderImg}>🌸 {product.name}</div>;

  const isOutOfStock = product.stock <= 0;

  return (
    <>
      <div style={{...styles.card, opacity: isOutOfStock ? 0.6 : 1}} onClick={() => onClickCard && onClickCard(product)}>
        <div style={styles.imageContainer}>
          {displayImage}
          {isOutOfStock && <span style={styles.outOfStockBadge}>Agotado</span>}
          {!isOutOfStock && product.isNew && !product.promoTag && <span style={styles.badge}>Nuevo</span>}
          {!isOutOfStock && product.promoTag && <span style={styles.promoBadge}>{product.promoTag}</span>}
        </div>
        
        <div style={styles.infoContainer}>
          <h3 style={styles.title}>{product.name}</h3>
          <p style={styles.description}>{product.description?.substring(0, 60)}...</p>
          
          <p style={{ fontSize: '12px', color: isOutOfStock ? '#b91c1c' : '#16a34a', fontWeight: 'bold', marginBottom: '10px' }}>
            {isOutOfStock ? 'Sin stock disponible' : `Stock: ${product.stock} unidades`}
          </p>

          <div style={styles.priceRow}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {product.originalPrice && <span style={styles.originalPrice}>Bs. {product.originalPrice}</span>}
              <span style={styles.price}>Bs. {product.price}</span>
            </div>

            {!isAdmin && (
              <button 
                style={{...styles.cartButton, backgroundColor: isOutOfStock ? '#ccc' : 'var(--primary-pink)', cursor: isOutOfStock ? 'not-allowed' : 'pointer'}} 
                onClick={handleAdd}
                disabled={isOutOfStock}
              >
                {isOutOfStock ? 'Agotado' : 'Agregar'}
              </button>
            )}
            {isAdmin && <span style={{ fontSize: '12px', color: 'var(--text-light)', fontWeight: 'bold' }}>Vista Admin</span>}
          </div>
        </div>
      </div>

      {/* MODAL CUSTOM: Advertencia de Login */}
      {showAuthWarning && (
        <div style={styles.overlay} onClick={(e) => e.stopPropagation()}>
          <div style={styles.warningBox}>
            <h3 style={{ color: 'var(--primary-pink)', marginBottom: '10px' }}>🔒 Inicia Sesión</h3>
            <p style={{ color: 'var(--text-dark)', marginBottom: '20px', fontSize: '14px' }}>Debes tener una cuenta para agregar productos al carrito y realizar compras.</p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowAuthWarning(false)} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={() => navigate('/login')} style={styles.actionBtn}>Ir a Ingresar</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CUSTOM: Advertencia de Stock */}
      {showStockWarning && (
        <div style={styles.overlay} onClick={(e) => e.stopPropagation()}>
          <div style={styles.warningBox}>
            <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>⚠️ Límite de Stock</h3>
            <p style={{ color: 'var(--text-dark)', marginBottom: '20px', fontSize: '14px' }}>
              No puedes agregar más unidades. Solo tenemos <b>{product.stock}</b> disponibles en inventario.
            </p>
            <button onClick={() => setShowStockWarning(false)} style={{...styles.actionBtn, width: '100%', backgroundColor: '#b91c1c'}}>Entendido</button>
          </div>
        </div>
      )}
    </>
  );
};

const styles = {
  card: { backgroundColor: 'var(--white)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: '100%', cursor: 'pointer', transition: 'transform 0.2s' },
  imageContainer: { position: 'relative', height: '200px', backgroundColor: '#fde8f2' },
  placeholderImg: { width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-pink)', fontWeight: '600', textAlign: 'center', padding: '20px' },
  badge: { position: 'absolute', top: '10px', right: '10px', backgroundColor: 'var(--primary-pink)', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  outOfStockBadge: { position: 'absolute', top: '10px', right: '10px', backgroundColor: '#333', color: 'white', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' },
  promoBadge: { position: 'absolute', top: '10px', left: '10px', backgroundColor: '#e11d48', color: 'white', padding: '6px 14px', borderRadius: '8px', fontSize: '14px', fontWeight: 'bold' },
  infoContainer: { padding: '20px', display: 'flex', flexDirection: 'column', flexGrow: 1 },
  title: { fontSize: '18px', fontWeight: '600', color: 'var(--text-dark)', marginBottom: '8px' },
  description: { fontSize: '14px', color: 'var(--text-light)', marginBottom: '5px', flexGrow: 1 },
  priceRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' },
  price: { fontSize: '20px', fontWeight: '700', color: 'var(--primary-pink)' },
  originalPrice: { fontSize: '14px', color: 'var(--text-light)', textDecoration: 'line-through', marginBottom: '2px' },
  cartButton: { color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontWeight: '500', fontSize: '14px' },
  
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  warningBox: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  cancelBtn: { flex: 1, padding: '10px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#4b5563', cursor: 'pointer' },
  actionBtn: { flex: 1, padding: '10px', background: 'var(--primary-pink)', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: 'white', cursor: 'pointer' }
};

export default ProductCard;