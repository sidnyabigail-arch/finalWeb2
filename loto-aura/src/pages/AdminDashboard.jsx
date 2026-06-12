// src/pages/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../component/Modal';
import { db } from '../services/firebase';
import { ref, get, push, update, remove } from 'firebase/database';
import { getProducts, addProduct, updateProduct, deleteProduct } from '../services/productService';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('productos'); 
  const [data, setData] = useState({ products: [], orders: [], clients: [], categories: [], promotions: [], guides: [] });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState(''); 
  const [errorMsg, setErrorMsg] = useState('');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const [isGuideModalOpen, setIsGuideModalOpen] = useState(false); 
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, id: null, name: '', type: '' });
  
  const [editingId, setEditingId] = useState(null);
  const [viewItem, setViewItem] = useState(null);
  
  const [formData, setFormData] = useState({ name: '', price: '', category: 'Sin Categoría', description: '', promoTag: '', stock: 10, images: [''] });
  const [categoryFormData, setCategoryFormData] = useState({ name: '' });
  const [promoFormData, setPromoFormData] = useState({ name: '', originalPrice: '', price: '', promoTag: '', description: '', images: [''] });
  const [guideFormData, setGuideFormData] = useState({ name: '', description: '', image: '' }); 

  useEffect(() => { fetchAllData(); }, []);

  const fetchAllData = async () => {
    const productsData = await getProducts();
    const ordersSnap = await get(ref(db, 'orders'));
    const ordersData = ordersSnap.exists() ? Object.keys(ordersSnap.val()).map(key => ({ id: key, ...ordersSnap.val()[key] })) : [];
    const usersSnap = await get(ref(db, 'users'));
    const clientsData = usersSnap.exists() ? Object.keys(usersSnap.val()).map(key => ({ id: key, ...usersSnap.val()[key] })).filter(u => u.role === 'cliente') : [];
    const catsSnap = await get(ref(db, 'categories'));
    const catsData = catsSnap.exists() ? Object.keys(catsSnap.val()).map(key => ({ id: key, ...catsSnap.val()[key] })) : [];
    const promosSnap = await get(ref(db, 'promotions'));
    const promosData = promosSnap.exists() ? Object.keys(promosSnap.val()).map(key => ({ id: key, ...promosSnap.val()[key] })) : [];
    const guidesSnap = await get(ref(db, 'guides'));
    const guidesData = guidesSnap.exists() ? Object.keys(guidesSnap.val()).map(key => ({ id: key, ...guidesSnap.val()[key] })) : [];

    setData({ products: productsData, orders: ordersData.reverse(), clients: clientsData, categories: catsData, promotions: promosData, guides: guidesData });
  };

  const handleImageChange = (index, value, isPromo = false) => {
    if (isPromo) {
      const newImages = [...promoFormData.images];
      newImages[index] = value;
      setPromoFormData({ ...promoFormData, images: newImages });
    } else {
      const newImages = [...formData.images];
      newImages[index] = value;
      setFormData({ ...formData, images: newImages });
    }
  };
  
  const handleFileUpload = (index, e, isPromo = false) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => handleImageChange(index, reader.result, isPromo);
      reader.readAsDataURL(file);
    }
  };

  const handleGuideImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setGuideFormData({ ...guideFormData, image: reader.result });
      reader.readAsDataURL(file);
    }
  };

  /* --- CRUD PRODUCTOS --- */
  const openProductModal = (product = null) => {
    setErrorMsg('');
    setEditingId(product ? product.id : null);
    setFormData({ 
      name: product?.name || '', price: product?.price || '', 
      category: product?.category || 'Sin Categoría', description: product?.description || '', 
      promoTag: product?.promoTag || '', stock: product?.stock !== undefined ? product.stock : 10,
      images: product?.images?.length > 0 ? product.images : [''] 
    });
    setIsProductModalOpen(true);
  };

  const saveProduct = async (e) => {
    e.preventDefault();
    const cleanImages = formData.images.filter(img => img.trim() !== '');
    if (cleanImages.length === 0) return setErrorMsg("⚠️ Es OBLIGATORIO subir al menos 1 imagen.");
    if (Number(formData.stock) < 0) return setErrorMsg("⚠️ El stock no puede ser menor a 0.");
    setErrorMsg('');

    const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock), images: cleanImages };
    if (editingId) await updateProduct(editingId, payload);
    else await addProduct({ ...payload, isNew: true });
    setIsProductModalOpen(false);
    fetchAllData();
  };

  /* --- CRUD PROMOCIONES --- */
  const openPromoModal = (promo = null) => {
    setErrorMsg('');
    setEditingId(promo ? promo.id : null);
    setPromoFormData({
      name: promo?.name || '', originalPrice: promo?.originalPrice || '', price: promo?.price || '',
      promoTag: promo?.promoTag || '', description: promo?.description || '',
      images: promo?.images?.length > 0 ? promo.images : ['']
    });
    setIsPromoModalOpen(true);
  };

  const savePromo = async (e) => {
    e.preventDefault();
    const cleanImages = promoFormData.images.filter(img => img.trim() !== '');
    if (cleanImages.length === 0) return setErrorMsg("⚠️ Sube al menos una imagen.");
    setErrorMsg('');

    const payload = { ...promoFormData, price: Number(promoFormData.price), originalPrice: promoFormData.originalPrice ? Number(promoFormData.originalPrice) : null, images: cleanImages };
    if (editingId) await update(ref(db, `promotions/${editingId}`), payload);
    else await push(ref(db, 'promotions'), payload);
    setIsPromoModalOpen(false);
    fetchAllData();
  };

  /* --- CRUD CATEGORÍAS --- */
  const openCategoryModal = (cat = null) => {
    setEditingId(cat ? cat.id : null);
    setCategoryFormData({ name: cat?.name || '' });
    setIsCategoryModalOpen(true);
  };

  const saveCategory = async (e) => {
    e.preventDefault();
    if (editingId) await update(ref(db, `categories/${editingId}`), categoryFormData);
    else await push(ref(db, 'categories'), categoryFormData);
    setIsCategoryModalOpen(false);
    fetchAllData();
  };

  /* --- CRUD GUÍAS FLORALES --- */
  const openGuideModal = (guide = null) => {
    setErrorMsg('');
    setEditingId(guide ? guide.id : null);
    setGuideFormData({ name: guide?.name || '', description: guide?.description || '', image: guide?.image || '' });
    setIsGuideModalOpen(true);
  };

  const saveGuide = async (e) => {
    e.preventDefault();
    if (!guideFormData.image) return setErrorMsg("⚠️ Debes subir una imagen ilustrativa.");
    setErrorMsg('');
    if (editingId) await update(ref(db, `guides/${editingId}`), guideFormData);
    else await push(ref(db, 'guides'), guideFormData);
    setIsGuideModalOpen(false);
    fetchAllData();
  };

  /* --- ELIMINAR CON LÓGICA DE CASCADA --- */
  const triggerDelete = (id, name, type) => setDeleteConfirm({ isOpen: true, id, name, type });
  
  const confirmDelete = async () => {
    if (deleteConfirm.type === 'product') await deleteProduct(deleteConfirm.id);
    if (deleteConfirm.type === 'promotion') await remove(ref(db, `promotions/${deleteConfirm.id}`));
    if (deleteConfirm.type === 'guide') await remove(ref(db, `guides/${deleteConfirm.id}`));
    
    if (deleteConfirm.type === 'category') {
      // LOGICA EN CASCADA: Actualizar productos que tenían esta categoría a "Sin Categoría"
      const productsToUpdate = data.products.filter(p => p.category === deleteConfirm.name);
      for (let p of productsToUpdate) {
        await update(ref(db, `products/${p.id}`), { category: 'Sin Categoría' });
      }
      await remove(ref(db, `categories/${deleteConfirm.id}`));
    }
    
    setDeleteConfirm({ isOpen: false, id: null, name: '', type: '' });
    fetchAllData();
  };

  const changeOrderStatus = async (orderId, newStatus) => {
    await update(ref(db, `orders/${orderId}`), { status: newStatus });
    fetchAllData();
  };

  return (
    <div className="container" style={{ padding: '40px 20px', minHeight: '80vh' }}>
      <h2 style={{ color: 'var(--text-dark)', marginBottom: '20px' }}>Dashboard Administrativo</h2>
      
      <div style={styles.tabsMenu}>
        <button onClick={() => setActiveTab('productos')} style={activeTab === 'productos' ? styles.activeTab : styles.tab}>📦 Productos</button>
        <button onClick={() => setActiveTab('promociones')} style={activeTab === 'promociones' ? styles.activeTab : styles.tab}>🎁 Promociones</button>
        <button onClick={() => setActiveTab('categorias')} style={activeTab === 'categorias' ? styles.activeTab : styles.tab}>🏷️ Categorías</button>
        <button onClick={() => setActiveTab('guias')} style={activeTab === 'guias' ? styles.activeTab : styles.tab}>📖 Guía Floral</button>
        <button onClick={() => setActiveTab('pedidos')} style={activeTab === 'pedidos' ? styles.activeTab : styles.tab}>📝 Historial Pedidos</button>
        <button onClick={() => setActiveTab('clientes')} style={activeTab === 'clientes' ? styles.activeTab : styles.tab}>👥 Clientes</button>
      </div>

      <div style={styles.controls}>
        <div style={{ display: 'flex', gap: '10px', flex: 1, flexWrap: 'wrap' }}>
          <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={styles.searchInput} />
          {activeTab === 'pedidos' && <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ddd', outline: 'none' }} />}
          {(searchTerm || filterDate) && <button onClick={() => {setSearchTerm(''); setFilterDate('');}} style={{ padding: '12px 15px', borderRadius: '8px', border: 'none', background: '#fee2e2', color: '#b91c1c', cursor: 'pointer', fontWeight: 'bold' }}>✖</button>}
        </div>

        {activeTab === 'productos' && <button onClick={() => openProductModal()} style={styles.addBtn}>+ Nuevo Producto</button>}
        {activeTab === 'promociones' && <button onClick={() => openPromoModal()} style={styles.addBtn}>+ Nueva Promoción</button>}
        {activeTab === 'categorias' && <button onClick={() => openCategoryModal()} style={styles.addBtn}>+ Nueva Categoría</button>}
        {activeTab === 'guias' && <button onClick={() => openGuideModal()} style={styles.addBtn}>+ Nueva Tarjeta Floral</button>}
      </div>

      <div style={styles.tableContainer}>
        {/* TABLA GUÍAS FLORALES */}
        {activeTab === 'guias' && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nombre Flor</th><th style={styles.th}>Imagen</th><th style={styles.th}>Acciones</th></tr></thead>
            <tbody>
              {data.guides.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(g => (
                <tr key={g.id} style={styles.tr}>
                  <td style={styles.td}><b>{g.name}</b></td>
                  <td style={styles.td}><img src={g.image} alt="flor" style={{ width:'40px', height:'40px', borderRadius:'8px', objectFit:'cover' }} /></td>
                  <td style={styles.td}>
                    <button onClick={() => openGuideModal(g)} style={styles.editBtn}>✏️ Editar</button>
                    <button onClick={() => triggerDelete(g.id, g.name, 'guide')} style={styles.deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
              {data.guides.length === 0 && <tr><td colSpan="3" style={{textAlign:'center', padding:'20px'}}>No hay tarjetas creadas.</td></tr>}
            </tbody>
          </table>
        )}

        {/* TABLA PRODUCTOS */}
        {activeTab === 'productos' && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nombre</th><th style={styles.th}>Categoría</th><th style={styles.th}>Stock</th><th style={styles.th}>Precio</th><th style={styles.th}>Acciones</th></tr></thead>
            <tbody>
              {data.products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
                <tr key={p.id} style={styles.tr}>
                  <td style={styles.td}>{p.name}</td>
                  <td style={styles.td}><span style={styles.badge}>{p.category}</span></td>
                  <td style={styles.td}><b style={{color: p.stock <= 0 ? 'red' : 'green'}}>{p.stock} u.</b></td>
                  <td style={styles.td}>Bs. {p.price}</td>
                  <td style={styles.td}>
                    <button onClick={() => {setViewItem({...p, type:'product'}); setIsViewModalOpen(true);}} style={styles.viewBtn}>👁️ Ver</button>
                    <button onClick={() => openProductModal(p)} style={styles.editBtn}>✏️ Ed</button>
                    <button onClick={() => triggerDelete(p.id, p.name, 'product')} style={styles.deleteBtn}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* TABLA PROMOCIONES */}
        {activeTab === 'promociones' && (
           <table style={styles.table}>
           <thead><tr><th style={styles.th}>Nombre de Promo</th><th style={styles.th}>Etiqueta</th><th style={styles.th}>Precio Final</th><th style={styles.th}>Acciones</th></tr></thead>
           <tbody>
             {data.promotions.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase())).map(p => (
               <tr key={p.id} style={styles.tr}>
                 <td style={styles.td}>{p.name}</td>
                 <td style={styles.td}><span style={{ backgroundColor: '#e11d48', color: 'white', padding: '4px 10px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold' }}>{p.promoTag}</span></td>
                 <td style={styles.td}>Bs. {p.price}</td>
                 <td style={styles.td}>
                   <button onClick={() => {setViewItem({...p, type:'promotion'}); setIsViewModalOpen(true);}} style={styles.viewBtn}>👁️ Ver</button>
                   <button onClick={() => openPromoModal(p)} style={styles.editBtn}>✏️ Ed</button>
                   <button onClick={() => triggerDelete(p.id, p.name, 'promotion')} style={styles.deleteBtn}>🗑️</button>
                 </td>
               </tr>
             ))}
           </tbody>
         </table>
        )}

        {/* TABLA CATEGORÍAS */}
        {activeTab === 'categorias' && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nombre de Categoría</th><th style={styles.th}>Acciones</th></tr></thead>
            <tbody>
              {data.categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <tr key={c.id} style={styles.tr}>
                  <td style={styles.td}><span style={styles.badge}>{c.name}</span></td>
                  <td style={styles.td}>
                    <button onClick={() => openCategoryModal(c)} style={styles.editBtn}>✏️ Editar</button>
                    <button onClick={() => triggerDelete(c.id, c.name, 'category')} style={styles.deleteBtn}>🗑️ Eliminar</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* TABLA PEDIDOS */}
        {activeTab === 'pedidos' && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>ID Pedido</th><th style={styles.th}>Cliente</th><th style={styles.th}>Pago</th><th style={styles.th}>Fecha</th><th style={styles.th}>Estado</th><th style={styles.th}>Acciones</th></tr></thead>
            <tbody>
              {data.orders.filter(o => {
                const dateObj = new Date(o.createdAt);
                const localOrderDate = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
                const matchSearch = o.id.includes(searchTerm) || o.customerInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
                const matchDate = filterDate ? localOrderDate === filterDate : true;
                return matchSearch && matchDate;
              }).map(o => (
                <tr key={o.id} style={styles.tr}>
                  <td style={styles.td} title={o.id}><b>{o.id.substring(1, 8)}...</b></td>
                  <td style={styles.td}>{o.customerInfo.fullName}</td>
                  <td style={styles.td}>
                    {o.payment?.method === 'qr' ? <span style={{ color: '#059669', fontWeight: 'bold', fontSize: '14px' }}>QR 🧾</span> : <span style={{ color: '#2563eb', fontWeight: 'bold', fontSize: '14px' }}>Tarjeta 💳</span>}
                  </td>
                  <td style={styles.td}>{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td style={styles.td}>
                    <select value={o.status} onChange={(e) => changeOrderStatus(o.id, e.target.value)} style={{...styles.statusSelect, backgroundColor: o.status === 'Pendiente' ? '#fef9c3' : o.status === 'Entregado' ? '#dcfce7' : o.status === 'Cancelado' ? '#fee2e2' : 'white'}}>
                      <option value="Pendiente">Pendiente</option>
                      <option value="En Proceso">En Proceso</option>
                      <option value="Entregado">Entregado</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                  <td style={styles.td}>
                    <button onClick={() => {setViewItem({...o, type:'order'}); setIsViewModalOpen(true);}} style={{...styles.viewBtn, backgroundColor: 'var(--primary-pink)', color: 'white'}}>👁️ Detalle Completo</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        
        {/* TABLA CLIENTES */}
        {activeTab === 'clientes' && (
          <table style={styles.table}>
            <thead><tr><th style={styles.th}>Nombre</th><th style={styles.th}>Email</th><th style={styles.th}>Registro</th></tr></thead>
            <tbody>
              {data.clients.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())).map(c => (
                <tr key={c.id} style={styles.tr}><td style={styles.td}>{c.name}</td><td style={styles.td}>{c.email}</td><td style={styles.td}>{new Date(c.createdAt).toLocaleDateString()}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* MODAL PRODUCTOS */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingId ? 'Editar Producto' : 'Nuevo Producto'}>
        <form onSubmit={saveProduct} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>{errorMsg}</div>}
          
          <input required type="text" placeholder="Nombre del producto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={styles.input} />
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Precio (Bs.)</label>
               <input required type="number" step="0.5" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} style={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
               <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Stock Inicial</label>
               <input required type="number" min="0" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} style={styles.input} />
            </div>
          </div>
          
          <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Categoría</label>
          <select value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={styles.input}>
            <option value="Sin Categoría">Sin Categoría</option>
            {data.categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
          </select>
          
          <textarea rows="3" placeholder="Descripción" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={styles.input}></textarea>
          
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block', color: 'var(--primary-pink)' }}>Imágenes (Al menos 1 obligatoria)</label>
            {formData.images.map((img, index) => (
              <div key={index} style={{ marginBottom: '10px' }}>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(index, e, false)} style={{ fontSize: '12px' }} />
                {img && <img src={img} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginTop: '5px' }} />}
              </div>
            ))}
            <button type="button" onClick={() => setFormData({...formData, images: [...formData.images, '']})} style={{ background: 'none', color: 'var(--primary-pink)', border: '1px solid var(--primary-pink)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>+ Agregar otra</button>
          </div>
          <button type="submit" style={styles.addBtn}>Guardar Producto</button>
        </form>
      </Modal>

      {/* MODAL PROMOCIONES */}
      <Modal isOpen={isPromoModalOpen} onClose={() => setIsPromoModalOpen(false)} title={editingId ? 'Editar Promoción' : 'Nueva Promoción'}>
        <form onSubmit={savePromo} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>{errorMsg}</div>}
          <input required type="text" placeholder="Nombre de la promoción" value={promoFormData.name} onChange={e => setPromoFormData({...promoFormData, name: e.target.value})} style={styles.input} />
          <div style={{ display: 'flex', gap: '10px' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold' }}>Precio Antiguo</label>
              <input type="number" placeholder="Opcional" step="0.5" value={promoFormData.originalPrice} onChange={e => setPromoFormData({...promoFormData, originalPrice: e.target.value})} style={styles.input} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary-pink)' }}>Precio Oferta</label>
              <input required type="number" placeholder="Obligatorio" step="0.5" value={promoFormData.price} onChange={e => setPromoFormData({...promoFormData, price: e.target.value})} style={styles.input} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: '#e11d48' }}>Etiqueta (Ej. 2x1, -20%)</label>
            <input required type="text" value={promoFormData.promoTag} onChange={e => setPromoFormData({...promoFormData, promoTag: e.target.value})} style={styles.input} />
          </div>
          <textarea required rows="3" placeholder="Descripción" value={promoFormData.description} onChange={e => setPromoFormData({...promoFormData, description: e.target.value})} style={styles.input}></textarea>
          
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '10px', display: 'block' }}>Imágenes (Al menos 1 obligatoria)</label>
            {promoFormData.images.map((img, index) => (
              <div key={index} style={{ marginBottom: '15px', paddingBottom: '10px', borderBottom: '1px dashed #ccc' }}>
                <input type="file" accept="image/*" onChange={(e) => handleFileUpload(index, e, true)} style={{ fontSize: '12px' }} />
                {promoFormData.images.length > 1 && <button type="button" onClick={() => setPromoFormData({...promoFormData, images: promoFormData.images.filter((_, i) => i !== index)})} style={styles.deleteBtn}>X</button>}
                {img && <img src={img} alt="preview" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px', marginTop: '5px' }} />}
              </div>
            ))}
            <button type="button" onClick={() => setPromoFormData({...promoFormData, images: [...promoFormData.images, '']})} style={{ background: 'none', color: 'var(--primary-pink)', border: '1px solid var(--primary-pink)', padding: '5px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}>+ Agregar otra imagen</button>
          </div>
          <button type="submit" style={styles.addBtn}>Guardar Promoción</button>
        </form>
      </Modal>

      {/* MODAL CATEGORÍAS */}
      <Modal isOpen={isCategoryModalOpen} onClose={() => setIsCategoryModalOpen(false)} title={editingId ? 'Editar Categoría' : 'Nueva Categoría'}>
        <form onSubmit={saveCategory} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <label style={{ fontSize: '14px', fontWeight: 'bold' }}>Nombre</label>
          <input required type="text" value={categoryFormData.name} onChange={e => setCategoryFormData({name: e.target.value})} style={styles.input} />
          <button type="submit" style={styles.addBtn}>Guardar</button>
        </form>
      </Modal>

      {/* MODAL GUÍAS FLORALES */}
      <Modal isOpen={isGuideModalOpen} onClose={() => setIsGuideModalOpen(false)} title={editingId ? 'Editar Artículo' : 'Nuevo Artículo Floral'}>
        <form onSubmit={saveGuide} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {errorMsg && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textAlign: 'center' }}>{errorMsg}</div>}
          <input required type="text" placeholder="Nombre (Ej. 🌻 Girasoles)" value={guideFormData.name} onChange={e => setGuideFormData({...guideFormData, name: e.target.value})} style={styles.input} />
          <textarea required rows="4" placeholder="Descripción y significado..." value={guideFormData.description} onChange={e => setGuideFormData({...guideFormData, description: e.target.value})} style={styles.input}></textarea>
          
          <div style={{ backgroundColor: '#f9fafb', padding: '15px', borderRadius: '8px', border: '1px solid #eee' }}>
            <label style={{ fontSize: '14px', fontWeight: 'bold', display: 'block', marginBottom: '10px' }}>Imagen del Artículo (Obligatorio)</label>
            <input type="file" accept="image/*" onChange={handleGuideImageUpload} style={{ fontSize: '14px' }} />
            {guideFormData.image && <img src={guideFormData.image} alt="Preview" style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', marginTop: '10px' }} />}
          </div>
          <button type="submit" style={styles.addBtn}>Guardar Artículo</button>
        </form>
      </Modal>

      {/* MODAL DETALLES */}
      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detalles">
        {viewItem && (viewItem.type === 'product' || viewItem.type === 'promotion') && (
          <div>
            <h3 style={{ color: 'var(--text-dark)' }}>{viewItem.name}</h3>
            <p>
              {viewItem.category && <span style={styles.badge}>{viewItem.category}</span>} 
              <span style={{ marginLeft: '10px', fontWeight: 'bold', color: viewItem.stock <= 0 ? '#b91c1c' : '#16a34a' }}>Stock: {viewItem.stock}</span>
            </p>
            <p>
              {viewItem.originalPrice && <span style={{ textDecoration: 'line-through', color: '#999', marginRight: '10px' }}>Bs. {viewItem.originalPrice}</span>}
              <b style={{ color: 'var(--primary-pink)', fontSize: '20px' }}>Bs. {viewItem.price}</b>
            </p>
            <p style={{ color: 'var(--text-light)', marginTop: '10px' }}>{viewItem.description}</p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
              {viewItem.images && viewItem.images.map((img, i) => img && <img key={i} src={img} alt="Prod" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #ddd' }} />)}
            </div>
          </div>
        )}

        {viewItem && viewItem.type === 'order' && (
          <div style={{ padding: '10px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #fdf2f8', paddingBottom: '10px', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, color: 'var(--text-dark)' }}>Pedido: <b>{viewItem.id}</b></h3>
              <span style={{ backgroundColor: viewItem.status === 'Pendiente' ? '#fef9c3' : viewItem.status === 'Entregado' ? '#dcfce7' : viewItem.status === 'Cancelado' ? '#fee2e2' : '#e0f2fe', padding: '6px 12px', borderRadius: '8px', fontWeight: 'bold', fontSize: '14px' }}>
                {viewItem.status}
              </span>
            </div>
            
            <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: '250px', backgroundColor: '#fafafa', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                <h4 style={{ color: 'var(--primary-pink)', marginBottom: '15px' }}>📍 Logística de Entrega</h4>
                <p style={{ margin: '5px 0' }}><b>Recibe:</b> {viewItem.customerInfo.fullName}</p>
                <p style={{ margin: '5px 0' }}><b>Teléfono:</b> <a href={`tel:${viewItem.customerInfo.phone}`} style={{ color: '#0369a1', textDecoration: 'none', fontWeight: 'bold' }}>{viewItem.customerInfo.phone}</a></p>
                <p style={{ margin: '5px 0' }}><b>Dirección:</b> {viewItem.customerInfo.address}</p>
                <p style={{ margin: '5px 0' }}><b>Fecha/Hora:</b> {viewItem.customerInfo.deliveryDate} a las {viewItem.customerInfo.deliveryTime}</p>
                <p style={{ margin: '5px 0' }}><b>Costo Distancia:</b> Bs. {viewItem.customerInfo.deliveryFee || 0}</p>
                {viewItem.customerInfo.coordinates && (
                  <a href={`https://www.google.com/maps?q=${viewItem.customerInfo.coordinates.lat},${viewItem.customerInfo.coordinates.lng}`} target="_blank" rel="noreferrer" style={{ display: 'block', textAlign: 'center', backgroundColor: '#e0f2fe', color: '#0369a1', padding: '10px', borderRadius: '8px', fontWeight: 'bold', textDecoration: 'none', marginTop: '15px', border: '1px solid #bae6fd' }}>
                    🗺️ Abrir ubicación en Google Maps
                  </a>
                )}
              </div>
              
              <div style={{ flex: 1, minWidth: '250px', backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #eee', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <h4 style={{ color: 'var(--primary-pink)', marginBottom: '15px', width: '100%', textAlign: 'left' }}>💳 Verificación de Pago</h4>
                {viewItem.payment?.method === 'qr' ? (
                  <>
                    <p style={{ width: '100%', margin: '0 0 10px 0', fontWeight: 'bold', color: '#059669' }}>Transferencia QR</p>
                    {viewItem.payment.receipt && (
                      <a href={viewItem.payment.receipt} target="_blank" rel="noreferrer" title="Clic para ampliar">
                        <img src={viewItem.payment.receipt} alt="Comprobante QR" style={{ width: '100%', maxWidth: '200px', height: '200px', objectFit: 'contain', borderRadius: '8px', border: '2px dashed #ccc', cursor: 'zoom-in', backgroundColor: 'white' }} />
                      </a>
                    )}
                  </>
                ) : (
                  <div style={{ width: '100%', backgroundColor: 'white', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                    <p style={{ margin: '0 0 10px 0', fontWeight: 'bold', color: '#2563eb' }}>Tarjeta</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><b>Titular:</b> {viewItem.payment?.cardName}</p>
                    <p style={{ margin: '5px 0', fontSize: '14px' }}><b>Tarjeta:</b> **** {viewItem.payment?.cardLast4}</p>
                  </div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '25px' }}>
              <h4 style={{ color: 'var(--text-dark)', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '15px' }}>📦 Productos</h4>
              <ul style={{ paddingLeft: '0', listStyle: 'none', margin: 0 }}>
                {viewItem.items.map((it, i) => (
                  <li key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', backgroundColor: i % 2 === 0 ? '#f9fafb' : 'white', borderRadius: '6px', marginBottom: '5px' }}>
                    <span><b>{it.quantity}x</b> {it.name}</span>
                    <span style={{ fontWeight: '500' }}>Bs. {it.price * it.quantity}</span>
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '15px' }}>
                <h3 style={{ backgroundColor: 'var(--primary-pink)', color: 'white', padding: '10px 20px', borderRadius: '8px', margin: 0 }}>Total Pagado: Bs. {viewItem.total}</h3>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* CONFIRMAR ELIMINACIÓN */}
      {deleteConfirm.isOpen && (
        <div style={styles.customConfirmOverlay}>
          <div style={styles.customConfirmBox}>
            <h3 style={{ color: '#b91c1c', marginBottom: '15px' }}>⚠️ Confirmar</h3>
            <p>¿Eliminar <b>"{deleteConfirm.name}"</b> permanentemente?</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '15px', marginTop: '25px' }}>
              <button onClick={() => setDeleteConfirm({ isOpen: false, id: null, name: '', type: '' })} style={styles.cancelBtn}>Cancelar</button>
              <button onClick={confirmDelete} style={styles.confirmDangerBtn}>Eliminar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  tabsMenu: { display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '2px solid #fdf2f8', overflowX: 'auto', whiteSpace: 'nowrap' },
  tab: { background: 'none', border: 'none', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', color: 'var(--text-light)', cursor: 'pointer' },
  activeTab: { background: 'var(--light-pink)', border: 'none', borderBottom: '3px solid var(--primary-pink)', padding: '10px 20px', fontSize: '16px', fontWeight: 'bold', color: 'var(--primary-pink)', cursor: 'pointer' },
  controls: { display: 'flex', gap: '15px', marginBottom: '20px', flexWrap: 'wrap', alignItems: 'center' },
  searchInput: { flex: '1', padding: '12px 15px', borderRadius: '8px', border: '1px solid #ddd', minWidth: '200px', outline: 'none' },
  addBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', border: 'none', padding: '12px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' },
  tableContainer: { overflowX: 'auto', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #eee', color: 'var(--text-light)', backgroundColor: '#fafafa' },
  tr: { borderBottom: '1px solid #eee' },
  td: { padding: '15px', verticalAlign: 'middle', color: 'var(--text-dark)' },
  badge: { backgroundColor: '#fde8f2', color: 'var(--primary-pink)', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' },
  viewBtn: { background: '#e0f2fe', border: 'none', color: '#0369a1', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  editBtn: { background: 'none', border: '1px solid #ddd', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', marginRight: '5px' },
  deleteBtn: { background: '#fee2e2', border: 'none', color: '#b91c1c', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer' },
  statusSelect: { padding: '6px', borderRadius: '6px', border: '1px solid #ddd', outline: 'none', fontWeight: 'bold' },
  input: { width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none' },
  customConfirmOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 10000 },
  customConfirmBox: { backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '350px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  cancelBtn: { flex: 1, padding: '12px', background: '#f3f4f6', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: '#4b5563', cursor: 'pointer' },
  confirmDangerBtn: { flex: 1, padding: '12px', background: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', color: 'white', cursor: 'pointer' }
};

export default AdminDashboard;