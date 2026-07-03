import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SHOPIDOO_LOGO from '../assets/shopidoo_logo.png';
// ─── Shopidoo constants ───────────────────────────────────────────────────────
const SHOPIDOO = {
  name: 'Shopidoo',
  city: 'Nagercoil',
  gst:  '33AABCS1234E1ZK',
  pan:  'AABCS1234E',
};

// ─── Layout / colour tokens ──────────────────────────────────────────────────
const BLACK   = [30,  30,  30];
const GREY_BG = [248, 248, 248];
const GREY_TX = [90,  90,  90];
const WHITE   = [255, 255, 255];
const DARK    = [20,  20,  20];
const PAGE_W  = 210;
const MARGIN  = 12;
const FULL_W  = PAGE_W - MARGIN * 2;
const COL_W   = FULL_W / 2 - 1;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sf(doc, style = 'normal', size = 9) {
  doc.setFont('helvetica', style);
  doc.setFontSize(size);
}

function box(doc, x, y, w, h) {
  doc.setDrawColor(180, 180, 180);
  doc.setFillColor(...GREY_BG);
  doc.rect(x, y, w, h, 'FD');
}

function hline(doc, x1, y1, x2) {
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.3);
  doc.line(x1, y1, x2, y1);
}

function txt(doc, text, x, y, { color = BLACK, align = 'left', size = 8 } = {}) {
  doc.setTextColor(...color);
  doc.setFontSize(size);
  doc.text(String(text ?? ''), x, y, { align });
}

function wrap(doc, text, maxWidth) {
  return doc.splitTextToSize(String(text ?? ''), maxWidth);
}

function fmtDate(val) {
  if (!val) return '-';
  const d = new Date(val);
  return isNaN(d) ? String(val) : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function fmtRs(n) {
  return 'Rs.' + (parseFloat(n) || 0).toFixed(2);
}

function addrString(addr) {
  if (!addr) return '';
  if (typeof addr === 'string') return addr;
  return [
    addr.full_name || addr.name || '',
    addr.phone     || '',
    addr.address_line1 || addr.address || '',
    addr.address_line2 || '',
    [addr.city, addr.state].filter(Boolean).join(', '),
    addr.pincode ? '- ' + addr.pincode : '',
  ].map(s => s.trim()).filter(Boolean).join(', ');
}

function fmtPayment(method) {
  if (!method) return '-';
  const m = method.toLowerCase();
  if (m.includes('cod') || m.includes('cash'))                             return 'Cash on Delivery (COD)';
  if (m.includes('upi'))                                                   return 'UPI';
  if (m.includes('card') || m.includes('credit') || m.includes('debit'))  return 'Card';
  if (m.includes('net')  || m.includes('neft'))                           return 'Net Banking';
  if (m.includes('wallet'))                                                return 'Wallet';
  return method.toUpperCase();
}

function toWords(amount) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine',
    'Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  const two   = n => n < 20 ? ones[n] : tens[Math.floor(n/10)] + (n%10 ? ' '+ones[n%10] : '');
  const three = n => n >= 100 ? ones[Math.floor(n/100)]+' Hundred'+(n%100 ? ' '+two(n%100) : '') : two(n);
  const r = Math.floor(amount);
  const p = Math.round((amount - r) * 100);
  if (!r && !p) return 'Zero Rupees only';
  let w = '';
  if (r >= 10000000)        w += three(Math.floor(r/10000000))          + ' Crore ';
  if (r%10000000 >= 100000) w += three(Math.floor((r%10000000)/100000)) + ' Lakh ';
  if (r%100000   >= 1000)   w += three(Math.floor((r%100000)/1000))     + ' Thousand ';
  if (r%1000     >= 100)    w += ones[Math.floor((r%1000)/100)]          + ' Hundred ';
  if (r%100)                w += two(r%100) + ' ';
  w = w.trim() + ' Rupees';
  if (p) w += ' and ' + two(p) + ' Paise';
  return w + ' only';
}

// ─── Data resolvers ───────────────────────────────────────────────────────────

