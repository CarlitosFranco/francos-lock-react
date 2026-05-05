import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import './style/App.css';

import Login from './pages/Login';
import Inventario from './pages/Inventario';
import Historial from './pages/Historial';
import Facturacion from './pages/Facturacion';
import Navbar from './components/Navbar';

const RutaProtegida = ({ children }) => {
  return localStorage.getItem('logueado') === 'true' ? children : <Navigate to="/" />;
};

function App() {
  return (
    <HashRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/inventario" element={<RutaProtegida><Inventario /></RutaProtegida>} />
        <Route path="/historial" element={<RutaProtegida><Historial /></RutaProtegida>} />
        <Route path="/facturacion" element={<RutaProtegida><Facturacion /></RutaProtegida>} />
      </Routes>
    </HashRouter>
  );
}

export default App;