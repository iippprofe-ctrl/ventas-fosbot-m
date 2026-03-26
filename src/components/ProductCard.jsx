import { ShoppingCart } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const { user } = useAuth();
  
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
          <h3 className="text-lg">{product.name}</h3>
          <p className="text-muted text-sm mt-2">{product.description}</p>
        </div>
        <div className="mt-4 d-flex justify-between align-center">
          <span className="text-primary font-bold text-xl">Bs. {parseFloat(product.price).toFixed(2)}</span>
          {(!user || user.role === 'buyer') && (
            <button 
              className="btn btn-primary" 
              onClick={() => addToCart(product)}
              disabled={product.stock <= 0}
              style={{ padding: '0.5rem 1rem' }}
            >
              {product.stock > 0 ? <ShoppingCart size={18} /> : 'Agotado'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
