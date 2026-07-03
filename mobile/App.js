import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert, Dimensions, Image, ScrollView, StyleSheet,
  Text, TouchableOpacity, View, ImageBackground, Platform, StatusBar as RNStatusBar,
} from 'react-native';
import { SAFE_TOP } from './src/utils/safeArea';
import { GameState }        from './src/game/State';
import { SceneManager }     from './src/game/SceneManager';
import { Conditions }       from './src/game/Conditions';
import { Effects }          from './src/game/Effects';
import { createRng, randomClamped } from './src/game/Random';
import { Goals }            from './src/game/Goals';
import { SaveManager, checkDeath, getCharPhase, DEATH_CONDITIONS } from './src/game/SaveManager';
import scenes               from './src/scenes';
import DiceGame             from './src/components/DiceGame';
import BlackjackGame        from './src/components/BlackjackGame';
import PistiGame            from './src/components/PistiGame';
import SceneGame, { getGameType } from './src/components/SceneGame';
import CharacterSelect      from './src/components/games/CharacterSelect';
import BubblePop            from './src/components/games/BubblePop';
import ChoiceGameRouter     from './src/components/games/ChoiceGameRouter';
import GameSchema           from './src/components/games/GameSchema';
import RandomEventGame      from './src/components/games/RandomEventGame';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Yardımcı: GameState sıfırla + seed ile başlat ────────────────────────────
function initGameState(gs, seed) {
  const rng = createRng(seed);
  gs.data.visitCounts = {};
  gs.data.flags       = { seed, goal: Goals.pickRandom(() => Math.random()) };
  gs.data.traits      = [];
  gs.data.numbers     = { training: 0, travelCount: 0 };
  const s = gs.data.stats;
  s.health        = randomClamped(rng);
  s.endurance     = randomClamped(rng);
  s.strength      = randomClamped(rng);
  s.agility       = randomClamped(rng);
  s.intelligence  = randomClamped(rng);
  s.creativity    = randomClamped(rng);
  s.discipline    = randomClamped(rng);
  s.focus         = randomClamped(rng);
  s.confidence    = randomClamped(rng);
  s.charisma      = randomClamped(rng);
  s.empathy       = randomClamped(rng);
  s.social        = randomClamped(rng);
  s.happiness     = randomClamped(rng);
  s.luck          = randomClamped(rng, 50, 30, 25, 90);
}

// Yaşa göre karakter görseli
const CHAR_SPRITES = [
  { maxAge: 5,  src: require('./assets/e1.png')  },
  { maxAge: 11, src: require('./assets/e2.webp') },
  { maxAge: 16, src: require('./assets/e3.jpg')  },
  { maxAge: 30, src: require('./assets/e4.webp') },
  { maxAge: 99, src: require('./assets/e5.webp') },
];
function charSprite(age) {
  return (CHAR_SPRITES.find(s => age <= s.maxAge) ?? CHAR_SPRITES[4]).src;
}

