/**
 * SaveManager — Karakter kayıt/yükleme sistemi
 * expo-file-system kullanır: Expo Go SDK 53 ile tam uyumlu.
 * (AsyncStorage v2 → null, expo-sqlite → native build gerektirir)
 */
import * as FileSystem from 'expo-file-system';

const SAVE_PATH = FileSystem.documentDirectory + 'kader_yolu_saves.json';
const MAX_SLOTS = 5;

async function _read() {
  try {
    const info = await FileSystem.getInfoAsync(SAVE_PATH);
    if (!info.exists) return [];
    const raw = await FileSystem.readAsStringAsync(SAVE_PATH);
    return JSON.parse(raw) || [];
  } catch {
    return [];
  }
}

async function _write(data) {
  await FileSystem.writeAsStringAsync(SAVE_PATH, JSON.stringify(data));
}

export const SaveManager = {
  async loadAll() {
    return _read();
  },

  async saveCharacter(char) {
    try {
      const all = await _read();
      const now = Date.now();
      const upd = { ...char, lastPlayedAt: now };
      const idx = all.findIndex(c => c.id === char.id);
      if (idx >= 0) all[idx] = upd;
      else          all.unshift(upd);
      await _write(all.slice(0, MAX_SLOTS));
    } catch (e) {
      console.error('[SaveManager] saveCharacter', e);
    }
  },

  async deleteCharacter(id) {
    try {
      const all = await _read();
      await _write(all.filter(c => c.id !== id));
    } catch (e) {
      console.error('[SaveManager] deleteCharacter', e);
    }
  },

  async clearAll() {
    try { await _write([]); } catch {}
  },

  snapshot(id, sceneId, gameState) {
    return {
      id,
      sceneId,
      stats:       { ...gameState.data.stats },
      flags:       { ...gameState.data.flags },
      traits:      [...(gameState.data.traits  || [])],
      numbers:     { ...(gameState.data.numbers || {}) },
      visitCounts: { ...(gameState.data.visitCounts || {}) },
      lastPlayedAt: Date.now(),
    };
  },

  restore(gameState, snapshot) {
    Object.assign(gameState.data.stats,       snapshot.stats       || {});
    Object.assign(gameState.data.flags,       snapshot.flags       || {});
    Object.assign(gameState.data.visitCounts, snapshot.visitCounts || {});
    gameState.data.traits  = [...(snapshot.traits  || [])];
    gameState.data.numbers = { ...(snapshot.numbers || {}) };
  },
};

// ─── Ölüm koşulları ───────────────────────────────────────────────────────────
export const DEATH_CONDITIONS = [
  { key: 'health',       min: 5, reason: '💔 Sağlık sıfıra düştü'          },
  { key: 'happiness',    min: 3, reason: '😢 Mutsuzluktan erken yaşlandı'  },
  { key: 'confidence',   min: 3, reason: '😰 Özgüveni tamamen kırıldı'     },
  { key: 'intelligence', min: 3, reason: '🧠 Zihinsel yorgunluktan çöktü'  },
];

export function checkDeath(stats) {
  for (const { key, min, reason } of DEATH_CONDITIONS) {
    if ((stats[key] || 0) < min) return reason;
  }
  return null;
}

export function getCharPhase(sceneId) {
  if (!sceneId || sceneId === 'intro') return { year: 2000, age: 0, phase: 'Bebek' };
  const m = sceneId.match(/y(\d{4})/);
  if (!m) return { year: 2000, age: 0, phase: 'Başlangıç' };
  const year = parseInt(m[1]);
  const age  = year - 2000;
  const phase =
    age < 2  ? 'Bebek'      :
    age < 7  ? 'Çocuk'      :
    age < 12 ? 'İlkokul'    :
    age < 15 ? 'Ortaokul'   :
    age < 19 ? 'Lise'       :
    age < 23 ? 'Üniversite' : 'Yetişkin';
  return { year, age, phase };
}
