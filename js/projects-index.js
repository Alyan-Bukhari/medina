// Native, accessible filtering shared by the company and Heights portfolios.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-folio]');
  if (!root) return;
  const cards = [...root.querySelectorAll('.folio-card')];
  const buttons = [...root.querySelectorAll('[data-filter]')];
  buttons.forEach(button => button.addEventListener('click', () => {
    const kind = button.dataset.filter;
    buttons.forEach(b => { b.classList.toggle('is-active', b === button); b.setAttribute('aria-pressed', String(b === button)); });
    cards.forEach(card => { card.hidden = kind !== 'all' && card.dataset.kind !== kind; });
  }));
});
