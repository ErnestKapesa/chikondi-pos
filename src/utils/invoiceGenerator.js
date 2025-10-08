// Smart Invoice Generator for Chikondi POS
import jsPDF from 'jspdf';
import { getUser } from './dbUnified';

// Invoice templates and configurations
const INVOICE_TEMPLATES = {
  professional: {
    name: 'Professional',
    colors: {
      primary: '#10b981',
      secondary: '#6b7280',
      accent: '#f3f4f6',
      text: '#1f2937'
    },
    fonts: {
      title: 20,
      subtitle: 14,
      body: 10,
      small: 8
    }
  },
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#374151',
      secondary: '#9ca3af',
      accent: '#f9fafb',
      text: '#111827'
    },
    fonts: {
      title: 18,
      subtitle: 12,
      body: 9,
      small: 7
    }
  },
  colorful: {
    name: 'Colorful',
    colors: {
      primary: '#3b82f6',
      secondary: '#8b5cf6',
      accent: '#fef3c7',
      text: '#1e293b'
    },
    fonts: {
      title: 22,
      subtitle: 15,
      body: 11,
      small: 9
    }
  }
};

// Generate professional invoice PDF
export async function generateInvoicePDF(invoiceData, template = 'professional') {
  try {
    const user = await getUser();
    const config = INVOICE_TEMPLATES[template];
    
    // Create new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Set up colors
    const primaryColor = hexToRgb(config.colors.primary);
    const secondaryColor = hexToRgb(config.colors.secondary);
    const textColor = hexToRgb(config.colors.text);
    
    let yPosition = 20;
    
    // Header Section
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(0, 0, pageWidth, 40, 'F');
    
    // Company Name/Logo
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.title);
    doc.setFont('helvetica', 'bold');
    doc.text('Chikondi POS', 20, 25);
    
    // Shop Name
    if (user?.shopName) {
      doc.setFontSize(config.fonts.subtitle);
      doc.setFont('helvetica', 'normal');
      doc.text(user.shopName, 20, 35);
    }
    
    // Invoice Title
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    doc.setFontSize(config.fonts.title);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', pageWidth - 60, 25);
    
    yPosition = 60;
    
    // Invoice Details Section
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'normal');
    
    // Left side - Business Info
    const businessInfo = [
      ['Business:', user?.shopName || 'Your Business Name'],
      ['Phone:', invoiceData.businessInfo?.phone || '+265 123 456 789'],
      ['Email:', invoiceData.businessInfo?.email || 'business@example.com'],
      ['Address:', invoiceData.businessInfo?.address || 'Your Business Address']
    ];
    
    businessInfo.forEach(([label, value], index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, 20, yPosition + (index * 8));
      doc.setFont('helvetica', 'normal');
      doc.text(value, 50, yPosition + (index * 8));
    });
    
    // Right side - Invoice Info
    const invoiceInfo = [
      ['Invoice #:', invoiceData.invoiceNumber || generateInvoiceNumber()],
      ['Date:', formatDate(invoiceData.date || new Date())],
      ['Due Date:', formatDate(invoiceData.dueDate || addDays(new Date(), 30))],
      ['Status:', invoiceData.status || 'Paid']
    ];
    
    invoiceInfo.forEach(([label, value], index) => {
      doc.setFont('helvetica', 'bold');
      doc.text(label, pageWidth - 100, yPosition + (index * 8));
      doc.setFont('helvetica', 'normal');
      doc.text(value, pageWidth - 60, yPosition + (index * 8));
    });
    
    yPosition += 50;
    
    // Customer Information
    if (invoiceData.customer) {
      doc.setFillColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.rect(20, yPosition, pageWidth - 40, 25, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(config.fonts.subtitle);
      doc.setFont('helvetica', 'bold');
      doc.text('BILL TO:', 25, yPosition + 8);
      
      doc.setTextColor(textColor.r, textColor.g, textColor.b);
      doc.setFontSize(config.fonts.body);
      doc.setFont('helvetica', 'bold');
      doc.text(invoiceData.customer.name, 25, yPosition + 18);
      
      yPosition += 35;
      
      // Customer details
      const customerDetails = [
        invoiceData.customer.phone && `Phone: ${invoiceData.customer.phone}`,
        invoiceData.customer.email && `Email: ${invoiceData.customer.email}`,
        invoiceData.customer.address && `Address: ${invoiceData.customer.address}`
      ].filter(Boolean);
      
      customerDetails.forEach((detail, index) => {
        doc.setFont('helvetica', 'normal');
        doc.text(detail, 25, yPosition + (index * 6));
      });
      
      yPosition += customerDetails.length * 6 + 10;
    }
    
    // Items Table - Manual Implementation
    const tableStartY = yPosition;
    const tableWidth = pageWidth - 40;
    const colWidths = [100, 30, 50, 50]; // Item, Qty, Unit Price, Total
    const rowHeight = 12;
    
    // Table Header
    doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
    doc.rect(20, tableStartY, tableWidth, rowHeight, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(config.fonts.body);
    doc.setFont('helvetica', 'bold');
    
    const headers = ['Item', 'Qty', 'Unit Price', 'Total'];
    let xPos = 25;
    headers.forEach((header, index) => {
      doc.text(header, xPos, tableStartY + 8);
      xPos += colWidths[index];
    });
    
    yPosition = tableStartY + rowHeight;
    
    // Table Rows
    doc.setTextColor(textColor.r, textColor.g, textColor.b);
    doc.setFont('helvetica', 'normal');
    
    invoiceData.items.forEach((item, rowIndex) => {
      const isEvenRow = rowIndex % 2 === 0;
      
      // Alternate row background
      if (isEvenRow) {
        doc.setFillColor(248, 250, 252);
        doc.rect(20, yPosition, tableWidth, rowHeight, 'F');
      }
      
      // Row data
      const rowData = [
        item.name || item.description || 'Item',
        (item.quantity || 1).toString(),
        formatCurrency(item.price || item.unitPrice || 0, user?.currency),
        formatCurrency((item.quantity || 1) * (item.price || item.unitPrice || 0), user?.currency)
      ];
      
      xPos = 25;
      rowData.forEach((data, colIndex) => {
        const align = colIndex === 0 ? 'left' : colIndex === 1 ? 'center' : 'right';
        const textX = align === 'left' ? xPos : 
                     align === 'center' ? xPos + (colWidths[colIndex] / 2) : 
                     xPos + colWidths[colIndex] - 5;
        
        doc.text(data, textX, yPosition + 8, { align });
        xPos += colWidths[colIndex];
      });
      
      yPosition += rowHeight;
    });
    
    // Table border
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, tableStartY, tableWidth, yPosition - tableStartY);
    
    yPosition += 10;
    
    // Totals Section
    const totals = [
      ['Subtotal:', formatCurrency(invoiceData.subtotal, user?.currency)],
      ...(invoiceData.tax ? [['Tax:', formatCurrency(invoiceData.tax, user?.currency)]] : []),
      ...(invoiceData.discount ? [['Discount:', `-${formatCurrency(invoiceData.discount, user?.currency)}`]] : []),
      ['Total:', formatCurrency(invoiceData.total, user?.currency)]
    ];
    
    totals.forEach(([label, value], index) => {
      const isTotal = label === 'Total:';
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      doc.setFontSize(isTotal ? config.fonts.subtitle : config.fonts.body);
      
      if (isTotal) {
        doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
        doc.rect(pageWidth - 100, yPosition + (index * 10) - 3, 80, 12, 'F');
        doc.setTextColor(255, 255, 255);
      } else {
        doc.setTextColor(textColor.r, textColor.g, textColor.b);
      }
      
      doc.text(label, pageWidth - 95, yPosition + (index * 10) + 5);
      doc.text(value, pageWidth - 25, yPosition + (index * 10) + 5, { align: 'right' });
    });
    
    yPosition += totals.length * 10 + 20;
    
    // Payment Information
    if (invoiceData.paymentMethod) {
      doc.setTextColor(textColor.r, textColor.g, textColor.b);
      doc.setFontSize(config.fonts.body);
      doc.setFont('helvetica', 'bold');
      doc.text('Payment Method:', 20, yPosition);
      doc.setFont('helvetica', 'normal');
      doc.text(invoiceData.paymentMethod, 70, yPosition);
      yPosition += 10;
    }
    
    // Notes Section
    if (invoiceData.notes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Notes:', 20, yPosition);
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(invoiceData.notes, pageWidth - 40);
      doc.text(splitNotes, 20, yPosition);
      yPosition += splitNotes.length * 6 + 10;
    }
    
    // Footer
    if (yPosition < pageHeight - 40) {
      doc.setFillColor(245, 245, 245);
      doc.rect(0, pageHeight - 30, pageWidth, 30, 'F');
      
      doc.setTextColor(secondaryColor.r, secondaryColor.g, secondaryColor.b);
      doc.setFontSize(config.fonts.small);
      doc.setFont('helvetica', 'normal');
      doc.text('Thank you for your business!', pageWidth / 2, pageHeight - 20, { align: 'center' });
      doc.text(`Generated by Chikondi POS on ${formatDate(new Date())}`, pageWidth / 2, pageHeight - 12, { align: 'center' });
    }
    
    return doc;
  } catch (error) {
    console.error('Error generating invoice PDF:', error);
    throw new Error('Failed to generate invoice PDF');
  }
}

