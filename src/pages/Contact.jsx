// src/pages/Contact.jsx
import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    subject: 'Consulta General', 
    message: '' 
  });
  
  const [showModal, setShowModal] = useState(false);

  // Lógica para el botón ROSADO (Enviar por Correo Gmail Web)
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    
    // Usamos \n reales, la función encodeURIComponent los transformará correctamente para la URL
    const emailBody = `Hola Loto Aura,\n\nMi nombre es ${formData.name}.\nMi correo de contacto es: ${formData.email}\n\nHe escrito el siguiente mensaje:\n${formData.message}\n\nQuedo atento a su respuesta.`;
    
    const storeEmail = "alejandroterceros05@gmail.com";
    
    // Codificamos obligatoriamente el asunto y el mensaje para que el navegador no corte la URL
    const subjectEncoded = encodeURIComponent(formData.subject);
    const bodyEncoded = encodeURIComponent(emailBody);
    
    // Utilizamos la URL directa de redacción de Gmail (Compose) en lugar de mailto para evitar bloqueos del sistema operativo
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${storeEmail}&su=${subjectEncoded}&body=${bodyEncoded}`;
    
    // Abre Gmail prellenado en una nueva pestaña
    window.open(gmailUrl, '_blank');
    
    // Mostramos el mensaje de éxito propio y limpiamos el formulario
    setShowModal(true);
    setFormData({ name: '', email: '', subject: 'Consulta General', message: '' });
  };

  // Lógica para el botón VERDE (Enviar por WhatsApp)
  const handleWhatsApp = () => {
    let whatsappText = "Hola Loto Aura, me gustaría hacer una consulta.";
    
    // Si el usuario llenó su nombre o mensaje antes de tocar el botón verde, lo concatenamos
    if (formData.name || formData.message) {
      whatsappText = `Hola Loto Aura, soy ${formData.name || 'un cliente'}.\n${formData.message || 'Quisiera más información.'}`;
    }
    
    // Es vital el encodeURIComponent aquí también para que WhatsApp web no corte el texto en el primer espacio
    const waUrl = `https://wa.me/59179960163?text=${encodeURIComponent(whatsappText)}`;
    
    window.open(waUrl, '_blank');
  };

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh', display: 'flex', gap: '40px', flexWrap: 'wrap', alignItems: 'flex-start' }}>
      
      {/* Columna Izquierda: Información y Botón Verde */}
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h2 style={{ fontSize: '36px', color: 'var(--text-dark)', marginBottom: '15px' }}>Contáctanos</h2>
        <p style={{ color: 'var(--text-light)', marginBottom: '30px', fontSize: '16px', lineHeight: '1.6' }}>
          ¿Tienes alguna pregunta? Estamos aquí para ayudarte a expresar tus emociones a través de nuestros diseños florales.
        </p>
        
        <div style={styles.infoCard}>
          <div style={styles.icon}>📞</div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-dark)' }}>Teléfono / WhatsApp</h4>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>+591 79960163</p>
          </div>
        </div>

        <div style={styles.infoCard}>
          <div style={styles.icon}>✉️</div>
          <div>
            <h4 style={{ margin: 0, color: 'var(--text-dark)' }}>Email</h4>
            <p style={{ margin: 0, color: 'var(--text-light)' }}>alejandroterceros05@gmail.com</p>
          </div>
        </div>

        <button type="button" onClick={handleWhatsApp} style={styles.waButton}>
          <span style={{ fontSize: '20px' }}>💬</span> Escríbenos por WhatsApp
        </button>
      </div>

      {/* Columna Derecha: Formulario y Botón Rosado */}
      <div style={{ flex: 1, minWidth: '300px', backgroundColor: '#fdf2f8', padding: '40px', borderRadius: '16px', border: '1px solid #fce7f3' }}>
        <h3 style={{ marginBottom: '25px', color: 'var(--text-dark)' }}>Envíanos un Mensaje</h3>
        
        <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <input 
            required 
            type="text" 
            placeholder="Tu nombre" 
            value={formData.name} 
            onChange={e => setFormData({...formData, name: e.target.value})} 
            style={styles.input} 
          />
          
          <input 
            required 
            type="email" 
            placeholder="Tu email" 
            value={formData.email} 
            onChange={e => setFormData({...formData, email: e.target.value})} 
            style={styles.input} 
          />
          
          <select 
            value={formData.subject} 
            onChange={e => setFormData({...formData, subject: e.target.value})} 
            style={styles.input}
          >
            <option value="Consulta General">Consulta General</option>
            <option value="Seguimiento de Pedido">Seguimiento de Pedido</option>
            <option value="Eventos Especiales">Cotización Eventos Especiales</option>
            <option value="Reclamos">Sugerencias o Reclamos</option>
          </select>
          
          <textarea 
            required 
            rows="5" 
            placeholder="Escribe tu mensaje aquí..." 
            value={formData.message} 
            onChange={e => setFormData({...formData, message: e.target.value})} 
            style={{...styles.input, resize: 'vertical'}}
          ></textarea>
          
          <button type="submit" style={styles.submitBtn}>
            Enviar Mensaje (Vía Gmail)
          </button>
        </form>
      </div>

      {/* Modal Custom de Confirmación */}
      {showModal && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modalBox} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: '50px', marginBottom: '10px' }}>💌</div>
            <h3 style={{ color: 'var(--primary-pink)', marginBottom: '10px' }}>¡Listo para enviar!</h3>
            <p style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>
              Se ha abierto Gmail en una nueva pestaña con tu mensaje perfectamente armado. Solo revisa y presiona enviar.
            </p>
            <button onClick={() => setShowModal(false)} style={styles.submitBtn}>
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  infoCard: { display: 'flex', alignItems: 'center', gap: '20px', padding: '20px', border: '1px solid #eaeaea', borderRadius: '12px', marginBottom: '15px', backgroundColor: 'white' },
  icon: { fontSize: '28px', backgroundColor: '#fdf2f8', width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%' },
  input: { padding: '15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none', width: '100%', fontSize: '15px', boxSizing: 'border-box' },
  
  // Botón Rosado
  submitBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '16px', transition: 'background-color 0.3s' },
  
  // Botón Verde
  waButton: { backgroundColor: '#25D366', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', marginTop: '20px', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', fontSize: '16px', transition: 'background-color 0.3s' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  modalBox: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', textAlign: 'center', maxWidth: '350px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', animation: 'fadeIn 0.3s ease-out' }
};

export default Contact;