import React, { useState, useEffect } from 'react';
import { obtenerProductos, guardarProducto } from '../services/db';
import Alerta from '../components/Alerta';
import logo from '../assets/logo.jpg';

const Facturacion = () => {
  const [productos, setProductos] = useState([]);
  const [items, setItems] = useState([{ id: 1, sku: '', cantidad: 1, producto: null }]);
  const [nextId, setNextId] = useState(2);
  const [alerta, setAlerta] = useState(null);
  const [cliente, setCliente] = useState({
    ruc: '',
    nombre: '',
    direccion: '',
    telefono: '',
    email: '',
    formaPago: 'contado'
  });
  const [tipoDoc, setTipoDoc] = useState('boleta');

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      const data = await obtenerProductos();
      setProductos(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    }
  };

  const handleClienteChange = (e) => {
    const { name, value } = e.target;
    setCliente({ ...cliente, [name]: value });
  };

  const agregarItem = () => {
    setItems([...items, { id: nextId, sku: '', cantidad: 1, producto: null }]);
    setNextId(nextId + 1);
  };

  const eliminarItem = (id) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    } else {
      mostrarAlerta('Debe haber al menos un producto', 'error');
    }
  };

  const handleItemChange = (id, campo, valor) => {
    const nuevosItems = items.map(item => {
      if (item.id === id) {
        if (campo === 'sku') {
          const producto = productos.find(p => p.codigo === valor);
          return { ...item, sku: valor, producto };
        }
        return { ...item, [campo]: valor };
      }
      return item;
    });
    setItems(nuevosItems);
  };

  const calcularSubtotal = () => {
    return items.reduce((total, item) => {
      if (item.producto && item.cantidad) {
        return total + (item.producto.precioVenta * item.cantidad);
      }
      return total;
    }, 0);
  };

  const calcularIGV = () => {
    return calcularSubtotal() * 0.18;
  };

  const calcularTotal = () => {
    return calcularSubtotal() + calcularIGV();
  };

  const generarComprobante = async () => {
    if (!cliente.nombre) {
      mostrarAlerta('Ingrese el nombre del cliente', 'error');
      return;
    }

    if (!cliente.ruc && tipoDoc === 'factura') {
      mostrarAlerta('La factura requiere RUC', 'error');
      return;
    }

    const itemsValidos = items.filter(item => item.producto && item.cantidad > 0);
    if (itemsValidos.length === 0) {
      mostrarAlerta('Agregue al menos un producto', 'error');
      return;
    }

    for (const item of itemsValidos) {
      if (item.cantidad > item.producto.stock) {
        mostrarAlerta(`Stock insuficiente para ${item.producto.nombre}`, 'error');
        return;
      }
    }

    const serie = tipoDoc === 'factura' ? 'F001' : 'B001';
    const numero = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    const fecha = new Date().toLocaleString('es-PE');

    const comprobante = {
      tipo: tipoDoc,
      serie,
      numero,
      fecha,
      cliente,
      items: itemsValidos.map(item => ({
        codigo: item.producto.codigo,
        nombre: item.producto.nombre,
        cantidad: item.cantidad,
        precioUnitario: item.producto.precioVenta,
        total: item.producto.precioVenta * item.cantidad
      })),
      subtotal: calcularSubtotal(),
      igv: calcularIGV(),
      total: calcularTotal()
    };

    try {
      for (const item of itemsValidos) {
        const productoActualizado = {
          ...item.producto,
          stock: item.producto.stock - item.cantidad
        };
        await guardarProducto(productoActualizado);
      }

      mostrarComprobante(comprobante);
      limpiarFormulario();
      mostrarAlerta('✅ Comprobante generado y stock actualizado', 'success');
    } catch (error) {
      console.error(error);
      mostrarAlerta('❌ Error al generar comprobante', 'error');
    }
  };

  const mostrarComprobante = (doc) => {
    const printWindow = window.open('', '_blank');
    
    const itemsHtml = doc.items.map(item => `
      <tr>
        <td>${item.codigo}</td>
        <td>${item.nombre}</td>
        <td align="center">${item.cantidad}</td>
        <td align="right">S/ ${item.precioUnitario.toFixed(2)}</td>
        <td align="right">S/ ${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html>
      <head>
        <title>${doc.tipo === 'factura' ? 'Factura' : 'Boleta'} Electrónica - FRANCO'S LOCK</title>
        <style>
          body { font-family: 'Courier New', monospace; padding: 30px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; border-bottom: 2px dashed #000; padding-bottom: 20px; margin-bottom: 20px; }
          .logo { max-width: 100px; margin-bottom: 10px; }
          .empresa { font-size: 24px; font-weight: bold; color: #0066cc; }
          .cliente { background: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th { background: #000; color: white; padding: 10px; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .totales { text-align: right; margin-top: 20px; }
          .total-final { font-size: 20px; font-weight: bold; color: #0066cc; }
          .footer { text-align: center; margin-top: 30px; font-size: 12px; border-top: 1px solid #ccc; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <img src="${logo}" class="logo" />
          <div class="empresa">FRANCO'S LOCK</div>
          <div>RUC: 20XXXXXXXXX9</div>
          <div>Av. Principal 456 - Lima</div>
          <div>Tel: (01) 123-4567</div>
          <hr>
          <h2>${doc.tipo === 'factura' ? 'FACTURA ELECTRÓNICA' : 'BOLETA ELECTRÓNICA'}</h2>
          <div style="font-size: 18px;">${doc.serie}-${doc.numero}</div>
          <div>Fecha: ${doc.fecha}</div>
        </div>

        <div class="cliente">
          <div><strong>RUC/DNI:</strong> ${doc.cliente.ruc || '-'}</div>
          <div><strong>Cliente:</strong> ${doc.cliente.nombre}</div>
          <div><strong>Dirección:</strong> ${doc.cliente.direccion || '-'}</div>
          <div><strong>Forma de pago:</strong> ${doc.cliente.formaPago.toUpperCase()}</div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Código</th>
              <th>Producto</th>
              <th>Cant.</th>
              <th>P.Unit</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="totales">
          <div>Subtotal: S/ ${doc.subtotal.toFixed(2)}</div>
          <div>IGV (18%): S/ ${doc.igv.toFixed(2)}</div>
          <div class="total-final">TOTAL: S/ ${doc.total.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Representación impresa de la ${doc.tipo} electrónica</p>
          <p>Consulte en www.sunat.gob.pe</p>
          <p>¡Gracias por su preferencia!</p>
        </div>
      </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  };

  const limpiarFormulario = () => {
    setCliente({
      ruc: '',
      nombre: '',
      direccion: '',
      telefono: '',
      email: '',
      formaPago: 'contado'
    });
    setItems([{ id: 1, sku: '', cantidad: 1, producto: null }]);
    setNextId(2);
    setTipoDoc('boleta');
  };

  const mostrarAlerta = (mensaje, tipo) => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };

  return (
    <div className="container">
      {alerta && <Alerta {...alerta} onClose={() => setAlerta(null)} />}
      
      {/* Header con logo */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '20px',
        paddingBottom: '10px',
        borderBottom: '2px solid #0066cc'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <img 
            src={logo} 
            alt="FRANCO'S LOCK" 
            style={{ height: '150px', width: 'auto', borderRadius: '5px' }} 
          />
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0066cc' }}>
            FRANCO'SLOCK
          </span>
        </div>
        <div style={{ background: '#f0f7ff', padding: '8px 15px', borderRadius: '20px' }}>
          Usuario: <strong>{localStorage.getItem('usuario')}</strong>
        </div>
      </div>

      <h1 style={{ color: '#0066cc' }}>🧾 Facturación Electrónica</h1>

      {/* Tipo de documento */}
      <div style={{ 
        display: 'flex', 
        gap: '30px', 
        margin: '20px 0', 
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        borderLeft: '4px solid #0066cc'
      }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="radio" 
            name="tipoDoc" 
            value="boleta" 
            checked={tipoDoc === 'boleta'}
            onChange={(e) => setTipoDoc(e.target.value)}
          /> BOLETA ELECTRÓNICA
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input 
            type="radio" 
            name="tipoDoc" 
            value="factura"
            checked={tipoDoc === 'factura'}
            onChange={(e) => setTipoDoc(e.target.value)}
          /> FACTURA ELECTRÓNICA
        </label>
      </div>

      {/* Datos del cliente */}
      <div className="form-container" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0066cc' }}>📋 Datos del Cliente</h2>
        <div className="form-grid">
          <div className="form-group">
            <label>RUC / DNI:</label>
            <input 
              type="text" 
              name="ruc"
              value={cliente.ruc}
              onChange={handleClienteChange}
              placeholder="10XXXXXXXXX"
            />
          </div>
          <div className="form-group">
            <label>Nombre / Razón Social:</label>
            <input 
              type="text" 
              name="nombre"
              value={cliente.nombre}
              onChange={handleClienteChange}
              placeholder="Juan Pérez"
            />
          </div>
          <div className="form-group">
            <label>Dirección:</label>
            <input 
              type="text" 
              name="direccion"
              value={cliente.direccion}
              onChange={handleClienteChange}
              placeholder="Av. Principal 123"
            />
          </div>
          <div className="form-group">
            <label>Teléfono:</label>
            <input 
              type="text" 
              name="telefono"
              value={cliente.telefono}
              onChange={handleClienteChange}
              placeholder="987654321"
            />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input 
              type="email" 
              name="email"
              value={cliente.email}
              onChange={handleClienteChange}
              placeholder="cliente@email.com"
            />
          </div>
          <div className="form-group">
            <label>Forma de Pago:</label>
            <select 
              name="formaPago"
              value={cliente.formaPago}
              onChange={handleClienteChange}
            >
              <option value="contado">CONTADO</option>
              <option value="credito">CRÉDITO</option>
              <option value="tarjeta">TARJETA</option>
            </select>
          </div>
        </div>
      </div>

      {/* Productos */}
      <div className="form-container" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0066cc' }}>🛒 Productos</h2>
        
        {items.map((item) => (
          <div key={item.id} style={{ 
            display: 'flex', 
            gap: '10px', 
            marginBottom: '15px',
            padding: '15px',
            background: '#f8f9fa',
            borderRadius: '8px',
            alignItems: 'center'
          }}>
            <select
              value={item.sku}
              onChange={(e) => handleItemChange(item.id, 'sku', e.target.value)}
              style={{ 
                flex: 2,
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px'
              }}
            >
              <option value="">-- Seleccionar producto --</option>
              {productos
                .filter(p => p.stock > 0)
                .map(p => (
                  <option key={p.codigo} value={p.codigo}>
                    {p.codigo} - {p.nombre} (Stock: {p.stock})
                  </option>
                ))
              }
            </select>

            <input
              type="number"
              min="1"
              value={item.cantidad}
              onChange={(e) => handleItemChange(item.id, 'cantidad', parseInt(e.target.value) || 1)}
              style={{ 
                width: '80px',
                padding: '10px',
                border: '2px solid #e0e0e0',
                borderRadius: '5px'
              }}
            />

            <div style={{ 
              width: '120px',
              padding: '10px',
              background: '#fff',
              border: '2px solid #e0e0e0',
              borderRadius: '5px',
              textAlign: 'right'
            }}>
              {item.producto ? `S/ ${(item.producto.precioVenta * item.cantidad).toFixed(2)}` : 'S/ 0.00'}
            </div>

            <button 
              onClick={() => eliminarItem(item.id)}
              style={{ 
                background: '#dc3545',
                padding: '10px 15px'
              }}
            >
              ✕
            </button>
          </div>
        ))}

        <button 
          onClick={agregarItem}
          style={{ 
            background: '#28a745',
            marginTop: '10px'
          }}
        >
          ➕ Agregar Producto
        </button>
      </div>

      {/* Totales */}
      <div style={{ 
        background: 'linear-gradient(135deg, #000000 0%, #333333 100%)',
        color: 'white',
        padding: '25px',
        borderRadius: '8px',
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
          <span>Op. Gravadas:</span>
          <span>S/ {calcularSubtotal().toFixed(2)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0' }}>
          <span>IGV (18%):</span>
          <span style={{ color: '#ffd700' }}>S/ {calcularIGV().toFixed(2)}</span>
        </div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          padding: '10px 0',
          fontSize: '24px',
          fontWeight: 'bold',
          borderTop: '2px solid #0066cc',
          marginTop: '10px'
        }}>
          <span>TOTAL:</span>
          <span>S/ {calcularTotal().toFixed(2)}</span>
        </div>
      </div>

      {/* Botones */}
      <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
        <button 
          className="primary" 
          onClick={generarComprobante}
          style={{ padding: '15px 40px' }}
        >
          🚀 EMITIR COMPROBANTE
        </button>
        <button 
          onClick={limpiarFormulario}
          style={{ background: '#6c757d', padding: '15px 40px' }}
        >
          🧹 NUEVO
        </button>
      </div>

      {/* Mensaje SUNAT */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '15px',
        background: '#e8f4fd',
        borderRadius: '8px',
        fontSize: '12px',
        color: '#0066cc'
      }}>
        ⚡ Representación impresa de la {tipoDoc} electrónica. Consulte en www.sunat.gob.pe
      </div>
    </div>
  );
};

export default Facturacion;