# 📘 TÀI LIỆU XÂY DỰNG TODO APP - CHI TIẾT

## 📋 MỤC LỤC
1. [Tổng quan kiến trúc](#1-tổng-quan-kiến-trúc)
2. [Backend - JSON Server](#2-backend---json-server)
3. [Frontend - React App](#3-frontend---react-app)
4. [Code Flow chi tiết](#4-code-flow-chi-tiết)
5. [Kiến thức React nâng cao](#5-kiến-thức-react-nâng-cao)
6. [Performance Optimization](#6-performance-optimization)

---

## 1. TỔNG QUAN KIẾN TRÚC

### 1.1. Sơ đồ tổng thể
```
┌─────────────────────────────────────────────┐
│           FRONTEND (React)                  │
│  ┌──────────────────────────────────────┐  │
│  │  Router (React Router)               │  │
│  │  ├── /login      (LoginPage)         │  │
│  │  ├── /register   (RegisterPage)      │  │
│  │  └── /todos      (TodoPage)          │  │
│  └──────────────────────────────────────┘  │
│                    ↕                        │
│  ┌──────────────────────────────────────┐  │
│  │  State Management                    │  │
│  │  ├── Context API (AuthContext)       │  │
│  │  └── Component State (useState)      │  │
│  └──────────────────────────────────────┘  │
│                    ↕                        │
│  ┌──────────────────────────────────────┐  │
│  │  API Layer (Axios)                   │  │
│  │  ├── axiosClient (interceptors)      │  │
│  │  └── authApi                         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                    ↕
        HTTP Request/Response
                    ↕
┌─────────────────────────────────────────────┐
│         BACKEND (JSON Server)               │
│  ┌──────────────────────────────────────┐  │
│  │  json-server-auth                    │  │
│  │  Port: 4000                          │  │
│  └──────────────────────────────────────┘  │
│                    ↕                        │
│  ┌──────────────────────────────────────┐  │
│  │  Database (db.json)                  │  │
│  │  ├── users[]                         │  │
│  │  └── todos[]                         │  │
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 1.2. Tech Stack
**Frontend:**
- ⚛️ React 19.2.3
- 🛣️ React Router DOM 7.0.2
- 📝 React Hook Form 7.54.2
- ✅ Yup 1.6.1 (validation)
- 🌐 Axios 1.7.9
- 🎨 Tailwind CSS 3.4.19

**Backend:**
- 🔧 JSON Server 0.17.4
- 🔐 JSON Server Auth 2.1.0

---

## 2. BACKEND - JSON SERVER

### 2.1. Cấu trúc Backend

#### 2.1.1. File db.json
```json
{
  "users": [
    {
      "id": 1,
      "email": "user@example.com",
      "password": "$2a$10$...", // Hashed password
      "name": "John Doe"
    }
  ],
  "todos": [
    {
      "id": 1,
      "title": "Learn React",
      "completed": false,
      "userId": 1
    }
  ]
}
```

**Giải thích:**
- `users[]`: Lưu thông tin user (email, password đã hash)
- `todos[]`: Lưu danh sách todos, có `userId` để liên kết với user

#### 2.1.2. JSON Server Auth Middleware

**Script chạy:**
```json
{
  "server": "json-server db.json -m ./node_modules/json-server-auth --port 4000"
}
```

**Middleware json-server-auth cung cấp:**
1. **Authentication Endpoints:**
   - `POST /register`: Đăng ký user mới
   - `POST /login`: Đăng nhập (trả về accessToken)

2. **Protected Routes:**
   - Tự động check Bearer token trong header
   - Chỉ cho phép CRUD trên resource của user đó

3. **Token Format:**
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

### 2.2. API Endpoints

#### 2.2.1. Authentication APIs

**Register:**
```http
POST http://localhost:4000/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Login:**
```http
POST http://localhost:4000/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "accessToken": "eyJhbGc...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### 2.2.2. CRUD APIs cho Todos

**GET - Lấy danh sách:**
```http
GET http://localhost:4000/todos?userId=1
Authorization: Bearer eyJhbGc...

Response:
[
  {
    "id": 1,
    "title": "Learn React",
    "completed": false,
    "userId": 1
  }
]
```

**POST - Thêm mới:**
```http
POST http://localhost:4000/todos
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "title": "New Todo",
  "completed": false,
  "userId": 1
}

Response:
{
  "id": 2,
  "title": "New Todo",
  "completed": false,
  "userId": 1
}
```

**PATCH - Cập nhật:**
```http
PATCH http://localhost:4000/todos/1
Authorization: Bearer eyJhbGc...
Content-Type: application/json

{
  "completed": true
}

Response:
{
  "id": 1,
  "title": "Learn React",
  "completed": true,
  "userId": 1
}
```

**DELETE - Xóa:**
```http
DELETE http://localhost:4000/todos/1
Authorization: Bearer eyJhbGc...

Response: 200 OK
```

---

## 3. FRONTEND - REACT APP

### 3.1. Cấu trúc thư mục

```
src/
├── api/
│   ├── axiosClient.js          # Axios instance với interceptors
│   └── authApi.js               # API endpoints cho authentication
│
├── components/
│   ├── ProtectedRoute.jsx       # HOC bảo vệ routes cần auth
│   └── TodoItem.jsx             # Component hiển thị 1 todo (có React.memo)
│
├── contexts/
│   └── AuthContext.jsx          # Context API quản lý auth state
│
├── hooks/
│   ├── useFetch.js              # Custom hook cho API calls
│   └── useDebounce.js           # Custom hook cho debounce
│
├── pages/
│   ├── LoginPage.jsx            # Trang đăng nhập
│   ├── RegisterPage.jsx         # Trang đăng ký
│   └── TodoPage.jsx             # Trang quản lý todos
│
├── App.jsx                      # Router configuration
├── main.jsx                     # Entry point
└── index.css                    # Tailwind CSS
```

### 3.2. Chi tiết từng phần

---

## 3.2.1. API LAYER (Axios Configuration)

### File: `src/api/axiosClient.js`

**Mục đích:** Tạo Axios instance với config chung và interceptors

**Code:**
```javascript
import axios from 'axios';

// Tạo instance với base config
const axiosClient = axios.create({
  baseURL: 'http://localhost:4000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// REQUEST INTERCEPTOR
axiosClient.interceptors.request.use(
  (config) => {
    // Tự động gắn token vào mọi request
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// RESPONSE INTERCEPTOR
axiosClient.interceptors.response.use(
  (response) => {
    // Chỉ trả về data, bỏ status, headers...
    return response.data;
  },
  (error) => {
    // Xử lý lỗi chung (401 → logout, etc.)
    return Promise.reject(error);
  }
);

export default axiosClient;
```

**Giải thích chi tiết:**

1. **axios.create()**: Tạo instance riêng với config cố định
   - Tất cả requests đều tự động có baseURL
   - Header Content-Type mặc định

2. **Request Interceptor**: Chạy TRƯỚC khi request gửi đi
   - Lấy token từ localStorage
   - Tự động gắn vào header Authorization
   - ✅ Lợi ích: Không cần gắn token thủ công mỗi request

3. **Response Interceptor**: Chạy SAU khi response về
   - Unwrap data → Chỉ lấy phần data cần thiết
   - ✅ Lợi ích: Component chỉ cần `const data = await api.get()`

### File: `src/api/authApi.js`

**Code:**
```javascript
import axiosClient from './axiosClient';

const authApi = {
  register(data) {
    return axiosClient.post('/register', data);
  },
  
  login(data) {
    return axiosClient.post('/login', data);
  },
};

export default authApi;
```

**Giải thích:**
- Tách riêng logic API thành module
- Dễ maintain và test
- Component chỉ cần import và dùng: `authApi.login(data)`

---

## 3.2.2. CONTEXT API (State Management)

### File: `src/contexts/AuthContext.jsx`

**Mục đích:** Quản lý authentication state toàn app

**Code flow:**
```javascript
// 1. TẠO CONTEXT
const AuthContext = createContext();

// 2. PROVIDER COMPONENT
export const AuthProvider = ({ children }) => {
  // Lazy initialization: Đọc localStorage chỉ 1 lần
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // ACTIONS
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // VALUE OBJECT
  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 3. CUSTOM HOOK
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải dùng trong AuthProvider');
  }
  return context;
};
```

**Giải thích chi tiết:**

**1. Lazy Initialization Pattern:**
```javascript
const [user, setUser] = useState(() => {
  // Function này CHỈ chạy 1 lần khi component mount
  return computeExpensiveValue();
});
```
- ✅ Tránh đọc localStorage mỗi lần render
- ✅ Không cần useEffect → Ít re-render hơn
- ✅ Synchronous → Không cần loading state

**2. Context Pattern:**
```
AuthProvider (top level)
    ↓ provides value
LoginPage → useAuth() → {user, login, logout}
TodoPage → useAuth() → {user, login, logout}
```

**3. Custom Hook `useAuth()`:**
- Abstraction layer giữa component và Context
- Dễ dùng: `const { user, login } = useAuth()`
- Error handling: Throw error nếu dùng sai

**Lợi ích:**
- ✅ Tránh Props Drilling (truyền props qua nhiều tầng)
- ✅ Centralized state: 1 nơi quản lý auth
- ✅ Persist state: localStorage giữ login sau refresh

---

## 3.2.3. CUSTOM HOOKS

### Hook 1: `useFetch` - API Call Hook

**File:** `src/hooks/useFetch.js`

**Mục đích:** Tái sử dụng logic fetch data với loading/error states

**Code:**
```javascript
const useFetch = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await axios({
        url,
        method: options.method || 'GET',
        data: options.body,
        headers: options.headers
      });
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (url) fetchData();
  }, [url]);

  return { data, loading, error, refetch: fetchData };
};
```

**Cách dùng trong component:**
```javascript
function TodoList() {
  const { data, loading, error } = useFetch('/api/todos');
  
  if (loading) return <Spinner />;
  if (error) return <Error message={error} />;
  return <List items={data} />;
}
```

**Giải thích 3 states pattern:**
```javascript
// IDLE state
{ data: null, loading: false, error: null }

// LOADING state
{ data: null, loading: true, error: null }

// SUCCESS state
{ data: [...], loading: false, error: null }

// ERROR state
{ data: null, loading: false, error: "Error message" }
```

### Hook 2: `useDebounce` - Debounce Hook

**File:** `src/hooks/useDebounce.js`

**Mục đích:** Delay update value để optimize performance

**Code:**
```javascript
function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Set timeout để update sau {delay}ms
    const timeoutId = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Cleanup: Clear timeout nếu value thay đổi trước khi hết delay
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debouncedValue;
}
```

**Timeline diagram:**
```
User types: "R" → Set timeout 300ms
            ↓
User types: "Re" → Clear previous timeout, set new 300ms
            ↓
User types: "Rea" → Clear previous timeout, set new 300ms
            ↓
User types: "Reac" → Clear previous timeout, set new 300ms
            ↓
User stops typing → Wait 300ms → debouncedValue = "Reac"
```

**Cách dùng:**
```javascript
function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    // Chỉ call API khi debouncedSearch thay đổi
    if (debouncedSearch) {
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  );
}
```

**Lợi ích:**
- ✅ Giảm 90% API calls khi user đang gõ
- ✅ Improve UX: Không spam requests
- ✅ Save bandwidth và server load

---

## 3.2.4. ROUTING (React Router)

### File: `src/App.jsx`

**Code:**
```javascript
function App() {
  const { isAuthenticated } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - redirect nếu đã login */}
        <Route 
          path="/login" 
          element={
            isAuthenticated ? <Navigate to="/todos" /> : <LoginPage />
          } 
        />
        
        <Route 
          path="/register" 
          element={
            isAuthenticated ? <Navigate to="/todos" /> : <RegisterPage />
          } 
        />

        {/* Protected route - chỉ truy cập khi đã login */}
        <Route 
          path="/todos" 
          element={
            <ProtectedRoute>
              <TodoPage />
            </ProtectedRoute>
          } 
        />

        {/* Default redirect */}
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/todos" : "/login"} />} 
        />
      </Routes>
    </BrowserRouter>
  );
}
```

### File: `src/components/ProtectedRoute.jsx`

**Code:**
```javascript
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
```

**Flow diagram:**
```
User truy cập /todos
    ↓
ProtectedRoute check isAuthenticated
    ↓
    ├─ TRUE → Render TodoPage
    └─ FALSE → Redirect to /login
```

**Giải thích:**
- **replace prop**: Thay thế history entry, không tạo mới
  - User nhấn Back → Không quay về protected route
  - Tránh infinite redirect loop

---

## 3.2.5. FORM & VALIDATION

### File: `src/pages/RegisterPage.jsx`

**Stack:** react-hook-form + yup

**1. Định nghĩa Schema:**
```javascript
const schema = yup.object({
  email: yup
    .string()
    .required('Email là bắt buộc')
    .email('Email không hợp lệ'),
  
  password: yup
    .string()
    .required('Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu phải ít nhất 6 ký tự'),
  
  confirmPassword: yup
    .string()
    .required('Xác nhận mật khẩu là bắt buộc')
    .oneOf([yup.ref('password')], 'Mật khẩu không khớp')
});
```

**Giải thích Yup schema:**
- `yup.string()`: Khai báo kiểu dữ liệu
- `required()`: Validation rule - bắt buộc
- `email()`: Built-in validator cho email format
- `min(6)`: Custom rule - độ dài tối thiểu
- `oneOf([yup.ref('password')])`: So sánh với field khác

**2. Setup React Hook Form:**
```javascript
const {
  register,      // Function để đăng ký input
  handleSubmit,  // Wrapper cho onSubmit
  formState: { errors }  // Object chứa errors
} = useForm({
  resolver: yupResolver(schema),  // Kết nối với yup
  mode: 'onBlur'  // Validate khi blur ra khỏi input
});
```

**3. Register Input:**
```javascript
<input
  type="email"
  {...register('email')}  // Spread props: name, onChange, onBlur, ref
  className={errors.email ? 'border-red-500' : 'border-gray-300'}
/>
{errors.email && (
  <p className="text-red-500">{errors.email.message}</p>
)}
```

**4. Submit Handler:**
```javascript
const onSubmit = async (data) => {
  // data đã được validate bởi yup
  try {
    const response = await authApi.register(data);
    navigate('/login');
  } catch (error) {
    setApiError(error.response?.data);
  }
};

<form onSubmit={handleSubmit(onSubmit)}>
```

**Validation Flow:**
```
User nhập email: "abc"
    ↓
onBlur event
    ↓
React Hook Form trigger validation
    ↓
Yup schema check: email() rule
    ↓
Invalid → errors.email = "Email không hợp lệ"
    ↓
Component re-render → Show error message
```

**Lợi ích:**
- ✅ Declarative validation: Schema rõ ràng
- ✅ Performance: Ít re-render (uncontrolled form)
- ✅ Type-safe: TypeScript support tốt
- ✅ Error handling tự động

---

## 3.2.6. TODO PAGE (Main Feature)

### File: `src/pages/TodoPage.jsx`

**Component structure:**
```javascript
TodoPage
├── Header (user info + logout)
├── Add Todo Form
├── Search & Filter
└── Todo List
    └── TodoItem (memoized)
```

### **CRUD Operations Code:**

**1. READ - Fetch Todos:**
```javascript
const fetchTodos = async () => {
  setLoading(true);
  try {
    const token = localStorage.getItem('access_token');
    const response = await axios.get(API_URL, {
      headers: { 'Authorization': `Bearer ${token}` },
      params: { userId: user.id }
    });
    setTodos(response.data);
  } catch (err) {
    setError('Không thể tải todos');
  } finally {
    setLoading(false);
  }
};

useEffect(() => {
  fetchTodos();
}, []);
```

**2. CREATE - Add Todo:**
```javascript
const handleAddTodo = async (e) => {
  e.preventDefault();
  if (!newTodo.trim()) return;

  try {
    const response = await axios.post(API_URL, {
      title: newTodo,
      completed: false,
      userId: user.id
    }, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Optimistic update: Thêm vào state ngay
    setTodos([...todos, response.data]);
    setNewTodo('');
  } catch (err) {
    alert('Không thể thêm todo');
  }
};
```

**3. UPDATE - Toggle Complete:**
```javascript
const handleToggleComplete = useCallback(async (todo) => {
  try {
    const response = await axios.patch(
      `${API_URL}/${todo.id}`,
      { completed: !todo.completed },
      { headers: { 'Authorization': `Bearer ${token}` }}
    );

    // Update state với functional update
    setTodos(prev => prev.map(t => 
      t.id === todo.id ? response.data : t
    ));
  } catch {
    alert('Không thể cập nhật');
  }
}, []);
```

**4. DELETE - Remove Todo:**
```javascript
const handleDelete = useCallback(async (id) => {
  if (!confirm('Bạn có chắc muốn xóa?')) return;

  try {
    await axios.delete(`${API_URL}/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Remove từ state
    setTodos(prev => prev.filter(t => t.id !== id));
  } catch {
    alert('Không thể xóa');
  }
}, []);
```

---

## 4. CODE FLOW CHI TIẾT

### 4.1. Flow đăng ký (Register)

```
Step 1: User mở app
    ↓
main.jsx render
    ↓
<AuthProvider> wrap <App>
    ↓
AuthContext initialize:
  - Đọc localStorage
  - user = null (chưa login)
    ↓
App.jsx render
    ↓
Router check: isAuthenticated = false
    ↓
Redirect to /login

===========================================

Step 2: User click "Đăng ký"
    ↓
Navigate to /register
    ↓
RegisterPage.jsx render
    ↓
useForm() initialize với yup schema

===========================================

Step 3: User nhập form
    ↓
User types email: "user@example.com"
    ↓
react-hook-form update internal state
    ↓
User blur out → Trigger validation
    ↓
Yup check email format → Valid ✓
    ↓
User types password: "123"
    ↓
User blur → Validation
    ↓
Yup check min(6) → Invalid ✗
    ↓
errors.password = "Mật khẩu phải ít nhất 6 ký tự"
    ↓
Component re-render → Show error

===========================================

Step 4: User submit form (valid)
    ↓
handleSubmit wrapper check validation
    ↓
All fields valid → Call onSubmit(data)
    ↓
onSubmit call authApi.register(data)
    ↓
axiosClient.post('/register', data)
    ↓
Request interceptor: Gắn token (nếu có)
    ↓
HTTP POST → Backend

Backend xử lý:
  - Hash password
  - Save to db.json
  - Generate accessToken (JWT)
  - Return { accessToken, user }
    ↓
Response về Frontend
    ↓
Response interceptor: Unwrap data
    ↓
onSubmit nhận response:
  {
    accessToken: "eyJhbGc...",
    user: { id: 1, email: "..." }
  }
    ↓
navigate('/login')
    ↓
LoginPage render
```

### 4.2. Flow đăng nhập (Login)

```
Step 1: User ở LoginPage
    ↓
Nhập email + password
    ↓
Submit form (đã validate)
    ↓
onSubmit call authApi.login(data)
    ↓
HTTP POST /login → Backend
    ↓
Backend check credentials:
  - Email tồn tại?
  - Password match (compare hash)?
  - Valid → Return { accessToken, user }
    ↓
Response về Frontend
    ↓
onSubmit xử lý:
  const { accessToken, user } = response;
  
  // Lưu token vào localStorage
  localStorage.setItem('access_token', accessToken);
  
  // Update Context state
  login(user, accessToken);
    ↓
AuthContext.login() execute:
  - setUser(userData)
  - localStorage.setItem('user', JSON.stringify(userData))
    ↓
Context value thay đổi:
  - user: { id: 1, email: "..." }
  - isAuthenticated: true
    ↓
All components subscribe Context re-render
    ↓
App.jsx detect isAuthenticated = true
    ↓
navigate('/todos')
    ↓
Router render ProtectedRoute
    ↓
ProtectedRoute check: isAuthenticated = true ✓
    ↓
Render TodoPage
```

### 4.3. Flow tải todos (Read)

```
TodoPage mount
    ↓
useEffect(() => { fetchTodos() }, [])
    ↓
fetchTodos() execute:
  - setLoading(true)
  - Get token từ localStorage
  - axios.get('/todos?userId=1')
    ↓
Request interceptor tự động gắn:
  Authorization: Bearer eyJhbGc...
    ↓
HTTP GET → Backend
    ↓
json-server-auth middleware:
  - Verify JWT token
  - Check userId match
  - Return todos của user đó
    ↓
Response về:
  [
    { id: 1, title: "Learn React", completed: false }
  ]
    ↓
Response interceptor: return response.data
    ↓
fetchTodos nhận data:
  - setTodos(response.data)
  - setLoading(false)
    ↓
Component re-render với todos mới
    ↓
Render TodoList:
  todos.map(todo => <TodoItem key={todo.id} todo={todo} />)
```

### 4.4. Flow search với debounce

```
User gõ "R" vào search box
    ↓
onChange → setSearchTerm("R")
    ↓
searchTerm state update → Component re-render
    ↓
useDebounce("R", 300) execute:
  - Set timeout 300ms
  - debouncedSearch vẫn là ""
    ↓
200ms sau, user gõ tiếp "e"
    ↓
setSearchTerm("Re")
    ↓
useDebounce cleanup:
  - clearTimeout() → Hủy timeout cũ
  - Set timeout mới 300ms
  - debouncedSearch vẫn là ""
    ↓
User gõ tiếp "a", "c", "t"...
    (Mỗi lần đều clear và set timeout mới)
    ↓
User ngừng gõ
    ↓
Sau 300ms, timeout execute:
  - setDebouncedValue("React")
    ↓
debouncedSearch thay đổi
    ↓
useMemo dependencies [todos, debouncedSearch] thay đổi
    ↓
useMemo re-compute:
  filteredTodos = todos.filter(todo =>
    todo.title.includes("React")
  )
    ↓
Component re-render với filteredTodos mới
```

### 4.5. Flow toggle todo với optimization

```
User click checkbox của TodoItem id=1
    ↓
onClick → handleToggleComplete(todo)
    ↓
handleToggleComplete là useCallback function:
  - Reference không thay đổi (deps=[])
  - TodoItem không re-render vì props stable
    ↓
Execute async function:
  - axios.patch('/todos/1', { completed: true })
    ↓
Backend update db.json
    ↓
Response về: { id: 1, title: "...", completed: true }
    ↓
Update state với functional update:
  setTodos(prev => prev.map(t => 
    t.id === 1 ? response.data : t
  ))
    ↓
todos state thay đổi
    ↓
TodoPage re-render
    ↓
todos.map() tạo list TodoItem mới
    ↓
React.memo compare props của từng TodoItem:
  - TodoItem id=1: todo prop thay đổi → Re-render ✓
  - TodoItem id=2: todo prop không đổi → Skip re-render ✗
  - TodoItem id=3: todo prop không đổi → Skip re-render ✗
    ↓
Chỉ TodoItem bị toggle re-render
    ↓
Performance optimized! 🚀
```

---

## 5. KIẾN THỨC REACT NÂNG CAO

### 5.1. Context API

**Vấn đề giải quyết: Props Drilling**

**Trước khi có Context:**
```javascript
<App>
  <Header user={user} logout={logout} />
  <Content>
    <Sidebar user={user} />
    <Main>
      <Profile user={user} logout={logout} />
    </Main>
  </Content>
</App>
```
❌ Phải truyền props qua nhiều tầng
❌ Components trung gian không dùng props
❌ Khó maintain khi app lớn

**Với Context:**
```javascript
<AuthProvider>
  <App>
    <Header /> {/* useAuth() bên trong */}
    <Content>
      <Sidebar />
      <Main>
        <Profile /> {/* useAuth() bên trong */}
      </Main>
    </Content>
  </App>
</AuthProvider>
```
✅ Component lấy data trực tiếp từ Context
✅ Không cần props drilling
✅ Easy to maintain

**Khi nào dùng Context:**
- ✅ Data cần share nhiều nơi (theme, auth, language)
- ✅ Data thay đổi không thường xuyên
- ❌ KHÔNG dùng cho data thay đổi liên tục (form state)
- ❌ KHÔNG thay thế Redux cho complex state

### 5.2. Custom Hooks

**Quy tắc đặt tên:** Phải bắt đầu bằng `use`

**Lợi ích:**
1. **Reusability**: Tái sử dụng logic
2. **Separation of Concerns**: Tách logic khỏi UI
3. **Testability**: Dễ test riêng logic

**Ví dụ so sánh:**

**Không dùng custom hook:**
```javascript
function TodoList() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/todos')
      .then(res => res.json())
      .then(data => {
        setTodos(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <Spinner />;
  if (error) return <Error />;
  return <List items={todos} />;
}

function UserList() {
  // Duplicate toàn bộ logic trên cho users
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  // ...
}
```

**Dùng custom hook:**
```javascript
function useFetch(url) {
  // Logic chung
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // ... fetch logic
  }, [url]);

  return { data, loading, error };
}

// Reuse ở nhiều nơi
function TodoList() {
  const { data, loading, error } = useFetch('/api/todos');
  // Clean UI logic
}

function UserList() {
  const { data, loading, error } = useFetch('/api/users');
  // Same logic, different data
}
```

### 5.3. React Router v6

**Concepts chính:**

**1. Declarative Routing:**
```javascript
<Routes>
  <Route path="/about" element={<About />} />
  <Route path="/users/:id" element={<User />} />
</Routes>
```

**2. Nested Routes:**
```javascript
<Route path="/dashboard" element={<Dashboard />}>
  <Route path="profile" element={<Profile />} />
  <Route path="settings" element={<Settings />} />
</Route>

// Dashboard.jsx
function Dashboard() {
  return (
    <div>
      <Sidebar />
      <Outlet /> {/* Render nested route here */}
    </div>
  );
}
```

**3. Protected Routes Pattern:**
```javascript
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

<Route 
  path="/admin" 
  element={
    <ProtectedRoute>
      <AdminPage />
    </ProtectedRoute>
  } 
/>
```

**4. Navigation Hooks:**
```javascript
// Programmatic navigation
const navigate = useNavigate();
navigate('/home');
navigate(-1); // Go back

// Get params
const { id } = useParams();

// Get query string
const [searchParams] = useSearchParams();
const query = searchParams.get('q');
```

### 5.4. Form Management (react-hook-form)

**So sánh Controlled vs Uncontrolled:**

**Controlled (useState):**
```javascript
function Form() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <>
      <input 
        value={email} 
        onChange={(e) => setEmail(e.target.value)} 
      />
      <input 
        value={password} 
        onChange={(e) => setPassword(e.target.value)} 
      />
    </>
  );
}
```
❌ Mỗi keystroke → Re-render
❌ Performance issue với form lớn

**Uncontrolled (react-hook-form):**
```javascript
function Form() {
  const { register, handleSubmit } = useForm();

  return (
    <>
      <input {...register('email')} />
      <input {...register('password')} />
    </>
  );
}
```
✅ Không re-render khi typing
✅ Chỉ re-render khi submit hoặc validation error
✅ Performance tốt hơn

**Validation với Yup:**
```javascript
// Declarative schema
const schema = yup.object({
  age: yup.number()
    .required()
    .min(18, 'Phải trên 18 tuổi')
    .max(100),
  
  phone: yup.string()
    .matches(/^[0-9]{10}$/, 'SĐT phải 10 số'),
  
  website: yup.string()
    .url('URL không hợp lệ'),
});

// Tích hợp vào form
const { register, handleSubmit } = useForm({
  resolver: yupResolver(schema)
});
```

---

## 6. PERFORMANCE OPTIMIZATION

### 6.1. React.memo

**Vấn đề:**
```javascript
function Parent() {
  const [count, setCount] = useState(0);
  const [todos, setTodos] = useState([]);

  return (
    <>
      <button onClick={() => setCount(count + 1)}>
        Count: {count}
      </button>
      {todos.map(todo => (
        <TodoItem key={todo.id} todo={todo} />
      ))}
    </>
  );
}
```
❌ Click button → count thay đổi
❌ Parent re-render
❌ TẤT CẢ TodoItem re-render (dù props không đổi)

**Giải pháp:**
```javascript
const TodoItem = memo(({ todo, onDelete }) => {
  console.log(`Render todo ${todo.id}`);
  return <div>{todo.title}</div>;
});
```
✅ React.memo shallow compare props
✅ Props không đổi → Skip re-render
✅ Performance boost!

**Khi nào dùng React.memo:**
- ✅ Component render nhiều lần
- ✅ Props thay đổi ít
- ✅ Component có tính toán nặng
- ❌ Props thay đổi thường xuyên (memo = overhead)

### 6.2. useCallback

**Vấn đề:**
```javascript
function Parent() {
  const [count, setCount] = useState(0);

  // Function mới được tạo mỗi lần render
  const handleDelete = (id) => {
    console.log('Delete', id);
  };

  return (
    <>
      <button onClick={() => setCount(count + 1)}>Count</button>
      <TodoItem onDelete={handleDelete} /> {/* Memo bị phá */}
    </>
  );
}
```
❌ Mỗi render → handleDelete mới
❌ Reference mới → Props thay đổi
❌ TodoItem re-render (dù có memo)

**Giải pháp:**
```javascript
const handleDelete = useCallback((id) => {
  console.log('Delete', id);
}, []); // Dependencies empty → Function never changes
```
✅ Function reference stable
✅ Props không đổi
✅ Memo hoạt động đúng

**Khi nào dùng useCallback:**
- ✅ Function là props của memoized component
- ✅ Function là dependency của useEffect
- ❌ Function không truyền cho child (không cần optimize)

### 6.3. useMemo

**Vấn đề:**
```javascript
function TodoList({ todos }) {
  // Tính toán nặng chạy mỗi lần render
  const expensiveCalculation = todos
    .filter(t => t.completed)
    .map(t => t.title)
    .sort();

  return <div>{expensiveCalculation.length} completed</div>;
}
```
❌ Mỗi render → Chạy filter, map, sort lại
❌ Waste computation

**Giải pháp:**
```javascript
const expensiveCalculation = useMemo(() => {
  return todos
    .filter(t => t.completed)
    .map(t => t.title)
    .sort();
}, [todos]); // Chỉ tính lại khi todos thay đổi
```
✅ Cache kết quả
✅ Chỉ re-compute khi cần

**Khi nào dùng useMemo:**
- ✅ Tính toán phức tạp (filter lớn, sort, reduce)
- ✅ Derived state từ props
- ❌ Tính toán đơn giản (overhead > benefit)

### 6.4. Debounce Pattern

**Scenario: Search Input**

**Không debounce:**
```
User types: "R" → API call
User types: "Re" → API call
User types: "Rea" → API call
User types: "Reac" → API call
User types: "React" → API call
Total: 5 API calls
```
❌ Spam requests
❌ Waste bandwidth
❌ Poor performance

**Có debounce:**
```
User types: "R" → Start timer 300ms
User types: "Re" → Reset timer
User types: "Rea" → Reset timer
User types: "Reac" → Reset timer
User types: "React" → Reset timer
User stops → Wait 300ms → API call
Total: 1 API call
```
✅ Chỉ 1 request
✅ Save bandwidth
✅ Better UX

**Implementation:**
```javascript
function SearchBox() {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (debouncedSearch) {
      // Only call API when user stops typing
      searchAPI(debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <input 
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      placeholder="Search..."
    />
  );
}
```

### 6.5. Performance Checklist

**Optimization priorities:**

**1. Measure first**
```javascript
// Chrome DevTools → Performance tab
// React DevTools → Profiler
```

**2. Optimize what matters**
```
❌ Không nên: Optimize mọi thứ
✅ Nên: Optimize bottlenecks thực tế
```

**3. Common bottlenecks:**
- Large lists (virtualize with react-window)
- Heavy computations (useMemo)
- Frequent re-renders (React.memo + useCallback)
- Network requests (cache, debounce)

**4. Code splitting:**
```javascript
// Lazy load heavy components
const HeavyComponent = lazy(() => import('./Heavy'));

function App() {
  return (
    <Suspense fallback={<Spinner />}>
      <HeavyComponent />
    </Suspense>
  );
}
```

---

## 7. BEST PRACTICES

### 7.1. Code Organization

**1. File naming:**
```
Components: PascalCase (TodoItem.jsx)
Hooks: camelCase with 'use' prefix (useDebounce.js)
Utils: camelCase (formatDate.js)
Constants: UPPER_SNAKE_CASE (API_URL.js)
```

**2. Folder structure:**
```
src/
├── api/              # API layer
├── components/       # Reusable components
├── contexts/         # Context providers
├── hooks/            # Custom hooks
├── pages/            # Page components
├── utils/            # Helper functions
└── constants/        # Constants
```

### 7.2. React Patterns

**1. Container/Presentational:**
```javascript
// Container (logic)
function TodoContainer() {
  const { todos, loading } = useTodos();
  const handleDelete = (id) => deleteTodo(id);

  return <TodoList todos={todos} onDelete={handleDelete} />;
}

// Presentational (UI)
function TodoList({ todos, onDelete }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>
          {todo.title}
          <button onClick={() => onDelete(todo.id)}>Delete</button>
        </li>
      ))}
    </ul>
  );
}
```

**2. Compound Components:**
```javascript
<Tabs>
  <Tab label="Tab 1">Content 1</Tab>
  <Tab label="Tab 2">Content 2</Tab>
</Tabs>
```

**3. Render Props:**
```javascript
<DataProvider render={data => (
  <div>{data.map(item => ...)}</div>
)} />
```

### 7.3. Error Handling

**1. Try-catch trong async:**
```javascript
const fetchData = async () => {
  try {
    const data = await api.get('/data');
    setData(data);
  } catch (error) {
    setError(error.message);
    // Log to error tracking service
    console.error(error);
  }
};
```

**2. Error Boundaries:**
```javascript
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
```

### 7.4. Security

**1. XSS Prevention:**
```javascript
// React tự động escape
<div>{userInput}</div> // Safe

// Dangerous
<div dangerouslySetInnerHTML={{__html: userInput}} /> // ❌
```

**2. Token Storage:**
```javascript
// ✅ httpOnly cookie (best)
// ⚠️ localStorage (OK for learning)
// ❌ sessionStorage (mất khi close tab)
```

**3. CORS:**
```javascript
// Backend cần enable CORS
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## 8. DEBUGGING TIPS

### 8.1. React DevTools

**Component Inspector:**
- View props, state, hooks
- Highlight re-renders

**Profiler:**
- Record rendering performance
- Identify slow components

### 8.2. Console Debugging

```javascript
// Temporary debug logs
console.log('🔍 Debug:', variable);

// Component render tracking
useEffect(() => {
  console.log('Component mounted');
  return () => console.log('Component unmounted');
}, []);

// Props/State changes
useEffect(() => {
  console.log('Props changed:', props);
}, [props]);
```

### 8.3. Common Issues

**1. Infinite loop:**
```javascript
// ❌ Wrong
useEffect(() => {
  setCount(count + 1);
}); // Missing deps array

// ✅ Correct
useEffect(() => {
  setCount(prev => prev + 1);
}, []); // Run once
```

**2. Stale closure:**
```javascript
// ❌ Wrong
const handleClick = () => {
  setTimeout(() => {
    console.log(count); // Stale value
  }, 1000);
};

// ✅ Correct
const handleClick = () => {
  setTimeout(() => {
    setCount(prev => {
      console.log(prev); // Fresh value
      return prev;
    });
  }, 1000);
};
```

---

## 9. KẾT LUẬN

### 9.1. Kiến thức đã học

✅ **Backend:**
- JSON Server setup
- Authentication với JWT
- RESTful API design

✅ **Frontend:**
- Context API cho state management
- Custom Hooks pattern
- React Router protected routes
- Form validation với react-hook-form + yup
- CRUD operations
- Performance optimization

✅ **Advanced Concepts:**
- React.memo, useCallback, useMemo
- Debounce pattern
- Lazy initialization
- Axios interceptors
- Error handling

### 9.2. Next Steps

**1. Nâng cao hơn:**
- Redux Toolkit
- React Query / TanStack Query
- TypeScript
- Testing (Jest + React Testing Library)

**2. Production-ready:**
- Error tracking (Sentry)
- Analytics
- CI/CD
- Docker deployment

**3. Performance:**
- Code splitting
- React.lazy + Suspense
- Virtual scrolling
- Service Workers

---

## 📚 TÀI LIỆU THAM KHẢO

- [React Docs](https://react.dev)
- [React Router](https://reactrouter.com)
- [React Hook Form](https://react-hook-form.com)
- [Yup Validation](https://github.com/jquense/yup)
- [Axios](https://axios-http.com)
- [JSON Server](https://github.com/typicode/json-server)

---

**Created by:** AI Assistant  
**Date:** December 12, 2025  
**Version:** 1.0
