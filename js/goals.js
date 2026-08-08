const GoalsModule = (() => {
  const form = document.getElementById('goal-form');

  const calculateProgress = (start, current, target) => {
    if (start === target) return 100;
    const totalDistance = Math.abs(start - target);
    const coveredDistance = Math.abs(start - current);
    
    // Safety boundaries
    let percentage = (coveredDistance / totalDistance) * 100;
    if (percentage < 0) percentage = 0;
    if (percentage > 100) percentage = 100;

    const remaining = Math.abs(current - target);
    return {
      percentage: Math.round(percentage),
      remaining: remaining.toFixed(1)
    };
  };

  const loadData = () => {
    const data = Storage.getGoal();
    document.getElementById('goal-type').value = data.type || 'lose';
    document.getElementById('goal-start-weight').value = data.startWeight || '';
    document.getElementById('goal-current-weight').value = data.currentWeight || '';
    document.getElementById('goal-target-weight').value = data.targetWeight || '';
  };

  const bindEvents = () => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const start = parseFloat(document.getElementById('goal-start-weight').value);
      const current = parseFloat(document.getElementById('goal-current-weight').value);
      const target = parseFloat(document.getElementById('goal-target-weight').value);

      const goalData = {
        type: document.getElementById('goal-type').value,
        startWeight: start,
        currentWeight: current,
        targetWeight: target
      };

      Storage.setGoal(goalData);
      Storage.addWeightEntry(current);
      DashboardModule.render();
      alert('Obiectiv actualizat!');
    });
  };

  return {
    init: () => { loadData(); bindEvents(); },
    calculateProgress,
    loadData
  };
})();
