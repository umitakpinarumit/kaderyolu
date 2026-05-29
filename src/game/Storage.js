const STORAGE_KEYS = {
  theme: "choice-game:theme",
  state: "choice-game:state",
  scene: "choice-game:scene",
};

export const Storage = {
  saveTheme(themeName) {
    try { localStorage.setItem(STORAGE_KEYS.theme, themeName); } catch {}
  },
  loadTheme() {
    try { return localStorage.getItem(STORAGE_KEYS.theme); } catch { return null; }
  },
  saveGame({ state, currentSceneId }) {
    try {
      localStorage.setItem(STORAGE_KEYS.state, JSON.stringify(state.data));
      localStorage.setItem(STORAGE_KEYS.scene, currentSceneId);
    } catch {}
  },
  loadGame() {
    try {
      const state = localStorage.getItem(STORAGE_KEYS.state);
      const scene = localStorage.getItem(STORAGE_KEYS.scene);
      return { stateData: state ? JSON.parse(state) : null, sceneId: scene || null };
    } catch { return { stateData: null, sceneId: null }; }
  },
  clearGame() {
    try {
      localStorage.removeItem(STORAGE_KEYS.state);
      localStorage.removeItem(STORAGE_KEYS.scene);
    } catch {}
  }
};

