(() => {
  const header = document.querySelector('[data-header]');
  const nav = document.getElementById('main-nav');
  const toggle = document.querySelector('[data-nav-toggle]');

  /* Header background on scroll */
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 24);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* Mobile menu */
  const setMenu = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
    header.classList.toggle('is-open', open);
  };
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  /* Active nav link */
  const links = [...nav.querySelectorAll('ul a[href^="#"]')];
  const sections = [...document.querySelectorAll('main > section[id]')];
  /* the six service sections all count as "Services" */
  const linkFor = (s) => '#' + (s.classList.contains('feature') ? 'services' : s.id);
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === linkFor(entry.target)));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }

  const form = document.querySelector('[data-contact-form]');

  /* Contact form → emailed to the business through FormSubmit (formsubmit.co).
     If that can't be reached, it falls back to opening the visitor's email app. */
  const ENQUIRY_EMAIL = 'info.greenecotec@gmail.com';
  const note = form.querySelector('[data-form-note]');
  const submitBtn = form.querySelector('button[type="submit"]');
  const setNote = (text, state) => {
    note.textContent = text;
    note.classList.toggle('is-error', state === 'error');
    note.classList.toggle('is-success', state === 'success');
  };
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get('name') || '').trim();
    const email = (data.get('email') || '').trim();
    const nameInput = form.elements.name;
    const emailInput = form.elements.email;
    nameInput.setAttribute('aria-invalid', String(!name));
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    emailInput.setAttribute('aria-invalid', String(!emailOk));
    if (!name || !emailOk) {
      setNote('Please add your name and a valid email address.', 'error');
      (!name ? nameInput : emailInput).focus();
      return;
    }
    const thanks = 'Thanks — your enquiry has been sent. We’ll get back to you.';
    /* hidden field real visitors never fill in: quietly drop anything that does */
    if (data.get('_honey')) { form.reset(); setNote(thanks, 'success'); return; }

    const services = data.getAll('service');
    const phone = (data.get('phone') || '').trim();
    const postcode = (data.get('postcode') || '').trim();
    const message = (data.get('message') || '').trim();
    const subject = `Quote enquiry${services.length ? ' – ' + services.join(', ') : ''}`;

    submitBtn.disabled = true;
    setNote('Sending…');
    let sent = false;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 12000);
      const res = await fetch(`https://formsubmit.co/ajax/${ENQUIRY_EMAIL}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          _subject: subject,
          _template: 'table',
          _replyto: email,
          name,
          email,
          phone: phone || '-',
          postcode: postcode || '-',
          interested_in: services.length ? services.join(', ') : '-',
          message: message || '-'
        }),
        signal: ctrl.signal
      });
      clearTimeout(timer);
      const out = await res.json().catch(() => ({}));
      sent = res.ok && String(out.success) === 'true';
    } catch (err) {
      sent = false;
    }
    submitBtn.disabled = false;

    if (sent) {
      form.reset();
      nameInput.removeAttribute('aria-invalid');
      emailInput.removeAttribute('aria-invalid');
      setNote(thanks, 'success');
      return;
    }

    /* Fallback: open the visitor's email app with everything filled in */
    setNote('We couldn’t send that automatically, so we’re opening your email app with your details filled in.', 'error');
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${phone || '-'}`,
      `Postcode: ${postcode || '-'}`,
      `Interested in: ${services.length ? services.join(', ') : '-'}`,
      '',
      message
    ].join('\n');
    window.location.href = `mailto:${ENQUIRY_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });

  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
})();
