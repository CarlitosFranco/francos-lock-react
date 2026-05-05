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
        borderRadius: '16px',
        margin: '20px 0',
        border: '1px dashed #0066cc'
      }}>
        <span style={{ fontSize: '64px', display: 'block', marginBottom: '20px' }}>📭</span>
        <h3 style={{ color: '#666', marginBottom: '10px' }}>No hay productos en el inventario</h3>
        <p style={{ color: '#999' }}>Agrega tu primer producto usando el formulario de abajo</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto', borderRadius: '12px' }}>
        <table>
          <thead>
            <tr>
              <th style={{ textAlign: 'center', width: '100px' }}>📷 FOTO</th>
              <th>CÓDIGO</th>
              <th>NOMBRE</th>
              <th>MARCA</th>
              <th style={{ textAlign: 'center' }}>STOCK</th>
              <th style={{ textAlign: 'right' }}>P. COMPRA</th>
              <th style={{ textAlign: 'right' }}>P. VENTA</th>
              <th style={{ textAlign: 'center' }}>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr 
                key={producto.codigo} 
                className={producto.stock <= producto.stockMinimo ? 'bajo-stock' : ''}
                style={{ transition: 'background 0.2s' }}
              >
                <td style={{ textAlign: 'center' }}>
                  {producto.foto ? (
                    <div className="foto-container" style={{ position: 'relative', display: 'inline-block' }}>
                      <img 
                        src={producto.foto} 
                        className="foto-producto"
                        onClick={() => onVerFoto(producto.foto)}
                        alt={producto.nombre}
                        style={{
                          width: '75px',
                          height: '75px',
                          objectFit: 'cover',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                          border: hoverFoto === producto.codigo ? '2px solid #0066cc' : '2px solid transparent'
                        }}
                        onMouseEnter={(e) => {
                          setHoverFoto(producto.codigo);
                          e.currentTarget.style.transform = 'scale(1.1)';
                          e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,102,204,0.3)';
                        }}
                        onMouseLeave={(e) => {
                          setHoverFoto(null);
                          e.currentTarget.style.transform = 'scale(1)';
                          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                        }}
                      />
                      <div className="foto-badge" style={{
                        position: 'absolute',
                        bottom: '5px',
                        right: '5px',
                        background: '#0066cc',
                        color: 'white',
                        borderRadius: '20px',
                        padding: '2px 6px',
                        fontSize: '10px',
                        opacity: hoverFoto === producto.codigo ? 1 : 0,
                        transition: 'opacity 0.3s',
                        pointerEvents: 'none'
                      }}>
                        🔍
                      </div>
                    </div>
                  ) : (
                    <div className="foto-placeholder" style={{
                      width: '75px',
                      height: '75px',
                      background: 'linear-gradient(135deg, #f5f5f5 0%, #e0e0e0 100%)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '32px',
                      color: '#999',
                      boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.05)'
                    }}>
                      📷
                    </div>
                  )}
                </td>
                <td><strong>{producto.codigo}</strong></td>
                <td>{producto.nombre}</td>
                <td>{producto.marca || '-'}</td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      color: producto.stock <= producto.stockMinimo ? '#dc3545' : '#28a745'
                    }}>
                      {producto.stock}
                    </span>
                    <small style={{ color: '#666', fontSize: '10px' }}>
                      Mín: {producto.stockMinimo}
                    </small>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</td>
                <td style={{ textAlign: 'right', fontWeight: 'bold', color: '#0066cc' }}>
                  S/ {producto.precioVenta?.toFixed(2) || '0.00'}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => onActualizarStock(producto, 1)}
                      className="btn-stock btn-stock-up"
                      title="Aumentar stock"
                      style={{
                        background: '#28a745',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        fontWeight: 'bold',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => onActualizarStock(producto, -1)}
                      className="btn-stock btn-stock-down"
                      title="Disminuir stock"
                      disabled={producto.stock <= 0}
                      style={{
                        background: '#ffc107',
                        color: '#000',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        cursor: producto.stock <= 0 ? 'not-allowed' : 'pointer',
                        border: 'none',
                        fontWeight: 'bold',
                        transition: 'all 0.2s',
                        opacity: producto.stock <= 0 ? 0.5 : 1
                      }}
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => onEditar && onEditar(producto)}
                      className="btn-edit"
                      title="Editar producto"
                      style={{
                        background: '#0066cc',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onEliminar(producto.codigo)}
                      className="btn-delete"
                      title="Eliminar producto"
                      style={{
                        background: '#dc3545',
                        padding: '8px 14px',
                        fontSize: '14px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
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

      {/* Leyenda de colores mejorada */}
      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        justifyContent: 'flex-end',
        marginTop: '20px',
        padding: '12px 20px',
        background: '#f8f9fa',
        borderRadius: '12px',
        fontSize: '12px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', background: '#ffebee', borderLeft: '3px solid #dc3545', borderRadius: '3px' }}></div>
          <span>Stock bajo</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#28a745', fontSize: '16px' }}>⬆️</span>
          <span>Incrementar stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#ffc107', fontSize: '16px' }}>⬇️</span>
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