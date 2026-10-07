/* Alutrends order-enquiry PNG renderer. No network requests or automatic messaging. */
(function (global) {
  'use strict';

  const WIDTH = 1200;
  const MAX_HEIGHT = 15000;
  const PAD = 72;
  const CONTENT = WIDTH - PAD * 2;
  const INK = '#123B3B';
  const TEAL = '#20B2AA';
  const CREAM = '#FFF8DC';
  const MONEY = new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', minimumFractionDigits: 0, maximumFractionDigits: 0
  });
  const DATE = new Intl.DateTimeFormat('en-IN', {
    timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', hour12: true
  });

  function boundedText(value, maximum, label, required) {
    if (value == null && !required) return '';
    if (typeof value !== 'string') throw new TypeError(label + ' must be text.');
    if (value.length > maximum) throw new RangeError(label + ' is too long.');
    const text = value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F\u202A-\u202E\u2066-\u2069]/g, '').trim();
    if (required && !text) throw new TypeError(label + ' is required.');
    return text;
  }

  function paise(value, label) {
    if (!Number.isSafeInteger(value) || value < 0) {
      throw new RangeError(label + ' must be a non-negative integer amount in paise.');
    }
    return value;
  }

  function normalise(payload) {
    if (!payload || typeof payload !== 'object') throw new TypeError('An order enquiry is required.');
    if (!Array.isArray(payload.items) || !payload.items.length || payload.items.length > 200) {
      throw new RangeError('An enquiry must contain between 1 and 200 items.');
    }
    let totalPaise = 0;
    const items = payload.items.map(function (item) {
      if (!item || typeof item !== 'object') throw new TypeError('Each item must be an object.');
      const qty = item.qty;
      if (!Number.isSafeInteger(qty) || qty < 1 || qty > 100) {
        throw new RangeError('Every quantity must be an integer from 1 to 100.');
      }
      const pricePaise = paise(item.pricePaise, 'Unit price');
      const lineTotalPaise = pricePaise * qty;
      paise(lineTotalPaise, 'Line total');
      if (item.lineTotalPaise != null && paise(item.lineTotalPaise, 'Line total') !== lineTotalPaise) {
        throw new RangeError('An item total does not match its quantity and unit price.');
      }
      totalPaise += lineTotalPaise;
      paise(totalPaise, 'Order total');
      return {
        name: boundedText(item.name, 200, 'Product name', true),
        qty: qty, pricePaise: pricePaise, lineTotalPaise: lineTotalPaise
      };
    });
    if (payload.totalPaise != null && paise(payload.totalPaise, 'Order total') !== totalPaise) {
      throw new RangeError('The order total does not match the selected items.');
    }
    const input = payload.customer;
    if (!input || typeof input !== 'object') throw new TypeError('Customer details are required.');
    const customer = {
      name: boundedText(input.name, 160, 'Customer name', true),
      phone: boundedText(input.phone, 40, 'Phone number', true),
      email: boundedText(input.email, 254, 'Email', false),
      address: boundedText(input.address, 800, 'Address', true),
      city: boundedText(input.city, 120, 'City', false),
      pincode: boundedText(input.pincode, 12, 'PIN code', false),
      notes: boundedText(input.notes, 1200, 'Notes', false)
    };
    const createdAt = payload.createdAt == null ? new Date() : new Date(payload.createdAt);
    if (!Number.isFinite(createdAt.getTime())) throw new TypeError('The enquiry date is invalid.');
    const fallbackId = 'AT-' + createdAt.getTime().toString(36).toUpperCase();
    const orderId = boundedText(payload.orderId == null ? fallbackId : payload.orderId, 80, 'Enquiry ID', true);
    return {items: items, customer: customer, orderId: orderId, createdAt: createdAt, totalPaise: totalPaise};
  }

  // Wrap words and individual characters, including long product codes and email addresses.
  // Canvas renders plain text, so customer input never becomes HTML or CSS.
  function wrap(ctx, value, maximumWidth) {
    const result = [];
    String(value).replace(/\r\n?/g, '\n').split('\n').forEach(function (paragraph) {
      const words = paragraph.trim().split(/\s+/).filter(Boolean);
      if (!words.length) { result.push(''); return; }
      let line = '';
      words.forEach(function (word) {
        if (ctx.measureText(word).width > maximumWidth) {
          if (line) { result.push(line); line = ''; }
          Array.from(word).forEach(function (character) {
            if (line && ctx.measureText(line + character).width > maximumWidth) {
              result.push(line); line = '';
            }
            line += character;
          });
          return;
        }
        const candidate = line ? line + ' ' + word : word;
        if (line && ctx.measureText(candidate).width > maximumWidth) {
          result.push(line); line = word;
        } else line = candidate;
      });
      if (line) result.push(line);
    });
    return result.length ? result : [''];
  }

  function font(ctx, size, weight) {
    ctx.font = (weight || 400) + ' ' + size + 'px Arial, Helvetica, sans-serif';
  }

  // Format paise separately so even large safe-integer amounts retain their exact cents.
  function money(value) {
    return MONEY.format(Math.floor(value / 100)) + '.' + String(value % 100).padStart(2, '0');
  }

  async function create(payload) {
    const order = normalise(payload);
    const canvas = document.createElement('canvas');
    canvas.width = WIDTH;
    canvas.height = 1;
    let ctx = canvas.getContext('2d', {alpha: false});
    if (!ctx) throw new Error('PNG generation is unavailable in this browser.');

    font(ctx, 27, 700);
    const metaLines = wrap(ctx, 'Enquiry ID: ' + order.orderId, CONTENT);
    font(ctx, 27);
    const customerRows = [
      ['Name', order.customer.name], ['Phone', order.customer.phone],
      ['Email', order.customer.email], ['Address', order.customer.address],
      ['City', order.customer.city], ['PIN code', order.customer.pincode]
    ].filter(function (row) { return Boolean(row[1]); }).map(function (row) {
      return {label: row[0], lines: wrap(ctx, row[1], CONTENT - 230)};
    });
    const itemRows = order.items.map(function (item, index) {
      font(ctx, 26);
      const lines = wrap(ctx, item.name, 472);
      return {item: item, index: index, lines: lines, height: Math.max(92, lines.length * 35 + 34)};
    });
    font(ctx, 26);
    const notesLines = order.customer.notes ? wrap(ctx, order.customer.notes, CONTENT) : [];
    font(ctx, 24);
    const confirmationLines = wrap(ctx,
      'Prices refer to the selected catalogue configuration. Packing, quantities, availability and final billing will be confirmed by Alutrends.', CONTENT);

    const metaHeight = 78 + metaLines.length * 36;
    const customerHeight = 80 + customerRows.reduce(function (sum, row) { return sum + row.lines.length * 36 + 20; }, 0);
    const itemHeight = 166 + itemRows.reduce(function (sum, row) { return sum + row.height; }, 0);
    const notesHeight = notesLines.length ? 100 + notesLines.length * 36 : 0;
    const footerHeight = 430 + confirmationLines.length * 34;
    const height = 240 + metaHeight + customerHeight + itemHeight + notesHeight + footerHeight;
    if (!Number.isSafeInteger(height) || height > MAX_HEIGHT) {
      throw new RangeError('This enquiry is too long for one PNG slip. Reduce long notes or split the enquiry.');
    }

    canvas.height = height;
    ctx = canvas.getContext('2d', {alpha: false});
    ctx.textBaseline = 'top';
    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, WIDTH, height);
    ctx.fillStyle = INK;
    ctx.fillRect(0, 0, WIDTH, 232);
    ctx.fillStyle = TEAL;
    ctx.fillRect(0, 232, WIDTH, 8);
    ctx.fillStyle = '#FFFFFF';
    font(ctx, 54, 700);
    ctx.fillText('ALUTRENDS', PAD, 56);
    font(ctx, 30);
    ctx.fillText('Order enquiry', PAD, 126);
    ctx.fillStyle = '#BCE9E0';
    font(ctx, 23);
    ctx.fillText('Aluminium railings, system windows & doors', PAD, 176);

    function lines(linesToDraw, x, y, lineHeight, color) {
      ctx.fillStyle = color || INK;
      linesToDraw.forEach(function (line, index) { ctx.fillText(line, x, y + index * lineHeight); });
    }
    function divider(y) {
      ctx.fillStyle = '#D9E4D7';
      ctx.fillRect(PAD, y, CONTENT, 2);
    }
    function sectionTitle(title, y) {
      ctx.fillStyle = '#087C79'; font(ctx, 31, 700); ctx.fillText(title, PAD, y);
    }
    function fitText(value, x, y, availableWidth, size, weight, alignment) {
      let selectedSize = size;
      font(ctx, selectedSize, weight);
      while (selectedSize > 16 && ctx.measureText(value).width > availableWidth) {
        selectedSize--; font(ctx, selectedSize, weight);
      }
      const offset = alignment === 'right' ? availableWidth - ctx.measureText(value).width :
        alignment === 'center' ? (availableWidth - ctx.measureText(value).width) / 2 : 0;
      ctx.fillText(value, x + Math.max(0, offset), y);
    }

    let y = 276;
    font(ctx, 27, 700);
    lines(metaLines, PAD, y, 36);
    y += metaLines.length * 36 + 12;
    font(ctx, 24);
    lines([DATE.format(order.createdAt) + ' IST'], PAD, y, 32, '#526A65');
    y = 240 + metaHeight;

    sectionTitle('Customer details', y + 16);
    y += 80;
    customerRows.forEach(function (row) {
      ctx.fillStyle = '#526A65'; font(ctx, 25, 700); ctx.fillText(row.label, PAD, y);
      font(ctx, 27);
      lines(row.lines, PAD + 230, y, 36);
      y += row.lines.length * 36 + 20;
    });
    divider(y + 8);

    sectionTitle('Selected items', y + 32);
    y += 92;
    ctx.fillStyle = '#D6ECE3'; ctx.fillRect(PAD, y, CONTENT, 58);
    ctx.fillStyle = INK; font(ctx, 22, 700);
    ctx.fillText('PRODUCT', PAD + 16, y + 18);
    ctx.fillText('QTY', 614, y + 18);
    ctx.fillText('UNIT PRICE', 733, y + 18);
    ctx.fillText('AMOUNT', 1008, y + 18);
    y += 74;
    itemRows.forEach(function (row) {
      ctx.fillStyle = row.index % 2 === 0 ? '#FFFCED' : '#F7F7E9';
      ctx.fillRect(PAD, y, CONTENT, row.height);
      font(ctx, 26);
      lines(row.lines, PAD + 16, y + 20, 35);
      ctx.fillStyle = INK;
      fitText(String(row.item.qty), 590, y + 22, 94, 26, 400, 'center');
      fitText(money(row.item.pricePaise), 700, y + 22, 190, 26, 400, 'right');
      fitText(money(row.item.lineTotalPaise), 914, y + 22, 198, 26, 700, 'right');
      y += row.height;
      divider(y);
    });

    // Reserve enough space above totals for all wrapped item text.
    y += 34;
    if (notesLines.length) {
      sectionTitle('Customer notes', y + 8);
      font(ctx, 26);
      lines(notesLines, PAD, y + 68, 36);
      y += notesHeight;
    }
    ctx.fillStyle = INK;
    ctx.fillRect(PAD, y + 12, CONTENT, 116);
    ctx.fillStyle = '#FFFFFF';
    font(ctx, 29, 700);
    ctx.fillText('Estimated enquiry value', PAD + 28, y + 35);
    font(ctx, 20);
    const quantity = order.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    ctx.fillText(order.items.length + ' product' + (order.items.length === 1 ? '' : 's') + ' · ' + quantity + ' total quantity', PAD + 28, y + 78);
    ctx.fillStyle = '#FFFFFF';
    fitText(money(order.totalPaise), 628, y + 46, 468, 40, 700, 'right');
    y += 170;
    font(ctx, 24);
    lines(confirmationLines, PAD, y, 34, '#526A65');
    y += confirmationLines.length * 34 + 28;
    ctx.fillStyle = INK; font(ctx, 26, 700);
    ctx.fillText('Order enquiry — no payment collected', PAD, y);
    y += 46;
    ctx.fillStyle = '#087C79'; font(ctx, 26, 700);
    ctx.fillText('WhatsApp Alutrends: +91 93065 66096', PAD, y);
    y += 44;
    ctx.fillStyle = '#526A65'; font(ctx, 22);
    ctx.fillText('Share this PNG slip with Alutrends to request confirmation.', PAD, y);

    const blob = await new Promise(function (resolve, reject) {
      canvas.toBlob(function (result) {
        if (result) resolve(result); else reject(new Error('The PNG slip could not be generated.'));
      }, 'image/png');
    });
    const safeId = order.orderId.replace(/[^a-zA-Z0-9_-]/g, '-').replace(/-+/g, '-').slice(0, 80) || 'enquiry';
    const filename = 'alutrends-order-' + safeId + '.png';
    const file = typeof File === 'function' ? new File([blob], filename, {type: 'image/png'}) : null;
    return {blob: blob, file: file, filename: filename, width: WIDTH, height: height};
  }

  // Keep the WhatsApp URL message compact. The PNG carries the complete enquiry.
  // This function returns text only; opening WhatsApp and sending remain user actions.
  function buildWhatsAppText(payload) {
    const order = normalise(payload);
    const quantity = order.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    const header = 'Alutrends order enquiry\nID: ' + order.orderId + '\nName: ' + order.customer.name + '\nPhone: ' + order.customer.phone +
      '\nCart: ' + order.items.length + ' selected configuration' + (order.items.length === 1 ? '' : 's') + ' · ' + quantity + ' total quantity';
    const total = '\nEstimated enquiry value: ' + money(order.totalPaise) + '\nPlease share the generated PNG slip for complete details.';
    const limit = 2048;
    const encoder = new TextEncoder();
    let message = header;
    const detailRows = [order.customer.email ? 'Email: ' + order.customer.email : '',
      'Address: ' + order.customer.address,
      [order.customer.city, order.customer.pincode].filter(Boolean).join(' - ')
    ].filter(Boolean);
    let omitted = false;
    detailRows.concat(order.items.map(function (item) {
      return item.qty + ' × ' + item.name + ' = ' + money(item.lineTotalPaise);
    })).forEach(function (line) {
      const candidate = message + '\n' + line;
      if (encoder.encode(candidate + '\nAdditional details are in the PNG slip.' + total).length <= limit) message = candidate;
      else omitted = true;
    });
    if (omitted) message += '\nAdditional details are in the PNG slip.';
    return message + total;
  }

  global.AlutrendsReceipt = Object.freeze({create: create, buildWhatsAppText: buildWhatsAppText});
})(window);
