import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUITS  = ['♠', '♥', '♦', '♣'];
const RANKS  = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RED    = ['♥', '♦'];
const VALS   = { A:1, J:11, Q:12, K:13, '2':2,'3':3,'4':4,'5':5,'6':6,'7':7,'8':8,'9':9,'10':10 };

function makeCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  return { rank, suit };
}

function CardView({ card, onPress, selected, delay = 0 }) {
  const slideAnim = useRef(new Animated.Value(30)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const isRed = RED.includes(card.suit);
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={onPress ? 0.7 : 1}>
      <Animated.View style={[cs.card, selected && cs.selected, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
        <Text style={[cs.rank, isRed && cs.red]}>{card.rank}</Text>
        <Text style={[cs.suit, isRed && cs.red]}>{card.suit}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PistiGame({ gameState, onExit }) {
  const [phase, setPhase]     = useState('bet');
  const [stake, setStake]     = useState(100);
  const [topCard, setTop]     = useState(null);
  const [hand, setHand]       = useState([]);
  const [chosen, setChosen]   = useState(null);
  const [outcome, setOutcome] = useState(null);
  const balance = Math.round(gameState.data.stats.money);

  const startGame = () => {
    const top  = makeCard();
    const h    = [makeCard(), makeCard(), makeCard()];
    setTop(top); setHand(h); setChosen(null); setOutcome(null);
    setPhase('play');
  };

  const playCard = (idx) => {
    if (phase !== 'play') return;
    setChosen(idx);
  };

  const confirm = () => {
    if (chosen === null) return;
    const played = hand[chosen];
    const win    = played.rank === topCard.rank || played.rank === 'J';
    const pisthi = win && topCard.rank === played.rank && played.rank !== 'J';
    const multi  = pisthi ? 2 : 1;
    const delta  = win ? stake * multi : -Math.round(stake * 0.5);
    gameState.data.stats.money += delta;
    setOutcome({ win, pisthi, delta, played });
    setPhase('result');
  };

  const reset = () => { setPhase('bet'); setTop(null); setHand([]); setChosen(null); setOutcome(null); setStake(100); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.back}>← Çık</Text></TouchableOpacity>
        <Text style={s.title}>🃏 Pişti</Text>
        <Text style={s.balance}>{balance}₺</Text>
      </View>

      {/* Kural özeti */}
      {phase === 'bet' && (
        <View style={s.ruleBox}>
          <Text style={s.ruleText}>
            Üst kartla aynı rankı ya da J'yi oyna → kazan.{'\n'}
            Aynı rank + J değil ise 2× kazanırsın (Pişti!).
          </Text>
        </View>
      )}

      {/* Masa */}
      {phase !== 'bet' && topCard && (
        <View style={s.table}>
          <Text style={s.tableLabel}>Üst Kart</Text>
          <CardView card={topCard} />
        </View>
      )}

      {/* El */}
      {phase === 'play' && (
        <>
          <Text style={s.label}>Elindeki Kartlar — birini seç</Text>
          <View style={s.hand}>
            {hand.map((c, i) => (
              <CardView key={i} card={c} selected={chosen === i} onPress={() => playCard(i)} delay={i * 120} />
            ))}
          </View>
          {chosen !== null && (
            <TouchableOpacity style={s.confirmBtn} onPress={confirm}>
              <Text style={s.confirmTxt}>✓ Oyna — {hand[chosen].rank}{hand[chosen].suit}</Text>
            </TouchableOpacity>
          )}
        </>
      )}

      {/* Sonuç */}
      {phase === 'result' && outcome && (
        <>
          <View style={[s.resultBand, outcome.win ? s.winBand : s.loseBand]}>
            <Text style={s.resultMain}>
              {outcome.pisthi ? '🔥 PİŞTİ!' : outcome.win ? '🎉 Kazandın!' : '😔 Kaybettin!'}
            </Text>
            <Text style={s.resultSub}>
              {outcome.delta > 0 ? `+${outcome.delta}₺` : `${outcome.delta}₺`}
            </Text>
            <Text style={s.resultDetail}>
              Oynadın: {outcome.played.rank}{outcome.played.suit}
              {outcome.win ? ' → Eşleşti!' : ' → Eşleşmedi'}
            </Text>
          </View>
          <View style={s.actionRow}>
            <TouchableOpacity style={[s.actionBtn, s.confirmBtn, { flex: 1, marginRight: 8 }]} onPress={reset}>
              <Text style={s.confirmTxt}>Tekrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.exitBtn, { flex: 1 }]} onPress={onExit}>
              <Text style={s.exitTxt}>Çık</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* Bahis ekranı */}
      {phase === 'bet' && (
        <>
          <Text style={s.label}>Bahis Miktarı</Text>
          <View style={s.row}>
            {[50, 100, 200, 500].map(v => (
              <TouchableOpacity key={v} style={[s.stakeBtn, stake === v && s.stakeBtnOn]} onPress={() => setStake(v)}>
                <Text style={[s.stakeTxt, stake === v && s.stakeTxtOn]}>{v}₺</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={s.confirmBtn} onPress={startGame}>
            <Text style={s.confirmTxt}>🃏 Dağıt</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const cs = StyleSheet.create({
  card:     { width: 64, height: 90, backgroundColor: '#fff', borderRadius: 10, marginRight: 8, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },
  selected: { borderWidth: 3, borderColor: '#1f6feb', transform: [{ translateY: -8 }] },
  rank:     { fontSize: 24, fontWeight: '800', color: '#1a1a2e' },
  suit:     { fontSize: 20, color: '#1a1a2e' },
  red:      { color: '#c0392b' },
});

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#1a0a2e', padding: 20, paddingTop: 60 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back:        { color: '#58a6ff', fontSize: 15 },
  title:       { color: '#fff', fontSize: 20, fontWeight: '800' },
  balance:     { color: '#3fb950', fontSize: 15, fontWeight: '700' },
  ruleBox:     { backgroundColor: '#21162d', borderRadius: 12, padding: 14, marginBottom: 20 },
  ruleText:    { color: '#c9d4df', fontSize: 14, lineHeight: 22 },
  table:       { alignItems: 'center', marginBottom: 24 },
  tableLabel:  { color: '#8b949e', fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase' },
  label:       { color: '#8b949e', fontSize: 13, fontWeight: '600', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  hand:        { flexDirection: 'row', justifyContent: 'center', marginBottom: 16 },
  confirmBtn:  { backgroundColor: '#1f6feb', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  confirmTxt:  { color: '#fff', fontSize: 16, fontWeight: '800' },
  resultBand:  { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  winBand:     { backgroundColor: '#1a4731' },
  loseBand:    { backgroundColor: '#3a1f1f' },
  resultMain:  { color: '#fff', fontSize: 24, fontWeight: '800' },
  resultSub:   { color: '#e6edf3', fontSize: 20, marginTop: 4 },
  resultDetail:{ color: '#8b949e', fontSize: 13, marginTop: 6 },
  actionRow:   { flexDirection: 'row', gap: 10 },
  actionBtn:   { paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  exitBtn:     { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d' },
  exitTxt:     { color: '#e6edf3', fontSize: 15, fontWeight: '700' },
  row:         { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stakeBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#30363d', alignItems: 'center', backgroundColor: '#21162d' },
  stakeBtnOn:  { borderColor: '#9a6fff', backgroundColor: '#2d1f4d' },
  stakeTxt:    { color: '#8b949e', fontWeight: '700' },
  stakeTxtOn:  { color: '#9a6fff' },
});
