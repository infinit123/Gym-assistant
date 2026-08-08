/**
 * Profile Controller with Reset Onboarding Integration
 */
const Profile = {
  init() {
    const mainContent = document.getElementById('main-content');
    const profile = Storage.get(STORAGE_KEYS.USER_PROFILE) || {};

    mainContent.innerHTML = `
      <div class="profile-view motion-fade-in" style="padding: 20px;">
        <h2 style="font-size: 1.5rem; font-weight: 800; margin-bottom: 20px;">ATHLETE PROFILE</h2>
        
        <div style="background-color: var(--bg-card, #111827); border-radius: 12px; padding: 16px; margin-bottom: 20px; border: 1px solid rgba(255,255,255,0.08);">
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--text-muted);">EXPERIENCE:</span>
            <span style="font-weight: 700; color: var(--primary);">${profile.experienceLevel || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--text-muted);">PRIMARY GOAL:</span>
            <span style="font-weight: 700;">${profile.primaryGoal || 'N/A'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
            <span style="color: var(--text-muted);">FREQUENCY:</span>
            <span style="font-weight: 700;">${profile.trainingDaysPerWeek || 0} DAYS / WEEK</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span style="color: var(--text-muted);">EQUIPMENT:</span>
            <span style="font-weight: 700;">${profile.equipment || 'N/A'}</span>
          </div>
        </div>

        <button id="btn-reset-profile" class="btn-secondary" style="width: 100%; border-color: rgba(239,68,68,0.3); color: #f87171;">
          RESTART ONBOARDING
        </button>
      </div>
    `;

    document.getElementById('btn-reset-profile').addEventListener('click', () => {
      if (window.App) {
        App.showResetConfirmationModal();
      }
    });
  }
};