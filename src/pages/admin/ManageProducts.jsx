import { useState, useEffect } from 'react';
import { getProducts, saveProduct, deleteProduct, getSettings } from '../../utils/store';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ManageProducts() {
  const [products, setProducts] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const providers = getSettings().providers || ['P1'];
  
  const [formData, setFormData] = useState({
    name: '', description: '', price: '', category: 'Componentes Electrónicos', stock: '', image: '', provider: providers[0]
  });

  useEffect(() => { loadProducts(); }, []);

  const loadProducts = () => setProducts(getProducts());

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      id: editingId || Date.now().toString(),
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    };
    
    saveProduct(payload);
    loadProducts();
    closeModal();
  };

  const openForm = (product = null) => {
    if (product) {
      setFormData(product);
      setEditingId(product.id);
    } else {
      setFormData({ name: '', description: '', price: '', category: 'Componentes Electrónicos', stock: '', image: '', provider: providers[0] });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que desea eliminar este producto?')) {
      deleteProduct(id);
      loadProducts();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-between align-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Catálogo de Productos</h2>
        <button className="btn btn-primary" onClick={() => openForm()}><Plus size={18}/> Nuevo Producto</button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th className="p-3 text-muted">Imagen</th>
              <th className="p-3 text-muted">Nombre</th>
              <th className="p-3 text-muted">Categoría</th>
              <th className="p-3 text-muted">Prov.</th>
              <th className="p-3 text-muted">Precio</th>
              <th className="p-3 text-muted">Stock</th>
              <th className="p-3 text-muted text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="p-3">
                  <img src={p.image || 'https://via.placeholder.com/50'} alt={p.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }}/>
                </td>
                <td className="p-3 font-bold text-sm" style={{ maxWidth: '200px' }}>{p.name}</td>
                <td className="p-3"><span className="badge badge-green">{p.category}</span></td>
                <td className="p-3"><span className="text-muted text-xs font-bold">{p.provider || '-'}</span></td>
                <td className="p-3 font-bold text-primary">Bs. {p.price.toFixed(2)}</td>
                <td className="p-3">{p.stock}</td>
                <td className="p-3">
                  <div className="d-flex justify-right gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openForm(p)}><Edit size={16}/></button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(p.id)}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && <tr><td colSpan="6" className="text-center p-6 text-muted">No hay productos en el catálogo.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h3 className="text-xl mb-4 font-bold text-secondary">{editingId ? 'Editar Producto' : 'Nuevo Producto'}</h3>
            <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
              <input className="input-base" required placeholder="Nombre del Producto" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <textarea className="input-base" placeholder="Descripción detallada" rows="3" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
              <div className="d-flex gap-4">
                <input className="input-base" required type="number" step="0.10" placeholder="Precio (Bs)" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                <input className="input-base" required type="number" placeholder="Stock Disponible" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
              </div>
              <div className="d-flex gap-4">
                <select className="input-base" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ color: '#fff', background: '#0b0f19' }}>
                  <option>Componentes Electrónicos</option>
                  <option>Impresión 3D</option>
                  <option>Robótica</option>
                </select>
                <select className="input-base" value={formData.provider} onChange={e => setFormData({...formData, provider: e.target.value})} style={{ color: '#fff', background: '#0b0f19' }}>
                  {providers.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="d-flex flex-col gap-1">
                <label className="text-sm text-muted">Imagen del Producto (Opcional)</label>
                <div className="d-flex align-center gap-4">
                  {formData.image && <img src={formData.image} alt="Preview" style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />}
                  <input 
                    type="file" 
                    className="input-base" 
                    accept="image/*"
                    onChange={e => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setFormData({...formData, image: reader.result});
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                  />
                </div>
              </div>
              
              <div className="d-flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar Producto</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
