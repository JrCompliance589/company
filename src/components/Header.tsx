import React from 'react';
import { Search, Bell, Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleMenu = () => setIsOpen(prev => !prev);

  return (
    <header style={{backgroundColor:'#ffff !important'}} className="sticky top-0 w-full text-white shadow-xl border-b border-slate-700/50 z-50">

      <div  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - No gradient background, larger size */}
          <div className="flex items-center">
            <a href="/" className="hover:opacity-90 transition-opacity duration-200">
              <img 
                src="/logo/veri.png" 
                alt="VERIFY" 
                style={{ height: '100px', width: '100px' }}
                className="object-contain" 
              />
            </a>
          </div>

          {/* Search Bar (desktop) */}
          <div className="hidden md:block flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Company Name or CIN"
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 backdrop-blur-sm border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200 hover:bg-slate-800/90"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <div className="relative group">
              <Link to="/products" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-700/50">
                Products
              </Link>
            </div>
            <Link to="/pricing" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-700/50">
              Pricing
            </Link>
            <button className="text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            <Link to="/signin" className="bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50">
              Sign In
            </Link>
            <Link to="/pricing" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
              Start Free Trial
            </Link>
          </nav>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50"
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
            onClick={toggleMenu}
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {isOpen && (
        <div className="md:hidden fixed inset-x-0 top-16 bottom-0 bg-slate-900/95 backdrop-blur-xl border-b border-slate-700/50 shadow-2xl overflow-y-auto">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            {/* Search (mobile) */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search for Company Name or CIN"
                className="w-full pl-12 pr-4 py-3 bg-slate-800/80 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition-all duration-200"
              />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <Link to="/products" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70">
                Products
              </Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70">
                Pricing
              </Link>
              <Link to="/signin" onClick={() => setIsOpen(false)} className="w-full text-center bg-slate-800/80 hover:bg-slate-700/80 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50 text-gray-100">
                Sign In
              </Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="w-full text-center bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                Start Free Trial
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
