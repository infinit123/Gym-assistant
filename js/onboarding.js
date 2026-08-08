/**
 * Smart Onboarding Flow Engine
 */
const Onboarding = {
  containerEl: null,
  currentStepIndex: 0,
  answers: {},

  init(containerEl, onCompleteCallback) {
    this.containerEl = containerEl;
    this.onCompleteCallback = onCompleteCallback;
    this.currentStepIndex = 0;
    
    // Load existing profile context if available
    const existingProfile = Storage.get(STORAGE_KEYS.USER_PROFILE) || {};
    this.answers = { ...existingProfile };

    this.renderWelcome();
  },

  renderWelcome() {
    this.containerEl.innerHTML = `
      <div class="welcome-screen motion-fade-in">
        <div class="welcome-brand">
          <div class="welcome-logo">⚡</div>
          <h1 class="welcome-title">GYM ASSISTANT</h1>
          <div class="welcome-subtitle">Your Personal Fitness System</div>
          <p class="welcome-desc">Build a training experience around YOU.</p>
        </div>
        <div class="welcome-actions">
          <button id="btn-get-started" class="btn-primary" style="width: 100%;">[ GET STARTED ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-get-started').addEventListener('click', () => {
      if (window.MotionSystem) MotionSystem.pulse(document.getElementById('btn-get-started'));
      this.startQuestions();
    });
  },

  getSteps() {
    const steps = [
      {
        id: 'experienceLevel',
        tag: 'TRAINING EXPERIENCE',
        title: "WHAT'S YOUR TRAINING EXPERIENCE?",
        type: 'single',
        options: [
          { label: 'BEGINNER', value: 'BEGINNER' },
          { label: 'INTERMEDIATE', value: 'INTERMEDIATE' },
          { label: 'ADVANCED', value: 'ADVANCED' }
        ]
      },
      {
        id: 'primaryGoal',
        tag: 'PRIMARY GOAL',
        title: 'WHAT IS YOUR PRIMARY GOAL?',
        type: 'single',
        options: [
          { label: 'BUILD MUSCLE', value: 'BUILD_MUSCLE' },
          { label: 'LOSE FAT', value: 'LOSE_FAT' },
          { label: 'GET STRONGER', value: 'GET_STRONGER' },
          { label: 'BODY RECOMPOSITION', value: 'BODY_RECOMP' },
          { label: 'GENERAL FITNESS', value: 'GENERAL' }
        ]
      },
      {
        id: 'bodyData',
        tag: 'BODY DATA',
        title: 'TELL US ABOUT YOUR PHYSIQUE',
        type: 'bodyInputs'
      }
    ];

    // Conditionally include target weight based on primary goal selection
    if (this.answers.primaryGoal === 'LOSE_FAT' || this.answers.primaryGoal === 'BODY_RECOMP') {
      steps.push({
        id: 'targetWeight',
        tag: 'TARGET WEIGHT',
        title: "WHAT'S YOUR TARGET WEIGHT?",
        type: 'numeric',
        unit: 'KG',
        field: 'targetWeight',
        min: 30,
        max: 250,
        defaultValue: this.answers.targetWeight || this.answers.currentWeight || 70
      });
    }

    steps.push(
      {
        id: 'trainingDaysPerWeek',
        tag: 'FREQUENCY',
        title: 'HOW MANY DAYS CAN YOU TRAIN EACH WEEK?',
        type: 'single',
        options: [
          { label: '2 DAYS', value: 2 },
          { label: '3 DAYS', value: 3 },
          { label: '4 DAYS', value: 4 },
          { label: '5 DAYS', value: 5 },
          { label: '6 DAYS', value: 6 }
        ]
      },
      {
        id: 'preferredWorkoutDuration',
        tag: 'DURATION',
        title: 'HOW MUCH TIME DO YOU HAVE FOR EACH WORKOUT?',
        type: 'single',
        options: [
          { label: '30 MIN', value: '30 MIN' },
          { label: '45 MIN', value: '45 MIN' },
          { label: '60 MIN', value: '60 MIN' },
          { label: '75 MIN', value: '75 MIN' },
          { label: '90+ MIN', value: '90+ MIN' }
        ]
      },
      {
        id: 'equipment',
        tag: 'EQUIPMENT',
        title: 'WHERE DO YOU TRAIN?',
        type: 'single',
        options: [
          { label: 'FULL GYM', value: 'FULL_GYM' },
          { label: 'BASIC GYM', value: 'BASIC_GYM' },
          { label: 'HOME GYM', value: 'HOME_GYM' },
          { label: 'BODYWEIGHT', value: 'BODYWEIGHT' }
        ]
      },
      {
        id: 'trainingPreference',
        tag: 'TRAINING PREFERENCE',
        title: 'HOW WOULD YOU LIKE TO TRAIN?',
        type: 'single',
        options: [
          { label: 'FULL BODY', value: 'FULL_BODY' },
          { label: 'UPPER / LOWER', value: 'UPPER_LOWER' },
          { label: 'PUSH / PULL / LEGS', value: 'PPL' },
          { label: 'NO PREFERENCE', value: 'NO_PREFERENCE' }
        ]
      },
      {
        id: 'availableTrainingDays',
        tag: 'SCHEDULE',
        title: 'WHICH DAYS CAN YOU TRAIN?',
        type: 'schedule'
      },
      {
        id: 'trainingStyle',
        tag: 'TRAINING STYLE',
        title: 'PREFERRED TRAINING STYLE',
        type: 'single',
        options: [
          { label: 'MACHINES', value: 'MACHINES' },
          { label: 'FREE WEIGHTS', value: 'FREE_WEIGHTS' },
          { label: 'MIXED', value: 'MIXED' },
          { label: 'NO PREFERENCE', value: 'NO_PREFERENCE' }
        ]
      },
      {
        id: 'exercisePreference',
        tag: 'EXERCISE FOCUS',
        title: 'EXERCISE PREFERENCE',
        type: 'single',
        options: [
          { label: 'COMPOUND FOCUSED', value: 'COMPOUND' },
          { label: 'BALANCED', value: 'BALANCED' },
          { label: 'ISOLATION FOCUSED', value: 'ISOLATION' },
          { label: 'NO PREFERENCE', value: 'NO_PREFERENCE' }
        ]
      }
    );

    return steps;
  },

  startQuestions() {
    this.currentStepIndex = 0;
    this.renderStep();
  },

  renderStep() {
    const steps = this.getSteps();
    if (this.currentStepIndex >= steps.length) {
      this.renderCompletionScreen();
      return;
    }

    const step = steps[this.currentStepIndex];
    const progressPercent = Math.round(((this.currentStepIndex + 1) / steps.length) * 100);
    const stepFormatted = String(this.currentStepIndex + 1).padStart(2, '0');
    const totalFormatted = String(steps.length).padStart(2, '0');

    let contentHtml = '';

    if (step.type === 'single') {
      contentHtml = `
        <div class="options-grid">
          ${step.options.map(opt => {
            const isSelected = this.answers[step.id] === opt.value;
            return `
              <div class="option-card ${isSelected ? 'selected' : ''}" data-value="${opt.value}">
                <span>${opt.label}</span>
                <div class="option-radio"></div>
              </div>
            `;
          }).join('')}
        </div>
      `;
    } else if (step.type === 'bodyInputs') {
      contentHtml = `
        <div class="input-group">
          <div class="input-field-wrapper">
            <label class="input-label">AGE</label>
            <div class="input-control-row">
              <input type="number" id="input-age" class="numeric-input" pattern="[0-9]*" inputmode="numeric" value="${this.answers.age || 25}" min="10" max="120">
              <span class="input-unit">YRS</span>
            </div>
          </div>
          <div class="input-field-wrapper">
            <label class="input-label">HEIGHT</label>
            <div class="input-control-row">
              <input type="number" id="input-height" class="numeric-input" pattern="[0-9]*" inputmode="numeric" value="${this.answers.height || 175}" min="100" max="250">
              <span class="input-unit">CM</span>
            </div>
          </div>
          <div class="input-field-wrapper">
            <label class="input-label">CURRENT WEIGHT</label>
            <div class="input-control-row">
              <input type="number" id="input-weight" class="numeric-input" pattern="[0-9]*" inputmode="numeric" value="${this.answers.currentWeight || 75}" min="30" max="300">
              <span class="input-unit">KG</span>
            </div>
          </div>
        </div>
      `;
    } else if (step.type === 'numeric') {
      contentHtml = `
        <div class="input-group">
          <div class="input-field-wrapper">
            <div class="input-control-row">
              <input type="number" id="input-numeric-val" class="numeric-input" pattern="[0-9]*" inputmode="numeric" value="${step.defaultValue}">
              <span class="input-unit">${step.unit}</span>
            </div>
          </div>
        </div>
      `;
    } else if (step.type === 'schedule') {
      const days = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
      const selectedDays = this.answers.availableTrainingDays || [];
      contentHtml = `
        <div class="days-grid">
          ${days.map(d => `
            <button class="day-btn ${selectedDays.includes(d) ? 'selected' : ''}" data-day="${d}">${d}</button>
          `).join('')}
        </div>
        <div id="schedule-hint" class="day-schedule-hint"></div>
      `;
    }

    this.containerEl.innerHTML = `
      <div class="onboarding-flow motion-fade-in">
        <div class="onboarding-header">
          <div class="progress-bar-track">
            <div class="progress-bar-fill" style="width: ${progressPercent}%;"></div>
          </div>
          <div class="progress-text">${stepFormatted} / ${totalFormatted}</div>
        </div>

        <div class="question-step">
          <div class="question-tag">${step.tag}</div>
          <h2 class="question-title">${step.title}</h2>
          ${contentHtml}
        </div>

        <div class="onboarding-footer">
          ${this.currentStepIndex > 0 ? `<button id="btn-back" class="btn-secondary">BACK</button>` : ''}
          <button id="btn-next" class="btn-primary">NEXT</button>
        </div>
      </div>
    `;

    this.bindStepEvents(step);
  },

  bindStepEvents(step) {
    const nextBtn = document.getElementById('btn-next');
    const backBtn = document.getElementById('btn-back');

    if (backBtn) {
      backBtn.addEventListener('click', () => {
        if (this.currentStepIndex > 0) {
          this.currentStepIndex--;
          this.renderStep();
        }
      });
    }

    if (step.type === 'single') {
      const options = this.containerEl.querySelectorAll('.option-card');
      options.forEach(card => {
        card.addEventListener('click', () => {
          options.forEach(c => c.classList.remove('selected'));
          card.classList.add('selected');
          this.answers[step.id] = card.dataset.value;
          if (window.MotionSystem) MotionSystem.pulse(card);
          nextBtn.disabled = false;
        });
      });
      nextBtn.disabled = !this.answers[step.id];
    } else if (step.type === 'bodyInputs') {
      const ageInput = document.getElementById('input-age');
      const heightInput = document.getElementById('input-height');
      const weightInput = document.getElementById('input-weight');

      const validate = () => {
        const age = parseInt(ageInput.value, 10);
        const height = parseInt(heightInput.value, 10);
        const weight = parseInt(weightInput.value, 10);
        const isValid = !isNaN(age) && age > 0 && !isNaN(height) && height > 0 && !isNaN(weight) && weight > 0;
        nextBtn.disabled = !isValid;
      };

      [ageInput, heightInput, weightInput].forEach(inp => inp.addEventListener('input', validate));
      validate();

      nextBtn.addEventListener('click', () => {
        this.answers.age = parseInt(ageInput.value, 10);
        this.answers.height = parseInt(heightInput.value, 10);
        this.answers.currentWeight = parseInt(weightInput.value, 10);
      });
    } else if (step.type === 'numeric') {
      const inputVal = document.getElementById('input-numeric-val');
      const validate = () => {
        const val = parseInt(inputVal.value, 10);
        nextBtn.disabled = isNaN(val) || val < step.min || val > step.max;
      };
      inputVal.addEventListener('input', validate);
      validate();

      nextBtn.addEventListener('click', () => {
        this.answers[step.field] = parseInt(inputVal.value, 10);
      });
    } else if (step.type === 'schedule') {
      const requiredCount = Number(this.answers.trainingDaysPerWeek) || 4;
      let selectedDays = [...(this.answers.availableTrainingDays || [])];
      const hintEl = document.getElementById('schedule-hint');

      const updateScheduleUI = () => {
        const diff = requiredCount - selectedDays.length;
        if (diff > 0) {
          hintEl.textContent = `SELECT ${diff} MORE DAY${diff > 1 ? 'S' : ''}`;
          nextBtn.disabled = true;
        } else if (diff < 0) {
          hintEl.textContent = `DESELECT ${Math.abs(diff)} DAY${Math.abs(diff) > 1 ? 'S' : ''}`;
          nextBtn.disabled = true;
        } else {
          hintEl.textContent = 'SCHEDULE OPTIMAL';
          nextBtn.disabled = false;
        }
      };

      const dayBtns = this.containerEl.querySelectorAll('.day-btn');
      dayBtns.forEach(btn => {
        btn.addEventListener('click', () => {
          const day = btn.dataset.day;
          if (selectedDays.includes(day)) {
            selectedDays = selectedDays.filter(d => d !== day);
            btn.classList.remove('selected');
          } else {
            selectedDays.push(day);
            btn.classList.add('selected');
          }
          this.answers.availableTrainingDays = selectedDays;
          updateScheduleUI();
        });
      });

      updateScheduleUI();
    }

    nextBtn.addEventListener('click', () => {
      this.currentStepIndex++;
      this.renderStep();
    });
  },

  renderCompletionScreen() {
    this.containerEl.innerHTML = `
      <div class="welcome-screen motion-fade-in">
        <div class="welcome-brand">
          <div class="welcome-logo" style="color: var(--primary);">✓</div>
          <h1 class="welcome-title">PROFILE COMPLETE</h1>
          <p class="welcome-desc">Your fitness profile is ready.</p>
        </div>
        <div class="welcome-actions">
          <button id="btn-continue" class="btn-primary" style="width: 100%;">[ CONTINUE ]</button>
        </div>
      </div>
    `;

    document.getElementById('btn-continue').addEventListener('click', () => {
      this.saveAndShowLoading();
    });
  },

  saveAndShowLoading() {
    // Persist full profile to LocalStorage
    Storage.set(STORAGE_KEYS.USER_PROFILE, this.answers);
    Storage.set(STORAGE_KEYS.ONBOARDING_COMPLETED, true);

    // Show Custom Training Loading Experience
    this.renderLoadingScreen();
  },

  renderLoadingScreen() {
    this.containerEl.innerHTML = `
      <div class="loading-screen motion-fade-in">
        <div class="loading-ring-container">
          <div class="loading-ring"></div>
          <span class="loading-icon">⚡</span>
        </div>
        <h2 class="loading-title">YOUR CUSTOM TRAINING</h2>
        <div id="loading-status" class="loading-status-text">ANALYZING YOUR PROFILE...</div>
        <div class="loading-progress-bar">
          <div id="loading-progress-fill" class="loading-progress-fill"></div>
        </div>
      </div>
    `;

    const statusTexts = [
      'ANALYZING YOUR PROFILE...',
      'ANALYZING YOUR GOALS...',
      'ANALYZING YOUR SCHEDULE...',
      'OPTIMIZING YOUR EXPERIENCE...'
    ];

    const statusEl = document.getElementById('loading-status');
    const fillEl = document.getElementById('loading-progress-fill');
    let idx = 0;

    const interval = setInterval(() => {
      idx++;
      if (idx < statusTexts.length) {
        if (statusEl) statusEl.textContent = statusTexts[idx];
        if (fillEl) fillEl.style.width = `${((idx + 1) / statusTexts.length) * 100}%`;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          if (this.onCompleteCallback) this.onCompleteCallback();
        }, 500);
      }
    }, 700);
  }
};