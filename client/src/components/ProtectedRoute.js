import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    // You can add a loading spinner here if you want
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to. This allows us to send them along to that page after they
    // log in, which is a nicer user experience.
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
