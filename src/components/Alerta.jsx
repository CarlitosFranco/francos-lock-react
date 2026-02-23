import React, { useEffect } from 'react';

const Alerta = ({ mensaje, tipo, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const colores = {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#0066cc'
  };

  const estilo = {
    position: 'fixed',
    top: '20px',
    right: '20px',
    background: colores[tipo] || colores.info,
    color: 'white',
    padding: '15px 25px',
    borderRadius: '5px',
    boxShadow: '0 3px 10px rgba(0,0,0,0.2)',
    zIndex: 9999,
    fontWeight: 'bold',
    animation: 'slideIn 0.3s ease'
  };

  return <div style={estilo}>{mensaje}</div>;
};

export default Alerta;