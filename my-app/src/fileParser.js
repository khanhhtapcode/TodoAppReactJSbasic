import mammoth from 'mammoth';
import * as XLSX from 'xlsx';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

// Parse Word file (.docx)
export async function parseWordFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.convertToHtml({ arrayBuffer });
    return {
      success: true,
      html: result.value,
      messages: result.messages
    };
  } catch (error) {
    console.error('Error parsing Word file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse Excel file (.xlsx, .xls)
export async function parseExcelFile(file) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const workbook = XLSX.read(arrayBuffer, { type: 'array' });
    
    // Get all sheets
    const sheets = {};
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      sheets[sheetName] = XLSX.utils.sheet_to_html(worksheet);
    });
    
    return {
      success: true,
      sheets,
      sheetNames: workbook.SheetNames
    };
  } catch (error) {
    console.error('Error parsing Excel file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Parse PDF file
export async function parsePDFFile(file) {
  try {
    return {
      success: true,
      fileUrl: URL.createObjectURL(file)
    };
  } catch (error) {
    console.error('Error parsing PDF file:', error);
    return {
      success: false,
      error: error.message
    };
  }
}
