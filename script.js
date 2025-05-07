// Затримка між етапами — 3 секунди
const DELAY_MS = 3 * 1000;
const STORAGE_KEY = 'dateRandomizerState';
const USER_ID_KEY = 'userId';

// Створюємо унікальний ID для користувача
let userId = localStorage.getItem(USER_ID_KEY);
if (!userId) {
  userId = Date.now().toString() + Math.random().toString(36).substr(2, 9);
  localStorage.setItem(USER_ID_KEY, userId);
}

// Конфігурація побачення
const dateOptions = {
  stages: [
    {
      question: "Де п'ємо каву?",
      options: [
        { text: "Кав'ярня Арома", image: "https://picsum.photos/seed/coffee1/400/300" },
        { text: "Cafe de Paris", image: "https://picsum.photos/seed/coffee2/400/300" },
        { text: "Starbucks", image: "https://picsum.photos/seed/coffee3/400/300" }
      ]
    },
    {
      question: "Прогуляємся? а саме сюди:",
      options: [
        { text: "Центральний парк", image: "https://picsum.photos/seed/park1/400/300" },
        { text: "Набережна річки", image: "https://picsum.photos/seed/river/400/300" },
        { text: "Старе місто", image: "https://picsum.photos/seed/oldtown/400/300" }
      ]
    },
    {
      question: "Будемо йти на фільм? давай на цей...",
      options: [
        { text: "Романтична комедія", image: "https://picsum.photos/seed/movie1/400/300" },
        { text: "Фантастичний екшн", image: "https://picsum.photos/seed/movie2/400/300" },
        { text: "Драма", image: "https://picsum.photos/seed/movie3/400/300" }
      ]
    },
    {
      question: "Де вечеряємо?",
      options: [
        { text: "Італійський ресторан", image: "https://picsum.photos/seed/dinner1/400/300" },
        { text: "Японське бістро", image: "https://picsum.photos/seed/dinner2/400/300" },
        { text: "Домашня піца", image: "https://picsum.photos/seed/dinner3/400/300" }
      ]
    },
    {
      question: "Тепер за твоє 'терпіння' - давай виберемо тобі міні подарунок.",
      options: [
        { text: "Квітка", image: "https://picsum.photos/seed/flower/400/300" },
        { text: "Шоколадка", image: "https://picsum.photos/seed/chocolate/400/300" },
        { text: "Брелок", image: "https://picsum.photos/seed/keychain/400/300" }
      ]
    }
  ]
};

let state = {};

document.addEventListener('DOMContentLoaded', () => {
  initState();
  setupDOM();

  // Зберігаємо стан перед закриттям або оновленням сторінки
  window.addEventListener('beforeunload', saveState);
});

function initState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      console.log('Loaded state from localStorage:', state);
      // Перевірка, чи відповідає userId
      if (!state.userId || state.userId !== userId) {
        console.log('User ID mismatch detected, resetting state');
        resetState();
      }
      // Перевірка, чи відповідає кількість етапів
      else if (!state.stages || state.stages.length !== dateOptions.stages.length) {
        console.log('Stage count mismatch detected, resetting state');
        resetState();
      }
      // Перевірка, чи всі необхідні поля присутні
      else {
        let isValid = true;
        if (typeof state.firstIntroDone !== 'boolean' || typeof state.introDone !== 'boolean') {
          console.log('Intro state invalid, resetting state');
          isValid = false;
        }
        if (typeof state.lastActiveStage !== 'number' || state.lastActiveStage < 0 || state.lastActiveStage >= dateOptions.stages.length) {
          console.log('lastActiveStage invalid, resetting to 0');
          state.lastActiveStage = 0;
        }
        state.stages.forEach((stage, idx) => {
          if (
            !stage.hasOwnProperty('selectedIndex') ||
            !stage.hasOwnProperty('confirmed') ||
            !stage.hasOwnProperty('unlockTime')
          ) {
            console.log(`Invalid stage data at index ${idx}, resetting state`);
            isValid = false;
          }
        });
        if (typeof state.farewellUnlockTime !== 'number' && state.farewellUnlockTime !== null) {
          console.log('farewellUnlockTime invalid, resetting state');
          isValid = false;
        }
        if (!isValid) {
          resetState();
        }
      }
    } catch (e) {
      console.error('Error parsing localStorage:', e);
      resetState();
    }
  } else {
    console.log('No saved state found, initializing new state');
    resetState();
  }
  saveState();
}

