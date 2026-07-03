/**
 * KodlamaGame — Kodlama 💻
 * Kod bloklarını doğru sıraya diz!
 * Günlük görevin adımları karışık verilir,
 * mantıklı sırayı bul ve blokları sırayla dokun.
 * 6 görev = zafer · 3 hata = oyun bitti
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H  = SAFE_TOP + 56;
const GOAL   = 6;
const LIVES  = 3;
const RCOLOR = '#818cf8';

const PUZZLES = [
  { icon: '🍕', title: 'Pizza Yap', steps: ['Hamuru aç', 'Sos sür', 'Peynir ekle', 'Fırına koy'] },
  { icon: '🌱', title: 'Çiçek Dik', steps: ['Toprak hazırla', 'Tohum ek', 'Su ver', 'Güneşe koy'] },
  { icon: '📧', title: 'E-posta Gönder', steps: ['Programı aç', 'Alıcı yaz', 'Mesaj yaz', 'Gönder'] },
  { icon: '🚗', title: 'Araba Çalıştır', steps: ['Anahtarı al', 'Emniyet tak', 'Kontağı aç', 'Vitese geç'] },
  { icon: '🧁', title: 'Kek Yap', steps: ['Malzeme tart', 'Karıştır', 'Kaba dök', 'Fırına ver'] },
  { icon: '💻', title: 'Kod Çalıştır', steps: ['Editörü aç', 'Kod yaz', 'Kaydet', 'Çalıştır'] },
  { icon: '🛁', title: 'Banyo Yap', steps: ['Suyu aç', 'Soyun', 'Yıkan', 'Kurula'] },
  { icon: '🎒', title: 'Okula Hazırlan', steps: ['Erken kalk', 'Kahvaltı yap', 'Çantayı al', 'Eve kilidi vur'] },
];

const calcBonus = (s) => ({
  intelligence: s >= GOAL ? 5 : s >= 4 ? 4 : s >= 2 ? 3 : 2,
  focus:        s >= GOAL ? 4 : s >= 4 ? 3 : s >= 2 ? 2 : 1,
  creativity:   s >= GOAL ? 3 : s >= 4 ? 2 : 1,
});

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

function BlockBtn({ text, order, onPress, disabled }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 60, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1,    duration: 80, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <TouchableOpacity onPress={press} disabled={disabled} activeOpacity={0.8}>
      <Animated.View style={[
        k.block,
        order !== null && { borderColor: RCOLOR, backgroundColor: RCOLOR + '22' },
        disabled && { opacity: 0.5 },
        { transform: [{ scale }] },
      ]}>
        {order !== null && (
          <View style={k.orderBadge}><Text style={k.orderNum}>{order + 1}</Text></View>
        )}
        <Text style={k.blockText}>{text}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function KodlamaGame({ choice, onComplete }) {
  const [phase,       setPhase]      = useState('ready');
  const [lives,       setLives]      = useState(LIVES);
  const [solved,      setSolved]     = useState(0);
  const [puzzle,      setPuzzle]     = useState(null);    // {icon,title,shuffled:[{text,correctIdx}]}
  const [tapped,      setTapped]     = useState([]);      // tıklanan shuffled indexleri (sırayla)
  const [hitTrigger,  setHitTrigger] = useState(0);
  const [missTrigger, setMissTrigger]= useState(0);
  const [result,      setResult]     = useState(null);
  const [feedback,    setFeedback]   = useState('');      // 'correct' | 'wrong' | ''

  const phaseRef  = useRef('ready');
  const livesRef  = useRef(LIVES);
  const solvedRef = useRef(0);
  const lockRef   = useRef(false);
  const usedPuzz  = useRef(new Set());

  const getNextPuzzle = useCallback(() => {
    const available = PUZZLES.filter((_, i) => !usedPuzz.current.has(i));
    const pool = available.length > 0 ? available : PUZZLES;
    const p = pool[Math.floor(Math.random() * pool.length)];
    const idx = PUZZLES.indexOf(p);
    usedPuzz.current.add(idx);

    // Karıştır
    const shuffled = p.steps
      .map((text, correctIdx) => ({ text, correctIdx }))
      .sort(() => Math.random() - 0.5);

    return { icon: p.icon, title: p.title, steps: p.steps, shuffled };
  }, []);

  const nextPuzzle = useCallback(() => {
    lockRef.current = false;
    setTapped([]);
    setFeedback('');
    setPuzzle(getNextPuzzle());
  }, [getNextPuzzle]);

  const handleTap = useCallback((shuffledIdx) => {
    if (lockRef.current || phaseRef.current !== 'playing') return;
    if (tapped.includes(shuffledIdx)) return;

    const newTapped = [...tapped, shuffledIdx];
    setTapped(newTapped);

    const pos = newTapped.length - 1;  // bu kaçıncı tıklama (0-based)
    const block = puzzle.shuffled[shuffledIdx];

    if (block.correctIdx === pos) {
      // Doğru sıra
      setHitTrigger(t => t + 1);
      if (newTapped.length === 4) {
        // Görev tamam!
        lockRef.current = true;
        setFeedback('correct');
        solvedRef.current += 1;
        setSolved(solvedRef.current);

        if (solvedRef.current >= GOAL) {
          setTimeout(() => { phaseRef.current = 'done'; setPhase('done'); setResult('win'); }, 700);
        } else {
          setTimeout(nextPuzzle, 900);
        }
      }
    } else {
      // Yanlış sıra
      lockRef.current = true;
      setMissTrigger(t => t + 1);
      setFeedback('wrong');
      livesRef.current -= 1;
      setLives(livesRef.current);

      if (livesRef.current <= 0) {
        setTimeout(() => { phaseRef.current = 'done'; setPhase('done'); setResult('lose'); }, 800);
      } else {
        setTimeout(nextPuzzle, 900);
      }
    }
  }, [tapped, puzzle, nextPuzzle]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing'; livesRef.current = LIVES; solvedRef.current = 0;
    usedPuzz.current.clear(); lockRef.current = false;
    setPhase('playing'); setLives(LIVES); setSolved(0);
    setResult(null); setTapped([]); setFeedback('');
    setPuzzle(getNextPuzzle());
  }, [getNextPuzzle]);

  if (phase === 'ready') return (
    <View style={k.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>💻</Text>
      <Text style={k.bigTitle}>Kod Bloklarını Sırala</Text>
      <Text style={k.sub}>Görevin adımlarını doğru sırada dizayn et!</Text>
      <View style={k.rulesBox}>
        {[
          { icon: '📋', text: 'Her görev 4 adımdan oluşur — ama karışık verilir' },
          { icon: '👆', text: 'Adımları DOĞRU SIRAYLA tıkla (1. adım, 2. adım...)' },
          { icon: '🟣', text: 'Tıkladıkça adımlar numaralanır' },
          { icon: '🏆', text: `${GOAL} görevi tamamla → Zafer!` },
        ].map((r, i) => (
          <View key={i} style={k.ruleRow}>
            <Text style={k.ruleIcon}>{r.icon}</Text>
            <Text style={k.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={k.startBtn} onPress={launch}>
        <Text style={k.startBtnTxt}>💻  Başla!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(solvedRef.current);
    return (
      <View style={k.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={k.bigTitle}>{won ? 'Yazılım Dehası!' : 'Oyun Bitti'}</Text>
        <Text style={k.sub}>{won ? `${GOAL} görev tamamlandı — mükemmel mantık!` : `${solvedRef.current} görevi çözdün.`}</Text>
        <View style={k.statsRow}>
          <View style={k.statChip}><Text style={k.statV}>{solvedRef.current}/{GOAL}</Text><Text style={k.statL}>💻 Görev</Text></View>
          <View style={k.statChip}><Text style={k.statV}>{livesRef.current}/{LIVES}</Text><Text style={k.statL}>❤️ Can</Text></View>
        </View>
        <View style={k.bonusBox}>
          <Text style={k.bonusTitle}>💻 Kazanılan Bonuslar</Text>
          {b.intelligence > 0 && <Text style={k.bonusLine}>🧠 Zeka +{b.intelligence}</Text>}
          {b.focus        > 0 && <Text style={k.bonusLine}>🎯 Odak +{b.focus}</Text>}
          {b.creativity   > 0 && <Text style={k.bonusLine}>💡 Yaratıcılık +{b.creativity}</Text>}
        </View>
        <TouchableOpacity style={k.startBtn} onPress={() => onComplete(b)}>
          <Text style={k.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!puzzle) return <View style={k.screen} />;

  return (
    <View style={k.screen}>
      <View style={k.hud}>
        <View style={k.hudRow}>
          <View><Text style={k.hudLabel}>GÖREV</Text><Text style={k.hudBig}>{solved}/{GOAL}</Text></View>
          <View style={k.hudCenter}><Text style={k.hudTitle}>💻 Kodlama</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={k.hudLabel}>CAN</Text>
            <Text style={[k.hudBig, { fontSize: 16 }]}>{'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}</Text>
          </View>
        </View>
        <View style={k.progressBar}><View style={[k.progressFill, { width: `${(solved / GOAL) * 100}%` }]} /></View>
      </View>

      <View style={k.court}>
        {/* Görev başlığı */}
        <View style={k.taskHeader}>
          <Text style={k.taskIcon}>{puzzle.icon}</Text>
          <View>
            <Text style={k.taskTitle}>{puzzle.title}</Text>
            <Text style={k.taskSub}>
              {feedback === 'correct' ? '✅ Doğru sıra!' : feedback === 'wrong' ? '❌ Yanlış sıra!' : `Adım ${tapped.length + 1} / 4`}
            </Text>
          </View>
        </View>

        {/* Kod blokları */}
        <View style={k.blocksGrid}>
          {puzzle.shuffled.map((block, i) => {
            const tappedPos = tapped.indexOf(i);
            return (
              <BlockBtn
                key={i}
                text={block.text}
                order={tappedPos >= 0 ? tappedPos : null}
                onPress={() => handleTap(i)}
                disabled={tapped.includes(i) || lockRef.current}
              />
            );
          })}
        </View>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>
    </View>
  );
}

