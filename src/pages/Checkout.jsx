import { useCart } from '../contexts/CartContext';
import { useState } from 'react';
import { Trash2, Plus, Minus, Send, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getSettings } from '../utils/store';

export default function Checkout() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const [customerName, setCustomerName] = useState('');

  const handleWhatsappReservation = () => {
    if (!customerName.trim()) {
      alert("Por favor, ingrese su nombre para la reserva.");
      return;
    }

    let message = `*NUEVA RESERVA - FISBOT MAKER*\n\n`;
    message += `Cliente: ${customerName}\n\n`;
    message += `*Detalle del pedido:*\n`;
    
    cart.forEach(item => {
      message += `- ${item.quantity}x ${item.name} (Bs. ${parseFloat(item.price).toFixed(2)})\n`;
    });
    
    message += `\n*TOTAL: Bs. ${parseFloat(cartTotal).toFixed(2)}*\n\n`;
    message += `¡Hola! Me gustaría confirmar esta reserva.`;

    const encoded = encodeURIComponent(message);
    const settings = getSettings();
    const phone = settings.whatsapp;
    
    window.open(`https://wa.me/${phone}?text=${encoded}`, '_blank');
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <div className="text-center mt-6 animate-fade-in glass-panel" style={{ padding: '4rem 2rem' }}>
        <ShoppingBag size={48} className="text-muted mb-4 mx-auto d-flex justify-center" style={{ margin: '0 auto 1rem auto' }} />
        <h2 className="text-2xl mb-4 text-main">Tu carrito está vacío</h2>
        <Link to="/" className="btn btn-primary mt-4">Explorar el Catálogo</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <h2 className="text-2xl mb-6 font-bold text-primary">Resumen del Carrito</h2>
        
        <div className="d-flex flex-col gap-4">
          {cart.map(item => (
            <div key={item.id} className="d-flex justify-between align-center glass-card" style={{ padding: '1rem', border: '1px solid var(--surface-border)' }}>
              <div className="d-flex align-center gap-4">
                <img src={item.image || 'https://via.placeholder.com/60'} alt={item.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }} />
                <div>
                  <h4 className="font-bold text-sm md:text-base">{item.name}</h4>
                  <p className="text-muted text-sm">Bs. {parseFloat(item.price).toFixed(2)} c/u</p>
                </div>
              </div>
              
              <div className="d-flex align-center gap-3">
                <div className="d-flex align-center gap-2">
                  <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }}><Minus size={14}/></button>
                  <span className="font-bold" style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="btn btn-secondary" style={{ padding: '0.25rem 0.5rem' }} disabled={item.quantity >= item.stock}><Plus size={14}/></button>
                </div>
                <button onClick={() => removeFromCart(item.id)} className="text-danger" style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0.5rem' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 pt-4 d-flex justify-between align-center" style={{ borderTop: '1px solid var(--surface-border)' }}>
          <span className="font-bold text-xl text-muted">Total General:</span>
          <span className="font-bold text-2xl text-primary">Bs. {parseFloat(cartTotal).toFixed(2)}</span>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '2rem', height: 'fit-content' }}>
        <h2 className="text-xl mb-4 font-bold text-secondary">Datos para la Reserva</h2>
        <div className="mb-6">
          <label className="text-muted text-sm d-flex mb-2">Nombre Completo *</label>
          <input 
            type="text" 
            className="input-base" 
            placeholder="Ej. Juan Pérez" 
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>
        <button 
          className="btn btn-success" 
          style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}
          onClick={handleWhatsappReservation}
        >
          <Send size={20} /> Enviar Reserva por WhatsApp
        </button>
        <p className="text-xs text-muted mt-4 text-center">
          Al enviar la reserva, serás redirigido a WhatsApp de FISBOT MAKER para coordinar el pago y la entrega.
        </p>
      </div>
    </div>
  );
}
