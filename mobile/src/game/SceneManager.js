export class SceneManager {
  constructor({ initialSceneId, sceneRegistry, gameState, onSceneChange }) {
    this.currentSceneId = initialSceneId;
    this.sceneRegistry = sceneRegistry;
    this.gameState = gameState;
    this.onSceneChange = typeof onSceneChange === 'function' ? onSceneChange : () => {};
  }

  getCurrentScene() {
    return this.sceneRegistry[this.currentSceneId];
  }

  transitionTo(sceneId) {
    if (!this.sceneRegistry[sceneId]) {
      throw new Error(`Geçersiz sahne: ${sceneId}`);
    }
    this.currentSceneId = sceneId;
    this.onSceneChange(sceneId, this.gameState);
  }
}


