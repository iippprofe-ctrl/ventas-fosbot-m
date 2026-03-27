// Configuración de la API
const API_URL = import.meta.env.VITE_API_URL || 'https://script.google.com/macros/s/AKfycbw9hsnnInJgV8adCLvfhfRX3tEvaiYBOEUYq_xu58YfA-MbdYTLPk7UXcvYcQqx3Bbk/exec';
const API_TOKEN = import.meta.env.VITE_API_TOKEN || 'FISBOT_SECURITY_TOKEN_123';

const INITIAL_PRODUCTS = [
  {
    id: 'p1',
    name: 'Kit Resonador Cerámico Sensible',
    description: 'Componente electrónico para control de oscilación preciso.',
    price: 15.50,
    wholesalePrice: 12.00,
    category: 'Componentes Electrónicos',
    stock: 50,
    image: 'https://images.unsplash.com/photo-1517077304055-6e89abbf09b0?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    provider: 'P1'
  },
  {
    id: 'p4',
    name: 'Placa PCB Prototipado Rápido',
    description: 'Matriz de puntos para soldar componentes electrónicos rápida.',
    price: 35.00,
    wholesalePrice: 30.00,
    category: 'Robótica',
    subcategory: 'Placas PCB',
    stock: 100,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80',
    provider: 'P1'
  }
];

const DEFAULT_SETTINGS = {
  whatsapp: '59100000000',
  providers: ['P1', 'P2', 'P3'],
  categories: ['Componentes Electrónicos', 'Robótica', 'Sensores', 'Herramientas'],
  location: 'https://goo.gl/maps/example',
  master_user: 'admin',
  master_pass: 'admin'
};

/**
 * Sincronización Asíncrona con la Nube (Google Sheets)
 */
const syncToCloud = async (sheetName, data) => {
  if (!API_URL) return;
  try {
    fetch(API_URL, {
      method: 'POST',
      body: JSON.stringify({
        apiKey: API_TOKEN,
        action: 'saveTable',
        sheetName: sheetName,
        data: data
      })
    });
    console.log(`FISBOT_CLOUD: Sync ${sheetName} enviado.`);
  } catch (e) {
    console.error(`FISBOT_CLOUD: Error al sincronizar ${sheetName}`, e);
  }
};

