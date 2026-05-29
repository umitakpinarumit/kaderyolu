export const Effects = {
  applyEffects(effects = [], state) {
    if (!Array.isArray(effects) || effects.length === 0) return;
    for (const eff of effects) this.applyEffect(eff, state);
  },
  applyEffect(effect, state) {
    if (!effect || typeof effect !== 'object') return;
    if (effect.setFlag) {
      const [key, value] = Object.entries(effect.setFlag)[0];
      state.setFlag(key, value);
      return;
    }
    if (effect.addTrait) {
      const trait = effect.addTrait;
      if (!Array.isArray(state.data.traits)) state.data.traits = [];
      if (!state.data.traits.includes(trait)) state.data.traits.push(trait);
      return;
    }
    if (effect.statDelta) {
      for (const [k, v] of Object.entries(effect.statDelta)) {
        const cur = state.data.stats?.[k] ?? 0;
        if (!state.data.stats) state.data.stats = {};
        const next = cur + Number(v);
        state.data.stats[k] = k === 'money' ? next : Math.max(0, Math.min(100, next));
      }
      return;
    }
    if (effect.numberDelta) {
      if (!state.data.numbers) state.data.numbers = {};
      for (const [k, v] of Object.entries(effect.numberDelta)) {
        const current = state.data.numbers[k] ?? 0;
        state.data.numbers[k] = current + Number(v);
      }
      return;
    }
    if (effect.addItem) {
      const item = effect.addItem;
      if (!Array.isArray(state.data.inventory)) state.data.inventory = [];
      if (!state.data.inventory.includes(item)) state.data.inventory.push(item);
      return;
    }
    if (effect.removeItem) {
      const item = effect.removeItem;
      if (Array.isArray(state.data.inventory)) state.data.inventory = state.data.inventory.filter((i) => i !== item);
      return;
    }
    if (effect.equip) {
      const { slot, item } = effect.equip;
      if (!state.data.outfit) state.data.outfit = {};
      state.data.outfit[slot] = item;
      return;
    }
  }
};


