import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- INTERCEPTOR REQUEST (Gửi đi) ---
// Trước khi request được gửi lên Server, đoạn code này sẽ chạy.
axiosClient.interceptors.request.use(
  (config) => {
    // Lấy token từ LocalStorage (nếu có)
    const token = localStorage.getItem('access_token');
    if (token) {
      // Gắn token vào Header: "Authorization: Bearer <token>"
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTOR RESPONSE (Nhận về) ---
// Sau khi Server trả về dữ liệu, đoạn code này sẽ chạy trước khi về đến Component.
axiosClient.interceptors.response.use(
  (response) => {
    // Chỉ lấy phần data, bỏ qua status, headers thừa thãi
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung (ví dụ: Token hết hạn thì logout luôn)
    return Promise.reject(error);
  }
);

export default axiosClient;