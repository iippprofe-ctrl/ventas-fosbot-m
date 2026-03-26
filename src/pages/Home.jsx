import { useState, useEffect } from 'react';
import ProductCard from '../components/ProductCard';
import { getProducts } from '../utils/store';
import { Download, Search } from 'lucide-react';
import { generateCatalogPDF } from '../utils/pdfGenerator';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState('Todos');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    setProducts(getProducts());
  }, []);

  const filtered = products.filter(p => {
    const matchCat = category === 'Todos' || p.category === category;
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
  });

  const categories = ['Todos', 'Componentes Electrónicos', 'Impresión 3D', 'Robótica'];

  return (
    <div className="animate-fade-in">
      {/* Hero section */}
      <div className="text-center mb-6 glass-panel" style={{ padding: '3rem 2rem', border: 'none', background: 'rgba(0, 240, 255, 0.03)' }}>
        <h1 className="text-2xl mt-4 mb-2">Descubre nuestros componentes y kits de robótica</h1>
        <p className="text-muted">La mejor calidad para tus proyectos makers y educativos en un solo lugar.</p>
        <button 
          onClick={() => generateCatalogPDF(filtered, category)} 
          className="btn btn-secondary mt-4"
        >
          <Download size={18} /> Descargar Catálogo PDF
        </button>
      </div>

      {/* Filters */}
      <div className="d-flex flex-col gap-4 mb-6" style={{ flexDirection: 'column' }}>
        <div className="d-flex gap-2" style={{ flexWrap: 'wrap', justifyContent: 'center' }}>
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="d-flex justify-center mt-2">
          <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
            <Search className="text-muted" size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input 
              type="text" 
              placeholder="Buscar productos..." 
              className="input-base"
              style={{ paddingLeft: '3rem' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Product Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filtered.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      ) : (
        <div className="text-center text-muted glass-panel" style={{ padding: '4rem 0' }}>
          <p className="text-xl">No se encontraron productos con esos filtros.</p>
        </div>
      )}
    </div>
  );
}
