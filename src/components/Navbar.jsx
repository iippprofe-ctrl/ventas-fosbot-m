import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, PackageSearch, MapPin, ExternalLink } from 'lucide-react';
import { getSettings } from '../utils/store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const settings = getSettings();

  return (
    <nav className="glass-panel" style={{ 
      position: 'sticky', top: '10px', zIndex: 100, 
      margin: '10px 1.5rem', padding: '1rem 2rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div className="d-flex align-center gap-3">
        <Link to="/" className="d-flex align-center gap-1" style={{ color: 'var(--text-main)' }}>
          <img src="logo.png" alt="Logo" style={{ height: '55px', objectFit: 'contain' }} />
          <span className="font-bold text-2xl" style={{ fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--primary-color)' }}>
            FISBOT MAKER
          </span>
        </Link>
      </div>

      <div className="d-flex align-center gap-4">
        <a 
          href={settings.location || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-sm font-bold text-muted hover:text-secondary d-flex align-center gap-1"
          style={{ transition: '0.3s' }}
        >
          <MapPin size={16} /> UBICACIÓN
        </a>

        <Link to="/" className="text-sm font-bold text-muted hover:text-primary" style={{ transition: '0.3s' }}>
          CATÁLOGO
        </Link>
        
        {/* Only show cart for public buyers, sellers will have POS module */}
        {!user || user.role === 'buyer' ? (
          <Link to="/checkout" className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            <ShoppingCart size={18} />
            {cartItemCount > 0 && (
              <span className="badge badge-blue">{cartItemCount}</span>
            )}
          </Link>
        ) : null}

        {user ? (
          <div className="d-flex align-center gap-3">
            <Link to="/admin" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
              <PackageSearch size={18} /> Panel ({user.role})
            </Link>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '0.5rem' }}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-secondary" style={{ padding: '0.5rem 1.5rem' }}>
            <User size={18} /> Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
