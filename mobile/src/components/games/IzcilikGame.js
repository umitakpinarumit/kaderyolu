/**
 * IzcilikGame — İzcilik 🧭
 * Simon Says - pusula yönleri.
 * Gösterilen ok dizisini ezberle ve tekrarla!
 * 6 tur = zafer, 3 yanlış = oyun bitti.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H  = SAFE_TOP + 56;
const GOAL   = 6;   // tur sayısı
const LIVES  = 3;
const RCOLOR = '#34d399';

const DIRS = [
  { key: 'U', label: '⬆️', name: 'Kuzey' },
  { key: 'D', label: '⬇️', name: 'Güney' },
  { key: 'L', label: '⬅️', name: 'Batı'  },
  { key: 'R', label: '➡️', name: 'Doğu'  },
];

const calcBonus = (score) => ({
  intelligence: score >= GOAL ? 4 : score >= 4 ? 3 : score >= 2 ? 2 : 1,
  endurance:    score >= GOAL ? 4 : score >= 4 ? 3 : score >= 2 ? 2 : 1,
  confidence:   score >= GOAL ? 3 : score >= 4 ? 2 : 1,
});

function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.45, duration: 40,  useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,    duration: 280, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

export default function IzcilikGame({ choice, onComplete }) {
  const [phase,        setPhase]        = useState('ready');
  const [lives,        setLives]        = useState(LIVES);
  const [round,        setRound]        = useState(0);
  const [sequence,     setSequence]     = useState([]);
  const [showIdx,      setShowIdx]      = useState(-1);   // hangi yön gösteriliyor (-1 = gizle)
  const [inputPhase,   setInputPhase]   = useState(false);
  const [inputIdx,     setInputIdx]     = useState(0);
  const [hitTrigger,   setHitTrigger]   = useState(0);
  const [missTrigger,  setMissTrigger]  = useState(0);
  const [result,       setResult]       = useState(null);
  const [activeDir,    setActiveDir]    = useState(null);  // şu an parlayan yön

  const phaseRef  = useRef('ready');
  const livesRef  = useRef(LIVES);
  const roundRef  = useRef(0);
  const seqRef    = useRef([]);
  const inputRef  = useRef(0);
  const lockRef   = useRef(false);

  // Gösterim animasyonu: her tur başında diziyi oynat
  const showSequence = useCallback((seq) => {
    setInputPhase(false);
    setShowIdx(-1);
    setActiveDir(null);
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setTimeout(() => { setShowIdx(-1); setActiveDir(null); setInputPhase(true); }, 400);
        return;
      }
      setShowIdx(i);
      setActiveDir(seq[i]);
      setTimeout(() => { setShowIdx(-1); setActiveDir(null); setTimeout(step, 200); }, 600);
      i++;
    };
    setTimeout(step, 500);
  }, []);

  const startRound = useCallback((currentRound, prev) => {
    const newDir = DIRS[Math.floor(Math.random() * 4)].key;
    const seq = [...prev, newDir];
    seqRef.current = seq;
    inputRef.current = 0;
    setSequence(seq);
    setRound(currentRound);
    setInputIdx(0);
    lockRef.current = false;
    showSequence(seq);
  }, [showSequence]);

  const handleDir = useCallback((key) => {
    if (!inputPhase || lockRef.current || phaseRef.current !== 'playing') return;
    const expected = seqRef.current[inputRef.current];
    if (key === expected) {
      setHitTrigger(t => t + 1);
      inputRef.current += 1;
      setInputIdx(inputRef.current);
      if (inputRef.current >= seqRef.current.length) {
        // Tur tamamlandı
        lockRef.current = true;
        const nextRound = roundRef.current + 1;
        roundRef.current = nextRound;
        if (nextRound >= GOAL) {
          phaseRef.current = 'done';
          setPhase('done');
          setResult('win');
          return;
        }
        setTimeout(() => startRound(nextRound, seqRef.current), 700);
      }
    } else {
      setMissTrigger(t => t + 1);
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        phaseRef.current = 'done'; setPhase('done'); setResult('lose'); return;
      }
      // Turu baştan al
      lockRef.current = true;
      setTimeout(() => startRound(roundRef.current, seqRef.current.slice(0, -1)), 700);
    }
  }, [inputPhase, startRound]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; roundRef.current = 0;
    seqRef.current = []; inputRef.current = 0;
    setPhase('playing'); setLives(LIVES); setRound(0);
    setSequence([]); setResult(null); setInputPhase(false);
    lockRef.current = false;
    startRound(0, []);
  }, [startRound]);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🧭</Text>
      <Text style={s.bigTitle}>İzcilik: Yön Bul</Text>
      <Text style={s.sub}>Ok dizisini ezberle ve aynı sırada tekrarla!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '👀', text: 'Oklar sırayla parlayacak — ezberle' },
          { icon: '👆', text: 'Dizinin bitiminde aynı sırayı tekrarla' },
          { icon: '📏', text: 'Her turda dizi bir ok daha uzar' },
          { icon: '🏆', text: `${GOAL} turu tamamla → Zafer!` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🧭  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(roundRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'İz Ustası!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} tur! Yönünü hiç kaybetmedin!` : `${roundRef.current} tur tamamladın.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{roundRef.current}/{GOAL}</Text><Text style={s.statL}>🧭 Tur</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🧭 Kazanılan Bonuslar</Text>
          {b.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zeka +{b.intelligence}</Text>}
          {b.endurance    > 0 && <Text style={s.bonusLine}>🏕️ Dayanıklılık +{b.endurance}</Text>}
          {b.confidence   > 0 && <Text style={s.bonusLine}>💪 Güven +{b.confidence}</Text>}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(b)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const seqLen = sequence.length;

  return (
    <View style={s.screen}>
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View><Text style={s.hudLabel}>TUR</Text><Text style={s.hudBig}>{round}/{GOAL}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>🧭 İzcilik</Text><Text style={s.hudSub}>{seqLen} adım</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(round / GOAL) * 100}%` }]} />
        </View>
      </View>

      <View style={s.court}>
        {/* Durum */}
        <Text style={s.statusText}>
          {inputPhase
            ? `👆 Adım ${inputIdx + 1} / ${seqLen}`
            : showIdx >= 0 ? `👀 Adım ${showIdx + 1} / ${seqLen}` : '⏳ Hazırlanıyor...'}
        </Text>

        {/* Aktif yön büyük gösterge */}
        <View style={[s.bigCompass, activeDir && { borderColor: RCOLOR, backgroundColor: RCOLOR + '22' }]}>
          <Text style={s.bigCompassText}>{activeDir ? DIRS.find(d => d.key === activeDir)?.label : '🧭'}</Text>
        </View>

        {/* 4 yön butonu */}
        <View style={s.dirGrid}>
          {DIRS.map(d => {
            const isActive  = activeDir === d.key;
            const isDisabled = !inputPhase;
            return (
              <TouchableOpacity
                key={d.key}
                style={[s.dirBtn, isActive && s.dirBtnActive, isDisabled && s.dirBtnDisabled]}
                onPress={() => handleDir(d.key)}
                activeOpacity={0.7}
                disabled={isDisabled}
              >
                <Text style={s.dirBtnText}>{d.label}</Text>
                <Text style={s.dirBtnName}>{d.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:         { flex: 1, backgroundColor: '#041a0c' },
  center:         { flex: 1, backgroundColor: '#041a0c', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:            { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#071a0e', borderBottomWidth: 1, borderBottomColor: '#1a4a28' },
  hudRow:         { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:       { color: '#2a6a3a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:         { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:      { alignItems: 'center' },
  hudTitle:       { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  hudSub:         { color: '#6b7280', fontSize: 10, marginTop: 1 },
  progressBar:    { height: 5, backgroundColor: '#1a4a28', borderRadius: 3, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:          { flex: 1, backgroundColor: '#050f07', alignItems: 'center', justifyContent: 'space-evenly', padding: 16 },
  statusText:     { color: '#e6edf3', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  bigCompass:     { width: 120, height: 120, borderRadius: 60, borderWidth: 2.5, borderColor: '#1a4a28', backgroundColor: '#071a0e', alignItems: 'center', justifyContent: 'center' },
  bigCompassText: { fontSize: 56 },
  dirGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center', width: '90%' },
  dirBtn:         { width: '44%', paddingVertical: 20, backgroundColor: '#0d2018', borderRadius: 16, borderWidth: 2, borderColor: '#1a4a28', alignItems: 'center' },
  dirBtnActive:   { backgroundColor: RCOLOR + '33', borderColor: RCOLOR },
  dirBtnDisabled: { opacity: 0.4 },
  dirBtnText:     { fontSize: 32 },
  dirBtnName:     { color: '#8b949e', fontSize: 11, marginTop: 2 },
  bigTitle:       { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:            { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:       { backgroundColor: '#071a0e', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1a4a28' },
  ruleRow:        { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:       { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:       { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:       { backgroundColor: '#166534', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:    { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:       { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:       { backgroundColor: '#071a0e', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1a4a28' },
  statV:          { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:          { color: '#2a6a3a', fontSize: 10, marginTop: 2 },
  bonusBox:       { backgroundColor: '#071a0e', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1a4a28' },
  bonusTitle:     { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:      { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
