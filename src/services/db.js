// ========================================
// FRANCO'S LOCK - SERVICIO DE BASE DE DATOS
// ========================================

const DB_NOMBRE = "InventarioCerrajeria";  // ← CORREGIDO: mismo nombre que usas en la carga
const DB_VERSION = 1;

let db = null;

/**
 * Inicializa la base de datos
 */
export const inicializarDB = () => {
  return new Promise((resolve, reject) => {
    if (db) {
      resolve(db);
      return;
    }

    const request = indexedDB.open(DB_NOMBRE, DB_VERSION);

    request.onerror = (event) => {
      console.error("Error al abrir DB:", event.target.error);
      reject(event.target.error);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("✅ Base de datos conectada");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // Store de productos
      if (!db.objectStoreNames.contains("productos")) {
        const store = db.createObjectStore("productos", { keyPath: "codigo" });
        store.createIndex("nombre", "nombre", { unique: false });
        store.createIndex("marca", "marca", { unique: false });
        console.log("✅ Store 'productos' creado");
      }

      // Store de historial
      if (!db.objectStoreNames.contains("historial")) {
        const store = db.createObjectStore("historial", { keyPath: "id", autoIncrement: true });
        store.createIndex("codigo", "codigo", { unique: false });
        store.createIndex("fecha", "fecha", { unique: false });
        store.createIndex("tipo", "tipo", { unique: false });
        console.log("✅ Store 'historial' creado");
      }

      // Store de documentos (facturas/boletas)
      if (!db.objectStoreNames.contains("documentos")) {
        const store = db.createObjectStore("documentos", { keyPath: "id", autoIncrement: true });
        store.createIndex("folio", "folio", { unique: true });
        store.createIndex("fecha", "fecha", { unique: false });
        console.log("✅ Store 'documentos' creado");
      }

      console.log("✅ Estructura de DB completa");
    };
  });
};

/**
 * Obtiene todos los productos
 */
export const obtenerProductos = async () => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    try {
      const transaction = database.transaction(["productos"], "readonly");
      const store = transaction.objectStore("productos");
      const request = store.getAll();

      request.onsuccess = () => {
        console.log(`📦 Productos obtenidos: ${request.result.length}`);
        resolve(request.result);
      };
      request.onerror = () => reject(request.error);
    } catch (error) {
      console.error("Error al obtener productos:", error);
      resolve([]);
    }
  });
};

/**
 * Obtiene un producto por su código
 */
export const obtenerProductoPorCodigo = async (codigo) => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["productos"], "readonly");
    const store = transaction.objectStore("productos");
    const request = store.get(codigo);

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

/**
 * Agrega o actualiza un producto
 */
export const guardarProducto = async (producto) => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["productos", "historial"], "readwrite");
    const store = transaction.objectStore("productos");
    
    const request = store.put(producto);

    request.onsuccess = () => {
      // Registrar en historial
      const historialStore = transaction.objectStore("historial");
      historialStore.add({
        codigo: producto.codigo,
        nombre: producto.nombre,
        tipo: 'actualizacion',
        cantidad: producto.stock,
        fecha: new Date().toLocaleString('es-PE'),
        usuario: localStorage.getItem('usuario') || 'carlos'
      });
      
      resolve(request.result);
    };
    
    request.onerror = () => reject(request.error);
  });
};

/**
 * Elimina un producto
 */
export const eliminarProducto = async (codigo) => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["productos", "historial"], "readwrite");
    const store = transaction.objectStore("productos");
    
    const getRequest = store.get(codigo);
    
    getRequest.onsuccess = () => {
      const producto = getRequest.result;
      
      if (!producto) {
        reject(new Error("Producto no encontrado"));
        return;
      }
      
      const deleteRequest = store.delete(codigo);
      
      deleteRequest.onsuccess = () => {
        const historialStore = transaction.objectStore("historial");
        historialStore.add({
          codigo: codigo,
          nombre: producto.nombre,
          tipo: 'eliminacion',
          fecha: new Date().toLocaleString('es-PE'),
          usuario: localStorage.getItem('usuario') || 'carlos'
        });
        
        resolve();
      };
      
      deleteRequest.onerror = () => reject(deleteRequest.error);
    };
  });
};

/**
 * Obtiene el historial con filtros opcionales
 */
export const obtenerHistorial = async (filtros = {}) => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["historial"], "readonly");
    const store = transaction.objectStore("historial");
    const request = store.getAll();

    request.onsuccess = () => {
      let resultados = request.result;
      
      resultados.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      
      if (filtros.codigo) {
        resultados = resultados.filter(r => 
          r.codigo?.toLowerCase().includes(filtros.codigo.toLowerCase())
        );
      }
      
      if (filtros.tipo) {
        resultados = resultados.filter(r => r.tipo === filtros.tipo);
      }
      
      resolve(resultados);
    };
    
    request.onerror = () => reject(request.error);
  });
};

/**
 * Registra un movimiento en el historial
 */
export const registrarMovimiento = async (movimiento) => {
  const database = await inicializarDB();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(["historial"], "readwrite");
    const store = transaction.objectStore("historial");
    
    const movimientoCompleto = {
      ...movimiento,
      fecha: movimiento.fecha || new Date().toLocaleString('es-PE'),
      usuario: movimiento.usuario || localStorage.getItem('usuario') || 'carlos'
    };
    
    const request = store.add(movimientoCompleto);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};