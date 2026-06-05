import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toWords } from 'number-to-words';

export const generateInvoice = (orderItem, isSeller = false) => {
  const doc = new jsPDF();
  const order = orderItem.Order || orderItem.order;
  if (!order) {
    console.error('Order details missing');
    return;
  }

  const { order_number, created_at, address, user } = order;
  const product = orderItem.product || {};

  const orderDate = new Date(created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const invoiceNumber = `INV-${order_number}`;

  const seller = orderItem.seller || {};
  const sellerName = seller.businessName || seller.name || 'SHOPIDOO RETAIL PRIVATE LIMITED';
  const sellerAddress = seller.addressLine1 
    ? `${seller.addressLine1}${seller.addressLine2 ? '\n' + seller.addressLine2 : ''}\n${seller.city || ''}, ${seller.state || ''} - ${seller.pincode || ''}\nIN`
    : 'No. 1/8, Tech Park, Guindy.\nChennai, Tamil Nadu, 600032\nIN';

  const customerName = address?.name || user?.name || 'Customer';
  const customerAddress = typeof address === 'string' 
    ? address 
    : address 
      ? `${address.address_line1 || ''}\n${address.address_line2 ? address.address_line2 + '\n' : ''}${address.city || ''}, ${address.state || ''} - ${address.pincode || ''}\n${address.country || 'IN'}\nState/UT Code: 33` 
      : 'N/A';

  const totalAmount = parseFloat(orderItem.total_price || 0);
  const qty = parseInt(orderItem.quantity || 1);
  const taxRate = 18; 
  const netAmountVal = (totalAmount * 100) / (100 + taxRate);
  const taxAmountVal = totalAmount - netAmountVal;
  const halfTax = taxAmountVal / 2;
  const unitPriceVal = qty > 0 ? netAmountVal / qty : netAmountVal;

  // Draw Header
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Shopidoo', 10, 20);

  doc.setFontSize(9);
  doc.text('Tax Invoice / Bill of Supply / Cash Memo', 200, 18, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100);
  doc.text('(Original for Recipient)', 200, 22, { align: 'right' });

  // Outer Box
  doc.setDrawColor(150);
  doc.setLineWidth(0.2);
  doc.rect(10, 28, 190, 92); 

  // Middle vertical line
  doc.line(105, 28, 105, 120); 

  // Horizontal line 1 (y=60)
  doc.line(10, 60, 200, 60);

  // Horizontal line 2 (y=105)
  doc.line(10, 105, 200, 105);

  // Fill text for Sold By
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Sold By :', 12, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(sellerName, 12, 38);
  doc.text(doc.splitTextToSize(sellerAddress, 85), 12, 42);

  // Fill text for Billing Address
  doc.setFont('helvetica', 'bold');
  doc.text('Billing Address :', 107, 33);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 107, 38);
  doc.text(doc.splitTextToSize(customerAddress, 85), 107, 42);

  // Fill text for PAN & QR
  doc.setFont('helvetica', 'bold');
  doc.text(`PAN No: ${seller.panNumber || 'AABCS1234E'}`, 12, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(`GST Registration No: ${seller.gstNumber || '33AABCS1234E1ZK'}`, 12, 69);
  doc.setFont('helvetica', 'bold');
  doc.text('Dynamic QR Code:', 12, 74);
  doc.rect(12, 78, 20, 20); // QR code box
  doc.setFontSize(6);
  doc.setTextColor(150);
  doc.text('QR', 22, 89, { align: 'center' });
  
  // Fill text for Shipping Address
  doc.setFontSize(8);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'bold');
  doc.text('Shipping Address :', 107, 65);
  doc.setFont('helvetica', 'normal');
  doc.text(customerName, 107, 70);
  doc.text(doc.splitTextToSize(customerAddress, 85), 107, 74);

  // Fill text for Order & Invoice Data
  doc.text(`Order Number: ${order_number}`, 12, 110);
  doc.text(`Order Date: ${orderDate}`, 12, 115);
  
  doc.text('Place of supply: TAMIL NADU', 107, 110);
  doc.text(`Invoice Number: ${invoiceNumber}`, 107, 114);
  doc.text(`Invoice Date: ${orderDate}`, 107, 118);

  // Table
  const tableData = [
    [
      '1',
      `${product?.name || 'Product'}\nHSN: ${product?.hsn_code || '85183020'}`,
      `${unitPriceVal.toFixed(2)}`,
      `0.00`,
      qty.toString(),
      `${netAmountVal.toFixed(2)}`,
      '9%\n9%',
      'CGST\nSGST',
      `${halfTax.toFixed(2)}\n${halfTax.toFixed(2)}`,
      `${totalAmount.toFixed(2)}`
    ],
    [
      '',
      'Shipping Charges',
      `0.00`,
      `0.00`,
      '',
      `0.00`,
      '0%',
      'CGST',
      `0.00`,
      `0.00`
    ]
  ];

  autoTable(doc, {
    startY: 120,
    margin: { left: 10, right: 10 },
    theme: 'grid',
    head: [['Sl.\nNo', 'Description', 'Unit\nPrice', 'Discount', 'Qty', 'Net\nAmount', 'Tax\nRate', 'Tax\nType', 'Tax\nAmount', 'Total\nAmount']],
    body: tableData,
    styles: { lineColor: [150, 150, 150], lineWidth: 0.2, fontSize: 7, textColor: 0 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center', valign: 'middle' },
    bodyStyles: { valign: 'middle' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8 },
      1: { halign: 'left' },
      2: { halign: 'right', cellWidth: 16 },
      3: { halign: 'right', cellWidth: 16 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'right', cellWidth: 16 },
      6: { halign: 'center', cellWidth: 10 },
      7: { halign: 'center', cellWidth: 12 },
      8: { halign: 'right', cellWidth: 16 },
      9: { halign: 'right', cellWidth: 18 },
    },
    foot: [['', '', '', '', 'TOTAL:', `${netAmountVal.toFixed(2)}`, '', '', `${taxAmountVal.toFixed(2)}`, `${totalAmount.toFixed(2)}`]],
    footStyles: { fillColor: [255, 255, 255], textColor: [0, 0, 0], fontStyle: 'bold', halign: 'right' },
    willDrawCell: (data) => {
      // Custom alignment for specific columns in the foot
      if (data.section === 'foot' && data.column.index === 4) {
        data.cell.styles.halign = 'left';
      }
    }
  });

  const finalY = doc.lastAutoTable.finalY;
  
  // Footer Box
  const boxHeight = 55;
  doc.setDrawColor(150);
  doc.rect(10, finalY, 190, boxHeight);
  
  // Amount in Words
  const amountInWords = toWords(Math.round(totalAmount));
  const amountInWordsCapitalized = amountInWords.replace(/\b\w/g, l => l.toUpperCase()) + ' Rupees only';
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Amount in Words:', 12, finalY + 5);
  doc.setFont('helvetica', 'normal');
  doc.text(amountInWordsCapitalized, 12, finalY + 10);
  
  // Horizontal line separating amount in words and signature
  doc.line(10, finalY + 15, 200, finalY + 15);
  
  // Signature Area
  doc.setFont('helvetica', 'bold');
  doc.text(`For ${sellerName}:`, 198, finalY + 20, { align: 'right' });
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Authorized Signatory', 198, finalY + 40, { align: 'right' });
  
  // Horizontal line separating signature and footer
  doc.line(10, finalY + 45, 200, finalY + 45);
  
  // Footer text inside the box
  doc.setFontSize(6);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0);
  doc.text('Whether tax is payable under reverse charge - No', 12, finalY + 50);
  
  // Out of box text
  doc.setTextColor(150);
  doc.text('This is a computer-generated invoice and does not require a physical signature. For support: support@shopidoo.com', 105, finalY + 60, { align: 'center' });
  
  doc.text('Page 1 of 1', 200, finalY + 60, { align: 'right' });

  doc.save(`${invoiceNumber}.pdf`);
};
