// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/authService';

const Login = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); // Estado para ocultar/mostrar
  const navigate = useNavigate();

  const validateForm = () => {
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // Regex: Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número, 1 símbolo especial (incluye _)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{8,}$/;
    
    if (isRegistering && formData.name.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres.');
      return false;
    }
    if (!emailRegex.test(formData.email)) {
      setError('Por favor, ingresa un correo electrónico válido.');
      return false;
    }
    if (isRegistering && !passwordRegex.test(formData.password)) {
      setError('La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo especial (ej. _).');
      return false;
    }
    return true;
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      if (isRegistering) {
        await registerUser(formData.email, formData.password, formData.name);
        alert("Usuario creado exitosamente. Inicia sesión.");
        setIsRegistering(false); // Volver a login
      } else {
        await loginUser(formData.email, formData.password);
        navigate('/');
      }
    } catch (err) {
      console.error(err);
      setError('Error en la autenticación. Verifica tus credenciales o el correo ya existe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}</h2>
        
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {isRegistering && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Nombre Completo</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} style={styles.input} />
            </div>
          )}

          <div style={styles.inputGroup}>
            <label style={styles.label}>Correo Electrónico</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} style={styles.input} />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Contraseña</label>
            <div style={{ position: 'relative' }}>
              <input 
                type={showPassword ? "text" : "password"} 
                name="password" 
                value={formData.password} 
                onChange={handleChange} 
                style={{...styles.input, width: '100%', paddingRight: '40px'}} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                style={styles.eyeBtn}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button type="submit" style={styles.submitBtn} disabled={loading}>
            {loading ? 'Procesando...' : (isRegistering ? 'Registrarse' : 'Ingresar')}
          </button>
        </form>

        <p style={styles.toggleText}>
          {isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <span style={styles.toggleLink} onClick={() => { setIsRegistering(!isRegistering); setError(''); }}>
            {isRegistering ? 'Inicia sesión aquí' : 'Regístrate aquí'}
          </span>
        </p>
      </div>
    </div>
  );
};

const styles = {
  container: { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh', padding: '20px' },
  card: { backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' },
  title: { textAlign: 'center', marginBottom: '24px', color: 'var(--text-dark)' },
  form: { display: 'flex', flexDirection: 'column', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: { fontSize: '14px', fontWeight: '500', color: 'var(--text-light)' },
  input: { padding: '12px', borderRadius: '8px', border: '1px solid #ccc', outline: 'none', fontSize: '15px' },
  eyeBtn: { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px' },
  submitBtn: { backgroundColor: 'var(--primary-pink)', color: 'white', padding: '14px', borderRadius: '8px', border: 'none', fontWeight: '600', fontSize: '16px', cursor: 'pointer', marginTop: '10px' },
  errorBox: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '10px', borderRadius: '8px', marginBottom: '16px', fontSize: '14px', textAlign: 'center' },
  toggleText: { textAlign: 'center', marginTop: '20px', fontSize: '14px', color: 'var(--text-light)' },
  toggleLink: { color: 'var(--primary-pink)', fontWeight: '600', cursor: 'pointer' }
};

export default Login;