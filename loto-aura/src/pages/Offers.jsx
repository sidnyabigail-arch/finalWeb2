// src/pages/Offers.jsx
import React, { useEffect, useState } from 'react';
import ProductCard from '../component/ProductCard';
import { db } from '../services/firebase';
import { ref, get, push } from 'firebase/database';

const Offers = () => {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

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
        // Inyección Automática de Promociones (Seed)
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
        name: "Combo Día de la Madre", originalPrice: 350, price: 280, promoTag: "-20% Dto",
        description: "Incluye un arreglo floral premium, caja de chocolates artesanales y globo personalizado.",
        images: ["https://images.unsplash.com/photo-1591017539414-bd121b6b553e?auto=format&fit=crop&w=500&q=60"]
      },
      {
        name: "Pack Romántico 2x1", originalPrice: 200, price: 150, promoTag: "¡2x1 Especial!",
        description: "Lleva dos ramos clásicos de rosas rojas por el precio de uno. Ideal para aniversarios.",
        images: ["https://images.unsplash.com/photo-1542385151-efd9000785a0?auto=format&fit=crop&w=500&q=60"]
      }
    ];
    for (let promo of defaultPromos) {
      await push(ref(db, 'promotions'), promo);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h3>Cargando promociones...</h3></div>;

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <h2 style={{ fontSize: '32px', color: 'var(--text-dark)', marginBottom: '10px' }}>Promociones y Combos</h2>
      <p style={{ color: 'var(--text-light)', marginBottom: '40px' }}>Aprovecha nuestros packs especiales, regalos adicionales y descuentos únicos.</p>
      
      {promotions.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
          {promotions.map(promo => <ProductCard key={promo.id} product={promo} />)}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px', backgroundColor: 'var(--light-pink)', borderRadius: '12px' }}>
          <p>No hay promociones activas en este momento. ¡Vuelve pronto!</p>
        </div>
      )}
    </div>
  );
};

export default Offers;