// Затримка між етапами — 30 секунд для тестування
const DELAY_MS = 30 * 1000; // 30 секунд
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
      ],
      icon: "☕"
    },
    {
      question: "Прогуляємся? а саме сюди:",
      options: [
        { text: "Центральний парк", image: "https://picsum.photos/seed/park1/400/300" },
        { text: "Набережна річки", image: "https://picsum.photos/seed/river/400/300" },
        { text: "Старе місто", image: "https://picsum.photos/seed/oldtown/400/300" }
      ],
      icon: "🚶"
    },
    {
      question: "Будемо йти на фільм? давай на цей...",
      options: [
        { text: "Романтична комедія", image: "https://picsum.photos/seed/movie1/400/300" },
        { text: "Фантастичний екшн", image: "https://picsum.photos/seed/movie2/400/300" },
        { text: "Драма", image: "https://picsum.photos/seed/movie3/400/300" }
      ],
      icon: "🎬"
    },
    {
      question: "Де вечеряємо?",
      options: [
        { text: "Італійський ресторан", image: "https://picsum.photos/seed/dinner1/400/300" },
        { text: "Японське бістро", image: "https://picsum.photos/seed/dinner2/400/300" },
        { text: "Домашня піца", image: "https://picsum.photos/seed/dinner3/400/300" }
      ],
      icon: "🍽️"
    },
    {
      question: "Тепер за твоє 'терпіння' - давай виберемо тобі міні подарунок.",
      options: [
        { text: "Квітка", image: "https://picsum.photos/seed/flower/400/300" },
        { text: "Шоколадка", image: "https://picsum.photos/seed/chocolate/400/300" },
        { text: "Брелок", image: "https://picsum.photos/seed/keychain/400/300" }
      ],
      icon: "🎁"
    }
  ]
};

let state = {};

document.addEventListener('DOMContentLoaded', () => {
  initState();
  setupDOM();
  window.addEventListener('beforeunload', saveState);
});

