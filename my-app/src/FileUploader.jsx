import { useState } from 'react';

export default function FileUploader({ onFileSelect }) {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      onFileSelect(file);
    }
  };

  return (
    <div className="file-uploader">
      <h2>Chọn file để đọc</h2>
      <input 
        type="file" 
        accept=".docx,.xlsx,.xls,.pdf"
        onChange={handleFileChange}
      />
      {selectedFile && (
        <p>File đã chọn: <strong>{selectedFile.name}</strong></p>
      )}
      <p className="supported-formats">
        Hỗ trợ: Word (.docx), Excel (.xlsx, .xls), PDF (.pdf)
      </p>
    </div>
  );
}
