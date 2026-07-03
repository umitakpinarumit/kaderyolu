/**
 * KosuGame — Koşu 🏃
 * Engellerin üzerinden atla! 20 engeli geç = zafer.
 * Karakter ekran solunda sabit, engeller sağdan gelir.
 * Dokun → atla. Engelle çarpışma = can kaybet.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 72;
const COURT_H = SH - HUD_H - CTRL_H;

const GOAL       = 20;
const LIVES      = 3;
const CHAR_X     = 70;
const CHAR_W     = 44;
const OBS_W      = 36;
const FLOOR_Y    = COURT_H - 40;   // karakterin normal Y (top)
const JUMP_Y     = COURT_H - 140;  // zıplayınca Y (top)
const JUMP_MS    = 420;
const HIT_TOL    = 22;             // yatay çarpışma toleransı
const OBS_SPEED_BASE = 280;        // px/s başlangıç
const OBS_SPEED_MAX  = 520;

const RCOLOR = '#f97316';

const OBSTACLES = ['🪨','🌵','🧱','🪵'];

const calcBonus = (s) => ({
  health:    s >= GOAL ? 5 : s >= 14 ? 4 : s >= 8 ? 3 : s >= 4 ? 2 : 1,
  endurance: s >= GOAL ? 5 : s >= 14 ? 4 : s >= 8 ? 3 : s >= 4 ? 2 : 1,
  agility:   s >= GOAL ? 4 : s >= 14 ? 3 : s >= 8 ? 2 : 1,
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

export default function KosuGame({ choice, onComplete }) {
  const [phase,       setPhase]      = useState('ready');
  const [lives,       setLives]      = useState(LIVES);
  const [score,       setScore]      = useState(0);
  const [isJumping,   setIsJumping]  = useState(false);
  const [hitTrigger,  setHitTrigger] = useState(0);
  const [missTrigger, setMissTrigger]= useState(0);
  const [result,      setResult]     = useState(0);
  const [obsIcon,     setObsIcon]    = useState('🪨');

  const charY    = useRef(new Animated.Value(FLOOR_Y)).current;
  const obsX     = useRef(new Animated.Value(SW)).current;
  const shakeAnim= useRef(new Animated.Value(0)).current;

  const phaseRef   = useRef('ready');
  const livesRef   = useRef(LIVES);
  const scoreRef   = useRef(0);
  const jumpRef    = useRef(false);   // şu an zıplıyor mu
  const charYRef   = useRef(FLOOR_Y);
  const obsXRef    = useRef(SW);
  const obsAnimRef = useRef(null);
  const collideRef = useRef(null);
  const jumpAnimRef= useRef(null);
  const hitLock    = useRef(false);

  useEffect(() => {
    const id1 = charY.addListener(({ value }) => { charYRef.current = value; });
    const id2 = obsX.addListener(({ value }) => { obsXRef.current = value; });
    return () => { charY.removeListener(id1); obsX.removeListener(id2); };
  }, []);

  const stopAll = useCallback(() => {
    obsAnimRef.current?.stop();
    jumpAnimRef.current?.stop();
    clearInterval(collideRef.current);
    charY.removeAllListeners();
    obsX.removeAllListeners();
  }, []);

  const spawnObstacle = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    const icon  = OBSTACLES[Math.floor(Math.random() * OBSTACLES.length)];
    setObsIcon(icon);
    obsXRef.current = SW + OBS_W;
    obsX.setValue(SW + OBS_W);

    const speed = Math.min(OBS_SPEED_MAX, OBS_SPEED_BASE + scoreRef.current * 12);
    const dur   = Math.round(((SW + OBS_W + CHAR_W) / speed) * 1000);

    obsAnimRef.current = Animated.timing(obsX, {
      toValue: -OBS_W - 10, duration: dur, easing: Easing.linear, useNativeDriver: true,
    });
    obsAnimRef.current.start(({ finished }) => {
      if (finished && phaseRef.current === 'playing') {
        // geçirildi
        scoreRef.current += 1;
        setScore(scoreRef.current);
        setHitTrigger(t => t + 1);
        if (scoreRef.current >= GOAL) {
          stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('win');
        } else {
          const gap = Math.max(600, 1400 - scoreRef.current * 30);
          setTimeout(spawnObstacle, gap);
        }
      }
    });
  }, [stopAll]);

  const startCollision = useCallback(() => {
    clearInterval(collideRef.current);
    collideRef.current = setInterval(() => {
      if (phaseRef.current !== 'playing' || hitLock.current) return;
      const cx  = CHAR_X;
      const ox  = obsXRef.current;
      const cy  = charYRef.current;   // top of char
      const oy  = FLOOR_Y;            // top of obstacle (always on floor)
      const xOk = ox < cx + CHAR_W - HIT_TOL && ox + OBS_W > cx + HIT_TOL;
      const yOk = cy + CHAR_W > oy + 4;  // char bottom vs obs top
      if (xOk && yOk) {
        hitLock.current = true;
        obsAnimRef.current?.stop();
        clearInterval(collideRef.current);
        livesRef.current -= 1;
        setLives(livesRef.current);
        setMissTrigger(t => t + 1);
        Animated.sequence([
          Animated.timing(shakeAnim, { toValue:  9, duration: 45, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue: -9, duration: 45, useNativeDriver: true }),
          Animated.timing(shakeAnim, { toValue:  0, duration: 35, useNativeDriver: true }),
        ]).start();
        if (livesRef.current <= 0) {
          stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('lose');
        } else {
          setTimeout(() => {
            hitLock.current = false;
            startCollision();
            spawnObstacle();
          }, 900);
        }
      }
    }, 16);
  }, [spawnObstacle, stopAll]);

  const doJump = useCallback(() => {
    if (phaseRef.current !== 'playing' || jumpRef.current) return;
    jumpRef.current = true;
    setIsJumping(true);
    jumpAnimRef.current?.stop();
    jumpAnimRef.current = Animated.sequence([
      Animated.timing(charY, { toValue: JUMP_Y, duration: JUMP_MS / 2, easing: Easing.out(Easing.quad), useNativeDriver: false }),
      Animated.timing(charY, { toValue: FLOOR_Y, duration: JUMP_MS / 2, easing: Easing.in(Easing.quad),  useNativeDriver: false }),
    ]);
    jumpAnimRef.current.start(() => { jumpRef.current = false; setIsJumping(false); });
  }, []);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; scoreRef.current = 0;
    hitLock.current = false; jumpRef.current = false;
    setPhase('playing'); setLives(LIVES); setScore(0); setResult(null); setIsJumping(false);
    charY.setValue(FLOOR_Y); obsX.setValue(SW + OBS_W);
    const id1 = charY.addListener(({ value }) => { charYRef.current = value; });
    const id2 = obsX.addListener(({ value }) => { obsXRef.current = value; });
    spawnObstacle();
    startCollision();
  }, [spawnObstacle, startCollision]);

  useEffect(() => () => stopAll(), []);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🏃</Text>
      <Text style={s.bigTitle}>Koşu Parkuru</Text>
      <Text style={s.sub}>Engellerin üzerinden atla!</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '🪨', text: 'Engeller sağdan gelir, yaklaşınca atla' },
          { icon: '👆', text: 'Ekrana dokun → Atla' },
          { icon: '🏆', text: `${GOAL} engeli geç → Zafer!` },
          { icon: '❤️', text: `${LIVES} can — çarpınca azalır` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🏃  Koş!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(scoreRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Koşu Ustası!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${GOAL} engeli geçtin — harika!` : `${scoreRef.current} engeli geçtin.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{scoreRef.current}</Text><Text style={s.statL}>🪨 Engel</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{livesRef.current}/{LIVES}</Text><Text style={s.statL}>❤️ Can</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🏃 Kazanılan Bonuslar</Text>
          {b.health    > 0 && <Text style={s.bonusLine}>💪 Sağlık +{b.health}</Text>}
          {b.endurance > 0 && <Text style={s.bonusLine}>🏃 Dayanıklılık +{b.endurance}</Text>}
          {b.agility   > 0 && <Text style={s.bonusLine}>⚡ Çeviklik +{b.agility}</Text>}
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
          <View><Text style={s.hudLabel}>ENGEL</Text><Text style={s.hudBig}>{score}/{GOAL}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>🏃 Koşu</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>CAN</Text>
            <Text style={[s.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={s.progressBar}><View style={[s.progressFill, { width: `${(score / GOAL) * 100}%` }]} /></View>
      </View>

      <TouchableOpacity style={s.court} onPress={doJump} activeOpacity={1}>
        {/* Zemin */}
        <View style={s.floor} />
        {/* Arka plan */}
        <Text style={[s.deco, { left: '60%', top: 30 }]}>☁️</Text>
        <Text style={[s.deco, { left: '20%', top: 60 }]}>☁️</Text>

        {/* Karakter */}
        <Animated.Text style={[s.char, { top: charY }]}>
          {isJumping ? '🙆' : '🏃'}
        </Animated.Text>

        {/* Engel */}
        <Animated.Text style={[s.obs, { transform: [{ translateX: obsX }] }]}>
          {obsIcon}
        </Animated.Text>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </TouchableOpacity>

      <View style={s.ctrl}>
        <Text style={s.ctrlHint}>👆 Dokun → Atla!</Text>
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#061018' },
  center:       { flex: 1, backgroundColor: '#061018', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#091520', borderBottomWidth: 1, borderBottomColor: '#1e3a5f' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#3a6b9a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#1e3a5f', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#0a1c2e', position: 'relative', overflow: 'hidden' },
  floor:        { position: 'absolute', bottom: 0, left: 0, right: 0, height: 20, backgroundColor: '#5c4a2a', borderTopWidth: 2, borderTopColor: '#8b6a3a' },
  deco:         { position: 'absolute', fontSize: 28, opacity: 0.3 },
  char:         { position: 'absolute', left: CHAR_X, fontSize: 42 },
  obs:          { position: 'absolute', top: FLOOR_Y, left: 0, fontSize: 38 },
  ctrl:         { height: CTRL_H, backgroundColor: '#091520', borderTopWidth: 1, borderTopColor: '#1e3a5f', justifyContent: 'center', alignItems: 'center' },
  ctrlHint:     { color: '#e6edf3', fontSize: 15, fontWeight: '800' },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#091520', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1e3a5f' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#c2410c', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#091520', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1e3a5f' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#3a6b9a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#091520', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
