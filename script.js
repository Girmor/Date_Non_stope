/**
 * Date Randomizer - Modern ES6+ Implementation
 * Інтерактивний рандомізатор подій для побачення
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  DELAY_MS: 30 * 1000, // 30 секунд для тестування (змініть на 15 * 60 * 1000 для 15 хвилин)
  STORAGE_KEY: 'dateRandomizerState_v2',
  USER_ID_KEY: 'dateRandomizerUserId',
  SPIN_DURATION: 2500,
  SPIN_INTERVAL: 80,
  SOUNDS_ENABLED_KEY: 'soundsEnabled',
  THEME_KEY: 'dateRandomizerTheme'
};

const DATE_OPTIONS = {
  stages: [
    {
      id: 'coffee',
      question: "Час кави ☕️, обирай де:",
      icon: "fa-mug-hot",
      emoji: "☕",
      options: [
        { text: "Parcoffka", image: "images/Kava_Parcoffka.jpg" },
        { text: "Кав'ярня «Кориця»", image: "images/Kava_koriza.jpg" },
        { text: "Бар «HIWAY»", image: "images/Kava_near_bik.jpg" },
        { text: "Вільна зона", image: "images/Kava_vilna_zona.jpg" }
      ]
    },
    {
      id: 'walk',
      question: "Прогуляємося? Обирай маршрут:",
      icon: "fa-person-walking",
      emoji: "🚶",
      options: [
        { text: "Сквер Івана Старова", image: "images/Prog_Parg_Starova.jpg" },
        { text: "Парк Шевченка", image: "images/Prog_Park_Shevshenka.jpg" },
        { text: "Яхт-клуб «Січ»", image: "images/Prog_yaht.jpg" },
        { text: "Парк Зелений Гай", image: "images/Prog_Zelen_dynopark.jpg" }
      ]
    },
    {
      id: 'food',
      question: "Щось я зголоднів, врятуєш мене:",
      icon: "fa-utensils",
      emoji: "🍽️",
      options: [
        { text: "Buon Fratelli", image: "images/Rest_Bioni.jpg" },
        { text: "BROOKS eats & drinks", image: "images/Rest_brooks.jpg" },
        { text: "Flip NEO", image: "images/Rest_flipneo.jpg" },
        { text: "Giannivino", image: "images/Rest_Giannivino.jpg" }
      ]
    },
    {
      id: 'movie',
      question: "Може глянемо фільм?",
      icon: "fa-film",
      emoji: "🎬",
      options: [
        { text: "Грішники", image: "images/Kino_grishniki.jpeg" },
        { text: "Громовержці", image: "images/Kino_gromovergi.jpg" },
        { text: "MINECRAFT", image: "images/Kino_minecrafte.jpg" }
      ]
    },
    {
      id: 'gift',
      question: "За твоє 'терпіння' — міні подарунок!",
      icon: "fa-gift",
      emoji: "🎁",
      options: [
        { text: "Квіти", image: "images/Podarik_kviti.jpg" },
        { text: "Рафаелки", image: "images/Podarik_rafaelo.jpeg" },
        { text: "Брелок", image: "images/Podarik_brelok.jpg" },
        { text: "Міні іграшка", image: "images/Podarik_snish.jpeg" }
      ]
    }
  ]
};

// ============================================
// UTILITIES
// ============================================

class Utils {
  static generateId() {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }

  static $(selector) {
    return document.querySelector(selector);
  }

  static $$(selector) {
    return document.querySelectorAll(selector);
  }

  static vibrate(pattern = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  static formatTime(ms) {
    const totalSeconds = Math.max(0, Math.floor(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }

  static async preloadImage(src) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  static randomItem(array) {
    return array[Math.floor(Math.random() * array.length)];
  }

  static easeOutQuad(t) {
    return t * (2 - t);
  }
}

// ============================================
// SOUND MANAGER
// ============================================

class SoundManager {
  constructor() {
    this.enabled = localStorage.getItem(CONFIG.SOUNDS_ENABLED_KEY) !== 'false';
    this.audioContext = null;
  }

  init() {
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      this.audioContext = new (AudioContext || webkitAudioContext)();
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem(CONFIG.SOUNDS_ENABLED_KEY, this.enabled);
    return this.enabled;
  }

  playClick() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(800, 0.05, 'sine');
  }

  playSuccess() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(523, 0.1, 'sine');
    setTimeout(() => this.playTone(659, 0.1, 'sine'), 100);
    setTimeout(() => this.playTone(784, 0.15, 'sine'), 200);
  }

  playSpin() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(400 + Math.random() * 200, 0.03, 'square');
  }

  playUnlock() {
    if (!this.enabled || !this.audioContext) return;
    this.playTone(440, 0.1, 'sine');
    setTimeout(() => this.playTone(554, 0.1, 'sine'), 150);
    setTimeout(() => this.playTone(659, 0.2, 'sine'), 300);
  }

  playTone(frequency, duration, type = 'sine') {
    if (!this.audioContext) return;
    
    try {
      const oscillator = this.audioContext.createOscillator();
      const gainNode = this.audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(this.audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + duration);
      
      oscillator.start(this.audioContext.currentTime);
      oscillator.stop(this.audioContext.currentTime + duration);
    } catch (e) {
      console.warn('Sound playback failed:', e);
    }
  }
}

// ============================================
// THEME MANAGER
// ============================================

class ThemeManager {
  constructor() {
    this.isDark = localStorage.getItem(CONFIG.THEME_KEY) === 'dark';
  }

  init() {
    this.apply();
  }

  toggle() {
    this.isDark = !this.isDark;
    localStorage.setItem(CONFIG.THEME_KEY, this.isDark ? 'dark' : 'light');
    this.apply();
    return this.isDark;
  }

  apply() {
    document.documentElement.setAttribute('data-theme', this.isDark ? 'dark' : 'light');
  }
}

// ============================================
// PARTICLES EFFECT
// ============================================

class ParticlesEffect {
  constructor(container) {
    this.container = container;
    this.particles = [];
    this.animationId = null;
  }

  init() {
    this.createParticles(30);
    this.animate();
  }

  createParticles(count) {
    const symbols = ['✨', '💫', '⭐', '🌟', '💖', '🎀', '🌸'];
    
    for (let i = 0; i < count; i++) {
      const particle = document.createElement('span');
      particle.className = 'particle';
      particle.textContent = Utils.randomItem(symbols);
      particle.style.cssText = `
        left: ${Math.random() * 100}%;
        top: ${Math.random() * 100}%;
        animation-delay: ${Math.random() * 5}s;
        animation-duration: ${5 + Math.random() * 10}s;
        font-size: ${0.8 + Math.random() * 1.2}rem;
        opacity: ${0.3 + Math.random() * 0.4};
      `;
      this.container.appendChild(particle);
      this.particles.push(particle);
    }
  }

  destroy() {
    this.particles.forEach(p => p.remove());
    this.particles = [];
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
  }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

class Toast {
  static show(message, type = 'info', duration = 3000) {
    const container = Utils.$('#toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      info: 'fa-info-circle',
      warning: 'fa-exclamation-triangle'
    };

    toast.innerHTML = `
      <i class="fas ${icons[type] || icons.info}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }
}

// ============================================
// STATE MANAGER
// ============================================

class StateManager {
  constructor() {
    this.state = this.getDefaultState();
    this.listeners = new Set();
  }

  getDefaultState() {
    return {
      userId: localStorage.getItem(CONFIG.USER_ID_KEY) || this.createUserId(),
      currentStep: 'intro-1',
      introCompleted: false,
      stages: DATE_OPTIONS.stages.map((_, index) => ({
        selectedIndex: null,
        confirmed: false,
        unlockTime: index === 0 ? 0 : null
      })),
      lastActiveStage: 0,
      pendingStage: null,
      pendingUnlockTime: null,
      farewellReached: false
    };
  }

  createUserId() {
    const id = Utils.generateId();
    localStorage.setItem(CONFIG.USER_ID_KEY, id);
    return id;
  }

  load() {
    try {
      const saved = localStorage.getItem(CONFIG.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        
        // Validate state
        if (parsed.userId !== this.state.userId) {
          console.log('User ID mismatch, resetting state');
          return this.reset();
        }
        
        if (!parsed.stages || parsed.stages.length !== DATE_OPTIONS.stages.length) {
          console.log('Stage count mismatch, resetting state');
          return this.reset();
        }

        this.state = { ...this.getDefaultState(), ...parsed };
        console.log('State loaded:', this.state);
      }
    } catch (e) {
      console.error('Error loading state:', e);
      this.reset();
    }
  }

  save() {
    try {
      localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(this.state));
      this.notify();
    } catch (e) {
      console.error('Error saving state:', e);
    }
  }

  reset() {
    this.state = this.getDefaultState();
    this.save();
  }

  update(changes) {
    this.state = { ...this.state, ...changes };
    this.save();
  }

  updateStage(index, changes) {
    const stages = [...this.state.stages];
    stages[index] = { ...stages[index], ...changes };
    this.update({ stages });
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.listeners.forEach(listener => listener(this.state));
  }

  get(key) {
    return this.state[key];
  }

  getStage(index) {
    return this.state.stages[index];
  }

  isStageConfirmed(index) {
    return this.state.stages[index]?.confirmed ?? false;
  }

  isStageUnlocked(index) {
    const stage = this.state.stages[index];
    if (!stage) return false;
    if (index === 0) return true;
    if (stage.unlockTime === null) return false;
    return Date.now() >= stage.unlockTime;
  }

  getNextUnconfirmedStage() {
    return this.state.stages.findIndex(s => !s.confirmed);
  }

  areAllStagesConfirmed() {
    return this.state.stages.every(s => s.confirmed);
  }

  clearAll() {
    localStorage.removeItem(CONFIG.STORAGE_KEY);
    this.reset();
  }
}

// ============================================
// PROGRESS BAR
// ============================================

class ProgressBar {
  constructor(container, stageCount) {
    this.container = container;
    this.stageCount = stageCount;
    this.steps = [];
  }

  init() {
    this.container.innerHTML = '<div class="progress-line"></div>';
    
    for (let i = 0; i < this.stageCount; i++) {
      const step = document.createElement('div');
      step.className = 'progress-step';
      step.dataset.index = i;
      step.innerHTML = `
        <div class="step-circle">
          <span class="step-number">${i + 1}</span>
          <i class="fas fa-check step-check"></i>
        </div>
        <span class="step-label">${DATE_OPTIONS.stages[i].emoji}</span>
      `;
      this.container.appendChild(step);
      this.steps.push(step);
    }
  }

  updateStep(index, completed) {
    const step = this.steps[index];
    if (step) {
      step.classList.toggle('completed', completed);
    }
  }

  show() {
    this.container.classList.add('visible');
  }

  hide() {
    this.container.classList.remove('visible');
  }
}

// ============================================
// TIMER
// ============================================

class Timer {
  constructor(element) {
    this.element = element;
    this.textElement = element.querySelector('.timer-text');
    this.intervalId = null;
    this.unlockTime = null;
    this.onComplete = null;
  }

  start(unlockTime, onComplete) {
    this.stop();
    this.unlockTime = unlockTime;
    this.onComplete = onComplete;
    
    this.element.classList.add('active');
    this.update();
    
    this.intervalId = setInterval(() => this.update(), 1000);
  }

  update() {
    const remaining = this.unlockTime - Date.now();
    
    if (remaining <= 0) {
      this.stop();
      if (this.onComplete) {
        this.onComplete();
      }
      return;
    }

    this.textElement.textContent = Utils.formatTime(remaining);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.element.classList.remove('active');
  }
}

// ============================================
// STAGE COMPONENT
// ============================================

class StageComponent {
  constructor(stageData, index, options = {}) {
    this.data = stageData;
    this.index = index;
    this.options = options;
    this.element = null;
    this.isSpinning = false;
  }

  render() {
    const stage = document.createElement('section');
    stage.className = 'stage-card glass-card locked';
    stage.dataset.index = this.index;
    stage.id = `stage-${this.index}`;

    stage.innerHTML = `
      <div class="card-glow"></div>
      <header class="stage-header">
        <div class="stage-icon">
          <i class="fas ${this.data.icon}"></i>
        </div>
        <h2 class="stage-title">${this.data.question}</h2>
      </header>
      
      <div class="stage-content">
        <div class="option-display">
          <div class="option-image-container">
            <img class="option-image" src="" alt="Обрана опція">
            <div class="image-overlay"></div>
          </div>
          <p class="option-name"></p>
        </div>
        
        <div class="stage-actions">
          <button class="btn btn-primary btn-spin">
            <i class="fas fa-dice"></i>
            <span>Обрати варіант</span>
          </button>
          
          <div class="confirm-actions">
            <button class="btn btn-success btn-confirm">
              <i class="fas fa-check"></i>
              <span>Підтверджую!</span>
            </button>
            <button class="btn btn-outline btn-retry">
              <i class="fas fa-redo"></i>
              <span>Інший варіант</span>
            </button>
          </div>
        </div>
      </div>
      
      <div class="stage-lock-overlay">
        <i class="fas fa-lock"></i>
        <p>Очікування...</p>
      </div>
    `;

    this.element = stage;
    this.bindEvents();
    return stage;
  }

  bindEvents() {
    const spinBtn = this.element.querySelector('.btn-spin');
    const confirmBtn = this.element.querySelector('.btn-confirm');
    const retryBtn = this.element.querySelector('.btn-retry');

    spinBtn.addEventListener('click', () => this.spin());
    confirmBtn.addEventListener('click', () => this.confirm());
    retryBtn.addEventListener('click', () => this.retry());
  }

  async spin() {
    if (this.isSpinning) return;
    this.isSpinning = true;

    const { onSpin, soundManager } = this.options;
    const display = this.element.querySelector('.option-display');
    const img = this.element.querySelector('.option-image');
    const name = this.element.querySelector('.option-name');
    const confirmActions = this.element.querySelector('.confirm-actions');
    const spinBtn = this.element.querySelector('.btn-spin');

    spinBtn.disabled = true;
    display.classList.add('visible', 'spinning');
    confirmActions.classList.remove('visible');

    Utils.vibrate([50, 30, 50]);

    const options = this.data.options;
    const cycles = Math.floor(CONFIG.SPIN_DURATION / CONFIG.SPIN_INTERVAL);
    let count = 0;

    await new Promise(resolve => {
      const interval = setInterval(() => {
        const opt = options[count % options.length];
        img.src = opt.image;
        name.textContent = opt.text;
        
        soundManager?.playSpin();
        
        count++;
        
        if (count >= cycles) {
          clearInterval(interval);
          resolve();
        }
      }, CONFIG.SPIN_INTERVAL);
    });

    // Final selection
    const selectedIndex = Math.floor(Math.random() * options.length);
    const selected = options[selectedIndex];
    
    img.src = selected.image;
    name.textContent = selected.text;
    
    display.classList.remove('spinning');
    confirmActions.classList.add('visible');
    spinBtn.disabled = false;
    this.isSpinning = false;

    soundManager?.playSuccess();
    Utils.vibrate(100);

    if (onSpin) {
      onSpin(this.index, selectedIndex);
    }
  }

  confirm() {
    const { onConfirm, soundManager } = this.options;
    const confirmActions = this.element.querySelector('.confirm-actions');
    const spinBtn = this.element.querySelector('.btn-spin');

    confirmActions.classList.remove('visible');
    spinBtn.classList.add('hidden');
    this.element.classList.add('confirmed');

    soundManager?.playSuccess();
    Utils.vibrate([100, 50, 100]);

    // Trigger confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#ff6b81', '#ffd700', '#9c27b0', '#ff9ff3']
      });
    }

    if (onConfirm) {
      onConfirm(this.index);
    }
  }

  retry() {
    const { onRetry } = this.options;
    const display = this.element.querySelector('.option-display');
    const confirmActions = this.element.querySelector('.confirm-actions');
    const spinBtn = this.element.querySelector('.btn-spin');

    display.classList.remove('visible');
    confirmActions.classList.remove('visible');
    spinBtn.disabled = false;

    if (onRetry) {
      onRetry(this.index);
    }
  }

  unlock() {
    this.element.classList.remove('locked');
    this.element.classList.add('unlocked');
    this.options.soundManager?.playUnlock();
  }

  lock() {
    this.element.classList.add('locked');
    this.element.classList.remove('unlocked');
  }

  setSelected(selectedIndex) {
    if (selectedIndex === null) return;
    
    const opt = this.data.options[selectedIndex];
    const display = this.element.querySelector('.option-display');
    const img = this.element.querySelector('.option-image');
    const name = this.element.querySelector('.option-name');
    
    img.src = opt.image;
    name.textContent = opt.text;
    display.classList.add('visible');
  }

  setConfirmed() {
    const spinBtn = this.element.querySelector('.btn-spin');
    spinBtn.classList.add('hidden');
    this.element.classList.add('confirmed');
  }
}

// ============================================
// ROADMAP GENERATOR
// ============================================

class RoadmapGenerator {
  constructor(stages, stateManager) {
    this.stages = stages;
    this.stateManager = stateManager;
  }

  async generate(container) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const confirmedStages = this.stages.filter((_, i) => 
      this.stateManager.isStageConfirmed(i)
    );

    const width = 600;
    const stageHeight = 180;
    const height = confirmedStages.length * stageHeight + 120;

    canvas.width = width;
    canvas.height = height;

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, '#fce4ec');
    gradient.addColorStop(0.5, '#f8bbd0');
    gradient.addColorStop(1, '#f3e5f5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Decorative pattern
    ctx.strokeStyle = 'rgba(255, 107, 129, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Title
    ctx.font = 'bold 28px "Playfair Display", serif';
    ctx.fillStyle = '#2d1b3e';
    ctx.textAlign = 'center';
    ctx.fillText('✨ Наш День ✨', width / 2, 45);

    // Date
    const today = new Date();
    ctx.font = '16px "Montserrat", sans-serif';
    ctx.fillStyle = '#666';
    ctx.fillText(today.toLocaleDateString('uk-UA', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }), width / 2, 75);

    // Path line
    const pathX = width / 2;
    let currentY = 100;

    ctx.strokeStyle = '#ff6b81';
    ctx.lineWidth = 4;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(pathX, currentY);
    ctx.lineTo(pathX, height - 30);
    ctx.stroke();
    ctx.setLineDash([]);

    // Load and draw stages
    for (let i = 0; i < this.stages.length; i++) {
      const stageState = this.stateManager.getStage(i);
      if (!stageState.confirmed || stageState.selectedIndex === null) continue;

      const stage = this.stages[i];
      const option = stage.options[stageState.selectedIndex];
      const y = currentY + 30;

      // Stage circle
      ctx.beginPath();
      ctx.arc(pathX, y, 25, 0, Math.PI * 2);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ff6b81';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Emoji
      ctx.font = '24px serif';
      ctx.fillStyle = '#2d1b3e';
      ctx.textAlign = 'center';
      ctx.fillText(stage.emoji, pathX, y + 8);

      // Text box
      const text = option.text;
      ctx.font = 'bold 16px "Montserrat", sans-serif';
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + 40;
      const boxHeight = 35;
      const boxX = pathX - boxWidth / 2;
      const boxY = y + 35;

      // Box background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 10);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = '#2d1b3e';
      ctx.textAlign = 'center';
      ctx.fillText(text, pathX, boxY + 23);

      currentY += stageHeight;
    }

    // Footer
    ctx.font = 'italic 14px "Montserrat", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('💖 Дякую за чудовий день! 💖', width / 2, height - 20);

    container.innerHTML = '';
    canvas.style.maxWidth = '100%';
    canvas.style.borderRadius = '15px';
    container.appendChild(canvas);

    return canvas;
  }

  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  download(canvas) {
    try {
      const link = document.createElement('a');
      link.download = `our-day-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      Toast.show('Роудмеп завантажено!', 'success');
    } catch (e) {
      console.error('Download failed:', e);
      Toast.show('Не вдалося завантажити', 'error');
    }
  }
}

// ============================================
// MAIN APP
// ============================================

class DateRandomizerApp {
  constructor() {
    this.stateManager = new StateManager();
    this.soundManager = new SoundManager();
    this.themeManager = new ThemeManager();
    this.particles = null;
    this.progressBar = null;
    this.timer = null;
    this.stageComponents = [];
    this.roadmapGenerator = null;
    this.canvas = null;
  }

  async init() {
    console.log('Initializing Date Randomizer App...');
    
    // Initialize managers
    this.stateManager.load();
    this.soundManager.init();
    this.themeManager.init();

    // Initialize particles
    const particlesContainer = Utils.$('#particles');
    if (particlesContainer) {
      this.particles = new ParticlesEffect(particlesContainer);
      this.particles.init();
    }

    // Initialize progress bar
    const progressBarElement = Utils.$('#progressBar');
    if (progressBarElement) {
      this.progressBar = new ProgressBar(progressBarElement, DATE_OPTIONS.stages.length);
      this.progressBar.init();
    }

    // Initialize timer
    const timerElement = Utils.$('#globalTimer');
    if (timerElement) {
      this.timer = new Timer(timerElement);
    }

    // Initialize roadmap generator
    this.roadmapGenerator = new RoadmapGenerator(DATE_OPTIONS.stages, this.stateManager);

    // Setup UI
    this.setupThemeToggle();
    this.setupSoundToggle();
    this.setupIntroNavigation();
    this.setupStages();
    this.setupFinalScreen();

    // Restore state
    this.restoreState();

    console.log('App initialized successfully');
  }

  setupThemeToggle() {
    const toggle = Utils.$('#themeToggle');
    if (!toggle) return;

    toggle.classList.toggle('dark', this.themeManager.isDark);

    toggle.addEventListener('click', () => {
      const isDark = this.themeManager.toggle();
      toggle.classList.toggle('dark', isDark);
      this.soundManager.playClick();
    });
  }

  setupSoundToggle() {
    const toggle = Utils.$('#soundToggle');
    if (!toggle) return;

    toggle.classList.toggle('muted', !this.soundManager.enabled);

    toggle.addEventListener('click', () => {
      const enabled = this.soundManager.toggle();
      toggle.classList.toggle('muted', !enabled);
      if (enabled) this.soundManager.playClick();
    });
  }

  setupIntroNavigation() {
    const buttons = Utils.$$('[data-next]');
    
    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const nextStep = btn.dataset.next;
        this.soundManager.playClick();
        Utils.vibrate(50);
        
        if (nextStep === 'stages') {
          this.startStages();
        } else {
          this.navigateToScreen(nextStep);
        }
      });
    });
  }

  navigateToScreen(screenId) {
    const currentScreen = Utils.$('.screen.active');
    const nextScreen = Utils.$(`#${screenId}`);

    if (!nextScreen) return;

    if (currentScreen) {
      currentScreen.classList.add('fade-out');
      setTimeout(() => {
        currentScreen.classList.remove('active', 'fade-out');
      }, 500);
    }

    setTimeout(() => {
      nextScreen.classList.add('active');
      this.stateManager.update({ currentStep: screenId });
    }, currentScreen ? 300 : 0);
  }

  setupStages() {
    const container = Utils.$('#stagesContainer');
    if (!container) return;

    DATE_OPTIONS.stages.forEach((stageData, index) => {
      const component = new StageComponent(stageData, index, {
        soundManager: this.soundManager,
        onSpin: (idx, selectedIndex) => {
          this.stateManager.updateStage(idx, { selectedIndex });
        },
        onConfirm: (idx) => this.handleStageConfirm(idx),
        onRetry: (idx) => {
          this.stateManager.updateStage(idx, { 
            selectedIndex: null, 
            confirmed: false 
          });
        }
      });

      container.appendChild(component.render());
      this.stageComponents.push(component);
    });
  }

  handleStageConfirm(index) {
    this.stateManager.updateStage(index, { confirmed: true });
    this.progressBar.updateStep(index, true);

    const isLast = index === DATE_OPTIONS.stages.length - 1;
    
    if (isLast) {
      // Show final screen after delay
      const unlockTime = Date.now() + CONFIG.DELAY_MS;
      this.stateManager.update({ 
        pendingStage: 'farewell',
        pendingUnlockTime: unlockTime
      });
      
      this.timer.start(unlockTime, () => this.showFinalScreen());
    } else {
      // Unlock next stage after delay
      const unlockTime = Date.now() + CONFIG.DELAY_MS;
      this.stateManager.updateStage(index + 1, { unlockTime });
      this.stateManager.update({ 
        pendingStage: index + 1,
        pendingUnlockTime: unlockTime,
        lastActiveStage: index + 1
      });
      
      this.timer.start(unlockTime, () => {
        this.stageComponents[index + 1].unlock();
        this.stateManager.update({ pendingStage: null, pendingUnlockTime: null });
        Toast.show('Новий етап розблоковано! 🎉', 'success');
      });
    }
  }

  startStages() {
    this.navigateToScreen('stages-active');
    
    const stagesContainer = Utils.$('#stagesContainer');
    if (stagesContainer) {
      stagesContainer.classList.add('active');
    }

    this.progressBar.show();
    
    // Update state
    this.stateManager.update({ 
      introCompleted: true,
      currentStep: 'stages'
    });

    // Unlock first stage
    setTimeout(() => {
      this.stageComponents[0].unlock();
    }, 500);

    // Hide intro screens
    Utils.$$('.intro-screen').forEach(screen => {
      screen.classList.remove('active');
    });
  }

  showFinalScreen() {
    const stagesContainer = Utils.$('#stagesContainer');
    const finalScreen = Utils.$('#final');

    if (stagesContainer) stagesContainer.classList.remove('active');
    if (finalScreen) finalScreen.classList.add('active');

    this.progressBar.hide();
    this.timer.stop();

    this.stateManager.update({ 
      farewellReached: true,
      pendingStage: null,
      pendingUnlockTime: null
    });

    // Generate roadmap
    const roadmapContainer = Utils.$('#roadmapContainer');
    if (roadmapContainer) {
      this.roadmapGenerator.generate(roadmapContainer).then(canvas => {
        this.canvas = canvas;
      });
    }

    // Celebration confetti
    if (typeof confetti === 'function') {
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#ff6b81', '#ffd700', '#9c27b0']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#ff6b81', '#ffd700', '#9c27b0']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    }

    this.setupEmojiRating();
  }

  setupFinalScreen() {
    const downloadBtn = Utils.$('#downloadRoadmap');
    if (downloadBtn) {
      downloadBtn.addEventListener('click', () => {
        if (this.canvas) {
          this.roadmapGenerator.download(this.canvas);
        }
      });
    }
  }

  setupEmojiRating() {
    const buttons = Utils.$$('.emoji-btn');
    
    const messages = {
      happy: 'Супер, радий, що тобі сподобалось! 😊',
      neutral: 'Дякую за відгук! Наступного разу буде краще! 🙂',
      sad: 'Вибач, якщо щось пішло не так... 💙',
      speechless: 'Без слів? Сподіваюсь, це добре! 😊',
      laughing: 'Класно, що було так весело! 🎉',
      inlove: 'О, здається, ти в захваті! Чудово! 💖'
    };

    buttons.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = btn.dataset.rating;
        const message = messages[rating] || 'Дякую за оцінку!';
        
        Toast.show(message, 'success', 4000);
        this.soundManager.playSuccess();
        Utils.vibrate([100, 50, 100, 50, 100]);

        // Add selected state
        buttons.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');

        // Reset after delay
        setTimeout(() => {
          if (confirm('Хочеш розпочати спочатку?')) {
            this.stateManager.clearAll();
            location.reload();
          }
        }, 2000);
      });
    });
  }

  restoreState() {
    const state = this.stateManager.state;
    console.log('Restoring state:', state);

    // If farewell reached, show final screen
    if (state.farewellReached && this.stateManager.areAllStagesConfirmed()) {
      this.showFinalScreen();
      return;
    }

    // If intro completed, show stages
    if (state.introCompleted) {
      Utils.$$('.intro-screen').forEach(screen => {
        screen.classList.remove('active');
      });

      const stagesContainer = Utils.$('#stagesContainer');
      if (stagesContainer) stagesContainer.classList.add('active');
      
      this.progressBar.show();

      // Restore stage states
      this.stageComponents.forEach((component, index) => {
        const stageState = state.stages[index];
        
        // Update progress bar
        if (stageState.confirmed) {
          this.progressBar.updateStep(index, true);
          component.unlock();
          component.setSelected(stageState.selectedIndex);
          component.setConfirmed();
        } else if (this.stateManager.isStageUnlocked(index)) {
          component.unlock();
          if (stageState.selectedIndex !== null) {
            component.setSelected(stageState.selectedIndex);
          }
        }
      });

      // Resume pending countdown
      if (state.pendingStage !== null && state.pendingUnlockTime) {
        const remaining = state.pendingUnlockTime - Date.now();
        
        if (remaining > 0) {
          if (state.pendingStage === 'farewell') {
            this.timer.start(state.pendingUnlockTime, () => this.showFinalScreen());
          } else {
            this.timer.start(state.pendingUnlockTime, () => {
              this.stageComponents[state.pendingStage].unlock();
              this.stateManager.update({ pendingStage: null, pendingUnlockTime: null });
              Toast.show('Новий етап розблоковано! 🎉', 'success');
            });
          }
        } else {
          // Time already passed
          if (state.pendingStage === 'farewell') {
            this.showFinalScreen();
          } else {
            this.stageComponents[state.pendingStage].unlock();
            this.stateManager.update({ pendingStage: null, pendingUnlockTime: null });
          }
        }
      }

      return;
    }

    // Show appropriate intro screen
    const currentStep = state.currentStep || 'intro-1';
    this.navigateToScreen(currentStep);
  }
}

// ============================================
// INITIALIZE APP
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  const app = new DateRandomizerApp();
  app.init();
});

// Handle visibility change (for timer accuracy)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    // Force timer update when tab becomes visible
    const timerElement = Utils.$('#globalTimer');
    if (timerElement?.classList.contains('active')) {
      // Timer will auto-update on next interval
    }
  }
});
