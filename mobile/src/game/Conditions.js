export const Conditions = {
  evaluateAll(conditions = [], state) {
    if (!conditions || conditions.length === 0) return true;
    return conditions.every((cond) => Conditions.evaluate(cond, state));
  },
  evaluate(condition, state) {
    if (!condition || typeof condition !== 'object') return true;
    if (condition.statGte) {
      const { key, value } = condition.statGte;
      return (state.data.stats?.[key] ?? 0) >= value;
    }
    if (condition.statLte) {
      const { key, value } = condition.statLte;
      return (state.data.stats?.[key] ?? 0) <= value;
    }
    if (condition.numberGte) {
      const { key, value } = condition.numberGte;
      return (state.data.numbers?.[key] ?? 0) >= value;
    }
    if (condition.numberLte) {
      const { key, value } = condition.numberLte;
      return (state.data.numbers?.[key] ?? 0) <= value;
    }
    if (condition.flagEquals) {
      const { key, value } = condition.flagEquals;
      return (state.data.flags?.[key] ?? false) === value;
    }
    if (condition.traitIncludes) {
      const traitKey = condition.traitIncludes;
      return Array.isArray(state.data.traits) && state.data.traits.includes(traitKey);
    }
    if (condition.hasItem) {
      const item = condition.hasItem;
      return Array.isArray(state.data.inventory) && state.data.inventory.includes(item);
    }
    return true;
  }
};


