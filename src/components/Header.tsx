import React from 'react';
import { Bell, Menu, X, Shield, Users, BarChart3, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

const Header: React.FC = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user, isAdmin, logout } = useAuth();

  const toggleMenu = () => setIsOpen(prev => !prev);

  const handleLogout = async () => {
    try {
      // Call logout API
      if (user?.email) {
        await fetch('http://localhost:3001/api/logout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: user.email }),
        });
      }
      
      // Clear local auth state
      logout();
      
      // Redirect to homepage
      window.location.href = '/';
    } catch (err) {
      console.error('Logout error:', err);
      // Still logout locally even if API call fails
      logout();
      window.location.href = '/';
    }
  };

  return (
    <header 
      className="sticky top-0 w-full text-white shadow-xl border-b border-slate-700/50 z-50"
      style={{ background: "linear-gradient(45deg, #1a1054, #255ff1)" }}
    >

      <div  className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - No gradient background, larger size */}
          <div className="flex items-center">
            <a href="/" className="hover:opacity-90 transition-opacity duration-200">
              <img 
                src="/veri.png" 
                alt="VERIFY" 
                style={{ height: '150px', width: '150px' }}
                className="object-contain" 
              />
            </a>
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
            
            {/* Admin Navigation */}
            {isAdmin && (
              <>
                <Link to="/admin" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-700/50 flex items-center">
                  <Shield className="h-4 w-4 mr-1" />
                  Admin
                </Link>
                <Link to="/admin/users" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-700/50 flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  Users
                </Link>
                <Link to="/admin/orders" className="text-gray-300 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-700/50 flex items-center">
                  <ShoppingCart className="h-4 w-4 mr-1" />
                  Orders
                </Link>
              </>
            )}
            
            <button className="text-gray-300 hover:text-white p-2 rounded-lg transition-all duration-200 hover:bg-slate-700/50 relative">
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300 text-sm">
                  Welcome, {user.full_name}
                  {isAdmin && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Shield className="h-3 w-3 mr-1" />
                      Admin
                    </span>
                  )}
                </span>
                <button 
                  onClick={handleLogout}
                  className="bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50"
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link to="/signin" className="bg-slate-800/80 hover:bg-slate-700/80 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50">
                  Sign In
                </Link>
                <Link to="/pricing" className="bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                  Start Free Trial
                </Link>
              </>
            )}
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

            <div className="grid grid-cols-1 gap-2">
              <Link to="/products" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70">
                Products
              </Link>
              <Link to="/pricing" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70">
                Pricing
              </Link>
              
              {/* Admin Mobile Navigation */}
              {isAdmin && (
                <>
                  <Link to="/admin" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70 flex items-center">
                    <Shield className="h-4 w-4 mr-2" />
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/users" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70 flex items-center">
                    <Users className="h-4 w-4 mr-2" />
                    Users
                  </Link>
                  <Link to="/admin/orders" onClick={() => setIsOpen(false)} className="w-full text-left text-gray-200 hover:text-white px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 bg-slate-800/40 hover:bg-slate-800/70 flex items-center">
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Orders
                  </Link>
                </>
              )}
              
              {user ? (
                <>
                  <div className="px-4 py-3 text-gray-300 text-sm border-b border-slate-700">
                    Welcome, {user.full_name}
                    {isAdmin && (
                      <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </span>
                    )}
                  </div>
                  <button 
                    onClick={() => {
                      handleLogout();
                      setIsOpen(false);
                    }}
                    className="w-full text-center bg-slate-800/80 hover:bg-slate-700/80 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50 text-gray-100"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/signin" onClick={() => setIsOpen(false)} className="w-full text-center bg-slate-800/80 hover:bg-slate-700/80 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border border-slate-600/50 text-gray-100">
                    Sign In
                  </Link>
                  <Link to="/pricing" onClick={() => setIsOpen(false)} className="w-full text-center bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-900 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl">
                    Start Free Trial
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
