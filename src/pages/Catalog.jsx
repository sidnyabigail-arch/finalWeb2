// src/pages/Catalog.jsx
import React, { useState, useEffect } from 'react';
import ProductCard from '../component/ProductCard';
import Modal from '../component/Modal';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { getProducts } from '../services/productService';
import { db } from '../services/firebase';
import { ref, get } from 'firebase/database';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState('Todas las categorías');
  const [searchTerm, setSearchTerm] = useState('');

  // Estados para el Modal de Vista Rápida
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [mainImage, setMainImage] = useState('');
  const { addToCart } = useCart();
  const { isAdmin } = useAuth(); // Importamos para verificar si es admin

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const catsSnap = await get(ref(db, 'categories'));
      if (catsSnap.exists()) setCategories(Object.keys(catsSnap.val()).map(key => catsSnap.val()[key].name));
      const fetchedProducts = await getProducts();
      setProducts(fetchedProducts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openProductDetails = (product) => {
    setSelectedProduct(product);
    setMainImage(product.images && product.images[0] ? product.images[0] : '');
  };

  const handleAddToCart = () => {
    if (selectedProduct.stock > 0) {
      addToCart(selectedProduct);
      setSelectedProduct(null); // Cierra el modal tras agregar
    }
  };

  const filteredProducts = products.filter(p => {
    const safeProductCat = p.category ? p.category.trim().toLowerCase() : '';
    const safeFilterCat = filterCategory.trim().toLowerCase();
    const matchCat = filterCategory === 'Todas las categorías' || safeProductCat === safeFilterCat;
    const matchSearch = p.name ? p.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
    return matchCat && matchSearch;
  });

  if (loading) return <div style={{ textAlign: 'center', padding: '100px 0' }}><h3>Cargando catálogo...</h3></div>;

  return (
    <div className="container" style={{ padding: '50px 20px', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px', flexWrap: 'wrap', gap: '20px' }}>
        <div>
          <h2 style={{ fontSize: '32px', color: 'var(--text-dark)' }}>Catálogo de Productos</h2>
          <p style={{ color: 'var(--text-light)' }}>Encuentra el detalle perfecto</p>
        </div>
        <div style={{ display: 'flex', gap: '15px', width: '100%', maxWidth: '500px' }}>
          <input type="text" placeholder="Buscar producto..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ flex: 1, padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />
          <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ padding: '10px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }}>
            <option>Todas las categorías</option>
            {categories.map((cat, i) => <option key={i} value={cat}>{cat}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '30px' }}>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} onClickCard={openProductDetails} />
        ))}
        {filteredProducts.length === 0 && <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-light)' }}>No se encontraron productos.</p>}
      </div>

      {/* MODAL ANIMADO DE VISTA RÁPIDA Y GALERÍA */}
      <Modal isOpen={!!selectedProduct} onClose={() => setSelectedProduct(null)} title="Detalle del Producto">
        {selectedProduct && (
          <div style={{ animation: 'fadeIn 0.3s ease-out' }}>
            {/* Galería */}
            <div style={{ marginBottom: '20px', textAlign: 'center' }}>
              {mainImage ? (
                <img src={mainImage} alt="Main" style={{ width: '100%', height: '250px', objectFit: 'contain', borderRadius: '12px', backgroundColor: '#f9fafb', border: '1px solid #eee' }} />
              ) : (
                <div style={{ width: '100%', height: '250px', backgroundColor: '#fde8f2', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>🌸 Sin Imagen</div>
              )}
              
              {/* Miniaturas si hay más de 1 imagen */}
              {selectedProduct.images && selectedProduct.images.length > 1 && (
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginTop: '15px' }}>
                  {selectedProduct.images.map((img, index) => img && (
                    <img 
                      key={index} src={img} alt="thumb" 
                      onClick={() => setMainImage(img)}
                      style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px', cursor: 'pointer', border: mainImage === img ? '2px solid var(--primary-pink)' : '1px solid #ddd', opacity: mainImage === img ? 1 : 0.6 }} 
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Información */}
            <h2 style={{ color: 'var(--text-dark)', marginBottom: '5px' }}>{selectedProduct.name}</h2>
            <p style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ backgroundColor: '#fde8f2', color: 'var(--primary-pink)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 'bold' }}>{selectedProduct.category}</span>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: selectedProduct.stock <= 0 ? '#b91c1c' : '#16a34a' }}>
                {selectedProduct.stock <= 0 ? 'Sin stock' : `Stock: ${selectedProduct.stock} unidades`}
              </span>
            </p>
            <p style={{ color: 'var(--text-light)', lineHeight: '1.6', marginBottom: '20px' }}>{selectedProduct.description}</p>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #eee', paddingTop: '20px' }}>
              <div>
                {selectedProduct.originalPrice && <span style={{ textDecoration: 'line-through', color: '#999', fontSize: '14px', display: 'block' }}>Bs. {selectedProduct.originalPrice}</span>}
                <span style={{ fontSize: '24px', fontWeight: 'bold', color: 'var(--primary-pink)' }}>Bs. {selectedProduct.price}</span>
              </div>
              
              {/* Ocultamos el botón si es administrador */}
              {!isAdmin && (
                <button 
                  onClick={handleAddToCart} 
                  disabled={selectedProduct.stock <= 0}
                  style={{ backgroundColor: selectedProduct.stock <= 0 ? '#ccc' : 'var(--primary-pink)', color: 'white', padding: '12px 25px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: selectedProduct.stock <= 0 ? 'not-allowed' : 'pointer', fontSize: '16px' }}
                >
                  {selectedProduct.stock <= 0 ? 'Agotado' : 'Agregar al Carrito 🛒'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Catalog;