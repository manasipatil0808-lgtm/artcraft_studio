import { Link } from 'react-router';
import { Home, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
      <h1 className="text-9xl font-display font-bold text-gray-200">404</h1>
      <h2 className="text-4xl font-display font-bold text-gray-800 mb-4">Page Not Found</h2>
      <p className="text-xl text-gray-600 mb-8 font-hand">Oops! It seems like this page got lost in the crafting process.</p>
      <Link 
        to="/" 
        className="flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-full font-bold hover:bg-pink-600 transition-colors"
      >
        <Home className="w-5 h-5" /> Go Back Home
      </Link>
    </div>
  );
}
