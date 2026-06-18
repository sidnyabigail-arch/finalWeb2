// src/services/productService.js
import { db } from './firebase';
import { ref, get, set, push } from 'firebase/database';

// Obtener todos los productos
export const getProducts = async () => {
  const dbRef = ref(db, 'products');
  const snapshot = await get(dbRef);
  
  if (snapshot.exists()) {
    const data = snapshot.val();
    // Convertimos el nodo de Realtime Database a un array iterable
    return Object.keys(data).map(key => ({
      id: key,
      ...data[key]
    }));
  } else {
    return [];
  }
};

// Agregar un nuevo producto (Se usará aquí para pruebas y luego en tu Dashboard Admin)
export const addProduct = async (product) => {
  const productsRef = ref(db, 'products');
  const newProductRef = push(productsRef); // Genera un ID único automáticamente
  await set(newProductRef, product);
};


// src/services/productService.js (Añadir al final del archivo)
import { update, remove } from 'firebase/database'; // Importar de firebase/database en la parte superior si falta

export const updateProduct = async (id, updatedData) => {
  const productRef = ref(db, `products/${id}`);
  await update(productRef, updatedData);
};

export const deleteProduct = async (id) => {
  const productRef = ref(db, `products/${id}`);
  await remove(productRef);
};