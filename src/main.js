import { SceneManager } from './game/SceneManager.js';
import { GameState } from './game/State.js';
import { Storage } from './game/Storage.js';
import { getScenes } from './scenes/index.js';
import { Conditions } from './game/Conditions.js';
import { Effects } from './game/Effects.js';
import { GOALS } from './game/Goals.js';
import { createRng, randomClamped } from './game/Random.js';

const contentEl = document.getElementById('content');
const choicesEl = document.getElementById('choices');
const themeToggleBtn = document.getElementById('themeToggle');
const newGameBtn = document.getElementById('newGame');

function applyTheme(themeName) {
  const root = document.documentElement;
  if (themeName === 'light' || themeName === 'dark') {
    root.setAttribute('data-theme', themeName);
    Storage.saveTheme(themeName);
  } else {
    root.removeAttribute('data-theme');
  }
}

// Tema başlangıç
{
  const savedTheme = Storage.loadTheme();
  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }
}

themeToggleBtn?.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});

const { stateData, sceneId } = Storage.loadGame();
const gameState = new GameState(stateData);
// Doğumda rastgele stat başlatma (bir defa)
if (!stateData) {
  const seed = Date.now() % 2147483647;
  const rng = createRng(seed);
  gameState.data.flags.seed = seed;
  const s = gameState.data.stats;
  s.health = randomClamped(rng);
  s.endurance = randomClamped(rng);
  s.strength = randomClamped(rng);
  s.agility = randomClamped(rng);
  s.intelligence = randomClamped(rng);
  s.creativity = randomClamped(rng);
  s.discipline = randomClamped(rng);
  s.focus = randomClamped(rng);
  s.confidence = randomClamped(rng);
  s.charisma = randomClamped(rng);
  s.empathy = randomClamped(rng);
  s.social = randomClamped(rng);
  s.happiness = randomClamped(rng);
  s.luck = randomClamped(rng, 50, 30, 25, 90);
}
const sceneRegistry = getScenes();

let sceneManager = new SceneManager({
  initialSceneId: sceneId || 'goal_select',
  sceneRegistry,
  gameState,
  onSceneChange: (newSceneId, state) => {
    state.incrementVisit(newSceneId);
    // Rastgele olay tetikleyici: belirli sahnelerde düşük olasılıkta
    if (!['rand_meet','rand_lottery','rand_inheritance','rand_resume'].includes(newSceneId)) {
      const roll = Math.random();
      if (roll < 0.06) {
        state.data.flags.returnScene = newSceneId;
        sceneManager.currentSceneId = roll < 0.02 ? 'rand_lottery' : roll < 0.04 ? 'rand_inheritance' : 'rand_meet';
      }
    }
    Storage.saveGame({ state, currentSceneId: newSceneId });
    render();
  }
});

function render() {
  const sceneFactory = sceneManager.getCurrentScene();
  const scene = typeof sceneFactory === 'function' ? sceneFactory(gameState) : sceneFactory;

  contentEl.innerHTML = '';
  choicesEl.innerHTML = '';

  const p = document.createElement('div');
  p.innerHTML = scene.text;
  p.className = 'content-block';
  contentEl.appendChild(p);

  if (Array.isArray(scene.choices) && scene.choices.length) {
    for (const choice of scene.choices) {
      // koşul kontrolü
      const visible = Conditions.evaluateAll(choice.conditions, gameState);
      if (!visible) continue;
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary choice-btn';
      btn.textContent = choice.label;
      btn.addEventListener('click', () => {
        try {
          if (Array.isArray(choice.effects)) {
            Effects.applyEffects(choice.effects, gameState);
          } else if (typeof choice.action === 'function') {
            choice.action(gameState);
          }
          sceneManager.transitionTo(choice.next);
        } catch (err) {
          console.error(err);
        }
      });
      choicesEl.appendChild(btn);
    }
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'Yeniden başla';
    btn.addEventListener('click', () => restartGame());
    choicesEl.appendChild(btn);
  }

  // Outcome sahnelerinde hedef değerlendirmesini göster
  if (sceneManager.currentSceneId === 'y2025_outcome' || sceneManager.currentSceneId === 'y2030_outcome') {
    const goalKey = gameState.data.flags.goal;
    const goal = GOALS[goalKey];
    const resultEl = document.getElementById('goalResult');
    if (goal && resultEl) {
      const { achieved, score } = goal.evaluate(gameState);
      resultEl.innerHTML = achieved
        ? `<p><strong>Hedef tamamlandı!</strong> Skor: ${score}</p>`
        : `<p>Hedef tamamlanamadı. Skor: ${score}</p>`;
    }
  }
}

function restartGame() {
  Storage.clearGame();
  gameState.data = {
    visitCounts: {},
    flags: {},
    stats: { health: 50, happiness: 50, intelligence: 50, social: 50, confidence: 50, money: 0 },
    goal: null,
    travelCount: 0,
    traits: [],
    inventory: [],
    outfit: {},
    training: 0
  };
  sceneManager.transitionTo('goal_select');
}

newGameBtn?.addEventListener('click', () => restartGame());

// İlk render
if (!sceneId) {
  // Yeni oyun başlatıldıysa ilk sahneyi say ve kaydet
  sceneManager.onSceneChange(sceneManager.currentSceneId, gameState);
} else {
  render();
}