function getSellerProfile(data, isSeller) {
  let s = {};
  if (isSeller) {
    // Sequelize may wrap in dataValues — check both
    const prod = data?.product?.dataValues || data?.product || {};
    s = prod.seller?.dataValues || prod.seller || data?.seller?.dataValues || data?.seller || {};
  } else {
    const first = data?.rawItems?.[0] || {};
    const prod = first.product?.dataValues || first.product || {};
    s = prod.seller?.dataValues || prod.seller || first.seller?.dataValues || first.seller || {};
  }

  const structuredAddr = [
    s.addressLine1 || s.address_line1 || '',
    s.addressLine2 || s.address_line2 || '',
    s.city   || '',
    s.state  || '',
    s.pincode || s.pin_code || '',
  ].filter(Boolean).join(', ');

  return {
    name:         s.storeName || s.businessName || s.business_name || s.name || (isSeller ? '' : data?.seller) || 'Seller',
    address:      addrString(s.address || s.gst_address) || structuredAddr,
    pan:          s.panNumber  || s.pan_number  || s.pan || '',
    gst:          s.gstNumber  || s.gst_number  || s.gst || '',
    signatureUrl: s.signatureImage || s.signature_url || s.signatureUrl || null,
  };
}

function getOrderData(data, isSeller) {
  if (isSeller) {
    const order = data?.Order || data?.order || {};
    return {
      orderNumber:   order.order_number || `ORD${String(data.id||'').padStart(5,'0')}`,
      orderDate:     data.created_at    || order.created_at,
      invoiceDate:   data.created_at    || order.created_at,
      customer:      order.user?.name   || 'Customer',
      address:       addrString(order.address || data.address),
      paymentMethod: order.payment?.payment_method || order.payment_method || '',
      paymentStatus: order.payment?.status         || order.payment_status || 'pending',
    };
  }
  return {
    orderNumber:   data.orderNumber  || data.order_number || '',
    orderDate:     data.createdAt    || data.created_at,
    invoiceDate:   data.createdAt    || data.created_at,
    customer:      data.customer     || '',
    address:       addrString(data.address),
    paymentMethod: data.paymentMethod || '',
    paymentStatus: data.payment       || 'pending',
  };
}

function getLineItems(data, isSeller) {
  const calc = (totalPrice, taxRate) => {
    const tax = parseFloat((totalPrice - totalPrice / (1 + taxRate / 100)).toFixed(2));
    const net = parseFloat((totalPrice - tax).toFixed(2));
    return { net, tax };
  };

  if (isSeller) {
    const total   = parseFloat(data.display_amount ?? data.dataValues?.display_amount ?? data.total_price ?? 0);
    const qty     = data.quantity || 1;
    // Sequelize wraps in dataValues — check both levels
    const prod    = data.product?.dataValues || data.product || {};
    const taxRate = parseFloat(prod.gst_rate ?? prod.tax_rate ?? 18);
    const { net, tax } = calc(total, taxRate);
    const hsn = prod.hsn_code || prod.hsn || '';
    return [{
      name:      prod.name || data.product?.name || 'Product',
      hsn:       String(hsn).trim(),
      unitPrice: parseFloat((total / qty).toFixed(2)),
      discount:  0,
      qty,
      net,
      taxRate,
      taxAmount: tax,
      total,
    }];
  }

  return (data.rawItems || []).map(item => {
    const total   = parseFloat(item.display_amount ?? item.dataValues?.display_amount ?? item.total_price ?? 0);
    const qty     = item.quantity || 1;
    const prod    = item.product?.dataValues || item.product || {};
    const taxRate = parseFloat(prod.gst_rate ?? prod.tax_rate ?? 18);
    const { net, tax } = calc(total, taxRate);
    const hsn = prod.hsn_code || prod.hsn || '';
    return {
      name:      prod.name || item.product?.name || 'Product',
      hsn:       String(hsn).trim(),
      unitPrice: parseFloat((total / qty).toFixed(2)),
      discount:  0,
      qty,
      net,
      taxRate,
      taxAmount: tax,
      total,
    };
  });
}

