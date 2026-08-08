document.addEventListener('DOMContentLoaded', () => {
  // Navigation View Switching
  const navItems = document.querySelectorAll('.nav-item');
  const views = document.querySelectorAll('.view');

  const switchView = (targetId) => {
    views.forEach(view => {
      if (view.id === targetId) {
        view.classList.add('active');
        Motion.triggerStagger(view);
      } else {
        view.classList.remove('active');
      }
    });

    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.target === targetId);
    });
  };

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      switchView(item.dataset.target);
    });
  });

  // Settings Handlers
  document.getElementById('reset-data')?.addEventListener('click', () => {
    if (confirm('Sigur dorești să resetezi toate datele salvate local?')) {
      Storage.clearAll();
      location.reload();
    }
  });

  // Register PWA Service Worker
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js')
      .catch(err => console.log('SW registration failed:', err));
  }

  // Initializing Modules
  Motion.init();
  ProfileModule.init();
  GoalsModule.init();
  DashboardModule.render();
  Motion.triggerStagger(document.getElementById('view-dashboard'));
});