function resetState() {
  state = { 
    userId: userId, 
    stages: [], 
    lastActiveStage: 0, 
    firstIntroDone: false, 
    introDone: false,
    farewellUnlockTime: null
  };
  dateOptions.stages.forEach((_, i) => {
    state.stages.push({ 
      selectedIndex: null, 
      confirmed: false, 
      unlockTime: i === 0 ? 0 : null // Перший етап завжди розблокований
    });
  });
  console.log('State reset:', state);
  saveState();
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    console.log('State saved to localStorage:', state);
  } catch (e) {
    console.error('Error saving state to localStorage:', e);
  }
}

function setupDOM() {
  const intro = document.getElementById('intro');
  const anecdote = document.getElementById('anecdote');
  const stageContainer = document.getElementById('stageContainer');
  const final = document.getElementById('final');
  const continueBtn = document.getElementById('continueBtn');
  const startBtn = document.getElementById('startBtn');

  if (!intro || !anecdote || !stageContainer || !final || !continueBtn || !startBtn) {
    console.error('One or more required DOM elements are missing');
    return;
  }

  // Спочатку створюємо всі DOM-елементи для етапів
  const progressBar = document.getElementById('progressBar');
  if (!progressBar) {
    console.error('Progress bar element not found');
    return;
  }

  // Додаємо індикатори прогресу
  dateOptions.stages.forEach((_, idx) => {
    const step = document.createElement('div');
    step.className = 'step';
    step.dataset.index = idx;
    progressBar.append(step);
    if (state.stages[idx] && state.stages[idx].confirmed) {
      step.classList.add('completed');
    }
  });

  // Створюємо всі етапи
  dateOptions.stages.forEach((stageData, idx) => {
    const section = document.createElement('section');
    section.className = 'stage locked';
    section.dataset.index = idx;

    let emoji = '';
    if (idx === 0) emoji = '<i class="fas fa-coffee"></i>';
    else if (idx === 1) emoji = '<i class="fas fa-walking"></i>';
    else if (idx === 2) emoji = '<i class="fas fa-film"></i>';
    else if (idx === 3) emoji = '<i class="fas fa-utensils"></i>';
    else if (idx === 4) emoji = '<i class="fas fa-gift"></i>';
    const q = document.createElement('h2');
    q.innerHTML = `${emoji} ${stageData.question}`;

    const display = document.createElement('div');
    display.className = 'selected-option';
    const img = document.createElement('img');
    const name = document.createElement('p');
    display.append(img, name);

    const randBtn = document.createElement('button');
    randBtn.className = 'random-btn';
    randBtn.innerHTML = 'Обрати варіант <i class="fas fa-dice"></i>';

    const confBtn = document.createElement('button');
    confBtn.className = 'confirm-btn';
    confBtn.innerHTML = 'Затверджуємо це? <i class="fas fa-check"></i>';

    const retryBtn = document.createElement('button');
    retryBtn.className = 'retry-btn';
    retryBtn.innerHTML = 'Обрати інший варіант <i class="fas fa-redo"></i>';

    randBtn.addEventListener('click', () => {
      console.log(`Random button clicked for stage ${idx}`);
      if (!randBtn.disabled) {
        spinEffect(idx, img, name, display, confBtn, retryBtn);
        state.lastActiveStage = idx;
        saveState();
      } else {
        console.log(`Random button is disabled for stage ${idx}`);
      }
    });

    confBtn.addEventListener('click', () => {
      console.log(`Confirm button clicked for stage ${idx}`);
      confirmChoice(idx, section);
    });

    retryBtn.addEventListener('click', () => {
      console.log(`Retry button clicked for stage ${idx}`);
      state.stages[idx].selectedIndex = null;
      state.stages[idx].confirmed = false;
      state.stages[idx].unlockTime = idx === 0 ? 0 : null;
      saveState();
      display.classList.remove('visible');
      confBtn.classList.remove('active');
      retryBtn.classList.remove('active');
      randBtn.disabled = false;
      const step = document.querySelector(`.progress-bar .step[data-index="${idx}"]`);
      if (step) step.classList.remove('completed');
      else console.error(`Progress step not found for stage ${idx}`);
      state.lastActiveStage = idx;
      saveState();
      // Переблоковуємо наступні етапи
      for (let i = idx + 1; i < dateOptions.stages.length; i++) {
        const nextStage = document.querySelector(`.stage[data-index="${i}"]`);
        if (nextStage) {
          nextStage.classList.add('locked');
          const nextDisplay = nextStage.querySelector('.selected-option');
          if (nextDisplay) nextDisplay.classList.remove('visible');
          const nextRandBtn = nextStage.querySelector('.random-btn');
          const nextConfBtn = nextStage.querySelector('.confirm-btn');
          const nextRetryBtn = nextStage.querySelector('.retry-btn');
          if (nextRandBtn) nextRandBtn.disabled = false;
          if (nextConfBtn) nextConfBtn.classList.remove('active');
          if (nextRetryBtn) nextRetryBtn.classList.remove('active');
          state.stages[i].selectedIndex = null;
          state.stages[i].confirmed = false;
          state.stages[i].unlockTime = null;
        }
      }
      saveState();
    });

    section.append(q, randBtn, display, confBtn, retryBtn);
    stageContainer.append(section);
  });

  // Тепер, коли всі етапи створені, перевіряємо, чи потрібно їх розблокувати
  if (state.firstIntroDone && state.introDone) {
    intro.style.display = 'none';
    anecdote.style.display = 'none';

    // Перевіряємо, чи потрібно показати фінальний екран
    const allStagesConfirmed = state.stages.every(s => s.confirmed);
    if (allStagesConfirmed && state.farewellUnlockTime && Date.now() >= state.farewellUnlockTime) {
      stageContainer.style.display = 'none';
      final.style.display = 'flex';
      final.classList.add('fade-in');
      unlockFarewell();
      console.log('All stages confirmed, showing final screen');
      return;
    }

    // Показуємо етапи
    stageContainer.style.display = 'block';
    stageContainer.classList.add('fade-in');

    // Розблоковуємо етапи на основі прогресу
    let lastActive = 0;
    for (let i = 0; i < dateOptions.stages.length; i++) {
      if (i === 0 || (state.stages[i - 1] && state.stages[i - 1].confirmed)) {
        unlockStage(i);
        lastActive = i;
        console.log(`Stage ${i} unlocked during initialization`);
      } else {
        break;
      }
    }
    state.lastActiveStage = lastActive;
    saveState();

    // Якщо є час розблокування для наступного етапу, запускаємо таймер
    if (lastActive < dateOptions.stages.length - 1 && state.stages[lastActive].confirmed && state.stages[lastActive + 1].unlockTime) {
      const nextUnlockTime = state.stages[lastActive + 1].unlockTime;
      if (Date.now() < nextUnlockTime) {
        startCountdown(nextUnlockTime, lastActive + 1);
        console.log(`Countdown started for stage ${lastActive + 1}`);
      } else {
        unlockStage(lastActive + 1);
        state.lastActiveStage = lastActive + 1;
        saveState();
        console.log(`Stage ${lastActive + 1} unlocked immediately`);
      }
    }
    // Якщо всі етапи завершені, але ще є таймер для фінального екрану
    else if (allStagesConfirmed && state.farewellUnlockTime && Date.now() < state.farewellUnlockTime) {
      startCountdown(state.farewellUnlockTime, 'farewell');
      console.log('Countdown started for farewell screen');
    }
  }

  continueBtn.addEventListener('click', () => {
    console.log('Continue button clicked');
    intro.classList.remove('fade-in');
    intro.classList.add('fade-out');
    setTimeout(() => {
      intro.style.display = 'none';
      anecdote.style.display = 'flex';
      anecdote.classList.add('fade-in');
    }, 500);
    state.firstIntroDone = true;
    saveState();
  });

  startBtn.addEventListener('click', () => {
    console.log('Start button clicked');
    anecdote.classList.remove('fade-in');
    anecdote.classList.add('fade-out');
    setTimeout(() => {
      anecdote.style.display = 'none';
      stageContainer.style.display = 'block';
      stageContainer.classList.add('fade-in');
      state.stages[0].unlockTime = 0; // Забезпечуємо, що перший етап розблоковано
      unlockStage(0);
    }, 500);
    state.introDone = true;
    state.lastActiveStage = 0;
    saveState();
  });
}

