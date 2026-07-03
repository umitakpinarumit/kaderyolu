/**
 * MemoryGame — Hafıza Kartları (Bilgisayar Fuarı / Müze / Resim Kursu)
 * 4×2 kart grid. Çift eşleştir. Süre: 60 saniye.
 * Bonus: kalan süreye ve eşleşmeye göre.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const CARD_W = (SW - 56) / 4;
const CARD_H = CARD_W * 1.3;
const TIME_S = 60;

// Kart setleri — aktiviteye göre
const CARD_SETS = {
  default:   ['💻', '🖥️', '🖱️', '⌨️'],   // Bilgisayar fuarı
  'Müze':    ['🏺', '🗿', '🖼️', '⚔️'],
  'Resim kursu': ['🎨', '🖌️', '✏️', '🖼️'],
  'Kütüphane': ['📚', '📖', '🔖', '✍️'],
};

function getCards(choiceLabel) {
  const set = CARD_SETS[choiceLabel] || CARD_SETS.default;
  const pairs = [...set, ...set];
  // Fisher-Yates shuffle
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((icon, i) => ({ id: i, icon, matched: false, flipped: false }));
}

// Tek kart (flip animasyonu)
function Card({ card, onPress, disabled }) {
  const flip = useRef(new Animated.Value(card.flipped || card.matched ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(flip, {
      toValue: card.flipped || card.matched ? 1 : 0,
      friction: 8, tension: 100, useNativeDriver: true,
    }).start();
  }, [card.flipped, card.matched]);

  const frontRotate = flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '360deg'] });
  const backRotate  = flip.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });
  const frontOp     = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const backOp      = flip.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || card.matched}
      style={{ width: CARD_W, height: CARD_H, margin: 4 }}
      activeOpacity={0.8}
    >
      {/* Arka yüz (?) */}
      <Animated.View style={[
        s.card, s.cardBack,
        { opacity: backOp, transform: [{ perspective: 1000 }, { rotateY: backRotate }] },
        card.matched && { opacity: 0 },
      ]}>
        <Text style={{ fontSize: CARD_W * 0.45, color: '#4b5563' }}>?</Text>
      </Animated.View>
      {/* Ön yüz */}
      <Animated.View style={[
        s.card, s.cardFront,
        card.matched && s.cardMatched,
        { opacity: frontOp, transform: [{ perspective: 1000 }, { rotateY: frontRotate }], position: 'absolute', top: 0, left: 0 },
      ]}>
        <Text style={{ fontSize: CARD_W * 0.5 }}>{card.icon}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function MemoryGame({ choice, onComplete }) {
  const [cards,    setCards]    = useState(() => getCards(choice?.label));
  const [flipped,  setFlipped]  = useState([]);   // açık kart id'leri
  const [matches,  setMatches]  = useState(0);
  const [timeLeft, setTime]     = useState(TIME_S);
  const [blocked,  setBlocked]  = useState(false);
  const [done,     setDone]     = useState(false);
  const timerI  = useRef(null);
  const timeR   = useRef(TIME_S);
  const matchR  = useRef(0);

  useEffect(() => {
    timerI.current = setInterval(() => {
      timeR.current--;
      setTime(timeR.current);
      if (timeR.current <= 0) { clearInterval(timerI.current); setDone(true); }
    }, 1000);
    return () => clearInterval(timerI.current);
  }, []);

  const handlePress = (id) => {
    if (blocked) return;
    const card = cards.find(c => c.id === id);
    if (!card || card.matched || card.flipped || flipped.length >= 2) return;

    const newFlipped = [...flipped, id];
    setCards(prev => prev.map(c => c.id === id ? { ...c, flipped: true } : c));

    if (newFlipped.length === 2) {
      setBlocked(true);
      const [a, b] = newFlipped.map(fid => cards.find(c => c.id === fid));
      const isMatch = a.icon === b.icon;

      setTimeout(() => {
        setCards(prev => prev.map(c =>
          newFlipped.includes(c.id)
            ? { ...c, flipped: false, matched: isMatch }
            : c
        ));
        if (isMatch) {
          const newM = matchR.current + 1;
          matchR.current = newM;
          setMatches(newM);
          if (newM >= 4) { clearInterval(timerI.current); setDone(true); }
        }
        setFlipped([]);
        setBlocked(false);
      }, isMatch ? 400 : 900);
      setFlipped(newFlipped);
    } else {
      setFlipped(newFlipped);
    }
  };

  const calcBonus = (m, t) => ({
    intelligence: m >= 4 ? (t > 30 ? 4 : 3) : m >= 2 ? 2 : 1,
    focus:        m >= 4 ? (t > 40 ? 3 : 2) : m >= 2 ? 1 : 0,
    creativity:   m >= 3 ? 2 : m >= 1 ? 1 : 0,
  });

  // ── SONUÇ ──────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(matchR.current, timeR.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>
          {matchR.current >= 4 ? '🧠🏆' : matchR.current >= 2 ? '🃏' : '🤔'}
        </Text>
        <Text style={s.resultTitle}>{matchR.current}/4 Çift bulundu!</Text>
        <Text style={s.resultSub}>
          {matchR.current >= 4 ? `${TIME_S - timeR.current}s'de tamamladın!` :
           matchR.current >= 2 ? 'Fena değil!' : 'Pratik yapmalısın!'}
        </Text>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🧠 Kazanılan bonuslar</Text>
          {bonus.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
          {bonus.focus > 0        && <Text style={s.bonusLine}>⚡ Odak +{bonus.focus}</Text>}
          {bonus.creativity > 0   && <Text style={s.bonusLine}>🎨 Yaratıcılık +{bonus.creativity}</Text>}
        </View>
        <TouchableOpacity style={s.btn} onPress={() => onComplete(bonus)}>
          <Text style={s.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ── OYUN ────────────────────────────────────────────────────────────────
  return (
    <View style={s.screen}>
      {/* HUD */}
      <View style={s.hud}>
        <Text style={s.hudTitle}>🃏 Hafıza Oyunu</Text>
        <View style={s.hudRow}>
          <Text style={s.hudStat}>✅ {matches}/4 çift</Text>
          <Text style={[s.hudTimer, timeLeft <= 10 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        {/* Progress dots */}
        <View style={s.matchDots}>
          {Array.from({ length: 4 }).map((_, i) => (
            <View key={i} style={[s.dot, i < matches && s.dotFilled]} />
          ))}
        </View>
      </View>

      {/* Kart grid */}
      <View style={s.grid}>
        {cards.map(card => (
          <Card
            key={card.id}
            card={card}
            onPress={() => handlePress(card.id)}
            disabled={blocked}
          />
        ))}
      </View>

      <Text style={s.footHint}>Aynı ikonlu çiftleri bul!</Text>
    </View>
  );
}

const s = StyleSheet.create({
  screen:    { flex: 1, backgroundColor: '#0a0f1a' },
  center:    { flex: 1, backgroundColor: '#0a0f1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:       { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10, backgroundColor: '#060d1e', borderBottomWidth: 1, borderColor: '#1c2d4a' },
  hudTitle:  { color: '#93c5fd', fontSize: 16, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  hudRow:    { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  hudStat:   { color: '#60a5fa', fontSize: 14, fontWeight: '700' },
  hudTimer:  { color: '#e6edf3', fontSize: 16, fontWeight: '900' },
  matchDots: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  dot:       { width: 14, height: 14, borderRadius: 7, backgroundColor: '#1e3a5f', borderWidth: 1.5, borderColor: '#3b82f6' },
  dotFilled: { backgroundColor: '#3b82f6' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', padding: 12, flex: 1, alignContent: 'center' },
  card:      { width: CARD_W, height: CARD_H, borderRadius: 12, borderWidth: 2, justifyContent: 'center', alignItems: 'center' },
  cardBack:  { backgroundColor: '#1e3a5f', borderColor: '#2563eb' },
  cardFront: { backgroundColor: '#0f2027', borderColor: '#60a5fa' },
  cardMatched:{ backgroundColor: '#052e16', borderColor: '#22c55e' },
  footHint:  { color: '#4b5563', fontSize: 13, textAlign: 'center', paddingBottom: 20 },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  bonusBox:    { backgroundColor: '#0c1e30', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e3a5f' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#60a5fa', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#1d4ed8', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
