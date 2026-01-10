/**
 * Date Randomizer - Modern ES6+ Implementation
 * Інтерактивний рандомізатор подій для побачення
 */

// ============================================
// CONFIGURATION
// ============================================

const CONFIG = {
  DELAY_MS: 5 * 1000, // 5 секунд для тестування (змініть на 15 * 60 * 1000 для 15 хвилин)
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

  playMystic() {
    if (!this.enabled || !this.audioContext) return;

    try {
      const ctx = this.audioContext;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Містичний sweep effect
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);

      osc.connect(gain).connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.warn('Mystic sound playback failed:', e);
    }
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

const THEMES = {
  light: {
    name: 'Світла',
    icon: '☀️',
    primary: '#ff6b81',
    secondary: '#9c27b0',
    accent: '#ffd700',
    bgGradientStart: '#fce4ec',
    bgGradientMiddle: '#f8bbd0',
    bgGradientEnd: '#f3e5f5',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    textPrimary: '#2d1b3e',
    textSecondary: '#666'
  },
  dark: {
    name: 'Темна',
    icon: '🌙',
    primary: '#ff6b81',
    secondary: '#bb86fc',
    accent: '#ffd700',
    bgGradientStart: '#1a1a2e',
    bgGradientMiddle: '#16213e',
    bgGradientEnd: '#0f0f23',
    glassBg: 'rgba(30, 30, 50, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#e0e0e0',
    textSecondary: '#b0b0b0'
  },
  sunset: {
    name: 'Захід',
    icon: '🌅',
    primary: '#FF6B6B',
    secondary: '#FFD93D',
    accent: '#6C5CE7',
    bgGradientStart: '#FF6B6B',
    bgGradientMiddle: '#FFB347',
    bgGradientEnd: '#FFD93D',
    glassBg: 'rgba(255, 255, 255, 0.8)',
    glassBorder: 'rgba(255, 255, 255, 0.4)',
    textPrimary: '#2d1b3e',
    textSecondary: '#555'
  },
  ocean: {
    name: 'Океан',
    icon: '🌊',
    primary: '#4ECDC4',
    secondary: '#556FB5',
    accent: '#44A08D',
    bgGradientStart: '#e0f7fa',
    bgGradientMiddle: '#80deea',
    bgGradientEnd: '#b2dfdb',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    textPrimary: '#1a3a52',
    textSecondary: '#4a6b7c'
  },
  lavender: {
    name: 'Лаванда',
    icon: '💜',
    primary: '#9D84B7',
    secondary: '#C5A3FF',
    accent: '#E0BBE4',
    bgGradientStart: '#f4e7ff',
    bgGradientMiddle: '#e5d4ff',
    bgGradientEnd: '#d1b3ff',
    glassBg: 'rgba(255, 255, 255, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    textPrimary: '#3d2951',
    textSecondary: '#6d5b7b'
  },
  roseGold: {
    name: 'Рожеве золото',
    icon: '✨',
    primary: '#E8B4B8',
    secondary: '#D4A5A5',
    accent: '#F5CBA7',
    bgGradientStart: '#ffeef0',
    bgGradientMiddle: '#ffe4e6',
    bgGradientEnd: '#ffd6d9',
    glassBg: 'rgba(255, 255, 255, 0.9)',
    glassBorder: 'rgba(255, 255, 255, 0.6)',
    textPrimary: '#5d3a3a',
    textSecondary: '#8a6969'
  },
  midnight: {
    name: 'Опівніч',
    icon: '🌌',
    primary: '#667EEA',
    secondary: '#764BA2',
    accent: '#F093FB',
    bgGradientStart: '#0f0c29',
    bgGradientMiddle: '#302b63',
    bgGradientEnd: '#24243e',
    glassBg: 'rgba(20, 20, 40, 0.85)',
    glassBorder: 'rgba(255, 255, 255, 0.15)',
    textPrimary: '#e8e8ff',
    textSecondary: '#b8b8d0'
  },
  mystic: {
    name: 'Місячна магія',
    icon: '🔮',
    primary: '#B565D8',
    secondary: '#FFD700',
    accent: '#E0C3FC',
    bgGradientStart: '#2D1B40',
    bgGradientMiddle: '#6B2E8C',
    bgGradientEnd: '#2D1B40',
    glassBg: 'rgba(181, 101, 216, 0.15)',
    glassBorder: 'rgba(181, 101, 216, 0.35)',
    textPrimary: '#F0E6FF',
    textSecondary: '#C8B8D4',
    glow: '0 0 25px rgba(181, 101, 216, 0.6), 0 0 50px rgba(181, 101, 216, 0.4)',
    particleColor: '#FFD700'
  }
};

class ThemeManager {
  constructor() {
    const savedTheme = localStorage.getItem(CONFIG.THEME_KEY);

    // Migrate from old light/dark system
    if (savedTheme === 'light' || savedTheme === 'dark') {
      this.currentTheme = savedTheme;
    } else if (savedTheme && THEMES[savedTheme]) {
      this.currentTheme = savedTheme;
    } else {
      this.currentTheme = 'mystic';
    }

    // Legacy support
    this.isDark = this.currentTheme === 'dark' || this.currentTheme === 'midnight' || this.currentTheme === 'mystic';
  }

  init() {
    this.apply();
  }

  toggle() {
    // Simple toggle between light and dark for backward compatibility
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.isDark = this.currentTheme === 'dark';
    localStorage.setItem(CONFIG.THEME_KEY, this.currentTheme);
    this.apply();
    return this.isDark;
  }

  setTheme(themeName) {
    if (!THEMES[themeName]) {
      console.error('Theme not found:', themeName);
      return false;
    }

    this.currentTheme = themeName;
    this.isDark = themeName === 'dark' || themeName === 'midnight' || themeName === 'mystic';
    localStorage.setItem(CONFIG.THEME_KEY, themeName);
    this.apply();
    return true;
  }

  apply() {
    const theme = THEMES[this.currentTheme];
    if (!theme) return;

    // Apply data-theme attribute with actual theme name for mystic styles
    document.documentElement.setAttribute('data-theme', this.currentTheme);

    // Apply CSS variables for the selected theme
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.primary);
    root.style.setProperty('--color-secondary', theme.secondary);
    root.style.setProperty('--color-accent', theme.accent);
    root.style.setProperty('--bg-gradient-start', theme.bgGradientStart);
    root.style.setProperty('--bg-gradient-middle', theme.bgGradientMiddle);
    root.style.setProperty('--bg-gradient-end', theme.bgGradientEnd);
    root.style.setProperty('--glass-bg', theme.glassBg);
    root.style.setProperty('--glass-border', theme.glassBorder);
    root.style.setProperty('--text-primary', theme.textPrimary);
    root.style.setProperty('--text-secondary', theme.textSecondary);

    // Apply mystic-specific properties if they exist
    if (theme.glow) {
      root.style.setProperty('--mystic-glow', theme.glow);
    }
    if (theme.particleColor) {
      root.style.setProperty('--mystic-particle-color', theme.particleColor);
    }
  }

  getCurrentTheme() {
    return this.currentTheme;
  }

  getThemeList() {
    return Object.entries(THEMES).map(([key, theme]) => ({
      key,
      name: theme.name,
      icon: theme.icon
    }));
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
    this.mousePos = { x: -1000, y: -1000 };
    this.setupMouseTracking();
  }

  init() {
    this.createParticles(30);
    this.animate();
  }

  setupMouseTracking() {
    // Skip on touch devices for performance
    if ('ontouchstart' in window) return;

    document.addEventListener('mousemove', (e) => {
      this.mousePos.x = e.clientX;
      this.mousePos.y = e.clientY;
      this.updateParticlePositions();
    });
  }

  updateParticlePositions() {
    this.particles.forEach((particle, index) => {
      const rect = particle.getBoundingClientRect();
      const particleX = rect.left + rect.width / 2;
      const particleY = rect.top + rect.height / 2;

      const distance = Math.hypot(
        this.mousePos.x - particleX,
        this.mousePos.y - particleY
      );

      const interactionRadius = 150;

      if (distance < interactionRadius) {
        const angle = Math.atan2(
          particleY - this.mousePos.y,
          particleX - this.mousePos.x
        );
        const force = (interactionRadius - distance) / interactionRadius;
        const offsetX = Math.cos(angle) * force * 40;
        const offsetY = Math.sin(angle) * force * 40;
        const scale = 1 + force * 0.5;

        particle.style.transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`;
        particle.style.transition = 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
      } else {
        particle.style.transform = '';
        particle.style.transition = 'transform 0.5s ease-out';
      }
    });
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

  animate() {
    // Particles are animated via CSS, this method is just a placeholder
    // to satisfy the init() call
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
// TRANSITION MANAGER
// ============================================

class TransitionManager {
  static async transition(fromElement, toElement, type = 'slide') {
    if (!fromElement || !toElement) return;

    const duration = 600; // ms

    // Apply exit animation
    fromElement.classList.add(`transition-${type}-out`);

    await this.wait(duration / 2);

    // Switch visibility
    fromElement.classList.remove('active');
    toElement.classList.add('active');

    // Apply enter animation
    toElement.classList.add(`transition-${type}-in`);

    await this.wait(duration / 2);

    // Cleanup
    fromElement.classList.remove(`transition-${type}-out`);
    toElement.classList.remove(`transition-${type}-in`);
  }

  static wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  static getRandomTransition() {
    const types = ['slide', 'fade', 'zoom', 'flip'];
    return types[Math.floor(Math.random() * types.length)];
  }
}

// ============================================
// CONVERSATION TOPICS DATA
// ============================================

const CONVERSATION_TOPICS = {
  fun: [
    "Яке твоє найдивніше хобі або захоплення?",
    "Якби ти міг телепортуватись в будь-яку точку світу прямо зараз, куди б поїхав?",
    "Яка твоя суперсила в ідеальному світі?",
    "Якби ти міг мати будь-яку тварину як домашню, навіть екзотичну, яку б обрав?",
    "Яка найсмішніша ситуація траплялась з тобою в громадському місці?",
    "Якби ти міг стати експертом в чомусь за одну ніч, що б це було?",
    "Яка пісня завжди піднімає тобі настрій?",
    "Якби ти міг змінити одну річ у своєму житті без наслідків, що б це було?",
    "Який твій найбільш embarrassing момент з дитинства?",
    "Якби ти міг створити свій власний святковий день, що б це було?",
    "Яке твоє найнезвичайніше кулінарне поєднання, яке тобі подобається?",
    "Якби ти міг мати обід з будь-якою людиною (живою чи мертвою), хто б це був?"
  ],
  deep: [
    "Який найкращий спогад з дитинства?",
    "Що тебе найбільше мотивує у житті?",
    "Яка твоя найбільша мрія?",
    "Що б ти змінив у собі, якби міг?",
    "Яка найважливіша цінність для тебе?",
    "Чого ти найбільше боїшся у житті?",
    "Який момент змінив твоє життя назавжди?",
    "Що робить тебе щасливим?",
    "Яким ти бачиш себе через 5 років?",
    "Що тебе надихає ставати кращою версією себе?",
    "Яка твоя найбільша життєва філософія?",
    "Що для тебе означає успіх?"
  ],
  romantic: [
    "Яке твоє ідеальне побачення?",
    "Що для тебе найважливіше у стосунках?",
    "Який твій love language (мова кохання)?",
    "Яка найромантичніша річ, яку хтось зробив для тебе?",
    "Вірив/вірила ти в кохання з першого погляду?",
    "Яке місце ти б хотів/хотіла відвідати разом з коханою людиною?",
    "Що робить момент особливим для тебе?",
    "Яка пісня нагадує тобі про кохання?",
    "Який найкращий комплімент ти отримував/отримувала?",
    "Як ти розумієш, що закохався/закохалась?",
    "Що для тебе означає бути коханим/коханою?",
    "Яке твоє найтепліше спогад про стосунки?"
  ],
  unusual: [
    "Якби ти міг говорити з тваринами, яких би ти обрав?",
    "В якій історичній епосі ти б хотів/хотіла пожити?",
    "Якби ти писав автобіографію, яка була б її назва?",
    "Який незвичайний талант у тебе є?",
    "Якби ти міг змінити одне правило у світі, що б це було?",
    "Яка найдивніша річ у твоєму списку бажань?",
    "Якби ти міг мати розмову зі своїм майбутнім 'я', що б запитав?",
    "Який альтернативний шлях кар'єри тебе приваблює?",
    "Якби ти міг створити нову традицію, яка б це була?",
    "Що найнезвичайнішого ти вивчив/вивчила останнім часом?",
    "Якби твоє життя було фільмом, який жанр це був би?",
    "Який найбільш випадковий факт про тебе?",
    "Якби ти міг мати магічну здібність на один день, яку б обрав?"
  ],
  icebreakers: [
    "Що найкраще сталося сьогодні?",
    "Яка твоя улюблена пора року і чому?",
    "Який фільм ти можеш переглядати безліч разів?",
    "Який твій улюблений спосіб провести вихідні?",
    "Кава чи чай? І як саме ти любиш?",
    "Яка твоя comfort food (їжа для комфорту)?",
    "Який подарунок тебе найбільше здивував?",
    "Куди ти любиш подорожувати?",
    "Яка книга справила на тебе найбільше враження?",
    "Який твій улюблений ресторан чи кафе?",
    "Що тобі подобається робити для релаксу?",
    "Який твій улюблений вид мистецтва?"
  ]
};

// ============================================
// CONVERSATION TOPICS COMPONENT
// ============================================

class ConversationTopics {
  constructor() {
    this.element = null;
    this.currentCategory = 'fun';
    this.currentTopicIndex = 0;
    this.favorites = JSON.parse(localStorage.getItem('favoriteTopics') || '[]');
    this.usedTopics = new Set();
  }

  render() {
    const container = document.createElement('div');
    container.className = 'conversation-topics glass-card';
    container.innerHTML = `
      <div class="topics-header">
        <h3 class="topics-title">💬 Ідеї для розмови</h3>
        <p class="topics-subtitle">Якщо не знаєш про що поговорити...</p>
      </div>

      <div class="topics-categories">
        <button class="topic-category-btn active" data-category="fun">
          😄 Веселі
        </button>
        <button class="topic-category-btn" data-category="deep">
          💭 Глибокі
        </button>
        <button class="topic-category-btn" data-category="romantic">
          💕 Романтичні
        </button>
        <button class="topic-category-btn" data-category="unusual">
          🎲 Незвичайні
        </button>
        <button class="topic-category-btn" data-category="icebreakers">
          🧊 Початок
        </button>
      </div>

      <div class="topic-card-container">
        <div class="topic-card mystic-card">
          <div class="topic-content">
            <p class="topic-text"></p>
          </div>
          <button class="topic-favorite-btn" aria-label="Додати до улюблених">
            <i class="fas fa-star"></i>
          </button>
        </div>
      </div>

      <div class="topics-actions">
        <button class="btn btn-outline topic-next-btn">
          <i class="fas fa-sync-alt"></i>
          <span>Наступна тема</span>
        </button>
        <button class="btn btn-secondary topic-favorites-btn">
          <i class="fas fa-heart"></i>
          <span>Улюблені (<span class="favorites-count">0</span>)</span>
        </button>
      </div>
    `;

    this.element = container;
    this.bindEvents();
    this.showRandomTopic();
    this.updateFavoritesCount();

    return container;
  }

  bindEvents() {
    // Category buttons
    const categoryBtns = this.element.querySelectorAll('.topic-category-btn');
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.dataset.category;
        this.showRandomTopic();
      });
    });

    // Next topic button
    const nextBtn = this.element.querySelector('.topic-next-btn');
    nextBtn.addEventListener('click', () => {
      this.showRandomTopic();
      Utils.vibrate(30);
    });

    // Favorite button
    const favBtn = this.element.querySelector('.topic-favorite-btn');
    favBtn.addEventListener('click', () => {
      this.toggleFavorite();
    });

    // Favorites button
    const favsBtn = this.element.querySelector('.topic-favorites-btn');
    favsBtn.addEventListener('click', () => {
      this.showFavorites();
    });
  }

  showRandomTopic() {
    const topics = CONVERSATION_TOPICS[this.currentCategory];
    const availableTopics = topics.filter((_, index) =>
      !this.usedTopics.has(`${this.currentCategory}-${index}`)
    );

    // Якщо всі теми використані, скидаємо
    if (availableTopics.length === 0) {
      this.usedTopics.clear();
      this.showRandomTopic();
      return;
    }

    const randomIndex = Math.floor(Math.random() * topics.length);
    const topic = topics[randomIndex];

    this.usedTopics.add(`${this.currentCategory}-${randomIndex}`);
    this.currentTopicIndex = randomIndex;

    const topicText = this.element.querySelector('.topic-text');
    const topicCard = this.element.querySelector('.topic-card');

    // Анімація зміни тексту
    topicCard.style.opacity = '0';
    topicCard.style.transform = 'scale(0.95)';

    setTimeout(() => {
      topicText.textContent = topic;
      topicCard.style.opacity = '1';
      topicCard.style.transform = 'scale(1)';
      this.updateFavoriteButton();
    }, 200);
  }

  toggleFavorite() {
    const topic = CONVERSATION_TOPICS[this.currentCategory][this.currentTopicIndex];
    const favoriteKey = `${this.currentCategory}-${this.currentTopicIndex}`;

    const index = this.favorites.indexOf(favoriteKey);
    if (index > -1) {
      this.favorites.splice(index, 1);
      Toast.show('Видалено з улюблених', 'info');
    } else {
      this.favorites.push(favoriteKey);
      Toast.show('Додано до улюблених!', 'success');
      Utils.vibrate([50, 30, 50]);
    }

    localStorage.setItem('favoriteTopics', JSON.stringify(this.favorites));
    this.updateFavoriteButton();
    this.updateFavoritesCount();
  }

  updateFavoriteButton() {
    const favoriteKey = `${this.currentCategory}-${this.currentTopicIndex}`;
    const isFavorite = this.favorites.includes(favoriteKey);
    const favBtn = this.element.querySelector('.topic-favorite-btn');

    if (isFavorite) {
      favBtn.classList.add('active');
      favBtn.innerHTML = '<i class="fas fa-star"></i>';
    } else {
      favBtn.classList.remove('active');
      favBtn.innerHTML = '<i class="far fa-star"></i>';
    }
  }

  updateFavoritesCount() {
    const countEl = this.element.querySelector('.favorites-count');
    countEl.textContent = this.favorites.length;
  }

  showFavorites() {
    if (this.favorites.length === 0) {
      Toast.show('У вас ще немає улюблених тем', 'info');
      return;
    }

    // Показати модальне вікно з улюбленими темами
    const favoritesHtml = this.favorites.map(key => {
      const [category, index] = key.split('-');
      const topic = CONVERSATION_TOPICS[category][parseInt(index)];
      return `<div class="favorite-item">
        <span class="favorite-emoji">${this.getCategoryEmoji(category)}</span>
        <p>${topic}</p>
      </div>`;
    }).join('');

    const modal = document.createElement('div');
    modal.className = 'topics-modal';
    modal.innerHTML = `
      <div class="topics-modal-content glass-card">
        <button class="topics-modal-close">&times;</button>
        <h3>💖 Ваші улюблені теми</h3>
        <div class="favorites-list">${favoritesHtml}</div>
      </div>
    `;

    document.body.appendChild(modal);
    setTimeout(() => modal.classList.add('active'), 10);

    modal.querySelector('.topics-modal-close').addEventListener('click', () => {
      modal.classList.remove('active');
      setTimeout(() => modal.remove(), 300);
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('active');
        setTimeout(() => modal.remove(), 300);
      }
    });
  }

  getCategoryEmoji(category) {
    const emojis = {
      fun: '😄',
      deep: '💭',
      romantic: '💕',
      unusual: '🎲',
      icebreakers: '🧊'
    };
    return emojis[category] || '💬';
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
// GRID STAGE COMPONENT (Новий дизайн з сіткою)
// ============================================

class GridStageComponent {
  constructor(stageData, index, options = {}) {
    this.data = stageData;
    this.index = index;
    this.options = options;
    this.element = null;
    this.selectedIndex = null;
  }

  render() {
    const stage = document.createElement('section');
    stage.className = 'stage-card glass-card locked grid-mode';
    stage.dataset.index = this.index;
    stage.id = `stage-${this.index}`;

    stage.innerHTML = `
      <div class="card-glow"></div>

      <header class="stage-header modern">
        <div class="stage-icon-wrapper">
          <div class="stage-icon modern">
            <i class="fas ${this.data.icon}"></i>
          </div>
          <span class="stage-emoji-large">${this.data.emoji}</span>
        </div>
        <div class="stage-title-wrapper">
          <h2 class="stage-title modern">${this.data.question}</h2>
          <p class="stage-subtitle">Обери один варіант:</p>
        </div>
      </header>

      <div class="stage-content grid-content">
        <div class="options-grid">
          ${this.renderOptionsGrid()}
        </div>

        <div class="stage-actions modern">
          <button class="btn btn-confirm-modern" disabled>
            <i class="fas fa-check-circle"></i>
            <span>Підтвердити вибір</span>
          </button>
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

  renderOptionsGrid() {
    return this.data.options.map((option, index) => `
      <div class="option-card" data-index="${index}">
        <div class="option-card-inner">
          <div class="option-image-wrapper">
            <img src="${option.image}" alt="${option.text}" class="option-image">
            <div class="option-overlay">
              <i class="fas fa-check-circle option-check"></i>
            </div>
          </div>
          <div class="option-info">
            <h3 class="option-title">${option.text}</h3>
            <div class="option-badge">
              <i class="fas fa-heart"></i>
            </div>
          </div>
        </div>
      </div>
    `).join('');
  }

  bindEvents() {
    const optionCards = this.element.querySelectorAll('.option-card');
    const confirmBtn = this.element.querySelector('.btn-confirm-modern');

    optionCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        if (this.element.classList.contains('locked')) return;

        this.selectOption(index);
        this.options.soundManager?.playClick();
        Utils.vibrate(50);
      });
    });

    confirmBtn.addEventListener('click', () => {
      if (this.selectedIndex !== null) {
        this.confirm();
      }
    });
  }

  selectOption(index) {
    this.selectedIndex = index;

    // Remove selection from all cards
    const cards = this.element.querySelectorAll('.option-card');
    cards.forEach(card => card.classList.remove('selected'));

    // Add selection to clicked card
    cards[index].classList.add('selected');

    // Enable confirm button
    const confirmBtn = this.element.querySelector('.btn-confirm-modern');
    confirmBtn.disabled = false;

    // Save to state
    if (this.options.onSpin) {
      this.options.onSpin(this.index, index);
    }
  }

  confirm() {
    const { onConfirm, soundManager } = this.options;

    this.element.classList.add('confirmed');
    soundManager?.playSuccess();
    Utils.vibrate([100, 50, 100]);

    // Trigger confetti
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 150,
        spread: 90,
        origin: { y: 0.6 },
        colors: ['#ff6b81', '#ffd700', '#9c27b0', '#ff9ff3']
      });
    }

    if (onConfirm) {
      onConfirm(this.index);
    }
  }

  unlock() {
    this.element.classList.remove('locked');
    this.element.classList.add('unlocked');

    // Animate cards appearing
    const cards = this.element.querySelectorAll('.option-card');
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add('appear');
      }, index * 100);
    });

    this.options.soundManager?.playUnlock();
  }

  lock() {
    this.element.classList.add('locked');
    this.element.classList.remove('unlocked');
  }

  setSelected(selectedIndex) {
    if (selectedIndex !== null) {
      this.selectOption(selectedIndex);
    }
  }

  isLocked() {
    return this.element?.classList.contains('locked') ?? true;
  }
}

