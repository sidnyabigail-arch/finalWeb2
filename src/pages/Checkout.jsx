import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ref, push, set, update } from 'firebase/database';
import { db } from '../services/firebase';

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

import successVideo from '../assets/confirmacion.mp4'; 
import qrImage from '../assets/qr.jpg'; 

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

// Sucursal Centro Cochabamba (Av Ayacucho y Heroinas)
const STORE_COORDS = { lat: -17.392721, lng: -66.159067 };

// Fórmula Haversine para calcular Kilómetros
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; 
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c; 
};

const LocationMarker = ({ position, setPosition }) => {
  useMapEvents({ click(e) { setPosition(e.latlng); } });
  return position === null ? null : <Marker position={position}></Marker>;
};

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const { currentUser, userData } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState(null);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccess, setShowSuccess] = useState({ isOpen: false, orderId: '', waUrl: '' });

  const [shippingData, setShippingData] = useState({ fullName: userData?.name || '', phone: '', address: '', deliveryDate: '', deliveryTime: '', specialInstructions: '' });
  const [paymentMethod, setPaymentMethod] = useState('qr');
  const [receiptImage, setReceiptImage] = useState('');
  const [cardData, setCardData] = useState({ number: '', name: '', expiry: '', cvv: '' });

  useEffect(() => {
    if (position) {
      const distance = calculateDistance(STORE_COORDS.lat, STORE_COORDS.lng, position.lat, position.lng);
      // Costo de entrega: 10 Bs base + 3 Bs por kilómetro
      const calculatedFee = 10 + Math.round(distance * 3);
      setDeliveryFee(calculatedFee);
    }
  }, [position]);

  const handleChange = (e) => setShippingData({ ...shippingData, [e.target.name]: e.target.value });
  const handleCardChange = (e) => setCardData({ ...cardData, [e.target.name]: e.target.value });

  const handleReceiptUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if(file.size > 2000000) return setErrorMsg("El comprobante es muy pesado (Máx 2MB).");
      setErrorMsg('');
      const reader = new FileReader();
      reader.onloadend = () => setReceiptImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (cart.length === 0) return;
    if (!position) return setErrorMsg("Debes marcar la ubicación en el mapa para calcular el envío.");
    if (paymentMethod === 'qr' && !receiptImage) return setErrorMsg("Sube el comprobante del QR.");
    if (paymentMethod === 'tarjeta' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv)) return setErrorMsg("Completa los datos de la tarjeta.");
    
    setLoading(true);
    try {
      let paymentInfo = { method: paymentMethod };
      if (paymentMethod === 'qr') paymentInfo.receipt = receiptImage;
      else {
        paymentInfo.cardLast4 = cardData.number.slice(-4);
        paymentInfo.cardName = cardData.name;
        paymentInfo.status = "Pagado con Tarjeta";
      }

      const finalTotal = getCartTotal() + deliveryFee;

      const orderData = {
        userId: currentUser.uid,
        customerInfo: { ...shippingData, coordinates: { lat: position.lat, lng: position.lng }, deliveryFee },
        payment: paymentInfo,
        items: cart,
        total: finalTotal,
        status: 'Pendiente',
        createdAt: new Date().toISOString()
      };

      const ordersRef = ref(db, 'orders');
      const newOrderRef = push(ordersRef);
      await set(newOrderRef, orderData);

      // Descontar Stock en Firebase
      cart.forEach(async (item) => {
        if(item.stock) {
           await update(ref(db, `products/${item.id}`), { stock: item.stock - item.quantity });
        }
      });

      const mapLink = `https://www.google.com/maps?q=${position.lat},${position.lng}`;
      let itemsText = cart.map(i => `${i.quantity}x ${i.name}`).join('%0A- ');
      let paymentText = paymentMethod === 'qr' ? 'Transferencia QR' : `Tarjeta (*${paymentInfo.cardLast4})`;
      
      const waMessage = `🌸 *NUEVO PEDIDO LOTO AURA* 🌸%0A%0A*ID:* ${newOrderRef.key.substring(1,8)}%0A*Cliente:* ${shippingData.fullName}%0A*Tel:* ${shippingData.phone}%0A%0A*💰 PAGO:*%0A*Subtotal:* Bs. ${getCartTotal()}%0A*Envío:* Bs. ${deliveryFee}%0A*Total Pagado:* Bs. ${finalTotal}%0A*Método:* ${paymentText}%0A%0A*📦 PRODUCTOS:*%0A- ${itemsText}%0A%0A*🚚 ENTREGA:*%0A*Fecha:* ${shippingData.deliveryDate} a las ${shippingData.deliveryTime}%0A*Dirección:* ${shippingData.address}%0A*📍 GPS:* ${mapLink}%0A*Notas:* ${shippingData.specialInstructions || 'Ninguna'}`;
      const finalWaUrl = `https://wa.me/59179960163?text=${waMessage}`;

      clearCart();
      setShowSuccess({ isOpen: true, orderId: newOrderRef.key, waUrl: finalWaUrl });

    } catch (error) {
      setErrorMsg("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // BLOQUEO A USUARIOS INVITADOS
  if (!currentUser) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 20px', minHeight: '60vh' }}>
        <h2 style={{ color: 'var(--primary-pink)', marginBottom: '15px' }}>Inicia sesión para continuar</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>Para garantizar la seguridad de tu compra y poder rastrear tu pedido, necesitas tener una cuenta.</p>
        <Link to="/login" style={{ backgroundColor: 'var(--primary-pink)', color: 'white', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold' }}>
          Ir a Iniciar Sesión / Registrarse
        </Link>
      </div>
    );
  }

  if (cart.length === 0 && !showSuccess.isOpen) return <div style={{textAlign:'center', padding:'50px'}}>No hay productos para procesar.</div>;

  return (
    <div className="container" style={{ padding: '40px 20px' }}>
      <h2 style={{ color: 'var(--text-dark)', marginBottom: '30px' }}>Finalizar Compra</h2>
      
      <div style={styles.layout}>
        <div style={styles.formSection}>
          <form onSubmit={handleSubmitOrder} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            <div style={styles.cardBlock}>
              <h3 style={styles.blockTitle}>1. Datos de Entrega</h3>
              <div style={styles.inputGroup}>
                <label style={styles.label}>Nombre de quien recibe</label>
                <input required type="text" name="fullName" value={shippingData.fullName} onChange={handleChange} style={styles.input} />
              </div>
              <div style={{ display: 'flex', gap: '15px', marginTop: '10px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '200px', ...styles.inputGroup }}>
                  <label style={styles.label}>Teléfono de contacto</label>
                  <input required type="tel" name="phone" value={shippingData.phone} onChange={handleChange} style={styles.input} />
                </div>
                <div style={{ flex: 1, minWidth: '200px', ...styles.inputGroup }}>
                  <label style={styles.label}>Dirección textual</label>
                  <input required type="text" name="address" value={shippingData.address} onChange={handleChange} style={styles.input} />
                </div>
              </div>

              <div style={{ ...styles.inputGroup, marginTop: '15px' }}>
                <label style={{...styles.label, color: 'var(--primary-pink)', fontWeight: 'bold'}}>📍 Selecciona en el mapa para calcular el costo de envío</label>
                <div style={{ height: '300px', width: '100%', borderRadius: '12px', overflow: 'hidden', border: '2px solid #eaeaea' }}>
                  <MapContainer center={[STORE_COORDS.lat, STORE_COORDS.lng]} zoom={14} style={{ height: '100%', width: '100%' }}>
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <Marker position={[STORE_COORDS.lat, STORE_COORDS.lng]} opacity={0.5} title="Nuestra Tienda" />
                    <LocationMarker position={position} setPosition={setPosition} />
                  </MapContainer>
                </div>
                {position && <span style={{fontSize: '12px', color: '#16a34a'}}>✓ Tarifa de envío calculada según distancia.</span>}
              </div>

              <div style={{ display: 'flex', gap: '15px', marginTop: '15px', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: '150px', ...styles.inputGroup }}>
                  <label style={styles.label}>Fecha de entrega</label>
                  <input required type="date" name="deliveryDate" value={shippingData.deliveryDate} onChange={handleChange} style={styles.input} />
                </div>
                <div style={{ flex: 1, minWidth: '150px', ...styles.inputGroup }}>
                  <label style={styles.label}>Hora aproximada</label>
                  <input required type="time" name="deliveryTime" value={shippingData.deliveryTime} onChange={handleChange} style={styles.input} />
                </div>
              </div>
            </div>

            <div style={styles.cardBlock}>
              <h3 style={styles.blockTitle}>2. Método de Pago</h3>
              <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="radio" value="qr" checked={paymentMethod === 'qr'} onChange={(e) => setPaymentMethod(e.target.value)} /> Transferencia QR
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                  <input type="radio" value="tarjeta" checked={paymentMethod === 'tarjeta'} onChange={(e) => setPaymentMethod(e.target.value)} /> Tarjeta de Crédito/Débito
                </label>
              </div>

              {paymentMethod === 'qr' && (
                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px dashed #ccc', textAlign: 'center' }}>
                  <img src={qrImage} alt="QR de Pago" style={{ width: '200px', height: '200px', objectFit: 'contain', borderRadius: '12px', margin: '0 auto 15px', display: 'block', border: '2px solid #eaeaea' }} />
                  <div style={{ textAlign: 'left', marginTop: '20px' }}>
                    <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px', color: 'var(--primary-pink)' }}>Sube tu comprobante (Obligatorio)</label>
                    <input type="file" accept="image/*" onChange={handleReceiptUpload} style={{ fontSize: '14px', width: '100%' }} />
                  </div>
                </div>
              )}

              {paymentMethod === 'tarjeta' && (
                <div style={{ backgroundColor: '#f9fafb', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input type="text" name="number" placeholder="Número de Tarjeta" maxLength="19" value={cardData.number} onChange={handleCardChange} style={styles.input} />
                    <input type="text" name="name" placeholder="Nombre del Titular" value={cardData.name} onChange={handleCardChange} style={styles.input} />
                    <div style={{ display: 'flex', gap: '15px' }}>
                      <input type="text" name="expiry" placeholder="MM/AA" maxLength="5" value={cardData.expiry} onChange={handleCardChange} style={{...styles.input, flex: 1}} />
                      <input type="text" name="cvv" placeholder="CVV" maxLength="4" value={cardData.cvv} onChange={handleCardChange} style={{...styles.input, flex: 1}} />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '15px', borderRadius: '8px', textAlign: 'center', fontWeight: 'bold' }}>{errorMsg}</div>}

            <button type="submit" style={styles.submitBtn} disabled={loading}>
              {loading ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>

        <div style={styles.summarySection}>
          <h3 style={{ marginBottom: '20px' }}>Resumen</h3>
          {cart.map(item => (
            <div key={item.id} style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'14px' }}>
              <span>{item.quantity}x {item.name}</span>
              <span>Bs. {item.price * item.quantity}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px', fontSize:'14px', color: '#666' }}>
            <span>Costo de Envío (Distancia)</span>
            <span>Bs. {deliveryFee}</span>
          </div>
          <hr style={{ margin: '15px 0', borderTop: '1px solid #ddd' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', color: 'var(--primary-pink)' }}>
            <span>Total a Pagar</span>
            <span>Bs. {getCartTotal() + deliveryFee}</span>
          </div>
        </div>
      </div>

      {showSuccess.isOpen && (
        <div style={styles.videoOverlay}>
          <div style={styles.videoBox}>
            <video src={successVideo} autoPlay loop playsInline style={styles.videoElement} />
            <div style={styles.videoContent}>
              <h2 style={{ color: 'var(--primary-pink)', marginBottom: '10px' }}>¡Pago Exitoso!</h2>
              <p style={{ fontWeight: 'bold', fontSize: '18px', margin: '10px 0', backgroundColor: '#fdf2f8', padding: '10px', borderRadius: '8px' }}>{showSuccess.orderId}</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '15px' }}>
                <a href={showSuccess.waUrl} target="_blank" rel="noreferrer" style={{...styles.submitBtn, backgroundColor: '#25D366', textDecoration: 'none', display: 'block'}}>Enviar a WhatsApp</a>
                <button onClick={() => { setShowSuccess({ isOpen: false, orderId: '', waUrl: '' }); navigate('/mis-pedidos'); }} style={{...styles.submitBtn, backgroundColor: '#f3f4f6', color: '#4b5563'}}>Ir a Mis Pedidos</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  layout: { display: 'flex', gap: '40px', flexWrap: 'wrap' },
  formSection: { flex: '2', minWidth: '300px' },
  cardBlock: { backgroundColor: 'white', padding: '25px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', marginBottom: '20px' },
  blockTitle: { borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px', color: 'var(--text-dark)' },
  summarySection: { flex: '1', minWidth: '300px', backgroundColor: 'var(--light-pink)', padding: '30px', borderRadius: '12px', height: 'fit-content', position: 'sticky', top: '100px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '5px' },
  label: { fontSize: '14px', color: 'var(--text-light)', fontWeight: 'bold' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', outline: 'none' },
  submitBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '15px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', width: '100%', textAlign: 'center' },
  videoOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  videoBox: { backgroundColor: 'white', borderRadius: '16px', width: '90%', maxWidth: '400px', overflow: 'hidden', textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.4)' },
  videoElement: { width: '100%', height: '220px', objectFit: 'cover' },
  videoContent: { padding: '25px' }
};

export default Checkout;