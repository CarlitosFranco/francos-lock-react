import React, { useState } from 'react';
import ModalFoto from './ModalFoto';

const TablaProductos = ({ 
  productos, 
  onActualizarStock, 
  onEliminar, 
  onEditar,
  onVerFoto,
  modalFoto,
  setModalFoto
}) => {
  
  const [hoverFoto, setHoverFoto] = useState(null);

  if (!productos || productos.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '60px', 
        background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)',
        borderRadius: '20px',
        margin: '20px 0',
        border: '1px dashed #0066cc'
      }}>
        <span style={{ fontSize: '80px', display: 'block', marginBottom: '20px' }}>🔑</span>
        <h3 style={{ color: '#666', marginBottom: '10px' }}>No hay productos en el inventario</h3>
        <p style={{ color: '#999' }}>Agrega tu primer producto usando el formulario de abajo</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: '16px' }}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '110px' }}>📷 FOTO</th>
              <th>CÓDIGO</th>
              <th>NOMBRE</th>
              <th>MARCA</th>
              <th style={{ textAlign: 'center' }}>📊 STOCK</th>
              <th style={{ textAlign: 'right' }}>💰 COMPRA</th>
              <th style={{ textAlign: 'right' }}>💰 VENTA</th>
              <th style={{ textAlign: 'center', width: '200px' }}>⚙️ ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr 
                key={producto.codigo} 
                className={producto.stock <= producto.stockMinimo ? 'bajo-stock' : ''}
                style={{ transition: 'background 0.2s' }}
              >
                <td style={{ textAlign: 'center', padding: '12px' }}>
                  {producto.foto ? (
                    <div className="foto-wrapper" style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={producto.foto} 
                        className="foto-producto"
                        onClick={() => onVerFoto(producto.foto)}
                        alt={producto.nombre}
                        style={{
                          width: '90px',
                          height: '90px',
                          objectFit: 'cover',
                          borderRadius: '16px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
                          border: '3px solid white',
                          outline: '1px solid #e0e0e0'
                        }}
                        onMouseEnter={(e) => {
                          setHoverFoto(producto.codigo);
                          e.currentTarget.style.transform = 'scale(1.2)';
                          e.currentTarget.style.boxShadow = '0 20px 35px rgba(0,102,204,0.35)';
                          e.currentTarget.style.outline = '2px solid #0066cc';
                        }}
                        onMouseLeave={(e) => {
                          setHoverFoto(null);
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                          e.currentTarget.style.outline = '1px solid #e0e0e0';
                        }}
                      />
                      <div style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        background: '#0066cc',
                        borderRadius: '50%',
                        width: '26px',
                        height: '26px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        color: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        transition: 'all 0.2s',
                        opacity: hoverFoto === producto.codigo ? 1 : 0.8
                      }}>
                        🔍
                      </div>
                    </div>
                  ) : (
                    <div style={{ 
                      width: '90px', 
                      height: '90px', 
                      background: 'linear-gradient(145deg, #f5f5f5 0%, #e0e0e0 100%)',
                      borderRadius: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '40px',
                      color: '#aaa',
                      boxShadow: 'inset 0 2px 5px rgba(0,0,0,0.05), 0 4px 8px rgba(0,0,0,0.05)'
                    }}>
                      📷
                    </div>
                  )}
                </td>
                <td><strong style={{ fontSize: '14px' }}>{producto.codigo}</strong></td>
                <td>{producto.nombre}</td>
                <td><span style={{ 
                  background: '#f0f0f0', 
                  padding: '4px 10px', 
                  borderRadius: '20px',
                  fontSize: '12px',
                  display: 'inline-block'
                }}>{producto.marca || 'Sin marca'}</span></td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ 
                    display: 'inline-flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    background: producto.stock <= producto.stockMinimo ? '#FFF5F5' : '#F0FFF4',
                    padding: '5px 12px',
                    borderRadius: '12px',
                    minWidth: '60px'
                  }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '20px',
                      color: producto.stock <= producto.stockMinimo ? '#dc3545' : '#28a745'
                    }}>
                      {producto.stock}
                    </span>
                    <small style={{ color: '#666', fontSize: '10px' }}>
                      Mín: {producto.stockMinimo}
                    </small>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>S/ {producto.precioCompra?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#0066cc', fontSize: '16px' }}>
                  S/ {producto.precioVenta?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => onActualizarStock(producto, 1)}
                      style={{
                        background: 'linear-gradient(135deg, #28a745 0%, #1e7e34 100%)',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(40,167,69,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => onActualizarStock(producto, -1)}
                      disabled={producto.stock <= 0}
                      style={{
                        background: 'linear-gradient(135deg, #ffc107 0%, #e0a800 100%)',
                        color: '#000',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: producto.stock <= 0 ? 'not-allowed' : 'pointer',
                        border: 'none',
                        transition: 'all 0.2s',
                        opacity: producto.stock <= 0 ? 0.6 : 1
                      }}
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => onEditar && onEditar(producto)}
                      style={{
                        background: 'linear-gradient(135deg, #0066cc 0%, #004d99 100%)',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,102,204,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onEliminar(producto.codigo)}
                      style={{
                        background: 'linear-gradient(135deg, #dc3545 0%, #b02a37 100%)',
                        padding: '8px 16px',
                        fontSize: '14px',
                        fontWeight: 'bold',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(220,53,69,0.4)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leyenda de colores */}
      <div style={{ 
        display: 'flex', 
        gap: '25px', 
        justifyContent: 'flex-end',
        marginTop: '20px',
        padding: '12px 25px',
        background: '#f8f9fa',
        borderRadius: '12px',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#FFF5F5', borderLeft: '3px solid #dc3545', borderRadius: '4px' }}></div>
          <span>Stock bajo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#28a745', fontSize: '14px' }}>⬆️</span>
          <span>Incrementar stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ffc107', fontSize: '14px' }}>⬇️</span>
          <span>Reducir stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#0066cc', fontSize: '14px' }}>✏️</span>
          <span>Editar producto</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#dc3545', fontSize: '14px' }}>🗑️</span>
          <span>Eliminar producto</span>
        </div>
      </div>

      {modalFoto && (
        <ModalFoto 
          foto={modalFoto} 
          onClose={() => setModalFoto(null)} 
        />
      )}
    </>
  );
};

export default TablaProductos;