// Generate invoice from sales data
export function createInvoiceFromSale(saleData, customer = null, businessInfo = {}) {
  return {
    invoiceNumber: generateInvoiceNumber(),
    date: new Date(saleData.timestamp || Date.now()),
    dueDate: addDays(new Date(), 0), // Immediate payment for POS sales
    status: 'Paid',
    
    // Business information
    businessInfo: {
      phone: businessInfo.phone || '+265 123 456 789',
      email: businessInfo.email || 'business@example.com',
      address: businessInfo.address || 'Your Business Address',
      ...businessInfo
    },
    
    // Customer information
    customer: customer ? {
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address
    } : null,
    
    // Items
    items: saleData.items || [],
    
    // Totals
    subtotal: saleData.subtotal || saleData.total || 0,
    tax: saleData.tax || 0,
    discount: saleData.discount || 0,
    total: saleData.total || 0,
    
    // Payment
    paymentMethod: saleData.paymentMethod || 'Cash',
    
    // Additional info
    notes: saleData.notes || 'Thank you for your purchase!',
    cashier: saleData.cashier || 'POS System'
  };
}

// Download PDF invoice with fallback
export async function downloadInvoice(invoiceData, template = 'professional', filename = null) {
  try {
    const doc = await generateInvoicePDF(invoiceData, template);
    const invoiceFilename = filename || `invoice-${invoiceData.invoiceNumber || 'draft'}.pdf`;
    doc.save(invoiceFilename);
    return true;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    
    // Fallback to HTML invoice
    try {
      const { printHTMLInvoice } = await import('./simpleInvoice');
      const customer = invoiceData.customer;
      return printHTMLInvoice(invoiceData, customer);
    } catch (fallbackError) {
      console.error('Fallback invoice also failed:', fallbackError);
      return false;
    }
  }
}