// ─── PDF sections ─────────────────────────────────────────────────────────────

function drawHeader(doc) {
  // Logo only — no text heading
 try {
  doc.addImage(SHOPIDOO_LOGO, 'PNG', MARGIN, 3, 35, 14);
} catch (_) {}

  // Title right side
  sf(doc, 'bold', 9);
  doc.setTextColor(...DARK);
  doc.text('Tax Invoice / Bill of Supply / Cash Memo', PAGE_W - MARGIN, 8, { align: 'right' });
  sf(doc, 'normal', 7.5);
  doc.setTextColor(...GREY_TX);
  doc.text('(Original for Recipient)', PAGE_W - MARGIN, 13, { align: 'right' });

  // Divider line below header
  doc.setDrawColor(180, 180, 180);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, 19, PAGE_W - MARGIN, 19);

  return 23;
}

function drawBoxes(doc, startY, seller, od) {
  const lX  = MARGIN;
  const rX  = MARGIN + COL_W + 2;
  const bH  = 36;
  const gap = 3;

  // ── ROW 1: BOX 1 Sold By | BOX 2 Billing Address ──────────────────────────
  box(doc, lX, startY, COL_W, bH);
  txt(doc, 'Sold By', lX + 3, startY + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 8.5);
  txt(doc, seller.name, lX + 3, startY + 11, { color: DARK, size: 8.5 });
  sf(doc, 'normal', 7);
  const selLines = wrap(doc, seller.address, COL_W - 8);
  let sy = startY + 17;
  selLines.slice(0, 2).forEach(l => { txt(doc, l, lX + 3, sy, { color: GREY_TX, size: 7 }); sy += 4; });
  if (sy < startY + 25) sy = startY + 25;
  if (seller.pan) { txt(doc, `PAN : ${seller.pan}`, lX + 3, sy, { color: GREY_TX, size: 7 }); sy += 4; }
  if (seller.gst) { txt(doc, `GST : ${seller.gst}`, lX + 3, sy, { color: GREY_TX, size: 7 }); }

  box(doc, rX, startY, COL_W, bH);
  txt(doc, 'Billing Address', rX + 3, startY + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 8.5);
  txt(doc, od.customer, rX + 3, startY + 11, { color: DARK, size: 8.5 });
  sf(doc, 'normal', 7);
  const billLines = wrap(doc, od.address, COL_W - 8);
  let by = startY + 17;
  billLines.slice(0, 4).forEach(l => { txt(doc, l, rX + 3, by, { color: GREY_TX, size: 7 }); by += 4; });

  // ── ROW 2: BOX 3 Shopidoo | BOX 4 Shipping Address ────────────────────────
  const row2Y = startY + bH + gap;

  box(doc, lX, row2Y, COL_W, bH);
  txt(doc, 'Platform', lX + 3, row2Y + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 9);
  txt(doc, SHOPIDOO.name, lX + 3, row2Y + 11, { color: DARK, size: 9 });
  sf(doc, 'normal', 7);
  txt(doc, SHOPIDOO.city, lX + 3, row2Y + 17, { color: GREY_TX, size: 7 });
  txt(doc, `PAN : ${SHOPIDOO.pan}`, lX + 3, row2Y + 22, { color: GREY_TX, size: 7 });
  txt(doc, `GST : ${SHOPIDOO.gst}`, lX + 3, row2Y + 27, { color: GREY_TX, size: 7 });

  box(doc, rX, row2Y, COL_W, bH);
  txt(doc, 'Shipping Address', rX + 3, row2Y + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 8.5);
  txt(doc, od.customer, rX + 3, row2Y + 11, { color: DARK, size: 8.5 });
  sf(doc, 'normal', 7);
  const shipLines = wrap(doc, od.address, COL_W - 8);
  let hy = row2Y + 17;
  shipLines.slice(0, 4).forEach(l => { txt(doc, l, rX + 3, hy, { color: GREY_TX, size: 7 }); hy += 4; });

  // ── ROW 3: BOX 5 Order Details | BOX 6 Invoice + Payment ──────────────────
  const row3Y = row2Y + bH + gap;
  const smH   = 26;

  box(doc, lX, row3Y, COL_W, smH);
  txt(doc, 'Order Details', lX + 3, row3Y + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 7.5);
  txt(doc, 'Order Number :', lX + 3, row3Y + 12, { color: GREY_TX, size: 7.5 });
  sf(doc, 'normal', 8);
  txt(doc, od.orderNumber, lX + 3, row3Y + 18, { color: DARK, size: 8 });
  sf(doc, 'bold', 7.5);
  txt(doc, 'Order Date :', lX + COL_W / 2, row3Y + 12, { color: GREY_TX, size: 7.5 });
  sf(doc, 'normal', 8);
  txt(doc, fmtDate(od.orderDate), lX + COL_W / 2, row3Y + 18, { color: DARK, size: 8 });

  box(doc, rX, row3Y, COL_W, smH);
  txt(doc, 'Invoice Details', rX + 3, row3Y + 5, { color: GREY_TX, size: 7 });
  sf(doc, 'bold', 7.5);
  txt(doc, 'Invoice Number :', rX + 3, row3Y + 12, { color: GREY_TX, size: 7.5 });
  sf(doc, 'normal', 8);
  txt(doc, `INV-${od.orderNumber}`, rX + 3, row3Y + 18, { color: DARK, size: 8 });
  sf(doc, 'bold', 7.5);
  txt(doc, 'Invoice Date :', rX + COL_W / 2 - 4, row3Y + 12, { color: GREY_TX, size: 7.5 });
  sf(doc, 'normal', 8);
  txt(doc, fmtDate(od.invoiceDate), rX + COL_W / 2 - 4, row3Y + 18, { color: DARK, size: 8 });

  hline(doc, rX + 2, row3Y + 21, rX + COL_W - 2);
  sf(doc, 'bold', 7.5);
  txt(doc, `Payment Mode : ${fmtPayment(od.paymentMethod)}`, rX + 3, row3Y + 25, { color: DARK, size: 7.5 });

  return row3Y + smH + gap;
}

