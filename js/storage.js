const Storage = (() => {
  const KEYS = {
    PROFILE: 'gym_user_profile',
    GOAL: 'gym_fitness_goal',
    HISTORY: 'gym_weight_history',
    SETTINGS: 'gym_settings'
  };

  const DEFAULT_PROFILE = {
    age: 28,
    sex: 'male',
    height: 180,
    experience: 'intermediate',
    trainingDays: 4
  };

  const DEFAULT_GOAL = {
    type: 'lose',
    startWeight: 94.2,
    currentWeight: 94.2,
    targetWeight: 75.0
  };

  return {
    getProfile: () => JSON.parse(localStorage.getItem(KEYS.PROFILE)) || DEFAULT_PROFILE,
    setProfile: (data) => localStorage.setItem(KEYS.PROFILE, JSON.stringify(data)),
    
    getGoal: () => JSON.parse(localStorage.getItem(KEYS.GOAL)) || DEFAULT_GOAL,
    setGoal: (data) => localStorage.setItem(KEYS.GOAL, JSON.stringify(data)),

    getHistory: () => JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [],
    addWeightEntry: (weight) => {
      const history = JSON.parse(localStorage.getItem(KEYS.HISTORY)) || [];
      const entry = { date: new Date().toISOString().split('T')[0], weight: parseFloat(weight) };
      history.push(entry);
      localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
    },

    clearAll: () => localStorage.clear()
  };
})();
