// src/pages/Meanings.jsx
import React, { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { ref, get, push } from 'firebase/database';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Solución al bug de iconos de Leaflet en React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl: markerIcon2x, iconUrl: markerIcon, shadowUrl: markerShadow });

const Meanings = () => {
  const [activeTab, setActiveTab] = useState('guia');
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuides();
  }, []);

  const loadGuides = async () => {
    try {
      const guidesSnap = await get(ref(db, 'guides'));
      
      if (guidesSnap.exists()) {
        setGuides(Object.keys(guidesSnap.val()).map(key => ({ id: key, ...guidesSnap.val()[key] })));
      } else {
        // Si no hay datos, inyectamos los datos por defecto automáticamente
        await seedGuides();
        const newSnap = await get(ref(db, 'guides'));
        if (newSnap.exists()) {
          setGuides(Object.keys(newSnap.val()).map(key => ({ id: key, ...newSnap.val()[key] })));
        }
      }
    } catch (error) {
      console.error("Error cargando la guía floral:", error);
    } finally {
      setLoading(false);
    }
  };

  // Función que crea automáticamente el diccionario floral con imágenes si la BD está vacía
  const seedGuides = async () => {
    // const defaultGuides = [
    //   { 
    //     name: '🌻 Girasoles', 
    //     description: 'Representan alegría, energía positiva, admiración y optimismo. Son ideales para regalar a una persona que transmite luz, fuerza y buena vibra.', 
    //     image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=500&q=60' 
    //   },
    //   { 
    //     name: '🌷 Tulipanes', 
    //     description: 'Simbolizan elegancia, cariño sincero y buenos deseos. Son perfectos para cumpleaños, aniversarios, agradecimientos o detalles delicados.', 
    //     image: 'https://images.unsplash.com/photo-1520763185298-1b434c919102?auto=format&fit=crop&w=500&q=60' 
    //   },
    //   { 
    //     name: '🌹 Rosas', 
    //     description: 'Son flores clásicas y elegantes. Dependiendo del color, pueden representar amor, gratitud, admiración, amistad o respeto. Ideales para ocasiones especiales.', 
    //     image: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=500&q=60' 
    //   },
    //   { 
    //     name: '🌸 Gerberas', 
    //     description: 'Transmiten felicidad, entusiasmo y gratitud. Sus colores vivos las convierten en una excelente opción para sorprender con un detalle alegre y moderno.', 
    //     image: 'https://images.unsplash.com/photo-1563241527-300ecb9688d0?auto=format&fit=crop&w=500&q=60' 
    //   }
    // ];

    // for (let guide of defaultGuides) {
    //   await push(ref(db, 'guides'), guide);
    // }
  };

  // Marcadores fijos para la pestaña del mapa mundial
  const mapMarkers = [
    { id: 1, name: '🌷 Tulipán', coords: [38.9637, 35.2433], origin: 'Turquía / Países Bajos', desc: 'Simboliza amor perfecto y prosperidad. Curiosidad: durante el siglo XVII ocurrió la llamada "tulipomanía", una de las primeras burbujas especulativas.' },
    { id: 2, name: '🌸 Flor de Cerezo (Sakura)', coords: [35.6762, 139.6503], origin: 'Japón', desc: 'Muy representativa de Japón. Simboliza la belleza efímera de la vida. Su floración atrae a millones de visitantes.' },
    { id: 3, name: '🌺 Orquídea', coords: [-14.2350, -51.9253], origin: 'Sudamérica y Sudeste Asiático', desc: 'Existen más de 25.000 especies registradas. Representan belleza, admiración y lujo.' },
    { id: 4, name: '🌻 Girasol', coords: [23.6345, -102.5528], origin: 'México / Centroamérica', desc: 'Cultivado originalmente por comunidades indígenas hace miles de años y utilizado como alimento y motivo religioso.' }
  ];

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      
      {/* Selector de Pestañas */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginBottom: '40px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('guia')} style={activeTab === 'guia' ? styles.activeBtn : styles.inactiveBtn}>
          📖 Guía de Regalos
        </button>
        <button onClick={() => setActiveTab('mapa')} style={activeTab === 'mapa' ? styles.activeBtn : styles.inactiveBtn}>
          🌍 Viaje por el Mundo
        </button>
      </div>

      {/* PESTAÑA 1: GUÍA DE REGALOS (DICCIONARIO FLORAL) */}
      {activeTab === 'guia' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ textAlign: 'center', marginBottom: '40px', maxWidth: '800px', margin: '0 auto 40px' }}>
            <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '15px' }}>¿No sabes qué regalar en esta ocasión?</h2>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6' }}>Elegir flores puede ser una forma elegante, especial y significativa de expresar lo que sientes. En <b>Loto Aura</b>, te ayudamos a encontrar el arreglo ideal según la ocasión, la persona y el mensaje que quieres transmitir.</p>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', color: 'var(--primary-pink)', fontWeight: 'bold' }}>Cargando guía floral...</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '25px' }}>
              {guides.map((item) => (
                <div key={item.id} style={styles.guideCard}>
                  {item.image ? (
                    <img src={item.image} alt={item.name} style={styles.cardImage} />
                  ) : (
                    <div style={styles.placeholderImage}>🌸</div>
                  )}
                  <h3 style={{ color: 'var(--primary-pink)', marginBottom: '10px', fontSize: '20px' }}>{item.name}</h3>
                  <p style={{ color: 'var(--text-light)', fontSize: '14px', lineHeight: '1.6' }}>{item.description}</p>
                </div>
              ))}
              
              {guides.length === 0 && (
                <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--text-light)' }}>
                  No hay artículos en la guía aún. (Agrégalos desde el Admin).
                </p>
              )}
            </div>
          )}

          <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', backgroundColor: 'var(--light-pink)', borderRadius: '12px' }}>
            <h3 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>Haz que tu regalo hable por ti</h3>
            <p style={{ color: 'var(--text-light)' }}>Ya sea para un cumpleaños, una felicitación, un agradecimiento o una disculpa, tenemos opciones diseñadas para transmitir el mensaje correcto.</p>
          </div>
        </div>
      )}

      {/* PESTAÑA 2: MAPA MUNDIAL */}
      {activeTab === 'mapa' && (
        <div style={{ animation: 'fadeIn 0.5s' }}>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '10px' }}>Un viaje alrededor del mundo en pétalos</h2>
            <p style={{ color: 'var(--text-light)' }}>Explora el origen de las flores más famosas y descubre historias que florecen.</p>
          </div>
          
          <div style={{ height: '500px', width: '100%', borderRadius: '16px', overflow: 'hidden', border: '2px solid #eaeaea', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}>
            <MapContainer center={[20, 0]} zoom={2} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap' />
              
              {mapMarkers.map((marker) => (
                <Marker key={marker.id} position={marker.coords}>
                  <Popup>
                    <div style={{ textAlign: 'center', minWidth: '200px' }}>
                      <h3 style={{ color: 'var(--primary-pink)', margin: '0 0 5px 0', fontSize: '16px' }}>{marker.name}</h3>
                      <p style={{ fontWeight: 'bold', fontSize: '12px', margin: '0 0 10px 0', color: '#666' }}>📍 {marker.origin}</p>
                      <p style={{ fontSize: '13px', margin: 0, lineHeight: '1.4' }}>{marker.desc}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  activeBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '12px 25px', borderRadius: '30px', border: 'none', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(213, 63, 140, 0.3)', transition: 'all 0.3s' },
  inactiveBtn: { backgroundColor: 'white', color: 'var(--text-light)', padding: '12px 25px', borderRadius: '30px', border: '1px solid #ddd', fontWeight: 'bold', fontSize: '16px', cursor: 'pointer', transition: 'all 0.3s' },
  guideCard: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #eaeaea', boxShadow: '0 4px 10px rgba(0,0,0,0.03)', transition: 'transform 0.2s' },
  cardImage: { width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px', marginBottom: '15px' },
  placeholderImage: { width: '100%', height: '200px', backgroundColor: '#fde8f2', borderRadius: '8px', marginBottom: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }
};

export default Meanings;