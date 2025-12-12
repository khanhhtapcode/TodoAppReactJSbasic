import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Protected Route - Bảo vệ route chỉ cho user đã login
 * Nếu chưa login -> redirect về /login
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Nếu chưa đăng nhập, chuyển hướng về trang login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Đã đăng nhập -> render children (component bên trong)
  return children;
};

export default ProtectedRoute;
