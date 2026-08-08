const Motion = (() => {
  const triggerStagger = (container) => {
    const items = container.querySelectorAll('.stagger-item');
    items.forEach((item, index) => {
      item.classList.remove('animate-in');
      item.style.animationDelay = `${index * 50}ms`;
      // Force Reflow
      void item.offsetWidth;
      item.classList.add('animate-in');
    });
  };

  return {
    init: () => {
      // Touch Feedback handling handled via CSS data-motion="press"
    },
    triggerStagger
  };
})();
