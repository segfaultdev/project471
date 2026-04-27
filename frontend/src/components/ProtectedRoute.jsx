import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireVendor = false, loginPath = "/login" }) => {
  const { user, isAuthenticated, isVendor, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to={loginPath} state={{ from: location.pathname }} replace />;
  }

  if (requireVendor && !isVendor()) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
