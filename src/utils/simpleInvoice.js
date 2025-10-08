// Simple Invoice Generator - Fallback for PDF issues
import { getUser } from './dbUnified';

// Generate simple HTML invoice for printing
export function generateHTMLInvoice(invoiceData, customer = null) {
  const user = JSON.parse(localStorage.getItem('chikondi-user') || '{}');
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceData.invoiceNumber || 'Draft'}</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          margin: 0; 
          padding: 20px; 
          color: #333;
        }
        .header { 
          background: #10b981; 
          color: white; 
          padding: 20px; 
          margin: -20px -20px 20px -20px;
        }
        .company-name { 
          font-size: 24px; 
          font-weight: bold; 
          margin-bottom: 5px;
        }
        .shop-name { 
          font-size: 16px; 
          opacity: 0.9;
        }
        .invoice-title { 
          float: right; 
          font-size: 28px; 
          font-weight: bold;
        }
        .clear { clear: both; }
        .info-section { 
          display: flex; 
          justify-content: space-between; 
          margin: 20px 0;
        }
        .info-box { 
          flex: 1; 
          margin-right: 20px;
        }
        .info-box:last-child { margin-right: 0; }
        .info-box h3 { 
          margin: 0 0 10px 0; 
          color: #10b981; 
          border-bottom: 2px solid #10b981; 
          padding-bottom: 5px;
        }
        .customer-section { 
          background: #f8f9fa; 
          padding: 15px; 
          margin: 20px 0; 
          border-left: 4px solid #10b981;
        }
        table { 
          width: 100%; 
          border-collapse: collapse; 
          margin: 20px 0;
        }
        th, td { 
          padding: 12px; 
          text-align: left; 
          border-bottom: 1px solid #ddd;
        }
        th { 
          background: #10b981; 
          color: white; 
          font-weight: bold;
        }
        tr:nth-child(even) { background: #f8f9fa; }
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .totals { 
          float: right; 
          width: 300px; 
          margin-top: 20px;
        }
        .totals table { margin: 0; }
        .total-row { 
          background: #10b981 !important; 
          color: white; 
          font-weight: bold;
        }
        .footer { 
          margin-top: 50px; 
          text-align: center; 
          color: #666; 
          border-top: 1px solid #ddd; 
          padding-top: 20px;
        }
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">Chikondi POS</div>
        <div class="shop-name">${user.shopName || 'Your Business'}</div>
        <div class="invoice-title">INVOICE</div>
        <div class="clear"></div>
      </div>

      <div class="info-section">
        <div class="info-box">
          <h3>Business Information</h3>
          <strong>${user.shopName || 'Your Business Name'}</strong><br>
          Phone: ${invoiceData.businessInfo?.phone || '+265 123 456 789'}<br>
          Email: ${invoiceData.businessInfo?.email || 'business@example.com'}<br>
          Address: ${invoiceData.businessInfo?.address || 'Your Business Address'}
        </div>
        
        <div class="info-box">
          <h3>Invoice Details</h3>
          <strong>Invoice #:</strong> ${invoiceData.invoiceNumber || generateInvoiceNumber()}<br>
          <strong>Date:</strong> ${formatDate(invoiceData.date || new Date())}<br>
          <strong>Due Date:</strong> ${formatDate(invoiceData.dueDate || new Date())}<br>
          <strong>Status:</strong> ${invoiceData.status || 'Paid'}
        </div>
      </div>

      ${customer ? `
        <div class="customer-section">
          <h3>Bill To:</h3>
          <strong>${customer.name}</strong><br>
          ${customer.phone ? `Phone: ${customer.phone}<br>` : ''}
          ${customer.email ? `Email: ${customer.email}<br>` : ''}
          ${customer.address ? `Address: ${customer.address}` : ''}
        </div>
      ` : ''}

      <table>
        <thead>
          <tr>
            <th>Item</th>
            <th class="text-center">Qty</th>
            <th class="text-right">Unit Price</th>
            <th class="text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoiceData.items.map(item => `
            <tr>
              <td>${item.name || item.description}</td>
              <td class="text-center">${item.quantity || 1}</td>
              <td class="text-right">${formatCurrency(item.price || item.unitPrice, user.currency)}</td>
              <td class="text-right">${formatCurrency((item.quantity || 1) * (item.price || item.unitPrice), user.currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <table>
          ${invoiceData.subtotal ? `
            <tr>
              <td><strong>Subtotal:</strong></td>
              <td class="text-right">${formatCurrency(invoiceData.subtotal, user.currency)}</td>
            </tr>
          ` : ''}
          ${invoiceData.tax ? `
            <tr>
              <td><strong>Tax:</strong></td>
              <td class="text-right">${formatCurrency(invoiceData.tax, user.currency)}</td>
            </tr>
          ` : ''}
          ${invoiceData.discount ? `
            <tr>
              <td><strong>Discount:</strong></td>
              <td class="text-right">-${formatCurrency(invoiceData.discount, user.currency)}</td>
            </tr>
          ` : ''}
          <tr class="total-row">
            <td><strong>Total:</strong></td>
            <td class="text-right"><strong>${formatCurrency(invoiceData.total, user.currency)}</strong></td>
          </tr>
        </table>
      </div>

      <div class="clear"></div>

      ${invoiceData.paymentMethod ? `
        <div style="margin-top: 30px;">
          <strong>Payment Method:</strong> ${invoiceData.paymentMethod}
        </div>
      ` : ''}

      ${invoiceData.notes ? `
        <div style="margin-top: 20px;">
          <strong>Notes:</strong><br>
          ${invoiceData.notes}
        </div>
      ` : ''}

      <div class="footer">
        <p>Thank you for your business!</p>
        <p><small>Generated by Chikondi POS on ${formatDate(new Date())}</small></p>
      </div>

      <div class="no-print" style="margin-top: 30px; text-align: center;">
        <button onclick="window.print()" style="background: #10b981; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin-right: 10px;">Print Invoice</button>
        <button onclick="window.close()" style="background: #6b7280; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
      </div>
    </body>
    </html>
  `;

  return html;
}

// Open HTML invoice in new window for printing
export function printHTMLInvoice(invoiceData, customer = null) {
  try {
    const html = generateHTMLInvoice(invoiceData, customer);
    const printWindow = window.open('', '_blank');
    
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      
      // Auto-focus for printing
      printWindow.onload = () => {
        printWindow.focus();
      };
      
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error generating HTML invoice:', error);
    return false;
  }
}

// Share invoice as text (fallback)
export async function shareInvoiceText(invoiceData, customer = null) {
  try {
    if (!navigator.share) {
      throw new Error('Web Share API not supported');
    }

    const user = JSON.parse(localStorage.getItem('chikondi-user') || '{}');
    
    const invoiceText = `
📄 INVOICE ${invoiceData.invoiceNumber || 'Draft'}

🏪 ${user.shopName || 'Your Business'}
📞 ${invoiceData.businessInfo?.phone || '+265 123 456 789'}
📧 ${invoiceData.businessInfo?.email || 'business@example.com'}

${customer ? `
👤 CUSTOMER: ${customer.name}
📞 ${customer.phone || 'N/A'}
` : ''}

📅 Date: ${formatDate(invoiceData.date || new Date())}
💳 Payment: ${invoiceData.paymentMethod || 'Cash'}

📦 ITEMS:
${invoiceData.items.map(item => 
  `• ${item.name} x${item.quantity || 1} = ${formatCurrency((item.quantity || 1) * (item.price || item.unitPrice), user.currency)}`
).join('\n')}

💰 TOTAL: ${formatCurrency(invoiceData.total, user.currency)}

${invoiceData.notes ? `\n📝 ${invoiceData.notes}` : ''}

Generated by Chikondi POS
    `.trim();

    await navigator.share({
      title: `Invoice ${invoiceData.invoiceNumber}`,
      text: invoiceText
    });

    return true;
  } catch (error) {
    console.error('Error sharing invoice text:', error);
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

export default {
  generateHTMLInvoice,
  printHTMLInvoice,
  shareInvoiceText
};