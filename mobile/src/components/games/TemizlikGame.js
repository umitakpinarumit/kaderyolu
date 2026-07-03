/**
 * TemizlikGame — Temizlik Planı 🧹
 * Ekranda beliren kirli eşyalara dokun ve temizle!
 * 20 eşya temizleme = zafer · Süre dolunca can azalır
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H   = SAFE_TOP + 56;
const CTRL_H  = 68;
const COURT_H = SH - HUD_H - CTRL_H;

const GOAL       = 20;
const LIVES      = 3;
const ITEM_LIFE  = 4000;   // ms — süre dolunca can gider
const MAX_ITEMS  = 5;
const RCOLOR     = '#a3e635';

const DIRT_ICONS = ['🧦','🍽️','📦','🗑️','🧴','📰','🐾','🧸','🥾','🪣'];

const calcBonus = (s) => ({
  discipline: s >= GOAL ? 4 : s >= 14 ? 3 : s >= 8 ? 2 : 1,
  health:     s >= GOAL ? 4 : s >= 14 ? 3 : s >= 8 ? 2 : 1,
  confidence: s >= GOAL ? 3 : s >= 14 ? 2 : 1,
});

function DirtItem({ item, onTap }) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const timerAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
    Animated.timing(timerAnim, { toValue: 0, duration: ITEM_LIFE, useNativeDriver: false }).start();
  }, []);

  const timerColor = timerAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: ['#ef4444', '#f97316', RCOLOR],
  });

  return (
    <TouchableOpacity
      style={[gs.item, { left: item.x, top: item.y }]}
      onPress={() => onTap(item.id)}
      activeOpacity={0.7}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }], alignItems: 'center' }}>
        <Text style={gs.itemIcon}>{item.icon}</Text>
        <Animated.View style={[gs.timerBar, { width: timerAnim.interpolate({ inputRange: [0,1], outputRange: ['0%','100%'] }), backgroundColor: timerColor }]} />
      </Animated.View>
    </TouchableOpacity>
  );
}

function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.45, duration: 40, useNativeDriver: true }),
      Animated.timing(op, { toValue: 0, duration: 280, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

export default function TemizlikGame({ choice, onComplete }) {
  const [phase,        setPhase]        = useState('ready');
  const [lives,        setLives]        = useState(LIVES);
  const [score,        setScore]        = useState(0);
  const [items,        setItems]        = useState([]);
  const [hitTrigger,   setHitTrigger]   = useState(0);
  const [missTrigger,  setMissTrigger]  = useState(0);
  const [result,       setResult]       = useState(null);

  const phaseRef   = useRef('ready');
  const livesRef   = useRef(LIVES);
  const scoreRef   = useRef(0);
  const itemsRef   = useRef([]);
  const spawnTimer = useRef(null);
  const checkTimer = useRef(null);
  const nextId     = useRef(0);

  const stopAll = useCallback(() => {
    clearInterval(spawnTimer.current);
    clearInterval(checkTimer.current);
  }, []);

  const removeItem = useCallback((id, reason) => {
    itemsRef.current = itemsRef.current.filter(i => i.id !== id);
    setItems([...itemsRef.current]);

    if (reason === 'tap') {
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setHitTrigger(t => t + 1);
      if (scoreRef.current >= GOAL) {
        stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('win');
      }
    } else {
      // expired
      livesRef.current -= 1;
      setLives(livesRef.current);
      setMissTrigger(t => t + 1);
      if (livesRef.current <= 0) {
        stopAll(); phaseRef.current = 'done'; setPhase('done'); setResult('lose');
      }
    }
  }, [stopAll]);

  const spawnItem = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    if (itemsRef.current.length >= MAX_ITEMS) return;

    const id   = nextId.current++;
    const icon = DIRT_ICONS[Math.floor(Math.random() * DIRT_ICONS.length)];
    const x    = 20 + Math.random() * (SW - 80);
    const y    = 20 + Math.random() * (COURT_H - 100);
    const item = { id, icon, x, y, spawnTime: Date.now() };

    itemsRef.current = [...itemsRef.current, item];
    setItems([...itemsRef.current]);
  }, []);

  useEffect(() => {
    if (phase !== 'playing') return;
    // Eşya kontrol: süresi dolanları kaldır
    checkTimer.current = setInterval(() => {
      if (phaseRef.current !== 'playing') return;
      const now     = Date.now();
      const expired = itemsRef.current.filter(i => now - i.spawnTime >= ITEM_LIFE);
      expired.forEach(i => removeItem(i.id, 'expire'));
    }, 200);

    // Yeni eşya spawn
    spawnItem();
    spawnTimer.current = setInterval(() => {
      if (phaseRef.current !== 'playing') return;
      const interval = Math.max(800, 1600 - scoreRef.current * 40);
      spawnItem();
    }, 1200);

    return () => stopAll();
  }, [phase, spawnItem, removeItem, stopAll]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; scoreRef.current = 0;
    itemsRef.current = []; nextId.current = 0;
    setPhase('playing'); setLives(LIVES); setScore(0);
    setItems([]); setResult(null);
  }, []);

  useEffect(() => () => stopAll(), []);

  if (phase === 'ready') return (
    <View style={gs.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🧹</Text>
      <Text style={gs.bigTitle}>Evi Temizle!</Text>
      <Text style={gs.sub}>Ekranda beliren kirli eşyalara dokun, temizle!</Text>
      <View style={gs.rulesBox}>
        {[
          { icon: '🧦', text: 'Dağınık eşyalar belirir — hemen dokun!' },
          { icon: '⏱️', text: 'Her eşyanın 4 saniyesi var — kaçırma!' },
          { icon: '🏆', text: `${GOAL} eşya temizle → Zafer!` },
          { icon: '❤️', text: `${LIVES} can — süresi dolan her eşya can alır` },
        ].map((r, i) => (
          <View key={i} style={gs.ruleRow}>
            <Text style={gs.ruleIcon}>{r.icon}</Text>
            <Text style={gs.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={gs.startBtn} onPress={launch}>
        <Text style={gs.startBtnTxt}>🧹  Temizle!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(scoreRef.current);
    return (
      <View style={gs.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={gs.bigTitle}>{won ? 'Pırıl Pırıl!' : 'Oyun Bitti'}</Text>
        <Text style={gs.sub}>{won ? `${GOAL} eşya temizlendi — ev tertemiz!` : `${scoreRef.current} eşyayı temizledin.`}</Text>
        <View style={gs.statsRow}>
          <View style={gs.statChip}><Text style={gs.statV}>{scoreRef.current}</Text><Text style={gs.statL}>🧹 Temiz</Text></View>
          <View style={gs.statChip}><Text style={gs.statV}>{livesRef.current}/{LIVES}</Text><Text style={gs.statL}>❤️ Can</Text></View>
        </View>
        <View style={gs.bonusBox}>
          <Text style={gs.bonusTitle}>🧹 Kazanılan Bonuslar</Text>
          {b.discipline > 0 && <Text style={gs.bonusLine}>📐 Disiplin +{b.discipline}</Text>}
          {b.health     > 0 && <Text style={gs.bonusLine}>💪 Sağlık +{b.health}</Text>}
          {b.confidence > 0 && <Text style={gs.bonusLine}>⚡ Güven +{b.confidence}</Text>}
        </View>
        <TouchableOpacity style={gs.startBtn} onPress={() => onComplete(b)}>
          <Text style={gs.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={gs.screen}>
      <View style={gs.hud}>
        <View style={gs.hudRow}>
          <View><Text style={gs.hudLabel}>TEMİZ</Text><Text style={gs.hudBig}>{score}/{GOAL}</Text></View>
          <View style={gs.hudCenter}><Text style={gs.hudTitle}>🧹 Temizlik</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={gs.hudLabel}>CAN</Text>
            <Text style={[gs.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={gs.progressBar}><View style={[gs.progressFill, { width: `${(score / GOAL) * 100}%` }]} /></View>
      </View>

      <View style={gs.court}>
        <Text style={[gs.deco, { left: 10, top: 20 }]}>🛋️</Text>
        <Text style={[gs.deco, { right: 10, bottom: 30 }]}>🪴</Text>

        {items.map(item => (
          <DirtItem key={item.id} item={item} onTap={id => removeItem(id, 'tap')} />
        ))}

        <Flash color="#a3e635" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>

      <View style={gs.ctrl}>
        <Text style={gs.ctrlHint}>🧹 Kirli eşyalara dokun — temizle!</Text>
      </View>
    </View>
  );
}

const gs = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#0a140a' },
  center:       { flex: 1, backgroundColor: '#0a140a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0e1c0e', borderBottomWidth: 1, borderBottomColor: '#2a5a1a' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#3a7a2a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#2a5a1a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#0c1a0c', position: 'relative', overflow: 'hidden' },
  deco:         { position: 'absolute', fontSize: 32, opacity: 0.15 },
  item:         { position: 'absolute', alignItems: 'center' },
  itemIcon:     { fontSize: 40 },
  timerBar:     { height: 4, borderRadius: 2, marginTop: 3, width: '100%' },
  ctrl:         { height: CTRL_H, backgroundColor: '#0e1c0e', borderTopWidth: 1, borderTopColor: '#2a5a1a', justifyContent: 'center', alignItems: 'center' },
  ctrlHint:     { color: '#e6edf3', fontSize: 14, fontWeight: '700' },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#0e1c0e', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#2a5a1a' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#4d7c0f', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#0e1c0e', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#2a5a1a' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#3a7a2a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0e1c0e', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a5a1a' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
