import { createContext, useState, useContext } from 'react';

// 1. Tạo Context - Kho chứa dữ liệu chung
const AuthContext = createContext();

// 2. Provider - Component bao bọc để cung cấp dữ liệu cho các con
export const AuthProvider = ({ children }) => {
  // Lazy initialization: Function chỉ chạy 1 lần khi khởi tạo
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        return null;
      }
    }
    return null;
  });
  
  // Loading không cần thiết nữa vì lazy initialization chạy đồng bộ

  // 4. Hàm login - Lưu user vào state và localStorage
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  // 5. Hàm logout - Xóa user khỏi state và localStorage
  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 6. Value - Dữ liệu được chia sẻ cho các component con
  const value = {
    user,        // Thông tin user hiện tại
    login,       // Hàm đăng nhập
    logout,      // Hàm đăng xuất
    isAuthenticated: !!user  // Boolean: có user hay không (!! chuyển thành boolean)
  };

  // 7. Provider bao bọc children và truyền value xuống
  return (
    <AuthContext.Provider value={value}>
      {children} {/* Không cần check loading nữa */}
    </AuthContext.Provider>
  );
};

// 8. Custom hook để dễ dàng sử dụng Context
// Thay vì: const context = useContext(AuthContext)
// Giờ chỉ cần: const { user, login, logout } = useAuth()
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  // Báo lỗi nếu dùng hook bên ngoài Provider
  if (!context) {
    throw new Error('useAuth phải được sử dụng trong AuthProvider');
  }
  
  return context;
};
