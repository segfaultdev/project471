import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 shadow-md bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-8 w-auto" />
          </Link>

          <div className="flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                  Dashboard
                </Link>
                <Link to="/products" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                  Products
                </Link>
                {isVendor() && (
                  <>
                    <Link to="/my-stores" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                      My Store
                    </Link>
                    <Link to="/my-products" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                      My Products
                    </Link>
                  </>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {user?.firstName}
                    </span>
                    <span className="text-xs font-medium text-slate-500 rounded-full bg-slate-100 px-2 py-1">
                      {user?.role}
                    </span>
                  </div>
                  <button 
                    onClick={handleLogout} 
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                  Login
                </Link>
                <Link to="/register" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
