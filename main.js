/**
 * main.js — General site logic
 * Navigation, image slider, service filter, contact form validation
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  initFadeIn();
  initSlider();
  initServiceFilter();
  initContactForm();

  if (document.getElementById('three-container')) {
    import('./three-handler.js').then(({ initThreeScene }) => initThreeScene());
  }
});

/* --------------------------------------------------------------------------
   Navigation — mobile toggle & active page highlight
   -------------------------------------------------------------------------- */
function initNavigation() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');

  if (toggle && nav) {
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
  }

  const path = window.location.pathname;
  let currentPage = 'index.html';
  if (path.includes('services')) currentPage = 'services.html';
  else if (path.includes('contacts')) currentPage = 'contacts.html';

  document.querySelectorAll('.main-nav a').forEach((link) => {
    if (link.getAttribute('href') === currentPage) {
      link.classList.add('active');
    }
  });
}

/* --------------------------------------------------------------------------
   Fade-in — Intersection Observer for section animations
   -------------------------------------------------------------------------- */
function initFadeIn() {
  const elements = document.querySelectorAll('.fade-in');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach((el) => observer.observe(el));
}

/* --------------------------------------------------------------------------
   Image Slider — carousel with prev/next and dot navigation
   -------------------------------------------------------------------------- */
function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const track = slider.querySelector('.slider-track');
  const slides = slider.querySelectorAll('.slider-slide');
  const prevBtn = slider.querySelector('.slider-btn.prev');
  const nextBtn = slider.querySelector('.slider-btn.next');
  const dotsContainer = slider.parentElement.querySelector('.slider-dots');

  let currentIndex = 0;
  let autoplayTimer = null;
  const totalSlides = slides.length;

  // Build dot navigation
  slides.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => goToSlide(i));
    dotsContainer.appendChild(dot);
  });

  const dots = dotsContainer.querySelectorAll('button');

  function goToSlide(index) {
    currentIndex = (index + totalSlides) % totalSlides;
    track.style.transform = `translateX(-${currentIndex * 100}%)`;

    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentIndex);
    });
  }

  function nextSlide() {
    goToSlide(currentIndex + 1);
  }

  function prevSlide() {
    goToSlide(currentIndex - 1);
  }

  function startAutoplay() {
    stopAutoplay();
    autoplayTimer = setInterval(nextSlide, 5000);
  }

  function stopAutoplay() {
    if (autoplayTimer) {
      clearInterval(autoplayTimer);
      autoplayTimer = null;
    }
  }

  prevBtn.addEventListener('click', () => {
    prevSlide();
    startAutoplay();
  });

  nextBtn.addEventListener('click', () => {
    nextSlide();
    startAutoplay();
  });

  slider.addEventListener('mouseenter', stopAutoplay);
  slider.addEventListener('mouseleave', startAutoplay);

  // Touch swipe support
  let touchStartX = 0;
  slider.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
    stopAutoplay();
  }, { passive: true });

  slider.addEventListener('touchend', (e) => {
    const diff = touchStartX - e.changedTouches[0].screenX;
    if (Math.abs(diff) > 50) {
      diff > 0 ? nextSlide() : prevSlide();
    }
    startAutoplay();
  }, { passive: true });

  startAutoplay();
}

/* --------------------------------------------------------------------------
   Service Filter — category-based card filtering
   -------------------------------------------------------------------------- */
function initServiceFilter() {
  const filterBar = document.querySelector('.filter-bar');
  const cards = document.querySelectorAll('.service-card');
  if (!filterBar || !cards.length) return;

  const buttons = filterBar.querySelectorAll('.filter-btn');

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.filter;

      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');

      cards.forEach((card) => {
        const cardCategory = card.dataset.category;
        const shouldShow = category === 'all' || cardCategory === category;

        card.classList.add('fade-out');

        setTimeout(() => {
          card.classList.toggle('hidden', !shouldShow);
          card.classList.remove('fade-out');

          if (shouldShow) {
            card.style.animation = 'none';
            card.offsetHeight; // trigger reflow
            card.style.animation = '';
          }
        }, 200);
      });
    });
  });
}

/* --------------------------------------------------------------------------
   Contact Form — real-time validation & success toast
   -------------------------------------------------------------------------- */
function initContactForm() {
  const form = document.querySelector('.contact-form');
  if (!form) return;

  const fields = {
    name: {
      el: form.querySelector('#name'),
      error: form.querySelector('#name-error'),
      validate: (v) => {
        if (!v.trim()) return 'Name is required';
        if (v.trim().length < 2) return 'Name must be at least 2 characters';
        return '';
      },
    },
    email: {
      el: form.querySelector('#email'),
      error: form.querySelector('#email-error'),
      validate: (v) => {
        if (!v.trim()) return 'Email is required';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Please enter a valid email';
        return '';
      },
    },
    phone: {
      el: form.querySelector('#phone'),
      error: form.querySelector('#phone-error'),
      validate: (v) => {
        if (!v.trim()) return 'Phone number is required';
        const digits = v.replace(/\D/g, '');
        if (digits.length < 10 || digits.length > 15) {
          return 'Enter a valid phone number (10–15 digits)';
        }
        return '';
      },
    },
    message: {
      el: form.querySelector('#message'),
      error: form.querySelector('#message-error'),
      validate: (v) => {
        if (!v.trim()) return 'Message is required';
        if (v.trim().length < 10) return 'Message must be at least 10 characters';
        return '';
      },
    },
  };

  Object.values(fields).forEach(({ el, error, validate }) => {
    el.addEventListener('input', () => validateField(el, error, validate));
    el.addEventListener('blur', () => validateField(el, error, validate));
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    let isValid = true;
    Object.values(fields).forEach(({ el, error, validate }) => {
      if (!validateField(el, error, validate)) isValid = false;
    });

    if (isValid) {
      showToast();
      form.reset();
      Object.values(fields).forEach(({ el }) => {
        el.classList.remove('valid', 'invalid');
      });
    }
  });
}

function validateField(input, errorEl, validateFn) {
  const message = validateFn(input.value);
  const isValid = !message;

  input.classList.toggle('invalid', !isValid && input.value.length > 0);
  input.classList.toggle('valid', isValid && input.value.length > 0);

  errorEl.textContent = message;
  errorEl.classList.toggle('visible', !!message);

  return isValid;
}

function showToast() {
  let toast = document.querySelector('.toast');

  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <div class="toast-icon">✓</div>
      <div class="toast-content">
        <strong>Message Sent!</strong>
        <span>We'll get back to you within 24 hours.</span>
      </div>
    `;
    document.body.appendChild(toast);
  }

  requestAnimationFrame(() => toast.classList.add('show'));

  setTimeout(() => toast.classList.remove('show'), 4000);
}
