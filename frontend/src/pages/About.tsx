import { motion } from 'motion/react';
import { Heart, Palette, Users, Sparkles, Star, Award } from 'lucide-react';
import { HandDrawnHeart, HandDrawnGift } from '../components/HandDrawnIcons';
import { Link } from 'react-router';

export function About() {
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
          <div className="inline-flex items-center gap-2 bg-brand-100/60 text-brand-700 px-5 py-2 rounded-full text-sm font-semibold mb-6 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /> Our Story
          </div>
          <h1 className="text-5xl md:text-6xl font-serif font-semibold text-gray-800 mb-6 leading-tight">
            Crafted with <span className="text-brand-600 font-script">Passion</span>, Delivered with Love
          </h1>
          <p className="text-xl text-gray-600 font-light leading-relaxed max-w-2xl mx-auto">
            Art Craft Studio is a home for artisans and craft lovers. We believe every handmade piece carries a story — and we're here to help you discover yours.
          </p>
        </motion.div>

        {/* Decorative elements */}
        <motion.div
          animate={{ scale: [1, 1.1, 1], rotate: [0, 5, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-brand-200/30 to-mint-200/30 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -5, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-gradient-to-br from-mint-200/30 to-brand-200/30 rounded-full blur-3xl"
        />
      </section>

      {/* Mission Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          <h2 className="text-4xl font-serif font-semibold text-gray-800 mb-6">
            Our <span className="text-brand-600">Mission</span>
          </h2>
          <p className="text-gray-600 text-lg leading-relaxed mb-6">
            We connect talented artisans with people who appreciate the beauty of handmade crafts. Every product on Art Craft Studio is crafted with care, using traditional techniques passed down through generations.
          </p>
          <p className="text-gray-600 text-lg leading-relaxed mb-8">
            From intricate mandala art to custom keepsakes, we curate a collection that celebrates creativity, sustainability, and the human touch that mass-produced items can never replicate.
          </p>
          <Link
            to="/shop"
            className="hand-drawn-btn inline-flex items-center gap-2"
          >
            Explore Our Collection <Palette className="w-5 h-5" />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="watercolor-card p-10 bg-gradient-to-br from-brand-50 to-mint-50"
        >
          <div className="grid grid-cols-2 gap-8">
            {[
              { icon: Heart, label: 'Handcrafted', desc: 'Every piece made by hand', color: 'brand' },
              { icon: Users, label: '100+ Artisans', desc: 'Talented creators nationwide', color: 'mint' },
              { icon: Star, label: 'Premium Quality', desc: 'Only the finest materials', color: 'yellow' },
              { icon: Award, label: 'Eco-Friendly', desc: 'Sustainable practices', color: 'green' },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className={`bg-${item.color === 'brand' ? 'brand' : item.color === 'mint' ? 'mint' : item.color}-100 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm`}>
                  <item.icon className={`w-7 h-7 text-${item.color === 'brand' ? 'brand' : item.color === 'mint' ? 'mint' : item.color}-600`} />
                </div>
                <h3 className="font-serif font-semibold text-gray-800 mb-1">{item.label}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Values Section */}
      <section className="watercolor-card p-12 md:p-16">
        <h2 className="text-4xl font-serif font-semibold text-center mb-4 text-gray-800">What We Stand For</h2>
        <p className="text-center text-gray-500 mb-14 text-lg font-light">Values that guide every creation</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
          <motion.div className="p-6" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <div className="bg-gradient-to-br from-brand-100 to-brand-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HandDrawnHeart className="w-10 h-10 text-brand-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Authenticity</h3>
            <p className="text-gray-600 leading-relaxed">We celebrate genuine craftsmanship. Every product is verified handmade by real artisans, not factory-produced replicas.</p>
          </motion.div>
          <motion.div className="p-6" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <div className="bg-gradient-to-br from-mint-100 to-mint-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Users className="w-10 h-10 text-mint-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Community</h3>
            <p className="text-gray-600 leading-relaxed">We empower artisans by giving them a platform to showcase their talent and earn a fair income from their craft.</p>
          </motion.div>
          <motion.div className="p-6" whileHover={{ y: -5 }} transition={{ duration: 0.3 }}>
            <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
              <HandDrawnGift className="w-10 h-10 text-yellow-600" />
            </div>
            <h3 className="text-2xl font-serif font-semibold mb-3 text-gray-800">Sustainability</h3>
            <p className="text-gray-600 leading-relaxed">We prioritize eco-friendly materials and packaging, because caring for our planet is part of the art of living.</p>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-4xl font-serif font-semibold text-gray-800 mb-4">Ready to Discover?</h2>
          <p className="text-gray-500 text-lg mb-8 font-light">Find your next favorite handcrafted treasure</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link to="/shop" className="hand-drawn-btn inline-flex items-center gap-2 text-lg">
              Shop Now <Palette className="w-5 h-5" />
            </Link>
            <Link
              to="/contact"
              className="px-8 py-3 bg-white border-2 border-gray-800 text-gray-800 font-bold hover:bg-gray-800 hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