function spinEffect(idx, img, name, display, confBtn, retryBtn) {
  console.log(`Starting spin effect for stage ${idx}`);
  const opts = dateOptions.stages[idx].options;
  let count = 0;
  const cycles = Math.floor(3000 / 100);
  const spinInt = setInterval(() => {
    const i = count % opts.length;
    const o = opts[i];
    img.src = o.image;
    name.textContent = o.text;
    display.classList.add('visible');
    count++;
    if (count > cycles) {
      clearInterval(spinInt);
      const chosen = Math.floor(Math.random() * opts.length);
      const co = opts[chosen];
      img.src = co.image;
      name.textContent = co.text;
      state.stages[idx].selectedIndex = chosen;
      saveState();
      confBtn.classList.add('active');
      retryBtn.classList.add('active');
      console.log(`Spin effect completed for stage ${idx}, selected: ${co.text}`);
    }
  }, 100);
}

function confirmChoice(idx, section) {
  console.log(`Confirming choice for stage ${idx}, userId: ${state.userId}`);
  const st = state.stages[idx];
  st.confirmed = true;

  const randomBtn = document.querySelector(`.stage[data-index="${idx}"] .random-btn`);
  if (randomBtn) randomBtn.disabled = true;
  else console.error(`Random button not found for stage ${idx}`);

  saveState();

  const step = document.querySelector(`.progress-bar .step[data-index="${idx}"]`);
  if (step) step.classList.add('completed');
  else console.error(`Progress step not found for stage ${idx}`);

  if (typeof confetti === 'function') {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
      console.log('Confetti triggered successfully');
    } catch (e) {
      console.error('Confetti error:', e);
    }
  } else {
    console.warn('Confetti function not available');
  }

  const isLast = idx === dateOptions.stages.length - 1;
  const nextKey = isLast ? 'farewell' : idx + 1;
  const ut = Date.now() + DELAY_MS;
  if (!isLast) state.stages[idx + 1].unlockTime = ut;
  else state.farewellUnlockTime = ut;
  state.lastActiveStage = isLast ? idx : idx + 1;
  saveState();

  console.log(`Starting countdown for ${nextKey}`);
  startCountdown(ut, nextKey);

  const confBtn = section.querySelector('.confirm-btn');
  const retryBtn = section.querySelector('.retry-btn');
  if (confBtn) confBtn.classList.remove('active');
  if (retryBtn) retryBtn.classList.remove('active');
}

