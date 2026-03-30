import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { Mail, Lock, User as UserIcon, Palette, UserPlus } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import type { UserRole } from '../store/authStore';

export function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  
  const { register, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    try {
      await register(name, email, password, role);
      toast.success(`Welcome to the community, ${name}!`);
      
      if (role === 'seller') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      toast.error(err.message || 'Registration failed');
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white border-2 border-gray-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Artistic background elements */}
        <div className="absolute top-0 left-0 w-24 h-24 bg-blue-200/50 rotate-12 -translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 right-0 w-16 h-16 bg-green-200/50 -rotate-45 translate-x-4 translate-y-4" />
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-blue-100 p-4 rounded-full border-2 border-gray-800 animate-pulse">
              <Palette className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-center mb-8">Join Our Community</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold block ml-1">I am a...</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('customer')}
                  className={`py-2 px-4 border-2 border-gray-800 font-bold transition-all ${
                    role === 'customer' 
                      ? 'bg-blue-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white text-gray-800 hover:bg-blue-50'
                  }`}
                >
                  🛒 Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('seller')}
                  className={`py-2 px-4 border-2 border-gray-800 font-bold transition-all ${
                    role === 'seller' 
                      ? 'bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white text-gray-800 hover:bg-purple-50'
                  }`}
                >
                  🎨 Seller
                </button>
              </div>
              <p className="text-xs text-gray-500 ml-1">
                {role === 'seller' 
                  ? 'Sellers can list and manage products on the store.' 
                  : 'Customers can browse and purchase handcrafted products.'}
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold block ml-1">Full Name</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Artistic Soul"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold block ml-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hello@creative.com"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold block ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:ring-0 focus:border-blue-500 transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 ml-1">Must be at least 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-4 px-6 font-bold text-xl flex items-center justify-center gap-2 hover:bg-blue-600 transition-colors shadow-[4px_4px_0px_0px_rgba(59,130,246,1)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <UserPlus className="w-6 h-6" />
                  Create Account
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-blue-600 font-bold hover:underline">
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative brush stroke */}
      <div className="mt-8 h-4 bg-blue-200/50 rounded-full w-3/4 mx-auto blur-sm" />
    </div>
  );
}
