import { useState, useEffect } from 'react';
import { getProducts, saveSaleAndDeductStock } from '../../utils/store';
import { useAuth } from '../../contexts/AuthContext';
import { generateReceiptPDF } from '../../utils/receiptGenerator';
import { Plus, Minus, Trash2, Printer, Download, Receipt, ShoppingCart, Search, Check } from 'lucide-react';

export default function PointOfSale() {
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState([]);
  const [customerName, setCustomerName] = useState('');
  const { user } = useAuth();
  const [lastSale, setLastSale] = useState(null);

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filtered = products.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const addToCart = (product) => {
    console.log('FISBOT_POS: Agregando al carrito:', product.name, product.id);
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert('Stock insuficiente para este producto.');
          return prev; 
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      if (product.stock <= 0) {
        alert('Este producto no tiene stock disponible.');
        return prev;
      }
      // Por defecto agregar precio normal
      return [...prev, { ...product, quantity: 1, activePrice: product.price, priceType: 'normal' }];
    });
  };

  const togglePrice = (productId) => {
    setCart(prev => prev.map(item => {
      if (item.id === productId) {
        const isWholesale = item.priceType === 'wholesale';
        return { 
          ...item, 
          priceType: isWholesale ? 'normal' : 'wholesale',
          activePrice: isWholesale ? item.price : item.wholesalePrice
        };
      }
      return item;
    }));
  };

  const updateQuantity = (productId, qty) => {
    if (qty <= 0) {
      setCart(prev => prev.filter(item => item.id !== productId));
      return;
    }
    const product = products.find(p => p.id === productId);
    if (product && qty > product.stock) return;

    setCart(prev => prev.map(item => item.id === productId ? { ...item, quantity: qty } : item));
  };

  const cartTotal = cart.reduce((sum, item) => sum + (item.activePrice * item.quantity), 0);

  const handleGenerateReceipt = (e) => {
    e.preventDefault();
    if (cart.length === 0) {
      alert("No hay productos en la lista.");
      return;
    }
    if (!customerName.trim()) {
      alert("El nombre del cliente es obligatorio.");
      return;
    }

    // Save logic
    const saleObj = {
      items: cart,
      customerName,
      total: cartTotal,
      sellerName: user.name,
      sellerId: user.id
    };

    const newSale = saveSaleAndDeductStock(saleObj);
    setLastSale(newSale);
    setCart([]);
    setCustomerName('');
    
    // Refresh products stock view
    setProducts(getProducts());
  };

  if (lastSale) {
    return (
      <div className="glass-panel text-center animate-fade-in" style={{ padding: '3rem 2rem' }}>
        <div className="d-flex justify-center mb-4"><Receipt size={64} className="text-success" /></div>
        <h2 className="text-2xl font-bold mb-2">¡Venta Completada!</h2>
        <p className="text-muted mb-6">Recibo generado con éxito: <strong className="text-primary">{lastSale.receiptNumber}</strong></p>
        
        <div className="d-flex gap-4 justify-center">
          <button className="btn btn-secondary" onClick={() => generateReceiptPDF(lastSale, 'download')}>
            <Download size={18} /> Descargar PDF
          </button>
          <button className="btn btn-primary" onClick={() => generateReceiptPDF(lastSale, 'print')}>
            <Printer size={18} /> Imprimir Recibo
          </button>
        </div>
        
        <button className="btn mt-6" onClick={() => setLastSale(null)} style={{ textDecoration: 'underline' }}>
          Realizar nueva venta
        </button>
      </div>
    );
  }

  return (
    <div className="pos-container gap-6">
      {/* Product List */}
      <div className="glass-panel pos-catalog d-flex flex-col">
        <h3 className="font-bold text-xl mb-4 text-primary text-center w-100">CATÁLOGO DE PRODUCTOS</h3>
        
        <div className="mb-4 position-relative d-flex align-center" style={{ position: 'relative' }}>
          <Search size={18} className="text-muted" style={{ position: 'absolute', left: '1rem' }} />
          <input 
            type="text" 
            placeholder="Buscar por nombre..."
            className="input-base"
            style={{ paddingLeft: '2.5rem', width: '100%' }}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="pos-grid-container" style={{ overflowY: 'auto', flex: 1 }}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map(p => (
              <div key={p.id} className="glass-card d-flex flex-col justify-between" style={{ padding: '0.75rem', minHeight: '100px' }}>
                <div className="mb-2">
                  <p className="font-bold text-sm truncate">{p.name}</p>
                  <p className="text-xs text-muted">Stock: <span className={p.stock < 5 ? 'text-danger font-bold' : ''}>{p.stock}</span></p>
                </div>
                <div className="d-flex justify-between align-center">
                  <span className="text-primary font-bold text-sm">Bs. {(Number(p.price) || 0).toFixed(2)}</span>
                  <button 
                    className={`btn ${cart.some(item => item.id === p.id) ? 'btn-success' : 'btn-secondary'}`}
                    style={{ padding: '0.4rem', borderRadius: '50%' }}
                    onClick={() => {
                        const inCart = cart.find(item => item.id === p.id);
                        if (inCart) {
                            updateQuantity(p.id, 0); // Toggle off (remove)
                        } else {
                            addToCart(p); // Toggle on (add)
                        }
                    }}
                    disabled={p.stock <= 0}
                  >
                    {cart.some(item => item.id === p.id) ? <Check size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && <p className="text-muted text-sm text-center mt-6">No hay resultados.</p>}
        </div>
      </div>

      {/* Cart & Checkout */}
      <div className="glass-panel d-flex flex-col pos-cart">
        <h3 className={`font-bold text-lg mb-4 ${cart.length > 0 ? 'text-success' : 'text-secondary'} d-flex align-center gap-2`}>
          <ShoppingCart size={20} /> VENTA ACTUAL
        </h3>

        <div className="cart-items-container" style={{ overflowY: 'auto', flexGrow: 1, marginBottom: '1rem' }}>
          {cart.length === 0 ? (
            <p className="text-muted text-center text-sm mt-8">El carrito está vacío.</p>
          ) : (
            <div className="d-flex flex-col gap-3">
              {cart.map(item => (
                <div key={item.id} className="glass-card" style={{ padding: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <div className="d-flex justify-between align-start mb-2">
                    <p className="text-xs font-bold truncate" style={{ maxWidth: '70%' }}>{item.name}</p>
                    <button onClick={() => updateQuantity(item.id, 0)} className="text-danger" style={{ background: 'none', border: 'none' }}><Trash2 size={16}/></button>
                  </div>
                  
                  <div className="d-flex justify-between align-center flex-wrap gap-2">
                    <div className="d-flex flex-col">
                      <span className="text-sm text-primary font-bold">Bs. {((Number(item.activePrice) || 0) * item.quantity).toFixed(2)}</span>
                      <button 
                         onClick={() => togglePrice(item.id)} 
                         className={`badge mt-1 ${item.priceType === 'wholesale' ? 'badge-green' : 'badge-blue'}`}
                         style={{ cursor: 'pointer', border: 'none', fontSize: '0.6rem', alignSelf: 'flex-start' }}
                      >
                         {item.priceType === 'wholesale' ? 'MAYOR' : 'NORMAL'}
                      </button>
                    </div>

                    <div className="d-flex align-center gap-2 glass-panel" style={{ padding: '0.25rem 0.5rem', borderRadius: 'var(--radius-sm)' }}>
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-secondary p-1" style={{ width: '24px', height: '24px' }}><Minus size={12}/></button>
                      <span className="text-sm font-bold min-w-[20px] text-center">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-secondary p-1" style={{ width: '24px', height: '24px' }} disabled={item.quantity >= item.stock}><Plus size={12}/></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <form onSubmit={handleGenerateReceipt} style={{ borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
          <div className="d-flex justify-between mb-4">
            <span className="text-muted">Subtotal items ({cart.reduce((a, b) => a + b.quantity, 0)})</span>
            <span className="font-bold text-xl text-primary">Bs. {(Number(cartTotal) || 0).toFixed(2)}</span>
          </div>
          
          <div className="mb-4">
            <label className="text-xs text-muted d-flex mb-1">Nombre del Cliente *</label>
            <input 
              type="text" 
              className="input-base"
              placeholder="Ej. María Gómez"
              required
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
            />
          </div>

          <div className="d-flex gap-2 mt-6 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ flex: 1, padding: '0.75rem' }}
              onClick={() => {
                if (window.confirm('¿Desea cancelar la venta actual y limpiar el carrito?')) {
                  setCart([]);
                  setCustomerName('');
                }
              }}
              disabled={cart.length === 0}
            >
              Cancelar Venta
            </button>
            <button 
              type="submit" 
              className="btn btn-success" 
              style={{ flex: 2, padding: '0.75rem' }}
              disabled={cart.length === 0}
            >
              <Printer size={18} /> Generar Recibo
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
