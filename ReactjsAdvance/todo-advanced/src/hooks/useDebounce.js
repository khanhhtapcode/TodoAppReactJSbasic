import { useState, useEffect } from 'react';

/**
 * Custom Hook: useDebounce
 * 
 * Giải thích:
 * - Delay việc update value một khoảng thời gian
 * - Ứng dụng: Search, Auto-save, API calls khi user đang typing
 * 
 * Cách hoạt động:
 * 1. User gõ "H" → Set timeout 500ms
 * 2. User gõ "He" → Clear timeout cũ, set timeout mới 500ms
 * 3. User gõ "Hel" → Clear timeout cũ, set timeout mới 500ms
 * 4. User ngừng gõ → Sau 500ms mới update debouncedValue
 * 
 * @param {any} value - Giá trị cần debounce
 * @param {number} delay - Thời gian delay (ms)
 * @returns {any} debouncedValue - Giá trị sau khi debounce
 */
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update value sau {delay}ms
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear timeout khi value thay đổi trước khi hết delay
    // Hoặc khi component unmount
    return () => {
      clearTimeout(timeoutId);
    };
  }, [value, delay]); // Chạy lại khi value hoặc delay thay đổi

  return debouncedValue;
}

export default useDebounce;
