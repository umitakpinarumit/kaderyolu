/**
 * ShantiyeGame — Şantiye Gezisi & Atölye Denemesi 🏗️
 * Klasik "Stack" mekaniği: sallanan bloğu tam zamanında bırak,
 * üst üste istif yap. Taşan kısım kesilir, blok küçülür.
 * Hedef: 10 kat → Zafer!
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');

const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 68;
const COURT_H = SH - HUD_H - CTRL_H;

const TARGET      = 10;
const LIVES       = 3;
const BASE_W      = Math.round(SW * 0.52);
const INIT_W      = Math.round(SW * 0.46);
const MIN_OVERLAP = 14;
const FLOOR_H     = 16;
const BLOCK_H     = Math.floor((COURT_H - FLOOR_H - 80) / (TARGET + 2));
const FLOOR_Y     = COURT_H - FLOOR_H;

const SWING_BASE = 1300;
const SWING_MIN  = 350;

const BLOCK_COLORS = [
  '#f97316','#eab308','#4ade80','#38bdf8',
  '#a78bfa','#f472b6','#fb923c','#34d399',
];
const RCOLOR = '#f97316';

const calcBonus = (score) => ({
  intelligence: score >= TARGET ? 4 : score >= 7 ? 3 : score >= 4 ? 2 : 1,
  discipline:   score >= TARGET ? 5 : score >= 7 ? 4 : score >= 4 ? 3 : score >= 2 ? 2 : 1,
  confidence:   score >= TARGET ? 3 : score >= 6 ? 2 : 1,
});

// ─── Flash ────────────────────────────────────────────────────────────────────
function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.45, duration: 40,  useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,    duration: 300, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return (
    <Animated.View pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────
export default function ShantiyeGame({ choice, onComplete }) {
  const [phase,        setPhase]        = useState('ready');
  const [lives,        setLives]        = useState(LIVES);
  const [score,        setScore]        = useState(0);
  const [stack,        setStack]        = useState([]);
  const [currentWidth, setCurrentWidth] = useState(INIT_W);
  const [hitTrigger,   setHitTrigger]   = useState(0);
  const [missTrigger,  setMissTrigger]  = useState(0);
  const [result,       setResult]       = useState(null);

  // Animated değerler
  const blockLeft = useRef(new Animated.Value(SW / 2 - INIT_W / 2)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  // Mutable ref'ler
  const phaseRef    = useRef('ready');
  const livesRef    = useRef(LIVES);
  const scoreRef    = useRef(0);
  const stackRef    = useRef([]);
  const blxRef      = useRef(SW / 2 - INIT_W / 2); // blok sol kenar X
  const curWRef     = useRef(INIT_W);
  const swingDurRef = useRef(SWING_BASE);
  const swingRef    = useRef(null);
  const hitLock     = useRef(false);

  // blockLeft değişimini izle
  useEffect(() => {
    const id = blockLeft.addListener(({ value }) => { blxRef.current = value; });
    return () => blockLeft.removeListener(id);
  }, []);

  // ── Salınım animasyonunu başlat ───────────────────────────────────────────
  const startSwing = useCallback((fromX, width, duration) => {
    swingRef.current?.stop();
    const rightBound = SW - width;
    const startX = Math.max(0, Math.min(rightBound, fromX));
    blockLeft.setValue(startX);

    swingRef.current = Animated.loop(
      Animated.sequence([
        Animated.timing(blockLeft, {
          toValue: rightBound, duration,
          easing: Easing.inOut(Easing.sin), useNativeDriver: false,
        }),
        Animated.timing(blockLeft, {
          toValue: 0, duration,
          easing: Easing.inOut(Easing.sin), useNativeDriver: false,
        }),
      ])
    );
    swingRef.current.start();
  }, []);

  const stopAll = useCallback(() => { swingRef.current?.stop(); }, []);

  // ── Dokunma / vuruş ───────────────────────────────────────────────────────
  const doHit = useCallback(() => {
    if (phaseRef.current !== 'playing' || hitLock.current) return;
    hitLock.current = true;
    swingRef.current?.stop();

    const bL = blxRef.current;
    const bR = bL + curWRef.current;

    // Önceki blok sınırları
    const prev   = stackRef.current[stackRef.current.length - 1];
    const prevL  = prev ? prev.x : SW / 2 - BASE_W / 2;
    const prevR  = prev ? prev.x + prev.w : SW / 2 + BASE_W / 2;

    const ovL = Math.max(bL, prevL);
    const ovR = Math.min(bR, prevR);
    const ovW = ovR - ovL;

    if (ovW < MIN_OVERLAP) {
      // ── KAÇIRMA ───────────────────────────────────────────────────────────
      livesRef.current -= 1;
      setLives(livesRef.current);
      setMissTrigger(t => t + 1);

      // Ekran sarsma
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  9, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -9, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  5, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
      ]).start();

      if (livesRef.current <= 0) {
        phaseRef.current = 'done';
        setPhase('done');
        setResult('lose');
        return;
      }

      // Blok genişliğini sıfırla, skoru koru
      curWRef.current = INIT_W;
      setCurrentWidth(INIT_W);
      setTimeout(() => {
        if (phaseRef.current === 'playing') {
          hitLock.current = false;
          startSwing(SW / 2 - INIT_W / 2, INIT_W, swingDurRef.current);
        }
      }, 650);
      return;
    }

    // ── BAŞARILI YERLEŞIM ─────────────────────────────────────────────────
    const newLayer = { x: ovL, w: ovW, colorIdx: scoreRef.current % BLOCK_COLORS.length };
    stackRef.current = [...stackRef.current, newLayer];
    scoreRef.current += 1;
    curWRef.current = ovW;

    setStack([...stackRef.current]);
    setScore(scoreRef.current);
    setCurrentWidth(ovW);
    setHitTrigger(t => t + 1);

    if (scoreRef.current >= TARGET) {
      stopAll();
      phaseRef.current = 'done';
      setPhase('done');
      setResult('win');
      return;
    }

    // Hızlandır
    swingDurRef.current = Math.max(SWING_MIN, swingDurRef.current * 0.90);
    hitLock.current = false;
    // Yeni bloğu yerleşen bloğun sol kenarından başlat
    startSwing(ovL, ovW, swingDurRef.current);
  }, [startSwing, stopAll]);

  // ── Oyunu başlat ──────────────────────────────────────────────────────────
  const launch = useCallback(() => {
    phaseRef.current    = 'playing';
    livesRef.current    = LIVES;
    scoreRef.current    = 0;
    curWRef.current     = INIT_W;
    swingDurRef.current = SWING_BASE;
    stackRef.current    = [];
    hitLock.current     = false;
    setPhase('playing');
    setLives(LIVES);
    setScore(0);
    setStack([]);
    setCurrentWidth(INIT_W);
    setResult(null);
    blockLeft.setValue(SW / 2 - INIT_W / 2);
    startSwing(SW / 2 - INIT_W / 2, INIT_W, SWING_BASE);
  }, [startSwing]);

  useEffect(() => () => stopAll(), []);

  const isAtolye = choice?.label?.includes('Atölye') || choice?.label?.includes('atölye');

  // ─── HAZIR ────────────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{isAtolye ? '🪚' : '🏗️'}</Text>
        <Text style={s.bigTitle}>{isAtolye ? 'Atölye İstifleme' : 'Şantiye İstifleme'}</Text>
        <Text style={s.sub}>Bloğu tam zamanında bırak, yüksek istif yap!</Text>

        <View style={s.rulesBox}>
          {[
            { icon: '👆', text: 'Hareketli bloğu durdurmak için ekrana dokun' },
            { icon: '🎯', text: 'Altındaki blokla örtüşen kısım kalır — geri kalan düşer' },
            { icon: '⚡', text: 'Her başarılı katta hız artar' },
            { icon: '🏆', text: `${TARGET} kat istifle → Zafer!` },
          ].map((r, i) => (
            <View key={i} style={s.ruleRow}>
              <Text style={s.ruleIcon}>{r.icon}</Text>
              <Text style={s.ruleText}>{r.text}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={s.startBtn} onPress={launch}>
          <Text style={s.startBtnTxt}>🚀  Başla!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── SONUÇ ────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const won   = result === 'win';
    const bonus = calcBonus(scoreRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Mükemmel!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>
          {won ? `${TARGET} kat! Harika koordinasyon!` : `${scoreRef.current} kat istifledin.`}
        </Text>

        <View style={s.statsRow}>
          <View style={s.statChip}>
            <Text style={s.statV}>{scoreRef.current}</Text>
            <Text style={s.statL}>🧱 Kat</Text>
          </View>
          <View style={s.statChip}>
            <Text style={s.statV}>{livesRef.current}/{LIVES}</Text>
            <Text style={s.statL}>❤️ Can</Text>
          </View>
        </View>

        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>{isAtolye ? '🪚' : '🏗️'} Kazanılan Bonuslar</Text>
          {bonus.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zeka +{bonus.intelligence}</Text>}
          {bonus.discipline   > 0 && <Text style={s.bonusLine}>📐 Disiplin +{bonus.discipline}</Text>}
          {bonus.confidence   > 0 && <Text style={s.bonusLine}>💪 Güven +{bonus.confidence}</Text>}
        </View>

        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(bonus)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── OYUN ─────────────────────────────────────────────────────────────────
  // Sallanan bloğun Y pozisyonu: her yeni kat eklenince yukarı kayar
  const swingTop = FLOOR_Y - (stack.length + 1) * BLOCK_H;

  return (
    <Animated.View style={[s.screen, { transform: [{ translateX: shakeAnim }] }]}>
      {/* HUD */}
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View>
            <Text style={s.hudLabel}>KAT</Text>
            <Text style={s.hudBig}>{score} / {TARGET}</Text>
          </View>
          <View style={s.hudCenter}>
            <Text style={s.hudTitle}>{isAtolye ? '🪚 Atölye' : '🏗️ Şantiye'}</Text>
            <Text style={s.hudSpeed}>⚡ {Math.round(SWING_BASE / Math.max(swingDurRef.current, 1))}x Hız</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>
              {'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}
            </Text>
          </View>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(score / TARGET) * 100}%` }]} />
        </View>
      </View>

      {/* Saha — tek dokunuşla vuruş */}
      <TouchableOpacity style={s.court} onPress={doHit} activeOpacity={1}>
        {/* Arka plan süsü */}
        <Text style={[s.deco, { right: 10, top: 24 }]}>{isAtolye ? '🔧' : '🏗️'}</Text>
        <Text style={[s.deco, { left: 10,  top: COURT_H * 0.35 }]}>{isAtolye ? '🪵' : '⛏️'}</Text>
        {score < 3 && <Text style={[s.deco, { left: '35%', top: 16 }]}>☁️</Text>}

        {/* Zemin */}
        <View style={s.floor} />

        {/* Taban platform */}
        <View style={[s.base, { left: SW / 2 - BASE_W / 2, width: BASE_W }]} />

        {/* Yerleşmiş bloklar */}
        {stack.map((layer, i) => (
          <View key={i} style={[s.block, {
            left:  layer.x,
            top:   FLOOR_Y - (i + 1) * BLOCK_H,
            width: layer.w,
            height: BLOCK_H - 4,
            backgroundColor: BLOCK_COLORS[layer.colorIdx],
          }]} />
        ))}

        {/* Sallanan blok */}
        <Animated.View style={[s.swingBlock, {
          top:   swingTop,
          left:  blockLeft,
          width: currentWidth,
          height: BLOCK_H - 4,
          backgroundColor: BLOCK_COLORS[score % BLOCK_COLORS.length],
        }]} />

        {/* İpucu oku */}
        {score === 0 && (
          <Text style={[s.tapHint, { top: swingTop - 32 }]}>👆 DOKUN</Text>
        )}

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </TouchableOpacity>

      {/* Kontrol ipucu */}
      <View style={s.ctrl}>
        <Text style={s.ctrlHint}>👆 Ekrana dokun → Bloğu bırak</Text>
      </View>
    </Animated.View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#0c1400' },
  center:       { flex: 1, backgroundColor: '#0c1400', alignItems: 'center', justifyContent: 'center', padding: 24 },

  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#111900', borderBottomWidth: 1, borderBottomColor: '#2a3c00' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#5a7a00', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 13, fontWeight: '900' },
  hudSpeed:     { color: '#fbbf24', fontSize: 10, marginTop: 1 },
  progressBar:  { height: 5, backgroundColor: '#2a3c00', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },

  court:        { flex: 1, backgroundColor: '#0f1a00', position: 'relative', overflow: 'hidden' },
  floor:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: FLOOR_H, backgroundColor: '#5c3d11', borderTopWidth: 2, borderTopColor: '#8b6020' },
  base:         { position: 'absolute', bottom: FLOOR_H, height: 10, backgroundColor: '#475569', borderRadius: 3, borderTopWidth: 2, borderTopColor: '#94a3b8' },
  deco:         { position: 'absolute', fontSize: 28, opacity: 0.2 },

  block:        { position: 'absolute', borderRadius: 4, borderTopWidth: 3, borderTopColor: '#ffffff44' },
  swingBlock:   { position: 'absolute', borderRadius: 4, borderTopWidth: 3, borderTopColor: '#ffffff88', elevation: 8, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6 },

  tapHint:      { position: 'absolute', alignSelf: 'center', left: 0, right: 0, textAlign: 'center', color: '#fbbf24', fontSize: 13, fontWeight: '800', opacity: 0.8 },

  ctrl:         { height: CTRL_H, backgroundColor: '#111900', borderTopWidth: 1, borderTopColor: '#2a3c00', justifyContent: 'center', alignItems: 'center' },
  ctrlHint:     { color: '#e6edf3', fontSize: 14, fontWeight: '700' },

  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#111900', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#2a3c00' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#b45309', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },

  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#111900', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#2a3c00' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#5a7a00', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#111900', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a3c00' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
