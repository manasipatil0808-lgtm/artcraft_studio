import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Search, Filter } from 'lucide-react';
import { HandDrawnHeart } from '../components/HandDrawnIcons';
import api from '../services/api';
export function Shop() {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  // const products = useProductStore((state) => state.products);
  const [products,setProducts] = useState([]);

  useEffect(()=>{
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      if(categoryFilter === 'All') {
        const response = await api.getProducts({ limit: 100 });
        setProducts(response.products);
      } else {
        const response = await api.getProducts({ category: categoryFilter, limit: 100 });
        setProducts(response.products);
      }
  } catch (error) {
      console.error('Error fetching products:', error);
    }
  }
  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          product?.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'All' || product?.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="fade-in-up">
      <h1 className="text-6xl font-serif font-semibold text-center mb-4 text-gray-800">Our Collection</h1>
      <p className="text-center text-gray-500 mb-12 text-lg font-light">Handcrafted with love, just for you</p>
      
      {/* Filters and Search */}
      <div className="watercolor-card flex flex-col md:flex-row justify-between items-center mb-12 gap-6 p-6">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search for something special..." 
            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-full focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 transition-all text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="relative w-full md:w-auto min-w-[220px]">
          <Filter className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full pl-12 pr-10 py-3 border border-gray-200 rounded-full focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200 bg-white appearance-none cursor-pointer hover:border-brand-300 transition-all text-base"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'right 1rem center',
              backgroundSize: '1.2em 1.2em'
            }}
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {filteredProducts.map((product, index) => (
            <Link to={`/product/${product.id}`} key={product.id} className="group h-full">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="watercolor-card h-full flex flex-col product-hover-animate"
              >
                <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-brand-50 to-mint-50 rounded-t-xl">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                  />
                  {product.customizable && (
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-brand-600 text-xs font-semibold px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                      <HandDrawnHeart className="w-3.5 h-3.5" />
                      Customizable
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h2 className="text-2xl font-serif font-semibold leading-tight text-gray-800">{product?.name}</h2>
                    <span className="text-xl font-semibold text-brand-600 ml-2">${product?.price}</span>
                  </div>
                  <p className="text-gray-500 text-sm mb-6 flex-grow leading-relaxed">{product?.description}</p>
                  <button className="hand-drawn-btn w-full">
                    View Details
                  </button>
                </div>
              </motion.div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <p className="text-3xl font-serif text-gray-400 mb-4">No products found matching your criteria.</p>
          <button 
            onClick={() => { setSearchTerm(''); setCategoryFilter('All'); }}
            className="hand-drawn-btn"
          >
            Clear Filters
          </button>
        </div>
      )}
    </div>
  );
}