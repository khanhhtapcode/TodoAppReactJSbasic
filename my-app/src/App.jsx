import { useState } from 'react';
import './App.css';
import FileUploader from './FileUploader';
import DocumentViewer from './DocumentViewer';
import { parseWordFile, parseExcelFile, parsePDFFile } from './fileParser';
import { Document, Page } from 'react-pdf';

function App() {
  const [content, setContent] = useState(null);
  const [fileType, setFileType] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);

  const handleFileSelect = async (file) => {
    setLoading(true);
    setError(null);
    setContent(null);
    
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    try {
      if (fileExtension === 'docx') {
        const result = await parseWordFile(file);
        if (result.success) {
          setContent(result.html);
          setFileType('word');
        } else {
          setError(result.error);
        }
      } 
      else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
        const result = await parseExcelFile(file);
        if (result.success) {
          // Display all sheets
          const allSheets = result.sheetNames.map(name => (
            `<h3>${name}</h3>${result.sheets[name]}`
          )).join('');
          setContent(<div dangerouslySetInnerHTML={{ __html: allSheets }} />);
          setFileType('excel');
        } else {
          setError(result.error);
        }
      } 
      else if (fileExtension === 'pdf') {
        const result = await parsePDFFile(file);
        if (result.success) {
          setContent(result.fileUrl);
          setFileType('pdf');
          setPageNumber(1);
        } else {
          setError(result.error);
        }
      } 
      else {
        setError('Định dạng file không được hỗ trợ');
      }
    } catch (err) {
      setError('Lỗi khi xử lý file: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const goToPrevPage = () => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber(prev => Math.min(prev + 1, numPages || prev));
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + 0.2, 3.0));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - 0.2, 0.5));
  };

  const resetZoom = () => {
    setScale(1.0);
  };

  return (
    <div className="App">
      <header>
        <h1>📄 Trình Đọc Tài Liệu</h1>
        <p>Hỗ trợ Word, Excel, và PDF</p>
      </header>
      
      <FileUploader onFileSelect={handleFileSelect} />
      
      {loading && <div className="loading">Đang xử lý file...</div>}
      {error && <div className="error">Lỗi: {error}</div>}
      
      {fileType === 'pdf' && content && (
        <div className="pdf-toolbar">
          <button onClick={goToPrevPage} disabled={pageNumber <= 1}>
            ◀ Trang trước
          </button>
          <span className="page-info">
            Trang {pageNumber} / {numPages || '...'}
          </span>
          <button onClick={goToNextPage} disabled={pageNumber >= numPages}>
            Trang sau ▶
          </button>
          <div className="zoom-controls">
            <button onClick={zoomOut}>−</button>
            <button onClick={resetZoom}>{Math.round(scale * 100)}%</button>
            <button onClick={zoomIn}>+</button>
          </div>
        </div>
      )}
      
      {fileType === 'pdf' && content ? (
        <div className="pdf-viewer-container">
          <Document
            file={content}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={(error) => setError('Lỗi khi tải PDF: ' + error.message)}
          >
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
      ) : (
        <DocumentViewer content={content} fileType={fileType} />
      )}
    </div>
  );
}

export default App;
