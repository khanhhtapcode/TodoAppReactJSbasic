import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import authApi from '../api/authApi';

// --- 1. ĐỊNH NGHĨA LUẬT (SCHEMA) ---
// Đây là nơi "Bác bảo vệ" Yup làm việc.
const schema = yup.object({
  email: yup
    .string()
    .required('Vui lòng nhập Email')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
}).required();

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Lấy hàm login từ Context
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // --- 2. KHỞI TẠO FORM ---
  // register: Hàm dùng để "đăng ký" các input vào form
  // handleSubmit: Hàm xử lý khi nhấn nút Submit
  // formState: Chứa thông tin về lỗi (errors)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema), // Kết nối Yup vào Form
  });

  // --- 3. XỬ LÝ KHI SUBMIT THÀNH CÔNG ---
  // Hàm này chỉ chạy khi dữ liệu đã qua được vòng kiểm tra của Yup
  const onSubmit = async (data) => {
    setIsLoading(true);
    setApiError('');

    try {
      // Gọi API login
      const response = await authApi.login(data);
      
      // json-server-auth trả về: { accessToken, user }
      const { accessToken, user } = response;
      
      // Lưu token vào localStorage
      localStorage.setItem('access_token', accessToken);
      
      // Cập nhật user vào Context
      login(user, accessToken);
      
      // Redirect về trang todos
      navigate('/todos');
    } catch (error) {
      console.error('Lỗi đăng nhập:', error);
      setApiError(error.response?.data || 'Email hoặc mật khẩu không đúng');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Nhập</h2>
        
        {/* Hiển thị lỗi API */}
        {apiError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Input Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')} 
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                errors.email ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="admin@gmail.com"
            />
            {/* Hiển thị lỗi nếu có */}
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Input Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${
                errors.password ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-blue-200'
              }`}
              placeholder="******"
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Button Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 font-bold text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:bg-gray-400"
          >
            {isLoading ? 'Đang xử lý...' : 'Đăng Nhập'}
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Chưa có tài khoản?{' '}
          <Link to="/register" className="text-blue-600 hover:underline">
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;