/*
 * WorkoutModule
 * -------------
 * Implements the V2 Workout Engine on top of the existing V1 architecture.
 * Reuses: Storage (persistence pattern), Motion.triggerStagger (entrances),
 * data-motion="press" (button feedback), .hud-card / .btn-hud / .progress-bar-fill
 * (visual language). Introduces one new reusable piece: a modal, since V1 had
 * none to extend.
 *
 * Sub-views live inside #view-workout and are swapped with the same
 * show/hide + stagger technique app.js already uses for top-level views.
 */
const WorkoutModule = (() => {

  const SUBVIEW_IDS = ['wk-subview-today', 'wk-subview-detail', 'wk-subview-active', 'wk-subview-complete'];

  // In-memory mirror of the active session for fast timer ticking.
  // Storage.getActiveWorkout()/setActiveWorkout() remains the source of truth
  // for persistence/resume; this is just a working copy while a session runs.
  let session = null;
  let restTickHandle = null;
  let pendingCloseAction = null; // set when the END WORKOUT modal is open

  // ---------------------------------------------------------------------
  // Sub-view switching (mirrors app.js switchView, scoped to #view-workout)
  // ---------------------------------------------------------------------
  const showSubview = (id) => {
    SUBVIEW_IDS.forEach(subId => {
      const el = document.getElementById(subId);
      if (!el) return;
      if (subId === id) {
        el.classList.add('active');
        Motion.triggerStagger(el);
      } else {
        el.classList.remove('active');
      }
    });
  };

  // ---------------------------------------------------------------------
  // TODAY / REST DAY CARD (dashboard of the Workout section)
  // ---------------------------------------------------------------------
  const renderTodayCard = () => {
    const card = document.getElementById('wk-today-card');
    const resumeBanner = document.getElementById('wk-resume-banner');
    const existingSession = Storage.getActiveWorkout();

    if (existingSession) {
      resumeBanner.classList.remove('hidden');
      document.getElementById('wk-resume-name').textContent = existingSession.name.toUpperCase();
    } else {
      resumeBanner.classList.add('hidden');
    }

    const todaysWorkout = WorkoutData.getTodaysWorkout();

    if (!todaysWorkout) {
      card.innerHTML = `
        <div class="title-hud">TODAY'S WORKOUT</div>
        <h3 style="margin: 8px 0;">REST DAY</h3>
        <p style="font-size: 0.85rem; color: var(--text-secondary);">No scheduled session today. Recovery is part of the program.</p>
      `;
      return;
    }

    card.innerHTML = `
      <div class="title-hud">TODAY'S WORKOUT</div>
      <h3 style="margin: 8px 0;">${todaysWorkout.name.toUpperCase()}</h3>
      <p style="font-size: 0.85rem; color: var(--text-secondary); margin-bottom: 16px;">
        ${todaysWorkout.exerciseCount} EXERCISES • ~${todaysWorkout.estimatedMinutes} MIN
      </p>
      <button class="btn-hud" data-motion="press" id="wk-start-today-btn">START WORKOUT</button>
    `;

    document.getElementById('wk-start-today-btn')?.addEventListener('click', () => {
      openDetail(todaysWorkout);
    });
  };

  // ---------------------------------------------------------------------
  // WORKOUT DETAIL (ETAPA 6)
  // ---------------------------------------------------------------------
  let currentDetailWorkout = null;

  const openDetail = (workout) => {
    currentDetailWorkout = workout;

    document.getElementById('wk-detail-title').textContent = workout.name.toUpperCase();
    document.getElementById('wk-detail-meta').textContent =
      `${workout.exerciseCount} EXERCISES • ~${workout.estimatedMinutes} MIN`;

    const list = document.getElementById('wk-detail-exercise-list');
    list.innerHTML = workout.exercises.map((ex, idx) => `
      <div class="hud-card stagger-item wk-exercise-row">
        <div class="wk-exercise-index">${String(idx + 1).padStart(2, '0')}</div>
        <div class="wk-exercise-info">
          <h3 style="margin: 0 0 4px 0;">${ex.name.toUpperCase()}</h3>
          <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 8px;">
            ${ex.muscleGroup} • ${ex.equipment}
          </p>
          <div class="metric-row" style="margin-top: 0;">
            <span class="metric-value" style="font-size: 1.3rem;">${ex.sets} × ${ex.reps}</span>
            <span style="text-align:right;">
              <span class="metric-unit">REST</span>
              <div style="font-weight:700;">${ex.rest} SEC</div>
            </span>
          </div>
        </div>
      </div>
    `).join('');

    showSubview('wk-subview-detail');
  };

  // ---------------------------------------------------------------------
  // START WORKOUT (ETAPA 7) → builds a fresh session object
  // ---------------------------------------------------------------------
  const buildFreshSession = (workout) => ({
    planId: workout.planId,
    dayId: workout.dayId,
    name: workout.name,
    startedAt: new Date().toISOString(),
    currentExerciseIndex: 0,
    exercises: workout.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      name: ex.name,
      muscleGroup: ex.muscleGroup,
      equipment: ex.equipment,
      sets: ex.sets,
      reps: ex.reps,
      rest: ex.rest,
      completedSets: 0
    })),
    resting: false,
    restEndsAt: null // real timestamp (ms since epoch), not a naive counter (ETAPA 10)
  });

  const startWorkout = (workout) => {
    session = buildFreshSession(workout);
    Storage.setActiveWorkout(session);
    renderActiveSession();
    showSubview('wk-subview-active');
  };

  const resumeWorkout = () => {
    const saved = Storage.getActiveWorkout();
    if (!saved) return;
    session = saved;
    renderActiveSession();
    showSubview('wk-subview-active');
  };

  // ---------------------------------------------------------------------
  // ACTIVE WORKOUT RENDERING (ETAPA 8, 12)
  // ---------------------------------------------------------------------
  const renderActiveSession = () => {
    if (!session) return;
    const ex = session.exercises[session.currentExerciseIndex];
    if (!ex) return; // safety (ETAPA 26)

    document.getElementById('wk-active-workout-name').textContent = session.name.toUpperCase();
    document.getElementById('wk-active-exercise-counter').textContent =
      `EXERCISE ${session.currentExerciseIndex + 1} / ${session.exercises.length}`;
    document.getElementById('wk-active-exercise-name').textContent = ex.name.toUpperCase();
    document.getElementById('wk-active-sets-reps').textContent = `${ex.sets} SETS • ${ex.reps} REPS`;

    // Set dots
    const dotsContainer = document.getElementById('wk-set-dots');
    dotsContainer.innerHTML = '';
    for (let i = 0; i < ex.sets; i++) {
      const dot = document.createElement('button');
      dot.className = 'wk-set-dot' + (i < ex.completedSets ? ' completed' : '');
      dot.dataset.motion = 'press';
      dot.setAttribute('aria-label', `Set ${i + 1}`);
      dot.innerHTML = `<span class="wk-set-dot-label">SET ${i + 1}</span><span class="wk-set-dot-mark">${i < ex.completedSets ? '✓' : '○'}</span>`;
      dotsContainer.appendChild(dot);
    }

    // Progress bar across the whole workout (completed sets / total sets)
    const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0);
    const doneSets = session.exercises.reduce((sum, e) => sum + e.completedSets, 0);
    const pct = totalSets > 0 ? Math.round((doneSets / totalSets) * 100) : 0;
    setTimeout(() => {
      const fill = document.getElementById('wk-active-progress-fill');
      if (fill) fill.style.width = `${pct}%`;
    }, 50);

    // Complete Set button state
    const completeBtn = document.getElementById('wk-complete-set-btn');
    const allSetsDone = ex.completedSets >= ex.sets;
    const isLastExercise = session.currentExerciseIndex >= session.exercises.length - 1;

    if (allSetsDone) {
      completeBtn.textContent = isLastExercise ? 'FINISH WORKOUT' : 'NEXT EXERCISE';
      completeBtn.dataset.action = isLastExercise ? 'finish' : 'next';
    } else {
      completeBtn.textContent = 'COMPLETE SET';
      completeBtn.dataset.action = 'complete-set';
    }

    renderRestState();
  };

  // ---------------------------------------------------------------------
  // SET COMPLETION (ETAPA 9)
  // ---------------------------------------------------------------------
  const completeSet = () => {
    const ex = session.exercises[session.currentExerciseIndex];
    if (!ex || ex.completedSets >= ex.sets) return;

    ex.completedSets += 1;
    persistSession();

    // Micro-animation on the most recently completed dot
    const dotsContainer = document.getElementById('wk-set-dots');
    const dots = dotsContainer.querySelectorAll('.wk-set-dot');
    const lastDot = dots[ex.completedSets - 1];
    if (lastDot) {
      lastDot.classList.add('completed', 'wk-set-pulse');
      lastDot.querySelector('.wk-set-dot-mark').textContent = '✓';
      setTimeout(() => lastDot.classList.remove('wk-set-pulse'), 400);
    }

    // Start rest timer if there's rest time and more sets remain, or player just
    // wants rest before moving on — rest also applies after final set of the exercise.
    if (ex.rest > 0) {
      startRestTimer(ex.rest);
    }

    renderActiveSession();
  };

  // ---------------------------------------------------------------------
  // REST TIMER (ETAPA 10) — timestamp-based, survives app suspend/resume
  // ---------------------------------------------------------------------
  const startRestTimer = (seconds) => {
    session.resting = true;
    session.restEndsAt = Date.now() + seconds * 1000;
    persistSession();
    tickRestTimer();
  };

  const skipRest = () => {
    session.resting = false;
    session.restEndsAt = null;
    persistSession();
    stopRestTicking();
    renderRestState();
  };

  const stopRestTicking = () => {
    if (restTickHandle) {
      clearInterval(restTickHandle);
      restTickHandle = null;
    }
  };

  const tickRestTimer = () => {
    stopRestTicking();
    const update = () => {
      if (!session || !session.resting || !session.restEndsAt) {
        stopRestTicking();
        return;
      }
      const remainingMs = session.restEndsAt - Date.now();
      if (remainingMs <= 0) {
        session.resting = false;
        session.restEndsAt = null;
        persistSession();
        stopRestTicking();
        renderRestState();
        return;
      }
      renderRestDisplay(remainingMs);
    };
    update();
    restTickHandle = setInterval(update, 250);
  };

  const renderRestDisplay = (remainingMs) => {
    const totalSec = Math.ceil(remainingMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const label = document.getElementById('wk-rest-countdown');
    if (label) label.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const renderRestState = () => {
    const restPanel = document.getElementById('wk-rest-panel');
    if (!restPanel) return;

    if (session.resting && session.restEndsAt) {
      restPanel.classList.remove('hidden');
      document.getElementById('wk-rest-complete-label').classList.add('hidden');
      document.getElementById('wk-rest-countdown').classList.remove('hidden');
      document.getElementById('wk-skip-rest-btn').classList.remove('hidden');
      const remainingMs = Math.max(0, session.restEndsAt - Date.now());
      renderRestDisplay(remainingMs);
      tickRestTimer();
    } else {
      stopRestTicking();
      restPanel.classList.add('hidden');
    }
  };

  // ---------------------------------------------------------------------
  // NEXT EXERCISE (ETAPA 11) / FINISH WORKOUT (ETAPA 13)
  // ---------------------------------------------------------------------
  const handlePrimaryAction = () => {
    const btn = document.getElementById('wk-complete-set-btn');
    const action = btn.dataset.action;

    if (action === 'complete-set') {
      completeSet();
    } else if (action === 'next') {
      goToNextExercise();
    } else if (action === 'finish') {
      finishWorkout();
    }
  };

  const goToNextExercise = () => {
    stopRestTicking();
    session.resting = false;
    session.restEndsAt = null;
    session.currentExerciseIndex += 1;
    persistSession();

    const activeSection = document.getElementById('wk-subview-active');
    activeSection.classList.add('wk-exercise-transition-out');
    setTimeout(() => {
      activeSection.classList.remove('wk-exercise-transition-out');
      renderActiveSession();
      Motion.triggerStagger(document.getElementById('wk-active-exercise-block'));
    }, 180);
  };

  const finishWorkout = () => {
    stopRestTicking();
    const totalCompletedSets = session.exercises.reduce((sum, e) => sum + e.completedSets, 0);
    const totalSets = session.exercises.reduce((sum, e) => sum + e.sets, 0);
    const durationMs = Date.now() - new Date(session.startedAt).getTime();
    const durationMin = Math.max(1, Math.round(durationMs / 60000));

    // ETAPA 16: Workout History Foundation
    Storage.addWorkoutHistoryEntry({
      workoutId: session.dayId,
      planId: session.planId,
      name: session.name,
      date: new Date().toISOString(),
      duration: durationMin,
      completedExercises: session.exercises.filter(e => e.completedSets >= e.sets).length,
      totalExercises: session.exercises.length,
      completedSets: totalCompletedSets,
      totalSets: totalSets
    });

    Storage.clearActiveWorkout();

    document.getElementById('wk-complete-title').textContent = session.name.toUpperCase();
    document.getElementById('wk-complete-stats').textContent =
      `${session.exercises.filter(e => e.completedSets >= e.sets).length} / ${session.exercises.length} EXERCISES`;
    document.getElementById('wk-complete-duration').textContent = `${durationMin} MIN`;

    session = null;
    showSubview('wk-subview-complete');
  };

  const persistSession = () => {
    if (session) Storage.setActiveWorkout(session);
  };

  // ---------------------------------------------------------------------
  // END WORKOUT MODAL (ETAPA 15) — new reusable modal, since none existed
  // ---------------------------------------------------------------------
  const openEndWorkoutModal = () => {
    const modal = document.getElementById('wk-end-modal');
    modal.classList.add('active');
  };

  const closeEndWorkoutModal = () => {
    const modal = document.getElementById('wk-end-modal');
    modal.classList.remove('active');
  };

  const confirmEndWorkout = () => {
    stopRestTicking();
    persistSession(); // ETAPA 14: progress saved, not discarded
    session = null;
    closeEndWorkoutModal();
    renderTodayCard();
    showSubview('wk-subview-today');
  };

  // ---------------------------------------------------------------------
  // EVENT BINDING
  // ---------------------------------------------------------------------
  const bindEvents = () => {
    document.getElementById('wk-resume-btn')?.addEventListener('click', resumeWorkout);
    document.getElementById('wk-discard-resume-btn')?.addEventListener('click', () => {
      Storage.clearActiveWorkout();
      renderTodayCard();
    });

    document.getElementById('wk-detail-back-btn')?.addEventListener('click', () => {
      showSubview('wk-subview-today');
    });

    document.getElementById('wk-detail-start-btn')?.addEventListener('click', () => {
      if (currentDetailWorkout) startWorkout(currentDetailWorkout);
    });

    document.getElementById('wk-complete-set-btn')?.addEventListener('click', handlePrimaryAction);
    document.getElementById('wk-skip-rest-btn')?.addEventListener('click', skipRest);

    document.getElementById('wk-active-close-btn')?.addEventListener('click', openEndWorkoutModal);
    document.getElementById('wk-end-modal-cancel')?.addEventListener('click', closeEndWorkoutModal);
    document.getElementById('wk-end-modal-confirm')?.addEventListener('click', confirmEndWorkout);

    document.getElementById('wk-complete-done-btn')?.addEventListener('click', () => {
      renderTodayCard();
      showSubview('wk-subview-today');
    });
  };

  // ---------------------------------------------------------------------
  // INIT — called from app.js alongside other module initializers
  // ---------------------------------------------------------------------
  const init = () => {
    bindEvents();
    renderTodayCard();

    // ETAPA 14: if the app was closed mid-session, land back in the active view
    const saved = Storage.getActiveWorkout();
    if (saved) {
      session = saved;
      renderActiveSession();
      // Stay on wk-subview-today with the resume banner visible;
      // user explicitly taps RESUME to re-enter the active session.
      showSubview('wk-subview-today');
    } else {
      showSubview('wk-subview-today');
    }
  };

  return { init, renderTodayCard };
})();
