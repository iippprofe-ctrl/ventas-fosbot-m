import { useState, useEffect } from 'react';
import { getSales, getProducts, getSettings, saveSettings, clearSales } from '../../utils/store';
import { TrendingUp, Package, Users, ShoppingCart, Settings, RefreshCcw, Smartphone } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export default function DashboardOverview() {
  const [sales, setSales] = useState([]);
  const [products, setProducts] = useState([]);
  const [whatsapp, setWhatsapp] = useState('');
  const [providerList, setProviderList] = useState([]);
  const [newProvider, setNewProvider] = useState('');
  const [masterUser, setMasterUser] = useState('');
  const [masterPass, setMasterPass] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    const settings = getSettings();
    setSales(getSales());
    setProducts(getProducts());
    setWhatsapp(settings.whatsapp);
    setProviderList(settings.providers || []);
    setMasterUser(settings.master_user || 'admin');
    setMasterPass(settings.master_pass || 'admin');
  }, []);

  const handleSaveSettings = () => {
    saveSettings({ 
      whatsapp, 
      providers: providerList,
      master_user: masterUser,
      master_pass: masterPass
    });
    alert('Configuración guardada exitosamente. Los cambios de acceso MASTER se aplicarán al recargar.');
    window.location.reload();
  };

  const handleAddProvider = () => {
    if (newProvider && !providerList.includes(newProvider)) {
      const updated = [...providerList, newProvider];
      setProviderList(updated);
      saveSettings({ whatsapp, providers: updated });
      setNewProvider('');
    }
  };

  const handleRemoveProvider = (p) => {
    const updated = providerList.filter(item => item !== p);
    setProviderList(updated);
    saveSettings({ whatsapp, providers: updated });
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="d-flex flex-col gap-6">
              <div>
                <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                  <Smartphone size={16} /> WhatsApp de Contacto
                </label>
                <div className="d-flex gap-2">
                  <input className="input-base" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} />
                  <button className="btn btn-primary" onClick={handleSaveSettings}>OK</button>
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--primary-color)' }}>
                  Actualmente guardado: <strong>{getSettings().whatsapp}</strong>
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-muted d-flex align-center gap-2 mb-2">
                  <Package size={16} /> Gestión de Proveedores
                </label>
                <div className="d-flex gap-2">
                  <input className="input-base" value={newProvider} onChange={e => setNewProvider(e.target.value)} placeholder="Ej. P4" />
                  <button className="btn btn-secondary" onClick={handleAddProvider}>Añadir</button>
                </div>
                <div className="d-flex gap-2 flex-wrap mt-3">
                  {providerList.map(p => (
                    <span key={p} className="badge badge-blue d-flex align-center gap-2">
                      {p} <RefreshCcw size={10} style={{ cursor: 'pointer' }} onClick={() => handleRemoveProvider(p)} />
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <label className="text-sm font-bold text-secondary d-flex align-center gap-2 mb-3">
                  <Users size={16} /> Credenciales de Acceso MASTER
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-muted">Usuario Maestro</span>
                    <input className="input-base mt-1" value={masterUser} onChange={e => setMasterUser(e.target.value)} />
                  </div>
                  <div>
                    <span className="text-xs text-muted">Contraseña Maestra</span>
                    <input className="input-base mt-1" type="text" value={masterPass} onChange={e => setMasterPass(e.target.value)} />
                  </div>
                </div>
                <button className="btn btn-primary mt-4" style={{ width: '100%' }} onClick={handleSaveSettings}>Guardar Credenciales MASTER</button>
              </div>
            </div>

            <div className="d-flex flex-col gap-4" style={{ borderLeft: '1px solid var(--surface-border)', paddingLeft: '2rem' }}>
              <label className="text-sm font-bold text-danger d-flex align-center gap-2">
                <RefreshCcw size={16} /> Zona de Peligro
              </label>
              <button className="btn btn-danger" onClick={handleResetSales}>
                Reiniciar Historial de Ventas
              </button>
              <p className="text-xs text-muted italic">Esta acción borrará todas las ventas registradas.</p>
            </div>
          </div>
        </div>
      )}

      <h3 className="text-xl font-bold mb-4">Últimas Ventas (Historial)</h3>
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
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