export const initStore = async () => {
  // 1. Cargar datos locales iniciales de forma inmediata (Síncrono)
  if (!localStorage.getItem('fisbot_products')) {
    localStorage.setItem('fisbot_products', JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem('fisbot_sales')) {
    localStorage.setItem('fisbot_sales', JSON.stringify([]));
  }
  if (!localStorage.getItem('fisbot_users_db')) {
    localStorage.setItem('fisbot_users_db', JSON.stringify([]));
  }
  if (!localStorage.getItem('fisbot_settings')) {
    localStorage.setItem('fisbot_settings', JSON.stringify(DEFAULT_SETTINGS));
  }

  // 2. Ejecutar la sincronización con la nube en SEGUNDO PLANO
  // No usamos 'await' aquí para que la app no se bloquee si Google tarda en responder
  if (API_URL) {
    console.log('FISBOT_CLOUD: Iniciando sincronización en segundo plano...');
    fetch(API_URL)
      .then(res => res.json())
      .then(cloudDb => {
        // Solo sobreescribir si hay datos reales en la nube
        if (cloudDb.productos && Array.isArray(cloudDb.productos) && cloudDb.productos.length > 0) {
            const parsed = cloudDb.productos.map(p => ({
                ...p,
                price: Number(p.price) || 0,
                wholesalePrice: Number(p.wholesalePrice) || 0,
                stock: Number(p.stock) || 0
            }));
            localStorage.setItem('fisbot_products', JSON.stringify(parsed));
            console.log('FISBOT_CLOUD: Catálogo actualizado desde la nube.');
        }
        
        if (cloudDb.ventas && Array.isArray(cloudDb.ventas) && cloudDb.ventas.length > 0) {
            const parsed = cloudDb.ventas.map(v => ({
                ...v,
                total: Number(v.total) || 0,
                items: Array.isArray(v.items) ? v.items.map(it => ({
                    ...it,
                    price: Number(it.price) || 0,
                    wholesalePrice: Number(it.wholesalePrice) || 0,
                    quantity: Number(it.quantity) || 0
                })) : []
            }));
            localStorage.setItem('fisbot_sales', JSON.stringify(parsed));
        }

        if (cloudDb.usuarios && Array.isArray(cloudDb.usuarios) && cloudDb.usuarios.length > 0) {
            localStorage.setItem('fisbot_users_db', JSON.stringify(cloudDb.usuarios));
        }

        if (cloudDb.configuracion && Array.isArray(cloudDb.configuracion)) {
            const config = {};
            cloudDb.configuracion.forEach(item => { 
                let val = item.value;
                try { 
                  if (typeof val === 'string' && (val.startsWith('[') || val.startsWith('{'))) {
                    val = JSON.parse(val); 
                  }
                } catch(e) {}
                config[item.key] = val; 
            });
            if (Object.keys(config).length > 0) {
              const current = JSON.parse(localStorage.getItem('fisbot_settings') || '{}');
              localStorage.setItem('fisbot_settings', JSON.stringify({ ...current, ...config }));
              console.log('FISBOT_CLOUD: Ajustes actualizados desde la nube.');
            }
        }
        window.dispatchEvent(new Event('fisbot_settings_updated'));
      })
      .catch(e => {
        console.warn('FISBOT_CLOUD: Trabajando en modo local (sin conexión a la nube).', e);
      });
  }

  return true; // Retornamos inmediatamente
};

export const getSettings = () => {
  const raw = localStorage.getItem('fisbot_settings');
  let saved = {};
  try {
    saved = JSON.parse(raw || '{}');
  } catch (e) {
    console.error('FISBOT_ERROR: Settings parse failed', e);
  }
  const merged = { ...DEFAULT_SETTINGS, ...saved };
  if (merged.whatsapp) merged.whatsapp = String(merged.whatsapp).replace(/\D/g, '');
  return merged;
};

export const saveSettings = (settings) => {
  const toSave = { ...getSettings(), ...settings };
  if (toSave.whatsapp) {
    toSave.whatsapp = String(toSave.whatsapp).replace(/\D/g, '');
  }
  localStorage.setItem('fisbot_settings', JSON.stringify(toSave));
  
  // Sincronizar (formato llave-valor para GAS)
  const configArray = Object.entries(toSave).map(([key, value]) => ({ key, value }));
  syncToCloud('configuracion', configArray);
  
  window.dispatchEvent(new Event('fisbot_settings_updated'));
};

export const getProducts = () => JSON.parse(localStorage.getItem('fisbot_products') || '[]');

export const saveProduct = (product) => {
  const products = getProducts();
  const index = products.findIndex(p => p.id === product.id);
  if (index >= 0) {
    products[index] = product;
  } else {
    products.push({ ...product, id: Date.now().toString() });
  }
  localStorage.setItem('fisbot_products', JSON.stringify(products));
  syncToCloud('productos', products);
};

export const deleteProduct = (id) => {
  const products = getProducts().filter(p => p.id !== id);
  localStorage.setItem('fisbot_products', JSON.stringify(products));
  syncToCloud('productos', products);
};

export const saveSaleAndDeductStock = (saleObj) => {
  const products = getProducts();
  saleObj.items.forEach(cartItem => {
    const pIndex = products.findIndex(p => p.id === cartItem.id);
    if (pIndex >= 0) {
      products[pIndex].stock = Math.max(0, products[pIndex].stock - cartItem.quantity);
    }
  });
  localStorage.setItem('fisbot_products', JSON.stringify(products));
  syncToCloud('productos', products);

  const sales = JSON.parse(localStorage.getItem('fisbot_sales') || '[]');
  const newSale = {
    ...saleObj,
    receiptNumber: `FBM-${1000 + sales.length}`,
    timestamp: new Date().toISOString()
  };
  sales.push(newSale);
  localStorage.setItem('fisbot_sales', JSON.stringify(sales));
  syncToCloud('ventas', sales);
  
  return newSale;
};

export const getSales = () => JSON.parse(localStorage.getItem('fisbot_sales') || '[]');

export const clearSales = () => {
  localStorage.setItem('fisbot_sales', JSON.stringify([]));
  syncToCloud('ventas', []);
};

export const getUsers = () => JSON.parse(localStorage.getItem('fisbot_users_db') || '[]');

export const saveUser = (user) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === user.id);
  if (index >= 0) {
    users[index] = user;
  } else {
    users.push({ ...user, id: Date.now().toString() });
  }
  localStorage.setItem('fisbot_users_db', JSON.stringify(users));
  syncToCloud('usuarios', users);
};

export const deleteUser = (id) => {
  const users = getUsers().filter(u => u.id !== id);
  localStorage.setItem('fisbot_users_db', JSON.stringify(users));
  syncToCloud('usuarios', users);
};

