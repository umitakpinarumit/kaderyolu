export class GameState {
  constructor(initialData = undefined) {
    this.data = initialData || {
      visitCounts: {},
      flags: {},
      stats: {
        health: 50,
        endurance: 50,
        strength: 50,
        agility: 50,
        intelligence: 50,
        creativity: 50,
        discipline: 50,
        focus: 50,
        confidence: 50,
        charisma: 50,
        empathy: 50,
        social: 50,
        happiness: 50,
        luck: 50,
        money: 0,
      },
      goal: null,
      travelCount: 0,
      traits: [],
      inventory: [],
      outfit: {},
      training: 0,
    };
  }

  getFlag(flagKey, defaultValue = false) {
    const value = this.data.flags[flagKey];
    return typeof value === "undefined" ? defaultValue : value;
  }

  setFlag(flagKey, value) {
    this.data.flags[flagKey] = Boolean(value);
  }

  incrementVisit(sceneId) {
    const current = this.data.visitCounts[sceneId] || 0;
    this.data.visitCounts[sceneId] = current + 1;
  }
}

