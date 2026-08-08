const DashboardModule = (() => {
  const render = () => {
    const goal = Storage.getGoal();
    const stats = GoalsModule.calculateProgress(goal.startWeight, goal.currentWeight, goal.targetWeight);

    document.getElementById('dash-target-weight').innerHTML = `${goal.targetWeight} <span class="metric-unit">KG</span>`;
    document.getElementById('dash-current-weight').textContent = `${goal.currentWeight} KG`;
    document.getElementById('dash-remaining-weight').textContent = `${stats.remaining} KG TO GO`;
    document.getElementById('dash-progress-pct').textContent = `${stats.percentage}% COMPLETE`;
    
    // Animate progress bar fill
    setTimeout(() => {
      document.getElementById('dash-progress-fill').style.width = `${stats.percentage}%`;
    }, 100);
  };

  return { render };
})();
