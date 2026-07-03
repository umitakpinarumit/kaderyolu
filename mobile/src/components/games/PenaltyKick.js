/**
 * PenaltyKick — Penaltı Atışı mini-oyunu
 * 8 atış × 3×3 kale.
 * Shot N (1-indexed): goalkeeper blocks exactly N random cells out of 9.
 * Blocked cells are revealed AFTER the player shoots.
 * Difficulty increases each shot (1 blocked → 8 blocked).
 * Bonus: confidence / agility / health based on goal count.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const TOTAL_SHOTS = 8;
const CELL_W = (SW - 80) / 3;
const CELL_H = CELL_W * 0.72;

const ZONE_LABELS = ['↖', '↑', '↗', '←', '●', '→', '↙', '↓', '↘'];

/** Pick `count` unique random indices from 0..8 */
function pickBlocked(count) {
  const all = [0, 1, 2, 3, 4, 5, 6, 7, 8];
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = all[i]; all[i] = all[j]; all[j] = tmp;
  }
  return new Set(all.slice(0, count));
}

export default function PenaltyKick({ choice, onComplete }) {
  // phase: 'aim' | 'flying' | 'reveal' | 'done'
  const [phase,      setPhase]   = useState('aim');
  const [aimed,      setAimed]   = useState(null);      // 0-8
  const [blocked,    setBlocked] = useState(new Set());  // revealed after shot
  const [shotNumber, setShotNum] = useState(1);          // 1-indexed current shot
  const [goals,      setGoals]   = useState(0);
  const [log,        setLog]     = useState([]);          // {aimed, isGoal}

  const ballY   = useRef(new Animated.Value(0)).current;
  const ballX   = useRef(new Animated.Value(0)).current;
  const ballSc  = useRef(new Animated.Value(1)).current;
  const shakeX  = useRef(new Animated.Value(0)).current;
  const flashOp = useRef(new Animated.Value(0)).current;

  const shoot = () => {
    if (aimed === null || phase !== 'aim') return;
    setPhase('flying');

    // Determine blocked cells for this shot number (shotNumber cells blocked)
    const blockedSet = pickBlocked(shotNumber);
    const isGoal = !blockedSet.has(aimed);

    // Animate ball toward aimed cell
    const aimCol = aimed % 3;
    const targetX = (aimCol - 1) * CELL_W;
    const targetY = -(CELL_H * 3 + 60);

    Animated.parallel([
      Animated.timing(ballY, { toValue: targetY, duration: 550, useNativeDriver: true }),
      Animated.timing(ballX, { toValue: targetX, duration: 550, useNativeDriver: true }),
      Animated.timing(ballSc, { toValue: 0.45, duration: 550, useNativeDriver: true }),
    ]).start(() => {
      // Reveal blocked cells
      setBlocked(blockedSet);

      const newGoals = isGoal ? goals + 1 : goals;
      const newLog   = [...log, { aimed, isGoal }];
      const nextShot = shotNumber + 1;

      if (isGoal) {
        flashOp.setValue(0.8);
        Animated.timing(flashOp, { toValue: 0, duration: 700, useNativeDriver: true }).start();
        setGoals(newGoals);
      } else {
        Animated.sequence([
          Animated.timing(shakeX, { toValue: -10, duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 10,  duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: -6,  duration: 50, useNativeDriver: true }),
          Animated.timing(shakeX, { toValue: 0,   duration: 50, useNativeDriver: true }),
        ]).start();
      }

      setLog(newLog);
      setPhase('reveal');

      setTimeout(() => {
        // Reset for next shot
        ballY.setValue(0); ballX.setValue(0); ballSc.setValue(1);
        setAimed(null);
        setBlocked(new Set());

        if (nextShot > TOTAL_SHOTS) {
          setGoals(newGoals);
          setPhase('done');
        } else {
          setShotNum(nextShot);
          setPhase('aim');
        }
      }, 1600);
    });
  };

  const calcBonus = (g) => ({
    confidence: g >= 7 ? 5 : g >= 5 ? 4 : g >= 3 ? 3 : g >= 2 ? 2 : g >= 1 ? 1 : 0,
    agility:    g >= 6 ? 4 : g >= 4 ? 3 : g >= 2 ? 2 : g >= 1 ? 1 : 0,
    health:     g >= 5 ? 3 : g >= 3 ? 2 : g >= 1 ? 1 : 0,
  });

  // ── SONUÇ ───────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const bonus = calcBonus(goals);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>
          {goals >= 6 ? '⚽🏆' : goals >= 4 ? '⚽' : '🧤'}
        </Text>
        <Text style={s.resultTitle}>{goals}/{TOTAL_SHOTS} Gol!</Text>
        <Text style={s.resultSub}>
          {goals >= 6 ? 'Harika bir penaltıcısın!' : goals >= 4 ? 'Fena değil!' : 'Kaleci çok iyiydi!'}
        </Text>
        <View style={s.logRow}>
          {log.map((entry, i) => (
            <Text key={i} style={{ fontSize: 20 }}>{entry.isGoal ? '⚽' : '🧤'}</Text>
          ))}
        </View>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={s.bonusBox}>
            <Text style={s.bonusTitle}>💪 Kazanılan bonuslar</Text>
            {bonus.confidence > 0 && <Text style={s.bonusLine}>💪 Özgüven +{bonus.confidence}</Text>}
            {bonus.agility > 0    && <Text style={s.bonusLine}>⚡ Çeviklik +{bonus.agility}</Text>}
            {bonus.health > 0     && <Text style={s.bonusLine}>❤️ Sağlık +{bonus.health}</Text>}
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={() => onComplete(bonus)}>
          <Text style={s.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── OYUN ────────────────────────────────────────────────────────────────
  const shotsLeft = TOTAL_SHOTS - (shotNumber - 1);
  const isReveal  = phase === 'reveal';
  const diffPct   = ((shotNumber - 1) / TOTAL_SHOTS) * 100;

  return (
    <Animated.View style={[s.screen, { transform: [{ translateX: shakeX }] }]}>
      {/* Flash overlay */}
      <Animated.View pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#22c55e', opacity: flashOp }]} />

      {/* HUD */}
      <View style={s.hud}>
        <Text style={s.hudTitle}>🏟️ Penaltı Atışı</Text>
        <Text style={s.hudSub}>{shotsLeft} atış kaldı  •  {goals} gol</Text>
        <View style={s.shotDots}>
          {Array.from({ length: TOTAL_SHOTS }).map((_, i) => {
            const entry = log[i];
            return (
              <Text key={i} style={{ fontSize: 18 }}>
                {entry ? (entry.isGoal ? '⚽' : '🧤') : '○'}
              </Text>
            );
          })}
        </View>
        {/* Difficulty indicator */}
        <View style={s.diffRow}>
          <Text style={s.diffLabel}>Zorluk</Text>
          <View style={s.diffTrack}>
            <View style={[s.diffFill, { width: `${diffPct}%` }]} />
          </View>
          <Text style={s.diffValue}>{shotNumber - 1}/{TOTAL_SHOTS}</Text>
        </View>
      </View>

      {/* Kale alanı */}
      <View style={s.goalArea}>
        <View style={s.crossbar} />
        <View style={s.postLeft} />
        <View style={s.postRight} />

        {/* Hint shown before shooting */}
        {phase === 'aim' && (
          <Text style={s.blockHint}>
            🧤 Kaleci bu atışta {shotNumber} hücreyi kapatacak
          </Text>
        )}

        {/* Cell grid */}
        <View style={s.grid}>
          {Array.from({ length: 9 }).map((_, i) => {
            const isBlockedCell = isReveal && blocked.has(i);
            const isAimedNow    = aimed === i;
            const isGoalCell    = isReveal && aimed === i && !blocked.has(aimed);
            const isSavedCell   = isReveal && aimed === i && blocked.has(aimed);

            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.cell,
                  { width: CELL_W, height: CELL_H },
                  isAimedNow    && !isReveal && s.cellAimed,
                  isBlockedCell && s.cellKeeper,
                  isGoalCell    && s.cellGoal,
                  isSavedCell   && s.cellSaved,
                ]}
                onPress={() => phase === 'aim' && setAimed(i)}
                activeOpacity={0.7}
              >
                {isBlockedCell && <Text style={{ fontSize: 26 }}>🧤</Text>}
                {isGoalCell    && <Text style={{ fontSize: 26 }}>⚽</Text>}
                {!isBlockedCell && !isGoalCell && !isSavedCell && (
                  <Text style={[s.cellArrow, isAimedNow && { color: '#facc15' }]}>
                    {ZONE_LABELS[i]}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={s.keeperPlatform} />
      </View>

      {/* Top */}
      <Animated.Text style={[s.ball, {
        transform: [{ translateY: ballY }, { translateX: ballX }, { scale: ballSc }],
      }]}>⚽</Animated.Text>

      {/* Kontrol */}
      <View style={s.controls}>
        {isReveal && (
          <Text style={[s.resultMsg, { color: !blocked.has(aimed) ? '#22c55e' : '#f85149' }]}>
            {!blocked.has(aimed) ? '🎉 GOL!' : '🧤 Kurtardı!'}
          </Text>
        )}
        <TouchableOpacity
          style={[s.shootBtn, (aimed === null || phase !== 'aim') && s.shootBtnDisabled]}
          onPress={shoot}
          disabled={aimed === null || phase !== 'aim'}
        >
          <Text style={s.shootBtnTxt}>
            {aimed === null ? 'Hedef seç ↑' : `⚽ VURUŞ! (Atış ${shotNumber}/${TOTAL_SHOTS})`}
          </Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#0d1f0d', alignItems: 'center' },
  center:   { flex: 1, backgroundColor: '#0d1f0d', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:      {
    width: '100%', alignItems: 'center',
    paddingTop: SAFE_TOP, paddingBottom: 10,
    backgroundColor: '#071507', borderBottomWidth: 1, borderColor: '#144a14',
  },
  hudTitle: { color: '#86efac', fontSize: 18, fontWeight: '900' },
  hudSub:   { color: '#4ade80', fontSize: 13, marginTop: 2 },
  shotDots: { flexDirection: 'row', gap: 6, marginTop: 6, flexWrap: 'wrap', justifyContent: 'center' },
  diffRow:  { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, width: '90%' },
  diffLabel:{ color: '#8b949e', fontSize: 11, fontWeight: '700', width: 44 },
  diffTrack:{ flex: 1, height: 6, backgroundColor: '#1a3a1a', borderRadius: 3, overflow: 'hidden' },
  diffFill: { height: '100%', backgroundColor: '#f97316', borderRadius: 3 },
  diffValue:{ color: '#8b949e', fontSize: 11, width: 28, textAlign: 'right' },
  goalArea: { flex: 1, justifyContent: 'flex-start', alignItems: 'center', paddingTop: 20, position: 'relative' },
  crossbar: { width: CELL_W * 3 + 24, height: 6, backgroundColor: '#e5e7eb', borderRadius: 3 },
  postLeft: {
    position: 'absolute', left: (SW / 2) - (CELL_W * 1.5) - 16, top: 26,
    width: 6, height: CELL_H * 3 + 6, backgroundColor: '#e5e7eb', borderRadius: 3,
  },
  postRight:{
    position: 'absolute', right: (SW / 2) - (CELL_W * 1.5) - 16, top: 26,
    width: 6, height: CELL_H * 3 + 6, backgroundColor: '#e5e7eb', borderRadius: 3,
  },
  blockHint:{ color: '#f97316', fontSize: 11, fontWeight: '700', marginTop: 4, marginBottom: 2, textAlign: 'center' },
  grid:     { flexDirection: 'row', flexWrap: 'wrap', width: CELL_W * 3, marginTop: 0 },
  cell:     { backgroundColor: '#14532d55', borderWidth: 1, borderColor: '#166534', justifyContent: 'center', alignItems: 'center' },
  cellAimed: { backgroundColor: '#facc1533', borderColor: '#facc15', borderWidth: 2 },
  cellKeeper:{ backgroundColor: '#b91c1c55', borderColor: '#f87171', borderWidth: 2 },
  cellGoal:  { backgroundColor: '#15803d55', borderColor: '#4ade80', borderWidth: 2 },
  cellSaved: { backgroundColor: '#b91c1c33', borderColor: '#ef4444', borderWidth: 2 },
  cellArrow: { color: '#4ade8088', fontSize: 18, fontWeight: '700' },
  keeperPlatform: { width: CELL_W * 3, height: 6, backgroundColor: '#166534', marginTop: 0 },
  ball:     { fontSize: 36, position: 'absolute', bottom: 120 },
  controls: {
    width: '100%', alignItems: 'center',
    paddingVertical: 16, paddingHorizontal: 24,
    backgroundColor: '#071507', borderTopWidth: 1, borderColor: '#144a14',
  },
  resultMsg:{ fontSize: 20, fontWeight: '900', marginBottom: 10 },
  shootBtn: {
    backgroundColor: '#15803d', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 14,
    ...(Platform.OS === 'android' ? { elevation: 4 } : { shadowColor: '#22c55e', shadowOpacity: 0.6, shadowRadius: 10 }),
  },
  shootBtnDisabled: { backgroundColor: '#1f2937', opacity: 0.5 },
  shootBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '900' },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  logRow:      { flexDirection: 'row', gap: 4, marginBottom: 16, flexWrap: 'wrap', justifyContent: 'center' },
  bonusBox:    {
    backgroundColor: '#052e16', borderRadius: 12, padding: 14, marginBottom: 18,
    width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#166534',
  },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#4ade80', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#16a34a', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
