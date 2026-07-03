/**
 * KumbaraGame — Kumbara 🐷
 * Düşen paraları kumbara ile yakala!
 * 20 para = zafer · 3 kaçırma = oyun bitti
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, PanResponder,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 68;
const COURT_H = SH - HUD_H - CTRL_H;

const GOAL      = 20;
const LIVES     = 3;
const BANK_W    = 90;
const BANK_Y    = COURT_H - 50;  // banka Y (top) — court içi koordinat
const COIN_R    = 20;
const HIT_TOL_X = BANK_W * 0.6;
const HIT_TOL_Y = 36;

// Para düşme süresi (ms) — skora göre kısalır
const FALL_BASE = 2400;
const FALL_MIN  = 900;

const COINS = ['🪙','💰','💵'];
const RCOLOR = '#f59e0b';

const calcBonus = (s) => ({
  discipline: s >= GOAL ? 5 : s >= 14 ? 4 : s >= 8 ? 3 : s >= 3 ? 2 : 1,
  focus:      s >= GOAL ? 4 : s >= 14 ? 3 : s >= 8 ? 2 : 1,
  confidence: s >= GOAL ? 3 : s >= 14 ? 2 : 1,
});

const easeInQuad = t => t * t;

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

export default function KumbaraGame({ choice, onComplete }) {
  const [phase,       setPhase]       = useState('ready');
  const [lives,       setLives]       = useState(LIVES);
  const [score,       setScore]       = useState(0);
  const [hitTrigger,  setHitTrigger]  = useState(0);
  const [missTrigger, setMissTrigger] = useState(0);
  const [result,      setResult]      = useState(null);
  const [coinIcon,    setCoinIcon]    = useState('🪙');

  const bankX      = useRef(new Animated.Value(SW / 2)).current;
  const coinVisX   = useRef(new Animated.Value(SW / 2)).current;
  const coinVisY   = useRef(new Animated.Value(-COIN_R * 2)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;

  const phaseRef   = useRef('ready');
  const livesRef   = useRef(LIVES);
  const scoreRef   = useRef(0);
  const bankXRef   = useRef(SW / 2);
  const coinActive = useRef(false);
  const coinParams = useRef({ startTime: 0, x: SW / 2, dur: FALL_BASE });
  const collideRef = useRef(null);
  const fallAnimRef= useRef(null);
  const hitLock    = useRef(false);

  const stopAll = useCallback(() => {
    fallAnimRef.current?.stop();
    clearInterval(collideRef.current);
    coinVisX.removeAllListeners();
    coinVisY.removeAllListeners();
  }, []);

  const spawnCoin = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    hitLock.current = false;
    coinActive.current = true;

    const x   = SW * 0.1 + Math.random() * SW * 0.8;
    const dur  = Math.max(FALL_MIN, FALL_BASE - scoreRef.current * 50);
    const icon = COINS[Math.floor(Math.random() * COINS.length)];

    setCoinIcon(icon);
    coinParams.current = { startTime: Date.now(), x, dur };
    coinVisX.setValue(x);
    coinVisY.setValue(-COIN_R * 2);

    fallAnimRef.current?.stop();
    fallAnimRef.current = Animated.timing(coinVisY, {
      toValue: COURT_H + COIN_R * 2,
      duration: dur,
      easing: Easing.in(Easing.quad),
      useNativeDriver: true,
    });
    fallAnimRef.current.start(({ finished }) => {
      if (finished && phaseRef.current === 'playing' && coinActive.current) {
        // kaçırıldı
        coinActive.current = false;
        livesRef.current -= 1;
        setLives(livesRef.current);
        setMissTrigger(t => t + 1);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue:  8, duration: 45, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
        ]).start();
        if (livesRef.current <= 0) {
          phaseRef.current = 'done'; setPhase('done'); setResult('lose');
        } else {
          setTimeout(spawnCoin, 600);
        }
      }
    });

    // Çarpışma kontrolü
    clearInterval(collideRef.current);
    collideRef.current = setInterval(() => {
      if (!coinActive.current || phaseRef.current !== 'playing') return;
      const { startTime, x: cx, dur } = coinParams.current;
      const elapsed = Date.now() - startTime;
      const t = Math.min(elapsed / dur, 1);
      const coinY = (COURT_H + COIN_R * 2) * easeInQuad(t) - COIN_R * 2;
      const bx    = bankXRef.current;

      if (coinY >= BANK_Y - HIT_TOL_Y && coinY <= BANK_Y + HIT_TOL_Y) {
        if (Math.abs(cx - bx) <= HIT_TOL_X) {
          coinActive.current = false;
          clearInterval(collideRef.current);
          fallAnimRef.current?.stop();
          coinVisY.setValue(COURT_H + 100);

          scoreRef.current += 1;
          setScore(scoreRef.current);
          setHitTrigger(t => t + 1);

          if (scoreRef.current >= GOAL) {
            phaseRef.current = 'done'; setPhase('done'); setResult('win');
          } else {
            setTimeout(spawnCoin, 350);
          }
        }
      }
    }, 14);
  }, [stopAll]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const cx = Math.max(BANK_W / 2, Math.min(SW - BANK_W / 2, evt.nativeEvent.pageX));
        bankXRef.current = cx; bankX.setValue(cx);
      },
      onPanResponderMove: (evt) => {
        const cx = Math.max(BANK_W / 2, Math.min(SW - BANK_W / 2, evt.nativeEvent.pageX));
        bankXRef.current = cx; bankX.setValue(cx);
      },
    })
  ).current;

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; scoreRef.current = 0;
    coinActive.current = false; hitLock.current = false;
    bankXRef.current = SW / 2;
    setPhase('playing'); setLives(LIVES); setScore(0); setResult(null);
    bankX.setValue(SW / 2);
    coinVisY.setValue(COURT_H + 100);
    setTimeout(spawnCoin, 400);
  }, [spawnCoin]);

  useEffect(() => () => stopAll(), []);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🐷</Text>
      <Text style={s.bigTitle}>Kumbara Doldur!</Text>
      <Text style={s.sub}>Düşen paraları kumbara ile yakala!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '🪙', text: 'Para yukarıdan düşer' },
          { icon: '👆', text: 'Parmağını sürükle → kumbarayı konumla' },
          { icon: '🐷', text: 'Para kumbaranın üzerine düşünce yakalanır' },
          { icon: '🏆', text: `${GOAL} para → Zafer! · ${LIVES} kaçırma = bitti` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🐷  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(scoreRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Kumbara Dolu!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} para! Tasarruf şampiyonu!` : `${scoreRef.current} para yakaladın.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{scoreRef.current}</Text><Text style={s.statL}>🪙 Para</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🐷 Kazanılan Bonuslar</Text>
          {b.discipline > 0 && <Text style={s.bonusLine}>📐 Disiplin +{b.discipline}</Text>}
          {b.focus      > 0 && <Text style={s.bonusLine}>🎯 Odak +{b.focus}</Text>}
          {b.confidence > 0 && <Text style={s.bonusLine}>💪 Güven +{b.confidence}</Text>}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(b)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <Animated.View style={[s.screen, { transform: [{ translateX: shakeAnim }] }]}>
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View><Text style={s.hudLabel}>PARA</Text><Text style={s.hudBig}>{score}/{GOAL}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>🐷 Kumbara</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${(score / GOAL) * 100}%` }]} /></View>
      </View>

      <View style={s.court} {...panResponder.panHandlers}>
        <View style={s.floor} />
        <Text style={[s.deco, { left: 10, top: 30 }]}>☁️</Text>
        <Text style={[s.deco, { right: 10, top: 60 }]}>☁️</Text>

        {/* Düşen para */}
        <Animated.Text style={[s.coin, {
          transform: [{ translateX: coinVisX }, { translateY: coinVisY }],
        }]}>{coinIcon}</Animated.Text>

        {/* Kumbara */}
        <Animated.View style={[s.bankWrap, {
          transform: [{ translateX: bankX }],
        }]}>
          <Text style={s.bankEmoji}>🐷</Text>
        </Animated.View>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>

      <View style={s.ctrl}>
        <Text style={s.ctrlHint}>← Parmağını sürükle → kumbarayı konumla</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#1a1000' },
  center:       { flex: 1, backgroundColor: '#1a1000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#201400', borderBottomWidth: 1, borderBottomColor: '#5a3a00' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#8a6000', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#3a2400', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#150e00', position: 'relative', overflow: 'hidden' },
  floor:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: 16, backgroundColor: '#5c4010', borderTopWidth: 2, borderTopColor: '#8b6020' },
  deco:         { position: 'absolute', fontSize: 26, opacity: 0.25 },
  coin:         { position: 'absolute', fontSize: COIN_R * 2, marginLeft: -COIN_R, marginTop: -COIN_R },
  bankWrap:     { position: 'absolute', bottom: 16, left: 0, marginLeft: -BANK_W / 2, width: BANK_W, alignItems: 'center' },
  bankEmoji:    { fontSize: 54 },
  ctrl:         { height: CTRL_H, backgroundColor: '#201400', borderTopWidth: 1, borderTopColor: '#5a3a00', justifyContent: 'center', alignItems: 'center' },
  ctrlHint:     { color: '#e6edf3', fontSize: 13, fontWeight: '700' },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#201400', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#5a3a00' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#b45309', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#201400', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#5a3a00' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#8a6000', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#201400', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#5a3a00' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
