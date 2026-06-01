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
import DiceGame        from './src/components/DiceGame';
import BlackjackGame   from './src/components/BlackjackGame';
import PistiGame       from './src/components/PistiGame';
import SceneGame, { getGameType } from './src/components/SceneGame';
import CharacterSelect from './src/components/games/CharacterSelect';

const MINI_GAME_CATEGORIES = [
  {
    title: '🎰 Masa Oyunları',
    desc: 'Servet yolunda rastlanan kumar/şans oyunları',
    games: [
      { id: 'game_dice_intro',  label: '🎲 Zar Oyunu',     desc: 'Tek/Çift üzerine bahis — animasyonlu zar' },
      { id: 'game_bj_intro',   label: '🃏 Blackjack (21)', desc: 'Gerçek kart görselliği ile 21 oyunu' },
      { id: 'game_pisti_intro', label: '🃏 Pişti',          desc: 'Orta kartı eşleştir — görsel kart seçimi' },
    ],
  },
  {
    title: '👨‍👩‍👦 Karakter Seçimi',
    desc: 'Aile / sosyal ilişki seçimleri (CharacterSelect şablonu)',
    games: [
      { id: 'intro',              label: '🏠 Anne mi, Baba mı?',       desc: '2000 · Doğum — kim ile daha yakınsın?' },
      { id: 'y2001_outing_father', label: '👨 Babayla Dışarı',         desc: '2001 · Baba ile nereye gidiyorsun?' },
      { id: 'y2001_outing_mother', label: '👩 Anneyle Dışarı',         desc: '2001 · Anne ile nereye gidiyorsun?' },
    ],
  },
  {
    title: '⚡ Enerji Metre',
    desc: 'Yoğun / Dengeli / Rahat yoğunluk seçimleri (EnergyMeter şablonu)',
    games: [
      { id: 'y2006_primary_start', label: '📖 İlkokul Başlangıcı',      desc: '2006 · Nasıl bir öğrenci olacaksın?' },
      { id: 'y2012_exam',          label: '📝 Ortaokul Sınavları',       desc: '2012 · Sınav hazırlık yoğunluğu' },
      { id: 'y2018_uni_exam',      label: '🎓 Üniversite Sınavı',        desc: '2018 · YKS hazırlık stratejin' },
      { id: 'y2020_pandemic',      label: '😷 Pandemi Dönemi',           desc: '2020 · Evde nasıl zaman geçiriyorsun?' },
      { id: 'y2027_sports',        label: '🏋️ Spor Antrenmanı',          desc: '2027 · Antrenman programı seç' },
    ],
  },
  {
    title: '🗺️ Yol Kartları',
    desc: 'Büyük dal / okul / kariyer seçimleri (PathCards şablonu)',
    games: [
      { id: 'y2015_high_school',   label: '🏫 Lise Seçimi',             desc: '2015 · Fen, Meslek, Sanat, Askeri...' },
      { id: 'y2016_voc_start',     label: '🔧 Meslek Lisesi Alanı',      desc: '2016 · Elektrik, Bilişim, Motor' },
      { id: 'y2019_uni_start',     label: '🎓 Üniversite Bölümü',        desc: '2019 · Mühendislik, İktisat, Mimarlık' },
      { id: 'y2024_career',        label: '💼 Kariyer Kavşağı',          desc: '2024 · Kurumsal, Startup, Akademi...' },
      { id: 'y2026_growth',        label: '🚀 2026 Uzmanlaşma',          desc: '2026 · Spor, Girişim, Seyahat...' },
      { id: 'y2018_military_choice', label: '🎖️ Askeri Kariyer',        desc: '2018 · Er, Uzman, Subay, Komando' },
      { id: 'y2018_mil_branch',    label: '✈️ Branş Seçimi',             desc: '2018 · Hava, Kara, Deniz' },
    ],
  },
  {
    title: '🎰 Risk Kaydırıcı',
    desc: 'Güvenli / Dengeli / Riskli ekonomik seçimler (RiskSlider şablonu)',
    games: [
      { id: 'y2027_wealth_invest',  label: '📈 Yatırım Riski',          desc: '2027 · Endeks, Fon, Kripto' },
      { id: 'y2028_wealth_business', label: '🏪 İş Ölçekleme',           desc: '2028 · İşletme / Franchise / E-ticaret' },
      { id: 'y2029_wealth_tax',     label: '💰 Vergi Stratejisi',        desc: '2029 · Tam uyum, Optimizasyon, Risk' },
      { id: 'y2016_apprenticeship_progress', label: '🔨 Çıraklık Yolu', desc: '2016 · Sertifika, Yan İş, Dükkan' },
    ],
  },
  {
    title: '🃏 Seçim Kartları',
    desc: 'Standart kart arayüzü (SwipeCards şablonu — tüm diğer sahneler)',
    games: [
      { id: 'y2000_2006_caretaking', label: '🧒 Erken Çocukluk',        desc: '2000–2006 · Eğitim, Oyun, Spor' },
      { id: 'y2010_hobby',           label: '🎵 Hobi Seçimi',            desc: '2010 · Müzik, Spor, Kodlama, Yatırım' },
      { id: 'y2016_projects',        label: '🔬 Lise Projeleri',         desc: '2016 · Bilim, Konsey, Spor, Sanat' },
      { id: 'y2021_remote_intern',   label: '💼 Profesyonel İlk Adım',  desc: '2021 · Staj, Sertifika, Freelance' },
      { id: 'y2023_volunteer',       label: '🤲 Dayanışma',              desc: '2023 · Gönüllü, Maddi Destek, Uzaktan' },
      { id: 'y2029_startup_pitch',   label: '🚀 Yatırım Sunumu',        desc: '2029 · Pitch, Ortak Ara, Ertele' },
      { id: 'y2027_travel',          label: '🌍 Seyahat Planı',          desc: '2027 · Balkanlar, Asya, Amerika' },
    ],
  },
];

