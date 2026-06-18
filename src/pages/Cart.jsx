// src/pages/Cart.jsx
import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';
import Modal from '../component/Modal'; // Usamos tu componente Modal genérico

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const [stockLimitModal, setStockLimitModal] = useState({ isOpen: false, limit: 0 });

  const handleIncrease = (item) => {
    if (item.quantity >= item.stock) {
      setStockLimitModal({ isOpen: true, limit: item.stock });
    } else {
      updateQuantity(item.id, item.quantity + 1);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '80px 20px', textAlign: 'center', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Tu carrito está vacío 🥀</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Aún no has seleccionado ningún arreglo floral.</p>
        <Link to="/catalogo" style={styles.primaryButton}>
          Volver al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '30px' }}>Tu Pedido</h2>
      
      <div style={styles.cartLayout}>
        <div style={styles.itemsSection}>
          {cart.map(item => (
            <div key={item.id} style={styles.cartItem}>
              {item.images && item.images[0] ? (
                <img src={item.images[0]} alt="prod" style={styles.itemImage} />
              ) : (
                <div style={styles.itemImagePlaceholder}>🌸</div>
              )}
              
              <div style={styles.itemDetails}>
                <h4 style={{ fontSize: '18px', color: 'var(--text-dark)' }}>{item.name}</h4>
                <p style={{ color: 'var(--primary-pink)', fontWeight: '600' }}>Bs. {item.price}</p>
                <p style={{ fontSize: '12px', color: '#16a34a', margin: 0 }}>Stock disp: {item.stock}</p>
              </div>
              
              <div style={styles.quantityControl}>
                <button style={styles.qtyBtn} onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                <span style={{ margin: '0 15px', fontWeight: '500' }}>{item.quantity}</span>
                <button style={styles.qtyBtn} onClick={() => handleIncrease(item)}>+</button>
              </div>
              
              <div style={{ fontWeight: '700', fontSize: '18px', color: 'var(--text-dark)', width: '100px', textAlign: 'right' }}>
                Bs. {item.price * item.quantity}
              </div>
              
              <button style={styles.removeBtn} onClick={() => removeFromCart(item.id)}>❌</button>
            </div>
          ))}
          
          <button style={styles.clearBtn} onClick={clearCart}>Vaciar Carrito</button>
        </div>

        <div style={styles.summarySection}>
          <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eaeaea', paddingBottom: '10px' }}>Resumen</h3>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', color: 'var(--text-light)' }}>
            <span>Subtotal</span>
            <span>Bs. {getCartTotal()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', color: 'var(--text-light)' }}>
            <span>Envío a domicilio</span>
            <span>Se calcula al final</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontSize: '22px', fontWeight: '700', color: 'var(--primary-pink)' }}>
            <span>Total Parcial</span>
            <span>Bs. {getCartTotal()}</span>
          </div>
          
          <Link to="/checkout" style={{...styles.primaryButton, width: '100%', display: 'block', textDecoration: 'none'}}>
            Proceder al Pago
          </Link>
        </div>
      </div>

      {/* Modal Aviso Stock Límite */}
      <Modal isOpen={stockLimitModal.isOpen} onClose={() => setStockLimitModal({ isOpen: false, limit: 0 })} title="Límite Alcanzado">
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: '#b91c1c', marginBottom: '10px' }}>⚠️ No hay más unidades</h3>
          <p style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>
            No puedes agregar más. Solo disponemos de <b>{stockLimitModal.limit}</b> unidades en nuestro inventario.
          </p>
          <button onClick={() => setStockLimitModal({ isOpen: false, limit: 0 })} style={{...styles.primaryButton, width: '100%'}}>Entendido</button>
        </div>
      </Modal>
    </div>
  );
};

const styles = {
  cartLayout: { display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' },
  itemsSection: { flex: '2', minWidth: '300px' },
  summarySection: { flex: '1', minWidth: '300px', backgroundColor: 'var(--light-pink)', padding: '30px', borderRadius: '16px', position: 'sticky', top: '90px' },
  cartItem: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px', borderBottom: '1px solid #eaeaea', gap: '15px', flexWrap: 'wrap' },
  itemImage: { width: '70px', height: '70px', borderRadius: '10px', objectFit: 'cover' },
  itemImagePlaceholder: { width: '70px', height: '70px', backgroundColor: '#fde8f2', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' },
  itemDetails: { flex: '1', minWidth: '150px' },
  quantityControl: { display: 'flex', alignItems: 'center', backgroundColor: '#f9fafb', borderRadius: '8px', padding: '5px' },
  qtyBtn: { background: 'white', border: '1px solid #eaeaea', borderRadius: '4px', width: '30px', height: '30px', fontSize: '18px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  removeBtn: { background: 'none', border: 'none', cursor: 'pointer', fontSize: '14px', opacity: 0.6 },
  primaryButton: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '14px 24px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer', display: 'inline-block', textAlign: 'center' },
  clearBtn: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', marginTop: '20px', fontWeight: 'bold', padding: '10px 0' }
};

export default Cart;