// Share invoice via Web Share API
export async function shareInvoice(invoiceData, template = 'professional') {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }
    
    const doc = await generateInvoicePDF(invoiceData, template);
    const pdfBlob = doc.output('blob');
    
    const file = new File([pdfBlob], `invoice-${invoiceData.invoiceNumber}.pdf`, {
      type: 'application/pdf'
    });
    
    await navigator.share({
      title: `Invoice ${invoiceData.invoiceNumber}`,
      text: `Invoice for ${invoiceData.customer?.name || 'Customer'}`,
      files: [file]
    });
    
    return true;
  } catch (error) {
    console.error('Error sharing invoice:', error);
    return false;
  }
}

// Print invoice
export async function printInvoice(invoiceData, template = 'professional') {
  try {
    const doc = await generateInvoicePDF(invoiceData, template);
    const pdfUrl = doc.output('bloburl');
    
    // Open in new window for printing
    const printWindow = window.open(pdfUrl, '_blank');
    if (printWindow) {
      printWindow.onload = () => {
        printWindow.print();
      };
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error printing invoice:', error);
    return false;
  }
}

// Email invoice (placeholder for future implementation)
export async function emailInvoice(invoiceData, recipientEmail, template = 'professional') {
  try {
    // This would integrate with email service in the future
    const doc = await generateInvoicePDF(invoiceData, template);
    const pdfBlob = doc.output('blob');
    
    // For now, just download and show instructions
    await downloadInvoice(invoiceData, template);
    alert(`Invoice generated! Please manually send the downloaded PDF to ${recipientEmail}`);
    
    return true;
  } catch (error) {
    console.error('Error emailing invoice:', error);
    return false;
  }
}

// Utility functions
function generateInvoiceNumber() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `CHK-${year}${month}${day}-${random}`;
}

function formatDate(date) {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatCurrency(amount, currency = 'MWK') {
  const currencySymbols = {
    'MWK': 'MK',
    'USD': '$',
    'KES': 'KSh',
    'TZS': 'TSh',
    'UGX': 'USh',
    'NGN': '₦',
    'GHS': '₵',
    'ZAR': 'R'
  };
  
  const symbol = currencySymbols[currency] || currency;
  return `${symbol} ${Number(amount || 0).toLocaleString()}`;
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : { r: 0, g: 0, b: 0 };
}

export { INVOICE_TEMPLATES };

export default {
  generateInvoicePDF,
  createInvoiceFromSale,
  downloadInvoice,
  shareInvoice,
  printInvoice,
  emailInvoice,
  INVOICE_TEMPLATES
};