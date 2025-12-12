import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Custom Hook để fetch data từ API
 * @param {string} url - URL của API endpoint
 * @param {object} options - Tùy chọn: method, body, headers...
 * @returns {object} { data, loading, error, refetch }
 */
const useFetch = (url, options = {}) => {
  // 3 states quan trọng khi call API
  const [data, setData] = useState(null);         // Dữ liệu trả về
  const [loading, setLoading] = useState(false);  // Trạng thái đang load
  const [error, setError] = useState(null);       // Lỗi nếu có

  // Hàm fetch data
  const fetchData = async () => {
    setLoading(true);  // Bắt đầu loading
    setError(null);    // Reset error cũ

    try {
      // Gọi API với axios
      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.body,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers  // Merge với headers truyền vào
        }
      });

      setData(response.data);  // Lưu data khi thành công
    } catch (err) {
      // Xử lý error
      setError(err.response?.data?.message || err.message || 'Có lỗi xảy ra');
    } finally {
      setLoading(false);  // Kết thúc loading (dù success hay fail)
    }
  };

  // useEffect: Tự động fetch khi component mount hoặc url thay đổi
  useEffect(() => {
    if (url) {
      fetchData();
    }
  }, [url]); // Dependencies: chạy lại khi url thay đổi

  // Return object với data và hàm refetch để gọi lại API
  return {
    data,
    loading,
    error,
    refetch: fetchData  // Hàm để gọi lại API thủ công
  };
};

export default useFetch;
