// src/pages/ClientHistory.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { ref, get, update } from 'firebase/database';
import Modal from '../component/Modal';

const ClientHistory = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  const [cancelModal, setCancelModal] = useState({ isOpen: false, orderId: null });

  useEffect(() => {
    if (currentUser) fetchUserOrders();
  }, [currentUser]);

  const fetchUserOrders = async () => {
    const ordersSnap = await get(ref(db, 'orders'));
    if (ordersSnap.exists()) {
      const allOrders = Object.keys(ordersSnap.val()).map(key => ({ id: key, ...ordersSnap.val()[key] }));
      const myOrders = allOrders.filter(o => o.userId === currentUser.uid).reverse();
      setOrders(myOrders);
    }
  };

  const handleCancelOrder = async () => {
    try {
      await update(ref(db, `orders/${cancelModal.orderId}`), { status: 'Cancelado' });
      setCancelModal({ isOpen: false, orderId: null });
      fetchUserOrders();
    } catch (error) {
      console.error("Error al cancelar:", error);
    }
  };

  // Filtrado Avanzado con Corrección de Zona Horaria
  const filteredOrders = orders.filter(o => {
    // 1. Convertir la fecha global a fecha local (YYYY-MM-DD) para que el filtro no falle
    const dateObj = new Date(o.createdAt);
    const localOrderDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
    
    const matchSearch = o.id.includes(searchTerm) || o.status.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDate = filterDate ? localOrderDate === filterDate : true;
    
    return matchSearch && matchDate;
  });

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <h2 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>Mi Historial de Compras</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Revisa el estado, detalle y ubicación de todos tus pedidos.</p>

      {/* Controles de Filtro Mejorados */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input 
          type="text" placeholder="Buscar por ID o estado..." 
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} 
          style={{ flex: 1, minWidth: '200px', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}
        />
        <input 
          type="date" 
          value={filterDate} onChange={(e) => setFilterDate(e.target.value)} 
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', cursor: 'pointer' }}
          title="Filtrar por fecha exacta"
        />
        {/* Botón X para limpiar filtros si hay algo escrito */}
        {(searchTerm || filterDate) && (
          <button 
            onClick={() => {setSearchTerm(''); setFilterDate('');}} 
            style={{ padding: '12px 15px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold' }}
            title="Limpiar filtros"
          >
            ✖
          </button>
        )}
      </div>

      {orders.length === 0 ? (
        <div style={{ padding: '40px', textAlign: 'center', backgroundColor: 'var(--light-pink)', borderRadius: '12px' }}>
          No tienes pedidos registrados aún.
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '15px' }}>
          {filteredOrders.map(order => (
            <div key={order.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px', backgroundColor: 'white', border: '1px solid #eee', borderRadius: '12px', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--text-dark)' }}>Pedido: {order.id}</p>
                <p style={{ margin: '5px 0 0 0', fontSize: '14px', color: 'var(--text-light)' }}>Fecha: {new Date(order.createdAt).toLocaleDateString()}</p>
              </div>
              
              <div style={{ textAlign: 'center', flex: 1 }}>
                <span style={{ 
                  backgroundColor: order.status === 'Entregado' ? '#dcfce7' : order.status === 'Cancelado' ? '#fee2e2' : '#fef9c3', 
                  color: order.status === 'Entregado' ? '#166534' : order.status === 'Cancelado' ? '#b91c1c' : '#854d0e', 
                  padding: '6px 12px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' 
                }}>
                  {order.status}
                </span>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setSelectedOrder(order)} style={{ background: '#e0f2fe', color: '#0369a1', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                  Ver Detalle
                </button>
                {order.status === 'Pendiente' && (
                  <button onClick={() => setCancelModal({ isOpen: true, orderId: order.id })} style={{ background: '#fee2e2', color: '#b91c1c', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
                    Cancelar Pedido
                  </button>
                )}
              </div>
            </div>
          ))}
          {filteredOrders.length === 0 && <p style={{textAlign: 'center', color: 'var(--text-light)', padding: '20px'}}>No se encontraron pedidos con esos filtros.</p>}
        </div>
      )}

      {/* Modal de Detalle Completo */}
      <Modal isOpen={!!selectedOrder} onClose={() => setSelectedOrder(null)} title="Detalle del Pedido">
        {selectedOrder && (
          <div>
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '200px' }}>
                <h4 style={{ marginBottom: '15px', color: 'var(--primary-pink)' }}>Datos de Entrega</h4>
                <p><b>Dirección:</b> {selectedOrder.customerInfo.address}</p>
                <p><b>Fecha acordada:</b> {selectedOrder.customerInfo.deliveryDate} a las {selectedOrder.customerInfo.deliveryTime}</p>
                {selectedOrder.customerInfo.coordinates && (
                  <p style={{ marginTop: '10px' }}>
                    <a href={`https://www.google.com/maps?q=${selectedOrder.customerInfo.coordinates.lat},${selectedOrder.customerInfo.coordinates.lng}`} target="_blank" rel="noreferrer" style={{ color: '#0369a1', fontWeight: 'bold', textDecoration: 'underline' }}>
                      📍 Ver ubicación en el Mapa
                    </a>
                  </p>
                )}
              </div>
              
              {selectedOrder.payment && (
                <div style={{ flex: 1, minWidth: '150px', backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px', color: 'var(--text-dark)' }}>Pago: {selectedOrder.payment.method.toUpperCase()}</h4>
                  {selectedOrder.payment.method === 'qr' && selectedOrder.payment.receipt ? (
                     <img src={selectedOrder.payment.receipt} alt="Comprobante" style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', borderRadius: '8px', border: '1px solid #ddd' }} />
                  ) : selectedOrder.payment.method === 'tarjeta' ? (
                    <div>
                      <p style={{ fontSize: '14px', margin: '5px 0' }}>Tarjeta: **** {selectedOrder.payment.cardLast4}</p>
                      <p style={{ fontSize: '14px', margin: '5px 0' }}>Titular: {selectedOrder.payment.cardName}</p>
                      <span style={{ color: '#166534', fontWeight: 'bold', fontSize: '12px', display: 'block', marginTop: '10px' }}>✓ Procesado</span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            <h4 style={{ margin: '20px 0 15px 0', color: 'var(--primary-pink)', borderTop: '1px solid #eee', paddingTop: '15px' }}>Tus Productos</h4>
            <ul style={{ paddingLeft: '20px' }}>
              {selectedOrder.items.map((it, i) => (
                <li key={i} style={{ marginBottom: '5px' }}>{it.quantity}x {it.name} - Bs. {it.price * it.quantity}</li>
              ))}
            </ul>
            <h3 style={{ textAlign: 'right', marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '10px' }}>
              Total Abonado: Bs. {selectedOrder.total}
            </h3>
          </div>
        )}
      </Modal>

      {/* Modal Customizado para Cancelar */}
      {cancelModal.isOpen && (
        <div style={styles.customConfirmOverlay}>
          <div style={styles.customConfirmBox}>
            <h3 style={{ color: '#b91c1c', marginBottom: '15px' }}>⚠️ Cancelar Pedido</h3>
            <p>¿Estás seguro de que deseas cancelar este pedido? Se notificará a la florería de inmediato.</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '25px' }}>
              <button onClick={() => setCancelModal({ isOpen: false, orderId: null })} style={styles.cancelBtn}>No, mantener pedido</button>
              <button onClick={handleCancelOrder} style={styles.confirmDangerBtn}>Sí, cancelar pedido</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  customConfirmOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  customConfirmBox: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '380px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#4b5563', cursor: 'pointer' },
  confirmDangerBtn: { flex: 1, padding: '12px', background: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: 'white', cursor: 'pointer' }
};

export default ClientHistory;