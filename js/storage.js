const Storage = (() => {
  const KEYS = {
    PROFILE: 'gym_user_profile',
    GOAL: 'gym_fitness_goal',
    HISTORY: 'gym_weight_history',
    SETTINGS: 'gym_settings',
    ACTIVE_WORKOUT: 'gym_active_workout',
    WORKOUT_HISTORY: 'gym_workout_history'
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

    clearAll: () => localStorage.clear(),

    // --- WORKOUT ENGINE (V2) ------------------------------------------
    // Active (in-progress) workout session. null = no session running.
    getActiveWorkout: () => {
      try {
        return JSON.parse(localStorage.getItem(KEYS.ACTIVE_WORKOUT)) || null;
      } catch (e) {
        return null; // Corrupt data safety net (ETAPA 26)
      }
    },
    setActiveWorkout: (session) => localStorage.setItem(KEYS.ACTIVE_WORKOUT, JSON.stringify(session)),
    clearActiveWorkout: () => localStorage.removeItem(KEYS.ACTIVE_WORKOUT),

    // Completed workout history (foundation for V3 stats)
    getWorkoutHistory: () => {
      try {
        return JSON.parse(localStorage.getItem(KEYS.WORKOUT_HISTORY)) || [];
      } catch (e) {
        return [];
      }
    },
    addWorkoutHistoryEntry: (entry) => {
      const history = JSON.parse(localStorage.getItem(KEYS.WORKOUT_HISTORY)) || [];
      history.push(entry);
      localStorage.setItem(KEYS.WORKOUT_HISTORY, JSON.stringify(history));
    }
  };
})();
