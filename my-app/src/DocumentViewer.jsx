export default function DocumentViewer({ content, fileType }) {
  if (!content) {
    return (
      <div className="document-viewer empty">
        <p>Chưa có file nào được tải lên</p>
      </div>
    );
  }

  return (
    <div className="document-viewer">
      <h2>Nội dung file</h2>
      
      {fileType === 'word' && (
        <div 
          className="word-content"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      )}
      
      {fileType === 'excel' && (
        <div className="excel-content">
          {content}
        </div>
      )}
      
      {fileType === 'pdf' && (
        <div className="pdf-content">
          {content}
        </div>
      )}
    </div>
  );
}
