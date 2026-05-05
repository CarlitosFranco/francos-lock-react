import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logo from '../assets/logo.jpg';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const logout = () => {
    if (window.confirm('¿Cerrar sesión?')) {
      localStorage.removeItem('logueado');
      localStorage.removeItem('usuario');
      navigate('/');
    }
  };

  if (location.pathname === '/') return null;

  return (
    <div className="navbar" style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between',
      padding: '0 20px',
      height: '70px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <img 
          src={logo} 
          alt="FRANCO'S LOCK" 
          style={{ 
            height: '50px', 
            width: 'auto',
            borderRadius: '5px',
            objectFit: 'contain'
          }} 
        />
        <span style={{ 
          color: 'white', 
          fontWeight: 'bold', 
          fontSize: '20px',
          borderLeft: '2px solid #0066cc',
          paddingLeft: '15px'
        }}>
          FRANCO'S LOCK
        </span>
      </div>
      
      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
        <Link to="/inventario" className={location.pathname === '/inventario' ? 'active' : ''}>
          📦 INVENTARIO
        </Link>
        <Link to="/historial" className={location.pathname === '/historial' ? 'active' : ''}>
          📊 HISTORIAL
        </Link>
        <Link to="/facturacion" className={location.pathname === '/facturacion' ? 'active' : ''}>
          🧾 FACTURACIÓN
        </Link>
        <a href="#" onClick={logout} style={{ marginLeft: '20px', background: '#0066cc', borderRadius: '5px' }}>
          🔒 SALIR
        </a>
      </div>
    </div>
  );
};

export default Navbar;