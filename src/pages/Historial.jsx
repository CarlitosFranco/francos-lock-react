import React, { useState, useEffect } from 'react';
import { obtenerHistorial } from '../services/db';
import Alerta from '../components/Alerta';
import logo from '../assets/logo.jpg';

const Historial = () => {
  const [registros, setRegistros] = useState([]);
  const [registrosFiltrados, setRegistrosFiltrados] = useState([]);
  const [alerta, setAlerta] = useState(null);
  const [filtros, setFiltros] = useState({
    codigo: '',
    tipo: '',
    fechaDesde: '',
    fechaHasta: ''
  });
  const [paginaActual, setPaginaActual] = useState(1);
  const registrosPorPagina = 20;

  useEffect(() => {
    cargarHistorial();
  }, []);

  const cargarHistorial = async () => {
    try {
      const data = await obtenerHistorial();
      setRegistros(data);
      setRegistrosFiltrados(data);
    } catch (error) {
      console.error('Error cargando historial:', error);
      mostrarAlerta('❌ Error al cargar el historial', 'error');
    }
  };

  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros({ ...filtros, [name]: value });
  };

  const aplicarFiltros = () => {
    let filtrados = [...registros];

    if (filtros.codigo) {
      filtrados = filtrados.filter(r => 
        r.codigo?.toLowerCase().includes(filtros.codigo.toLowerCase())
      );
    }

    if (filtros.tipo) {
      filtrados = filtrados.filter(r => r.tipo === filtros.tipo);
    }

    if (filtros.fechaDesde) {
      const fechaDesde = new Date(filtros.fechaDesde).setHours(0, 0, 0, 0);
      filtrados = filtrados.filter(r => {
        const fechaReg = new Date(r.fecha).setHours(0, 0, 0, 0);
        return fechaReg >= fechaDesde;
      });
    }

    if (filtros.fechaHasta) {
      const fechaHasta = new Date(filtros.fechaHasta).setHours(23, 59, 59, 999);
      filtrados = filtrados.filter(r => {
        const fechaReg = new Date(r.fecha).getTime();
        return fechaReg <= fechaHasta;
      });
    }

    setRegistrosFiltrados(filtrados);
    setPaginaActual(1);
    mostrarAlerta(`✅ ${filtrados.length} registros encontrados`, 'success');
  };

  const limpiarFiltros = () => {
    setFiltros({
      codigo: '',
      tipo: '',
      fechaDesde: '',
      fechaHasta: ''
    });
    setRegistrosFiltrados(registros);
    setPaginaActual(1);
  };

  const exportarExcel = () => {
    if (registrosFiltrados.length === 0) {
      mostrarAlerta('No hay datos para exportar', 'error');
      return;
    }

    const cabeceras = 'FECHA,CÓDIGO,PRODUCTO,TIPO,CANTIDAD,STOCK ANTERIOR,STOCK NUEVO,DOCUMENTO,USUARIO\n';
    
    const lineas = registrosFiltrados.map(r => {
      const fecha = new Date(r.fecha).toLocaleString('es-PE');
      return `"${fecha}","${r.codigo || ''}","${r.nombre || ''}","${r.tipo || ''}",${r.cantidad || ''},${r.stockAnterior || ''},${r.stockNuevo || ''},"${r.documento || ''}","${r.usuario || ''}"`;
    }).join('\n');

    const csv = cabeceras + lineas;
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const fecha = new Date().toISOString().split('T')[0];
    link.setAttribute('href', url);
    link.setAttribute('download', `FRANCOSLOCK_historial_${fecha}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    mostrarAlerta(`✅ Exportados ${registrosFiltrados.length} registros`, 'success');
  };

  const mostrarAlerta = (mensaje, tipo) => {
    setAlerta({ mensaje, tipo });
    setTimeout(() => setAlerta(null), 3000);
  };

  const getTipoClass = (tipo) => {
    const clases = {
      'entrada': 'tipo-entrada',
      'salida': 'tipo-salida',
      'venta': 'tipo-venta',
      'alta': 'tipo-alta',
      'eliminacion': 'tipo-eliminacion'
    };
    return clases[tipo] || '';
  };

  const getTipoIcono = (tipo) => {
    const iconos = {
      'entrada': '⬆️',
      'salida': '⬇️',
      'venta': '💰',
      'alta': '✨',
      'eliminacion': '🗑️'
    };
    return iconos[tipo] || '📝';
  };

  const getTipoTexto = (tipo) => {
    const textos = {
      'entrada': 'ENTRADA',
      'salida': 'SALIDA',
      'venta': 'VENTA',
      'alta': 'ALTA',
      'eliminacion': 'ELIMINACIÓN'
    };
    return textos[tipo] || tipo?.toUpperCase() || '-';
  };

  const formatearCantidad = (registro) => {
    if (!registro.cantidad) return '-';
    
    if (registro.tipo === 'entrada') {
      return `+${registro.cantidad}`;
    } else if (registro.tipo === 'salida' || registro.tipo === 'venta') {
      return `-${registro.cantidad}`;
    }
    return registro.cantidad;
  };

  const indiceInicio = (paginaActual - 1) * registrosPorPagina;
  const indiceFin = indiceInicio + registrosPorPagina;
  const registrosPagina = registrosFiltrados.slice(indiceInicio, indiceFin);
  const totalPaginas = Math.ceil(registrosFiltrados.length / registrosPorPagina);
  const totalMovimientos = registrosFiltrados.length;
  const totalEntradas = registrosFiltrados.filter(r => r.tipo === 'entrada').length;
  const totalSalidas = registrosFiltrados.filter(r => r.tipo === 'salida' || r.tipo === 'venta').length;

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

      <h1 style={{ color: '#0066cc' }}>📊 Historial de Movimientos</h1>

      {/* Tarjetas de resumen */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '20px',
        margin: '30px 0'
      }}>
        <div style={{ 
          background: '#000',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0066cc' }}>
            {totalMovimientos}
          </div>
          <div>Total Movimientos</div>
        </div>
        
        <div style={{ 
          background: '#000',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#28a745' }}>
            {totalEntradas}
          </div>
          <div>Entradas</div>
        </div>
        
        <div style={{ 
          background: '#000',
          color: 'white',
          padding: '20px',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {totalSalidas}
          </div>
          <div>Salidas / Ventas</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="form-container" style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#0066cc' }}>🔍 Filtrar Movimientos</h2>
        
        <div className="form-grid">
          <div className="form-group">
            <label>CÓDIGO / SKU:</label>
            <input
              type="text"
              name="codigo"
              value={filtros.codigo}
              onChange={handleFiltroChange}
              placeholder="Ej: REN-CLIO-2015"
            />
          </div>

          <div className="form-group">
            <label>TIPO DE MOVIMIENTO:</label>
            <select
              name="tipo"
              value={filtros.tipo}
              onChange={handleFiltroChange}
            >
              <option value="">TODOS</option>
              <option value="entrada">ENTRADA (+)</option>
              <option value="salida">SALIDA (-)</option>
              <option value="venta">VENTA</option>
              <option value="alta">ALTA</option>
              <option value="eliminacion">ELIMINACIÓN</option>
            </select>
          </div>

          <div className="form-group">
            <label>FECHA DESDE:</label>
            <input
              type="date"
              name="fechaDesde"
              value={filtros.fechaDesde}
              onChange={handleFiltroChange}
            />
          </div>

          <div className="form-group">
            <label>FECHA HASTA:</label>
            <input
              type="date"
              name="fechaHasta"
              value={filtros.fechaHasta}
              onChange={handleFiltroChange}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button className="primary" onClick={aplicarFiltros}>
            🔎 APLICAR FILTROS
          </button>
          <button onClick={limpiarFiltros} style={{ background: '#6c757d' }}>
            🧹 LIMPIAR
          </button>
          <button onClick={exportarExcel} style={{ background: '#28a745' }}>
            📥 EXPORTAR EXCEL
          </button>
        </div>
      </div>

      {/* Tabla de historial */}
      <div style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>FECHA</th>
              <th>CÓDIGO</th>
              <th>PRODUCTO</th>
              <th>TIPO</th>
              <th>CANTIDAD</th>
              <th>STOCK ANTERIOR</th>
              <th>STOCK NUEVO</th>
              <th>DOCUMENTO</th>
              <th>USUARIO</th>
            </tr>
          </thead>
          <tbody>
            {registrosPagina.length === 0 ? (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '50px' }}>
                  <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>📭</span>
                  No hay movimientos que mostrar
                </td>
              </tr>
            ) : (
              registrosPagina.map((registro, index) => (
                <tr key={registro.id || index}>
                  <td style={{ fontWeight: 'bold', color: '#0066cc' }}>
                    {new Date(registro.fecha).toLocaleString('es-PE')}
                  </td>
                  <td><strong>{registro.codigo || '-'}</strong></td>
                  <td>{registro.nombre || '-'}</td>
                  <td>
                    <span className={`tipo-badge ${getTipoClass(registro.tipo)}`}>
                      {getTipoIcono(registro.tipo)} {getTipoTexto(registro.tipo)}
                    </span>
                  </td>
                  <td style={{ 
                    fontWeight: 'bold',
                    color: registro.tipo === 'entrada' ? '#28a745' : 
                           registro.tipo === 'salida' || registro.tipo === 'venta' ? '#dc3545' : 'inherit'
                  }}>
                    {formatearCantidad(registro)}
                  </td>
                  <td>
                    {registro.stockAnterior !== undefined ? (
                      <span style={{ color: '#dc3545', textDecoration: 'line-through' }}>
                        {registro.stockAnterior}
                      </span>
                    ) : '-'}
                  </td>
                  <td>
                    {registro.stockNuevo !== undefined ? (
                      <span style={{ color: '#28a745', fontWeight: 'bold' }}>
                        {registro.stockNuevo}
                      </span>
                    ) : '-'}
                  </td>
                  <td>{registro.documento || '-'}</td>
                  <td>{registro.usuario || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '10px', 
          marginTop: '30px' 
        }}>
          <button
            onClick={() => setPaginaActual(p => Math.max(1, p - 1))}
            disabled={paginaActual === 1}
            style={{ 
              background: paginaActual === 1 ? '#ccc' : '#0066cc',
              cursor: paginaActual === 1 ? 'not-allowed' : 'pointer'
            }}
          >
            ◀ Anterior
          </button>
          
          <span style={{ 
            padding: '10px 20px', 
            background: '#000', 
            color: 'white',
            borderRadius: '5px'
          }}>
            Página {paginaActual} de {totalPaginas}
          </span>
          
          <button
            onClick={() => setPaginaActual(p => Math.min(totalPaginas, p + 1))}
            disabled={paginaActual === totalPaginas}
            style={{ 
              background: paginaActual === totalPaginas ? '#ccc' : '#0066cc',
              cursor: paginaActual === totalPaginas ? 'not-allowed' : 'pointer'
            }}
          >
            Siguiente ▶
          </button>
        </div>
      )}
    </div>
  );
};

export default Historial;