// src/pages/Services.jsx
import React from 'react';

const Services = () => {
  const servicesList = [
    { icon: '🚚', title: 'Entrega a Domicilio', desc: 'Entregas rápidas y seguras en toda la ciudad.' },
    { icon: '🎉', title: 'Eventos Especiales', desc: 'Decoración para bodas, quinceaños y aniversarios.' },
    { icon: '🍫', title: 'Personalización', desc: 'Agrega chocolates, globos y tarjetas a tu arreglo.' },
    { icon: '🏢', title: 'Adorna tu Negocio', desc: 'Decoración floral corporativa profesional.' }
  ];

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h2 style={{ fontSize: '32px', color: 'var(--text-dark)' }}>Nuestros Servicios</h2>
        <p style={{ color: 'var(--text-light)' }}>Soluciones integrales para todas tus necesidades florales.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px' }}>
        {servicesList.map((srv, idx) => (
          <div key={idx} style={{ padding: '30px', textAlign: 'center', border: '1px solid #eaeaea', borderRadius: '16px', backgroundColor: 'white', transition: 'box-shadow 0.3s' }} onMouseOver={e => e.currentTarget.style.boxShadow = '0 10px 20px rgba(0,0,0,0.05)'} onMouseOut={e => e.currentTarget.style.boxShadow = 'none'}>
            <div style={{ fontSize: '40px', marginBottom: '20px' }}>{srv.icon}</div>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '15px' }}>{srv.title}</h3>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.5' }}>{srv.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
export default Services;