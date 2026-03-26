import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getSettings } from './utils/store';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Checkout from './pages/Checkout';
import AdminLayout from './pages/AdminLayout';
import Login from './pages/Login';

// Podremos construir el ProductDetail luego si es necesario
const ProductDetail = () => <div className="text-center mt-6">Detalle de Producto en construcción</div>;

function App() {
  return (
    <div className="flex-col d-flex" style={{ minHeight: '100vh' }}>
      <Navbar />
      <main className="container" style={{ flexGrow: 1, padding: '2rem 1.5rem', width: '100%' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/*" element={<AdminLayout />} />
        </Routes>
      </main>
      <footer className="glass-panel text-center text-muted" style={{ padding: '2rem', marginTop: 'auto', borderBottom: 'none', borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
        <p>© 2026 FISBOT MAKER. Líder en robótica educativa.</p>
        <p className="text-sm mt-1">📍 Zona Villa Dolores, Plaza Juana Azurduy</p>
      </footer>

      {/* Botón flotante de WhatsApp */}
      <a 
        href={`https://wa.me/${getSettings().whatsapp}?text=Hola%20FISBOT%20MAKER,%20me%20gustaría%20contactarme%20con%20ustedes.`} 
        target="_blank" 
        rel="noopener noreferrer"
        className="d-flex align-center gap-2 animate-fade-in"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: '#25D366',
          color: '#fff',
          padding: '0.8rem 1.5rem',
          borderRadius: '50px',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(37, 211, 102, 0.4)',
          zIndex: 1000,
          textDecoration: 'none',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease'
        }}
        onMouseOver={e => e.currentTarget.style.transform = 'scale(1.05)'}
        onMouseOut={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>
        </svg>
        CONTACTAR
      </a>
    </div>
  );
}

export default App;
