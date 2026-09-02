document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initTestimonialSlider();
  initContactForm();
  initServicePrefill();
});

function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('is-open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });

  const page = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('a[href]').forEach((link) => {
    const href = link.getAttribute('href').split('?')[0].split('#')[0];
    if (href === page || (page === '' && href === 'index.html')) {
      link.classList.add('is-active');
    }
  });
}

function initTestimonialSlider() {
  const root = document.querySelector('[data-testimonial-slider]');
  if (!root) return;

  const slides = [...root.querySelectorAll('.np-testimonial__slide')];
  const prev = root.querySelector('[data-testimonial-prev]');
  const next = root.querySelector('[data-testimonial-next]');
  const dotsWrap = root.querySelector('[data-testimonial-dots]');
  if (!slides.length) return;

  let index = 0;
  let timer;

  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
    dot.addEventListener('click', () => go(i));
    dotsWrap.appendChild(dot);
  });

  const dots = [...dotsWrap.querySelectorAll('button')];

  function go(i) {
    slides[index].classList.remove('is-active');
    dots[index]?.classList.remove('is-active');
    index = (i + slides.length) % slides.length;
    slides[index].classList.add('is-active');
    dots[index]?.classList.add('is-active');
  }

  function nextSlide() { go(index + 1); }
  function resetTimer() {
    clearInterval(timer);
    timer = setInterval(nextSlide, 6000);
  }

  prev?.addEventListener('click', () => { go(index - 1); resetTimer(); });
  next?.addEventListener('click', () => { go(index + 1); resetTimer(); });

  go(0);
  resetTimer();
}

function initServicePrefill() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  const messageEl = document.querySelector('#message');
  if (!service || !messageEl) return;

  const decoded = decodeURIComponent(service.replace(/\+/g, ' '));
  messageEl.value = `Интересует: ${decoded}. `;

  const formSection = document.getElementById('contact-form');
  if (formSection) {
    requestAnimationFrame(() => {
      formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      messageEl.focus();
    });
  }
}

function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const emailField = form.querySelector('#email');
  const fields = {
    name: {
      el: form.querySelector('#name'),
      error: form.querySelector('#name-error'),
      validate: (v) => (v.trim().length < 2 ? 'Введите имя' : ''),
    },
    message: {
      el: form.querySelector('#message'),
      error: form.querySelector('#message-error'),
      validate: (v) => (v.trim().length < 5 ? 'Напишите сообщение' : ''),
    },
  };

  if (emailField) {
    fields.email = {
      el: emailField,
      error: form.querySelector('#email-error'),
      validate: (v) => {
        if (!v.trim()) return 'Укажите email';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Некорректный email';
        return '';
      },
    };
  }

  const phoneEl = form.querySelector('#phone');
  if (phoneEl) {
    fields.phone = {
      el: phoneEl,
      error: form.querySelector('#phone-error'),
      validate: (v) => {
        const digits = v.replace(/\D/g, '');
        if (!digits) return 'Укажите телефон';
        if (digits.length < 10) return 'Некорректный номер';
        return '';
      },
    };
  }

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
  if (errorEl) {
    errorEl.textContent = msg;
    errorEl.classList.toggle('visible', !!msg);
  }
  return !msg;
}

function showToast(text) {
  let toast = document.querySelector('.toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'status');
    document.body.appendChild(toast);
  }
  toast.textContent = text;
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => toast.classList.remove('show'), 4200);
}
