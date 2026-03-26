import { useState, useEffect } from 'react';
import { getUsers, saveUser, deleteUser } from '../../utils/store';
import { Plus, Edit, Trash2 } from 'lucide-react';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', password: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = () => {
    setUsers(getUsers());
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      id: editingId || Date.now().toString()
    };
    saveUser(payload);
    loadUsers();
    closeModal();
  };

  const openForm = (u = null) => {
    if (u) {
      setFormData(u);
      setEditingId(u.id);
    } else {
      setFormData({ name: '', username: '', password: '' });
      setEditingId(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleDelete = (id) => {
    if (window.confirm('¿Seguro que desea eliminar a esta cuenta TIENDA?')) {
      deleteUser(id);
      loadUsers();
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="d-flex justify-between align-center mb-6">
        <h2 className="text-2xl font-bold text-primary">Gestión de Cuentas TIENDA</h2>
        <button className="btn btn-primary" onClick={() => openForm()}><Plus size={18}/> Nueva Cuenta TIENDA</button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1rem' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
              <th className="p-3 text-muted">Nombre Completo</th>
              <th className="p-3 text-muted">Usuario (Login)</th>
              <th className="p-3 text-muted">Contraseña</th>
              <th className="p-3 text-muted text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td className="p-3 font-bold">{u.name}</td>
                <td className="p-3"><span className="badge badge-blue">{u.username}</span></td>
                <td className="p-3 text-muted">********</td>
                <td className="p-3">
                  <div className="d-flex justify-right gap-2" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" style={{ padding: '0.4rem' }} onClick={() => openForm(u)}><Edit size={16}/></button>
                    <button className="btn btn-danger" style={{ padding: '0.4rem' }} onClick={() => handleDelete(u.id)}><Trash2 size={16}/></button>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && <tr><td colSpan="4" className="text-center p-6 text-muted">No hay cuentas TIENDA registradas. Crea una nueva para empezar.</td></tr>}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 className="text-xl mb-4 font-bold text-secondary">{editingId ? 'Editar Cuenta TIENDA' : 'Nueva Cuenta TIENDA'}</h3>
            <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
              <input className="input-base" required placeholder="Nombre Completo (Ej. Carlos Roca)" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <input className="input-base" required placeholder="Usuario (Ej. carlos20)" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
              <input className="input-base" required type="text" placeholder="Contraseña" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
              <div className="d-flex justify-between mt-6 pt-4" style={{ borderTop: '1px solid var(--surface-border)' }}>
                <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancelar</button>
                <button type="submit" className="btn btn-success">Guardar Cuenta</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