export default function App() {
  const [gameState] = useState(() => new GameState());
  const [sceneManager, setSceneManager] = useState(null);
  const [currentSceneId, setCurrentSceneId] = useState('intro');
  const [screen, setScreen] = useState('home'); // 'home' | 'minigames' | 'game'
  const [hudOpen, setHudOpen] = useState(false);

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
            setTimeout(() => sm.transitionTo(pick), 0);
            return;
          }
        }
        // Alt limit kontrolü (minimumlar)
        const mins = { health: 5, endurance: 5, strength: 5, agility: 5, intelligence: 5, creativity: 5, discipline: 5, focus: 5, confidence: 5, charisma: 5, empathy: 5, social: 5, happiness: 5, luck: 10 };
        const s = gameState.data.stats;
        for (const [k, m] of Object.entries(mins)) {
          if ((s[k] || 0) < m) {
                setTimeout(() => sm.transitionTo('fail_random'), 0);
            return;
          }
        }
        setCurrentSceneId(sm.currentSceneId);
      }
    });
    setSceneManager(sm);
  }, []);

  if (!sceneManager) {
    return <View style={styles.container}><Text style={{ color: '#fff', padding: 20 }}>Yükleniyor…</Text></View>;
  }

  // ── ANA SAYFA ──────────────────────────────────────────────────────────────
  if (screen === 'home') {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
        <StatusBar style="light" />
        <Text style={styles.homeTitle}>Kader Yolu</Text>
        <Text style={styles.homeSubtitle}>Hayatını şekillendir</Text>

        <TouchableOpacity style={styles.homeBtn} onPress={() => {
          // Ana oyunu başlat / sıfırla
          const seed = Date.now() % 2147483647;
          const rng = createRng(seed);
          gameState.data.visitCounts = {};
          gameState.data.flags = { seed, goal: Goals.pickRandom(() => Math.random()) };
          gameState.data.traits = [];
          gameState.data.numbers = { training: 0, travelCount: 0 };
          const s = gameState.data.stats;
          s.health = randomClamped(rng); s.endurance = randomClamped(rng);
          s.strength = randomClamped(rng); s.agility = randomClamped(rng);
          s.intelligence = randomClamped(rng); s.creativity = randomClamped(rng);
          s.discipline = randomClamped(rng); s.focus = randomClamped(rng);
          s.confidence = randomClamped(rng); s.charisma = randomClamped(rng);
          s.empathy = randomClamped(rng); s.social = randomClamped(rng);
          s.happiness = randomClamped(rng); s.luck = randomClamped(rng, 50, 30, 25, 90);
          sceneManager.currentSceneId = 'intro';
          setCurrentSceneId('intro');
          setHudOpen(false);
          setScreen('game');
        }}>
          <Text style={styles.homeBtnText}>🎮 Oyunu Başlat</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.homeBtn, styles.homeBtnSecondary]} onPress={() => setScreen('minigames')}>
          <Text style={styles.homeBtnText}>🃏 Seçim Sonrası Oyunlar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── MİNİ OYUN LİSTESİ ─────────────────────────────────────────────────────
  if (screen === 'minigames') {
    const goToGame = (id) => {
      // Test için gameState'i temiz tut ama stats başlatılmış olsun
      sceneManager.currentSceneId = id;
      setCurrentSceneId(id);
      setScreen('game');
    };

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 56, paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => setScreen('home')} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#58a6ff', fontSize: 15 }}>← Ana Sayfa</Text>
          </TouchableOpacity>

          <Text style={styles.homeTitle}>Seçim Sonrası Oyunlar</Text>
          <Text style={[styles.homeSubtitle, { marginBottom: 24 }]}>
            Tüm görsel oyun şablonları burada. Teste başlamak için birini seç.
          </Text>

          {MINI_GAME_CATEGORIES.map((cat, ci) => (
            <View key={ci} style={mg.catBlock}>
              {/* Kategori başlığı */}
              <View style={mg.catHeader}>
                <Text style={mg.catTitle}>{cat.title}</Text>
                <Text style={mg.catDesc}>{cat.desc}</Text>
              </View>

              {/* Oyunlar */}
              {cat.games.map((game, gi) => (
                <TouchableOpacity
                  key={gi}
                  style={mg.gameRow}
                  onPress={() => goToGame(game.id)}
                  activeOpacity={0.75}
                >
                  <View style={mg.gameInfo}>
                    <Text style={mg.gameLabel}>{game.label}</Text>
                    <Text style={mg.gameDesc}>{game.desc}</Text>
                  </View>
                  <Text style={mg.gameArrow}>▶</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
        </ScrollView>
      </View>
    );
  }

  // ── VİZÜEL MİNİ OYUNLAR ───────────────────────────────────────────────────
  if (currentSceneId.startsWith('game_dice')) {
    return <DiceGame gameState={gameState} onExit={() => {
      const ret = gameState.data.flags.returnScene || 'y2026_wealth_strategy';
      sceneManager.currentSceneId = ret;
      setCurrentSceneId(ret);
      setScreen('game');
    }} />;
  }
  if (currentSceneId.startsWith('game_bj')) {
    return <BlackjackGame gameState={gameState} onExit={() => {
      const ret = gameState.data.flags.returnScene || 'y2026_wealth_strategy';
      sceneManager.currentSceneId = ret;
      setCurrentSceneId(ret);
      setScreen('game');
    }} />;
  }
  if (currentSceneId.startsWith('game_pisti')) {
    return <PistiGame gameState={gameState} onExit={() => {
      const ret = gameState.data.flags.returnScene || 'y2026_wealth_strategy';
      sceneManager.currentSceneId = ret;
      setCurrentSceneId(ret);
      setScreen('game');
    }} />;
  }

  // ── OYUN ──────────────────────────────────────────────────────────────────
  let scene;
  try {
    const sceneFactory = sceneManager.sceneRegistry[currentSceneId];
    scene = typeof sceneFactory === 'function' ? sceneFactory(gameState) : sceneFactory;
    if (!scene || typeof scene !== 'object') throw new Error(`Sahne döndürmedi: ${currentSceneId}`);
    } catch (err) {
    console.error('[SCENE RENDER ERROR]', currentSceneId, String(err));
    scene = { text: `<p>Hata: ${err.message}</p>`, choices: [{ label: '← Geri', next: 'intro' }] };
  }
  const backgroundSource = getBackgroundForScene(currentSceneId);

  // CharacterSelect / BabyRaceGame tam ekran gerektirir — ScrollView dışında render et
  if (getGameType(currentSceneId, scene?.choices) === 'character') {
    return (
      <SceneBody backgroundSource={backgroundSource}>
        <StatusBar style="auto" />
        <CharacterSelect
          scene={scene}
          sceneText={scene.text}
          gameState={gameState}
          Conditions={Conditions}
          onChoose={(c) => {
            try {
              if (Array.isArray(c.effects)) Effects.applyEffects(c.effects, gameState);
              const nextId = typeof c.next === 'function' ? c.next(gameState) : c.next;
              if (!nextId) throw new Error(`next boş: ${c.label}`);
              sceneManager.transitionTo(nextId);
            } catch (err) {
              console.error('[CHOICE ERROR]', c.label, String(err));
            }
          }}
        />
      </SceneBody>
    );
  }

  return (
    <SceneBody backgroundSource={backgroundSource}>
      <View key={currentSceneId} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={() => setScreen('home')} style={{ marginBottom: 8 }}>
          <Text style={{ color: '#58a6ff', fontSize: 14 }}>← Ana Sayfa</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Kader Yolu</Text>
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
          <SceneText html={scene.text} />
        </View>
        <SceneGame
          sceneId={currentSceneId}
          scene={scene}
          gameState={gameState}
          buildStatPreview={buildStatPreview}
          Conditions={Conditions}
          onChoose={(c) => {
            try {
              if (Array.isArray(c.effects)) Effects.applyEffects(c.effects, gameState);
              const nextId = typeof c.next === 'function' ? c.next(gameState) : c.next;
              if (!nextId) throw new Error(`next boş: ${c.label}`);
              sceneManager.transitionTo(nextId);
            } catch (err) {
              console.error('[CHOICE ERROR]', c.label, String(err));
            }
          }}
        />
      </ScrollView>
      </View>
      <StatusBar style="auto" />
    </SceneBody>
  );
}

function SceneBody({ backgroundSource, children }) {
  if (backgroundSource) {
    return (
      <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.container}>
        <View style={styles.overlay} />
        {children}
      </ImageBackground>
    );
  }
  return <View style={styles.container}>{children}</View>;
}

function stripHtml(html) {
  return html.replace(/<[^>]+>/g, '');
}

function SceneText({ html }) {
  if (!html) return null;
  // h2 başlık
  const h2Match = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const title = h2Match ? h2Match[1].replace(/<[^>]+>/g, '').trim() : null;
  // p paragrafları
  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pMatches
    .map(m => m[1].replace(/<[^>]+>/g, '').trim())
    .filter(t => t.length > 0);
  // hiç etiket yoksa düz metin
  const plain = (!h2Match && pMatches.length === 0) ? stripHtml(html).trim() : null;
  return (
    <>
      {title ? <Text style={styles.sceneTitle}>{title}</Text> : null}
      {paragraphs.map((p, i) => <Text key={i} style={styles.cardText}>{p}</Text>)}
      {plain ? <Text style={styles.cardText}>{plain}</Text> : null}
    </>
  );
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
  if (!sceneId) return null;
  // 1 — Bebek (2000–2005)
  if (sceneId === 'intro' || sceneId === 'goal_select' || sceneId === 'y2000_2006_caretaking' ||
      sceneId.startsWith('y2001_') || sceneId.startsWith('y2004_') || sceneId.startsWith('y2005_')) {
    return require('./assets/age1_baby.png');
  }
  // 2 — Çocuk (2006–2011)
  if (sceneId.startsWith('y2006_') || sceneId.startsWith('y2008_') ||
      sceneId.startsWith('y2010_') || sceneId.startsWith('y2011_')) {
    return require('./assets/age2_child.png');
  }
  // 3 — Ergen (2012–2018)
  if (sceneId.startsWith('y2012_') || sceneId.startsWith('y2013_') ||
      sceneId.startsWith('y2015_') || sceneId.startsWith('y2016_') ||
      sceneId.startsWith('y2017_') || sceneId.startsWith('y2018_')) {
    return require('./assets/age3_teen.png');
  }
  // 4 — Genç yetişkin (2019–2024)
  if (sceneId.startsWith('y2019_') || sceneId.startsWith('y2020_') ||
      sceneId.startsWith('y2021_') || sceneId.startsWith('y2022_') ||
      sceneId.startsWith('y2023_') || sceneId.startsWith('y2024_')) {
    return require('./assets/age4_young.png');
  }
  // 5 — Yetişkin (2025–2030 + rastgele olaylar + oyun sonucu)
  if (sceneId.startsWith('y2025_') || sceneId.startsWith('y2026_') ||
      sceneId.startsWith('y2027_') || sceneId.startsWith('y2028_') ||
      sceneId.startsWith('y2029_') || sceneId.startsWith('y2030_') ||
      sceneId.startsWith('rand_')  || sceneId.startsWith('goal_eval') ||
      sceneId.startsWith('game_')  || sceneId.startsWith('fail_')) {
    return require('./assets/age5_adult.png');
  }
  return null;
}

const mg = StyleSheet.create({
  catBlock:  { marginBottom: 24 },
  catHeader: { backgroundColor: '#161b22', borderRadius: 12, padding: 14, marginBottom: 2 },
  catTitle:  { color: '#e6edf3', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  catDesc:   { color: '#8b949e', fontSize: 12 },
  gameRow:   { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1117', borderRadius: 10, borderWidth: 1, borderColor: '#21262d', paddingVertical: 12, paddingHorizontal: 14, marginTop: 6 },
  gameInfo:  { flex: 1 },
  gameLabel: { color: '#e6edf3', fontSize: 15, fontWeight: '700', marginBottom: 2 },
  gameDesc:  { color: '#8b949e', fontSize: 12 },
  gameArrow: { color: '#58a6ff', fontSize: 14, marginLeft: 10 },
});

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0b0f14' },
  homeTitle: { color: '#e6edf3', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  homeSubtitle: { color: '#8b949e', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  homeBtn: { backgroundColor: '#1f6feb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 14, width: '100%', alignItems: 'center' },
  homeBtnSecondary: { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d' },
  homeBtnText: { color: '#e6edf3', fontSize: 17, fontWeight: '700' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  content: { padding: 16 },
  title: { color: '#e6edf3', fontSize: 18, marginBottom: 12 },
  card: { backgroundColor: 'rgba(18,24,33,0.88)', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardText: { color: '#e6edf3', marginTop: 6, lineHeight: 20 },
  sceneTitle: { color: '#ffffff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
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
