import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

// Export data to CSV
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (import.meta.env.DEV) {
      throw new Error('No data to export');
    }
    return;
  }

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle values that might contain commas or quotes
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  saveAs(blob, filename);
};

// Export data to Excel
export const exportToExcel = (data, filename = 'export.xlsx', sheetName = 'Sheet1') => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    if (import.meta.env.DEV) {
      throw new Error('No data to export');
    }
    return;
  }

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  saveAs(blob, filename);
};

// Export chart/image to PDF
export const exportChartToPDF = async (elementId, filename = 'chart.pdf', title = 'Chart Export') => {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      if (import.meta.env.DEV) {
        throw new Error('Element not found for export');
      }
      return;
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    
    const imgWidth = 297; // A4 width in mm
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.setFontSize(16);
    pdf.text(title, 20, 20);
    
    pdf.addImage(imgData, 'PNG', 20, 30, imgWidth - 40, imgHeight);
    
    pdf.save(filename);
  } catch (error) {
    if (import.meta.env.DEV) {
      throw error; // Re-throw for proper error handling
    }
  }
};

// Export portfolio data to PDF report
export const exportPortfolioToPDF = (portfolioData, userData, filename = 'portfolio-report.pdf') => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('Portfolio Report', 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
  pdf.text(`User: ${userData?.name || 'N/A'}`, 20, 55);
  pdf.text(`Email: ${userData?.email || 'N/A'}`, 20, 65);
  
  // Portfolio Summary
  pdf.setFontSize(16);
  pdf.text('Portfolio Summary', 20, 85);
  
  pdf.setFontSize(12);
  let yPosition = 100;
  
  if (portfolioData.summary) {
    const summary = portfolioData.summary;
    pdf.text(`Total Invested: ₹${summary.total_invested?.toLocaleString('en-IN') || '0'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Current Value: ₹${summary.current_value?.toLocaleString('en-IN') || '0'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Total Returns: ₹${summary.total_returns?.toLocaleString('en-IN') || '0'}`, 20, yPosition);
    yPosition += 10;
    pdf.text(`Returns Percentage: ${summary.returns_percentage?.toFixed(2) || '0'}%`, 20, yPosition);
    yPosition += 20;
  }
  
  // Holdings Table
  if (portfolioData.holdings && portfolioData.holdings.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Holdings', 20, yPosition);
    yPosition += 15;
    
    pdf.setFontSize(10);
    const tableHeaders = ['Product', 'Quantity', 'Avg Price', 'Current Price', 'Value', 'Returns'];
    const colWidths = [60, 20, 25, 25, 25, 25];
    let xPosition = 20;
    
    // Draw table headers
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 10;
    
    // Draw table rows
    portfolioData.holdings.forEach(holding => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      xPosition = 20;
      const rowData = [
        holding.product_name || 'N/A',
        holding.quantity?.toString() || '0',
        `₹${holding.average_price?.toFixed(2) || '0'}`,
        `₹${holding.current_price?.toFixed(2) || '0'}`,
        `₹${holding.current_value?.toLocaleString('en-IN') || '0'}`,
        `₹${holding.returns?.toLocaleString('en-IN') || '0'}`
      ];
      
      rowData.forEach((data, index) => {
        pdf.text(data, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 10;
    });
  }
  
  pdf.save(filename);
};

// Export transactions to PDF
export const exportTransactionsToPDF = (transactions, userData, filename = 'transactions-report.pdf') => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  
  // Header
  pdf.setFontSize(20);
  pdf.text('Transaction Report', 20, 30);
  
  pdf.setFontSize(12);
  pdf.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 45);
  pdf.text(`User: ${userData?.name || 'N/A'}`, 20, 55);
  pdf.text(`Email: ${userData?.email || 'N/A'}`, 20, 65);
  
  // Transactions Table
  if (transactions && transactions.length > 0) {
    pdf.setFontSize(16);
    pdf.text('Transactions', 20, 85);
    
    let yPosition = 100;
    pdf.setFontSize(10);
    
    const tableHeaders = ['Date', 'Product', 'Type', 'Units', 'Price', 'Amount'];
    const colWidths = [30, 50, 15, 20, 25, 30];
    let xPosition = 20;
    
    // Draw table headers
    tableHeaders.forEach((header, index) => {
      pdf.text(header, xPosition, yPosition);
      xPosition += colWidths[index];
    });
    
    yPosition += 10;
    
    // Draw table rows
    transactions.forEach(transaction => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 30;
      }
      
      xPosition = 20;
      const rowData = [
        new Date(transaction.created_at).toLocaleDateString(),
        transaction.product_name || 'N/A',
        transaction.type?.toUpperCase() || 'N/A',
        transaction.units?.toString() || '0',
        `₹${transaction.price_per_unit?.toFixed(2) || '0'}`,
        `₹${transaction.total_amount?.toLocaleString('en-IN') || '0'}`
      ];
      
      rowData.forEach((data, index) => {
        pdf.text(data, xPosition, yPosition);
        xPosition += colWidths[index];
      });
      
      yPosition += 10;
    });
  }
  
  pdf.save(filename);
};

// Export multiple charts to PDF
export const exportMultipleChartsToPDF = async (chartElements, filename = 'charts-report.pdf') => {
  try {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    for (let i = 0; i < chartElements.length; i++) {
      if (i > 0) {
        pdf.addPage();
      }
      
      const element = document.getElementById(chartElements[i].id);
      if (!element) continue;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });
      
      const imgData = canvas.toDataURL('image/png');
      const imgWidth = pageWidth - 40;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      if (chartElements[i].title) {
        pdf.setFontSize(16);
        pdf.text(chartElements[i].title, 20, 20);
      }
      
      pdf.addImage(imgData, 'PNG', 20, 30, imgWidth, imgHeight);
    }
    
    pdf.save(filename);
  } catch (error) {
    if (import.meta.env.DEV) {
      throw error; // Re-throw for proper error handling
    }
  }
};
