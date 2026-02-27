import { Outlet, Link, NavLink, useNavigate } from "react-router";
import { useState } from "react";
import { Toaster } from 'sonner';
import { 
  HandDrawnCart, 
  HandDrawnUser, 
  HandDrawnGift, 
  HandDrawnLogout, 
  HandDrawnMenu, 
  HandDrawnX,
  HandDrawnPackage 
} from "./HandDrawnIcons";
import { useCartStore } from "../store/cartStore";
import { useAuthStore } from "../store/authStore";

export function Layout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-700">
      <Toaster position="top-right" richColors />
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-sm">
        <div className="container mx-auto px-4 md:px-12 py-5 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="bg-gradient-to-br from-brand-100 to-mint-100 p-3 rounded-full group-hover:scale-110 transition-transform duration-300">
              <HandDrawnGift className="w-7 h-7 text-brand-600" />
            </div>
            <span className="text-3xl font-serif font-semibold tracking-wide text-gray-800">ART CRAFT STUDIO</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <NavLink 
              to="/" 
              className={({ isActive }) => `text-lg font-medium hover:text-brand-600 transition-colors duration-300 ${isActive ? 'text-brand-600 border-b-2 border-brand-400' : 'text-gray-600'}`}
            >
              Home
            </NavLink>
            <NavLink 
              to="/shop" 
              className={({ isActive }) => `text-lg font-medium hover:text-brand-600 transition-colors duration-300 ${isActive ? 'text-brand-600 border-b-2 border-brand-400' : 'text-gray-600'}`}
            >
              Shop
            </NavLink>
            {isAuthenticated && user?.role === 'user' && (
              <NavLink 
                to="/my-orders" 
                className={({ isActive }) => `text-lg font-medium hover:text-brand-600 transition-colors duration-300 ${isActive ? 'text-brand-600 border-b-2 border-brand-400' : 'text-gray-600'}`}
              >
                My Orders
              </NavLink>
            )}
            {user?.role === 'admin' && (
              <NavLink 
                to="/admin" 
                className={({ isActive }) => `text-lg font-medium hover:text-brand-600 transition-colors duration-300 ${isActive ? 'text-brand-600 border-b-2 border-brand-400' : 'text-gray-600'}`}
              >
                Admin
              </NavLink>
            )}
          </nav>

          <div className="flex items-center gap-5">
            <Link to="/cart" className="relative p-2.5 hover:bg-brand-50 rounded-full transition-all duration-300 group">
              <HandDrawnCart className="w-6 h-6 text-gray-700 group-hover:text-brand-600 transition-colors" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-brand-500 to-brand-400 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-sm font-semibold leading-tight text-gray-800">{user?.name}</span>
                  <span className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold">{user?.role}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="p-2.5 hover:bg-red-50 text-gray-600 hover:text-red-500 rounded-full transition-all duration-300"
                  title="Logout"
                >
                  <HandDrawnLogout className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link 
                to="/login" 
                className="bg-white border-2 border-brand-500 text-brand-600 px-6 py-2 rounded-full font-semibold hover:bg-brand-500 hover:text-white transition-all duration-300 flex items-center gap-2 shadow-sm"
              >
                <HandDrawnUser className="w-4 h-4" />
                <span className="hidden sm:inline">Sign In</span>
              </Link>
            )}
            
            <button 
              className="md:hidden p-2 hover:bg-brand-50 rounded-full transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <HandDrawnX className="w-6 h-6 text-gray-700" /> : <HandDrawnMenu className="w-6 h-6 text-gray-700" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 p-6 absolute w-full top-full left-0 shadow-lg">
            <nav className="flex flex-col gap-5">
              <Link to="/" className="text-lg font-medium hover:text-brand-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/shop" className="text-lg font-medium hover:text-brand-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Shop</Link>
              {isAuthenticated && user?.role === 'user' && (
                <Link to="/my-orders" className="text-lg font-medium hover:text-brand-600 flex items-center gap-2 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <HandDrawnPackage className="w-5 h-5" /> My Orders
                </Link>
              )}
              {user?.role === 'admin' && (
                <Link to="/admin" className="text-lg font-medium hover:text-brand-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              )}
              {!isAuthenticated && (
                <Link to="/login" className="text-lg font-semibold text-brand-600 transition-colors" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
              )}
            </nav>
          </div>
        )}
      </header>

      <main className="flex-grow container mx-auto px-4 md:px-12 py-12">
        <Outlet />
      </main>

      <footer className="bg-gradient-to-r from-brand-50 via-mint-50 to-brand-50 border-t border-gray-100 py-12 mt-auto">
        <div className="container mx-auto px-4 text-center">
          <p className="font-script text-3xl mb-3 text-gray-700">Made with Love</p>
          <p className="text-sm text-gray-500 font-medium">© 2026 Art Craft Studio. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}