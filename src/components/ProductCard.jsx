import { ShoppingCart, Check } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart, cart } = useCart();
  const { user } = useAuth();
  
  const isInCart = cart.some(item => item.id === product.id);
  
  return (
    <div className="glass-card d-flex flex-col" style={{ height: '100%', padding: '1rem' }}>
      <img 
        src={product.image || 'https://via.placeholder.com/300'} 
        alt={product.name} 
        style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
      />
      <div className="mt-4 flex-col d-flex justify-between" style={{ flexGrow: 1 }}>
        <div>
          <span className="badge badge-green mb-2">{product.category}</span>
          <h3 className="text-lg font-bold" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{product.name}</h3>
          <p className="text-muted text-sm mt-1" style={{ display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3em' }}>{product.description}</p>
        </div>
        <div className="mt-4 d-flex justify-between align-end">
          <div className="d-flex flex-col">
            <span className="text-primary font-bold text-xl">Bs. {(Number(product.price) || 0).toFixed(2)}</span>
            <span className="text-muted" style={{ fontSize: '0.7rem', marginTop: '-2px' }}>
              Precio por mayor: Bs. {(Number(product.wholesalePrice) || 0).toFixed(2)}
            </span>
          </div>
          {(!user || user.role === 'buyer') && (
            <button 
              className={`btn ${isInCart ? 'btn-success' : 'btn-primary'}`} 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              style={{ padding: '0.4rem 0.8rem' }}
            >
              {product.stock > 0 ? (
                isInCart ? <Check size={16} /> : <ShoppingCart size={16} />
              ) : 'Agotado'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
