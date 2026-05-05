import React, { useState, useEffect, useCallback } from 'react';
import { obtenerProductos, guardarProducto, eliminarProducto } from '../services/db';
import TablaProductos from '../components/TablaProductos';
import Alerta from '../components/Alerta';
import logo from '../assets/logo.jpg';

const Inventario = () => {
  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [modalFoto, setModalFoto] = useState(null);
  const [alerta, setAlerta] = useState(null);
  const [cargando, setCargando] = useState(true);
  
  const [formData, setFormData] = useState({
    codigo: '',
    nombre: '',
    marca: '',
    stock: 1,
    precioCompra: '',
    precioVenta: '',
    stockMinimo: 2,
    notas: '',
    foto: ''
  });

  // ============================================
  // FUNCIÓN PARA ORDENAR PRODUCTOS POR MARCA (ALFABÉTICO)
  // ============================================
  const ordenarPorMarca = useCallback((productosArray) => {
    return [...productosArray].sort((a, b) => {
      const marcaA = (a.marca || "").toLowerCase();
      const marcaB = (b.marca || "").toLowerCase();
      
      if (marcaA < marcaB) return -1;
      if (marcaA > marcaB) return 1;
      
      // Si la marca es igual, ordenar por nombre
      const nombreA = (a.nombre || "").toLowerCase();
      const nombreB = (b.nombre || "").toLowerCase();
      if (nombreA < nombreB) return -1;
      if (nombreA > nombreB) return 1;
      return 0;
    });
  }, []);

  // ============================================
  // FUNCIÓN PARA CARGAR PRODUCTOS
  // ============================================
  const cargarProductos = useCallback(async () => {
    setCargando(true);
    try {
      const data = await obtenerProductos();
      const productosOrdenados = ordenarPorMarca(data);
      setProductos(productosOrdenados);
      setProductosFiltrados(productosOrdenados);
    } catch (error) {
      console.error("❌ Error cargando productos:", error);
    } finally {
      setCargando(false);
    }
  }, [ordenarPorMarca]);

  // ============================================
  // useEffect PARA CARGA INICIAL
  // ============================================
  useEffect(() => {
    cargarProductos();
  }, [cargarProductos]);

  // ============================================
  // useEffect PARA FILTRAR Y ORDENAR
  // ============================================
  useEffect(() => {
    if (!busqueda.trim()) {
      const ordenados = ordenarPorMarca(productos);
      setProductosFiltrados(ordenados);
    } else {
      const filtrados = productos.filter(p => 
        p.codigo?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.marca?.toLowerCase().includes(busqueda.toLowerCase())
      );
      const ordenados = ordenarPorMarca(filtrados);
      setProductosFiltrados(ordenados);
    }
  }, [busqueda, productos, ordenarPorMarca]);

  // ============================================
  // MOSTRAR ALERTA
  // ============================================
  const mostrarAlerta = (mensaje, tipo) => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };

  // ============================================
  // MANEJAR CAMBIOS EN FORMULARIO
  // ============================================
  const handleInputChange = (e) => {
    const { id, value, files } = e.target;
    
    if (id === 'fotoInput' && files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData({ ...formData, foto: e.target.result });
      };
      reader.readAsDataURL(files[0]);
    } else {
      setFormData({ ...formData, [id]: value });
    }
  };

  // ============================================
  // GUARDAR PRODUCTO
  // ============================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.codigo || !formData.nombre) {
      mostrarAlerta('CÓDIGO y NOMBRE son obligatorios', 'error');
      return;
    }

    const productoExistente = productos.find(p => 
      p.codigo === formData.codigo.toUpperCase()
    );

    if (productoExistente) {
      mostrarAlerta('❌ Ya existe un producto con ese código', 'error');
      return;
    }

    try {
      await guardarProducto({
        codigo: formData.codigo.toUpperCase(),
        nombre: formData.nombre,
        marca: formData.marca,
        stock: parseInt(formData.stock) || 0,
        precioCompra: parseFloat(formData.precioCompra) || 0,
        precioVenta: parseFloat(formData.precioVenta) || 0,
        stockMinimo: parseInt(formData.stockMinimo) || 2,
        notas: formData.notas,
        foto: formData.foto
      });
      
      mostrarAlerta('✅ Producto guardado correctamente', 'success');
      limpiarFormulario();
      cargarProductos();
    } catch (error) {
      console.error(error);
      mostrarAlerta('❌ Error al guardar el producto', 'error');
    }
  };

  // ============================================
  // ACTUALIZAR STOCK
  // ============================================
  const actualizarStock = async (producto, cambio) => {
    const nuevoStock = producto.stock + cambio;
    if (nuevoStock < 0) {
      mostrarAlerta('❌ No hay suficiente stock', 'error');
      return;
    }
    
    try {
      await guardarProducto({
        ...producto,
        stock: nuevoStock
      });
      cargarProductos();
      mostrarAlerta(`✅ Stock ${cambio > 0 ? 'incrementado' : 'reducido'}`, 'success');
    } catch (error) {
      console.error(error);
      mostrarAlerta('❌ Error al actualizar stock', 'error');
    }
  };

  // ============================================
  // ELIMINAR PRODUCTO
  // ============================================
  const eliminarProductoHandler = async (codigo) => {
    if (window.confirm('¿Estás seguro de eliminar este producto?')) {
      try {
        await eliminarProducto(codigo);
        cargarProductos();
        mostrarAlerta('✅ Producto eliminado', 'success');
      } catch (error) {
        console.error(error);
        mostrarAlerta('❌ Error al eliminar producto', 'error');
      }
    }
  };

  // ============================================
  // LIMPIAR FORMULARIO
  // ============================================
  const limpiarFormulario = () => {
    setFormData({
      codigo: '',
      nombre: '',
      marca: '',
      stock: 1,
      precioCompra: '',
      precioVenta: '',
      stockMinimo: 2,
      notas: '',
      foto: ''
    });
    const fileInput = document.getElementById('fotoInput');
    if (fileInput) fileInput.value = '';
  };

  // ============================================
  // PANTALLA DE CARGA
  // ============================================
  if (cargando) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <h2>Cargando inventario...</h2>
        </div>
      </div>
    );
  }

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
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
            style={{ height: '50px', width: 'auto', borderRadius: '5px' }} 
          />
          <span style={{ fontSize: '22px', fontWeight: 'bold', color: '#0066cc' }}>
            FRANCO'S LOCK
          </span>
        </div>
        <div style={{ background: '#f0f7ff', padding: '8px 15px', borderRadius: '20px' }}>
          Usuario: <strong>{localStorage.getItem('usuario')}</strong>
        </div>
      </div>

      <h1>📋 Control de Inventario</h1>
      
      {/* Tabla de productos */}
      <div style={{ marginBottom: '40px' }}>
        <h2>📦 Stock Actual</h2>
        
        <input
          type="text"
          className="buscador"
          placeholder="🔍 Buscar por CÓDIGO, nombre o marca..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
        
        <TablaProductos 
          productos={productosFiltrados}
          onActualizarStock={actualizarStock}
          onEliminar={eliminarProductoHandler}
          onVerFoto={setModalFoto}
          modalFoto={modalFoto}
          setModalFoto={setModalFoto}
        />
      </div>
      
      {/* Formulario para agregar productos */}
      <div className="form-container">
        <h2>➕ Agregar Nuevo Producto</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="form-group">
              <label>CÓDIGO <span style={{ color: '#dc3545' }}>*</span></label>
              <input 
                type="text" 
                id="codigo" 
                value={formData.codigo} 
                onChange={handleInputChange} 
                placeholder="Ej: REN-CLIO-2015"
                required
              />
            </div>
            
            <div className="form-group">
              <label>NOMBRE <span style={{ color: '#dc3545' }}>*</span></label>
              <input 
                type="text" 
                id="nombre" 
                value={formData.nombre} 
                onChange={handleInputChange} 
                placeholder="Ej: Llave Renault Clio"
                required
              />
            </div>
            
            <div className="form-group">
              <label>MARCA</label>
              <input 
                type="text" 
                id="marca" 
                value={formData.marca} 
                onChange={handleInputChange} 
                placeholder="Ej: Renault"
              />
            </div>
            
            <div className="form-group">
              <label>STOCK INICIAL</label>
              <input 
                type="number" 
                id="stock" 
                value={formData.stock} 
                onChange={handleInputChange} 
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>PRECIO COMPRA (S/)</label>
              <input 
                type="number" 
                id="precioCompra" 
                value={formData.precioCompra} 
                onChange={handleInputChange} 
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>PRECIO VENTA (S/)</label>
              <input 
                type="number" 
                id="precioVenta" 
                value={formData.precioVenta} 
                onChange={handleInputChange} 
                step="0.01"
                min="0"
              />
            </div>
            
            <div className="form-group">
              <label>STOCK MÍNIMO</label>
              <input 
                type="number" 
                id="stockMinimo" 
                value={formData.stockMinimo} 
                onChange={handleInputChange} 
                min="1"
              />
            </div>
            
            <div className="form-group">
              <label>FOTO</label>
              <input 
                type="file" 
                id="fotoInput" 
                accept="image/*" 
                onChange={handleInputChange} 
              />
            </div>
            
            <div className="form-group" style={{ gridColumn: 'span 2' }}>
              <label>NOTAS TÉCNICAS</label>
              <textarea 
                id="notas" 
                rows="3" 
                value={formData.notas} 
                onChange={handleInputChange} 
                placeholder="Frecuencia, transpondedor, programación..."
              />
            </div>
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <button type="submit" className="primary" style={{ padding: '12px 40px', fontSize: '16px' }}>
              ✅ GUARDAR PRODUCTO
            </button>
            <button 
              type="button" 
              onClick={limpiarFormulario} 
              style={{ background: '#666', padding: '12px 40px', fontSize: '16px' }}
            >
              🧹 LIMPIAR
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Inventario;