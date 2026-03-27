import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { ShoppingCart, User, LogOut, PackageSearch, MapPin, ExternalLink } from 'lucide-react';
import { getSettings } from '../utils/store';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cartItemCount } = useCart();
  const settings = getSettings();

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="glass-panel navbar" style={{ 
      position: 'sticky', top: '10px', zIndex: 1000, 
      margin: '10px 0.5rem', padding: '0.5rem 0.75rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      gap: '0.5rem'
    }}>
      <div className="d-flex align-center">
        <Link to="/" className="d-flex align-center" style={{ color: 'var(--text-main)' }}>
          <img src="logo.png" alt="Logo" style={{ height: '35px', objectFit: 'contain' }} />
          <span className="brand-name font-bold text-lg ml-2 hide-mobile" style={{ fontFamily: 'var(--font-display)', letterSpacing: '0.5px', color: 'var(--primary-color)' }}>
            FISBOT MAKER
          </span>
        </Link>
      </div>

      <div className="nav-links d-flex align-center gap-2 sm:gap-3">
        <a 
          href={settings.location || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="btn btn-secondary p-2"
          title="Ubicación"
        >
          <MapPin size={18} />
        </a>

        <Link to="/" className="btn btn-secondary p-2" title="Catálogo">
          <PackageSearch size={18} />
        </Link>
        
        {!user || user.role === 'buyer' ? (
          <Link to="/checkout" className="btn btn-secondary p-2 position-relative">
            <ShoppingCart size={18} />
            {cartItemCount > 0 && <span className="badge badge-blue" style={{ position: 'absolute', top: '-5px', right: '-5px', fontSize: '0.6rem', padding: '2px 4px' }}>{cartItemCount}</span>}
          </Link>
        ) : null}

        {user ? (
          <div className="d-flex align-center gap-2">
            <Link to="/admin" className="btn btn-primary p-2" title="Panel">
              <Users size={18} />
            </Link>
            <button onClick={logout} className="btn btn-danger p-2">
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-secondary p-2" title="Iniciar Sesión">
             <User size={18} />
          </Link>
        )}
      </div>
    </nav>
  );
}
