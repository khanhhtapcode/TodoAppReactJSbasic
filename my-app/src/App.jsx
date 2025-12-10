// src/App.jsx
import { useState, useEffect } from "react";
import TodoInput from "./TodoInput"; // Import con vào
import TodoList from "./TodoList";   // Import con vào

function App() {
  // --- 1. STATE & EFFECT (Giữ nguyên) ---
  const [todos, setTodos] = useState(() => {
    const storedTodos = localStorage.getItem("todos");
    return storedTodos ? JSON.parse(storedTodos) : [];
  });

  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // --- 2. LOGIC HANDLERS (Xử lý nghiệp vụ) ---
  
  // Hàm này giờ chỉ nhận text từ con, không cần lo về input state nữa
  const handleAdd = (text) => {
    const newTodo = { id: Date.now(), title: text, completed: false };
    setTodos([...todos, newTodo]);
  };

  const handleDelete = (id) => {
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const handleToggle = (id) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  // --- 3. RENDER (Giao diện gọn gàng) ---
  return (
    <div className="App" style={{ padding: 20 }}>
      <h1>Danh sách công việc (Refactored)</h1>
      
      {/* Truyền hàm thêm xuống cho con */}
      <TodoInput onAdd={handleAdd} />

      {/* Truyền dữ liệu và hàm xử lý xuống cho con */}
      <TodoList 
        todos={todos} 
        onDelete={handleDelete} 
        onToggle={handleToggle} 
      />
    </div>
  );
}

export default App;