// ============================================
// STAGE COMPONENT (Old design - kept for reference)
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

    // Add 3D flip animation
    this.element.style.transformStyle = 'preserve-3d';
    this.element.classList.add('card-flipping');

    setTimeout(() => {
      this.element.classList.add('unlocked');
      this.element.classList.remove('card-flipping');
    }, 400);

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
// MYSTIC STAGE COMPONENT - Tarot Card Carousel
// ============================================

class MysticStageComponent extends StageComponent {
  render() {
    const stage = document.createElement('section');
    stage.className = 'stage-card mystic-tarot-card glass-card locked';
    stage.dataset.index = this.index;
    stage.id = `stage-${this.index}`;

    stage.innerHTML = `
      <div class="card-glow"></div>

      <div class="floating-stars-container">
        ${this.generateStars()}
      </div>

      <header class="stage-header mystic-header">
        <div class="stage-icon mystic-icon">
          <i class="fas ${this.data.icon}"></i>
        </div>
        <h2 class="stage-title mystic-title">${this.data.question}</h2>
      </header>

      <div class="stage-content mystic-content">
        <div class="mystic-carousel-container">
          <div class="option-display mystic-display">
            <div class="mystic-card-wrapper">
              <div class="mystic-card-inner">
                <div class="mystic-card-front">
                  <div class="card-back-pattern">🔮</div>
                </div>
                <div class="mystic-card-back">
                  <img class="option-image mystic-image" src="" alt="Обрана опція">
                  <div class="image-mystic-frame"></div>
                </div>
              </div>
            </div>
            <p class="option-name mystic-name"></p>
          </div>
        </div>

        <div class="stage-actions mystic-actions">
          <button class="btn btn-primary btn-spin mystic-btn">
            <div class="magic-circle"></div>
            <i class="fas fa-hand-sparkles"></i>
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

  generateStars() {
    let stars = '';
    for (let i = 0; i < 8; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 3;
      stars += `<div class="floating-star" style="left: ${left}%; top: ${top}%; animation-delay: ${delay}s;">✨</div>`;
    }
    return stars;
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
    const cardWrapper = this.element.querySelector('.mystic-card-wrapper');
    const img = this.element.querySelector('.option-image');
    const name = this.element.querySelector('.option-name');
    const confirmActions = this.element.querySelector('.confirm-actions');
    const spinBtn = this.element.querySelector('.btn-spin');

    spinBtn.disabled = true;
    confirmActions.classList.remove('visible');

    // Містичний ефект та звук
    this.element.classList.add('mystic-spinning');
    soundManager?.playMystic?.();

    Utils.vibrate([50, 30, 50]);

    const options = this.data.options;

    // Спочатку вибираємо випадковий результат
    const selectedIndex = Math.floor(Math.random() * options.length);
    const selected = options[selectedIndex];

    // Встановлюємо картинку до початку анімації
    img.src = selected.image;
    name.textContent = selected.text;

    // Показуємо display
    display.classList.add('visible');

    // Короткий spin ефект з обертанням
    const cycles = 20; // Менше циклів для швидшого ефекту
    let count = 0;

    await new Promise(resolve => {
      const interval = setInterval(() => {
        // Обертання картки
        cardWrapper.style.transform = `rotateY(${count * 30}deg)`;
        soundManager?.playSpin();
        count++;

        if (count >= cycles) {
          clearInterval(interval);
          resolve();
        }
      }, 50); // Швидше обертання
    });

    // Фінальний flip щоб показати картинку
    cardWrapper.style.transform = '';
    cardWrapper.classList.add('flipped');

    this.element.classList.remove('mystic-spinning');
    confirmActions.classList.add('visible');
    spinBtn.disabled = false;
    this.isSpinning = false;

    soundManager?.playSuccess();
    // Сильна вібрація при показі результату
    Utils.vibrate([200, 100, 200]);

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
        colors: ['#9D84FF', '#FFD700', '#E0C3FC', '#ff9ff3']
      });
    }

    if (onConfirm) {
      onConfirm(this.index);
    }
  }

  retry() {
    const { onRetry } = this.options;
    const display = this.element.querySelector('.option-display');
    const cardWrapper = this.element.querySelector('.mystic-card-wrapper');
    const confirmActions = this.element.querySelector('.confirm-actions');
    const spinBtn = this.element.querySelector('.btn-spin');

    cardWrapper.classList.remove('flipped');
    cardWrapper.style.transform = '';
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
    const cardWrapper = this.element.querySelector('.mystic-card-wrapper');
    const img = this.element.querySelector('.option-image');
    const name = this.element.querySelector('.option-name');

    img.src = opt.image;
    name.textContent = opt.text;
    display.classList.add('visible');
    cardWrapper.classList.add('flipped');
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
    const stageHeight = 140; // Зменшено з 180
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

      // Завантажити і намалювати міні-фото
      try {
        const img = new Image();
        img.src = option.image;
        await new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // Продовжити навіть якщо фото не завантажилось
        });

        // Малюємо круглу міні-фотографію
        const imgSize = 60;
        const imgX = pathX - 120; // Зліва від центру
        const imgY = y - imgSize / 2;

        ctx.save();
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(img, imgX, imgY, imgSize, imgSize);
        ctx.restore();

        // Рамка навколо фото
        ctx.beginPath();
        ctx.arc(imgX + imgSize / 2, imgY + imgSize / 2, imgSize / 2, 0, Math.PI * 2);
        ctx.strokeStyle = '#ffd700';
        ctx.lineWidth = 3;
        ctx.stroke();
      } catch (e) {
        console.warn('Failed to load image:', option.image);
      }

      // Stage circle з емоджі
      ctx.beginPath();
      ctx.arc(pathX, y, 20, 0, Math.PI * 2); // Зменшено з 25 до 20
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.strokeStyle = '#ff6b81';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Emoji
      ctx.font = '20px serif'; // Зменшено з 24px
      ctx.fillStyle = '#2d1b3e';
      ctx.textAlign = 'center';
      ctx.fillText(stage.emoji, pathX, y + 7);

      // Text box
      const text = option.text;
      ctx.font = 'bold 14px "Montserrat", sans-serif'; // Зменшено з 16px
      const textWidth = ctx.measureText(text).width;
      const boxWidth = textWidth + 30; // Зменшено padding
      const boxHeight = 30; // Зменшено з 35
      const boxX = pathX - boxWidth / 2;
      const boxY = y + 30; // Зменшено відступ

      // Box background
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      this.roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 8);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Text
      ctx.fillStyle = '#2d1b3e';
      ctx.textAlign = 'center';
      ctx.fillText(text, pathX, boxY + 20);

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
    this.conversationTopics = null;
  }

  async init() {
    console.log('🚀 Initializing Date Randomizer App...');
    
    try {
      // Initialize managers
      this.stateManager.load();
      this.soundManager.init();
      this.themeManager.init();
      console.log('✅ Managers initialized');

      // Initialize particles
      const particlesContainer = Utils.$('#particles');
      if (particlesContainer) {
        this.particles = new ParticlesEffect(particlesContainer);
        this.particles.init();
        console.log('✅ Particles initialized');
      }

      // Initialize progress bar
      const progressBarElement = Utils.$('#progressBar');
      if (progressBarElement) {
        this.progressBar = new ProgressBar(progressBarElement, DATE_OPTIONS.stages.length);
        this.progressBar.init();
        console.log('✅ Progress bar initialized');
      }

      // Initialize timer
      const timerElement = Utils.$('#globalTimer');
      if (timerElement) {
        this.timer = new Timer(timerElement);
        console.log('✅ Timer initialized');
      }

      // Initialize conversation topics
      const topicsContainer = Utils.$('#conversationTopicsContainer');
      if (topicsContainer) {
        this.conversationTopics = new ConversationTopics();
        topicsContainer.appendChild(this.conversationTopics.render());
        console.log('✅ Conversation topics initialized');
      }

      // Initialize roadmap generator
      this.roadmapGenerator = new RoadmapGenerator(DATE_OPTIONS.stages, this.stateManager);

      // Setup UI
      this.setupThemeToggle();
      this.setupSoundToggle();
      this.setupIntroNavigation();
      this.setupStages();
      this.setupFinalScreen();
      console.log('✅ UI setup complete');

      // Restore state
      this.restoreState();
      console.log('✅ State restored');

      console.log('🎉 App initialized successfully!');
    } catch (error) {
      console.error('❌ Error during initialization:', error);
    }
  }

  setupThemeToggle() {
    const toggle = Utils.$('#themeToggle');
    if (!toggle) return;

    toggle.classList.toggle('dark', this.themeManager.isDark);

    let longPressTimer = null;
    let isLongPress = false;

    const handlePress = (e) => {
      isLongPress = false;
      longPressTimer = setTimeout(() => {
        isLongPress = true;
        Utils.vibrate([50, 30, 50]);
        this.showThemePicker();
      }, 500); // 500ms for long press
    };

    const handleRelease = () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      if (!isLongPress) {
        // Normal click - toggle light/dark
        const isDark = this.themeManager.toggle();
        toggle.classList.toggle('dark', isDark);
        this.soundManager.playClick();
      }
    };

    // Mouse events
    toggle.addEventListener('mousedown', handlePress);
    toggle.addEventListener('mouseup', handleRelease);
    toggle.addEventListener('mouseleave', () => {
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }
    });

    // Touch events
    toggle.addEventListener('touchstart', (e) => {
      e.preventDefault();
      handlePress();
    });
    toggle.addEventListener('touchend', (e) => {
      e.preventDefault();
      handleRelease();
    });
  }

  showThemePicker() {
    // Check if theme picker already exists
    let picker = Utils.$('#themePicker');

    if (picker) {
      // If it exists, just show it
      picker.classList.add('visible');
      return;
    }

    // Create theme picker modal
    picker = document.createElement('div');
    picker.id = 'themePicker';
    picker.className = 'theme-picker';
    picker.innerHTML = `
      <div class="theme-picker-overlay"></div>
      <div class="theme-picker-content glass-card">
        <div class="card-glow"></div>
        <button class="theme-picker-close" aria-label="Закрити">
          <i class="fas fa-times"></i>
        </button>
        <h3 class="theme-picker-title">Обери тему</h3>
        <div class="theme-grid"></div>
      </div>
    `;

    document.body.appendChild(picker);

    const grid = picker.querySelector('.theme-grid');
    const themes = this.themeManager.getThemeList();
    const currentTheme = this.themeManager.getCurrentTheme();

    themes.forEach(({ key, name, icon }) => {
      const card = document.createElement('button');
      card.className = 'theme-card';
      card.dataset.theme = key;
      if (key === currentTheme) {
        card.classList.add('active');
      }

      card.innerHTML = `
        <span class="theme-icon">${icon}</span>
        <span class="theme-name">${name}</span>
        <div class="theme-preview" style="background: linear-gradient(135deg,
          ${THEMES[key].bgGradientStart},
          ${THEMES[key].bgGradientMiddle},
          ${THEMES[key].bgGradientEnd})">
        </div>
      `;

      card.addEventListener('click', () => {
        this.themeManager.setTheme(key);

        // Update UI
        const toggle = Utils.$('#themeToggle');
        if (toggle) {
          toggle.classList.toggle('dark', this.themeManager.isDark);
        }

        // Update active state
        picker.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        this.soundManager.playSuccess();
        Utils.vibrate(100);

        // Close picker after a short delay
        setTimeout(() => {
          this.hideThemePicker();
        }, 300);
      });

      grid.appendChild(card);
    });

    // Setup close handlers
    const closeBtn = picker.querySelector('.theme-picker-close');
    const overlay = picker.querySelector('.theme-picker-overlay');

    closeBtn.addEventListener('click', () => this.hideThemePicker());
    overlay.addEventListener('click', () => this.hideThemePicker());

    // Show picker with animation
    requestAnimationFrame(() => {
      picker.classList.add('visible');
    });

    this.soundManager.playClick();
  }

  hideThemePicker() {
    const picker = Utils.$('#themePicker');
    if (!picker) return;

    picker.classList.remove('visible');
    setTimeout(() => {
      picker.remove();
    }, 300);
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

    console.log('Setting up intro navigation, found buttons:', buttons.length);

    buttons.forEach(btn => {
      const nextStep = btn.dataset.next;
      console.log('Button found with data-next:', nextStep);

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('Button clicked, navigating to:', nextStep);

        // Add ripple effect
        this.createRipple(e, btn);

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

  createRipple(event, button) {
    const ripple = document.createElement('span');
    ripple.className = 'ripple';

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    button.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }

  async navigateToScreen(screenId) {
    const currentScreen = Utils.$('.screen.active');
    const nextScreen = Utils.$(`#${screenId}`);

