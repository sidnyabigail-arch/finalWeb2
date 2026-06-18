// src/pages/Offers.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';
import Modal from '../component/Modal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import { ref, get, push } from 'firebase/database';

const Offers = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para el Modal de Vista Rápida
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [mainImage, setMainImage] = useState('');
  
  const { addToCart } = useCart();
  const { isAdmin } = useAuth(); // Importamos para verificar si es admin

  useEffect(() => {
    loadPromotions();
  }, []);

  const loadPromotions = async () => {
    try {
      const promosSnap = await get(ref(db, 'promotions'));
      if (promosSnap.exists()) {
        const promosData = Object.keys(promosSnap.val()).map(key => ({ id: key, ...promosSnap.val()[key] }));
        setPromotions(promosData);
      } else {
        await seedPromotions();
        const newSnap = await get(ref(db, 'promotions'));
        if (newSnap.exists()) {
          const newPromos = Object.keys(newSnap.val()).map(key => ({ id: key, ...newSnap.val()[key] }));
          setPromotions(newPromos);
        }
      }
    } catch (error) {
      console.error("Error cargando promociones:", error);
    } finally {
      setLoading(false);
    }
  };

  const seedPromotions = async () => {
    const defaultPromos = [
      {
        name: "Combo Día de la Madre", originalPrice: 350, price: 280, promoTag: "-20% Dto", stock: 10,
        description: "Incluye un arreglo floral premium, caja de chocolates artesanales y globo personalizado.",
        images: ["https://images.unsplash.com/photo-1591017539414-bd121b6b553e?auto=format&fit=crop&w=500&q=60"]
      },
      {
        name: "Pack Romántico 2x1", originalPrice: 200, price: 150, promoTag: "¡2x1 Especial!", stock: 10,
        description: "Lleva dos ramos clásicos de rosas rojas por el precio de uno. Ideal para aniversarios.",
        images: ["https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=500&q=60"]
      }
    ];
    for (let promo of defaultPromos) {
      await push(ref(db, 'promotions'), promo);
    }
  };

  // Funciones del Modal
  const openPromoDetails = (promo) => {
    setSelectedPromo(promo);
    setMainImage(promo.images && promo.images[0] ? promo.images[0] : '');
  };

  const handleAddToCart = () => {
    // Si la promoción no tiene stock definido (por si es antigua), asumimos que sí tiene
    const stockAvailable = selectedPromo.stock !== undefined ? selectedPromo.stock : 10;
    if (stockAvailable > 0) {
      addToCart(selectedPromo);
      setSelectedPromo(null);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h3>Cargando promociones...</h3></div>;

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '10px' }}>Promociones y Combos</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Aprovecha nuestros packs especiales, regalos adicionales y descuentos únicos.</p>
      
      {promotions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {promotions.map(promo => (
            <ProductCard key={promo.id} product={promo} onClickCard={openPromoDetails} />
          ))}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--light-pink)', borderRadius: '12px' }}>
          <p>No hay promociones activas en este momento. ¡Vuelve pronto!</p>
        </div>
      )}

      {/* MODAL ANIMADO DE VISTA RÁPIDA Y GALERÍA (PARA PROMOCIONES) */}
      <Modal isOpen={!!selectedPromo} onClose={() => setSelectedPromo(null)} title="Detalle de Promoción">
        {selectedPromo && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Galería */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              {mainImage ? (
                <img src={mainImage} alt="Main" style={{ width: '100%', height: '250px', objectFit: 'contain', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: '100%', height: '250px', backgroundColor: '#fde8f2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🌸 Sin Imagen</div>
              )}
              
              {/* Miniaturas si hay más de 1 imagen */}
              {selectedPromo.images && selectedPromo.images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                  {selectedPromo.images.map((img, index) => img && (
                    <img 
                      key={index} src={img} alt="thumb" 
                      onClick={() => setMainImage(img)}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: mainImage === img ? '2px solid var(--primary-pink)' : '1px solid #ddd', opacity: mainImage === img ? 1 : 0.6 }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Información de la Promoción */}
            <h2 style={{ color: 'var(--text-dark)', marginBottom: '10px' }}>{selectedPromo.name}</h2>
            
            <p style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {selectedPromo.promoTag && (
                <span style={{ backgroundColor: '#e11d48', color: 'white', padding: '4px 12px', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                  {selectedPromo.promoTag}
                </span>
              )}
              {selectedPromo.stock !== undefined && (
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: selectedPromo.stock <= 0 ? '#b91c1c' : '#16a34a' }}>
                  {selectedPromo.stock <= 0 ? 'Agotado' : `Stock: ${selectedPromo.stock} disponibles`}
                </span>
              )}
            </p>
            
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '20px' }}>{selectedPromo.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div>
                {selectedPromo.originalPrice && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px', display: 'block' }}>Bs. {selectedPromo.originalPrice}</span>}
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-pink)' }}>Bs. {selectedPromo.price}</span>
              </div>
              
              {/* Ocultamos el botón si es administrador */}
              {!isAdmin && (
                <button 
                  onClick={handleAddToCart} 
                  disabled={selectedPromo.stock !== undefined && selectedPromo.stock <= 0}
                  style={{ 
                    backgroundColor: (selectedPromo.stock !== undefined && selectedPromo.stock <= 0) ? '#ccc' : 'var(--primary-pink)', 
                    color: 'white', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', 
                    cursor: (selectedPromo.stock !== undefined && selectedPromo.stock <= 0) ? 'not-allowed' : 'pointer', fontSize: '16px' 
                  }}
                >
                  {(selectedPromo.stock !== undefined && selectedPromo.stock <= 0) ? 'Agotado' : 'Aprovechar Oferta 🛒'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Offers;