import { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import TodoItem from '../components/TodoItem';
import useDebounce from '../hooks/useDebounce';

const API_URL = 'http://localhost:4000/todos';

function TodoPage() {
  const { user, logout } = useAuth();
  
  // ===== STATES =====
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [newTodo, setNewTodo] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'active', 'completed'

  // Debounce search term - Chỉ update sau 300ms user ngừng gõ
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // ===== 1. READ - Lấy danh sách todos =====
  const fetchTodos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(API_URL, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params: {
          userId: user.id  // Chỉ lấy todos của user hiện tại
        }
      });
      
      setTodos(response.data);
    } catch (err) {
      setError('Không thể tải danh sách todos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // useEffect: Tự động fetch khi component mount
  useEffect(() => {
    fetchTodos();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Chỉ chạy 1 lần khi mount

  // ===== 2. CREATE - Thêm todo mới =====
  const handleAddTodo = async (e) => {
    e.preventDefault();
    
    if (!newTodo.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(
        API_URL,
        {
          title: newTodo,
          completed: false,
          userId: user.id
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Thêm todo mới vào state (không cần fetch lại)
      setTodos([...todos, response.data]);
      setNewTodo('');  // Reset input
    } catch (err) {
      alert('Không thể thêm todo');
      console.error(err);
    }
  };

  // ===== 3. UPDATE - Cập nhật todo =====
  // 3a. Toggle completed
  // useCallback: Cache function, chỉ tạo lại khi todos thay đổi
  const handleToggleComplete = useCallback(async (todo) => {
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_URL}/${todo.id}`,
        { completed: !todo.completed },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Cập nhật state
      setTodos(prev => prev.map(t => 
        t.id === todo.id ? response.data : t
      ));
    } catch {
      alert('Không thể cập nhật');
    }
  }, []); // [] = function không bao giờ thay đổi

  // 3b. Edit text
  const handleStartEdit = useCallback((todo) => {
    setEditingId(todo.id);
    setEditText(todo.title);
  }, []);

  const handleSaveEdit = useCallback(async (id) => {
    if (!editText.trim()) return;

    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.patch(
        `${API_URL}/${id}`,
        { title: editText },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      setTodos(prev => prev.map(t => 
        t.id === id ? response.data : t
      ));
      setEditingId(null);
    } catch {
      alert('Không thể cập nhật');
    }
  }, [editText]); // Chỉ tạo lại khi editText thay đổi

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
    setEditText('');
  }, []);

  const handleEditTextChange = useCallback((text) => {
    setEditText(text);
  }, []);

  // ===== FILTERING & SEARCHING với useMemo =====
  /**
   * useMemo: Cache kết quả tính toán, chỉ tính lại khi dependencies thay đổi
   * 
   * Tại sao dùng useMemo?
   * - Filter/Search là phép tính phức tạp (loop qua array)
   * - Không muốn tính lại mỗi lần component re-render
   * - Chỉ tính lại khi todos, debouncedSearchTerm, hoặc filterStatus thay đổi
   */
  const filteredTodos = useMemo(() => {
    console.log('🔄 Filtering todos...'); // Debug: xem filter chạy bao nhiêu lần

    let result = todos;

    // 1. Filter theo status (all/active/completed)
    if (filterStatus === 'active') {
      result = result.filter(todo => !todo.completed);
    } else if (filterStatus === 'completed') {
      result = result.filter(todo => todo.completed);
    }

    // 2. Search theo title (đã debounced)
    if (debouncedSearchTerm) {
      result = result.filter(todo =>
        todo.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      );
    }

    return result;
  }, [todos, debouncedSearchTerm, filterStatus]); 
  // Chỉ chạy lại khi 1 trong 3 dependencies thay đổi

  // ===== 4. DELETE - Xóa todo =====
  const handleDelete = useCallback(async (id) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;

    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API_URL}/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Xóa khỏi state
      setTodos(prev => prev.filter(t => t.id !== id));
    } catch {
      alert('Không thể xóa todo');
    }
  }, []);

  // ===== RENDER =====
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Todos</h1>
            <p className="text-gray-600">Xin chào, {user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Đăng xuất
          </button>
        </div>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-6">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Thêm todo mới..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Thêm
            </button>
          </div>
        </form>

        {/* Search & Filter */}
        <div className="mb-4 space-y-3">
          {/* Search Input */}
          <div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="🔍 Tìm kiếm todo..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {searchTerm && (
              <p className="text-sm text-gray-500 mt-1">
                Đang tìm: "{searchTerm}" {debouncedSearchTerm !== searchTerm && '(đang gõ...)'}
              </p>
            )}
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterStatus === 'all'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Tất cả ({todos.length})
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterStatus === 'active'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Đang làm ({todos.filter(t => !t.completed).length})
            </button>
            <button
              onClick={() => setFilterStatus('completed')}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                filterStatus === 'completed'
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Hoàn thành ({todos.filter(t => t.completed).length})
            </button>
          </div>
        </div>

        {/* Loading & Error States */}
        {loading && (
          <div className="text-center py-8">
            <p className="text-gray-600">Đang tải...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Todos List */}
        {!loading && todos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">Chưa có todo nào</p>
        ) : !loading && filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Không tìm thấy todo nào {searchTerm && `với từ khóa "${searchTerm}"`}
          </p>
        ) : (
          <div className="bg-white rounded-lg shadow">
            {filteredTodos.map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                isEditing={editingId === todo.id}
                editText={editText}
                onToggleComplete={handleToggleComplete}
                onStartEdit={handleStartEdit}
                onSaveEdit={handleSaveEdit}
                onCancelEdit={handleCancelEdit}
                onEditTextChange={handleEditTextChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default TodoPage;