    console.log('Navigating to:', screenId, 'Next screen found:', !!nextScreen);

    if (!nextScreen) {
      console.error('Screen not found:', screenId);
      return;
    }

    if (currentScreen && currentScreen !== nextScreen) {
      // Use different transition types for variety
      const transitionType = TransitionManager.getRandomTransition();
      await TransitionManager.transition(currentScreen, nextScreen, transitionType);
    } else {
      nextScreen.classList.add('active');
    }

    this.stateManager.update({ currentStep: screenId });
    console.log('Screen activated:', screenId);
  }

  setupStages() {
    const container = Utils.$('#stagesContainer');
    if (!container) return;

    DATE_OPTIONS.stages.forEach((stageData, index) => {
      const component = new MysticStageComponent(stageData, index, {
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
      console.log('Showing final screen');
      this.showFinalScreen();
      return;
    }

    // If intro completed, show stages
    if (state.introCompleted) {
      console.log('Intro completed, showing stages');
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

    // First time - just show intro-1 (it's already active in HTML)
    // Don't call navigateToScreen here as it's already visible
    console.log('First visit or intro not completed, showing intro-1');
    
    // Make sure intro-1 is active
    const intro1 = Utils.$('#intro-1');
    if (intro1 && !intro1.classList.contains('active')) {
      intro1.classList.add('active');
    }
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
