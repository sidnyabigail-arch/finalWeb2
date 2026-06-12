// src/pages/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: 'Consulta General', message: '' });
  const [showModal, setShowModal] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // En lugar del alert nativo, usamos nuestro modal de estado
    setShowModal(true);
    setFormData({ name: '', email: '', subject: 'Consulta General', message: '' });
  };

  const handleWhatsApp = () => {
    // Redirección a WhatsApp con tu número
    const url = "https://wa.me/59179960163?text=Hola%20Loto%20Aura,%20necesito%20ayuda%20con...";
    window.open(url, '_blank');
  };

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh', display: 'flex', gap: '40px', flexWrap: 'wrap' }}>
      
      {/* Columna de Información */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '20px' }}>Contáctanos</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '30px' }}>¿Tienes alguna pregunta? Estamos aquí para ayudarte a expresar tus emociones.</p>
        
        <div style={styles.infoCard}>
          <div style={styles.icon}>📞</div>
          <div>
            <h4 style={{ margin: 0 }}>Teléfono / WhatsApp</h4>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>+591 79960163</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.icon}>✉️</div>
          <div>
            <h4 style={{ margin: 0 }}>Email</h4>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>contacto@lotoaura.com</p>
          </div>
        </div>

        <button onClick={handleWhatsApp} style={styles.waButton}>
          Escríbenos por WhatsApp
        </button>
      </div>

      {/* Formulario de Contacto */}
      <div style={{ flex: 1, minWidth: '300px', backgroundColor: 'var(--light-pink)', padding: '30px', borderRadius: '16px' }}>
        <h3 style={{ marginBottom: '20px' }}>Envíanos un Mensaje</h3>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <input required type="text" placeholder="Tu nombre" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} />
          <input required type="email" placeholder="Tu email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={styles.input} />
          <select value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} style={styles.input}>
            <option>Consulta General</option>
            <option>Seguimiento de Pedido</option>
            <option>Eventos Especiales</option>
          </select>
          <textarea required rows="4" placeholder="Escribe tu mensaje aquí..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} style={styles.input}></textarea>
          <button type="submit" style={styles.submitBtn}>Enviar Mensaje</button>
        </form>
      </div>

      {/* Custom Modal de Confirmación (Reemplazo de alert) */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalBox}>
            <h3 style={{ color: 'var(--primary-pink)' }}>¡Mensaje Enviado!</h3>
            <p>Hemos recibido tu consulta. Te responderemos pronto.</p>
            <button onClick={() => setShowModal(false)} style={styles.submitBtn}>Cerrar</button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  infoCard: { display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '15px' },
  icon: { fontSize: '24px', backgroundColor: '#fde8f2', padding: '10px', borderRadius: '50%' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', width: '100%' },
  submitBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '10px' },
  waButton: { backgroundColor: '#25D366', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '16px' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modalBox: { backgroundColor: 'white', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '300px' }
};

export default Contact;