/**
 * BubblePop — Baloncuk Avı mini-oyunu
 * Yukarı yükselen renkli baloncukları patlatarak aktivite seç.
 * 3 tür × platform: her şerit için ayrı renk + ikon.
 * 15 baloncuk ileriden = anında kazanma. 45 saniyede en çok = kazanır.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Platform, StyleSheet,
  Text, TouchableOpacity, TouchableWithoutFeedback, View,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

const GAME_SEC    = 45;
const WIN_COUNT   = 15;    // aynı türde bu kadar = anında kazanma
const SPAWN_MS    = 1050;  // ms arası yeni baloncuk
const MAX_BUBBLES = 9;
const SIZE_MIN    = 64;
const SIZE_MAX    = 92;
const DUR_MIN     = 7500;  // ms (alt → üst yolculuğu)
const DUR_MAX     = 12500;

const PALETTE = [
  { color: '#818cf8', dark: '#1e1b4b', glow: '#a5b4fc', text: '#c7d2fe' },
  { color: '#fb923c', dark: '#431407', glow: '#fdba74', text: '#fed7aa' },
  { color: '#4ade80', dark: '#052e16', glow: '#86efac', text: '#bbf7d0' },
];

const LABEL_ICON = {
  'Stadyum': '🏟️',           'Tamirci dükkânı': '🔧',  'Bilgisayar fuarı': '💻',
  'Müze': '🏛️',              'Kütüphane': '📚',         'Akraba ziyareti': '👨‍👩‍👧',
  'Park': '🌳',               'Toplu etkinlik': '🎉',   'Sinema': '🎬',
  'Mahalle maçı': '⚽',       'Şantiye gezisi': '🏗️',   'Atölye denemesi': '🪚',
  'Resim kursu': '🎨',        'Okuma saati': '📖',       'Aile pikniği': '🧺',
  'Toplu oyun': '🎮',         'Aile toplantısı': '🏠',  'Alışveriş': '🛍️',
  'Okul öncesi eğitime ağırlık ver': '📐',
  'Oyun ve sosyalleşmeye odaklan': '🧸',
  'Sağlık ve hareketi artır': '🏃',
};

function getIcon(label) {
  return LABEL_ICON[label] || '⭐';
}

// ─── Tek baloncuk (native driver - çok akıcı) ─────────────────────────────
const BubbleView = React.memo(({ b, onPop }) => {
  const pal = PALETTE[b.type];
  return (
    <TouchableWithoutFeedback onPress={() => onPop(b.id, b.type)}>
      <Animated.View style={[
        bs.bubble,
        {
          left: b.x - b.size / 2,
          width: b.size, height: b.size, borderRadius: b.size / 2,
          backgroundColor: pal.dark,
          borderColor: pal.color,
          ...(Platform.OS === 'android'
            ? { elevation: 6 }
            : { shadowColor: pal.glow, shadowOpacity: 0.85, shadowRadius: 12 }),
          transform: [{ translateY: b.yAnim }, { scale: b.scAnim }],
        },
      ]}>
        {/* Parlama efekti */}
        <View style={[bs.shine, { backgroundColor: pal.color + '22' }]} />
        <Text style={{ fontSize: b.size * 0.40 }}>{b.icon}</Text>
        <Text style={[bs.bubbleLbl, { color: pal.text }]} numberOfLines={1}>
          {b.shortLabel}
        </Text>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
});

