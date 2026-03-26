import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { CartProvider } from './contexts/CartContext'

// Inicializar la base de datos mock antes de montar la app
import { initStore } from './utils/store'

console.log('FISBOT: Iniciando aplicación...');
initStore()
  .then(() => {
    console.log('FISBOT: Almacén inicializado. Montando React...');
    const rootElement = document.getElementById('root');
    if (!rootElement) throw new Error('No se encontró el elemento root');
    
    ReactDOM.createRoot(rootElement).render(
      <React.StrictMode>
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <App />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </React.StrictMode>,
    );
  })
  .catch((err) => {
    console.error('FISBOT: Error crítico al iniciar', err);
    // Intentar montar de todos modos con datos locales
    ReactDOM.createRoot(document.getElementById('root')).render(<div>Error al cargar la aplicación. Revisa la consola.</div>);
  });