function initState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      state = JSON.parse(saved);
      console.log('Loaded state from localStorage:', state);
      if (!state.userId || state.userId !== userId) {
        console.log('User ID mismatch detected, resetting state');
        resetState();
      } else if (!state.stages || state.stages.length !== dateOptions.stages.length) {
        console.log('Stage count mismatch detected, resetting state');
        resetState();
      } else {
        let isValid = true;
        if (
          typeof state.firstIntroDone !== 'boolean' ||
          typeof state.introDone !== 'boolean' ||
          typeof state.mysteryDone !== 'boolean' ||
          typeof state.lockedEventsDone !== 'boolean' ||
          typeof state.funPromiseDone !== 'boolean'
        ) {
          console.log('Intro state invalid, resetting state');
          isValid = false;
        }
        if (
          typeof state.lastActiveStage !== 'number' ||
          state.lastActiveStage < 0 ||
          state.lastActiveStage >= dateOptions.stages.length
        ) {
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
        if (
          state.pendingStage !== null &&
          state.pendingStage !== 'farewell' &&
          (typeof state.pendingStage !== 'number' || state.pendingStage >= dateOptions.stages.length)
        ) {
          console.log('pendingStage invalid, resetting state');
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
    mysteryDone: false,
    lockedEventsDone: false,
    funPromiseDone: false,
    pendingStage: null,
    pendingUnlockTime: null
  };
  dateOptions.stages.forEach((_, i) => {
    state.stages.push({
      selectedIndex: null,
      confirmed: false,
      unlockTime: i === 0 ? 0 : null
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
  const mystery = document.getElementById('mystery');
  const lockedEvents = document.getElementById('lockedEvents');
  const funPromise = document.getElementById('funPromise');
  const stageContainer = document.getElementById('stageContainer');
  const final = document.getElementById('final');
  const continueBtn = document.getElementById('continueBtn');
  const startBtn = document.getElementById('startBtn');
  const mysteryBtn = document.getElementById('mysteryBtn');
  const lockedEventsBtn = document.getElementById('lockedEventsBtn');
  const beginBtn = document.getElementById('beginBtn');

  if (
    !intro ||
    !anecdote ||
    !mystery ||
    !lockedEvents ||
    !funPromise ||
    !stageContainer ||
    !final ||
    !continueBtn ||
    !startBtn ||
    !mysteryBtn ||
    !lockedEventsBtn ||
    !beginBtn
  ) {
    console.error('One or more required DOM elements are missing');
    return;
  }

  const progressBar = document.getElementById('progressBar');
  if (!progressBar) {
    console.error('Progress bar element not found');
    return;
  }

  dateOptions.stages.forEach((_, idx) => {
    const step = document.createElement('div');
    step.className = 'step';
    step.dataset.index = idx;
    progressBar.append(step);
    if (state.stages[idx] && state.stages[idx].confirmed) {
      step.classList.add('completed');
    }
  });

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
      if (state.pendingStage === idx) {
        state.pendingStage = null;
        state.pendingUnlockTime = null;
      }
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
          if (state.pendingStage === i) {
            state.pendingStage = null;
            state.pendingUnlockTime = null;
          }
        }
      }
      saveState();
    });

    section.append(q, randBtn, display, confBtn, retryBtn);
    stageContainer.append(section);
  });

  // Логіка відображення екранів на основі стану
  if (
    state.firstIntroDone &&
    state.introDone &&
    state.mysteryDone &&
    state.lockedEventsDone &&
    state.funPromiseDone
  ) {
    intro.style.display = 'none';
    anecdote.style.display = 'none';
    mystery.style.display = 'none';
    lockedEvents.style.display = 'none';
    funPromise.style.display = 'none';

    stageContainer.style.display = 'block';
    stageContainer.classList.add('fade-in');

    let lastActive = 0;

    // Розблоковуємо підтверджені етапи та перевіряємо unlockTime для наступних
    for (let i = 0; i < dateOptions.stages.length; i++) {
      if (state.stages[i].confirmed) {
        unlockStage(i);
        lastActive = i;
        console.log(`Stage ${i} unlocked during initialization (confirmed)`);
      } else if (state.stages[i].unlockTime && Date.now() >= state.stages[i].unlockTime) {
        unlockStage(i);
        lastActive = i;
        console.log(`Stage ${i} unlocked during initialization (unlockTime passed)`);
      } else {
        break; // Зупиняємося, якщо етап не підтверджений і не розблокований
      }
    }

    // Обробляємо pendingStage
    if (state.pendingStage !== null && state.pendingUnlockTime !== null) {
      console.log(`Processing pending stage: ${state.pendingStage}, unlock time: ${state.pendingUnlockTime}, current time: ${Date.now()}`);
      if (state.pendingStage === 'farewell') {
        if (Date.now() < state.pendingUnlockTime) {
          startCountdown(state.pendingUnlockTime, 'farewell');
          console.log(`Countdown started for farewell, remaining: ${state.pendingUnlockTime - Date.now()}ms`);
        } else {
          stageContainer.style.display = 'none';
          final.style.display = 'flex';
          final.classList.add('fade-in');
          unlockFarewell();
          state.pendingStage = null;
          state.pendingUnlockTime = null;
          saveState();
          console.log('Showing final screen immediately, time has passed');
        }
      } else {
        const pendingIdx = state.pendingStage;
        if (pendingIdx < dateOptions.stages.length && !state.stages[pendingIdx].confirmed) {
          if (Date.now() < state.pendingUnlockTime) {
            startCountdown(state.pendingUnlockTime, pendingIdx);
            console.log(`Countdown started for stage ${pendingIdx}, remaining: ${state.pendingUnlockTime - Date.now()}ms`);
          } else {
            unlockStage(pendingIdx);
            state.pendingStage = null;
            state.pendingUnlockTime = null;
            lastActive = pendingIdx;
            saveState();
            console.log(`Stage ${pendingIdx} unlocked immediately, time has passed`);
          }
        } else {
          // Якщо pendingStage некоректний або вже підтверджений, скидаємо
          state.pendingStage = null;
          state.pendingUnlockTime = null;
          saveState();
          console.log('Invalid or confirmed pendingStage, cleared');
        }
      }
    }

    state.lastActiveStage = lastActive;
    saveState();
  } else if (state.firstIntroDone && state.introDone && state.mysteryDone && state.lockedEventsDone) {
    intro.style.display = 'none';
    anecdote.style.display = 'none';
    mystery.style.display = 'none';
    lockedEvents.style.display = 'none';
    funPromise.style.display = 'flex';
    funPromise.classList.add('fade-in');
  } else if (state.firstIntroDone && state.introDone && state.mysteryDone) {
    intro.style.display = 'none';
    anecdote.style.display = 'none';
    mystery.style.display = 'none';
    lockedEvents.style.display = 'flex';
    lockedEvents.classList.add('fade-in');
  } else if (state.firstIntroDone && state.introDone) {
    intro.style.display = 'none';
    anecdote.style.display = 'none';
    mystery.style.display = 'flex';
    mystery.classList.add('fade-in');
  } else if (state.firstIntroDone) {
    intro.style.display = 'none';
    anecdote.style.display = 'flex';
    anecdote.classList.add('fade-in');
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
      mystery.style.display = 'flex';
      mystery.classList.add('fade-in');
    }, 500);
    state.introDone = true;
    saveState();
  });

  mysteryBtn.addEventListener('click', () => {
    console.log('Mystery button clicked');
    mystery.classList.remove('fade-in');
    mystery.classList.add('fade-out');
    setTimeout(() => {
      mystery.style.display = 'none';
      lockedEvents.style.display = 'flex';
      lockedEvents.classList.add('fade-in');
    }, 500);
    state.mysteryDone = true;
    saveState();
  });

  lockedEventsBtn.addEventListener('click', () => {
    console.log('Locked Events button clicked');
    lockedEvents.classList.remove('fade-in');
    lockedEvents.classList.add('fade-out');
    setTimeout(() => {
      lockedEvents.style.display = 'none';
      funPromise.style.display = 'flex';
      funPromise.classList.add('fade-in');
    }, 500);
    state.lockedEventsDone = true;
    saveState();
  });

  beginBtn.addEventListener('click', () => {
    console.log('Begin button clicked');
    funPromise.classList.remove('fade-in');
    funPromise.classList.add('fade-out');
    setTimeout(() => {
      funPromise.style.display = 'none';
      stageContainer.style.display = 'block';
      stageContainer.classList.add('fade-in');
      state.stages[0].unlockTime = 0;
      unlockStage(0);
    }, 500);
    state.funPromiseDone = true;
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
  if (!isLast) {
    state.stages[idx + 1].unlockTime = ut;
    state.pendingStage = idx + 1;
  } else {
    state.pendingStage = 'farewell';
  }
  state.pendingUnlockTime = ut;
  state.lastActiveStage = isLast ? idx : idx + 1;
  saveState();

  console.log(`Starting countdown for ${nextKey}, unlock time: ${ut}`);
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

  // Генеруємо роудмеп після завершення всіх етапів
  generateRoadmap();
}

function generateRoadmap() {
  const roadmapContainer = document.getElementById('roadmapContainer');
  const downloadBtn = document.getElementById('downloadRoadmapBtn');
  if (!roadmapContainer || !downloadBtn) {
    console.error('Roadmap container or download button not found');
    return;
  }

  // Створюємо canvas
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // Розміри canvas
  const stageHeight = 200; // Висота одного етапу
  const canvasWidth = 600;
  const canvasHeight = (dateOptions.stages.length * stageHeight) + 100; // +100 для дати та відступів
  canvas.width = canvasWidth;
  canvas.height = canvasHeight;

  // Фон
  const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
  gradient.addColorStop(0, '#fce4ec');
  gradient.addColorStop(1, '#f8bbd0');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Додаємо дату зверху
  ctx.font = 'bold 24px Poppins';
  ctx.fillStyle = '#2d1b3e';
  const today = new Date('2025-05-07'); // Статична дата, як у вашому запиті
  const dateText = `Історія одного дня: ${today.toLocaleDateString('uk-UA')}`;
  const dateTextWidth = ctx.measureText(dateText).width;
  ctx.fillText(dateText, (canvasWidth - dateTextWidth) / 2, 40);

  // Доріжка та етапи
  const pathWidth = 10;
  const pathX = canvasWidth / 2;
  let currentY = 80;

  // Малюємо доріжку
  ctx.beginPath();
  ctx.moveTo(pathX, currentY);
  ctx.lineTo(pathX, canvasHeight - 20);
  ctx.strokeStyle = '#ff6b81';
  ctx.lineWidth = pathWidth;
  ctx.stroke();

  // Додаємо етапи
  dateOptions.stages.forEach((stage, idx) => {
    const stageState = state.stages[idx];
    if (!stageState.confirmed || stageState.selectedIndex === null) return;

    const selectedOption = stage.options[stageState.selectedIndex];
    const stageY = currentY + (idx * stageHeight);

    // Коло для етапу
    ctx.beginPath();
    ctx.arc(pathX, stageY + 50, 20, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#ff6b81';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Іконка етапу
    ctx.font = '30px serif';
    ctx.fillStyle = '#2d1b3e';
    ctx.fillText(stage.icon, pathX - 10, stageY + 58);

    // Текст етапу
    ctx.font = 'bold 16px Poppins';
    const stageText = `${stage.question} ${selectedOption.text}`;
    const textWidth = ctx.measureText(stageText).width;
    ctx.fillText(stageText, (canvasWidth - textWidth) / 2, stageY + 90);

    // Зображення етапу
    const img = new Image();
    img.crossOrigin = "Anonymous"; // Для завантаження зображень з іншого домену
    img.src = selectedOption.image;
    img.onload = () => {
      const imgWidth = 100;
      const imgHeight = 75;
      ctx.drawImage(img, (canvasWidth - imgWidth) / 2, stageY + 110, imgWidth, imgHeight);

      // Після завантаження всіх зображень показуємо кнопку завантаження
      if (idx === dateOptions.stages.length - 1) {
        roadmapContainer.appendChild(canvas);
        downloadBtn.style.display = 'inline-block';
      }
    };
    img.onerror = () => {
      console.error(`Failed to load image for stage ${idx}: ${selectedOption.image}`);
      // У разі помилки завантаження зображення все одно показуємо кнопку
      if (idx === dateOptions.stages.length - 1) {
        roadmapContainer.appendChild(canvas);
        downloadBtn.style.display = 'inline-block';
      }
    };
  });

  // Обробник для завантаження роудмепу
  downloadBtn.addEventListener('click', () => {
    const link = document.createElement('a');
    link.download = 'our-day-roadmap.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  });
}

function startCountdown(unlockTime, next) {
  console.log(`Starting countdown, unlockTime: ${unlockTime}, next: ${next}, remaining: ${unlockTime - Date.now()}ms`);
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
        state.pendingStage = null;
        state.pendingUnlockTime = null;
      } else {
        unlockStage(next);
        state.pendingStage = null;
        state.pendingUnlockTime = null;
        state.lastActiveStage = next;
      }
      saveState();
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
