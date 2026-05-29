import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground } from 'react-native';
import { GameState } from './src/game/State';
import { SceneManager } from './src/game/SceneManager';
import { Conditions } from './src/game/Conditions';
import { Effects } from './src/game/Effects';
import { createRng, randomClamped } from './src/game/Random';
import { Goals } from './src/game/Goals';
import scenes from './src/scenes';

export default function App() {
  const [gameState] = useState(() => new GameState());
  const [sceneManager, setSceneManager] = useState(null);
  const [hudOpen, setHudOpen] = useState(true);
  const [_, forceUpdate] = useState(0);

  useEffect(() => {
    // doğumda RNG
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

    // rastgele hedef ata (başlangıçta kullanıcıya sorma)
    if (!gameState.data.flags.goal) {
      gameState.data.flags.goal = Goals.pickRandom(() => Math.random());
    }

    const sm = new SceneManager({
      initialSceneId: 'intro',
      sceneRegistry: scenes,
      gameState,
      onSceneChange: (newSceneId) => {
        // Yeni oyun isteği (Başa dön)
        if (newSceneId === 'intro' && gameState.data.flags && gameState.data.flags.restart) {
          // reset state
          const newSeed = Date.now() % 2147483647;
          const newRng = createRng(newSeed);
          gameState.data.visitCounts = {};
          gameState.data.flags = {};
          gameState.data.traits = [];
          gameState.data.numbers = { training: 0, travelCount: 0 };
          gameState.data.flags.seed = newSeed;
          const s2 = gameState.data.stats;
          s2.health = randomClamped(newRng);
          s2.endurance = randomClamped(newRng);
          s2.strength = randomClamped(newRng);
          s2.agility = randomClamped(newRng);
          s2.intelligence = randomClamped(newRng);
          s2.creativity = randomClamped(newRng);
          s2.discipline = randomClamped(newRng);
          s2.focus = randomClamped(newRng);
          s2.confidence = randomClamped(newRng);
          s2.charisma = randomClamped(newRng);
          s2.empathy = randomClamped(newRng);
          s2.social = randomClamped(newRng);
          s2.happiness = randomClamped(newRng);
          s2.luck = randomClamped(newRng, 50, 30, 25, 90);
          gameState.data.flags.goal = Goals.pickRandom(() => Math.random());
        }
        // Rastgele olay tetiklemesi (%10)
        if (newSceneId && !String(newSceneId).startsWith('rand_')) {
          if (Math.random() < 0.10) {
            gameState.data.flags.returnScene = newSceneId;
            const pool = ['rand_meet','rand_lottery','rand_inheritance'];
            const pick = pool[Math.floor(Math.random() * pool.length)];
            // setTimeout ile sonsuz döngüyü önle
            setTimeout(() => sm.transitionTo(pick), 0);
            return;
          }
        }
        // Alt limit kontrolü (minimumlar)
        const mins = { health: 5, endurance: 5, strength: 5, agility: 5, intelligence: 5, creativity: 5, discipline: 5, focus: 5, confidence: 5, charisma: 5, empathy: 5, social: 5, happiness: 5, luck: 10 };
        const s = gameState.data.stats;
        for (const [k, m] of Object.entries(mins)) {
          if ((s[k] || 0) < m) {
            // başarısızlık sahnesine yönlendir
            // setTimeout ile sonsuz döngüyü önle
            setTimeout(() => sm.transitionTo('fail_random'), 0);
            return;
          }
        }
        forceUpdate(x => x + 1);
      }
    });
    setSceneManager(sm);
  }, []);

  if (!sceneManager) {
    return <View style={styles.container}><Text>Yükleniyor…</Text></View>;
  }

  const sceneFactory = sceneManager.getCurrentScene();
  const scene = typeof sceneFactory === 'function' ? sceneFactory(gameState) : sceneFactory;
  const backgroundSource = getBackgroundForScene(sceneManager.currentSceneId);

  const Body = ({ children }) => {
    if (backgroundSource) {
      return (
        <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.container}>
          <View style={styles.overlay} />
          {children}
        </ImageBackground>
      );
    }
    return <View style={styles.container}>{children}</View>;
  };

  return (
    <Body>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Seçim Oyunu</Text>
        {/* HUD: Hedef ve Statlar */}
        <View style={styles.card}>
          <TouchableOpacity onPress={() => setHudOpen(v => !v)}>
            <Text style={styles.cardTitle}>Hedef: {Goals.list.find(g => g.id === gameState.data.flags.goal)?.label || gameState.data.flags.goal || '—'} {hudOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {!hudOpen && (
            <Text style={styles.reqText}>
              Tüm hedefler: {Goals.list.map(g => g.label).join(', ')}
            </Text>
          )}
          {hudOpen && (
            <>
              {/* İlerleme: gereksinimler */}
              {Goals.requirements(gameState.data.flags.goal).length > 0 && (
                <View style={{ gap: 6, marginBottom: 8 }}>
                  {Goals.requirements(gameState.data.flags.goal).map((req, i) => {
                    if (req.kind === 'stat') {
                      const cur = Math.round(gameState.data.stats[req.key] || 0);
                      const need = req.min;
                      return (
                        <Text key={i} style={styles.reqText}>{prettyStat(req.key)}: {cur}/{need}</Text>
                      );
                    }
                    if (req.kind === 'number') {
                      const cur = Math.round((gameState.data.numbers && gameState.data.numbers[req.key]) || 0);
                      return (
                        <Text key={i} style={styles.reqText}>{req.label || req.key}: {cur}/{req.min}</Text>
                      );
                    }
                    if (req.kind === 'flag') {
                      const val = gameState.data.flags[req.key];
                      const ok = String(val) === String(req.equals);
                      return (
                        <Text key={i} style={styles.reqText}>{req.label || req.key}: {ok ? 'Tamam' : 'Gerekli'}</Text>
                      );
                    }
                    return null;
                  })}
                </View>
              )}
              <View style={styles.previewRow}>
                {Object.entries(gameState.data.stats).map(([k, v]) => (
                  <View key={k} style={styles.chip}><Text style={styles.chipText}>{prettyStat(k)} {Math.round(v)}</Text></View>
                ))}
              </View>
            </>
          )}
        </View>
        <View style={styles.card}>
          <Text style={styles.cardText}>{stripHtml(scene.text)}</Text>
        </View>
        <View style={styles.choices}>
          {Array.isArray(scene.choices) && scene.choices.map((c, idx) => {
            const visible = Conditions.evaluateAll(c.conditions, gameState);
            if (!visible) return null;
            const preview = buildStatPreview(c);
            const tone = preview.net > 0 ? 'positive' : preview.net < 0 ? 'negative' : 'neutral';
            return (
            <TouchableOpacity key={idx} style={[styles.choiceCard, toneStyles[tone]]} onPress={() => {
              if (Array.isArray(c.effects)) Effects.applyEffects(c.effects, gameState);
              const nextId = typeof c.next === 'function' ? c.next(gameState) : c.next;
              sceneManager.transitionTo(nextId);
            }}>
              <Text style={styles.choiceTitle}>{c.label}</Text>
              {preview.lines.length > 0 && (
                <View style={styles.previewRow}>
                  {preview.lines.map((line, i) => (
                    <View key={i} style={styles.chip}><Text style={styles.chipText}>{line}</Text></View>
                  ))}
                </View>
              )}
            </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
      <StatusBar style="auto" />
    </Body>
  );
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

function buildStatPreview(choice) {
  const lines = [];
  let net = 0;
  if (Array.isArray(choice.effects)) {
    for (const eff of choice.effects) {
      if (eff.statDelta) {
        for (const [k, v] of Object.entries(eff.statDelta)) {
          const sign = v >= 0 ? '+' : '';
          lines.push(`${prettyStat(k)} ${sign}${v}`);
          if (k !== 'money') net += v;
        }
      }
      if (eff.numberDelta) {
        for (const [k, v] of Object.entries(eff.numberDelta)) {
          const sign = v >= 0 ? '+' : '';
          lines.push(`${prettyStat(k)} ${sign}${v}`);
        }
      }
    }
  }
  return { lines, net };
}

function prettyStat(key) {
  const map = {
    health: 'Sağlık', endurance: 'Day.', strength: 'Güç', agility: 'Çev.',
    intelligence: 'Zekâ', creativity: 'Yaratıcılık', discipline: 'Disiplin', focus: 'Odak',
    confidence: 'Özgüven', charisma: 'Karizma', empathy: 'Empati', social: 'Sosyal',
    happiness: 'Mutluluk', luck: 'Şans', money: 'Para', training: 'Ant.', travelCount: 'Sey.'
  };
  return map[key] || key;
}

function getBackgroundForScene(sceneId) {
  try {
    // Yaşam evrelerine göre arka plan
    if (!sceneId) return null;
    if (sceneId.startsWith('e1') || sceneId === 'intro' || sceneId.startsWith('y2000_')) {
      return require('./assets/e1.png');
    }
    if (sceneId.startsWith('y2006_') || sceneId.startsWith('y2008_') || sceneId.startsWith('y2010_') || sceneId.startsWith('y2012_') || sceneId.startsWith('y2013_') || sceneId.startsWith('e2')) {
      return require('./assets/e2.webp');
    }
    if (sceneId.startsWith('y2015_') || sceneId.startsWith('y2016_') || sceneId.startsWith('y2017_') || sceneId.startsWith('y2018_') || sceneId.startsWith('y2019_') || sceneId.startsWith('e3')) {
      return require('./assets/e3.jpg');
    }
    if (sceneId.startsWith('y2020_') || sceneId.startsWith('y2021_') || sceneId.startsWith('y2022_') || sceneId.startsWith('y2023_') || sceneId.startsWith('y2024_') || sceneId.startsWith('e4')) {
      return require('./assets/e4.webp');
    }
    if (sceneId.startsWith('y2025_') || sceneId.startsWith('y2026_') || sceneId.startsWith('y2027_') || sceneId.startsWith('y2028_') || sceneId.startsWith('y2029_') || sceneId.startsWith('y2030_') || sceneId.startsWith('e5')) {
      return require('./assets/e5.webp');
    }
  } catch (_) {
    return null;
  }
  return null;
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  content: { padding: 16 },
  title: { color: '#e6edf3', fontSize: 18, marginBottom: 12 },
  card: { backgroundColor: 'rgba(18,24,33,0.88)', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardText: { color: '#e6edf3' },
  cardTitle: { color: '#e6edf3', fontWeight: '700', marginBottom: 8 },
  choices: { gap: 10 },
  choiceCard: { backgroundColor: 'rgba(18,24,33,0.86)', padding: 12, borderRadius: 12, borderWidth: 1 },
  choiceTitle: { color: '#e6edf3', fontWeight: '600', marginBottom: 8 },
  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip: { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  chipText: { color: '#c9d4df', fontSize: 12 },
  reqText: { color: '#c9d4df', fontSize: 12 },
});

const toneStyles = {
  positive: { borderColor: '#2ecc71' },
  negative: { borderColor: '#e74c3c' },
  neutral: { borderColor: '#3a4758' },
};
