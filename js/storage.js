/**
 * Local Storage Persistence Module
 */
const STORAGE_KEYS = {
  USER_PROFILE: 'ga_user_profile',
  GOALS: 'ga_goals',
  WORKOUT_HISTORY: 'ga_workout_history',
  SETTINGS: 'ga_settings',
  ONBOARDING_COMPLETED: 'ga_onboarding_completed'
};

const Storage = {
  init() {
    if (localStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED) === null) {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, JSON.stringify(false));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USER_PROFILE)) {
      const defaultProfile = {
        age: 25,
        sex: 'MALE',
        height: 175,
        currentWeight: 75,
        experienceLevel: 'BEGINNER',
        primaryGoal: 'BUILD_MUSCLE',
        targetWeight: 75,
        trainingDaysPerWeek: 4,
        preferredWorkoutDuration: '60 MIN',
        equipment: 'FULL_GYM',
        trainingPreference: 'UPPER_LOWER',
        availableTrainingDays: ['MON', 'TUE', 'THU', 'FRI'],
        trainingStyle: 'MIXED',
        exercisePreference: 'BALANCED'
      };
      this.set(STORAGE_KEYS.USER_PROFILE, defaultProfile);
    }
  },

  get(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error(`Error reading ${key} from localStorage`, e);
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Error writing ${key} to localStorage`, e);
    }
  },

  clearAll() {
    localStorage.clear();
  }
};

Storage.init();