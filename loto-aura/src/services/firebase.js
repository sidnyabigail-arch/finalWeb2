// src/services/firebase.js
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database"; // Usamos Realtime Database
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBN2vtpFecJt4GocKqL9FkQtRKteyQATKw",
  authDomain: "loto-aura.firebaseapp.com",
  databaseURL: "https://loto-aura-default-rtdb.firebaseio.com",
  projectId: "loto-aura",
  storageBucket: "loto-aura.firebasestorage.app",
  messagingSenderId: "905257314858",
  appId: "1:905257314858:web:90e571ffd0bbf50a15f153"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar base de datos y autenticación
export const db = getDatabase(app);
export const auth = getAuth(app);