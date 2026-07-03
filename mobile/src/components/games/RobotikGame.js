/**
 * RobotikGame — Robotik 🤖
 * Renk dizisini ezberleme & tekrarlama (Simon Says).
 * 4 renkli düğme, her turda dizi uzar.
 * 8 tur = zafer!
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H = SAFE_TOP + 56;
const GOAL  = 8;
const LIVES = 3;

const BTNS = [
  { key: 0, color: '#ef4444', glow: '#fca5a5', label: '🔴' },
  { key: 1, color: '#3b82f6', glow: '#93c5fd', label: '🔵' },
  { key: 2, color: '#22c55e', glow: '#86efac', label: '🟢' },
  { key: 3, color: '#eab308', glow: '#fde047', label: '🟡' },
];

const calcBonus = (r) => ({
  intelligence: r >= GOAL ? 5 : r >= 5 ? 3 : r >= 3 ? 2 : 1,
  focus:        r >= GOAL ? 4 : r >= 5 ? 3 : r >= 3 ? 2 : 1,
  creativity:   r >= GOAL ? 3 : r >= 5 ? 2 : 1,
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

export default function RobotikGame({ choice, onComplete }) {
  const [phase,       setPhase]      = useState('ready');
  const [lives,       setLives]      = useState(LIVES);
  const [round,       setRound]      = useState(0);
  const [sequence,    setSequence]   = useState([]);
  const [litBtn,      setLitBtn]     = useState(null);  // hangi düğme parlıyor
  const [inputPhase,  setInputPhase] = useState(false);
  const [inputIdx,    setInputIdx]   = useState(0);
  const [hitTrigger,  setHitTrigger] = useState(0);
  const [missTrigger, setMissTrigger]= useState(0);
  const [result,      setResult]     = useState(null);

  const phaseRef = useRef('ready');
  const livesRef = useRef(LIVES);
  const roundRef = useRef(0);
  const seqRef   = useRef([]);
  const inputRef = useRef(0);
  const lockRef  = useRef(false);

  const showSeq = useCallback((seq) => {
    setInputPhase(false);
    setLitBtn(null);
    let i = 0;
    const step = () => {
      if (i >= seq.length) {
        setTimeout(() => { setLitBtn(null); setInputPhase(true); }, 350);
        return;
      }
      setLitBtn(seq[i]);
      setTimeout(() => { setLitBtn(null); setTimeout(step, 180); }, 550);
      i++;
    };
    setTimeout(step, 500);
  }, []);

  const startRound = useCallback((rnd, prev) => {
    const next = Math.floor(Math.random() * 4);
    const seq  = [...prev, next];
    seqRef.current = seq;
    inputRef.current = 0;
    lockRef.current = false;
    setSequence(seq);
    setRound(rnd);
    setInputIdx(0);
    showSeq(seq);
  }, [showSeq]);

  const handleBtn = useCallback((key) => {
    if (!inputPhase || lockRef.current || phaseRef.current !== 'playing') return;
    const expected = seqRef.current[inputRef.current];
    if (key === expected) {
      setHitTrigger(t => t + 1);
      inputRef.current += 1;
      setInputIdx(inputRef.current);
      if (inputRef.current >= seqRef.current.length) {
        lockRef.current = true;
        const next = roundRef.current + 1;
        roundRef.current = next;
        if (next >= GOAL) {
          phaseRef.current = 'done'; setPhase('done'); setResult('win'); return;
        }
        setTimeout(() => startRound(next, seqRef.current), 700);
      }
    } else {
      setMissTrigger(t => t + 1);
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        phaseRef.current = 'done'; setPhase('done'); setResult('lose'); return;
      }
      lockRef.current = true;
      setTimeout(() => startRound(roundRef.current, seqRef.current.slice(0, -1)), 700);
    }
  }, [inputPhase, startRound]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; roundRef.current = 0;
    seqRef.current = []; inputRef.current = 0;
    setPhase('playing'); setLives(LIVES); setRound(0);
    setSequence([]); setResult(null); setInputPhase(false); setLitBtn(null);
    lockRef.current = false;
    startRound(0, []);
  }, [startRound]);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🤖</Text>
      <Text style={s.bigTitle}>Robot Programla</Text>
      <Text style={s.sub}>Renk dizisini ezberle ve aynı sırada tekrarla!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '💡', text: 'Düğmeler sırayla yanacak — izle' },
          { icon: '👆', text: 'Bitince aynı sırayı kendin tekrarla' },
          { icon: '📏', text: 'Her turda bir renk daha eklenir' },
          { icon: '🏆', text: `${GOAL} turu tamamla → Zafer!` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🤖  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(roundRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Süper Programcı!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} tur! Robotu mükemmel programladın!` : `${roundRef.current} tur tamamladın.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{roundRef.current}/{GOAL}</Text><Text style={s.statL}>🤖 Tur</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🤖 Kazanılan Bonuslar</Text>
          {b.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zeka +{b.intelligence}</Text>}
          {b.focus        > 0 && <Text style={s.bonusLine}>🎯 Odak +{b.focus}</Text>}
          {b.creativity   > 0 && <Text style={s.bonusLine}>💡 Yaratıcılık +{b.creativity}</Text>}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(b)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View><Text style={s.hudLabel}>TUR</Text><Text style={s.hudBig}>{round}/{GOAL}</Text></View>
          <View style={s.hudCenter}>
            <Text style={s.hudTitle}>🤖 Robotik</Text>
            <Text style={s.hudSub}>{sequence.length} adım</Text>
          </View>
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
        <Text style={s.statusText}>
          {inputPhase
            ? `👆 Adım ${inputIdx + 1} / ${sequence.length}`
            : litBtn !== null ? '👀 İzle...' : '⏳ Hazırlanıyor...'}
        </Text>

        {/* Robot ekranı */}
        <View style={s.robotScreen}>
          {litBtn !== null ? (
            <Text style={{ fontSize: 52 }}>{BTNS[litBtn].label}</Text>
          ) : (
            <Text style={s.robotIdle}>🤖</Text>
          )}
        </View>

        {/* 4 renk butonu */}
        <View style={s.btnGrid}>
          {BTNS.map(b => {
            const lit = litBtn === b.key;
            return (
              <TouchableOpacity
                key={b.key}
                style={[s.colorBtn, { backgroundColor: b.color + (lit ? 'ff' : '33'), borderColor: b.color },
                  lit && { shadowColor: b.glow, shadowOpacity: 1, shadowRadius: 14, elevation: 12 },
                  !inputPhase && { opacity: 0.45 },
                ]}
                onPress={() => handleBtn(b.key)}
                activeOpacity={0.7}
                disabled={!inputPhase}
              >
                <Text style={s.colorBtnLabel}>{b.label}</Text>
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
  screen:       { flex: 1, backgroundColor: '#06101e' },
  center:       { flex: 1, backgroundColor: '#06101e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0a1628', borderBottomWidth: 1, borderBottomColor: '#1e3a5f' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#3a6b9a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: '#a78bfa', fontSize: 14, fontWeight: '900' },
  hudSub:       { color: '#6b7280', fontSize: 10, marginTop: 1 },
  progressBar:  { height: 5, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#a78bfa', borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#080f1c', alignItems: 'center', justifyContent: 'space-evenly', padding: 16 },
  statusText:   { color: '#e6edf3', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  robotScreen:  { width: 140, height: 140, borderRadius: 20, backgroundColor: '#0f1f3a', borderWidth: 2, borderColor: '#1e3a5f', alignItems: 'center', justifyContent: 'center' },
  robotIdle:    { fontSize: 56, opacity: 0.6 },
  btnGrid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '90%' },
  colorBtn:     { width: '44%', paddingVertical: 22, borderRadius: 18, borderWidth: 2.5, alignItems: 'center' },
  colorBtnLabel:{ fontSize: 38 },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#0a1628', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#6d28d9', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: '#a78bfa', shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#0a1628', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1e3a5f' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#3a6b9a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0a1628', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: '#a78bfa', fontSize: 13, marginBottom: 2 },
});
