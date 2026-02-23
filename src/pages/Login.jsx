import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';  // ← IMPORTAMOS EL LOGO

const Login = () => {
  const [username, setUsername] = useState('carlos');
  const [password, setPassword] = useState('cerrajero2025');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (username === 'carlos' && password === 'cerrajero2025') {
      localStorage.setItem('logueado', 'true');
      localStorage.setItem('usuario', username);
      navigate('/inventario');
    } else {
      setError('Usuario o contraseña incorrectos');
    }
  };

  return (
    <div className="login-container">
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img 
          src={logo} 
          alt="FRANCO'S LOCK" 
          style={{ 
            maxWidth: '180px', 
            maxHeight: '180px',
            marginBottom: '10px',
            borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,102,204,0.3)'
          }} 
        />
      </div>
      <h1 style={{ color: '#0066cc' }}>FRANCO'S LOCK</h1>
      <h2 style={{ color: '#000', fontSize: '16px', marginBottom: '30px' }}>Sistema de Gestión</h2>
      
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">INGRESAR AL SISTEMA</button>
        {error && <div style={{ color: 'red', textAlign: 'center', marginTop: '15px' }}>{error}</div>}
      </form>
      
      <div style={{ 
        marginTop: '30px', 
        textAlign: 'center', 
        fontSize: '12px', 
        color: '#999',
        borderTop: '1px solid #eee',
        paddingTop: '20px'
      }}>
        © 2026 FRANCO'S LOCK - Todos los derechos reservados
      </div>
    </div>
  );
};

export default Login;