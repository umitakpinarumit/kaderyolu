/**
 * AlisverisGame — Market Koşusu 🛒
 * Alışveriş listesindeki ürünleri taşıyıcı banttan yakala!
 * Ürünler soldan sağa hareket eder. Listede olanı al, olmayanı bırak.
 * Bonus: focus / discipline / happiness
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, Platform, StyleSheet,
  Text, TouchableOpacity, Vibration, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── Market ürünleri (emoji + isim + bölüm) ──────────────────────────────────
const ALL_ITEMS = [
  { emoji:'🥛', name:'Süt',         section:'Süt Ürünleri', color:'#38bdf8' },
  { emoji:'🧀', name:'Peynir',      section:'Süt Ürünleri', color:'#fbbf24' },
  { emoji:'🥚', name:'Yumurta',     section:'Süt Ürünleri', color:'#fbbf24' },
  { emoji:'🍎', name:'Elma',        section:'Meyve-Sebze',  color:'#ef4444' },
  { emoji:'🍌', name:'Muz',         section:'Meyve-Sebze',  color:'#fbbf24' },
  { emoji:'🍅', name:'Domates',     section:'Meyve-Sebze',  color:'#ef4444' },
  { emoji:'🥕', name:'Havuç',       section:'Meyve-Sebze',  color:'#f97316' },
  { emoji:'🥦', name:'Brokoli',     section:'Meyve-Sebze',  color:'#22c55e' },
  { emoji:'🥬', name:'Marul',       section:'Meyve-Sebze',  color:'#22c55e' },
  { emoji:'🍞', name:'Ekmek',       section:'Fırın',        color:'#d97706' },
  { emoji:'🥐', name:'Kruvasan',    section:'Fırın',        color:'#d97706' },
  { emoji:'🧁', name:'Kek',         section:'Fırın',        color:'#ec4899' },
  { emoji:'🍗', name:'Tavuk',       section:'Et Reyonu',    color:'#f97316' },
  { emoji:'🐟', name:'Balık',       section:'Et Reyonu',    color:'#38bdf8' },
  { emoji:'🥩', name:'Biftek',      section:'Et Reyonu',    color:'#ef4444' },
  { emoji:'☕', name:'Kahve',       section:'İçecekler',    color:'#92400e' },
  { emoji:'🧃', name:'Meyve Suyu', section:'İçecekler',    color:'#22c55e' },
  { emoji:'🍶', name:'Süt Şişesi', section:'İçecekler',    color:'#e2e8f0' },
  { emoji:'🍫', name:'Çikolata',   section:'Atıştırmalık', color:'#92400e' },
  { emoji:'🍪', name:'Kurabiye',   section:'Atıştırmalık', color:'#d97706' },
  { emoji:'🥫', name:'Konserve',   section:'Market',       color:'#6b7280' },
  { emoji:'🧄', name:'Sarımsak',   section:'Market',       color:'#e2e8f0' },
  { emoji:'🧅', name:'Soğan',      section:'Market',       color:'#a16207' },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const LIST_SIZE    = 5;
const TOTAL_WAVES  = 3;
const ITEMS_PER_WAVE = 12;
const BELT_MS      = 2600;   // bant geçiş süresi
const SPAWN_GAP_MS = 700;
const BELT_Y       = 90;     // bantın Y pozisyonu (içerik alanı içinde)

const calcBonus = (score, max) => {
  const p = max > 0 ? score / max : 0;
  return {
    focus:      p >= 0.8 ? 5 : p >= 0.6 ? 4 : p >= 0.4 ? 3 : p >= 0.2 ? 2 : 1,
    discipline: p >= 0.75? 4 : p >= 0.5 ? 3 : p >= 0.3 ? 2 : 1,
    happiness:  p >= 0.7 ? 3 : p >= 0.45? 2 : p >= 0.2 ? 1 : 0,
  };
};

// ─── Bant Ürün Kartı ─────────────────────────────────────────────────────────
function BeltItem({ item, isOnList, onTap, beltKey }) {
  const x     = useRef(new Animated.Value(-100)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [tapped,  setTapped]  = useState(false);
  const doneRef = useRef(false);

  useEffect(() => {
    Animated.timing(x, {
      toValue: SW + 120,
      duration: BELT_MS,
      easing: Easing.linear,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleTap = () => {
    if (tapped || doneRef.current) return;
    doneRef.current = true;
    setTapped(true);
    Vibration.vibrate(30);
    Animated.spring(scale, { toValue: 1.4, friction: 4, useNativeDriver: true }).start();
    onTap(isOnList, item);
  };

  const bg = tapped
    ? (isOnList ? '#14532d' : '#450a0a')
    : (isOnList ? item.color + '18' : '#0f172a');

  const border = tapped
    ? (isOnList ? '#22c55e' : '#ef4444')
    : (isOnList ? item.color + '66' : '#334155');

  return (
    <TouchableOpacity onPress={handleTap} activeOpacity={0.75}>
      <Animated.View style={[ag.beltCard, {
        backgroundColor: bg,
        borderColor: border,
        transform: [{ translateX: x }, { scale }],
      }]}>
        <Text style={ag.beltEmoji}>{item.emoji}</Text>
        <Text style={[ag.beltName, { color: isOnList ? item.color : '#94a3b8' }]}>{item.name}</Text>
        {tapped && (
          <View style={[ag.tapMark, { backgroundColor: isOnList ? '#22c55e' : '#ef4444' }]}>
            <Text style={ag.tapMarkTxt}>{isOnList ? '✓' : '✗'}</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Ana Bileşen ─────────────────────────────────────────────────────────────
export default function AlisverisGame({ choice, onComplete }) {
  const [wave,      setWave]      = useState(0);
  const [list,      setList]      = useState([]);
  const [beltItems, setBeltItems] = useState([]); // { id, item, isOnList }
  const [cart,      setCart]      = useState([]); // collected ✓
  const [score,     setScore]     = useState(0);
  const [maxScore,  setMaxScore]  = useState(0);
  const [feedback,  setFeedback]  = useState(null); // { text, color }
  const [phase,     setPhase]     = useState('intro');
  const [timeLeft,  setTimeLeft]  = useState(45);
  const [wrongItem, setWrongItem] = useState(null); // yanlış alınan ürün
  const spawnRef  = useRef(null);
  const timerRef  = useRef(null);
  const doneRef   = useRef(false);
  const idRef     = useRef(0);
  const waveRef   = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearTimeout(spawnRef.current);
    clearInterval(timerRef.current);
    setPhase('result');
  }, []);

  const startWave = useCallback((waveIdx) => {
    clearTimeout(spawnRef.current);
    clearInterval(timerRef.current);
    waveRef.current = waveIdx;
    const all      = shuffle(ALL_ITEMS);
    const shopping = all.slice(0, LIST_SIZE);
    const extras   = all.slice(LIST_SIZE, LIST_SIZE + (ITEMS_PER_WAVE - LIST_SIZE));
    const waveList = shuffle([...shopping, ...extras]);

    setList(shopping);
    setBeltItems([]);
    setCart([]);
    setTimeLeft(45);
    setMaxScore(p => p + LIST_SIZE);
    setPhase('shop');

    let i = 0;
    const spawnNext = () => {
      if (i >= waveList.length || doneRef.current) return;
      const item = waveList[i];
      const id   = idRef.current++;
      const isOnList = shopping.some(s => s.emoji === item.emoji);
      i++;
      setBeltItems(prev => [...prev, { id, item, isOnList }]);
      spawnRef.current = setTimeout(spawnNext, SPAWN_GAP_MS + Math.random() * 250);
    };
    spawnNext();

    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { finish(); return 0; }
        return t - 1;
      });
    }, 1000);
  }, [finish]);

  useEffect(() => {
    setTimeout(() => startWave(0), 400);
    return () => { clearTimeout(spawnRef.current); clearInterval(timerRef.current); };
  }, []);

  const handleTap = (isOnList, item) => {
    if (isOnList) {
      const fid = Date.now();
      setScore(s => s + 1);
      setCart(c => [...c, item]);
      setFeedback({ text: `+1  ${item.name} ✓`, color: '#4ade80', id: fid });
      setTimeout(() => setFeedback(f => f?.id === fid ? null : f), 700);
    } else {
      // Yanlış ürün → oyunu hemen bitir
      clearTimeout(spawnRef.current);
      clearInterval(timerRef.current);
      doneRef.current = true;
      setWrongItem(item);
      setPhase('wrong');
    }
  };

  const restartWave = useCallback(() => {
    setWrongItem(null);
    setMaxScore(p => Math.max(0, p - LIST_SIZE)); // bu tur katkısını geri al
    doneRef.current = false;
    startWave(waveRef.current);
  }, [startWave]);

  const goToResult = useCallback(() => {
    setWrongItem(null);
    setPhase('result');
  }, []);

  const handleNextWave = () => {
    clearInterval(timerRef.current);
    clearTimeout(spawnRef.current);
    const nextWave = wave + 1;
    if (nextWave >= TOTAL_WAVES) {
      doneRef.current = true;
      setPhase('result');
    } else {
      setWave(nextWave);
      doneRef.current = false;
      startWave(nextWave);
    }
  };

  // ── YANLIŞ ÜRÜN — Oyun Bitti ─────────────────────────────────────────────
  if (phase === 'wrong' && wrongItem) {
    return (
      <View style={ag.center}>
        <Text style={{ fontSize: 64, marginBottom: 8 }}>🛑</Text>
        <Text style={ag.title}>Yanlış Ürün!</Text>
        <View style={ag.wrongBox}>
          <Text style={{ fontSize: 52 }}>{wrongItem.emoji}</Text>
          <Text style={ag.wrongName}>{wrongItem.name}</Text>
          <Text style={ag.wrongNote}>Bu ürün listende yoktu!</Text>
        </View>
        <Text style={ag.wrongScore}>✓ Toplanan: {score} ürün</Text>
        <TouchableOpacity style={ag.btn} onPress={restartWave}>
          <Text style={ag.btnTxt}>🔄  Tekrar Oyna</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[ag.btn, ag.btnSecondary]} onPress={goToResult}>
          <Text style={ag.btnSecTxt}>⏭  Sonuçlara Geç</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── SONUÇ ──────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const bonus = calcBonus(score, maxScore);
    const accuracy = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;
    return (
      <View style={ag.center}>
        <Text style={{ fontSize: 64, marginBottom: 8 }}>
          {accuracy >= 80 ? '🛒🏆' : accuracy >= 50 ? '🛒' : '🛍️'}
        </Text>
        <Text style={ag.title}>{score}/{maxScore} Ürün</Text>
        <Text style={ag.sub}>
          {accuracy >= 80 ? 'Alışveriş ustasısın! Her şeyi buldun!'
            : accuracy >= 50 ? 'Güzel bir market turu!'
            : 'Birkaç ürünü kaçırdın...'}
        </Text>
        <View style={ag.statsBoxRow}>
          <View style={ag.statBox}><Text style={ag.statVal}>{score}</Text><Text style={ag.statLbl}>✓ Alınan</Text></View>
          <View style={ag.statBox}><Text style={[ag.statVal, { color: '#f85149' }]}>0</Text><Text style={ag.statLbl}>✗ Yanlış</Text></View>
          <View style={ag.statBox}><Text style={[ag.statVal, { color: '#fbbf24' }]}>{accuracy}%</Text><Text style={ag.statLbl}>İsabet</Text></View>
        </View>
        <View style={ag.bonusBox}>
          <Text style={ag.bonusTitle}>🛒 Kazanılan Bonuslar</Text>
          {bonus.focus > 0      && <Text style={ag.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          {bonus.discipline > 0 && <Text style={ag.bonusLine}>📋 Disiplin +{bonus.discipline}</Text>}
          {bonus.happiness > 0  && <Text style={ag.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
        </View>
        <TouchableOpacity style={ag.btn} onPress={() => onComplete(bonus)}>
          <Text style={ag.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (phase === 'intro') {
    return <View style={ag.center}><Text style={{ fontSize: 60 }}>🛒</Text><Text style={ag.title}>Hazırlanıyor...</Text></View>;
  }

  // Liste tamamlandı mı?
  const listDone = list.every(l => cart.some(c => c.emoji === l.emoji));

  return (
    <View style={ag.screen}>
      {/* HUD */}
      <View style={ag.hud}>
        <View style={ag.hudTop}>
          <Text style={ag.hudTitle}>🛒 Market Koşusu</Text>
          <View style={ag.hudRight}>
            <Text style={[ag.hudTimer, timeLeft <= 10 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
            <Text style={ag.hudWave}>Liste {wave + 1}/{TOTAL_WAVES}</Text>
          </View>
        </View>
        {feedback && <Text style={[ag.feedback, { color: feedback.color }]}>{feedback.text}</Text>}
        <View style={ag.scoreRow}>
          <Text style={ag.scoreLabel}>✓ {score}</Text>
          <View style={ag.scoreBar}>
            <View style={[ag.scoreBarFill, { width: `${maxScore > 0 ? (score / maxScore) * 100 : 0}%` }]} />
          </View>
        </View>
      </View>

      {/* Alışveriş listesi */}
      <View style={ag.listPanel}>
        <Text style={ag.listHeader}>📋 Listende bunlar var:</Text>
        <View style={ag.listRow}>
          {list.map(item => {
            const bought = cart.some(c => c.emoji === item.emoji);
            return (
              <View key={item.emoji} style={[ag.listChip, bought && ag.listChipDone, { borderColor: item.color + (bought ? 'ff' : '44') }]}>
                <Text style={{ fontSize: 18 }}>{item.emoji}</Text>
                <Text style={[ag.listChipName, { color: bought ? '#4ade80' : item.color }, bought && { textDecorationLine: 'line-through' }]}>
                  {item.name}
                </Text>
                {bought && <Text style={ag.checkmark}>✓</Text>}
              </View>
            );
          })}
        </View>
        {listDone && (
          <TouchableOpacity style={ag.nextBtn} onPress={handleNextWave}>
            <Text style={ag.nextBtnTxt}>{wave + 1 >= TOTAL_WAVES ? '🏁 Tamamla' : `→ Liste ${wave + 2}`}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Bant alanı */}
      <View style={ag.beltArea}>
        <View style={ag.beltRail}>
          <View style={ag.beltTrack} />
          <View style={ag.beltInner}>
            {beltItems.map(({ id, item, isOnList }) => (
              <BeltItem
                key={id}
                beltKey={id}
                item={item}
                isOnList={isOnList}
                onTap={handleTap}
              />
            ))}
          </View>
        </View>
        <Text style={ag.beltHint}>
          {listDone ? '✅ Liste tamam! Sonraki listeye geçebilirsin.' : 'Listede olan ürüne dokun!'}
        </Text>
      </View>
    </View>
  );
}

// ─── Stiller ─────────────────────────────────────────────────────────────────
const ag = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#070d14' },
  center:       { flex: 1, backgroundColor: '#070d14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { paddingTop: SAFE_TOP, paddingHorizontal: 14, paddingBottom: 8, backgroundColor: '#0e1520', borderBottomWidth: 1, borderColor: '#1c2e44' },
  hudTop:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 3 },
  hudTitle:     { color: '#60a5fa', fontSize: 15, fontWeight: '900' },
  hudRight:     { alignItems: 'flex-end' },
  hudTimer:     { color: '#e6edf3', fontSize: 14, fontWeight: '900' },
  hudWave:      { color: '#6b7280', fontSize: 10 },
  feedback:     { fontSize: 14, fontWeight: '900', textAlign: 'center', marginBottom: 2 },
  scoreRow:     { flexDirection: 'row', alignItems: 'center', gap: 8 },
  scoreLabel:   { color: '#8b949e', fontSize: 11, fontWeight: '700', minWidth: 60 },
  scoreBar:     { flex: 1, height: 5, backgroundColor: '#1c2e44', borderRadius: 3, overflow: 'hidden' },
  scoreBarFill: { height: '100%', backgroundColor: '#22c55e', borderRadius: 3 },
  listPanel:    { backgroundColor: '#0e1520', borderBottomWidth: 1, borderColor: '#1c2e44', padding: 10 },
  listHeader:   { color: '#e6edf3', fontSize: 11, fontWeight: '700', marginBottom: 6 },
  listRow:      { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  listChip:     { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#141e2e', borderRadius: 10, paddingVertical: 5, paddingHorizontal: 8, borderWidth: 1.5 },
  listChipDone: { backgroundColor: '#0a1f0a' },
  listChipName: { fontSize: 11, fontWeight: '700' },
  checkmark:    { color: '#4ade80', fontSize: 11, fontWeight: '900' },
  nextBtn:      { marginTop: 8, backgroundColor: '#1f6feb', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  nextBtnTxt:   { color: '#fff', fontSize: 13, fontWeight: '900' },
  beltArea:     { flex: 1, paddingTop: 8 },
  beltRail:     { marginHorizontal: 0, position: 'relative', height: 110 },
  beltTrack:    { position: 'absolute', top: 25, left: 0, right: 0, height: 60, backgroundColor: '#0d1525', borderTopWidth: 2, borderBottomWidth: 2, borderColor: '#1c2e44' },
  beltInner:    { position: 'absolute', top: 15, left: 0, right: 0, height: 80, flexDirection: 'row', alignItems: 'center' },
  beltHint:     { color: '#6b7280', fontSize: 11, textAlign: 'center', marginTop: 10, paddingHorizontal: 14 },
  beltCard:     { position: 'absolute', width: 75, height: 75, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 2 },
  beltEmoji:    { fontSize: 30 },
  beltName:     { fontSize: 9, fontWeight: '800', textAlign: 'center' },
  tapMark:      { position: 'absolute', top: 3, right: 3, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tapMarkTxt:   { color: '#fff', fontSize: 11, fontWeight: '900' },
  title:        { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  statsBoxRow:  { flexDirection: 'row', gap: 10, marginBottom: 14 },
  statBox:      { backgroundColor: '#0e1520', borderRadius: 12, padding: 12, alignItems: 'center', flex: 1, borderWidth: 1, borderColor: '#1c2e44' },
  statVal:      { color: '#e6edf3', fontSize: 22, fontWeight: '900' },
  statLbl:      { color: '#6b7280', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#0e1520', borderRadius: 14, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1c2e44' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:    { color: '#60a5fa', fontSize: 13, marginBottom: 2 },
  btn:          { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14, shadowColor: '#1f6feb', shadowOpacity: 0.4, shadowRadius: 8, marginBottom: 10, width: '80%', alignItems: 'center' },
  btnTxt:       { color: '#fff', fontSize: 16, fontWeight: '800' },
  btnSecondary: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d' },
  btnSecTxt:    { color: '#8b949e', fontSize: 14, fontWeight: '700' },
  wrongBox:     { backgroundColor: '#1a0505', borderRadius: 16, padding: 20, marginBottom: 14, alignItems: 'center', borderWidth: 2, borderColor: '#ef4444', width: '100%' },
  wrongName:    { color: '#f87171', fontSize: 20, fontWeight: '900', marginTop: 6 },
  wrongNote:    { color: '#8b949e', fontSize: 13, marginTop: 4 },
  wrongScore:   { color: '#e6edf3', fontSize: 14, fontWeight: '700', marginBottom: 18 },
});