// ─── Karakter Kartı ──────────────────────────────────────────────────────────
function CharacterCard({ char, onContinue, onDelete }) {
  const { year, age, phase } = getCharPhase(char.sceneId);
  const goal = Goals.list.find(g => g.id === char.flags?.goal);
  const s    = char.stats || {};
  const health   = Math.round(s.health    || 0);
  const happy    = Math.round(s.happiness || 0);
  const intel    = Math.round(s.intelligence || 0);
  const isDead   = !!char.isDead;

  const barColor = (v) => v >= 50 ? '#3fb950' : v >= 25 ? '#f0883e' : '#f85149';
  const Bar = ({ label, value }) => (
    <View style={cc.barRow}>
      <Text style={cc.barLabel}>{label}</Text>
      <View style={cc.barBg}>
        <View style={[cc.barFill, { width: `${Math.min(100, value)}%`, backgroundColor: barColor(value) }]} />
      </View>
      <Text style={[cc.barVal, { color: barColor(value) }]}>{value}</Text>
    </View>
  );

  const handleDelete = () => {
    Alert.alert(
      'Karakteri Sil',
      'Bu karakteri kalıcı olarak silmek istiyor musun?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Sil', style: 'destructive', onPress: () => onDelete(char.id) },
      ]
    );
  };

  return (
    <View style={[cc.card, isDead && cc.deadCard]}>
      {/* Başlık */}
      <View style={cc.cardHeader}>
        <Image source={charSprite(age)} style={[cc.sprite, isDead && { opacity: 0.4 }]} resizeMode="contain" />
        <View style={{ flex: 1, marginLeft: 10 }}>
          <Text style={[cc.goalTxt, isDead && { color: '#6b7280' }]} numberOfLines={1}>
            {goal?.icon || '🎯'} {goal?.label || 'Hedef Belirsiz'}
          </Text>
          <Text style={cc.phaseTxt}>{year} · {phase} · {age} yaş</Text>
        </View>
        <TouchableOpacity onPress={handleDelete} style={cc.delBtn}>
          <Text style={cc.delTxt}>🗑</Text>
        </TouchableOpacity>
      </View>

      {/* Stat barlar */}
      <View style={cc.barsWrap}>
        <Bar label="❤️ Sağlık"   value={health} />
        <Bar label="😊 Mutluluk" value={happy}  />
        <Bar label="🧠 Zekâ"     value={intel}  />
      </View>

      {/* Alt aksiyon */}
      {isDead ? (
        <View style={cc.deadBanner}>
          <Text style={cc.deadIco}>💀</Text>
          <Text style={cc.deadTxt}>{char.deathReason || 'Hayatını tamamladı'}</Text>
        </View>
      ) : (
        <TouchableOpacity style={cc.continueBtn} onPress={() => onContinue(char)}>
          <Text style={cc.continueTxt}>Devam Et  ▶</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Ölüm Ekranı ─────────────────────────────────────────────────────────────
function DeathScreen({ char, deathReason, onHome }) {
  const { year, age, phase } = getCharPhase(char?.sceneId);
  const s = char?.stats || {};
  const goal = Goals.list.find(g => g.id === char?.flags?.goal);

  return (
    <View style={ds.screen}>
      <StatusBar style="light" />
      <Text style={ds.skull}>💀</Text>
      <Text style={ds.title}>Hayat Bitti</Text>
      <Text style={ds.reason}>{deathReason}</Text>

      <View style={ds.infoBox}>
        <Text style={ds.infoGoal}>{goal?.icon} {goal?.label}</Text>
        <Text style={ds.infoPhase}>{year} yılında, {age} yaşında · {phase}</Text>
      </View>

      <View style={ds.statsGrid}>
        {Object.entries(s).slice(0, 8).map(([k, v]) => (
          <View key={k} style={ds.statChip}>
            <Text style={ds.statK}>{prettyStat(k)}</Text>
            <Text style={ds.statV}>{Math.round(v)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={ds.homeBtn} onPress={onHome}>
        <Text style={ds.homeBtnTxt}>🏠  Ana Sayfaya Dön</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function App() {
  const [characters,    setCharacters]   = useState(null); // null=yükleniyor
  const [screen,        setScreen]       = useState('loading');
  const [deathInfo,     setDeathInfo]    = useState(null); // {reason, charSnapshot}
  const [storyReady,    setStoryReady]   = useState(false);
  const [currentSceneId,setSceneId]      = useState('intro');
  const [hudOpen,       setHudOpen]      = useState(false);
  const [selectedStat,  setSelectedStat] = useState(null);

  const gameStateRef    = useRef(null);
  const sceneManagerRef = useRef(null);
  const activeCharIdRef = useRef(null);
  const testChoiceRef   = useRef(null); // test modunda otomatik seçim

  // ─── AsyncStorage yükle ────────────────────────────────────────────────────
  useEffect(() => {
    SaveManager.loadAll().then(chars => {
      setCharacters(chars);
      setScreen('home');
    });
  }, []);

  // ─── GameState + SceneManager kur ──────────────────────────────────────────
  const setupGame = useCallback((charId, sceneId = 'intro') => {
    // Temiz GameState
    if (!gameStateRef.current) gameStateRef.current = new GameState();
    activeCharIdRef.current = charId;

    const gs = gameStateRef.current;
    const sm = new SceneManager({
      initialSceneId: sceneId,
      sceneRegistry:  scenes,
      gameState:      gs,
      onSceneChange:  (newId) => {
        if (!newId) return;

        // ── Ölüm kontrolü: fail_ sahnesi ───────────────────────────────
        if (newId.startsWith('fail_')) {
          const reason = '💥 Kritik bir hata oluştu';
          _handleDeath(reason, gs, newId);
          return;
        }

        // ── Rastgele olay (%10) ─────────────────────────────────────────
        if (!newId.startsWith('rand_')) {
          const statDeathReason = checkDeath(gs.data.stats);
          if (statDeathReason) {
            _handleDeath(statDeathReason, gs, newId);
            return;
          }
          if (Math.random() < 0.10) {
            gs.data.flags.returnScene = newId;
            const pool = ['rand_meet','rand_lottery','rand_inheritance'];
            const pick = pool[Math.floor(Math.random() * pool.length)];
            setTimeout(() => sm.transitionTo(pick), 0);
            return;
          }
        }

        // ── Stat alt limitleri ─────────────────────────────────────────
        const mins = { health:5, endurance:5, strength:5, agility:5, intelligence:5,
                       creativity:5, discipline:5, focus:5, confidence:5, charisma:5,
                       empathy:5, social:5, happiness:5, luck:10 };
        for (const [k, m] of Object.entries(mins)) {
          if ((gs.data.stats[k] || 0) < m) {
            const reason = DEATH_CONDITIONS.find(d => d.key === k)?.reason
              || `📉 ${prettyStat(k)} sıfıra düştü`;
            setTimeout(() => _handleDeath(reason, gs, newId), 0);
            return;
          }
        }

        setSceneId(sm.currentSceneId);

        // ── Otomatik kaydet ─────────────────────────────────────────────
        _autoSave(sm.currentSceneId, gs);
      },
    });

    sceneManagerRef.current = sm;
    setSceneId(sceneId);
  }, []);

  const _handleDeath = useCallback((reason, gs, sceneId) => {
    const snapshot = SaveManager.snapshot(activeCharIdRef.current, sceneId, gs);
    const dead = { ...snapshot, isDead: true, deathReason: reason };
    SaveManager.saveCharacter(dead);
    setCharacters(prev => {
      if (!prev) return [dead];
      const idx = prev.findIndex(c => c.id === dead.id);
      if (idx >= 0) { const a = [...prev]; a[idx] = dead; return a; }
      return [dead, ...prev];
    });
    setDeathInfo({ reason, charSnapshot: dead });
    setScreen('dead');
  }, []);

  const _autoSave = useCallback((sceneId, gs) => {
    if (!activeCharIdRef.current) return;
    const snap = SaveManager.snapshot(activeCharIdRef.current, sceneId, gs);
    SaveManager.saveCharacter(snap);
    setCharacters(prev => {
      if (!prev) return [snap];
      const idx = prev.findIndex(c => c.id === snap.id);
      if (idx >= 0) { const a = [...prev]; a[idx] = snap; return a; }
      return [snap, ...prev];
    });
  }, []);

  // ─── Yeni karakter başlat ──────────────────────────────────────────────────
  const startNewGame = useCallback(() => {
    const charId = `char_${Date.now()}`;
    activeCharIdRef.current = charId;
    const gs = new GameState();
    gameStateRef.current = gs;
    const seed = Date.now() % 2147483647;
    initGameState(gs, seed);
    setupGame(charId, 'intro');
    setStoryReady(false);
    setHudOpen(false);
    setScreen('intro_story');
  }, [setupGame]);

  // ─── Kayıtlı karaktere devam et ───────────────────────────────────────────
  const continueCharacter = useCallback((char) => {
    const gs = new GameState();
    gameStateRef.current = gs;
    SaveManager.restore(gs, char);
    setupGame(char.id, char.sceneId || 'intro');
    setHudOpen(false);
    setScreen('game');
  }, [setupGame]);

  // ─── Karakter sil ──────────────────────────────────────────────────────────
  const deleteCharacter = useCallback((id) => {
    SaveManager.deleteCharacter(id);
    setCharacters(prev => (prev || []).filter(c => c.id !== id));
  }, []);

  // ─── Seçim işleyici ────────────────────────────────────────────────────────
  const handleChoose = useCallback((c) => {
    const gs  = gameStateRef.current;
    const sm  = sceneManagerRef.current;
    if (!gs || !sm) return;
    try {
      if (Array.isArray(c.effects)) Effects.applyEffects(c.effects, gs);
      const nextId = typeof c.next === 'function' ? c.next(gs) : c.next;
      if (!nextId) throw new Error(`next boş: ${c.label}`);
      sm.transitionTo(nextId);
    } catch (err) {
      console.error('[CHOICE ERROR]', c.label, String(err));
    }
  }, []);

  const gs  = gameStateRef.current;
  const sm  = sceneManagerRef.current;

  // ════════ YÜKLEME ════════
  if (screen === 'loading' || characters === null) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <StatusBar style="light" />
        <Text style={{ color: '#3fb950', fontSize: 32, fontWeight: '900', marginBottom: 8 }}>Kader Yolu</Text>
        <Text style={{ color: '#4b5563', fontSize: 13 }}>Yükleniyor…</Text>
      </View>
    );
  }

  // ════════ ÖLÜM EKRANI ════════
  if (screen === 'dead' && deathInfo) {
    return (
      <DeathScreen
        char={deathInfo.charSnapshot}
        deathReason={deathInfo.reason}
        onHome={() => { setDeathInfo(null); setScreen('home'); }}
      />
    );
  }

  // ════════ ANA SAYFA ════════
  if (screen === 'home') {
    const liveChars = (characters || []).filter(c => !c.isDead);
    const deadChars = (characters || []).filter(c =>  c.isDead);
    const canCreate = (characters || []).length < 5;

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={[home.header, { paddingTop: SAFE_TOP + 12 }]}>
          <Text style={home.logo}>KADER YOLU</Text>
          <Text style={home.sub}>İstanbul · 2000–2030+</Text>
        </View>

        <ScrollView contentContainerStyle={home.scroll} showsVerticalScrollIndicator={false}>
          {/* Aktif karakterler */}
          {liveChars.length > 0 && (
            <>
              <Text style={home.sectionLabel}>▶ AKTİF KARAKTERLERİN</Text>
              {liveChars.map(char => (
                <CharacterCard
                  key={char.id}
                  char={char}
                  onContinue={continueCharacter}
                  onDelete={deleteCharacter}
                />
              ))}
            </>
          )}

          {/* Yeni karakter butonu */}
          {canCreate ? (
            <TouchableOpacity style={home.newCard} onPress={startNewGame} activeOpacity={0.8}>
              <Text style={home.newCardIco}>＋</Text>
              <Text style={home.newCardTxt}>Yeni Karakter Başlat</Text>
              <Text style={home.newCardSub}>2000 İstanbul'u · Yeni doğum</Text>
            </TouchableOpacity>
          ) : (
            <View style={home.slotsFullCard}>
              <Text style={home.slotsFullTxt}>Maksimum 5 karakter. Devam etmek için bir karakter sil.</Text>
            </View>
          )}

          {/* Ölü karakterler */}
          {deadChars.length > 0 && (
            <>
              <Text style={[home.sectionLabel, { color: '#6b7280', marginTop: 20 }]}>💀 TAMAMLANMIŞ HAYATLAR</Text>
              {deadChars.map(char => (
                <CharacterCard
                  key={char.id}
                  char={char}
                  onContinue={() => {}}
                  onDelete={deleteCharacter}
                />
              ))}
            </>
          )}

          {/* Alt butonlar */}
          <View style={home.footerRow}>
            <TouchableOpacity style={home.footerBtn} onPress={() => setScreen('minigames')}>
              <Text style={home.footerBtnTxt}>🃏 Oyun Listesi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={home.footerBtn} onPress={() => setScreen('schema')}>
              <Text style={home.footerBtnTxt}>🌳 Hayat Şeması</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </View>
    );
  }

  // ════════ ŞEMA ════════
  if (screen === 'schema') {
    return <GameSchema onBack={() => setScreen('home')} />;
  }

  // ════════ AÇILIŞ HİKAYESİ ════════
  if (screen === 'intro_story') {
    const goal  = Goals.list.find(g => g.id === gs?.data?.flags?.goal);
    const reqs  = Goals.requirements(gs?.data?.flags?.goal || '');
    const story = getIntroStory(gs?.data?.flags?.goal);

    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={{ padding: 24, paddingTop: SAFE_TOP + 16, paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => setScreen('home')} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#58a6ff', fontSize: 14 }}>← Ana Sayfa</Text>
          </TouchableOpacity>
          <Text style={styles.homeTitle}>Kader Yolu</Text>
          <Text style={[styles.homeSubtitle, { marginBottom: 20 }]}>Hayatın şimdi başlıyor</Text>

          <View style={is.goalCard}>
            <Text style={is.sectionLabel}>🎯 Hayat Amacın</Text>
            <Text style={is.goalText}>{goal?.label}</Text>
            {reqs.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={is.reqsTitle}>Ulaşmak için gerekenler:</Text>
                {reqs.map((r, i) => (
                  <Text key={i} style={is.reqLine}>
                    {'• '}{r.label || prettyStat(r.key)}{r.min ? `:  ${r.min}+` : r.equals ? `:  ${r.equals}` : ''}
                  </Text>
                ))}
              </View>
            )}
          </View>

          <View style={is.statsCard}>
            <Text style={is.sectionLabel}>✨ Doğuştan gelen özellikler</Text>
            <View style={is.statsGrid}>
              {gs && Object.entries(gs.data.stats).map(([k, v]) => (
                <View key={k} style={is.statChip}>
                  <Text style={is.statChipKey}>{prettyStat(k)}</Text>
                  <Text style={is.statChipVal}>{Math.round(v)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={is.storyCard}>
            <TypewriterText text={story} speed={18} style={is.storyText} onComplete={() => setStoryReady(true)} />
          </View>

          {storyReady ? (
            <TouchableOpacity style={styles.homeBtn} onPress={() => setScreen('game')}>
              <Text style={styles.homeBtnText}>🎮 Hayata Başla</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.homeBtn, styles.homeBtnSecondary]} onPress={() => setStoryReady(true)}>
              <Text style={styles.homeBtnText}>⏭  Hikayeyi Atla</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  }

  // ════════ MİNİ OYUN LİSTESİ ════════
  if (screen === 'minigames') {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <ScrollView contentContainerStyle={{ padding: 20, paddingTop: SAFE_TOP + 16, paddingBottom: 40 }}>
          <TouchableOpacity onPress={() => setScreen('home')} style={{ marginBottom: 16 }}>
            <Text style={{ color: '#58a6ff', fontSize: 15 }}>← Ana Sayfa</Text>
          </TouchableOpacity>
          <Text style={styles.homeTitle}>Oyun Testi</Text>
          <Text style={[styles.homeSubtitle, { marginBottom: 24 }]}>
            Oyuna dokun → direkt başlar (testChoice otomatik)
          </Text>
          {MINI_GAME_CATEGORIES.map((cat, ci) => (
            <View key={ci} style={mg.catBlock}>
              <View style={mg.catHeader}>
                <Text style={mg.catTitle}>{cat.title}</Text>
                <Text style={mg.catDesc}>{cat.desc}</Text>
              </View>
              {cat.games.map((game, gi) => (
                <TouchableOpacity key={gi} style={mg.gameRow} onPress={() => {
                  testChoiceRef.current = game.testChoice || null;
                  const testId = `test_${Date.now()}`;
                  const testGs = new GameState();
                  gameStateRef.current = testGs;
                  initGameState(testGs, Date.now() % 2147483647);
                  setupGame(testId, game.id);
                  setScreen('game');
                }} activeOpacity={0.75}>
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

  // ════════ OYUN ════════
  if (!gs || !sm) return null;

  let scene;
  try {
    const sceneFactory = sm.sceneRegistry[currentSceneId];
    scene = typeof sceneFactory === 'function' ? sceneFactory(gs) : sceneFactory;
    if (!scene || typeof scene !== 'object') throw new Error(`Sahne döndürmedi: ${currentSceneId}`);
  } catch (err) {
    console.error('[SCENE RENDER ERROR]', currentSceneId, String(err));
    scene = { text: `<p>Hata: ${err.message}</p>`, choices: [{ label: '← Geri', next: 'intro' }] };
  }

  const backgroundSource = getBackgroundForScene(currentSceneId);
  const gameType         = getGameType(currentSceneId, scene?.choices);

  if (currentSceneId.startsWith('rand_')) {
    return (
      <RandomEventGame
        eventId={currentSceneId}
        gameState={gs}
        onComplete={(bonusDelta) => {
          if (bonusDelta) {
            const s = gs.data.stats;
            for (const [k, v] of Object.entries(bonusDelta)) {
              if (v !== undefined) s[k] = (s[k] || 0) + v;
            }
          }
          const returnScene = gs.data.flags.returnScene || 'y2026_growth';
          sm.transitionTo(returnScene);
        }}
      />
    );
  }

  if (currentSceneId.startsWith('game_dice')) {
    return <DiceGame gameState={gs} onExit={() => { sm.currentSceneId = 'y2026_growth'; setSceneId('y2026_growth'); setScreen('game'); }} />;
  }
  if (currentSceneId.startsWith('game_bj')) {
    return <BlackjackGame gameState={gs} onExit={() => { sm.currentSceneId = 'y2026_growth'; setSceneId('y2026_growth'); setScreen('game'); }} />;
  }
  if (currentSceneId.startsWith('game_pisti')) {
    return <PistiGame gameState={gs} onExit={() => { sm.currentSceneId = 'y2026_growth'; setSceneId('y2026_growth'); setScreen('game'); }} />;
  }

  const FullScreenWrap = ({ children }) => backgroundSource
    ? <ImageBackground source={backgroundSource} resizeMode="cover" style={styles.container}><View style={styles.overlay}/>{children}</ImageBackground>
    : <View style={styles.container}>{children}</View>;

  if (gameType === 'character') {
    return <FullScreenWrap><StatusBar style="auto"/><CharacterSelect scene={scene} sceneText={scene.text} gameState={gs} Conditions={Conditions} onChoose={handleChoose}/></FullScreenWrap>;
  }
  if (gameType === 'bubble') {
    return <FullScreenWrap><StatusBar style="auto"/><BubblePop scene={scene} sceneText={scene.text} gameState={gs} Conditions={Conditions} onChoose={handleChoose}/></FullScreenWrap>;
  }
  if (gameType === 'choice_game') {
    const tc = testChoiceRef.current;
    testChoiceRef.current = null; // bir kere kullanıldıktan sonra temizle
    return <FullScreenWrap><StatusBar style="auto"/><ChoiceGameRouter scene={scene} sceneText={scene.text} gameState={gs} Conditions={Conditions} onChoose={handleChoose} testChoice={tc}/></FullScreenWrap>;
  }

  return (
    <FullScreenWrap>
      <View key={currentSceneId} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[styles.content, { paddingTop: SAFE_TOP + 8 }]}>
          {/* Üst bar */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <TouchableOpacity onPress={() => {
              _autoSave(currentSceneId, gs);
              setScreen('home');
            }}>
              <Text style={{ color: '#58a6ff', fontSize: 14 }}>← Ana Sayfa</Text>
            </TouchableOpacity>
            <TouchableOpacity style={hud.skipBtn} onPress={() => {
              try {
                const s2  = sm.sceneRegistry[currentSceneId];
                const sc2 = typeof s2 === 'function' ? s2(gs) : s2;
                const valid = (sc2?.choices || []).filter(c => Conditions.evaluateAll(c.conditions, gs));
                if (valid.length > 0) handleChoose(valid[0]);
              } catch (e) { console.warn('[SKIP]', e); }
            }}>
              <Text style={hud.skipTxt}>Atla ⏭</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.title}>Kader Yolu</Text>

          {/* HUD */}
          <View style={styles.card}>
            <TouchableOpacity onPress={() => setHudOpen(v => !v)} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.reqText, { color: '#58a6ff', fontSize: 11, marginBottom: 1 }]}>
                  {getLifePhase(currentSceneId) || ''}
                </Text>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  🎯 {Goals.list.find(g => g.id === gs.data.flags.goal)?.label || '—'}
                </Text>
              </View>
              <Text style={{ color: '#8b949e', fontSize: 18, marginLeft: 8 }}>{hudOpen ? '▲' : '▼'}</Text>
            </TouchableOpacity>

            {hudOpen && (
              <>
                {Goals.requirements(gs.data.flags.goal).length > 0 && (
                  <View style={{ marginTop: 10, gap: 7 }}>
                    <Text style={[styles.reqText, { fontWeight: '700', marginBottom: 2 }]}>Hedef için gerekenler:</Text>
                    {Goals.requirements(gs.data.flags.goal).map((req, i) => {
                      let cur = 0, need = req.min || 1, label = req.label || prettyStat(req.key);
                      if (req.kind === 'stat')   cur = Math.round(gs.data.stats[req.key] || 0);
                      if (req.kind === 'number') cur = Math.round((gs.data.numbers?.[req.key]) || 0);
                      if (req.kind === 'flag') {
                        const ok = String(gs.data.flags[req.key]) === String(req.equals);
                        return <Text key={i} style={styles.reqText}>{label}: {ok ? '✅ Tamam' : '❌ Gerekli'}</Text>;
                      }
                      const pct = Math.min(1, cur / need);
                      return (
                        <TouchableOpacity key={i} onPress={() => setSelectedStat(req.key || req.label)}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                            <Text style={styles.reqText}>{label}</Text>
                            <Text style={[styles.reqText, { color: pct >= 1 ? '#3fb950' : '#e6edf3' }]}>{cur} / {need}</Text>
                          </View>
                          <View style={hud.bar}><View style={[hud.fill, { width: `${pct * 100}%`, backgroundColor: pct >= 1 ? '#3fb950' : '#1f6feb' }]} /></View>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}
                <View style={[styles.previewRow, { marginTop: 10 }]}>
                  {Object.entries(gs.data.stats).map(([k, v]) => (
                    <TouchableOpacity key={k} style={styles.chip} onPress={() => setSelectedStat(k)}>
                      <Text style={styles.chipText}>{prettyStat(k)} {Math.round(v)}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>

          {/* Stat detay modal */}
          {selectedStat && (
            <TouchableOpacity style={hud.modal} onPress={() => setSelectedStat(null)} activeOpacity={1}>
              <View style={hud.modalBox}>
                <Text style={hud.modalTitle}>{prettyStat(selectedStat)}</Text>
                <Text style={hud.modalBody}>{STAT_TIPS[selectedStat] || 'Oyun içinde seçimlerinle gelişir.'}</Text>
                <Text style={hud.modalClose}>Kapat ✕</Text>
              </View>
            </TouchableOpacity>
          )}

          <View style={styles.card}><SceneText html={scene.text} /></View>
          <SceneGame
            sceneId={currentSceneId} scene={scene} gameState={gs}
            buildStatPreview={buildStatPreview} Conditions={Conditions}
            onChoose={handleChoose}
          />
        </ScrollView>
      </View>
      <StatusBar style="auto" />
    </FullScreenWrap>
  );
}

// ═══════════════ YARDIMCI BİLEŞENLER ══════════════════════════════════════════

function TypewriterText({ text, speed = 20, style, onComplete }) {
  const [shown, setShown] = useState('');
  const iRef = useRef(0);
  useEffect(() => {
    iRef.current = 0; setShown('');
    const t = setInterval(() => {
      iRef.current++;
      if (iRef.current <= text.length) {
        setShown(text.slice(0, iRef.current));
        if (iRef.current === text.length) { clearInterval(t); onComplete?.(); }
      }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <Text style={style}>{shown}</Text>;
}

function getLifePhase(sceneId) {
  if (!sceneId) return null;
  const m = sceneId.match(/y(\d{4})/);
  if (m) return m[1] + ' yılı';
  if (sceneId === 'intro') return '2000 · Doğum';
  if (sceneId.startsWith('rand_')) return 'Rastgele Olay';
  if (sceneId.startsWith('goal_')) return 'Hedef Değerlendirme';
  if (sceneId.startsWith('fail_')) return 'Oyun Sonu';
  return null;
}

function getIntroStory(goalId) {
  const map = {
    wealthGoal:     'İstanbul\'un kalabalık sokaklarında dünyaya geldin. Ailen geçim sıkıntısı çekiyor. Küçük bir çocukken bile paranın ne kadar önemli olduğunu hissettin.\n\nGünün birinde zengin olacaksın — bundan eminsin. Her seçim seni bu hedefe yaklaştıracak ya da uzaklaştıracak.',
    doktorOl:       'Hastanede bir çocuğun ağlamasını duyduğunda bir şey değişti içinde. Doktorların insanları nasıl iyileştirdiğini izledin.\n\n"Ben de doktor olacağım." Zor bir yol seni bekliyor — ama kararlısın.',
    muhendisOl:     'Küçükken her şeyi söküp takıyordun. Anneni çok uğraştırdın! Ama o merak sende hep kaldı.\n\nMühendislik senin dünyanı inşa etme şeklin. Her problem çözülmesi gereken bir bulmaca.',
    mimarOl:        'Şehrin silüetine baktığında hep düşündün: "Bunları ben yapabilirdim daha güzel."\n\nMimarlık hem sanat hem bilim. Yaratıcılığın ve disiplinin buluşma noktası.',
    dunyayiGez:     'Dünya haritasına baktığında için sıkışıverdi. Neden hep aynı şehir, aynı sokaklar?\n\nBir gün dünyanın her köşesini göreceksin. Her seçim seni o özgürlüğe yaklaştırabilir.',
    olympicAthlete: 'İlk koştuğunda rüzgarı hissettin. Bedenin sana bir şey söylüyordu.\n\nOlimpiyat kürsüsünde durmanın nasıl bir şey olduğunu hayal ettin. Bunun için ter, emek ve disiplin gerekecek.',
    entrepreneur:   'İlk kez bir şeyler satıp para kazandığında anladın: bu hissi seviyordun.\n\nKendi işini kurmak, kendi kararlarını vermek. Risk var — ama kazanç da büyük.',
    academician:    'Kitapların arasında kaybolmak seni mutlu ediyordu. Öğrenmek bir tutku haline geldi.\n\nAkademisyen olmak — bilginin sınırlarını genişletmek. Uzun bir yol, ama merakın seni götürür.',
    importExport:   'Pazardaki yabancı ürünlere baktığında fark ettin: dünya çok büyük, fırsatlar çok fazla.\n\nİthalat-İhracat — köprü kurmak, dünyayı bağlamak. Hem para hem macera.',
  };
  return map[goalId] || 'Hayatın önünde uzanıyor. Her seçim seni farklı bir yöne çekiyor.\n\nNe olacağını bilmiyorsun — ama her adım önemli.';
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

function stripHtml(html) { return html.replace(/<[^>]+>/g, ''); }

function SceneText({ html }) {
  if (!html) return null;
  const h2Match   = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const title     = h2Match ? h2Match[1].replace(/<[^>]+>/g, '').trim() : null;
  const pMatches  = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs= pMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  const plain     = (!h2Match && pMatches.length === 0) ? stripHtml(html).trim() : null;
  return (
    <>
      {title      ? <Text style={styles.sceneTitle}>{title}</Text> : null}
      {paragraphs.map((p, i) => <Text key={i} style={styles.cardText}>{p}</Text>)}
      {plain      ? <Text style={styles.cardText}>{plain}</Text> : null}
    </>
  );
}

function buildStatPreview(choice) {
  const lines = []; let net = 0;
  if (Array.isArray(choice.effects)) {
    for (const eff of choice.effects) {
      if (eff.statDelta) {
        for (const [k, v] of Object.entries(eff.statDelta)) {
          lines.push(`${prettyStat(k)} ${v >= 0 ? '+' : ''}${v}`);
          if (k !== 'money') net += v;
        }
      }
      if (eff.numberDelta) {
        for (const [k, v] of Object.entries(eff.numberDelta)) {
          lines.push(`${prettyStat(k)} ${v >= 0 ? '+' : ''}${v}`);
        }
      }
    }
  }
  return { lines, net };
}

function prettyStat(key) {
  const map = {
    health:'Sağlık', endurance:'Day.', strength:'Güç', agility:'Çev.',
    intelligence:'Zekâ', creativity:'Yaratıcılık', discipline:'Disiplin', focus:'Odak',
    confidence:'Özgüven', charisma:'Karizma', empathy:'Empati', social:'Sosyal',
    happiness:'Mutluluk', luck:'Şans', money:'Para', training:'Ant.', travelCount:'Sey.'
  };
  return map[key] || key;
}

function getBackgroundForScene(sceneId) {
  if (!sceneId) return null;
  if (sceneId === 'intro' || sceneId === 'goal_select' || sceneId === 'y2000_2006_caretaking' ||
      sceneId.startsWith('y2001_') || sceneId.startsWith('y2004_') || sceneId.startsWith('y2005_'))
    return require('./assets/age1_baby.png');
  if (sceneId.startsWith('y2006_') || sceneId.startsWith('y2008_') || sceneId.startsWith('y2010_') || sceneId.startsWith('y2011_'))
    return require('./assets/age2_child.png');
  if (sceneId.startsWith('y2012_') || sceneId.startsWith('y2013_') || sceneId.startsWith('y2015_') ||
      sceneId.startsWith('y2016_') || sceneId.startsWith('y2017_') || sceneId.startsWith('y2018_'))
    return require('./assets/age3_teen.png');
  if (sceneId.startsWith('y2019_') || sceneId.startsWith('y2020_') || sceneId.startsWith('y2021_') ||
      sceneId.startsWith('y2022_') || sceneId.startsWith('y2023_') || sceneId.startsWith('y2024_'))
    return require('./assets/age4_young.png');
  if (sceneId.startsWith('y2025_') || sceneId.startsWith('y2026_') || sceneId.startsWith('y2027_') ||
      sceneId.startsWith('y2028_') || sceneId.startsWith('y2029_') || sceneId.startsWith('y2030_') ||
      sceneId.startsWith('rand_')  || sceneId.startsWith('goal_')  || sceneId.startsWith('game_') || sceneId.startsWith('fail_'))
    return require('./assets/age5_adult.png');
  return null;
}

const STAT_TIPS = {
  intelligence: 'Kitap okuma, okul başarısı, bilim projeleri ve deney setleriyle artar.',
  discipline:   'Düzenli çalışma, rutin alışkanlıklar ve ödev takibiyle gelişir.',
  focus:        'Hedef odaklı aktiviteler, erken uyku ve düzenli rutinle güçlenir.',
  health:       'Spor yapma, yüzme ve aktif oyunlarla artar.',
  endurance:    'Koşu, yüzme ve uzun soluklu spor antrenmanlarıyla gelişir.',
  strength:     'Güreş, ağır spor ve fiziksel antrenmanlarla artar.',
  agility:      'Futbol, sokak oyunları ve aktif hareketle gelişir.',
  creativity:   'Resim kursu, müzik, tiyatro ve sanat aktiviteleriyle artar.',
  confidence:   'Başarılı seçimler, sosyal aktiviteler ve liderlik deneyimleriyle güçlenir.',
  charisma:     'Tiyatro, sosyal etkinlikler ve topluluk önünde konuşmayla artar.',
  empathy:      'Akraba ziyaretleri, gönüllülük ve aile ilişkileriyle gelişir.',
  social:       'Toplu etkinlikler, oyun grupları ve sosyal aktivitelerle artar.',
  happiness:    'Aile zamanı, hobiler ve sevdiğin aktivitelerle yükselir.',
  luck:         'Doğuştan belirlenir. Bazı rastgele olayları olumlu etkiler.',
  money:        'Kariyer seçimleri, yatırımlar ve ekonomik kararlarla değişir.',
};

// ─── Mini Oyun Test Listesi ───────────────────────────────────────────────────
// testChoice varsa ChoiceGameRouter o seçimi otomatik seçer → oyun direkt başlar
const MINI_GAME_CATEGORIES = [
  {
    title: '🎮 Tüm Mini Oyunlar — Direkt Erişim',
    desc:  'Bir tıkla oyunu başlat. Sahne açılır, seçim otomatik yapılır.',
    games: [
      // ── Benzersiz / özel oyunlar ────────────────────────────────────────────
      { id: 'intro',
        label: '👶 Bebek Yolculuğu',
        desc:  'BabyRaceGame — Biberon topla, anne veya baba şeridine ulaş' },

      { id: 'y2001_outing_father',
        testChoice: 'Stadyum',
        label: '⚽ Penaltı Atışı',
        desc:  'PenaltyKick — Kaleciye karşı penaltı atışı' },

      { id: 'y2001_outing_father',
        testChoice: 'Tamirci dükkânı',
        label: '🔌 Devre Bulmaca',
        desc:  'CircuitPuzzle — Kabloları doğru bağla, devreyi kapat' },

      { id: 'y2001_outing_father',
        testChoice: 'Bilgisayar fuarı',
        label: '🕹️ Atari Klasikleri',
        desc:  'ClassicGames — Pac-Man, Breakout ve Snake bir arada' },

      { id: 'y2001_outing_mother',
        testChoice: 'Müze',
        label: '🏛️ Müze Quizi',
        desc:  'MuseumQuiz — Sanat eserleri hakkında sorular' },

      { id: 'y2001_outing_mother',
        testChoice: 'Kütüphane',
        label: '📚 Kütüphane Quizi',
        desc:  'LibraryQuiz — Kitap bilgisi ve genel kültür' },

      { id: 'y2001_outing_mother',
        testChoice: 'Akraba ziyareti',
        label: '👨‍👩‍👧 Akraba Tanıma',
        desc:  'AkrabaGame — Babamın erkek kardeşi kimdir? 10 soru' },

      { id: 'y2001_outing_mother2',
        testChoice: 'Resim kursu',
        label: '🎨 Renk Atölyesi',
        desc:  'ResimKursuGame — Referans resmi tuvalde boya' },

      { id: 'y2001_outing_mother2',
        testChoice: 'Okuma saati',
        label: '📖 Okuma Saati',
        desc:  'OkumaSaatiGame — Kısa hikaye oku, anlama sorularını cevapla' },

      { id: 'y2001_outing_mother2',
        testChoice: 'Aile pikniği',
        label: '🏸 Badminton',
        desc:  'BadmintonGame — Kapatağı vur, raketle sürükle & vur' },

      { id: 'y2001_outing_both',
        testChoice: 'Park',
        label: '🌳 Yanlış Hayvanı Bul',
        desc:  'ParkGame — Parkta yanlış habitattaki hayvanı bul' },

      { id: 'y2001_outing_both',
        testChoice: 'Toplu etkinlik',
        label: '🎉 Toplu Etkinlik',
        desc:  'EtkinlikGame — Grup etkinlik mini oyunu' },

      { id: 'y2001_outing_both',
        testChoice: 'Sinema',
        label: '🎬 Sinema Quizi',
        desc:  'CinemaGame — Film sahnesi quizi' },

      { id: 'y2001_outing_both2',
        testChoice: 'Toplu oyun',
        label: '🎮 Renk Sırası',
        desc:  'TopluOyunGame — Simon Says: renk dizisini ezberle, tekrarla' },

      { id: 'y2001_outing_both2',
        testChoice: 'Alışveriş',
        label: '🛒 Market Koşusu',
        desc:  'AlisverisGame — Listene göre ürünleri taşıyıcı banttan al' },

      { id: 'y2004_early_activities',
        testChoice: 'Yapboz/Zeka oyunları',
        label: '🧩 Hafıza Oyunu',
        desc:  'MemoryGame — Kart çiftlerini eşleştir' },

      // ── Spor izi (y2027–2029) ──────────────────────────────────────────────
      { id: 'y2027_sports',
        testChoice: '🧑‍🏫 Profesyonel antrenör tut',
        label: '🏃 Antrenman (Koşu)',
        desc:  'KosuGame — Profesyonel antrenör ile koşu programı' },

      { id: 'y2027_sports',
        testChoice: '🤝 Takımla çalış',
        label: '🤼 Takım Antrenmanı',
        desc:  'GuresGame — Takım içi rekabet ve güreş' },

      { id: 'y2028_sports_national',
        testChoice: '🥇 Seçmelere katıl',
        label: '🥇 Milli Seçmeler',
        desc:  'GuresGame — Seçme yarışması rekabeti' },

      { id: 'y2028_sports_national',
        testChoice: '🏟️ Önce yerel ligde güçlen',
        label: '🏟️ Yerel Lig',
        desc:  'PenaltyKick — Yerel lig saha maçı' },

      { id: 'y2029_sports_international',
        testChoice: '🌍 Uluslararası turnuva',
        label: '🌍 Uluslararası Turnuva',
        desc:  'GuresGame — Uluslararası rekabet' },

      { id: 'y2029_sports_international',
        testChoice: '🇹🇷 Ulusal şampiyonluk',
        label: '🇹🇷 Ulusal Şampiyonluk',
        desc:  'PenaltyKick — Ulusal şampiyonluk maçı' },

      // ── Masa oyunları ──────────────────────────────────────────────────────
      { id: 'game_dice_intro',  label: '🎲 Zar Oyunu',    desc: 'Tek/Çift üzerine bahis — animasyonlu zar' },
      { id: 'game_bj_intro',    label: '🃏 Blackjack 21', desc: 'Kart sayma — 21\'i geç, olmadan dur' },
      { id: 'game_pisti_intro', label: '🃏 Pişti',         desc: 'Orta kartı eşleştirerek pişti yap' },
    ],
  },
  {
    title: '📅 Senaryo Akışı — Hikayeyi Ilerlet',
    desc:  'Tam hikaye akışını test et. Seçimleri kendin yap.',
    games: [
      { id: 'y2006_primary_start',  label: '⚡ 2006 İlkokul',          desc: 'EnergyMeter — yoğunluk seç' },
      { id: 'y2012_exam',           label: '📝 2012 Sınav Hazırlık',   desc: 'EnergyMeter — çalışma stratejisi' },
      { id: 'y2015_high_school',    label: '🏫 2015 Lise Seçimi',      desc: 'PathCards — hangi liseye gidiyorsun?' },
      { id: 'y2019_uni_start',      label: '🎓 2019 Üniversite',       desc: 'PathCards — bölüm seç' },
      { id: 'y2024_career',         label: '💼 2024 Kariyer Kavşağı',  desc: 'PathCards — kurumsal/startup/akademi' },
      { id: 'y2027_wealth_invest',  label: '📈 2027 Yatırım Riski',   desc: 'RiskSlider — endeks/fon/kripto' },
    ],
  },
];

// ═══════════════ STİLLER ═════════════════════════════════════════════════════

// Karakter Kartı
const cc = StyleSheet.create({
  card:        { backgroundColor: '#0d1628', borderRadius: 16, borderWidth: 1.5, borderColor: '#1c2e44', padding: 16, marginBottom: 12 },
  sprite:      { width: 52, height: 52, borderRadius: 8 },
  deadCard:    { borderColor: '#374151', backgroundColor: '#0a0d12', opacity: 0.75 },
  cardHeader:  { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  goalTxt:     { color: '#e6edf3', fontSize: 15, fontWeight: '800', marginBottom: 3 },
  phaseTxt:    { color: '#58a6ff', fontSize: 11, fontWeight: '700' },
  delBtn:      { padding: 6, marginLeft: 6 },
  delTxt:      { fontSize: 16 },
  barsWrap:    { gap: 5, marginBottom: 12 },
  barRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  barLabel:    { color: '#8b949e', fontSize: 10, width: 70 },
  barBg:       { flex: 1, height: 5, backgroundColor: '#21262d', borderRadius: 3, overflow: 'hidden' },
  barFill:     { height: '100%', borderRadius: 3 },
  barVal:      { fontSize: 11, fontWeight: '800', width: 28, textAlign: 'right' },
  continueBtn: { backgroundColor: '#1f6feb', borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  continueTxt: { color: '#fff', fontSize: 14, fontWeight: '800' },
  deadBanner:  { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#1a1a1a', borderRadius: 10, padding: 10 },
  deadIco:     { fontSize: 20 },
  deadTxt:     { color: '#6b7280', fontSize: 12, flex: 1 },
});

// Ölüm Ekranı
const ds = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#0a0000', alignItems: 'center', justifyContent: 'center', padding: 28 },
  skull:     { fontSize: 80, marginBottom: 10 },
  title:     { color: '#f85149', fontSize: 28, fontWeight: '900', marginBottom: 6 },
  reason:    { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  infoBox:   { backgroundColor: '#161b22', borderRadius: 14, padding: 16, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#30363d' },
  infoGoal:  { color: '#e6edf3', fontSize: 16, fontWeight: '800', marginBottom: 4 },
  infoPhase: { color: '#8b949e', fontSize: 12 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 20, width: '100%' },
  statChip:  { backgroundColor: '#161b22', borderRadius: 8, padding: 8, alignItems: 'center', minWidth: 72 },
  statK:     { color: '#6b7280', fontSize: 9 },
  statV:     { color: '#e6edf3', fontSize: 14, fontWeight: '800' },
  homeBtn:   { backgroundColor: '#21262d', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, borderWidth: 1, borderColor: '#30363d' },
  homeBtnTxt:{ color: '#e6edf3', fontSize: 16, fontWeight: '700' },
});

// Ana Sayfa
const home = StyleSheet.create({
  header:        { paddingTop: 12, paddingBottom: 16, paddingHorizontal: 20, borderBottomWidth: 1, borderColor: '#21262d', backgroundColor: '#0b0f14' },
  logo:          { color: '#3fb950', fontSize: 28, fontWeight: '900', letterSpacing: 2 },
  sub:           { color: '#4b5563', fontSize: 12, marginTop: 2 },
  scroll:        { padding: 16 },
  sectionLabel:  { color: '#3fb950', fontSize: 10, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10, marginTop: 6 },
  newCard:       { backgroundColor: '#071409', borderRadius: 16, borderWidth: 2, borderColor: '#14401c', borderStyle: 'dashed', padding: 20, alignItems: 'center', marginBottom: 12 },
  newCardIco:    { color: '#3fb950', fontSize: 32, fontWeight: '900', marginBottom: 4 },
  newCardTxt:    { color: '#3fb950', fontSize: 16, fontWeight: '800', marginBottom: 3 },
  newCardSub:    { color: '#4b5563', fontSize: 12 },
  slotsFullCard: { backgroundColor: '#1a0a00', borderRadius: 14, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#f0883e44' },
  slotsFullTxt:  { color: '#f0883e', fontSize: 13, textAlign: 'center' },
  footerRow:     { flexDirection: 'row', gap: 10, marginTop: 16 },
  footerBtn:     { flex: 1, backgroundColor: '#161b22', borderRadius: 12, paddingVertical: 12, alignItems: 'center', borderWidth: 1, borderColor: '#21262d' },
  footerBtnTxt:  { color: '#8b949e', fontSize: 13, fontWeight: '700' },
});

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
  container:   { flex: 1, backgroundColor: '#0b0f14' },
  homeTitle:   { color: '#e6edf3', fontSize: 32, fontWeight: '800', textAlign: 'center', marginBottom: 8 },
  homeSubtitle:{ color: '#8b949e', fontSize: 15, textAlign: 'center', marginBottom: 32 },
  homeBtn:     { backgroundColor: '#1f6feb', borderRadius: 14, paddingVertical: 16, paddingHorizontal: 24, marginBottom: 14, width: '100%', alignItems: 'center' },
  homeBtnSecondary: { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d' },
  homeBtnText: { color: '#e6edf3', fontSize: 17, fontWeight: '700' },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
  content:     { padding: 16 },
  title:       { color: '#e6edf3', fontSize: 18, marginBottom: 12 },
  card:        { backgroundColor: 'rgba(18,24,33,0.88)', borderRadius: 14, padding: 14, marginBottom: 12 },
  cardText:    { color: '#e6edf3', marginTop: 6, lineHeight: 20 },
  sceneTitle:  { color: '#ffffff', fontSize: 17, fontWeight: '700', marginBottom: 4 },
  cardTitle:   { color: '#e6edf3', fontWeight: '700', marginBottom: 8 },
  previewRow:  { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  chip:        { backgroundColor: 'rgba(255,255,255,0.08)', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 8 },
  chipText:    { color: '#c9d4df', fontSize: 12 },
  reqText:     { color: '#c9d4df', fontSize: 12 },
});

const is = StyleSheet.create({
  goalCard:    { backgroundColor: '#0d1628', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#1f6feb55' },
  sectionLabel:{ color: '#58a6ff', fontSize: 11, fontWeight: '700', marginBottom: 6, textTransform: 'uppercase', letterSpacing: 1 },
  goalText:    { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  reqsTitle:   { color: '#8b949e', fontSize: 12, marginBottom: 5 },
  reqLine:     { color: '#c9d4df', fontSize: 13, marginBottom: 3 },
  statsCard:   { backgroundColor: '#0d1117', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#21262d' },
  statsGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  statChip:    { backgroundColor: '#161b22', borderRadius: 8, paddingVertical: 5, paddingHorizontal: 10, alignItems: 'center', minWidth: 64 },
  statChipKey: { color: '#8b949e', fontSize: 10 },
  statChipVal: { color: '#e6edf3', fontSize: 14, fontWeight: '800' },
  storyCard:   { backgroundColor: '#0d1628', borderRadius: 16, padding: 18, marginBottom: 20, borderWidth: 1, borderColor: '#1c2e44', minHeight: 120 },
  storyText:   { color: '#c9d4df', fontSize: 15, lineHeight: 24 },
});

const hud = StyleSheet.create({
  bar:       { height: 6, backgroundColor: '#21262d', borderRadius: 3, overflow: 'hidden', marginTop: 2 },
  fill:      { height: '100%', borderRadius: 3 },
  modal:     { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', zIndex: 99 },
  modalBox:  { backgroundColor: '#161b22', borderRadius: 18, padding: 22, marginHorizontal: 28, width: '85%', borderWidth: 1, borderColor: '#30363d' },
  modalTitle:{ color: '#e6edf3', fontSize: 18, fontWeight: '900', marginBottom: 10 },
  modalBody: { color: '#8b949e', fontSize: 14, lineHeight: 21, marginBottom: 14 },
  modalClose:{ color: '#58a6ff', fontSize: 14, fontWeight: '700', textAlign: 'right' },
  skipBtn:   { backgroundColor: '#21262d', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 12, borderWidth: 1, borderColor: '#30363d' },
  skipTxt:   { color: '#8b949e', fontSize: 12, fontWeight: '700' },
});