function drawItemsTable(doc, y, items) {
  const rows = items.map((item, i) => [
    i + 1,
    // HSN shown on second line under product name
    item.name + (item.hsn ? `\nHSN Code: ${item.hsn}` : ''),
    fmtRs(item.unitPrice),
    fmtRs(item.discount),
    item.qty,
    fmtRs(item.net),
    `${item.taxRate}%`,
    'GST',
    fmtRs(item.taxAmount),
    fmtRs(item.total),
  ]);

  const totalTax   = items.reduce((s, i) => s + i.taxAmount, 0);
  const grandTotal = items.reduce((s, i) => s + i.total,     0);

  autoTable(doc, {
    startY: y,
    head: [['Sl.\nNo', 'Description', 'Unit\nPrice', 'Discount', 'Qty',
            'Net\nAmount', 'Tax\nRate', 'Tax\nType', 'Tax\nAmount', 'Total\nAmount']],
    body: rows,
    foot: [['', '', '', '', '', '', '', 'TOTAL:', fmtRs(totalTax), fmtRs(grandTotal)]],
    theme: 'grid',
    styles: {
      fontSize: 7.5,
      cellPadding: 2.5,
      textColor: DARK,
      lineColor: [180, 180, 180],
      lineWidth: 0.3,
      overflow: 'linebreak',
      font: 'helvetica',
    },
    headStyles: {
      fillColor: WHITE,
      textColor: DARK,
      fontStyle: 'bold',
      fontSize: 7,
      halign: 'center',
      lineColor: [150, 150, 150],
      lineWidth: 0.4,
    },
    footStyles: {
      fillColor: [235, 235, 235],
      textColor: DARK,
      fontStyle: 'bold',
      fontSize: 7.5,
    },
    alternateRowStyles: {
      fillColor: [252, 252, 252],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 8  },
      1: { cellWidth: 44 },
      2: { halign: 'right',  cellWidth: 19 },
      3: { halign: 'right',  cellWidth: 16 },
      4: { halign: 'center', cellWidth: 10 },
      5: { halign: 'right',  cellWidth: 20 },
      6: { halign: 'center', cellWidth: 12 },
      7: { halign: 'center', cellWidth: 11 },
      8: { halign: 'right',  cellWidth: 18 },
      9: { halign: 'right',  cellWidth: 28 },
    },
    margin: { left: MARGIN, right: MARGIN },
  });

  return doc.lastAutoTable.finalY + 4;
}

