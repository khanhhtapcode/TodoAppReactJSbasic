import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TodoPage from './pages/TodoPage';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Route công khai - ai cũng truy cập được */}
        <Route 
          path="/login" 
          element={
            // Nếu đã login thì redirect về /todos
            isAuthenticated ? <Navigate to="/todos" /> : <LoginPage />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/todos" /> : <RegisterPage />
          } 
        />

        {/* Protected Route - Chỉ user đã login mới vào được */}
        <Route 
          path="/todos" 
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          } 
        />

        {/* Redirect mặc định */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/todos" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
