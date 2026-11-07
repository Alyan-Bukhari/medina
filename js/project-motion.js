// Progressive enhancement: content remains readable without scripts or motion.
(() => {
  const media = matchMedia('(prefers-reduced-motion: reduce)');
  const cards = document.querySelectorAll('.folio-card, .project-detail .gallery-item');
  let observer;
  function setup() {
    observer?.disconnect();
    cards.forEach(card => card.classList.remove('motion-ready'));
    if (media.matches || !('IntersectionObserver' in window)) return;
    observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('motion-visible');
      observer.unobserve(entry.target);
    }), {threshold:0.08});
    cards.forEach((card,i) => {
      card.style.setProperty('--reveal-delay', `${(i % 3) * 55}ms`);
      card.classList.add('motion-ready');
      observer.observe(card);
    });
  }
  setup();
  media.addEventListener('change',setup);
  // A hash link focuses the destination rather than leaving keyboard users in navigation.
})();
