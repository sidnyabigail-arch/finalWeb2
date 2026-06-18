// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { ref, get } from 'firebase/database';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      // 1. Autenticar con Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Verificar el estado del cliente en la Base de Datos
      const userRef = ref(db, `users/${user.uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        const userData = snapshot.val();
        
        // VALIDACIÓN ESTRICTA DE BLOQUEO
        if (userData.status === 'inactivo') {
          await signOut(auth); // Destruimos la sesión inmediatamente por seguridad
          setErrorMsg('Acceso Denegado: Tu cuenta ha sido suspendida o bloqueada por un administrador.');
          setLoading(false);
          return; // Abortamos la ejecución
        }

        // Si el usuario es administrador, lo enviamos al dashboard
        if (userData.role === 'admin') {
          navigate('/admin');
          return;
        }
      }

      // Si es un cliente activo y normal, va al inicio
      navigate('/');
      
    } catch (error) {
      console.error(error);
      setErrorMsg('Correo o contraseña incorrectos. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', backgroundColor: '#fafafa', padding: '20px' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', animation: 'fadeIn 0.4s' }}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ color: 'var(--text-dark)', fontSize: '28px', marginBottom: '10px' }}>Bienvenido</h2>
          <p style={{ color: 'var(--text-light)', fontSize: '14px' }}>Inicia sesión en tu cuenta de Loto Aura</p>
        </div>

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={styles.label}>Correo Electrónico</label>
            <input 
              required type="email" placeholder="ejemplo@correo.com" 
              value={email} onChange={e => setEmail(e.target.value)} 
              style={styles.input} 
            />
          </div>
          
          <div>
            <label style={styles.label}>Contraseña</label>
            <input 
              required type="password" placeholder="••••••••" 
              value={password} onChange={e => setPassword(e.target.value)} 
              style={styles.input} 
            />
          </div>

          {errorMsg && (
            <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', fontSize: '14px', textAlign: 'center', fontWeight: 'bold' }}>
              {errorMsg}
            </div>
          )}

          <button type="submit" disabled={loading} style={{...styles.submitBtn, opacity: loading ? 0.7 : 1}}>
            {loading ? 'Verificando...' : 'Iniciar Sesión'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '25px', borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <p style={{ fontSize: '14px', color: 'var(--text-light)' }}>
            ¿No tienes una cuenta? <br/><br/>
            <span style={{ color: 'var(--primary-pink)', fontWeight: 'bold', cursor: 'pointer' }}>
              El registro debe solicitarse a la sucursal.
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  label: { display: 'block', fontSize: '13px', fontWeight: 'bold', color: 'var(--text-light)', marginBottom: '8px' },
  input: { width: '100%', padding: '14px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box', outline: 'none', fontSize: '15px' },
  submitBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '15px', borderRadius: '8px', border: 'none', fontWeight: 'bold', cursor: 'pointer', width: '100%', fontSize: '16px', transition: 'background-color 0.3s' }
};

export default Login;