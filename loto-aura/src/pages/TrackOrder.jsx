// src/pages/TrackOrder.jsx
import React, { useState } from 'react';
import { db } from '../services/firebase';
import { ref, get } from 'firebase/database';

const TrackOrder = () => {
  const [orderId, setOrderId] = useState('');
  const [orderData, setOrderData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return setErrorMsg('Ingresa un número de pedido válido.');

    setLoading(true);
    setErrorMsg('');
    setOrderData(null);

    try {
      const orderRef = ref(db, `orders/${orderId.trim()}`);
      const snapshot = await get(orderRef);
      if (snapshot.exists()) setOrderData(snapshot.val());
      else setErrorMsg('No se encontró ningún pedido con ese código.');
    } catch (error) {
      setErrorMsg('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  // Función para determinar qué paso de la línea de tiempo está activo
  const getStepStatus = (stepName) => {
    if (!orderData) return false;
    const status = orderData.status;
    if (status === 'Cancelado') return false;
    
    if (stepName === 'Pendiente') return true; // Siempre activo si existe
    if (stepName === 'En Proceso' && (status === 'En Proceso' || status === 'Entregado')) return true;
    if (stepName === 'Entregado' && status === 'Entregado') return true;
    
    return false;
  };

  return (
    <div className="container" style={{ padding: '60px 20px', maxWidth: '700px', margin: '0 auto', minHeight: '70vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', color: 'var(--text-dark)' }}>Rastrear tu Pedido</h2>
        <p style={{ color: 'var(--text-light)' }}>Sigue el viaje de tus flores en tiempo real.</p>
      </div>

      <form onSubmit={handleTrack} style={{ display: 'flex', gap: '10px', marginBottom: '40px' }}>
        <input type="text" placeholder="Ej: -Oue0vIrUPtjgPk7Tk95" value={orderId} onChange={(e) => setOrderId(e.target.value)} style={{ flex: 1, padding: '15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '16px', outline: 'none' }} />
        <button type="submit" style={styles.trackBtn} disabled={loading}>{loading ? 'Buscando...' : 'Rastrear'}</button>
      </form>

      {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</div>}

      {orderData && (
        <div style={{ animation: 'fadeIn 0.5s ease-out' }}>
          
          {/* LÍNEA DE TIEMPO VISUAL */}
          {orderData.status === 'Cancelado' ? (
            <div style={{ backgroundColor: '#fee2e2', padding: '20px', borderRadius: '12px', textAlign: 'center', color: '#b91c1c', marginBottom: '30px' }}>
              <h2>🚫 Pedido Cancelado</h2>
              <p>Este pedido ha sido anulado. Contáctanos si crees que es un error.</p>
            </div>
          ) : (
            <div style={styles.timelineContainer}>
              <div style={{...styles.step, opacity: getStepStatus('Pendiente') ? 1 : 0.4}}>
                <div style={{...styles.circle, backgroundColor: getStepStatus('Pendiente') ? 'var(--primary-pink)' : '#ddd'}}>📋</div>
                <p style={styles.stepText}>Recibido</p>
              </div>
              <div style={{...styles.line, backgroundColor: getStepStatus('En Proceso') ? 'var(--primary-pink)' : '#ddd'}}></div>
              
              <div style={{...styles.step, opacity: getStepStatus('En Proceso') ? 1 : 0.4}}>
                <div style={{...styles.circle, backgroundColor: getStepStatus('En Proceso') ? 'var(--primary-pink)' : '#ddd'}}>💐</div>
                <p style={styles.stepText}>Preparando</p>
              </div>
              <div style={{...styles.line, backgroundColor: getStepStatus('Entregado') ? 'var(--primary-pink)' : '#ddd'}}></div>
              
              <div style={{...styles.step, opacity: getStepStatus('Entregado') ? 1 : 0.4}}>
                <div style={{...styles.circle, backgroundColor: getStepStatus('Entregado') ? '#16a34a' : '#ddd'}}>🚚</div>
                <p style={{...styles.stepText, color: getStepStatus('Entregado') ? '#16a34a' : 'var(--text-light)'}}>Entregado</p>
              </div>
            </div>
          )}

          {/* DETALLE DEL PEDIDO RASTREADO */}
          <div style={{ border: '1px solid #eee', borderRadius: '12px', padding: '25px', backgroundColor: 'white', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <h3 style={{ borderBottom: '1px solid #eee', paddingBottom: '10px', color: 'var(--text-dark)' }}>Detalles de la Orden</h3>
            <p style={{ margin: '10px 0' }}><b>Recibe:</b> {orderData.customerInfo.fullName}</p>
            <p style={{ margin: '10px 0' }}><b>Dirección:</b> {orderData.customerInfo.address}</p>
            <p style={{ margin: '10px 0' }}><b>Fecha de Entrega:</b> {orderData.customerInfo.deliveryDate}</p>
            
            <h4 style={{ marginTop: '20px', color: 'var(--primary-pink)' }}>Productos Adquiridos:</h4>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-light)' }}>
              {orderData.items.map((item, index) => <li key={index}>{item.quantity}x {item.name}</li>)}
            </ul>
            <h3 style={{ textAlign: 'right', marginTop: '20px', color: 'var(--text-dark)' }}>Total: Bs. {orderData.total}</h3>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  trackBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '0 30px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' },
  timelineContainer: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #eee' },
  step: { display: 'flex', flexDirection: 'column', alignItems: 'center', width: '80px', zIndex: 2 },
  circle: { width: '50px', height: '50px', borderRadius: '50%', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', transition: 'background-color 0.4s' },
  stepText: { marginTop: '10px', fontWeight: 'bold', color: 'var(--text-dark)', fontSize: '14px' },
  line: { flex: 1, height: '4px', margin: '0 -20px', zIndex: 1, transition: 'background-color 0.4s', transform: 'translateY(-15px)' }
};

export default TrackOrder;