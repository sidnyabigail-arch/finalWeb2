// src/pages/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../assets/logo.png'; // Importamos el logo

const Home = () => {
  return (
    <div style={styles.heroSection}>
      <div className="container" style={styles.heroContent}>
        <div style={styles.textContent}>
          <h4 style={styles.subtitle}>Sistema de E-commerce Integral</h4>
          <h1 style={styles.title}>
            Flores que expresan <span style={{ color: 'var(--primary-pink)' }}>tus emociones</span>
          </h1>
          <p style={styles.description}>
            Descubre arreglos florales únicos para cada ocasión especial. Entregas a domicilio, personalización y decoración de eventos.
          </p>
          <div style={styles.buttonGroup}>
            <Link to="/catalogo" style={styles.primaryButton}>
              Explorar Catálogo
            </Link>
            <Link to="/servicios" style={styles.secondaryButton}>
              Eventos Especiales
            </Link>
          </div>
        </div>
        
        {/* Imagen Principal (Logo) */}
        <div style={styles.imageContent}>
          <img 
            src={logoImg} 
            alt="Loto Aura Logo Principal" 
            style={styles.mainImage} 
          />
        </div>
      </div>
    </div>
  );
};

const styles = {
  heroSection: { backgroundColor: 'var(--light-pink)', padding: '60px 0', minHeight: '80vh', display: 'flex', alignItems: 'center' },
  heroContent: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '40px', flexWrap: 'wrap' },
  textContent: { flex: '1', minWidth: '300px' },
  subtitle: { color: 'var(--text-light)', fontSize: '14px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '10px' },
  title: { fontSize: '48px', fontWeight: '700', lineHeight: '1.2', marginBottom: '20px', color: 'var(--text-dark)' },
  description: { fontSize: '16px', color: 'var(--text-light)', marginBottom: '30px', lineHeight: '1.6', maxWidth: '500px' },
  buttonGroup: { display: 'flex', gap: '15px' },
  primaryButton: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', boxShadow: '0 4px 14px rgba(213, 63, 140, 0.4)' },
  secondaryButton: { backgroundColor: 'white', color: 'var(--text-dark)', padding: '12px 24px', borderRadius: '8px', fontWeight: '500', border: '1px solid #eaeaea' },
  imageContent: { flex: '1', display: 'flex', justifyContent: 'center', minWidth: '300px' },
  mainImage: { width: '100%', maxWidth: '450px', height: 'auto', objectFit: 'contain', filter: 'drop-shadow(0px 10px 20px rgba(0,0,0,0.05))' }
};

export default Home;