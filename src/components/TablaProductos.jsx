import React from 'react';
import ModalFoto from './ModalFoto';

const TablaProductos = ({ 
  productos, 
  onActualizarStock, 
  onEliminar, 
  onEditar,  // ← Función para editar
  onVerFoto,
  modalFoto,
  setModalFoto
}) => {
  
  if (!productos || productos.length === 0) {
    return (
      <div style={{ 
        textAlign: 'center', 
        padding: '50px', 
        background: '#f8f9fa',
        borderRadius: '8px',
        margin: '20px 0'
      }}>
        <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📭</span>
        <h3 style={{ color: '#666' }}>No hay productos en el inventario</h3>
        <p style={{ color: '#999' }}>Agrega tu primer producto usando el formulario de abajo</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>FOTO</th>
              <th>CÓDIGO</th>
              <th>NOMBRE</th>
              <th>MARCA</th>
              <th>STOCK</th>
              <th>P. COMPRA</th>
              <th>P. VENTA</th>
              <th>ACCIONES</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr 
                key={producto.codigo} 
                className={producto.stock <= producto.stockMinimo ? 'bajo-stock' : ''}
              >
                <td>
                  {producto.foto ? (
                    <img 
                      src={producto.foto} 
                      className="foto-preview" 
                      onClick={() => onVerFoto(producto.foto)}
                      alt={producto.nombre}
                      title="Click para ver imagen grande"
                    />
                  ) : (
                    <div style={{ 
                      width: '60px', 
                      height: '60px', 
                      background: '#f0f0f0',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      color: '#999'
                    }}>
                      📷
                    </div>
                  )}
                </td>
                <td><strong>{producto.codigo}</strong></td>
                <td>{producto.nombre}</td>
                <td>{producto.marca || '-'}</td>
                <td>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ 
                      fontWeight: 'bold', 
                      fontSize: '18px',
                      color: producto.stock <= producto.stockMinimo ? '#dc3545' : '#28a745'
                    }}>
                      {producto.stock}
                    </span>
                    <small style={{ color: '#666' }}>
                      Mín: {producto.stockMinimo}
                    </small>
                  </div>
                </td>
                <td>S/ {producto.precioCompra?.toFixed(2) || '0.00'}</td>
                <td style={{ fontWeight: 'bold', color: '#0066cc' }}>
                  S/ {producto.precioVenta?.toFixed(2) || '0.00'}
                </td>
                <td>
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button 
                      onClick={() => onActualizarStock(producto, 1)}
                      style={{ 
                        background: '#28a745',
                        padding: '8px 12px',
                        fontSize: '14px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white'
                      }}
                      title="Agregar uno al stock"
                    >
                      +1
                    </button>
                    <button 
                      onClick={() => onActualizarStock(producto, -1)}
                      style={{ 
                        background: '#ffc107',
                        color: '#000',
                        padding: '8px 12px',
                        fontSize: '14px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: 'none'
                      }}
                      title="Quitar uno del stock"
                      disabled={producto.stock <= 0}
                    >
                      -1
                    </button>
                    <button 
                      onClick={() => onEditar && onEditar(producto)}
                      style={{ 
                        background: '#0066cc',
                        padding: '8px 12px',
                        fontSize: '14px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white'
                      }}
                      title="Editar producto"
                    >
                      ✏️
                    </button>
                    <button 
                      onClick={() => onEliminar(producto.codigo)}
                      style={{ 
                        background: '#dc3545',
                        padding: '8px 12px',
                        fontSize: '14px',
                        borderRadius: '5px',
                        cursor: 'pointer',
                        border: 'none',
                        color: 'white'
                      }}
                      title="Eliminar producto"
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
        gap: '20px', 
        justifyContent: 'flex-end',
        marginTop: '15px',
        padding: '10px',
        background: '#f8f9fa',
        borderRadius: '5px',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', background: '#ffebee', border: '1px solid #dc3545' }}></div>
          <span>Stock bajo (menor al mínimo)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#28a745' }}>⬆️</span>
          <span>Incrementar stock</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#0066cc' }}>✏️</span>
          <span>Editar producto</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <span style={{ color: '#dc3545' }}>🗑️</span>
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