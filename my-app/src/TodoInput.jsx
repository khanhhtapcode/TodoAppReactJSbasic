import { useState, useRef } from "react";

export default function TodoInput({ onAdd }) {
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  const handleClick = () => {
    if (text === "") return;
    onAdd(text);
    setText("");
    inputRef.current.focus();
  };

  return (
    <div className="input-group">
      <input
        className="input-field"
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Nhập công việc..."
      />
      <button className="btn-add" onClick={handleClick}>
        Thêm
      </button>
    </div>
  );
}