async function drawFooter(doc, y, items, seller) {
  const grandTotal = items.reduce((s, i) => s + i.total, 0);

  // Amount in words
  const wH = 13;
  box(doc, MARGIN, y, FULL_W, wH);
  sf(doc, 'bold', 7.5);
  txt(doc, 'Amount in Words :', MARGIN + 3, y + 5, { color: GREY_TX, size: 7.5 });
  sf(doc, 'normal', 8);
  txt(doc, toWords(grandTotal), MARGIN + 3, y + 10, { color: DARK, size: 8 });

  // Signature box — right side
  const sigY = y + wH + 3;
  const sigH = 28;
  const rX   = MARGIN + COL_W + 2;
  box(doc, rX, sigY, COL_W, sigH);
  sf(doc, 'bold', 7.5);
  txt(doc, `For ${seller.name} :`, rX + 3, sigY + 6, { color: GREY_TX, size: 7.5 });

  if (seller.signatureUrl) {
    try {
      let imgData = seller.signatureUrl;
      if (imgData.startsWith('http')) {
        imgData = await imgToBase64(imgData);
      } else if (!imgData.startsWith('data:')) {
        imgData = 'data:image/png;base64,' + imgData;
      }
      if (imgData) {
        doc.addImage(imgData, 'PNG', rX + 3, sigY + 8, 50, 14, undefined, 'FAST');
      } else {
        sigFallback(doc, seller.name, rX, sigY, sigH);
      }
    } catch (_) {
      sigFallback(doc, seller.name, rX, sigY, sigH);
    }
  } else {
    sigFallback(doc, seller.name, rX, sigY, sigH);
  }

  sf(doc, 'bold', 7);
  txt(doc, 'Authorized Signatory', rX + 3, sigY + sigH - 4, { color: GREY_TX, size: 7 });

  return sigY + sigH + 4;
}

function sigFallback(doc, name, rX, sigY, sigH) {
  sf(doc, 'italic', 9);
  doc.setTextColor(60, 60, 60);
  doc.text(name, rX + 5, sigY + sigH / 2 + 2);
}

function drawNotice(doc, y) {
  doc.setDrawColor(150, 150, 150);
  doc.setLineWidth(0.4);
  doc.line(MARGIN, y, PAGE_W - MARGIN, y);
  sf(doc, 'normal', 7);
  doc.setTextColor(...GREY_TX);
  doc.text('Whether tax is payable under reverse charge - No', MARGIN, y + 5);
  sf(doc, 'italic', 6.5);
  doc.text('This is a computer-generated invoice. For support: support@shopidoo.com',
    PAGE_W / 2, y + 10, { align: 'center' });
  sf(doc, 'normal', 6.5);
  doc.text('Page 1 of 1', PAGE_W - MARGIN, y + 10, { align: 'right' });
}

function imgToBase64(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width = img.naturalWidth;
        c.height = img.naturalHeight;
        c.getContext('2d').drawImage(img, 0, 0);
        resolve(c.toDataURL('image/png'));
      } catch (_) { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function generateInvoice(data, isSeller = false) {
  if (!data) { console.warn('[generateInvoice] No data provided'); return; }

  const seller    = getSellerProfile(data, isSeller);
  const orderData = getOrderData(data, isSeller);
  const items     = getLineItems(data, isSeller);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  let y = drawHeader(doc);
  y = drawBoxes(doc, y, seller, orderData);
  y = drawItemsTable(doc, y, items);
  y = await drawFooter(doc, y, items, seller);
  drawNotice(doc, y);

  doc.save(`INV-${orderData.orderNumber}.pdf`);
}

export default generateInvoice;