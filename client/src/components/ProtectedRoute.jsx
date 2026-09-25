import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from './Loading';

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) return <Loading fullScreen message="Checking authentication..." />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
