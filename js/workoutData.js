/*
 * WorkoutData
 * -----------
 * Static seed data for V2: Exercise Library + Workout Plans.
 * This module owns no state and touches no storage — it is pure data
 * plus small lookup helpers, kept separate from WorkoutModule so the
 * plan/exercise catalog can grow independently later (V3).
 */
const WorkoutData = (() => {

  // ---- EXERCISE LIBRARY -------------------------------------------------
  const EXERCISES = [
    // CHEST
    { id: 'ex-bench-press',        name: 'Bench Press',           muscleGroup: 'Chest',     equipment: 'Barbell',   description: 'Flat barbell press for overall chest mass.',        defaultSets: 4, defaultReps: '8-10',  defaultRest: 120 },
    { id: 'ex-incline-db-press',   name: 'Incline Dumbbell Press', muscleGroup: 'Chest',     equipment: 'Dumbbell',  description: 'Upper chest emphasis pressing movement.',           defaultSets: 3, defaultReps: '10-12', defaultRest: 90 },
    { id: 'ex-cable-fly',          name: 'Cable Fly',              muscleGroup: 'Chest',     equipment: 'Cable',     description: 'Isolation movement for chest contraction.',         defaultSets: 3, defaultReps: '12-15', defaultRest: 60 },

    // BACK
    { id: 'ex-lat-pulldown',       name: 'Lat Pulldown',           muscleGroup: 'Back',      equipment: 'Machine',   description: 'Vertical pull for lat width.',                      defaultSets: 4, defaultReps: '8-10',  defaultRest: 90 },
    { id: 'ex-barbell-row',        name: 'Barbell Row',            muscleGroup: 'Back',      equipment: 'Barbell',   description: 'Horizontal pull for back thickness.',               defaultSets: 4, defaultReps: '8-10',  defaultRest: 120 },
    { id: 'ex-seated-cable-row',   name: 'Seated Cable Row',       muscleGroup: 'Back',      equipment: 'Cable',     description: 'Controlled horizontal pull, constant tension.',     defaultSets: 3, defaultReps: '10-12', defaultRest: 90 },

    // SHOULDERS
    { id: 'ex-shoulder-press',     name: 'Shoulder Press',         muscleGroup: 'Shoulders', equipment: 'Dumbbell',  description: 'Overhead press for deltoid mass.',                  defaultSets: 4, defaultReps: '8-10',  defaultRest: 90 },
    { id: 'ex-lateral-raise',      name: 'Lateral Raise',          muscleGroup: 'Shoulders', equipment: 'Dumbbell',  description: 'Isolation for side deltoid width.',                 defaultSets: 3, defaultReps: '12-15', defaultRest: 60 },

    // LEGS
    { id: 'ex-squat',              name: 'Squat',                  muscleGroup: 'Legs',      equipment: 'Barbell',   description: 'Compound movement for total leg development.',     defaultSets: 4, defaultReps: '6-8',   defaultRest: 150 },
    { id: 'ex-leg-press',          name: 'Leg Press',              muscleGroup: 'Legs',      equipment: 'Machine',   description: 'Quad-focused pressing movement.',                   defaultSets: 4, defaultReps: '10-12', defaultRest: 120 },
    { id: 'ex-leg-curl',           name: 'Leg Curl',               muscleGroup: 'Legs',      equipment: 'Machine',   description: 'Hamstring isolation movement.',                     defaultSets: 3, defaultReps: '10-12', defaultRest: 60 },
    { id: 'ex-leg-extension',      name: 'Leg Extension',          muscleGroup: 'Legs',      equipment: 'Machine',   description: 'Quad isolation movement.',                          defaultSets: 3, defaultReps: '12-15', defaultRest: 60 },

    // ARMS
    { id: 'ex-biceps-curl',        name: 'Biceps Curl',            muscleGroup: 'Arms',      equipment: 'Dumbbell',  description: 'Biceps isolation movement.',                        defaultSets: 3, defaultReps: '10-12', defaultRest: 60 },
    { id: 'ex-triceps-pushdown',   name: 'Triceps Pushdown',       muscleGroup: 'Arms',      equipment: 'Cable',     description: 'Triceps isolation movement.',                       defaultSets: 3, defaultReps: '10-12', defaultRest: 60 }
  ];

  const getExerciseById = (id) => EXERCISES.find(ex => ex.id === id) || null;

  // ---- WORKOUT PLANS ------------------------------------------------------
  // dayOfWeek: 0 = Sunday ... 6 = Saturday (matches Date.getDay())
  const WORKOUT_PLANS = [
    {
      id: 'plan-default',
      name: 'Default Split',
      days: [
        {
          id: 'day-upper-body',
          dayOfWeek: 1, // Monday
          name: 'Upper Body',
          exercises: [
            { exerciseId: 'ex-bench-press',      sets: 4, reps: '8-10',  rest: 120 },
            { exerciseId: 'ex-lat-pulldown',      sets: 4, reps: '8-10',  rest: 90 },
            { exerciseId: 'ex-shoulder-press',    sets: 3, reps: '8-10',  rest: 90 },
            { exerciseId: 'ex-barbell-row',       sets: 3, reps: '10-12', rest: 90 },
            { exerciseId: 'ex-biceps-curl',       sets: 3, reps: '10-12', rest: 60 }
          ]
        },
        {
          id: 'day-legs',
          dayOfWeek: 3, // Wednesday
          name: 'Legs',
          exercises: [
            { exerciseId: 'ex-squat',             sets: 4, reps: '6-8',   rest: 150 },
            { exerciseId: 'ex-leg-press',         sets: 4, reps: '10-12', rest: 120 },
            { exerciseId: 'ex-leg-curl',          sets: 3, reps: '10-12', rest: 60 },
            { exerciseId: 'ex-leg-extension',     sets: 3, reps: '12-15', rest: 60 }
          ]
        },
        {
          id: 'day-push-pull',
          dayOfWeek: 5, // Friday
          name: 'Push / Pull',
          exercises: [
            { exerciseId: 'ex-incline-db-press',  sets: 3, reps: '10-12', rest: 90 },
            { exerciseId: 'ex-cable-fly',         sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex-seated-cable-row',  sets: 3, reps: '10-12', rest: 90 },
            { exerciseId: 'ex-lateral-raise',     sets: 3, reps: '12-15', rest: 60 },
            { exerciseId: 'ex-triceps-pushdown',  sets: 3, reps: '10-12', rest: 60 }
          ]
        }
      ]
    }
  ];

  // Resolve a plan day into a fully expanded workout (exercise details merged in)
  const buildWorkoutFromDay = (planId, day) => {
    const exercises = day.exercises
      .map(item => {
        const meta = getExerciseById(item.exerciseId);
        if (!meta) return null; // ETAPA 26: skip invalid exercise references safely
        return {
          exerciseId: item.exerciseId,
          name: meta.name,
          muscleGroup: meta.muscleGroup,
          equipment: meta.equipment,
          sets: Number.isFinite(item.sets) && item.sets > 0 ? item.sets : meta.defaultSets,
          reps: item.reps || meta.defaultReps,
          rest: Number.isFinite(item.rest) && item.rest >= 0 ? item.rest : meta.defaultRest
        };
      })
      .filter(Boolean);

    // Rough duration estimate: (sets * ~40s work) + (sets * rest), summed per exercise
    const estimatedSeconds = exercises.reduce((total, ex) => {
      return total + (ex.sets * 40) + (ex.sets * ex.rest);
    }, 0);

    return {
      planId,
      dayId: day.id,
      name: day.name,
      exercises,
      exerciseCount: exercises.length,
      estimatedMinutes: Math.max(1, Math.round(estimatedSeconds / 60))
    };
  };

  // Get today's workout (or null = rest day) for the given plan (defaults to first plan)
  const getTodaysWorkout = (planId) => {
    const plan = WORKOUT_PLANS.find(p => p.id === planId) || WORKOUT_PLANS[0];
    if (!plan) return null;
    const todayDow = new Date().getDay();
    const day = plan.days.find(d => d.dayOfWeek === todayDow);
    if (!day) return null; // Rest day
    return buildWorkoutFromDay(plan.id, day);
  };

  const getWorkoutByDayId = (planId, dayId) => {
    const plan = WORKOUT_PLANS.find(p => p.id === planId) || WORKOUT_PLANS[0];
    if (!plan) return null;
    const day = plan.days.find(d => d.id === dayId);
    if (!day) return null;
    return buildWorkoutFromDay(plan.id, day);
  };

  return {
    EXERCISES,
    WORKOUT_PLANS,
    getExerciseById,
    getTodaysWorkout,
    getWorkoutByDayId
  };
})();
