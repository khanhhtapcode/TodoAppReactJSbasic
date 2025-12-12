import { memo } from 'react';

/**
 * TodoItem Component - Được bọc trong React.memo
 * 
 * React.memo: HOC (Higher Order Component) giúp:
 * - So sánh props cũ và mới
 * - Chỉ re-render khi props thực sự thay đổi
 * - Tránh re-render không cần thiết
 */
const TodoItem = memo(({ 
  todo, 
  isEditing, 
  editText,
  onToggleComplete, 
  onStartEdit, 
  onSaveEdit,
  onCancelEdit,
  onEditTextChange,
  onDelete 
}) => {
  // Debug: Xem component này render bao nhiêu lần
  console.log(`TodoItem ${todo.id} rendered`);

  return (
    <div className="flex items-center gap-3 p-4 border-b last:border-b-0 hover:bg-gray-50">
      {/* Checkbox */}
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={() => onToggleComplete(todo)}
        className="w-5 h-5 cursor-pointer"
      />

      {/* Todo Text */}
      {isEditing ? (
        // Edit Mode
        <input
          type="text"
          value={editText}
          onChange={(e) => onEditTextChange(e.target.value)}
          className="flex-1 px-2 py-1 border border-blue-500 rounded focus:outline-none"
          autoFocus
        />
      ) : (
        // View Mode
        <span
          className={`flex-1 ${
            todo.completed ? 'line-through text-gray-400' : 'text-gray-800'
          }`}
        >
          {todo.title}
        </span>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => onSaveEdit(todo.id)}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600"
            >
              Lưu
            </button>
            <button
              onClick={onCancelEdit}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600"
            >
              Hủy
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => onStartEdit(todo)}
              className="px-3 py-1 bg-yellow-500 text-white text-sm rounded hover:bg-yellow-600"
            >
              Sửa
            </button>
            <button
              onClick={() => onDelete(todo.id)}
              className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
            >
              Xóa
            </button>
          </>
        )}
      </div>
    </div>
  );
});

// Đặt displayName để dễ debug
TodoItem.displayName = 'TodoItem';

export default TodoItem;