function unlockStage(i) {
  console.log(`Unlocking stage ${i}`);
  const el = document.querySelector(`.stage[data-index="${i}"]`);
  if (el) {
    el.classList.remove('locked');
    el.classList.add('fade-in');
    const randBtn = el.querySelector('.random-btn');
    const confBtn = el.querySelector('.confirm-btn');
    const retryBtn = el.querySelector('.retry-btn');
    const display = el.querySelector('.selected-option');

    if (randBtn && confBtn && retryBtn && display) {
      const st = state.stages[i];
      if (!st.confirmed) {
        randBtn.disabled = false;
        confBtn.classList.remove('active');
        retryBtn.classList.remove('active');
        display.classList.remove('visible');
        if (st.selectedIndex !== null) {
          const opt = dateOptions.stages[i].options[st.selectedIndex];
          const img = display.querySelector('img');
          const name = display.querySelector('p');
          if (img && name) {
            img.src = opt.image;
            name.textContent = opt.text;
            display.classList.add('visible');
            confBtn.classList.add('active');
            retryBtn.classList.add('active');
          }
        }
        console.log(`Random button enabled for stage ${i}`);
      } else if (st.confirmed && st.selectedIndex !== null) {
        const opt = dateOptions.stages[i].options[st.selectedIndex];
        const img = display.querySelector('img');
        const name = display.querySelector('p');
        if (img && name) {
          img.src = opt.image;
          name.textContent = opt.text;
          display.classList.add('visible');
        }
        randBtn.disabled = true;
        confBtn.classList.remove('active');
        retryBtn.classList.remove('active');
        console.log(`Stage ${i} is already confirmed, random button disabled`);
      }
    } else {
      console.error(`Required elements not found for stage ${i}`);
    }
  } else {
    console.error(`Stage element not found for index ${i}`);
  }
}

