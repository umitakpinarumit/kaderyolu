/**
 * OdevOyunu — Düzenli Ödev 📚
 * Matematik soruları çöz, 12 doğru = zafer!
 * Bonus: Zeka + Disiplin + Odak
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H  = SAFE_TOP + 60;
const GOAL   = 12;
const LIVES  = 3;
const Q_MS   = 5500;
const RCOLOR = '#60a5fa';

function genQ(level) {
  const ops = level < 5 ? ['+', '-'] : ['+', '-', '×'];
  const op  = ops[Math.floor(Math.random() * ops.length)];
  let a, b, ans;
  if (op === '×') {
    a = 2 + Math.floor(Math.random() * 8);
    b = 2 + Math.floor(Math.random() * 8);
    ans = a * b;
  } else if (op === '+') {
    const lim = 10 + level * 2;
    a = 1 + Math.floor(Math.random() * lim);
    b = 1 + Math.floor(Math.random() * lim);
    ans = a + b;
  } else {
    const lim = 12 + level * 2;
    a = 5 + Math.floor(Math.random() * lim);
    b = 1 + Math.floor(Math.random() * (a - 1));
    ans = a - b;
  }
  const cs = new Set([ans]);
  while (cs.size < 4) {
    const w = ans + Math.floor(Math.random() * 21) - 10;
    if (w !== ans && w >= 0) cs.add(w);
  }
  return { text: `${a} ${op} ${b} = ?`, ans, choices: [...cs].sort(() => Math.random() - 0.5) };
}

const calcBonus = (s) => ({
  intelligence: s >= GOAL ? 5 : s >= 8 ? 3 : s >= 4 ? 2 : 1,
  discipline:   s >= GOAL ? 4 : s >= 8 ? 3 : s >= 4 ? 2 : 1,
  focus:        s >= GOAL ? 3 : s >= 8 ? 2 : 1,
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

export default function OdevOyunu({ choice, onComplete }) {
  const [phase,        setPhase]       = useState('ready');
  const [lives,        setLives]       = useState(LIVES);
  const [score,        setScore]       = useState(0);
  const [q,            setQ]           = useState(null);
  const [hitTrigger,   setHitTrigger]  = useState(0);
  const [missTrigger,  setMissTrigger] = useState(0);
  const [result,       setResult]      = useState(null);

  const timerAnim = useRef(new Animated.Value(1)).current;
  const phaseRef  = useRef('ready');
  const livesRef  = useRef(LIVES);
  const scoreRef  = useRef(0);
  const lockRef   = useRef(false);
  const timerRef  = useRef(null);

  const fail = useCallback(() => {
    livesRef.current -= 1;
    setLives(livesRef.current);
    setMissTrigger(t => t + 1);
    if (livesRef.current <= 0) {
      phaseRef.current = 'done';
      setPhase('done');
      setResult('lose');
      return true;
    }
    return false;
  }, []);

  const nextQ = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    lockRef.current = false;
    setQ(genQ(scoreRef.current));
    timerAnim.setValue(1);
    timerRef.current?.stop();
    timerRef.current = Animated.timing(timerAnim, {
      toValue: 0, duration: Q_MS, easing: Easing.linear, useNativeDriver: false,
    });
    timerRef.current.start(({ finished }) => {
      if (finished && phaseRef.current === 'playing') {
        if (!fail()) setTimeout(nextQ, 600);
      }
    });
  }, [fail]);

  const answer = useCallback((picked, current) => {
    if (lockRef.current || phaseRef.current !== 'playing') return;
    lockRef.current = true;
    timerRef.current?.stop();
    if (picked === current.ans) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHitTrigger(t => t + 1);
      if (scoreRef.current >= GOAL) {
        phaseRef.current = 'done'; setPhase('done'); setResult('win'); return;
      }
      setTimeout(nextQ, 350);
    } else {
      if (!fail()) setTimeout(nextQ, 650);
    }
  }, [fail, nextQ]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; scoreRef.current = 0;
    setPhase('playing'); setLives(LIVES); setScore(0); setResult(null);
    nextQ();
  }, [nextQ]);

  useEffect(() => () => timerRef.current?.stop(), []);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>📚</Text>
      <Text style={s.bigTitle}>Ödev Zamanı</Text>
      <Text style={s.sub}>Matematik sorularını hızlıca çöz!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '🔢', text: 'Soruyu oku, doğru cevabı seç' },
          { icon: '⏱️', text: 'Her sorunun 5.5 saniyesi var — dikkatli ol!' },
          { icon: '🏆', text: `${GOAL} doğru cevap → Zafer!` },
          { icon: '❤️', text: `${LIVES} can — yanlış veya süre dolunca azalır` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>📝  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(scoreRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Harika!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} doğru! Matematik dehası!` : `${scoreRef.current} doğru yaptın.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{scoreRef.current}</Text><Text style={s.statL}>✅ Doğru</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>📚 Kazanılan Bonuslar</Text>
          {b.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zeka +{b.intelligence}</Text>}
          {b.discipline   > 0 && <Text style={s.bonusLine}>📐 Disiplin +{b.discipline}</Text>}
          {b.focus        > 0 && <Text style={s.bonusLine}>🎯 Odak +{b.focus}</Text>}
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
          <View><Text style={s.hudLabel}>DOĞRU</Text><Text style={s.hudBig}>{score}/{GOAL}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>📚 Ödev</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>
              {'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}
            </Text>
          </View>
        </View>
        <Animated.View style={[s.timerBar, {
          width: timerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
        }]} />
      </View>

      {q && (
        <View style={s.court}>
          <Text style={s.questionText}>{q.text}</Text>
          <View style={s.choicesGrid}>
            {q.choices.map((c, i) => (
              <TouchableOpacity key={i} style={s.choiceBtn} onPress={() => answer(c, q)} activeOpacity={0.7}>
                <Text style={s.choiceTxt}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <Flash color="#22c55e" trigger={hitTrigger} />
          <Flash color="#ef4444" trigger={missTrigger} />
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#060e1c' },
  center:       { flex: 1, backgroundColor: '#060e1c', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0a1628', borderBottomWidth: 1, borderBottomColor: '#1e3a5f' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#3a6b9a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  timerBar:     { height: 5, backgroundColor: RCOLOR, borderRadius: 3, alignSelf: 'flex-start' },
  court:        { flex: 1, backgroundColor: '#080f1c', alignItems: 'center', justifyContent: 'center', padding: 24 },
  questionText: { color: '#e6edf3', fontSize: 44, fontWeight: '900', textAlign: 'center', marginBottom: 44, letterSpacing: 1 },
  choicesGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: 14, justifyContent: 'center', width: '100%' },
  choiceBtn:    { width: '44%', paddingVertical: 24, backgroundColor: '#0f1f3a', borderRadius: 18, borderWidth: 2, borderColor: RCOLOR + '44', alignItems: 'center' },
  choiceTxt:    { color: '#e6edf3', fontSize: 28, fontWeight: '900' },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#0a1628', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#1d4ed8', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#0a1628', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1e3a5f' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#3a6b9a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0a1628', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
