import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Link, useNavigate } from 'react-router-dom';
import authApi from '../api/authApi';

// --- 1. SCHEMA NÂNG CAO ---
const schema = yup.object({
  name: yup
    .string()
    .required('Vui lòng nhập họ tên'),
  email: yup
    .string()
    .required('Vui lòng nhập Email')
    .email('Email không hợp lệ'),
  password: yup
    .string()
    .required('Vui lòng nhập mật khẩu')
    .min(6, 'Mật khẩu phải tối thiểu 6 ký tự'),
  confirmPassword: yup
    .string()
    .required('Vui lòng nhập lại mật khẩu')
    // oneOf: So sánh giá trị với trường khác. ref: tham chiếu đến trường 'password'
    .oneOf([yup.ref('password')], 'Mật khẩu nhập lại không khớp'),
}).required();

const RegisterPage = () => {
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    // Xử lý xóa confirmPassword (như bạn đã làm)
    const { confirmPassword: _unused,...dataToSend } = data; // hoặc dùng delete
    // delete dataToSend.confirmPassword;

    try {
      // Gọi API thật
      // Vì ta đã dùng interceptor, res ở đây chính là data server trả về
      const res = await authApi.register(dataToSend);
      
      console.log('Kết quả từ server:', res);
      alert('Đăng ký thành công! Hãy đăng nhập.');
      
      // Chuyển hướng sang trang Login
      navigate('/login');
      
    } catch (error) {
      console.error('Lỗi đăng ký:', error);
      // json-server-auth thường trả về lỗi trong error.response.data
      const message = error.response?.data || 'Đăng ký thất bại';
      alert(`Lỗi: ${message}`);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Ký Tài Khoản</h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          
          {/* Tên */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Họ tên</label>
            <input
              type="text"
              {...register('name')}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${errors.name ? 'border-red-500 ring-red-200' : 'border-gray-300 ring-blue-200'}`}
            />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              {...register('email')}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${errors.email ? 'border-red-500 ring-red-200' : 'border-gray-300 ring-blue-200'}`}
            />
            {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email.message}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
            <input
              type="password"
              {...register('password')}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${errors.password ? 'border-red-500 ring-red-200' : 'border-gray-300 ring-blue-200'}`}
            />
            {errors.password && <p className="text-sm text-red-500 mt-1">{errors.password.message}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Nhập lại mật khẩu</label>
            <input
              type="password"
              {...register('confirmPassword')}
              className={`w-full px-4 py-2 mt-1 border rounded-md focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-500 ring-red-200' : 'border-gray-300 ring-blue-200'}`}
            />
            {errors.confirmPassword && <p className="text-sm text-red-500 mt-1">{errors.confirmPassword.message}</p>}
          </div>

          <button
            type="submit"
            className="w-full px-4 py-2 font-bold text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            Đăng Ký
          </button>
        </form>

        <p className="mt-4 text-sm text-center text-gray-600">
          Đã có tài khoản?{' '}
          <Link to="/login" className="text-blue-600 hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;