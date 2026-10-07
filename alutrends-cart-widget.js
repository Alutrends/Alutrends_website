/*
 * Universal Alutrends cart UI. Include cart engine, complete catalogue and receipt
 * engine first, then this module on each page of the same origin. Use a button
 * with data-open-cart, or AlutrendsCartUI.open()/selectProduct(productId).
 * The downloaded HTML may embed all modules inline. Customer data remains in
 * memory only. PNG sharing requires a deliberate device/WhatsApp action; this
 * module never claims automatic delivery or sends messages through an API.
 */
(function (global) {
  'use strict';
  function mount() {
    if (global.AlutrendsCartUI || !global.AlutrendsCart) return;
    const cart = global.AlutrendsCart;
    const css = document.createElement('style');
    css.textContent = `
      html.has-dialog{overflow:hidden}#alu-cart-dialog{--acu-teal:#087c79;--acu-ink:#123b3b;box-sizing:border-box;width:min(740px,calc(100vw - 24px));max-height:calc(100svh - 28px);padding:0;border:1px solid rgba(255,255,255,.85);border-radius:28px;background:rgba(249,253,247,.94);color:var(--acu-ink);box-shadow:0 30px 100px #123b3b40;backdrop-filter:blur(28px);-webkit-backdrop-filter:blur(28px);font:15px/1.5 "Helvetica Neue",Helvetica,Arial,sans-serif;overflow:hidden}
      #alu-cart-dialog::backdrop{background:#123b3b66;backdrop-filter:blur(9px);-webkit-backdrop-filter:blur(9px)}
      #alu-cart-dialog *{box-sizing:border-box}#alu-cart-dialog [hidden]{display:none!important}
      .acu-shell{display:flex;flex-direction:column;max-height:calc(100svh - 30px)}
      .acu-header{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:24px 28px 18px;background:linear-gradient(120deg,#20b2aa12,#fff8dc75);border-bottom:1px solid #123b3b10}
      .acu-header h2{margin:0;font-size:26px;font-weight:500;letter-spacing:-.8px}.acu-kicker{margin:0 0 4px;font-size:10px;font-weight:700;letter-spacing:2px;text-transform:uppercase;color:#087c79}.acu-subtitle{margin:5px 0 0;font-size:12px;color:#496969}
      .acu-close{display:grid;place-items:center;width:38px;height:38px;flex:none;padding:0;border:1px solid #123b3b18;border-radius:50%;font:24px Arial;background:#ffffff80;color:var(--acu-ink);cursor:pointer}
      .acu-body{overflow:auto;overscroll-behavior:contain;min-height:0;padding:22px 28px 28px;scrollbar-width:thin}
      .acu-message{margin:0 0 16px;padding:10px 13px;border:1px solid #087c7930;border-radius:12px;background:#20b2aa10;font-size:13px}.acu-message:empty{display:none}.acu-message.acu-error{background:#fff3df;border-color:#b56d3540;color:#713b1d}
      .acu-list{display:grid;gap:13px;margin:0;padding:0;list-style:none}.acu-item{display:grid;grid-template-columns:68px minmax(0,1fr);gap:14px;padding:16px;border:1px solid #ffffff;border-radius:19px;background:#ffffff80;box-shadow:0 8px 25px #123b3b05}
      .acu-image{width:68px;height:78px;object-fit:contain;background:#edf5ef;border-radius:12px}.acu-item h3{font-size:14px;font-weight:500;line-height:1.45;overflow-wrap:anywhere;margin:0 0 5px}.acu-price{margin:0 0 9px;font-size:12px;color:#496969}.acu-price strong{font-weight:600;color:var(--acu-ink)}
      .acu-controls{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap}.acu-quantity{display:inline-flex;align-items:center;border:1px solid #123b3b20;border-radius:30px;background:#fff9;overflow:hidden}.acu-quantity button{width:34px;height:34px;padding:0;border:0;background:transparent;color:#087c79;font:20px Arial;cursor:pointer}.acu-quantity input{width:45px;height:34px;border:0;padding:0 2px;background:transparent;text-align:center;font:14px Arial;color:var(--acu-ink);appearance:textfield;-moz-appearance:textfield}.acu-quantity input::-webkit-inner-spin-button{appearance:none}.acu-remove{border:0;background:transparent;text-decoration:underline;text-underline-offset:3px;color:#496969;padding:6px;font:12px Arial;cursor:pointer}.acu-line-total{margin:8px 0 0;font-size:13px;font-weight:600}
      .acu-summary{margin:20px 0;padding:16px 0;border-top:1px solid #123b3b18;border-bottom:1px solid #123b3b18}.acu-summary-row{display:flex;align-items:baseline;justify-content:space-between;gap:14px;font-size:14px}.acu-summary-row strong{font-size:25px;letter-spacing:-.8px;font-weight:500}.acu-note{font-size:12px;line-height:1.55;color:#496969;margin:9px 0 0;overflow-wrap:anywhere}
      .acu-actions{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.acu-button{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;padding:11px 20px;border:1px solid #087c79;border-radius:50px;background:#087c79;color:white;font:500 13px/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;text-decoration:none;cursor:pointer;transition:transform .25s,box-shadow .25s,background .25s}.acu-button:hover{transform:translateY(-2px);box-shadow:0 8px 20px #087c7925}.acu-secondary{background:#ffffff90;color:#087c79;border-color:#123b3b25}.acu-button:disabled,.acu-quantity button:disabled{opacity:.45;cursor:default;transform:none;box-shadow:none}.acu-button:focus-visible,.acu-close:focus-visible,.acu-remove:focus-visible,.acu-quantity button:focus-visible{outline:3px solid #20b2aa80;outline-offset:3px}
      .acu-empty{text-align:center;padding:24px 12px 36px}.acu-empty-symbol{font-size:42px;color:#20b2aa}.acu-empty h3{font-size:22px;font-weight:500;margin:10px 0 7px}.acu-empty p{font-size:14px;color:#496969;max-width:360px;margin:0 auto 20px}
      .acu-form{display:grid;gap:16px}.acu-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.acu-field{display:grid;gap:6px;min-width:0;font-size:12px;font-weight:600}.acu-field input,.acu-field textarea,.acu-field select{width:100%;min-height:44px;border:1px solid #123b3b28;border-radius:12px;padding:11px 13px;background:#ffffffad;color:var(--acu-ink);font:14px/1.4 "Helvetica Neue",Helvetica,Arial,sans-serif;outline:none}.acu-field textarea{resize:vertical;min-height:84px}.acu-field input:focus,.acu-field textarea:focus,.acu-field select:focus,.acu-quantity input:focus{outline:2px solid #20b2aa60;outline-offset:1px}.acu-config-name{font-size:17px;font-weight:500;line-height:1.5;margin:0 0 16px;overflow-wrap:anywhere}.acu-selection-price{padding:12px 14px;border-radius:12px;background:#20b2aa12;margin:0;font-size:14px}.acu-receipt{width:100%;height:auto;display:block;border-radius:12px;border:1px solid #123b3b20;margin:16px 0}.acu-success-title{font-size:19px;font-weight:500;margin:0 0 6px}.acu-processing{text-align:center;padding:35px 15px}.acu-processing-dot{display:inline-block;width:22px;height:22px;border-radius:50%;border:2px solid #20b2aa40;border-top-color:#087c79;animation:acu-spin 1s linear infinite}@keyframes acu-spin{to{transform:rotate(360deg)}}
      @media(max-width:520px){#alu-cart-dialog{border-radius:23px;width:calc(100vw - 20px)}.acu-header{padding:20px 19px 16px}.acu-header h2{font-size:24px}.acu-body{padding:18px 17px 23px}.acu-item{padding:12px;grid-template-columns:54px minmax(0,1fr);gap:11px}.acu-image{width:54px;height:65px}.acu-grid{grid-template-columns:1fr}.acu-actions .acu-button{flex:1 1 auto}.acu-summary-row strong{font-size:22px}}
      @media(prefers-reduced-motion:reduce){#alu-cart-dialog *{animation:none!important;transition:none!important}.acu-button:hover{transform:none}}
    `;
    document.head.appendChild(css);
    const dialog = document.createElement('dialog');
    dialog.id = 'alu-cart-dialog';
    dialog.setAttribute('aria-labelledby', 'acu-title');
    dialog.innerHTML = '<div class="acu-shell"><header class="acu-header"><div><p class="acu-kicker">ALUTRENDS · ORDER ENQUIRY</p><h2 id="acu-title">Your cart</h2><p class="acu-subtitle">Selected products, together in one place.</p></div><button class="acu-close" type="button" aria-label="Close cart">×</button></header><div class="acu-body"><p class="acu-message" role="status" aria-live="polite"></p><div class="acu-content"></div></div></div>';
    document.body.appendChild(dialog);
    const body = dialog.querySelector('.acu-body');
    const content = dialog.querySelector('.acu-content');
    const title = dialog.querySelector('h2');
    const subtitle = dialog.querySelector('.acu-subtitle');
    const message = dialog.querySelector('.acu-message');
    let step = 'cart';
    let previousFocus = null;
    let snapshot = null;
    let receipt = null;
    let receiptUrl = '';
    let customerDraft = null;
    let generation = 0;
    let lastFingerprint = fingerprint(cart.getSummary());

    function element(tag, className, text) {
      const node = document.createElement(tag);
      if (className) node.className = className;
      if (text !== undefined) node.textContent = text;
      return node;
    }
    function money(paise) {
      return Number.isSafeInteger(paise) ? new Intl.NumberFormat('en-IN', {style:'currency',currency:'INR',minimumFractionDigits:2,maximumFractionDigits:2}).format(paise / 100) : 'Price unavailable';
    }
    function fingerprint(summary) {
      return JSON.stringify(summary.items.map(function (item) { return [item.id,item.quantity,item.pricePaise,item.available,item.name]; }).sort(function (a,b) { return a[0].localeCompare(b[0]); }));
    }
    function announce(text, error) {
      message.textContent = text || '';
      message.classList.toggle('acu-error', !!error);
      message.setAttribute('role', error ? 'alert' : 'status');
    }
    function button(text, action, secondary) {
      const node = element('button', 'acu-button' + (secondary ? ' acu-secondary' : ''), text);
      node.type = 'button';
      node.addEventListener('click', action);
      return node;
    }
    function updateDialogState() {
      const open = !!document.querySelector('dialog[open]');
      document.documentElement.classList.toggle('has-dialog', open);
      global.dispatchEvent(new global.CustomEvent('alutrends:dialog', {detail:{open:open}}));
    }
    function disposeReceipt() {
      generation++;
      if (receiptUrl) global.URL.revokeObjectURL(receiptUrl);
      receiptUrl = '';
      receipt = null;
      snapshot = null;
    }
    function setStep(next, heading, description) {
      step = next;
      title.textContent = heading;
      subtitle.textContent = description || '';
      content.replaceChildren();
      body.scrollTop = 0;
    }
    function open() {
      if (!dialog.open) {
        // A native close event can be delayed in a background tab. Clear any
        // previous checkout state before this dialog is opened again.
        clearClosedState();
        previousFocus = document.activeElement;
        document.querySelectorAll('dialog[open]').forEach(function (other) { if (other !== dialog) other.close('switch'); });
        renderCart();
        dialog.showModal();
        updateDialogState();
      }
    }
    function clearClosedState() {
      disposeReceipt(); customerDraft = null; step = 'cart'; content.replaceChildren(); announce('');
    }
    function close() {
      if (dialog.open) dialog.close();
      // Clear PII and release PNG URLs immediately, even in background tabs.
      clearClosedState();
      updateDialogState();
    }
    function browse() {
      close();
      const products = document.getElementById('products');
      if (products) {
        global.location.hash = 'products';
        products.scrollIntoView({behavior:global.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',block:'start'});
      } else {
        global.location.href = 'https://www.alutrends.com/shop';
      }
    }
    function preserveFocusRender(render) {
      const active = document.activeElement;
      const key = active && active.dataset ? active.dataset.acuFocus : '';
      const position = body.scrollTop;
      const start = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
      render();
      body.scrollTop = position;
      if (key) {
        const target = Array.from(content.querySelectorAll('[data-acu-focus]')).find(function (node) { return node.dataset.acuFocus === key; });
        if (target && !target.disabled) {
          target.focus({preventScroll:true});
          if (start !== null) { try { target.setSelectionRange(start,start); } catch (_) {} }
        } else if (target) {
          const fallback = target.closest('.acu-quantity').querySelector('input');
          if (fallback) fallback.focus({preventScroll:true});
        }
      }
    }
    function renderSummary(summary) {
      const block = element('div', 'acu-summary');
      const row = element('div', 'acu-summary-row');
      row.append(element('span', '', 'Estimated enquiry total'), element('strong', '', summary.totalsComplete ? money(summary.totalPaise) : 'Review items'));
      block.append(row,element('p','acu-note','Selected configurations and quantities only. Final prices, stock, delivery and any applicable charges will be confirmed by Alutrends. No payment is collected here.'));
      return block;
    }
    function renderCart() {
      setStep('cart', 'Your cart', 'Selected products, together in one place.');
      const summary = cart.getSummary();
      if (!summary.persistAvailable) announce(summary.storageMessage, true);
      if (!summary.items.length) {
        const empty = element('div','acu-empty');
        empty.append(element('div','acu-empty-symbol','◇'),element('h3','','A little room for inspiration.'),element('p','','Choose a product and its configuration to begin your Alutrends enquiry.'),button('Browse products',browse));
        content.append(empty);
        return;
      }
      const list = element('ul','acu-list');
      summary.items.forEach(function (item) {
        const line = element('li','acu-item');
        if (item.image) {
          const image = element('img','acu-image');
          image.src = item.image;
          image.alt = '';
          image.loading = 'lazy';
          line.append(image);
        } else line.append(element('div','acu-image'));
        const details = element('div');
        details.append(element('h3','',item.name),element('p','acu-price',item.known ? money(item.pricePaise) + ' / selected configuration' : 'This item is absent from the current catalogue.'));
        if (!item.available) details.append(element('p','acu-note','Unavailable — remove this item to continue.'));
        const controls = element('div','acu-controls');
        const quantity = element('div','acu-quantity');
        const minus = element('button','','−');
        minus.type = 'button';
        minus.setAttribute('aria-label','Decrease quantity for ' + item.name);
        minus.dataset.acuFocus = 'minus:' + item.id;
        minus.disabled = item.quantity <= 1;
        const input = element('input');
        input.type = 'number'; input.min = '1'; input.max = '100'; input.step = '1'; input.value = item.quantity;
        input.setAttribute('aria-label','Quantity for ' + item.name);
        input.dataset.acuFocus = 'qty:' + item.id;
        const plus = element('button','','+');
        plus.type = 'button';
        plus.setAttribute('aria-label','Increase quantity for ' + item.name);
        plus.dataset.acuFocus = 'plus:' + item.id;
        plus.disabled = item.quantity >= 100;
        function change(value) {
          const updated = cart.setQuantity(item.id,value);
          if (!updated.ok) {
            input.value = item.quantity;
            announce(updated.error,true);
          }
        }
        minus.addEventListener('click',function () { change(item.quantity - 1); });
        plus.addEventListener('click',function () { change(item.quantity + 1); });
        input.addEventListener('change',function () { change(input.value); });
        quantity.append(minus,input,plus);
        const remove = element('button','acu-remove','Remove');
        remove.type = 'button';
        remove.setAttribute('aria-label','Remove ' + item.name);
        remove.addEventListener('click',function () { cart.remove(item.id); });
        controls.append(quantity,remove);
        details.append(controls,element('p','acu-line-total',item.lineTotalPaise === null ? 'Price unavailable' : money(item.lineTotalPaise)));
        line.append(details); list.append(line);
      });
      content.append(list,renderSummary(summary));
      const actions = element('div','acu-actions');
      const checkout = button('Continue to checkout →',renderCheckout);
      checkout.disabled = !summary.canCheckout;
      actions.append(checkout,button('Keep exploring',browse,true));
      content.append(actions);
      if (!summary.canCheckout) content.append(element('p','acu-note','Remove unavailable items before checkout.'));
    }
    function catalogue() {
      return global.AlutrendsCatalogue && Array.isArray(global.AlutrendsCatalogue.products) ? global.AlutrendsCatalogue.products : [];
    }
    function selectProduct(productId) {
      const product = catalogue().find(function (entry) { return entry.id === productId; });
      open();
      disposeReceipt();
      announce('');
      if (!product) { renderCart(); announce('This product could not be found in the catalogue.',true); return; }
      if (product.available === false) { renderCart(); announce('This product is currently unavailable.',true); return; }
      const options = Array.isArray(product.options) ? product.options : [];
      const variants = Array.isArray(product.variants) ? product.variants : [];
      if (!options.length) {
        const variant = variants.find(function (entry) { return (!entry.selectionIds || !entry.selectionIds.length) && entry.available !== false; });
        const added = cart.add(variant ? variant.id : product.id);
        renderCart(); announce(added.ok ? 'Added to your cart.' : added.error,!added.ok); return;
      }
      setStep('configure','Make it yours','Select every option to see the exact configuration price.');
      content.append(element('h3','acu-config-name',product.name));
      const form = element('form','acu-form');
      const selects = [];
      options.forEach(function (option) {
        const field = element('label','acu-field',option.name || option.key || 'Configuration');
        const select = element('select');
        select.required = true;
        select.name = option.key || option.id;
        const placeholder = element('option','','Select ' + (option.name || 'an option'));
        placeholder.value = ''; select.append(placeholder);
        (option.choices || []).forEach(function (choice) {
          const entry = element('option','',choice.label || choice.key || choice.id);
          entry.value = choice.id; select.append(entry);
        });
        field.append(select); form.append(field); selects.push(select);
      });
      const price = element('p','acu-selection-price','Choose all options above.');
      const add = element('button','acu-button','Add selected product →'); add.type = 'submit'; add.disabled = true;
      function selectedVariant() {
        const ids = selects.map(function (select) { return select.value; });
        if (ids.some(function (id) { return !id; })) return null;
        return variants.find(function (variant) {
          return Array.isArray(variant.selectionIds) && variant.selectionIds.length === ids.length && variant.selectionIds.every(function (id,index) { return id === ids[index]; });
        });
      }
      function selectionChanged() {
        const variant = selectedVariant();
        const complete = selects.every(function (select) { return !!select.value; });
        add.disabled = !variant || variant.available === false;
        price.textContent = !complete ? 'Choose all options above.' : !variant || variant.available === false ? 'This configuration is currently unavailable.' : 'Estimated configuration price: ' + money(variant.pricePaise);
      }
      selects.forEach(function (select) { select.addEventListener('change',selectionChanged); });
      form.addEventListener('submit',function (event) {
        event.preventDefault();
        if (!form.reportValidity()) return;
        const variant = selectedVariant();
        if (!variant || variant.available === false) { announce('Choose an available configuration.',true); return; }
        const added = cart.add(variant.id);
        if (!added.ok) { announce(added.error,true); return; }
        renderCart(); announce('Your selected configuration is in the cart.');
      });
      const actions = element('div','acu-actions'); actions.append(add,button('Back to cart',function () { announce(''); renderCart(); },true));
      form.append(price,element('p','acu-note','The price shown belongs to the selected option or pack. Pack labels are preserved; no extra multiplier is applied.'),actions);
      content.append(form);
      selects[0].focus({preventScroll:true});
    }
    function field(name,label,kind,settings) {
      const wrapper = element('label','acu-field',label);
      const input = element(kind === 'textarea' ? 'textarea' : 'input');
      input.name = name;
      if (kind !== 'textarea') input.type = kind;
      Object.keys(settings || {}).forEach(function (key) { input.setAttribute(key,settings[key]); });
      if (customerDraft && customerDraft[name]) input.value = customerDraft[name];
      input.addEventListener('input',function () { input.setCustomValidity(''); });
      wrapper.append(input);
      return wrapper;
    }
    function renderCheckout() {
      const summary = cart.getSummary();
      if (!summary.canCheckout) { renderCart(); announce('Review your cart before continuing.',true); return; }
      disposeReceipt(); announce('');
      lastFingerprint = fingerprint(summary);
      setStep('checkout','Your details','All fields are required, except the optional note.');
      const form = element('form','acu-form');
      const grid = element('div','acu-grid');
      grid.append(field('name','Full name *','text',{required:'',minlength:'2',maxlength:'80',autocomplete:'name'}),field('phone','Indian mobile number *','tel',{required:'',pattern:'(?:\\+91(?: |-)?)?[6-9][0-9]{9}',maxlength:'15',autocomplete:'tel',placeholder:'9306566096',title:'Enter 10 digits, optionally preceded by +91'}),field('email','Email address *','email',{required:'',maxlength:'120',autocomplete:'email'}),field('city','City *','text',{required:'',minlength:'2',maxlength:'80',autocomplete:'address-level2'}));
      form.append(grid,field('address','Full address *','textarea',{required:'',minlength:'8',maxlength:'400',autocomplete:'street-address'}),field('pincode','PIN code *','text',{required:'',pattern:'[1-9][0-9]{5}',maxlength:'6',inputmode:'numeric',autocomplete:'postal-code',title:'Enter a valid six-digit Indian PIN code'}),field('notes','Additional note (optional)','textarea',{maxlength:'400'}),renderSummary(summary));
      const actions = element('div','acu-actions');
      const submit = element('button','acu-button','Create enquiry slip →'); submit.type = 'submit';
      actions.append(submit,button('Back to cart',function () { customerDraft = readCustomer(form); renderCart(); },true));
      form.append(actions,element('p','acu-note','Your details are used only for this enquiry slip and are not saved in browser storage. Creating a slip does not place a confirmed order or send it automatically.'));
      form.addEventListener('submit',function (event) {
        event.preventDefault();
        const customer = readCustomer(form);
        ['name','city','address'].forEach(function (name) {
          const input = form.elements.namedItem(name);
          input.setCustomValidity(customer[name].length < (name === 'address' ? 8 : 2) ? 'Please enter your ' + (name === 'name' ? 'full name' : name) + '.' : '');
        });
        form.elements.namedItem('phone').setCustomValidity(/^(?:\+91(?: |-)?)?[6-9][0-9]{9}$/.test(customer.phone) ? '' : 'Enter a ten-digit Indian mobile number, optionally preceded by +91.');
        form.elements.namedItem('email').setCustomValidity(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customer.email) ? '' : 'Enter an email address such as name@example.com.');
        if (!form.reportValidity()) return;
        customerDraft = customer;
        const current = cart.getSummary();
        if (!current.canCheckout || fingerprint(current) !== lastFingerprint) { renderCart(); announce('Your cart changed. Check the updated items and start checkout again.',true); return; }
        generateReceipt(current,customer);
      });
      content.append(form);
      form.elements.namedItem('name').focus({preventScroll:true});
    }
    function readCustomer(form) {
      const data = {};
      ['name','phone','email','address','city','pincode','notes'].forEach(function (name) { data[name] = form.elements.namedItem(name).value.trim(); });
      return data;
    }
    function orderId() {
      const suffix = global.crypto && typeof global.crypto.randomUUID === 'function' ? global.crypto.randomUUID().replace(/-/g,'').slice(0,10).toUpperCase() : Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2,6).toUpperCase();
      return 'ALU-' + suffix;
    }
    async function generateReceipt(summary,customer) {
      if (!global.AlutrendsReceipt || typeof global.AlutrendsReceipt.create !== 'function') { announce('The slip generator could not be loaded. Please try again.',true); return; }
      const currentGeneration = ++generation;
      const locked = {items:summary.items.map(function (item) { return {id:item.id,name:item.name,qty:item.quantity,pricePaise:item.pricePaise,lineTotalPaise:item.lineTotalPaise}; }),customer:customer,orderId:orderId(),createdAt:new Date().toISOString(),totalPaise:summary.totalPaise};
      setStep('generating','Creating your slip','Preparing a PNG with your details and selected items.');
      const waiting = element('div','acu-processing');
      waiting.setAttribute('aria-busy','true');
      waiting.append(element('span','acu-processing-dot'),element('p','','Preparing your enquiry slip…')); content.append(waiting);
      try {
        const generated = await global.AlutrendsReceipt.create(locked);
        if (generation !== currentGeneration || !dialog.open || fingerprint(cart.getSummary()) !== lastFingerprint) return;
        snapshot = locked; receipt = generated; receiptUrl = global.URL.createObjectURL(generated.blob);
        renderReceipt();
      } catch (error) {
        if (generation !== currentGeneration || !dialog.open) return;
        renderCheckout();
        announce(error instanceof RangeError && typeof error.message === 'string' ? error.message.slice(0,240) + ' Your cart is safe.' : 'The image could not be created. Your cart is safe; please try again.',true);
      }
    }
    function downloadReceipt() {
      if (!receipt || !receiptUrl) return;
      const link = element('a'); link.href = receiptUrl; link.download = receipt.filename || 'alutrends-enquiry.png';
      document.body.appendChild(link); link.click(); link.remove();
      announce('PNG download requested. Attach the downloaded image in the Alutrends WhatsApp chat.');
    }
    async function shareReceipt() {
      if (!receipt || !snapshot) return;
      const file = receipt.file;
      if (!global.isSecureContext || !global.navigator.share || !global.navigator.canShare || !file || !global.navigator.canShare({files:[file]})) {
        downloadReceipt(); announce('Image sharing is unavailable here. Download the PNG, open WhatsApp, and attach it to the chat with 9306566096.'); return;
      }
      try {
        await global.navigator.share({files:[file],title:'Alutrends order enquiry',text:'Alutrends enquiry ' + snapshot.orderId + '. Choose WhatsApp and contact 9306566096.'});
        announce('Your device handled the share. Check the Alutrends chat in WhatsApp.');
      } catch (error) {
        if (error && error.name === 'AbortError') announce('Sharing was cancelled. You can still download the PNG.');
        else announce('Sharing could not open. Download the PNG and attach it in WhatsApp.',true);
      }
    }
    function renderReceipt() {
      setStep('receipt','Your enquiry slip','PNG ready. Share it with Alutrends on WhatsApp.'); announce('');
      content.append(element('h3','acu-success-title','Ready to share with Alutrends'),element('p','acu-note','Enquiry ' + snapshot.orderId + ' · Estimated value ' + money(snapshot.totalPaise)));
      const image = element('img','acu-receipt'); image.src = receiptUrl; image.alt = 'Alutrends enquiry slip containing your customer details, selected products, quantities and estimated total.';
      content.append(image);
      const actions = element('div','acu-actions');
      const whatsapp = element('a','acu-button','Open WhatsApp ↗');
      whatsapp.href = 'https://wa.me/919306566096?text=' + encodeURIComponent(global.AlutrendsReceipt.buildWhatsAppText(snapshot));
      whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer';
      actions.append(button('Download PNG',downloadReceipt,true),button('Share PNG',shareReceipt,true),whatsapp);
      content.append(actions,element('p','acu-note','WhatsApp opens the Alutrends chat with enquiry text. The image is not attached automatically: download and attach the PNG, or choose WhatsApp and 9306566096 in your device’s Share menu. Confirm and send there.'),element('p','acu-note','This is an order enquiry. No payment is collected; Alutrends will confirm the final configuration, price and availability.'),button('Back to cart',function () { disposeReceipt(); renderCart(); },true));
    }
    cart.subscribe(function (summary) {
      const next = fingerprint(summary);
      const changed = next !== lastFingerprint;
      lastFingerprint = next;
      if (!dialog.open) return;
      if (changed && (step === 'checkout' || step === 'receipt' || step === 'generating')) {
        disposeReceipt(); renderCart(); announce('Your cart changed. Review the updated items and start checkout again.',true);
      } else if (step === 'cart') preserveFocusRender(renderCart);
    });
    dialog.querySelector('.acu-close').addEventListener('click',close);
    dialog.addEventListener('cancel',function (event) { event.preventDefault(); close(); });
    dialog.addEventListener('click',function (event) {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) close();
    });
    dialog.addEventListener('keydown',function (event) {
      if (event.key !== 'Tab') return;
      const focusable = Array.from(dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex="0"]')).filter(function (node) { return node.getClientRects().length > 0; });
      if (!focusable.length) { event.preventDefault(); return; }
      const first = focusable[0], last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
    dialog.addEventListener('close',function () {
      if (dialog.open) { updateDialogState(); return; }
      clearClosedState(); updateDialogState();
      global.requestAnimationFrame(function () {
        if (!document.querySelector('dialog[open]') && previousFocus && previousFocus.isConnected && typeof previousFocus.focus === 'function') previousFocus.focus({preventScroll:true});
      });
    });
    document.addEventListener('click',function (event) {
      const target = event.target instanceof Element ? event.target.closest('[data-open-cart],[data-select-product]') : null;
      if (!target) return;
      event.preventDefault();
      if (target.hasAttribute('data-select-product')) selectProduct(target.dataset.selectProduct);
      else open();
    });
    global.AlutrendsCartUI = Object.freeze({open:open,selectProduct:selectProduct,close:close});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})(window);
