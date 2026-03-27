import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (login(username, password)) {
      navigate('/admin');
    } else {
      setError(true);
    }
  };

  return (
    <div className="d-flex justify-center align-center animate-fade-in" style={{ minHeight: '80vh', padding: '1rem' }}>
      <div className="glass-panel" style={{ padding: '3rem 2rem', width: '100%', maxWidth: '400px' }}>
        <div className="text-center mb-8">
          <img src="logo.png" alt="Logo" style={{ height: '70px', marginBottom: '1rem', objectFit: 'contain' }} />
          <h2 className="text-2xl font-bold text-primary">FISBOT MAKER</h2>
          <p className="text-muted text-sm">Acceso Administrativo</p>
        </div>
        
        {error && (
          <div className="badge badge-blue text-danger mb-4 text-center" style={{ display: 'block', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', width: '100%' }}>
            Credenciales incorrectas (Tip: admin / admin)
          </div>
        )}

        <form onSubmit={handleSubmit} className="d-flex flex-col gap-4">
          <div>
            <label className="text-muted text-sm d-flex mb-2">Usuario</label>
            <input 
              type="text" 
              className="input-base" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-muted text-sm d-flex mb-2">Contraseña</label>
            <input 
              type="password" 
              className="input-base" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button type="submit" className="btn btn-primary mt-2">
            <LogIn size={18} /> Iniciar Sesión
          </button>
        </form>
        
        <p className="text-center text-xs text-muted mt-6">
          Solo para MASTER y cuentas TIENDA autorizadas de FISBOT MAKER.
        </p>
      </div>
    </div>
  );
}
