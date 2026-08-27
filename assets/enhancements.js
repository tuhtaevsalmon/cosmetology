/* ==========================================================================
   Lumière Beauty Clinic — Design Enhancements (progressive, non-breaking)
   Loaded after main-*.js. Only adds behaviour for elements that exist on
   the current page, so it is safe to include on every page.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initHeaderScrollState();
  initBackToTop();
  initBeforeAfter();
  initFaqAccordion();
});

function initHeaderScrollState() {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const update = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  update();
  window.addEventListener('scroll', update, { passive: true });
}

function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;
  const update = () => btn.classList.toggle('visible', window.scrollY > 500);
  update();
  window.addEventListener('scroll', update, { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

function initBeforeAfter() {
  document.querySelectorAll('[data-ba]').forEach((el) => {
    const range = el.querySelector('.ba-range');
    if (!range) return;
    const update = () => el.style.setProperty('--ba-pos', `${range.value}%`);
    range.addEventListener('input', update);
    update();
  });
}

function initFaqAccordion() {
  const items = document.querySelectorAll('.faq-item');
  if (!items.length) return;

  items.forEach((item) => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      items.forEach((other) => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          other.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          other.querySelector('.faq-answer').style.maxHeight = '';
        }
      });

      item.classList.toggle('open', !isOpen);
      question.setAttribute('aria-expanded', String(!isOpen));
      answer.style.maxHeight = isOpen ? '' : `${answer.scrollHeight}px`;
    });
  });
}
