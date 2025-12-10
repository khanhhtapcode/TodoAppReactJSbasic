// src/TodoList.jsx
export default function TodoList({ todos, onDelete, onToggle }) {
  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <li key={todo.id} className="todo-item">
          <span
            className="todo-text" 
            style={{
              textDecoration: todo.completed ? "line-through" : "none",
              opacity: todo.completed ? 0.5 : 1 
            }}
            onClick={() => onToggle(todo.id)}
          >
            {todo.title}
          </span>

          <div>
            <button 
              className="btn-toggle"
              onClick={() => onToggle(todo.id)}
            >
              {todo.completed ? '↩' : '✓'}
            </button>
            
            <button 
              className="btn-delete" 
              onClick={() => onDelete(todo.id)}
            >
              ✕
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}