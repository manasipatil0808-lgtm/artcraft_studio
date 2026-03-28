import { motion } from 'motion/react';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router';
import { HandDrawnHeart, HandDrawnGift } from '../components/HandDrawnIcons';
import { useProductStore } from '../store/productStore';
import { useEffect } from 'react';

export function Home() {
  // const products = useProductStore((state) => state.products);
  
  const {
    products,
    fetchProducts,
  } = useProductStore();

  useEffect(()=>{
    fetchProducts(1, 100);
  },[])
  const featuredProducts = products.slice(0, 3);
  return (
    <div className="space-y-20 fade-in-up">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-mint-50 p-12 md:p-20 shadow-lg">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative z-10 max-w-3xl mx-auto text-center"
        >
          <h1 className="text-6xl md:text-7xl font-serif font-semibold text-gray-800 mb-6 leading-tight">
            Handmade with <span className="text-brand-600 font-script">Love</span>, Just for You
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-10 font-light leading-relaxed">
            Discover unique, personalized treasures that tell your story. From mandala art to custom keepsakes.
          </p>
          <Link 
            to="/shop" 
            className="hand-drawn-btn inline-flex items-center gap-2 text-lg"
          >
            Explore Collection <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
        
        {/* Decorative watercolor splash */}
        <motion.div 
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, 5, 0]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-mint-200/30 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.15, 1],
            rotate: [0, -5, 0]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-mint-200/30 to-brand-200/30 rounded-full blur-3xl"
        />
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-5xl font-serif font-semibold text-gray-800 mb-2">New Arrivals</h2>
            <p className="text-gray-500 font-light">Fresh handcrafted pieces, made this week</p>
          </div>
          <Link to="/shop" className="text-brand-600 hover:text-brand-700 font-medium text-lg border-b-2 border-transparent hover:border-brand-400 transition-all">
            View All →
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {featuredProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.15, duration: 0.6 }}
              className="watercolor-card group product-hover-animate"
            >
              <div className="relative aspect-square overflow-hidden rounded-t-xl bg-gradient-to-br from-brand-50 to-mint-50">
                <img 
                  src={product.image} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <button className="absolute top-4 right-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-brand-100 hover:scale-110 transition-all shadow-md">
                  <HandDrawnHeart className="w-5 h-5 text-brand-600" />
                </button>
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif font-semibold mb-2 text-gray-800">{product.name}</h3>
                <p className="text-gray-500 mb-5 line-clamp-2 leading-relaxed">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-semibold text-brand-600">${product.price}</span>
                  <Link 
                    to={`/product/${product.id}`}
                    className="px-5 py-2 bg-gray-50 hover:bg-brand-50 hover:text-brand-600 rounded-full font-medium transition-all border border-gray-100 hover:border-brand-200"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="watercolor-card p-12 md:p-16">
        <h2 className="text-5xl font-serif font-semibold text-center mb-4 text-gray-800">Why Choose Handmade?</h2>
        <p className="text-center text-gray-500 mb-16 text-lg font-light">Each piece tells a story</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <motion.div 
            className="p-6"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Star className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Unique & Original</h3>
            <p className="text-gray-600 leading-relaxed">Every piece is crafted by hand, ensuring that no two items are exactly alike.</p>
          </motion.div>
          <motion.div 
            className="p-6"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-brand-100 to-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HandDrawnHeart className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Made with Heart</h3>
            <p className="text-gray-600 leading-relaxed">We pour our passion and creativity into every single product we create.</p>
          </motion.div>
          <motion.div 
            className="p-6"
            whileHover={{ y: -5 }}
            transition={{ duration: 0.3 }}
          >
            <div className="bg-gradient-to-br from-mint-100 to-mint-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HandDrawnGift className="w-10 h-10 text-mint-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Personalized</h3>
            <p className="text-gray-600 leading-relaxed">Customize your order to create a truly meaningful gift for yourself or loved ones.</p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}