// ─── Skor çubuğu ─────────────────────────────────────────────────────────
function ScoreBar({ type, label, icon, score, maxScore, color, text }) {
  const pct = Math.min(1, score / maxScore);
  return (
    <View style={bs.barRow}>
      <Text style={{ fontSize: 18, width: 28 }}>{icon}</Text>
      <View style={bs.barTrack}>
        <View style={[bs.barFill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[bs.barScore, { color: text }]}>{score}</Text>
    </View>
  );
}

// ─── Patlama animasyonu ───────────────────────────────────────────────────
function PopParticle({ x, y, color }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);
  const scale  = anim.interpolate({ inputRange: [0, 0.4, 1], outputRange: [0.5, 1.8, 0.2] });
  const opacity = anim.interpolate({ inputRange: [0, 0.6, 1], outputRange: [1, 0.9, 0] });
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', left: x - 24, top: y - 24,
      width: 48, height: 48, borderRadius: 24,
      backgroundColor: color + '55', borderWidth: 2, borderColor: color,
      transform: [{ scale }], opacity,
    }} />
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────
export default function BubblePop({ scene, gameState, onChoose, Conditions, sceneText }) {
  const choices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));
  const types   = choices.slice(0, 3).map((c, i) => ({
    i,
    label: c.label,
    shortLabel: c.label.length > 12 ? c.label.slice(0, 10) + '…' : c.label,
    icon: getIcon(c.label),
    pal: PALETTE[i],
    choice: c,
  }));

  const [phase,    setPhase]   = useState('ready');
  const [timeLeft, setTime]    = useState(GAME_SEC);
  const [scores,   setScores]  = useState([0, 0, 0]);
  const [bubbles,  setBubbles] = useState([]);
  const [pops,     setPops]    = useState([]);   // patlama partikülleri
  const [winner,   setWinner]  = useState(null);

  const scoresR  = useRef([0, 0, 0]);
  const bubblesR = useRef([]);
  const phaseR   = useRef('ready');
  const nextId   = useRef(0);
  const spawnI   = useRef(null);
  const timerI   = useRef(null);
  const popId    = useRef(0);

  // Sahne başlığı
  const sceneTitle = (() => {
    const m = sceneText?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
  })();

  const endGame = useCallback((scrs) => {
    if (phaseR.current === 'done') return;
    phaseR.current = 'done';
    clearInterval(spawnI.current);
    clearInterval(timerI.current);

    const maxIdx = scrs.indexOf(Math.max(...scrs));
    setWinner(maxIdx);
    setPhase('done');
  }, []);

  const handlePop = useCallback((id, type) => {
    if (phaseR.current !== 'playing') return;

    // Baloncuğu bul ve kaldır
    const b = bubblesR.current.find(x => x.id === id);
    if (!b) return;

    // Patlama partiküli ekle (pozisyona ihtiyaç yok — relative)
    const pid = popId.current++;
    setPops(prev => [...prev, { id: pid, type }]);
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== pid)), 520);

    // Skoru güncelle
    const newScores = [...scoresR.current];
    newScores[type] += 1;
    scoresR.current = newScores;
    setScores([...newScores]);

    // Baloncuğu kaldır
    bubblesR.current = bubblesR.current.filter(x => x.id !== id);
    b.yAnim.stopAnimation();
    // Scale-out animasyonu (pop hissi)
    Animated.timing(b.scAnim, { toValue: 1.6, duration: 180, useNativeDriver: true }).start(() => {
      b.scAnim.setValue(0);
      setBubbles([...bubblesR.current]);
    });

    // Anında kazanma kontrolü
    if (newScores[type] >= WIN_COUNT) {
      endGame(newScores);
    }
  }, [endGame]);

  const spawnBubble = useCallback(() => {
    if (phaseR.current !== 'playing' || bubblesR.current.length >= MAX_BUBBLES) return;

    const id    = nextId.current++;
    const type  = Math.floor(Math.random() * 3);
    const size  = SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN);
    const x     = size / 2 + Math.random() * (SW - size);
    const dur   = DUR_MIN + Math.random() * (DUR_MAX - DUR_MIN);
    const yAnim = new Animated.Value(SH + size);
    const scAnim = new Animated.Value(1);
    const t     = types[type];

    const bubble = { id, type, x, size, yAnim, scAnim, icon: t.icon, shortLabel: t.shortLabel };
    bubblesR.current = [...bubblesR.current, bubble];

    Animated.timing(yAnim, {
      toValue: -size,
      duration: dur,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        // Ekranı geçip gitti — sessizce kaldır
        bubblesR.current = bubblesR.current.filter(b => b.id !== id);
        setBubbles([...bubblesR.current]);
      }
    });

    // Giriş scale animasyonu
    const entryScale = new Animated.Value(0);
    scAnim.setValue(0);
    Animated.spring(scAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
    bubble.scAnim = scAnim;

    setBubbles([...bubblesR.current]);
  }, [types]);

  const startGame = useCallback(() => {
    phaseR.current  = 'playing';
    scoresR.current = [0, 0, 0];
    bubblesR.current = [];
    nextId.current  = 0;

    setPhase('playing');
    setScores([0, 0, 0]);
    setBubbles([]);
    setTime(GAME_SEC);
    setWinner(null);

    // İlk baloncuklar (staggered başlangıç)
    types.forEach((_, i) => {
      setTimeout(spawnBubble, i * 350);
    });

    spawnI.current = setInterval(spawnBubble, SPAWN_MS);

    let t = GAME_SEC;
    timerI.current = setInterval(() => {
      t--;
      setTime(t);
      if (t <= 0) endGame(scoresR.current);
    }, 1000);
  }, [spawnBubble, endGame, types]);

  useEffect(() => () => {
    clearInterval(spawnI.current);
    clearInterval(timerI.current);
  }, []);

  const confirmChoice = () => {
    if (winner === null) return;
    const chosen = types[winner].choice;
    // Performans bonusu: kazanan sayısı - ikinci en yüksek
    const sorted = [...scoresR.current].sort((a, b) => b - a);
    const margin = sorted[0] - (sorted[1] || 0);
    const bonusStat = margin >= 8 ? 2 : margin >= 4 ? 1 : 0;
    const bonusKey  = ['happiness', 'intelligence', 'social'][winner % 3];
    const bonus = bonusStat > 0 ? { [bonusKey]: bonusStat } : {};
    const enriched = {
      ...chosen,
      effects: [...(chosen.effects || []),
        ...(bonusStat > 0 ? [{ statDelta: bonus }] : [])],
    };
    onChoose(enriched);
  };

  // ════════ HAZIR ════════
  if (phase === 'ready') {
    return (
      <View style={s.center}>
        {sceneTitle && <Text style={s.sceneTitle}>{sceneTitle}</Text>}
        <Text style={s.gameTitle}>Baloncuk Avı</Text>
        <Text style={s.gameSub}>Gitmek istediğin yerin baloncuklarını patlat!</Text>
        <View style={s.typePreview}>
          {types.map((t, i) => (
            <View key={i} style={[s.typeCard, { backgroundColor: t.pal.dark, borderColor: t.pal.color }]}>
              <Text style={{ fontSize: 36 }}>{t.icon}</Text>
              <Text style={[s.typeCardLabel, { color: t.pal.text }]}>{t.label}</Text>
            </View>
          ))}
        </View>
        <View style={s.rulesBox}>
          <Text style={s.ruleItem}>🫧  Yükselen baloncuklara dokun → patlat</Text>
          <Text style={s.ruleItem}>🏆  En çok patlatan kazanır</Text>
          <Text style={s.ruleItem}>⚡  15 baloncuk = anında seçim</Text>
          <Text style={s.ruleItem}>⏱  45 saniye</Text>
        </View>
        <TouchableOpacity style={s.startBtn} onPress={startGame}>
          <Text style={s.startBtnTxt}>🫧  Başla!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ════════ SONUÇ ════════
  if (phase === 'done' && winner !== null) {
    const wt = types[winner];
    return (
      <View style={[s.center, { backgroundColor: wt.pal.dark }]}>
        <Text style={{ fontSize: 70, marginBottom: 10 }}>{wt.icon}</Text>
        <Text style={[s.gameTitle, { color: wt.pal.color }]}>{wt.label}</Text>
        <Text style={s.gameSub}>Seçim yapıldı!</Text>
        <View style={s.scoreSummary}>
          {types.map((t, i) => (
            <View key={i} style={[s.scoreRow, i === winner && { backgroundColor: t.pal.dark, borderColor: t.pal.color, borderWidth: 1.5 }]}>
              <Text style={{ fontSize: 20, width: 28 }}>{t.icon}</Text>
              <Text style={[s.scoreLabel, { color: t.pal.text }]}>{t.label}</Text>
              <Text style={[s.scoreNum, { color: t.pal.color }]}>{scores[i]}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={[s.startBtn, { backgroundColor: wt.pal.color, marginTop: 8 }]}
          onPress={confirmChoice}>
          <Text style={[s.startBtnTxt, { color: '#fff' }]}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ════════ OYUN ════════
  return (
    <View style={s.screen}>
      {/* HUD */}
      <View style={s.hud}>
        {types.map((t, i) => (
          <ScoreBar
            key={i} type={i} label={t.label} icon={t.icon}
            score={scores[i]} maxScore={WIN_COUNT}
            color={t.pal.color} text={t.pal.text}
          />
        ))}
        <Text style={[s.timer, timeLeft <= 10 && { color: '#f85149' }]}>
          ⏱ {timeLeft}s
        </Text>
      </View>

      {/* Oyun alanı */}
      <View style={s.arena}>
        {/* Arka plan dalgalanması */}
        <View style={s.bg} />

        {/* Baloncuklar */}
        {bubbles.map(b => (
          <BubbleView key={b.id} b={b} onPop={handlePop} />
        ))}

        {/* Patlama efektleri */}
        {pops.map(p => (
          <View key={p.id} pointerEvents="none" style={{ position: 'absolute', left: SW / 2 - 24, top: SH / 2 - 24 }}>
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: PALETTE[p.type].color + '66' }} />
          </View>
        ))}

        {/* Alt ipucu */}
        <View style={s.bottomHint}>
          {types.map((t, i) => (
            <View key={i} style={s.hintChip}>
              <View style={[s.hintDot, { backgroundColor: t.pal.color }]} />
              <Text style={[s.hintLbl, { color: t.pal.text }]}>{t.shortLabel}</Text>
              <Text style={[s.hintCount, { color: t.pal.color }]}>{scores[i]}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const bs = StyleSheet.create({
  bubble:    { position: 'absolute', top: 0, borderWidth: 2.5, justifyContent: 'center', alignItems: 'center' },
  shine:     { position: 'absolute', top: 6, left: 10, width: '35%', height: '30%', borderRadius: 20 },
  bubbleLbl: { fontSize: 9, fontWeight: '700', textAlign: 'center', paddingHorizontal: 5, marginTop: 1 },
  barRow:    { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  barTrack:  { flex: 1, height: 7, backgroundColor: '#1a2235', borderRadius: 4, overflow: 'hidden' },
  barFill:   { height: '100%', borderRadius: 4 },
  barScore:  { fontSize: 13, fontWeight: '800', width: 24, textAlign: 'right' },
});

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#050a14' },
  center:  { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 22 },
  sceneTitle:  { color: '#8b949e', fontSize: 12, marginBottom: 5, textAlign: 'center' },
  gameTitle:   { color: '#e6edf3', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  gameSub:     { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18 },
  typePreview: { flexDirection: 'row', gap: 10, marginBottom: 18, width: '100%' },
  typeCard:    { flex: 1, borderRadius: 16, borderWidth: 2, padding: 12, alignItems: 'center', gap: 6 },
  typeCardLabel:{ fontSize: 12, fontWeight: '800', textAlign: 'center' },
  rulesBox:    { backgroundColor: '#0d1117', borderRadius: 12, padding: 12, marginBottom: 18, width: '100%', borderWidth: 1, borderColor: '#21262d' },
  ruleItem:    { color: '#8b949e', fontSize: 12, marginBottom: 4 },
  startBtn:    { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  startBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  scoreSummary:{ width: '100%', gap: 8, marginBottom: 16, marginTop: 8 },
  scoreRow:    { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0d1117', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#21262d' },
  scoreLabel:  { flex: 1, fontSize: 14, fontWeight: '700', marginLeft: 8 },
  scoreNum:    { fontSize: 20, fontWeight: '900', width: 36, textAlign: 'right' },
  hud:         { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#06101e', borderBottomWidth: 1, borderColor: '#0d1f36' },
  timer:       { color: '#e6edf3', fontSize: 16, fontWeight: '800', textAlign: 'center', marginTop: 4 },
  arena:       { flex: 1, position: 'relative', overflow: 'hidden' },
  bg:          { ...StyleSheet.absoluteFillObject, backgroundColor: '#060d1e' },
  bottomHint:  { position: 'absolute', bottom: 12, left: 0, right: 0, flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 16 },
  hintChip:    { flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: '#0d1117cc', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 10 },
  hintDot:     { width: 8, height: 8, borderRadius: 4 },
  hintLbl:     { fontSize: 11, fontWeight: '700' },
  hintCount:   { fontSize: 13, fontWeight: '900' },
});
