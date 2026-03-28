import { useState } from 'react';
import { useNavigate, Link } from 'react-router';
import { toast } from 'sonner';
import { Mail, Lock, LogIn, Sparkles } from 'lucide-react';
import { useAuthStore, type UserRole } from '../store/authStore';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('user');

  const { login, isLoading, clearError } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
     clearError();
    
    try {
      await login(email, password);
      toast.success('Logged in successful')
      // Redirect based on role - will be handled by the store
      navigate('/');
    } catch (err) {
      // Error is already set in store
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12">
      <div className="bg-white border-2 border-gray-800 p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
        {/* Artistic background elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-200/50 -rotate-12 translate-x-8 -translate-y-8" />
        <div className="absolute bottom-0 left-0 w-16 h-16 bg-pink-200/50 rotate-45 -translate-x-4 translate-y-4" />
        
        <div className="relative z-10">
          <div className="flex justify-center mb-6">
            <div className="bg-pink-100 p-4 rounded-full border-2 border-gray-800 animate-bounce">
              <Sparkles className="w-8 h-8 text-pink-500" />
            </div>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-center mb-8">Welcome Back!</h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold block ml-1">Role</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRole('user')}
                  className={`py-2 px-4 border-2 border-gray-800 font-bold transition-all ${
                    role === 'user' 
                      ? 'bg-pink-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white text-gray-800 hover:bg-pink-50'
                  }`}
                >
                  Customer
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 px-4 border-2 border-gray-800 font-bold transition-all ${
                    role === 'admin' 
                      ? 'bg-purple-500 text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' 
                      : 'bg-white text-gray-800 hover:bg-purple-50'
                  }`}
                >
                  Seller
                </button>
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
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:ring-0 focus:border-pink-500 transition-colors"
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
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-800 focus:outline-none focus:ring-0 focus:border-pink-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gray-800 text-white py-4 px-6 font-bold text-xl flex items-center justify-center gap-2 hover:bg-pink-600 transition-colors shadow-[4px_4px_0px_0px_rgba(236,72,153,1)] disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-6 h-6" />
                  Sign In
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-pink-600 font-bold hover:underline">
                Create one now
              </Link>
            </p>
          </div>
        </div>
      </div>
      
      {/* Decorative brush stroke */}
      <div className="mt-8 h-4 bg-pink-200/50 rounded-full w-3/4 mx-auto blur-sm" />
    </div>
  );
}