const k = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#06081e' },
  center:       { flex: 1, backgroundColor: '#06081e', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#0a0d2a', borderBottomWidth: 1, borderBottomColor: '#1e224a' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#3a4090', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  progressBar:  { height: 5, backgroundColor: '#1e224a', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },
  court:        { flex: 1, backgroundColor: '#080a1c', padding: 20, justifyContent: 'center', gap: 24 },
  taskHeader:   { flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: '#0a0d2a', padding: 14, borderRadius: 16, borderWidth: 1, borderColor: '#1e224a' },
  taskIcon:     { fontSize: 44 },
  taskTitle:    { color: '#e6edf3', fontSize: 18, fontWeight: '900' },
  taskSub:      { color: '#8b949e', fontSize: 12, marginTop: 2 },
  blocksGrid:   { gap: 10 },
  block:        { backgroundColor: '#0a0d2a', borderRadius: 14, borderWidth: 2, borderColor: '#1e224a', padding: 16, flexDirection: 'row', alignItems: 'center', gap: 10 },
  blockText:    { color: '#e6edf3', fontSize: 16, fontWeight: '700', flex: 1 },
  orderBadge:   { width: 28, height: 28, borderRadius: 14, backgroundColor: RCOLOR, alignItems: 'center', justifyContent: 'center' },
  orderNum:     { color: '#fff', fontSize: 14, fontWeight: '900' },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#0a0d2a', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#1e224a' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#4338ca', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.5, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#0a0d2a', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#1e224a' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#3a4090', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0a0d2a', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e224a' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
