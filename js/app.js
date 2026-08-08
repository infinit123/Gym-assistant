/**
 * Main Application Controller & Router
 */
const App = {
  init() {
    this.mainShell = document.getElementById('main-shell');
    this.onboardingContainer = document.getElementById('onboarding-container');

    const onboardingCompleted = Storage.get(STORAGE_KEYS.ONBOARDING_COMPLETED);

    if (!onboardingCompleted) {
      this.startOnboarding();
    } else {
      this.launchMainApp();
    }
  },

  startOnboarding() {
    this.mainShell.classList.add('hidden');
    this.onboardingContainer.classList.remove('hidden');

    Onboarding.init(this.onboardingContainer, () => {
      this.launchMainApp();
    });
  },

  launchMainApp() {
    this.onboardingContainer.classList.add('hidden');
    this.mainShell.classList.remove('hidden');
    this.mainShell.classList.add('motion-fade-in');

    this.setupNavigation();
    this.renderCurrentDate();

    if (window.Dashboard) {
      Dashboard.init();
    }
  },

  renderCurrentDate() {
    const dateEl = document.getElementById('current-date');
    if (dateEl) {
      const now = new Date();
      const options = { weekday: 'short', day: 'numeric', month: 'short' };
      dateEl.textContent = now.toLocaleDateString('en-US', options).toUpperCase();
    }
  },

  setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
        this.navigateTo(view);
      });
    });
  },

  navigateTo(view) {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (view === 'dashboard' && window.Dashboard) {
      Dashboard.init();
    } else if (view === 'profile' && window.Profile) {
      Profile.init();
    } else if (view === 'goals' && window.Goals) {
      Goals.init();
    } else if (view === 'workout' && window.Workout) {
      Workout.init();
    }
  },

  showResetConfirmationModal() {
    const modalContainer = document.getElementById('modal-container');
    modalContainer.innerHTML = `
      <div class="modal-overlay motion-fade-in">
        <div class="modal-card">
          <h3 class="modal-title">RESTART ONBOARDING?</h3>
          <p class="modal-desc">Your current fitness profile will be replaced with new selections.</p>
          <div class="modal-actions">
            <button id="btn-cancel-modal" class="btn-secondary">CANCEL</button>
            <button id="btn-confirm-reset" class="btn-primary" style="background: var(--danger, #ef4444); color: #fff;">RESTART</button>
          </div>
        </div>
      </div>
    `;
    modalContainer.classList.remove('hidden');

    document.getElementById('btn-cancel-modal').addEventListener('click', () => {
      modalContainer.classList.add('hidden');
      modalContainer.innerHTML = '';
    });

    document.getElementById('btn-confirm-reset').addEventListener('click', () => {
      modalContainer.classList.add('hidden');
      modalContainer.innerHTML = '';
      Storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, false);
      this.startOnboarding();
    });
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});