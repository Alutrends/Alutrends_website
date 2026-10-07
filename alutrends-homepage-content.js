/* Homepage content interactions. Text and links remain native HTML. */
(function () {
  'use strict';
  const form = document.getElementById('project-enquiry-form');
  if (!form) return;
  const status = document.getElementById('project-enquiry-status');
  const fields = form.elements;
  const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  function clearDraft() { status.hidden = true; status.replaceChildren(); }

  function navigate(target, focus) {
    history.replaceState(null, '', '#' + target.id);
    target.scrollIntoView({behavior: motion.matches ? 'auto' : 'smooth', block: 'start'});
    if (focus) focus.focus({preventScroll: true});
    else {
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({preventScroll: true});
    }
  }

  const enquiries = {
    windows: ['Need help choosing', 'I would like to discuss aluminium system windows and doors.'],
    sliding: ['Sliding windows and doors', 'I would like to discuss a sliding opening for my space.'],
    casement: ['Casement windows and doors', 'I would like to discuss a casement opening for my space.'],
    finishes: ['Railing hardware', 'I would like to discuss railing finishes and a physical sample.'],
    bulk: ['Multiple products', 'I would like a product-wise bulk quotation.'],
    materials: ['Multiple products', 'I would like to share my material list and discuss quantities and finishes.'],
    specifications: ['Railing hardware', 'Please share the available product drawings and specifications for my requirement.'],
    location: ['Need help choosing', 'Please confirm delivery availability and freight for my location.'],
    project: ['Need help choosing', 'I would like to discuss my project with ALUTRENDS.'],
    help: ['Need help choosing', 'Please help me choose products for my requirement.']
  };

  document.addEventListener('click', function (event) {
    if (!(event.target instanceof Element)) return;
    const control = event.target.closest('[data-product-group], [data-finish], [data-enquiry]');
    if (!control) return;
    if (control.hasAttribute('data-product-group')) {
      if (!window.AlutrendsProducts) return;
      event.preventDefault();
      window.AlutrendsProducts.filter(control.dataset.productGroup);
      if (control.tagName === 'A') navigate(document.getElementById('products'));
    } else if (control.hasAttribute('data-finish')) {
      const target = document.getElementById('finish-' + control.dataset.finish);
      if (!target) return;
      document.querySelectorAll('.finish-photo').forEach(photo => { photo.hidden = photo !== target; });
      document.querySelectorAll('.finish-option').forEach(button => {
        button.setAttribute('aria-pressed', String(button === control));
      });
      document.getElementById('selected-finish').textContent = control.dataset.finishName;
    } else if (control.hasAttribute('data-enquiry')) {
      const enquiry = enquiries[control.dataset.enquiry];
      if (!enquiry) return;
      event.preventDefault();
      clearDraft();
      fields.namedItem('requirement').value = enquiry[0];
      if (!fields.namedItem('message').value.trim()) fields.namedItem('message').value = enquiry[1];
      if (control.dataset.enquiry === 'finishes') {
        const selected = document.querySelector('.finish-option[aria-pressed="true"]');
        if (selected) fields.namedItem('finish').value = selected.dataset.finishName;
      }
      navigate(document.getElementById(control.hash.slice(1)) || form, fields.namedItem('requirement'));
    }
  });

  Array.from(fields).forEach(field => {
    if (typeof field.setCustomValidity === 'function') {
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        clearDraft();
      });
    }
  });
  form.addEventListener('reset', clearDraft);

  form.addEventListener('submit', function (event) {
    event.preventDefault();
    const data = {};
    ['name','phone','buyer','requirement','city','pincode','quantity','finish','company','email','message'].forEach(name => {
      data[name] = fields.namedItem(name).value.trim();
    });
    for (const name of ['name','city']) {
      fields.namedItem(name).setCustomValidity(data[name].length < 2 ? 'Please enter your ' + name + '.' : '');
    }
    fields.namedItem('phone').setCustomValidity(/^(?:\+91(?: |-)?)?[6-9][0-9]{9}$/.test(data.phone) ? '' : 'Enter a 10-digit Indian mobile number, optionally preceded by +91.');
    fields.namedItem('email').setCustomValidity(!data.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email) ? '' : 'Please enter a valid email address.');
    if (!form.reportValidity()) return;
    const rows = [
      'ALUTRENDS project enquiry',
      'Name: ' + data.name,
      'Mobile: ' + data.phone,
      'Buyer type: ' + data.buyer,
      'Requirement: ' + data.requirement,
      'Location: ' + data.city + ' — ' + data.pincode,
      'Preferred finish: ' + data.finish
    ];
    if (data.quantity) rows.push('Quantity / opening sizes: ' + data.quantity);
    if (data.company) rows.push('Company: ' + data.company);
    if (data.email) rows.push('Email: ' + data.email);
    if (data.message) rows.push('Message: ' + data.message);
    const url = 'https://wa.me/919306566096?text=' + encodeURIComponent(rows.join('\n'));
    // A draft and fallback link, never a claim that a message was delivered.
    const note = document.createElement('p');
    note.textContent = 'Your WhatsApp draft is ready. Review your details and press Send in WhatsApp to deliver your enquiry.';
    const link = document.createElement('a');
    link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer';
    link.textContent = 'Open my WhatsApp draft';
    status.replaceChildren(note, link); status.hidden = false;
    window.open(url, '_blank', 'noopener,noreferrer');
  });
  // Enable only after the draft handler is ready; there is no native GET submission.
  form.querySelector('button[type="submit"]').disabled = false;

  // Every section remains readable before enhancement and with scripts disabled.
  if ('IntersectionObserver' in window && !motion.matches) {
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('has-entered');
          observer.unobserve(entry.target);
        }
      }
    }, {threshold: .08});
    document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));
  }
})();
