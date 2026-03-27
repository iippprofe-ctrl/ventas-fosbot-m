import { useState, useEffect } from 'react';
import { getSales, getProducts, getSettings, saveSettings, clearSales } from '../../utils/store';
import { TrendingUp, Package, Users, ShoppingCart, Settings, RefreshCcw, Smartphone, MapPin, Phone, Hash } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardOverview() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [location, setLocation] = useState('');
  const [categoryList, setCategoryList] = useState([]);
  const [newCategory, setNewCategory] = useState('');
  const [providerList, setProviderList] = useState([]);
  const [newProvider, setNewProvider] = useState('');
  const [masterUser, setMasterUser] = useState('');
  const [masterPass, setMasterPass] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const settings = getSettings();
    setSales(getSales());
    setProducts(getProducts());
    setWhatsapp(settings.whatsapp || '');
    setLocation(settings.location || '');
    setCategoryList(settings.categories || []);
    setProviderList(settings.providers || []);
    setMasterUser(settings.master_user || 'admin');
    setMasterPass(settings.master_pass || 'admin');
  }, []);

  const handleSaveSettings = () => {
    saveSettings({ 
      whatsapp,
      location,
      categories: categoryList,
      providers: providerList,
      master_user: masterUser,
      master_pass: masterPass
    });
    alert('Configuración guardada exitosamente.');
    window.location.reload();
  };

  const syncSettings = (updatedFields) => {
    const current = getSettings();
    saveSettings({ ...current, ...updatedFields });
  };

  const handleAddCategory = () => {
    if (newCategory && !categoryList.includes(newCategory)) {
      const updated = [...categoryList, newCategory];
      setCategoryList(updated);
      syncSettings({ categories: updated });
      setNewCategory('');
    }
  };

  const handleRemoveCategory = (cat) => {
    const updated = categoryList.filter(c => c !== cat);
    setCategoryList(updated);
    syncSettings({ categories: updated });
  };

  const handleAddProvider = () => {
    if (newProvider && !providerList.includes(newProvider)) {
      const updated = [...providerList, newProvider];
      setProviderList(updated);
      syncSettings({ providers: updated });
      setNewProvider('');
    }
  };

  const handleRemoveProvider = (p) => {
    const updated = providerList.filter(item => item !== p);
    setProviderList(updated);
    syncSettings({ providers: updated });
  };

  const handleResetSales = () => {
    if (window.confirm('¿Está ABSOLUTAMENTE seguro de borrar TODO el historial de ventas? Esta acción es irreversible.')) {
      clearSales();
      setSales([]);
    }
  };

  const totalRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const lowStock = products.filter(p => p.stock < 5).length;

  // Revenue by provider
  const revenueByProvider = sales.reduce((acc, sale) => {
    sale.items.forEach(item => {
      const p = item.provider || 'Sin Prov.';
      acc[p] = (acc[p] || 0) + (item.price * item.quantity);
    });
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold mb-6 text-primary">Panel de Control General</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--primary-color)' }}>
          <div className="d-flex justify-between align-center mb-2">
            <span className="text-muted text-sm">Ventas Totales</span>
            <TrendingUp size={20} className="text-primary" />
          </div>
          <p className="text-2xl font-bold">Bs. {totalRevenue.toFixed(2)}</p>
          <p className="text-xs text-muted mt-2">{sales.length} transacciones registradas</p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--secondary-color)' }}>
          <div className="d-flex justify-between align-center mb-2">
            <span className="text-muted text-sm">Ventas por Proveedor</span>
            <Package size={20} className="text-secondary" />
          </div>
          <div className="d-flex flex-col gap-1 mt-1">
            {Object.entries(revenueByProvider).map(([p, r]) => (
              <p key={p} className="text-xs font-bold text-muted">{p}: <span className="text-main">Bs. {r.toFixed(2)}</span></p>
            ))}
            {Object.keys(revenueByProvider).length === 0 && <p className="text-xs text-muted italic">Sin ventas aún</p>}
          </div>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--danger-color)' }}>
          <div className="d-flex justify-between align-center mb-2">
            <span className="text-muted text-sm">Alerta de Stock</span>
            <ShoppingCart size={20} className="text-danger" />
          </div>
          <p className="text-2xl font-bold">{lowStock}</p>
          <p className="text-xs text-muted mt-2">Productos con menos de 5 unid.</p>
        </div>

        {user.role === 'owner' && (
          <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid #a855f7' }}>
            <div className="d-flex justify-between align-center mb-2">
              <span className="text-muted text-sm">Cuentas TIENDA</span>
              <Users size={20} style={{ color: '#a855f7' }} />
            </div>
            <p className="text-2xl font-bold">Gestor TIENDA</p>
            <p className="text-xs text-muted mt-2">{sales.length > 0 ? 'Activo' : 'Esperando ventas'}</p>
          </div>
        )}
      </div>

      {user.role === 'owner' && (
        <div className="glass-panel mb-8 animate-fade-in" style={{ padding: '2rem' }}>
          <div className="d-flex align-center gap-2 mb-6">
            <Settings size={24} className="text-secondary" />
            <h3 className="text-xl font-bold">Configuración Maestra (MASTER)</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div className="d-flex flex-col gap-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="w-100">
                  <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                    <Smartphone size={16} /> WhatsApp de Ventas y Contacto (Único)
                  </label>
                  <input className="input-base w-100" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="591..." />
                </div>
              </div>

              <div className="w-100">
                <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                  <MapPin size={16} /> Link Ubicación (Google Maps)
                </label>
                <input className="input-base w-100" value={location} onChange={e => setLocation(e.target.value)} placeholder="https://goo.gl/maps/..." />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="w-100">
                  <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                    <Hash size={16} /> Categorías
                  </label>
                  <div className="d-flex gap-2">
                    <input className="input-base" style={{ flex: 1 }} value={newCategory} onChange={e => setNewCategory(e.target.value)} placeholder="Ej. Sensores" />
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={handleAddCategory}>+</button>
                  </div>
                  <div className="d-flex gap-2 flex-wrap mt-3">
                    {categoryList.map(c => (
                      <span key={c} className="badge badge-green d-flex align-center gap-2" style={{ fontSize: '0.7rem' }}>
                        {c} <RefreshCcw size={10} style={{ cursor: 'pointer' }} onClick={() => handleRemoveCategory(c)} />
                      </span>
                    ))}
                  </div>
                </div>

                <div className="w-100">
                  <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                    <Package size={16} /> Proveedores
                  </label>
                  <div className="d-flex gap-2">
                    <input className="input-base" style={{ flex: 1 }} value={newProvider} onChange={e => setNewProvider(e.target.value)} placeholder="Ej. P1" />
                    <button className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }} onClick={handleAddProvider}>+</button>
                  </div>
                  <div className="d-flex gap-2 flex-wrap mt-3">
                    {providerList.map(p => (
                      <span key={p} className="badge badge-blue d-flex align-center gap-2" style={{ fontSize: '0.7rem' }}>
                        {p} <RefreshCcw size={10} style={{ cursor: 'pointer' }} onClick={() => handleRemoveProvider(p)} />
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <button className="btn btn-primary" style={{ width: '100%', padding: '1rem', marginTop: '1rem' }} onClick={handleSaveSettings}>
                <Settings size={20} /> GUARDAR CONFIGURACIÓN
              </button>

              <div className="mt-6 pt-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <label className="text-sm font-bold text-secondary d-flex align-center gap-2 mb-3">
                  <Users size={16} /> Credenciales MASTER
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted">Usuario Maestro</span>
                    <input className="input-base mt-1" value={masterUser} onChange={e => setMasterUser(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-muted">Contraseña Maestra</span>
                    <input className="input-base mt-1" type="text" value={masterPass} onChange={e => setMasterPass(e.target.value)} />
                  </div>
                </div>
              </div>
            </div>

            <div className="d-flex flex-col gap-4" style={{ borderLeft: '1px solid var(--surface-border)', paddingLeft: '2rem' }}>
              <label className="text-sm font-bold text-danger d-flex align-center gap-2">
                <RefreshCcw size={16} /> Zona de Peligro
              </label>
              <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleResetSales}>
                Reiniciar Historial
              </button>
              <p className="text-xs text-muted italic">Esta acción borrará todas las ventas registradas permanently.</p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4">Últimas Ventas</h3>
      <div className="glass-panel dashboard-table-container" style={{ overflowX: 'auto', padding: '1rem', minHeight: '200px' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th className="p-3 text-muted">Recibo Nro</th>
              <th className="p-3 text-muted">Fecha</th>
              <th className="p-3 text-muted">Cliente</th>
              <th className="p-3 text-muted">TIENDA</th>
              <th className="p-3 text-muted text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.slice().reverse().map((s, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="p-3 font-bold text-primary">{s.receiptNumber}</td>
                <td className="p-3 text-sm">{new Date(s.timestamp).toLocaleDateString()}</td>
                <td className="p-3">{s.customerName}</td>
                <td className="p-3"><span className="badge badge-blue">{s.sellerName}</span></td>
                <td className="p-3 text-right font-bold text-success">Bs. {s.total.toFixed(2)}</td>
              </tr>
            ))}
            {sales.length === 0 && <tr><td colSpan="5" className="text-center p-6 text-muted">Aún no hay ventas registradas.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