function unlockFarewell() {
  console.log('Unlocking farewell screen');
  const stageContainer = document.getElementById('stageContainer');
  const final = document.getElementById('final');
  if (!stageContainer || !final) {
    console.error('Stage container or final screen not found');
    return;
  }
  stageContainer.style.display = 'none';
  final.style.display = 'flex';
  final.classList.add('fade-in');

  const finalContent = document.querySelector('.final-content');
  const emojiPrompt = document.createElement('p');
  emojiPrompt.className = 'emoji-prompt';
  emojiPrompt.textContent = 'Оціни цей день нажавши на смайл нижче 😄:';
  finalContent.appendChild(emojiPrompt);

  const emojiRating = document.createElement('div');
  emojiRating.className = 'emoji-rating';
  emojiRating.innerHTML = `
    <button class="emoji-btn" data-rating="happy">😊</button>
    <button class="emoji-btn" data-rating="neutral">😐</button>
    <button class="emoji-btn" data-rating="sad">😢</button>
    <button class="emoji-btn" data-rating="speechless">😶</button>
    <button class="emoji-btn" data-rating="laughing">😂</button>
    <button class="emoji-btn" data-rating="inlove">😍</button>
    <button class="emoji-btn" data-rating="disgusted">🤮</button>
  `;
  finalContent.appendChild(emojiRating);

  emojiRating.querySelectorAll('.emoji-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const rating = btn.dataset.rating;
      let message = '';
      switch (rating) {
        case 'happy':
          message = 'Супер, радий, що тобі сподобалось! 😊';
          break;
        case 'neutral':
          message = 'Дякую за відгук, наступного разу буде краще! 😐';
          break;
        case 'sad':
          message = 'Вибач, якщо щось пішло не так. Давай спробуємо ще раз? 😢';
          break;
        case 'speechless':
          message = 'Ого, без слів? Сподіваюсь, це добре! 😶';
          break;
        case 'laughing':
          message = 'Класно, що було так весело! 😂';
          break;
        case 'inlove':
          message = 'О, здається, ти в захваті! Чудово! 😍';
          break;
        case 'disgusted':
          message = 'Ой, щось пішло не так... Спробуємо ще раз? 🤮';
          break;
      }
      alert(message);
      localStorage.clear();
      location.reload();
    });
  });
}

function startCountdown(unlockTime, next) {
  console.log(`Starting countdown, unlockTime: ${unlockTime}, next: ${next}`);
  const timerElement = document.getElementById('globalTimer');
  if (!timerElement) {
    console.error('Global timer element not found');
    return;
  }
  timerElement.classList.add('active');
  
  const updateTimer = () => {
    const remaining = unlockTime - Date.now();
    if (remaining <= 0) {
      clearInterval(timerInterval);
      timerElement.classList.remove('active');
      if (next === 'farewell') {
        unlockFarewell();
      } else {
        unlockStage(next);
        state.lastActiveStage = next;
        saveState();
      }
      console.log(`Countdown finished, proceeding to ${next}`);
      return;
    }
    const seconds = Math.floor(remaining / 1000);
    const minutes = String(Math.floor(seconds / 60)).padStart(2, '0');
    const secs = String(seconds % 60).padStart(2, '0');
    timerElement.textContent = `Залишилось: ${minutes}:${secs}`;
  };
  
  updateTimer();
  const timerInterval = setInterval(updateTimer, 1000);
}
