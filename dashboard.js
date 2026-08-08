/**
 * Original Dashboard Controller (Restored & Verified)
 */
const Dashboard = {
  init() {
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    const profile = Storage.get(STORAGE_KEYS.USER_PROFILE) || {};
    const workoutHistory = Storage.get(STORAGE_KEYS.WORKOUT_HISTORY) || [];

    const totalWorkouts = workoutHistory.length;
    const goalName = profile.primaryGoal ? profile.primaryGoal.replace('_', ' ') : 'BUILD MUSCLE';

    mainContent.innerHTML = `
      <div class="dashboard-view motion-fade-in">
        
        <!-- WELCOME BANNER CARD -->
        <div class="dash-card welcome-card" style="background: linear-gradient(135deg, rgba(16,185,129,0.15), rgba(17,24,39,0.8)); border: 1px solid rgba(16,185,129,0.3); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
          <div style="font-size: 0.75rem; font-weight: 700; color: var(--primary); letter-spacing: 0.1em; text-transform: uppercase;">READY TO TRAIN</div>
          <h2 style="font-size: 1.5rem; font-weight: 800; color: #fff; margin: 4px 0 8px 0;">ATHLETE DASHBOARD</h2>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin: 0;">Goal: <strong style="color: #fff;">${goalName}</strong> | Target: <strong style="color: #fff;">${profile.trainingDaysPerWeek || 4} Days/Wk</strong></p>
        </div>

        <!-- STATS GRID -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
          <div class="dash-card" style="background-color: var(--bg-card, #111827); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">WORKOUTS</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: #fff; margin-top: 4px;">${totalWorkouts}</div>
          </div>
          <div class="dash-card" style="background-color: var(--bg-card, #111827); border: 1px solid rgba(255,255,255,0.08); border-radius: 14px; padding: 16px;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">CURRENT WEIGHT</div>
            <div style="font-size: 1.8rem; font-weight: 800; color: var(--primary); margin-top: 4px;">${profile.currentWeight || 75} <span style="font-size: 0.9rem;">KG</span></div>
          </div>
        </div>

        <!-- QUICK START WORKOUT CARD -->
        <div class="dash-card" style="background-color: var(--bg-card, #111827); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px; margin-bottom: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <div>
              <h3 style="font-size: 1.1rem; font-weight: 800; color: #fff; margin: 0;">NEXT SESSION</h3>
              <div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 2px;">${profile.trainingPreference || 'UPPER / LOWER'}</div>
            </div>
            <span style="font-size: 1.5rem;">🏋️</span>
          </div>
          <button id="btn-dash-start-workout" class="btn-primary" style="width: 100%;">START WORKOUT</button>
        </div>

        <!-- RECENT ACTIVITY CARD -->
        <div class="dash-card" style="background-color: var(--bg-card, #111827); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 20px;">
          <h3 style="font-size: 1rem; font-weight: 800; color: #fff; margin-bottom: 12px;">RECENT ACTIVITY</h3>
          ${workoutHistory.length === 0 ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); text-align: center; padding: 12px 0;">No completed workouts yet. Start your first session today!</div>
          ` : `
            <div style="display: flex; flex-direction: column; gap: 8px;">
              ${workoutHistory.slice(-3).reverse().map(h => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px; background: rgba(255,255,255,0.03); border-radius: 8px;">
                  <span style="font-weight: 600; font-size: 0.85rem; color: #fff;">${h.name || 'Workout Session'}</span>
                  <span style="font-size: 0.75rem; color: var(--primary);">${h.date || 'Recent'}</span>
                </div>
              `).join('')}
            </div>
          `}
        </div>

      </div>
    `;

    document.getElementById('btn-dash-start-workout').addEventListener('click', () => {
      const workoutNav = document.querySelector('.nav-item[data-view="workout"]');
      if (workoutNav) workoutNav.click();
    });
  }
};
