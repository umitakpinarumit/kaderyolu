/**
 * SokakOyunuGame — Sokak Oyunları 🪢
 * İp atlama zamanlama oyunu.
 * İp tam alta inince DOKUN → atla!
 * 15 başarılı atlama = Zafer!
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');

const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 80;
const COURT_H = SH - HUD_H - CTRL_H;

const GOAL  = 15;
const LIVES = 3;

// İp hareketi
const PERIOD_BASE = 1600; // ms — tam tur (aşağı + yukarı)
const PERIOD_MIN  = 700;

// İpin en altta olduğu bölge (COURT_H'e göre)
const ROPE_LOW_Y  = COURT_H * 0.72; // ip bu Y'ye inince "tehlike bölgesi"
const HIT_OPEN_Y  = COURT_H * 0.62; // pencere başlangıcı
const HIT_CLOSE_Y = COURT_H * 0.82; // pencere kapanması

// Karakter
const CHAR_BASE_Y = COURT_H * 0.78; // karakter normal Y (top)
const CHAR_JUMP_Y = COURT_H * 0.52; // karakter zıplayınca

const RCOLOR = '#22d3ee';

const calcBonus = (score) => ({
  agility:  score >= GOAL ? 6 : score >= 10 ? 5 : score >= 6 ? 4 : score >= 3 ? 3 : 2,
  health:   score >= GOAL ? 5 : score >= 10 ? 4 : score >= 6 ? 3 : score >= 3 ? 2 : 1,
  social:   score >= GOAL ? 4 : score >= 10 ? 3 : score >= 6 ? 2 : 1,
});

// ─── Flash ────────────────────────────────────────────────────────────────────
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
  return (
    <Animated.View pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────
export default function SokakOyunuGame({ choice, onComplete }) {
  const [phase,        setPhase]        = useState('ready');
  const [lives,        setLives]        = useState(LIVES);
  const [score,        setScore]        = useState(0);
  const [inWindow,     setInWindow]     = useState(false);
  const [isJumping,    setIsJumping]    = useState(false);
  const [hitTrigger,   setHitTrigger]   = useState(0);
  const [missTrigger,  setMissTrigger]  = useState(0);
  const [result,       setResult]       = useState(null);

  // Animated değerler
  const ropeY    = useRef(new Animated.Value(0)).current;         // ipin merkez Y'si
  const charY    = useRef(new Animated.Value(CHAR_BASE_Y)).current;
  const ropeSwing= useRef(new Animated.Value(0)).current;         // sol/sağ uçların açısı
  const shakeAnim= useRef(new Animated.Value(0)).current;

  // Mutable ref'ler
  const phaseRef  = useRef('ready');
  const livesRef  = useRef(LIVES);
  const scoreRef  = useRef(0);
  const ryRef     = useRef(0);     // ropeY güncel değeri
  const inWinRef  = useRef(false);
  const hitLock   = useRef(false);
  const periodRef = useRef(PERIOD_BASE);
  const ropeAnimRef = useRef(null);

  // ropeY takibi
  useEffect(() => {
    const id = ropeY.addListener(({ value }) => {
      ryRef.current = value;
      const entering = value >= HIT_OPEN_Y;
      if (entering !== inWinRef.current) {
        inWinRef.current = entering;
        setInWindow(entering);
      }
    });
    return () => ropeY.removeListener(id);
  }, []);

  // ── İp animasyonu ─────────────────────────────────────────────────────────
  const startRope = useCallback((period) => {
    ropeAnimRef.current?.stop();
    ropeY.setValue(0);
    ropeSwing.setValue(-1);

    ropeAnimRef.current = Animated.loop(
      Animated.sequence([
        // Aşağı in (0 → ROPE_LOW_Y)
        Animated.parallel([
          Animated.timing(ropeY, {
            toValue: ROPE_LOW_Y, duration: period / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
          Animated.timing(ropeSwing, {
            toValue: 1, duration: period / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
        ]),
        // Yukarı çık (ROPE_LOW_Y → 0)
        Animated.parallel([
          Animated.timing(ropeY, {
            toValue: 0, duration: period / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
          Animated.timing(ropeSwing, {
            toValue: -1, duration: period / 2,
            easing: Easing.inOut(Easing.sin), useNativeDriver: false,
          }),
        ]),
      ])
    );
    ropeAnimRef.current.start();
  }, []);

  const stopAll = useCallback(() => {
    ropeAnimRef.current?.stop();
    ropeY.removeAllListeners();
  }, []);

  // ── Atlama ────────────────────────────────────────────────────────────────
  const doJump = useCallback(() => {
    if (phaseRef.current !== 'playing' || hitLock.current) return;
    hitLock.current = true;

    const ry = ryRef.current;

    if (ry >= HIT_OPEN_Y && ry <= HIT_CLOSE_Y) {
      // ── HIT ─────────────────────────────────────────────────────────────
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHitTrigger(t => t + 1);
      setIsJumping(true);

      // Karakter zıplama animasyonu
      Animated.sequence([
        Animated.timing(charY, { toValue: CHAR_JUMP_Y, duration: 180, easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(charY, { toValue: CHAR_BASE_Y, duration: 220, easing: Easing.in(Easing.quad),  useNativeDriver: false }),
      ]).start(() => {
        setIsJumping(false);
        hitLock.current = false;
      });

      if (scoreRef.current >= GOAL) {
        stopAll();
        phaseRef.current = 'done';
        setPhase('done');
        setResult('win');
        return;
      }

      // Her 5 atlamada hızlan
      if (scoreRef.current % 5 === 0) {
        periodRef.current = Math.max(PERIOD_MIN, periodRef.current * 0.82);
        stopAll();
        setTimeout(() => {
          if (phaseRef.current === 'playing') startRope(periodRef.current);
        }, 50);
      }
    } else {
      // ── MISS ─────────────────────────────────────────────────────────────
      livesRef.current -= 1;
      setLives(livesRef.current);
      setMissTrigger(t => t + 1);

      Animated.sequence([
        Animated.timing(shakeAnim, { toValue:  8, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 45, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  4, duration: 35, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
      ]).start();

      if (livesRef.current <= 0) {
        stopAll();
        phaseRef.current = 'done';
        setPhase('done');
        setResult('lose');
        return;
      }

      setTimeout(() => { hitLock.current = false; }, 400);
    }
  }, [startRope, stopAll]);

  // ── Oyunu başlat ──────────────────────────────────────────────────────────
  const launch = useCallback(() => {
    phaseRef.current  = 'playing';
    livesRef.current  = LIVES;
    scoreRef.current  = 0;
    periodRef.current = PERIOD_BASE;
    hitLock.current   = false;
    setPhase('playing');
    setLives(LIVES);
    setScore(0);
    setResult(null);
    setInWindow(false);
    setIsJumping(false);
    charY.setValue(CHAR_BASE_Y);
    startRope(PERIOD_BASE);
  }, [startRope]);

  useEffect(() => () => stopAll(), []);

  // ─── HAZIR ────────────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>🪢</Text>
        <Text style={s.bigTitle}>İp Atlama</Text>
        <Text style={s.sub}>İp tam alta inince dokun — atla!</Text>
        <View style={s.rulesBox}>
          {[
            { icon: '🪢', text: 'İp aşağı–yukarı sallanır' },
            { icon: '👆', text: 'İp en alta indiğinde ekrana DOKUN' },
            { icon: '🟡', text: 'Sarı bölge = atlama zamanı!' },
            { icon: '🏆', text: `${GOAL} başarılı atlama → Zafer!` },
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
        <Text style={s.bigTitle}>{won ? 'Süper!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>
          {won ? `${GOAL} atlama! Sokağın yıldızısın!` : `${scoreRef.current} atlama yaptın.`}
        </Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{scoreRef.current}</Text><Text style={s.statL}>🪢 Atlama</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🪢 Kazanılan Bonuslar</Text>
          {bonus.agility > 0 && <Text style={s.bonusLine}>🏃 Çeviklik +{bonus.agility}</Text>}
          {bonus.health  > 0 && <Text style={s.bonusLine}>💪 Sağlık +{bonus.health}</Text>}
          {bonus.social  > 0 && <Text style={s.bonusLine}>👫 Sosyallik +{bonus.social}</Text>}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(bonus)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── OYUN ─────────────────────────────────────────────────────────────────
  return (
    <Animated.View style={[s.screen, { transform: [{ translateX: shakeAnim }] }]}>
      {/* HUD */}
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View>
            <Text style={s.hudLabel}>ATLAMA</Text>
            <Text style={s.hudBig}>{score} / {GOAL}</Text>
          </View>
          <View style={s.hudCenter}>
            <Text style={s.hudTitle}>🪢 Sokak Oyunu</Text>
            <Text style={s.hudSpeed}>
              ⚡ {Math.round(PERIOD_BASE / Math.max(periodRef.current, 1))}x Hız
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>
              {'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}
            </Text>
          </View>
        </View>
        <View style={s.progressBar}>
          <View style={[s.progressFill, { width: `${(score / GOAL) * 100}%` }]} />
        </View>
      </View>

      {/* Saha */}
      <TouchableOpacity style={s.court} onPress={doJump} activeOpacity={1}>
        {/* Zemin */}
        <View style={s.floor} />

        {/* Arka plan süsü */}
        <Text style={[s.deco, { left: 10,  top: 30 }]}>🌳</Text>
        <Text style={[s.deco, { right: 10, top: 30 }]}>🌳</Text>
        <Text style={[s.deco, { left: 20,  bottom: 40 }]}>🌼</Text>
        <Text style={[s.deco, { right: 20, bottom: 40 }]}>🌼</Text>

        {/* Atlama zamanı göstergesi */}
        {inWindow && (
          <View style={s.windowBanner}>
            <Text style={s.windowText}>⬆️  ATLA!</Text>
          </View>
        )}

        {/* İpin sol direği */}
        <View style={s.poleLeft} />
        {/* İpin sağ direği */}
        <View style={s.poleRight} />

        {/* İp (iki direkten merkeze sarkıyor) */}
        <Animated.View style={[s.ropeCenter, {
          top: ropeY,
          backgroundColor: inWindow ? '#fbbf24' : RCOLOR,
        }]} />
        {/* Sol ip segmenti */}
        <Animated.View style={[s.ropeLeft, {
          top: ropeY,
          backgroundColor: inWindow ? '#fbbf24' : RCOLOR,
        }]} />
        {/* Sağ ip segmenti */}
        <Animated.View style={[s.ropeRight, {
          top: ropeY,
          backgroundColor: inWindow ? '#fbbf24' : RCOLOR,
        }]} />

        {/* Karakter */}
        <Animated.Text style={[s.character, { top: charY }]}>
          {isJumping ? '🙆' : '🧍'}
        </Animated.Text>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </TouchableOpacity>

      {/* Kontrol */}
      <View style={s.ctrl}>
        <Text style={[s.ctrlMain, inWindow && { color: '#fbbf24' }]}>
          {inWindow ? '⬆️  Atla! — DOKUN!' : '👀 İpi izle — tam alta inince dokun'}
        </Text>
      </View>
    </Animated.View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const POLE_X = SW * 0.12;  // direklerin X merkezi

const s = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#0a1628' },
  center:  { flex: 1, backgroundColor: '#0a1628', alignItems: 'center', justifyContent: 'center', padding: 24 },

  hud:         { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0d1d35', borderBottomWidth: 1, borderBottomColor: '#1e3a5f' },
  hudRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:    { color: '#3a6b9a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:      { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:   { alignItems: 'center' },
  hudTitle:    { color: RCOLOR, fontSize: 13, fontWeight: '900' },
  hudSpeed:    { color: '#fbbf24', fontSize: 10, marginTop: 1 },
  progressBar: { height: 5, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },

  court:  { flex: 1, backgroundColor: '#0e2040', position: 'relative', overflow: 'hidden' },
  floor:  { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: '#1a3a1a', borderTopWidth: 2, borderTopColor: '#2d5c2d' },
  deco:   { position: 'absolute', fontSize: 26, opacity: 0.3 },

  windowBanner: {
    position: 'absolute', top: COURT_H * 0.42, left: 0, right: 0,
    alignItems: 'center',
  },
  windowText: {
    color: '#fbbf24', fontSize: 18, fontWeight: '900', letterSpacing: 1,
    textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 4,
  },

  // Direkler
  poleLeft:  { position: 'absolute', left: POLE_X - 5,    bottom: 20, width: 10, height: COURT_H * 0.72, backgroundColor: '#92400e', borderRadius: 4 },
  poleRight: { position: 'absolute', right: POLE_X - 5,   bottom: 20, width: 10, height: COURT_H * 0.72, backgroundColor: '#92400e', borderRadius: 4 },

  // İp parçaları
  ropeCenter: { position: 'absolute', left: SW * 0.3, width: SW * 0.40, height: 6, borderRadius: 3 },
  ropeLeft:   { position: 'absolute', left: POLE_X,   width: SW * 0.18, height: 4, borderRadius: 2, opacity: 0.7 },
  ropeRight:  { position: 'absolute', right: POLE_X,  width: SW * 0.18, height: 4, borderRadius: 2, opacity: 0.7 },

  // Karakter
  character: { position: 'absolute', fontSize: 42, alignSelf: 'center', left: 0, right: 0, textAlign: 'center' },

  ctrl:     { height: CTRL_H, backgroundColor: '#0d1d35', borderTopWidth: 1, borderTopColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center', gap: 4 },
  ctrlMain: { color: '#e6edf3', fontSize: 14, fontWeight: '800', textAlign: 'center' },

  bigTitle:    { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:         { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:    { backgroundColor: '#0d1d35', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  ruleRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:    { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:    { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:    { backgroundColor: '#0ea5e9', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt: { color: '#fff', fontSize: 17, fontWeight: '900' },

  statsRow:    { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:    { backgroundColor: '#0d1d35', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1e3a5f' },
  statV:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:       { color: '#3a6b9a', fontSize: 10, marginTop: 2 },
  bonusBox:    { backgroundColor: '#0d1d35', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:   { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
