import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { Loader } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex-center" style={{ minHeight: '100vh', flexDirection: 'column', gap: '1rem' }}>
        <Loader className="animate-spin" size={48} color="var(--accent-primary)" />
        <p className="text-subtle">Authenticating...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
