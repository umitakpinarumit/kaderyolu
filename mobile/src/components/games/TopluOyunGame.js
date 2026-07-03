/**
 * TopluOyunGame — Renk Sırası (Simon Says+)
 * 4 renkli dev bölge. Bilgisayar aydınlatır, sen aynı sırayla bas.
 * Ses yerine görsel titreşim + ışık patlaması.
 * Her tur sıra uzar. 10 tur = zafer!
 * Bonus: focus / social / happiness
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Platform, StyleSheet, Text,
  TouchableOpacity, Vibration, View,
} from 'react-native';

const ZONES = [
  { id: 0, color: '#ef4444', dark: '#2d0000', label: '🔴', name: 'Kırmızı', emoji: '🔴' },
  { id: 1, color: '#3b82f6', dark: '#001a3d', label: '🔵', name: 'Mavi',    emoji: '🔵' },
  { id: 2, color: '#22c55e', dark: '#003318', label: '🟢', name: 'Yeşil',   emoji: '🟢' },
  { id: 3, color: '#fbbf24', dark: '#2e1500', label: '🟡', name: 'Sarı',    emoji: '🟡' },
];

const MAX_ROUNDS  = 15;
const START_LEN   = 2;
const BASE_SHOW   = 600;  // başlangıç gösterim süresi (ms)
const GAP_MS      = 200;

const calcBonus = (rounds) => ({
  focus:     rounds >= 13 ? 8 : rounds >= 10 ? 6 : rounds >= 7 ? 4 : rounds >= 4 ? 3 : rounds >= 2 ? 2 : 1,
  social:    rounds >= 12 ? 6 : rounds >= 9  ? 4 : rounds >= 6 ? 3 : rounds >= 3 ? 2 : 1,
  happiness: rounds >= 11 ? 4 : rounds >= 8  ? 3 : rounds >= 5 ? 2 : rounds >= 2 ? 1 : 0,
});

// Tura göre gösterim süresi: ilerledikçe hızlanır
const showMsForRound = (r) => Math.max(280, BASE_SHOW - (r - 1) * 22);

// ─── Büyük Renkli Bölge ──────────────────────────────────────────────────────
function ZoneButton({ zone, isLit, onPress, disabled, justPressed }) {
  const glow   = useRef(new Animated.Value(0)).current;
  const scale  = useRef(new Animated.Value(1)).current;
  const ripple = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isLit) {
      const showMs = 500; // animation pacing (visual only, sequence timing controlled externally)
      Vibration.vibrate(55);
      Animated.parallel([
        Animated.sequence([
          Animated.timing(glow,  { toValue: 1, duration: 70,  useNativeDriver: true }),
          Animated.timing(glow,  { toValue: 0, duration: showMs - 70, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.spring(scale, { toValue: 1.07, friction: 5, useNativeDriver: true }),
          Animated.spring(scale, { toValue: 1.0,  friction: 5, useNativeDriver: true }),
        ]),
        Animated.sequence([
          Animated.timing(ripple, { toValue: 1, duration: showMs, useNativeDriver: true }),
          Animated.timing(ripple, { toValue: 0, duration: 0, useNativeDriver: true }),
        ]),
      ]).start();
    }
  }, [isLit]);

  useEffect(() => {
    if (justPressed) {
      Animated.sequence([
        Animated.spring(scale, { toValue: 0.93, friction: 5, useNativeDriver: true }),
        Animated.spring(scale, { toValue: 1.0,  friction: 4, useNativeDriver: true }),
      ]).start();
    }
  }, [justPressed]);

  const rippleOpac = ripple.interpolate({ inputRange: [0, 0.3, 1], outputRange: [0, 0.5, 0] });
  const rippleScale= ripple.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] });

  return (
    <TouchableOpacity
      style={{ flex: 1 }}
      onPress={() => !disabled && onPress(zone.id)}
      activeOpacity={0.85}
    >
      <Animated.View style={[ts.zone, {
        backgroundColor: zone.dark,
        transform: [{ scale }],
        shadowColor: zone.color,
        shadowOpacity: isLit ? 0.95 : 0.15,
        shadowRadius: isLit ? 24 : 6,
        elevation: isLit ? 12 : 3,
      }]}>
        {/* Glow overlay */}
        <Animated.View style={[StyleSheet.absoluteFill, {
          borderRadius: 22,
          backgroundColor: zone.color,
          opacity: glow.interpolate({ inputRange: [0, 1], outputRange: [0, 0.55] }),
        }]} />
        {/* Ripple */}
        <Animated.View style={[StyleSheet.absoluteFill, {
          borderRadius: 22,
          borderWidth: 4, borderColor: zone.color,
          opacity: rippleOpac,
          transform: [{ scale: rippleScale }],
        }]} />
        {/* Content */}
        <Text style={[ts.zoneEmoji, isLit && { opacity: 1 }]}>{zone.emoji}</Text>
        <Text style={[ts.zoneName, { color: zone.color }]}>{zone.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────
export default function TopluOyunGame({ choice, onComplete }) {
  const [phase,        setPhase]      = useState('ready');
  const [round,        setRound]      = useState(1);
  const [litId,        setLitId]      = useState(null);
  const [progress,     setProgress]   = useState([]); // player input so far
  const [pressedId,    setPressedId]  = useState(null);
  const [best,         setBest]       = useState(0);
  const [resultFlash,  setResultFlash]= useState(null); // 'correct'|'wrong'
  const [statusText,   setStatusText] = useState('Hazır mısın?');
  const sequenceRef = useRef([]);

  const genSeq = (len) => {
    const s = [];
    for (let i = 0; i < len; i++) {
      let z;
      // Son 2 elemanla aynı olmasın (daha zorlu örüntü)
      do { z = Math.floor(Math.random() * 4); }
      while (s.length > 0 && (z === s[s.length - 1] || (s.length > 1 && z === s[s.length - 2])));
      s.push(z);
    }
    return s;
  };

  const playSequence = useCallback((seq, showMs) => {
    setPhase('showing');
    setProgress([]);
    setStatusText('İzle ve ezberle!');
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setLitId(null);
        setTimeout(() => { setPhase('input'); setStatusText('Şimdi sırasını bas!'); }, GAP_MS * 2);
        return;
      }
      setLitId(seq[i]);
      i++;
      setTimeout(() => { setLitId(null); setTimeout(step, GAP_MS); }, showMs);
    };
    setTimeout(step, 500);
  }, []);

  const startRound = useCallback((r) => {
    setRound(r);
    const seqLen = Math.min(9, START_LEN + r - 1); // max 9 adım
    const seq = genSeq(seqLen);
    sequenceRef.current = seq;
    setResultFlash(null);
    playSequence(seq, showMsForRound(r));
  }, [playSequence]);

  const handleZone = (zoneId) => {
    if (phase !== 'input') return;
    const seq = sequenceRef.current;
    const newProg = [...progress, zoneId];
    setPressedId(zoneId);
    setTimeout(() => setPressedId(null), 180);
    setProgress(newProg);

    if (seq[newProg.length - 1] !== zoneId) {
      // YANLIŞ
      Vibration.vibrate([50, 80, 50]);
      setResultFlash('wrong');
      setStatusText('Yanlış! 💥');
      setPhase('result');
      setBest(b => Math.max(b, round - 1));
      return;
    }

    if (newProg.length === seq.length) {
      // DOĞRU
      setResultFlash('correct');
      setStatusText(round >= MAX_ROUNDS ? '🏆 Tebrikler!' : '✓ Harika!');
      setPhase('result');
      if (round >= MAX_ROUNDS) {
        setBest(MAX_ROUNDS);
      }
    }
  };

  useEffect(() => {
    if (phase === 'result') {
      const isWin = round >= MAX_ROUNDS && resultFlash === 'correct';
      const timeout = setTimeout(() => {
        if (isWin || resultFlash === 'wrong') return; // stay on result
        startRound(round + 1);
      }, 900);
      return () => clearTimeout(timeout);
    }
  }, [phase, resultFlash]);

  const isGameOver = phase === 'result' && (resultFlash === 'wrong' || round >= MAX_ROUNDS);
  const bonus      = calcBonus(resultFlash === 'wrong' ? best : round >= MAX_ROUNDS ? MAX_ROUNDS : best);

  // ── HAZIR ────────────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={ts.center}>
        <Text style={{ fontSize: 64, marginBottom: 12 }}>🎮</Text>
        <Text style={ts.mainTitle}>Renk Sırası</Text>
        <Text style={ts.sub}>Bilgisayar renkleri yakar.{'\n'}Aynı sırayla dokun!</Text>
        <View style={ts.rulesBox}>
          {['🔴 Renkler sırayla yanar', '👆 Aynı sırayla bas', '📈 Her turda hızlanır', `🏆 ${MAX_ROUNDS} turu geç, kazan!`].map((r, i) => (
            <Text key={i} style={ts.ruleItem}>{r}</Text>
          ))}
        </View>
        <TouchableOpacity style={ts.startBtn} onPress={() => startRound(1)}>
          <Text style={ts.startBtnTxt}>🚀 Başla!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── BİTİŞ ────────────────────────────────────────────────────────────────
  if (isGameOver) {
    const won = round >= MAX_ROUNDS;
    return (
      <View style={ts.center}>
        <Text style={{ fontSize: 70, marginBottom: 10 }}>{won ? '🏆' : '💥'}</Text>
        <Text style={ts.mainTitle}>{won ? 'MUHTEŞEM!' : 'Oyun Bitti!'}</Text>
        <Text style={ts.sub}>{won ? `Tüm ${MAX_ROUNDS} turu tamamladın!` : `En iyi: ${best} tur`}</Text>
        <View style={ts.statsRow}>
          {ZONES.map((z, i) => (
            <View key={i} style={[ts.statChip, { borderColor: z.color }]}>
              <Text>{z.emoji}</Text>
            </View>
          ))}
        </View>
        <View style={ts.bonusBox}>
          <Text style={ts.bonusTitle}>🎮 Kazanılan Bonuslar</Text>
          {bonus.focus > 0     && <Text style={ts.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          {bonus.social > 0    && <Text style={ts.bonusLine}>🤝 Sosyal +{bonus.social}</Text>}
          {bonus.happiness > 0 && <Text style={ts.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
        </View>
        <TouchableOpacity style={ts.startBtn} onPress={() => onComplete(bonus)}>
          <Text style={ts.startBtnTxt}>✓ Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const seqLen  = Math.min(9, START_LEN + round - 1);
  const speedLabel = round <= 5 ? '🐢 Yavaş' : round <= 10 ? '🚶 Orta' : '⚡ Hızlı';

  return (
    <View style={ts.screen}>
      {/* HUD */}
      <View style={ts.hud}>
        <View style={ts.hudTopRow}>
          <Text style={ts.hudTur}>TUR {round}/{MAX_ROUNDS}</Text>
          <Text style={ts.hudStatus}>{statusText}</Text>
          <Text style={ts.hudLen}>{seqLen} adım · {speedLabel}</Text>
        </View>
        {/* İlerleme göstergesi */}
        <View style={ts.seqRow}>
          {Array.from({ length: seqLen }, (_, i) => {
            const done     = i < progress.length;
            const isNext   = phase === 'input' && i === progress.length;
            const zColor   = done ? (ZONES[sequenceRef.current[i]]?.color ?? '#fff') : '#1c2a3a';
            return (
              <View key={i} style={[ts.seqDot, {
                backgroundColor: zColor,
                width: isNext ? 18 : 12,
                height: isNext ? 18 : 12,
                borderRadius: isNext ? 9 : 6,
                borderWidth: isNext ? 2 : 0,
                borderColor: '#fff',
              }]} />
            );
          })}
        </View>
      </View>

      {/* 2×2 dev bölge ızgarası */}
      <View style={ts.grid}>
        {[0, 1].map(row => (
          <View key={row} style={ts.gridRow}>
            {[0, 1].map(col => {
              const z = ZONES[row * 2 + col];
              return (
                <ZoneButton
                  key={z.id}
                  zone={z}
                  isLit={litId === z.id}
                  justPressed={pressedId === z.id}
                  onPress={handleZone}
                  disabled={phase !== 'input'}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* Sonuç flash */}
      {phase === 'result' && resultFlash && (
        <View style={[ts.flashOverlay, { backgroundColor: resultFlash === 'correct' ? '#22c55e18' : '#ef444418' }]}>
          <Text style={{ fontSize: 72 }}>{resultFlash === 'correct' ? '✓' : '✗'}</Text>
        </View>
      )}
    </View>
  );
}

const ts = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#06050f' },
  center:    { flex: 1, backgroundColor: '#06050f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:       { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#0e0c1e', borderBottomWidth: 1, borderColor: '#2a1c44' },
  hudTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  hudTur:    { color: '#e6edf3', fontSize: 15, fontWeight: '900' },
  hudStatus: { color: '#fbbf24', fontSize: 13, fontWeight: '800', textAlign: 'center' },
  hudLen:    { color: '#8b949e', fontSize: 13, textAlign: 'right' },
  seqRow:    { flexDirection: 'row', flexWrap: 'wrap', gap: 5, minHeight: 20, alignItems: 'center' },
  seqDot:    { borderRadius: 6 },
  grid:      { flex: 1, padding: 12, gap: 12 },
  gridRow:   { flex: 1, flexDirection: 'row', gap: 12 },
  zone:      { flex: 1, borderRadius: 22, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  zoneEmoji: { fontSize: 44, opacity: 0.8, marginBottom: 6 },
  zoneName:  { fontSize: 16, fontWeight: '900' },
  flashOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 20 },
  mainTitle: { color: '#e6edf3', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:       { color: '#8b949e', fontSize: 14, textAlign: 'center', lineHeight: 21, marginBottom: 16 },
  rulesBox:  { backgroundColor: '#0e0c1e', borderRadius: 14, padding: 14, marginBottom: 20, width: '100%', gap: 6, borderWidth: 1, borderColor: '#2a1c44' },
  ruleItem:  { color: '#c9d4df', fontSize: 13 },
  statsRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statChip:  { width: 44, height: 44, borderRadius: 22, borderWidth: 2, backgroundColor: '#0e0c1e', alignItems: 'center', justifyContent: 'center' },
  bonusBox:  { backgroundColor: '#0e0c1e', borderRadius: 14, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a1c44' },
  bonusTitle:{ color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine: { color: '#a78bfa', fontSize: 13, marginBottom: 2 },
  startBtn:  { backgroundColor: '#7c3aed', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 16, shadowColor: '#7c3aed', shadowOpacity: 0.5, shadowRadius: 10 },
  startBtnTxt:{ color: '#fff', fontSize: 17, fontWeight: '900' },
});
