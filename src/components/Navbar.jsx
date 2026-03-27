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
      margin: '10px 1.5rem', padding: '0.75rem 1.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <div className="d-flex align-center gap-3">
        <Link to="/" className="d-flex align-center gap-1" style={{ color: 'var(--text-main)' }}>
          <img src="logo.png" alt="Logo" style={{ height: '45px', objectFit: 'contain' }} />
          <span className="brand-name font-bold text-xl" style={{ fontFamily: 'var(--font-display)', letterSpacing: '1px', color: 'var(--primary-color)' }}>
            FISBOT MAKER
          </span>
        </Link>
      </div>

      {/* Mobile Toggle */}
      <button className="mobile-toggle btn btn-secondary" onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ display: 'none', padding: '0.5rem' }}>
        <User size={20} />
      </button>

      <div className={`nav-links d-flex align-center gap-4 ${isMenuOpen ? 'open' : ''}`}>
        <a 
          href={settings.location || '#'} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="nav-link text-sm font-bold text-muted hover:text-secondary d-flex align-center gap-1"
        >
          <MapPin size={16} /> <span className="hide-mobile">UBICACIÓN</span>
        </a>

        <Link to="/" className="nav-link text-sm font-bold text-muted hover:text-primary">
          CATÁLOGO
        </Link>
        
        {!user || user.role === 'buyer' ? (
          <Link to="/checkout" className="nav-link btn btn-secondary" style={{ padding: '0.4rem 0.8rem' }}>
            <ShoppingCart size={18} />
            {cartItemCount > 0 && <span className="badge badge-blue">{cartItemCount}</span>}
          </Link>
        ) : null}

        {user ? (
          <div className="d-flex align-center gap-2">
            <Link to="/admin" className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}>
              <PackageSearch size={18} /> <span className="hide-mobile">Panel</span>
            </Link>
            <button onClick={logout} className="btn btn-danger" style={{ padding: '0.4rem' }}>
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-secondary login-btn" style={{ padding: '0.5rem 1rem' }}>
             Iniciar Sesión
          </Link>
        )}
      </div>
    </nav>
  );
}
