import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Users, PackageSearch, LayoutDashboard, Receipt } from 'lucide-react';
import PointOfSale from './admin/PointOfSale';
import ManageProducts from './admin/ManageProducts';
import ManageUsers from './admin/ManageUsers';
import DashboardOverview from './admin/DashboardOverview';

export default function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'seller'] },
    { path: '/admin/pos', label: 'Punto de Venta', icon: Receipt, roles: ['owner', 'seller'] }, 
    { path: '/admin/products', label: 'Catálogo', icon: PackageSearch, roles: ['owner', 'seller'] },
    { path: '/admin/users', label: 'Cuentas TIENDA', icon: Users, roles: ['owner'] },
  ];

  return (
    <div className="animate-fade-in d-flex flex-col md:flex-row gap-6" style={{ minHeight: '70vh' }}>
      {/* Sidebar */}
      <aside className="glass-panel" style={{ width: '100%', maxWidth: '250px', padding: '1.5rem', flexShrink: 0, height: 'fit-content' }}>
        <div className="mb-6 pb-4" style={{ borderBottom: '1px solid var(--surface-border)' }}>
          <h3 className="font-bold text-lg mb-1">{user.name}</h3>
          <span className="badge badge-green">Rol: {user.role === 'owner' ? 'MASTER' : 'TIENDA'}</span>
        </div>
        
        <nav className="d-flex flex-col gap-2">
          {navItems.filter(item => item.roles.includes(user.role)).map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (location.pathname === '/admin/' && item.path === '/admin');
            return (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`btn ${isActive ? 'btn-primary' : 'btn-secondary'} d-flex justify-start`}
                style={{ padding: '0.75rem 1rem' }}
              >
                <Icon size={18} /> {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="glass-panel" style={{ flexGrow: 1, padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<DashboardOverview />} />
          <Route path="/products" element={<ManageProducts />} />
          <Route path="/pos" element={<PointOfSale />} />
          <Route path="/users" element={<ManageUsers />} />
        </Routes>
      </div>
    </div>
  );
}
