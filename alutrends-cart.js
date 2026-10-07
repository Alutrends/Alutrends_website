/*
 * Alutrends shared cart, v1. No dependencies or customer details in storage.
 * Load this script and configure the COMPLETE trusted catalogue on every page:
 *   AlutrendsCart.configureCatalog([{id,name,pricePaise,image,href,available:true}]);
 * Pages/tabs must share an origin (scheme + host + port) for localStorage sync.
 * Opening separate downloaded files cannot guarantee cross-page persistence.
 * add(id, quantity=1), setQuantity(id, quantity), remove(id), clear()
 * return {ok, code?, error?, items, summary}. Quantities are integers, clamped
 * to 1..100. Items expose both quantity and qty; all amounts are integer paise.
 * subscribe(callback) immediately supplies a summary and returns unsubscribe.
 * 'alutrends:cart:add' accepts detail {id, qty}; 'alutrends:cart:change' carries
 * the current summary. Existing unknown/unavailable items remain removable but
 * block checkout. Prices always come from the configured catalogue, never from
 * persisted data. Client totals are enquiries; final pricing needs verification.
 */
(function (global) {
  'use strict';

  const STORAGE_KEY = 'alutrends.cart.v1';
  const MAX_QUANTITY = 100;
  const MAX_ITEMS = 200;
  const MAX_PRICE_PAISE = 100000000000;
  const catalog = new Map();
  const listeners = new Set();
  let quantities = new Map();
  let persistAvailable = false;
  let storage = null;

  function validId(value) {
    return typeof value === 'string' && value.length > 0 &&
      value.length <= 256 && value === value.trim() && !/[\u0000-\u001f\u007f]/.test(value);
  }

  function parseStored(raw) {
    if (typeof raw !== 'string' || raw.length > 150000) return new Map();
    try {
      const data = JSON.parse(raw);
      if (!data || data.version !== 1 || !Array.isArray(data.items)) return new Map();
      const parsed = new Map();
      data.items.slice(0, MAX_ITEMS).forEach(function (item) {
        if (!item || !validId(item.id) || !Number.isSafeInteger(item.quantity) || item.quantity < 1) return;
        // Ignore all other stored fields, including purported names/prices.
        parsed.set(item.id, Math.min(MAX_QUANTITY, item.quantity));
      });
      return parsed;
    } catch (_) {
      return new Map();
    }
  }

  function serialize() {
    return JSON.stringify({version: 1, items: Array.from(quantities, function (entry) {
      return {id: entry[0], quantity: entry[1]};
    })});
  }

  function initializeStorage() {
    try {
      storage = global.localStorage;
      quantities = parseStored(storage.getItem(STORAGE_KEY));
      const probeKey = STORAGE_KEY + '.probe.' + Date.now() + '.' + Math.random().toString(36).slice(2);
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      persistAvailable = true;
    } catch (_) {
      // A blocked/quota-full browser still gets an in-memory cart this session.
      persistAvailable = false;
    }
  }

  function refreshFromStorage() {
    if (!persistAvailable || !storage) return;
    try {
      quantities = parseStored(storage.getItem(STORAGE_KEY));
    } catch (_) {
      persistAvailable = false;
    }
  }

  function save() {
    if (!persistAvailable || !storage) return;
    try {
      storage.setItem(STORAGE_KEY, serialize());
    } catch (_) {
      persistAvailable = false;
    }
  }

  function getItems() {
    return Array.from(quantities, function (entry) {
      const id = entry[0];
      const quantity = entry[1];
      const product = catalog.get(id);
      const known = !!product;
      return {
        id: id,
        name: known ? product.name : 'Product unavailable',
        pricePaise: known ? product.pricePaise : null,
        image: known ? product.image : '',
        href: known ? product.href : '',
        available: known && product.available,
        known: known,
        quantity: quantity,
        qty: quantity,
        lineTotalPaise: known ? product.pricePaise * quantity : null
      };
    });
  }

  function getSummary() {
    const items = getItems();
    const unavailableIds = items.filter(function (item) { return !item.available; })
      .map(function (item) { return item.id; });
    return {
      items: items,
      totalQuantity: items.reduce(function (sum, item) { return sum + item.quantity; }, 0),
      totalPaise: items.reduce(function (sum, item) { return sum + (item.lineTotalPaise || 0); }, 0),
      totalsComplete: items.every(function (item) { return item.known; }),
      canCheckout: items.length > 0 && unavailableIds.length === 0,
      unavailableIds: unavailableIds,
      persistAvailable: persistAvailable,
      storageMessage: persistAvailable ? '' : 'Your browser could not save this cart. Items will stay in this page only.'
    };
  }

  function notify() {
    listeners.forEach(function (listener) {
      try { listener(getSummary()); } catch (_) { /* Isolate UI subscribers. */ }
    });
    if (typeof global.CustomEvent === 'function' && typeof global.dispatchEvent === 'function') {
      global.dispatchEvent(new global.CustomEvent('alutrends:cart:change', {detail: getSummary()}));
    }
  }

  function result(ok, code, error) {
    const summary = getSummary();
    const output = {ok: ok, items: summary.items, summary: summary};
    if (code) output.code = code;
    if (error) output.error = error;
    return output;
  }

  function commit() {
    save();
    notify();
    return result(true);
  }

  function quantityInput(value) {
    if (typeof value !== 'number' && (typeof value !== 'string' || !value.trim())) return null;
    const number = Number(value);
    if (!Number.isSafeInteger(number)) return null;
    return Math.max(1, Math.min(MAX_QUANTITY, number));
  }

  function configureCatalog(products) {
    if (!Array.isArray(products)) return result(false, 'invalid_catalog', 'The product catalogue could not be loaded.');
    catalog.clear();
    products.forEach(function (product) {
      if (!product || !validId(product.id) || typeof product.name !== 'string' || !product.name.trim() ||
        !Number.isSafeInteger(product.pricePaise) || product.pricePaise < 0 || product.pricePaise > MAX_PRICE_PAISE) return;
      catalog.set(product.id, {
        name: product.name.trim().slice(0, 500),
        pricePaise: product.pricePaise,
        image: typeof product.image === 'string' ? product.image : '',
        href: typeof product.href === 'string' ? product.href : '',
        available: product.available !== false
      });
    });
    notify();
    return result(true);
  }

  function add(id, quantity) {
    refreshFromStorage();
    const product = validId(id) ? catalog.get(id) : null;
    if (!product) return result(false, 'unknown_product', 'This product is not in the current catalogue.');
    if (!product.available) return result(false, 'unavailable_product', 'This product is currently unavailable.');
    const amount = quantityInput(quantity === undefined ? 1 : quantity);
    if (amount === null) return result(false, 'invalid_quantity', 'Enter a whole quantity from 1 to 100.');
    if (!quantities.has(id) && quantities.size >= MAX_ITEMS) return result(false, 'cart_full', 'Your cart has reached its item limit.');
    quantities.set(id, Math.min(MAX_QUANTITY, (quantities.get(id) || 0) + amount));
    return commit();
  }

  function setQuantity(id, quantity) {
    refreshFromStorage();
    if (!validId(id) || !quantities.has(id)) return result(false, 'missing_item', 'This item is no longer in your cart.');
    const amount = quantityInput(quantity);
    if (amount === null) return result(false, 'invalid_quantity', 'Enter a whole quantity from 1 to 100.');
    quantities.set(id, amount);
    return commit();
  }

  function remove(id) {
    refreshFromStorage();
    if (!validId(id)) return result(false, 'invalid_product', 'This item could not be removed.');
    quantities.delete(id);
    return commit();
  }

  function clear() {
    quantities.clear();
    return commit();
  }

  function subscribe(callback) {
    if (typeof callback !== 'function') return function () {};
    listeners.add(callback);
    try { callback(getSummary()); } catch (_) { /* Isolate UI subscribers. */ }
    return function () { listeners.delete(callback); };
  }

  initializeStorage();
  global.AlutrendsCart = Object.freeze({
    configureCatalog: configureCatalog,
    getItems: getItems,
    getSummary: getSummary,
    add: add,
    setQuantity: setQuantity,
    remove: remove,
    clear: clear,
    subscribe: subscribe,
    get persistAvailable() { return persistAvailable; }
  });

  global.addEventListener('storage', function (event) {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    if (!persistAvailable || !storage) return;
    try {
      quantities = parseStored(storage.getItem(STORAGE_KEY));
    } catch (_) {
      persistAvailable = false;
    }
    notify();
  });
  global.addEventListener('alutrends:cart:add', function (event) {
    const detail = event.detail;
    if (!detail || typeof detail !== 'object') return;
    add(detail.id, detail.qty === undefined ? detail.quantity : detail.qty);
  });
})(window);
