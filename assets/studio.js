document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeaderScroll();
  initReveal();
  initContactForm();
});

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    nav.classList.toggle('open');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      nav.classList.remove('open');
    });
  });

  const page = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === page) link.classList.add('is-active');
  });
}

function initHeaderScroll() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initReveal() {
  const items = document.querySelectorAll('.reveal');
  if (!items.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
  );

  items.forEach((el) => observer.observe(el));
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = {
    name: {
      el: form.querySelector('#name'),
      error: form.querySelector('#name-error'),
      validate: (v) => (v.trim().length < 2 ? 'Введите имя (минимум 2 символа)' : ''),
    },
    phone: {
      el: form.querySelector('#phone'),
      error: form.querySelector('#phone-error'),
      validate: (v) => {
        const digits = v.replace(/\D/g, '');
        if (!digits) return 'Укажите номер телефона';
        if (digits.length < 10) return 'Некорректный номер';
        return '';
      },
    },
    message: {
      el: form.querySelector('#message'),
      error: form.querySelector('#message-error'),
      validate: (v) => (v.trim().length < 5 ? 'Напишите сообщение' : ''),
    },
  };

  Object.values(fields).forEach(({ el, error, validate }) => {
    el.addEventListener('blur', () => setField(el, error, validate));
    el.addEventListener('input', () => setField(el, error, validate));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    let ok = true;
    Object.values(fields).forEach(({ el, error, validate }) => {
      if (!setField(el, error, validate)) ok = false;
    });
    if (!ok) return;
    showToast('Заявка отправлена. Мы свяжемся с вами в ближайшее время.');
    form.reset();
    Object.values(fields).forEach(({ el }) => el.classList.remove('invalid'));
  });
}

function setField(el, errorEl, validate) {
  const msg = validate(el.value);
  el.classList.toggle('invalid', !!msg && el.value.length > 0);
  errorEl.textContent = msg;
  errorEl.classList.toggle('visible', !!msg);
  return !msg;
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 4000);
}
