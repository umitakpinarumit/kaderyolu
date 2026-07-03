/**
 * YuzmeGame — Yüzme 🏊
 * Sol/Sağ butonlara dönüşümlü bas — yüzme vuruşu yap!
 * 30 vuruş = zafer. Yanlış sıra = zaman kaybı.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H  = SAFE_TOP + 56;
const GOAL   = 30;
const LIVES  = 3;
const RCOLOR = '#38bdf8';

const calcBonus = (s) => ({
  health:  s >= GOAL ? 5 : s >= 20 ? 4 : s >= 12 ? 3 : s >= 6 ? 2 : 1,
  agility: s >= GOAL ? 5 : s >= 20 ? 4 : s >= 12 ? 3 : s >= 6 ? 2 : 1,
  focus:   s >= GOAL ? 3 : s >= 20 ? 2 : 1,
});

function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.4, duration: 40,  useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,   duration: 260, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

export default function YuzmeGame({ choice, onComplete }) {
  const [phase,       setPhase]      = useState('ready');
  const [lives,       setLives]      = useState(LIVES);
  const [strokes,     setStrokes]    = useState(0);
  const [nextSide,    setNextSide]   = useState('L');  // 'L' | 'R'
  const [leftActive,  setLeftActive] = useState(false);
  const [rightActive, setRightActive]= useState(false);
  const [hitTrigger,  setHitTrigger] = useState(0);
  const [missTrigger, setMissTrigger]= useState(0);
  const [result,      setResult]     = useState(null);

  const waveAnim  = useRef(new Animated.Value(0)).current;
  const charAnim  = useRef(new Animated.Value(0)).current;
  const phaseRef  = useRef('ready');
  const livesRef  = useRef(LIVES);
  const strokesRef= useRef(0);
  const nextRef   = useRef('L');
  const waveLoop  = useRef(null);

  const startWave = useCallback(() => {
    waveLoop.current?.stop();
    waveLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, { toValue: 1, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(waveAnim, { toValue: 0, duration: 800, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ])
    );
    waveLoop.current.start();
  }, []);

  const doStroke = useCallback((side) => {
    if (phaseRef.current !== 'playing') return;
    if (side === nextRef.current) {
      // Doğru
      if (side === 'L') { setLeftActive(true); setTimeout(() => setLeftActive(false), 180); }
      else { setRightActive(true); setTimeout(() => setRightActive(false), 180); }

      strokesRef.current += 1;
      setStrokes(strokesRef.current);
      setHitTrigger(t => t + 1);

      // Karakter yüzme animasyonu
      Animated.sequence([
        Animated.timing(charAnim, { toValue: side === 'L' ? -10 : 10, duration: 100, useNativeDriver: true }),
        Animated.timing(charAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      ]).start();

      const next = nextRef.current === 'L' ? 'R' : 'L';
      nextRef.current = next;
      setNextSide(next);

      if (strokesRef.current >= GOAL) {
        waveLoop.current?.stop();
        phaseRef.current = 'done'; setPhase('done'); setResult('win');
      }
    } else {
      // Yanlış taraf
      setMissTrigger(t => t + 1);
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        waveLoop.current?.stop();
        phaseRef.current = 'done'; setPhase('done'); setResult('lose');
      }
    }
  }, []);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; strokesRef.current = 0;
    nextRef.current  = 'L';
    setPhase('playing'); setLives(LIVES); setStrokes(0); setNextSide('L'); setResult(null);
    setLeftActive(false); setRightActive(false);
    charAnim.setValue(0);
    startWave();
  }, [startWave]);

  useEffect(() => () => waveLoop.current?.stop(), []);

  const waveTranslate = waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 8] });
  const charTranslate = charAnim;

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🏊</Text>
      <Text style={s.bigTitle}>Yüzme Havuzu</Text>
      <Text style={s.sub}>Sol/Sağ kollarını dönüşümlü kullan!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '🤚', text: 'Önce SOL, sonra SAĞ, sonra tekrar SOL...' },
          { icon: '⚡', text: 'Sıra dışı basarsan can kaybedersin' },
          { icon: '💡', text: 'Işıklı ok hangi kolu kullanacağını gösterir' },
          { icon: '🏆', text: `${GOAL} vuruş → Zafer!` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🏊  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(strokesRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Yüzme Şampiyonu!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} vuruş! Havuzu aştın!` : `${strokesRef.current} vuruş yaptın.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{strokesRef.current}</Text><Text style={s.statL}>🏊 Vuruş</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🏊 Kazanılan Bonuslar</Text>
          {b.health  > 0 && <Text style={s.bonusLine}>💪 Sağlık +{b.health}</Text>}
          {b.agility > 0 && <Text style={s.bonusLine}>⚡ Çeviklik +{b.agility}</Text>}
          {b.focus   > 0 && <Text style={s.bonusLine}>🎯 Odak +{b.focus}</Text>}
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
          <View><Text style={s.hudLabel}>VURUŞ</Text><Text style={s.hudBig}>{strokes}/{GOAL}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>🏊 Yüzme</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${(strokes / GOAL) * 100}%` }]} /></View>
      </View>

      <View style={s.court}>
        {/* Su dalgaları */}
        <Animated.View style={[s.wave1, { transform: [{ translateY: waveTranslate }] }]} />
        <Animated.View style={[s.wave2, { transform: [{ translateY: Animated.multiply(waveTranslate, -1) }] }]} />

        {/* Yüzücü */}
        <Animated.Text style={[s.swimmer, { transform: [{ translateX: charTranslate }] }]}>🏊</Animated.Text>

        {/* Sıra göstergesi */}
        <View style={s.indicator}>
          <Text style={[s.indArrow, nextSide === 'L' && s.indActive]}>⬅️</Text>
          <Text style={s.indLabel}>{nextSide === 'L' ? 'SOL kol' : 'SAĞ kol'}</Text>
          <Text style={[s.indArrow, nextSide === 'R' && s.indActive]}>➡️</Text>
        </View>

        {/* Vuruş butonları */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={[s.strokeBtn, s.leftBtn, leftActive && s.btnActive, nextSide === 'L' && s.btnHighlight]}
            onPress={() => doStroke('L')}
            activeOpacity={0.7}
          >
            <Text style={s.strokeBtnTxt}>🤚{'\n'}SOL</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[s.strokeBtn, s.rightBtn, rightActive && s.btnActive, nextSide === 'R' && s.btnHighlight]}
            onPress={() => doStroke('R')}
            activeOpacity={0.7}
          >
            <Text style={s.strokeBtnTxt}>🤚{'\n'}SAĞ</Text>
          </TouchableOpacity>
        </View>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#03131e' },
  center:       { flex: 1, backgroundColor: '#03131e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#061828', borderBottomWidth: 1, borderBottomColor: '#0c3a5a' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#1e5a8a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#0c3a5a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#042030', alignItems: 'center', justifyContent: 'space-evenly', overflow: 'hidden' },
  wave1:        { position: 'absolute', top: '30%', left: 0, right: 0, height: 3, backgroundColor: RCOLOR + '44', borderRadius: 2 },
  wave2:        { position: 'absolute', top: '40%', left: 0, right: 0, height: 3, backgroundColor: RCOLOR + '33', borderRadius: 2 },
  swimmer:      { fontSize: 64 },
  indicator:    { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#061828', paddingVertical: 12, paddingHorizontal: 24, borderRadius: 18, borderWidth: 1.5, borderColor: '#0c3a5a' },
  indArrow:     { fontSize: 28, opacity: 0.3 },
  indActive:    { opacity: 1 },
  indLabel:     { color: '#e6edf3', fontSize: 16, fontWeight: '900', minWidth: 70, textAlign: 'center' },
  btnRow:       { flexDirection: 'row', gap: 20, width: '90%', justifyContent: 'center' },
  strokeBtn:    { flex: 1, paddingVertical: 28, borderRadius: 20, borderWidth: 2.5, alignItems: 'center' },
  leftBtn:      { backgroundColor: RCOLOR + '22', borderColor: RCOLOR + '55' },
  rightBtn:     { backgroundColor: RCOLOR + '22', borderColor: RCOLOR + '55' },
  btnActive:    { backgroundColor: RCOLOR + '66' },
  btnHighlight: { borderColor: RCOLOR, shadowColor: RCOLOR, shadowOpacity: 0.8, shadowRadius: 12, elevation: 8 },
  strokeBtnTxt: { color: '#e6edf3', fontSize: 22, fontWeight: '900', textAlign: 'center', lineHeight: 28 },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#061828', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#0c3a5a' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#0369a1', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#061828', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#0c3a5a' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#1e5a8a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#061828', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#0c3a5a' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
