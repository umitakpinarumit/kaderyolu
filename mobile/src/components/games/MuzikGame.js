/**
 * MuzikGame — Müzik 🎵
 * 3 şeritli ritim oyunu. Notalar yukarıdan düşer,
 * doğru şerit butonuna zamanında bas!
 * 15 vuruş = zafer · 3 kaçırma = oyun bitti
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 110;
const COURT_H = SH - HUD_H - CTRL_H;

const GOAL     = 15;
const LIVES    = 3;
const HIT_TOP  = COURT_H * 0.75;  // vuruş bölgesi başlangıcı
const HIT_BOT  = COURT_H * 0.92;  // vuruş bölgesi sonu

// Not düşme süresi (ms)
const NOTE_DUR_BASE = 2000;
const NOTE_DUR_MIN  = 1000;

// Şerit renkleri
const LANE_COLORS = ['#f43f5e', '#facc15', '#22d3ee'];
const LANE_ICONS  = ['🎹', '🥁', '🎸'];

const calcBonus = (s) => ({
  happiness: s >= GOAL ? 5 : s >= 10 ? 4 : s >= 6 ? 3 : 2,
  social:    s >= GOAL ? 4 : s >= 10 ? 3 : s >= 6 ? 2 : 1,
  focus:     s >= GOAL ? 3 : s >= 10 ? 2 : 1,
});

function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.4, duration: 40, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 260, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

export default function MuzikGame({ choice, onComplete }) {
  const [phase,        setPhase]        = useState('ready');
  const [lives,        setLives]        = useState(LIVES);
  const [score,        setScore]        = useState(0);
  const [hitTrigger,   setHitTrigger]   = useState(0);
  const [missTrigger,  setMissTrigger]  = useState(0);
  const [result,       setResult]       = useState(null);
  const [litLane,      setLitLane]      = useState(null); // hangi buton basılı

  // Her şerit için Animated.Value
  const noteAnims = useRef([
    new Animated.Value(-50),
    new Animated.Value(-50),
    new Animated.Value(-50),
  ]).current;
  const noteYRefs = useRef([-50, -50, -50]);
  const laneActive = useRef([false, false, false]);

  const phaseRef   = useRef('ready');
  const livesRef   = useRef(LIVES);
  const scoreRef   = useRef(0);
  const spawnTimer = useRef(null);
  const checkTimer = useRef(null);
  const noteAnimRefs = useRef([null, null, null]);

  useEffect(() => {
    const ids = noteAnims.map((anim, i) =>
      anim.addListener(({ value }) => { noteYRefs.current[i] = value; })
    );
    return () => ids.forEach((id, i) => noteAnims[i].removeListener(id));
  }, []);

  const stopAll = useCallback(() => {
    clearInterval(spawnTimer.current);
    clearInterval(checkTimer.current);
    noteAnimRefs.current.forEach(a => a?.stop());
  }, []);

  const noteDur = useCallback(() =>
    Math.max(NOTE_DUR_MIN, NOTE_DUR_BASE - scoreRef.current * 60), []);

  const spawnNote = useCallback((lane) => {
    if (laneActive.current[lane] || phaseRef.current !== 'playing') return;
    laneActive.current[lane] = true;
    noteAnims[lane].setValue(-50);

    noteAnimRefs.current[lane]?.stop();
    noteAnimRefs.current[lane] = Animated.timing(noteAnims[lane], {
      toValue: COURT_H + 50,
      duration: noteDur(),
      easing: Easing.linear,
      useNativeDriver: true,
    });
    noteAnimRefs.current[lane].start();
  }, [noteDur]);

  const handleLane = useCallback((lane) => {
    if (phaseRef.current !== 'playing' || !laneActive.current[lane]) return;
    const y = noteYRefs.current[lane];

    // Vuruş bölgesinde mi?
    if (y >= HIT_TOP && y <= HIT_BOT) {
      // HIT
      laneActive.current[lane] = false;
      noteAnimRefs.current[lane]?.stop();
      noteAnims[lane].setValue(COURT_H + 100);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHitTrigger(t => t + 1);
      setLitLane(lane);
      setTimeout(() => setLitLane(null), 120);

      if (scoreRef.current >= GOAL) {
        stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('win');
      } else {
        setTimeout(() => spawnNote(lane), 200);
      }
    }
    // Yanlış zamanda basılsa: hiç tepki yok (sadece iyi zamanlama ödüllendirilir)
  }, [spawnNote, stopAll]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; scoreRef.current = 0;
    laneActive.current = [false, false, false];
    setPhase('playing'); setLives(LIVES); setScore(0); setResult(null); setLitLane(null);
    noteAnims.forEach(a => a.setValue(-50));

    // Kaçırılan notaları kontrol eden interval
    checkTimer.current = setInterval(() => {
      if (phaseRef.current !== 'playing') return;
      [0, 1, 2].forEach(lane => {
        if (!laneActive.current[lane]) return;
        const y = noteYRefs.current[lane];
        if (y > HIT_BOT + 40) {
          // Kaçırıldı
          laneActive.current[lane] = false;
          noteAnims[lane].setValue(COURT_H + 100);
          noteAnimRefs.current[lane]?.stop();
          livesRef.current -= 1;
          setLives(livesRef.current);
          setMissTrigger(t => t + 1);
          if (livesRef.current <= 0) {
            stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('lose');
          } else {
            setTimeout(() => spawnNote(lane), 300);
          }
        }
      });
    }, 16);

    // Spawn döngüsü
    const doSpawn = () => {
      if (phaseRef.current !== 'playing') return;
      const available = [0, 1, 2].filter(i => !laneActive.current[i]);
      if (available.length > 0) {
        const lane = available[Math.floor(Math.random() * available.length)];
        spawnNote(lane);
      }
    };
    setTimeout(doSpawn, 500);
    spawnTimer.current = setInterval(doSpawn, 900);
  }, [spawnNote, stopAll]);

  useEffect(() => () => stopAll(), []);

  const LANE_W = SW / 3;

  if (phase === 'ready') return (
    <View style={m.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🎵</Text>
      <Text style={m.bigTitle}>Müzik Ritmi</Text>
      <Text style={m.sub}>Nota şeridine tam zamanında bas!</Text>
      <View style={m.rulesBox}>
        {[
          { icon: '🎵', text: 'Renkli notalar yukarıdan düşer' },
          { icon: '👆', text: 'Nota PARLAK BÖLGEYE girince o şeridin butonuna bas' },
          { icon: '🎯', text: 'Doğru zamanlama = vuruş · Erken/geç = hiç tepki yok' },
          { icon: '🏆', text: `${GOAL} vuruş → Zafer!` },
        ].map((r, i) => (
          <View key={i} style={m.ruleRow}>
            <Text style={m.ruleIcon}>{r.icon}</Text>
            <Text style={m.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={m.startBtn} onPress={launch}>
        <Text style={m.startBtnTxt}>🎵  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(scoreRef.current);
    return (
      <View style={m.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={m.bigTitle}>{won ? 'Müzik Ustası!' : 'Oyun Bitti'}</Text>
        <Text style={m.sub}>{won ? `${GOAL} vuruş! Ritim mükemmel!` : `${scoreRef.current} vuruş yaptın.`}</Text>
        <View style={m.statsRow}>
          <View style={m.statChip}><Text style={m.statV}>{scoreRef.current}</Text><Text style={m.statL}>🎵 Vuruş</Text></View>
          <View style={m.statChip}><Text style={m.statV}>{livesRef.current}/{LIVES}</Text><Text style={m.statL}>❤️ Can</Text></View>
        </View>
        <View style={m.bonusBox}>
          <Text style={m.bonusTitle}>🎵 Kazanılan Bonuslar</Text>
          {b.happiness > 0 && <Text style={m.bonusLine}>😊 Mutluluk +{b.happiness}</Text>}
          {b.social    > 0 && <Text style={m.bonusLine}>👫 Sosyallik +{b.social}</Text>}
          {b.focus     > 0 && <Text style={m.bonusLine}>🎯 Odak +{b.focus}</Text>}
        </View>
        <TouchableOpacity style={m.startBtn} onPress={() => onComplete(b)}>
          <Text style={m.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={m.screen}>
      <View style={m.hud}>
        <View style={m.hudRow}>
          <View><Text style={m.hudLabel}>VURUŞ</Text><Text style={m.hudBig}>{score}/{GOAL}</Text></View>
          <View style={m.hudCenter}><Text style={m.hudTitle}>🎵 Müzik</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={m.hudLabel}>CAN</Text>
            <Text style={[m.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={m.progressBar}><View style={[m.progressFill, { width: `${(score / GOAL) * 100}%` }]} /></View>
      </View>

      {/* Saha */}
      <View style={m.court}>
        {/* Şerit arkaplanları */}
        {[0, 1, 2].map(i => (
          <View key={i} style={[m.laneTrack, { left: i * LANE_W, width: LANE_W, borderColor: LANE_COLORS[i] + '22' }]} />
        ))}

        {/* Vuruş bölgesi */}
        <View style={[m.hitZone, { top: HIT_TOP, height: HIT_BOT - HIT_TOP }]} />

        {/* Notalar */}
        {[0, 1, 2].map(lane => (
          <Animated.View key={lane} style={[m.note, {
            left: lane * LANE_W + LANE_W / 2 - 22,
            backgroundColor: LANE_COLORS[lane],
            transform: [{ translateY: noteAnims[lane] }],
          }]}>
            <Text style={m.noteText}>🎵</Text>
          </Animated.View>
        ))}

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>

      {/* 3 şerit butonu */}
      <View style={m.btnRow}>
        {[0, 1, 2].map(lane => (
          <TouchableOpacity
            key={lane}
            style={[m.laneBtn, { backgroundColor: LANE_COLORS[lane] + '33', borderColor: LANE_COLORS[lane] },
              litLane === lane && { backgroundColor: LANE_COLORS[lane] + 'aa' },
            ]}
            onPress={() => handleLane(lane)}
            activeOpacity={0.7}
          >
            <Text style={m.laneBtnIcon}>{LANE_ICONS[lane]}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const m = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#08030f' },
  center:       { flex: 1, backgroundColor: '#08030f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0f0520', borderBottomWidth: 1, borderBottomColor: '#2a1050' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#5a3090', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: '#c084fc', fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#2a1050', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#c084fc', borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#0a0318', position: 'relative', overflow: 'hidden' },
  laneTrack:    { position: 'absolute', top: 0, bottom: 0, borderRightWidth: 1 },
  hitZone:      { position: 'absolute', left: 0, right: 0, backgroundColor: '#ffffff0a', borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#ffffff22' },
  note:         { position: 'absolute', top: 0, width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', elevation: 6, shadowOpacity: 0.8, shadowRadius: 8 },
  noteText:     { fontSize: 22 },
  btnRow:       { height: CTRL_H, flexDirection: 'row', backgroundColor: '#0f0520', borderTopWidth: 1, borderTopColor: '#2a1050' },
  laneBtn:      { flex: 1, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  laneBtnIcon:  { fontSize: 32 },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#0f0520', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#2a1050' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#7c3aed', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: '#c084fc', shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#0f0520', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#2a1050' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#5a3090', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0f0520', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a1050' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: '#c084fc', fontSize: 13, marginBottom: 2 },
});
