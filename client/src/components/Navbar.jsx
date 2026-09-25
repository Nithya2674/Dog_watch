import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">🐕</span>
            <span className="text-xl font-bold text-primary-700">DogWatch</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <Link to="/map" className="text-gray-600 hover:text-primary-600 font-medium">
              Map
            </Link>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-600 hover:text-primary-600 font-medium">
                  Dashboard
                </Link>
                <Link to="/reports/new" className="text-gray-600 hover:text-primary-600 font-medium">
                  Report
                </Link>
                {isAdmin && (
                  <Link to="/admin" className="text-gray-600 hover:text-primary-600 font-medium">
                    Admin
                  </Link>
                )}
                <span className="text-sm text-gray-500">{user?.phoneNumber}</span>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">
                Login
              </Link>
            )}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/reports/new" className="btn-primary text-sm py-1.5">
                  Report
                </Link>
                <button onClick={handleLogout} className="btn-secondary text-sm py-1.5">
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn-primary text-sm py-1.5">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
