import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const SUITS   = ['♠', '♥', '♦', '♣'];
const RANKS   = ['A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const RED_SUITS = ['♥', '♦'];

function randomCard() {
  const rank = RANKS[Math.floor(Math.random() * RANKS.length)];
  const suit = SUITS[Math.floor(Math.random() * SUITS.length)];
  const val  = rank === 'A' ? 11 : ['J','Q','K'].includes(rank) ? 10 : parseInt(rank);
  return { rank, suit, val };
}

function handValue(cards) {
  let total = cards.reduce((s, c) => s + c.val, 0);
  let aces  = cards.filter(c => c.rank === 'A').length;
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function Card({ card, hidden, delay = 0 }) {
  const slideAnim = useRef(new Animated.Value(-40)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, { toValue: 0, duration: 300, delay, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay, useNativeDriver: true }),
    ]).start();
  }, []);
  const isRed = card && RED_SUITS.includes(card.suit);
  return (
    <Animated.View style={[
      cs.card,
      hidden && cs.cardHidden,
      { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
    ]}>
      {hidden ? (
        <Text style={cs.cardBack}>🂠</Text>
      ) : (
        <>
          <Text style={[cs.cardRank, isRed && cs.cardRed]}>{card.rank}</Text>
          <Text style={[cs.cardSuit, isRed && cs.cardRed]}>{card.suit}</Text>
        </>
      )}
    </Animated.View>
  );
}

export default function BlackjackGame({ gameState, onExit }) {
  const [phase, setPhase]       = useState('bet');   // bet | play | result
  const [stake, setStake]       = useState(100);
  const [playerCards, setPC]    = useState([]);
  const [dealerCards, setDC]    = useState([]);
  const [dealerHidden, setDH]   = useState(true);
  const [outcome, setOutcome]   = useState(null);    // 'win' | 'lose' | 'push'
  const balance = Math.round(gameState.data.stats.money);

  const deal = () => {
    const p = [randomCard(), randomCard()];
    const d = [randomCard(), randomCard()];
    setPC(p); setDC(d); setDH(true); setOutcome(null);
    setPhase('play');
  };

  const hit = () => {
    const newCards = [...playerCards, randomCard()];
    setPC(newCards);
    if (handValue(newCards) > 21) finishGame(newCards, dealerCards);
  };

  const stand = () => finishGame(playerCards, dealerCards);

  const doubleDown = () => {
    const newCards = [...playerCards, randomCard()];
    setPC(newCards);
    gameState.data.stats.money -= stake;
    setStake(s => s * 2);
    finishGame(newCards, dealerCards);
  };

  const finishGame = (pCards, dCards) => {
    let d = [...dCards];
    while (handValue(d) < 17) d.push(randomCard());
    setDC(d); setDH(false);
    const pV = handValue(pCards);
    const dV = handValue(d);
    let out;
    if (pV > 21)          out = 'lose';
    else if (dV > 21)     out = 'win';
    else if (pV > dV)     out = 'win';
    else if (pV < dV)     out = 'lose';
    else                  out = 'push';
    const delta = out === 'win' ? stake : out === 'lose' ? -stake : 0;
    gameState.data.stats.money += delta;
    setOutcome({ result: out, delta, pV, dV });
    setPhase('result');
  };

  const reset = () => { setPhase('bet'); setPC([]); setDC([]); setOutcome(null); setStake(100); };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.back}>← Çık</Text></TouchableOpacity>
        <Text style={s.title}>🃏 Blackjack</Text>
        <Text style={s.balance}>{balance}₺</Text>
      </View>

      {/* Krupiye */}
      {phase !== 'bet' && (
        <View style={s.handArea}>
          <Text style={s.handLabel}>
            Krupiye {!dealerHidden && outcome ? `(${outcome.dV})` : dealerHidden ? '(?+?)' : `(${handValue(dealerCards)})`}
          </Text>
          <View style={s.cards}>
            {dealerCards.map((c, i) => (
              <Card key={i} card={c} hidden={i === 1 && dealerHidden} delay={i * 150} />
            ))}
          </View>
        </View>
      )}

      {/* Oyuncu */}
      {phase !== 'bet' && (
        <View style={s.handArea}>
          <Text style={s.handLabel}>Sen ({handValue(playerCards)})</Text>
          <View style={s.cards}>
            {playerCards.map((c, i) => <Card key={i} card={c} hidden={false} delay={i * 150} />)}
          </View>
        </View>
      )}

      {/* Sonuç */}
      {phase === 'result' && outcome && (
        <View style={[s.resultBand, outcome.result === 'win' ? s.winBand : outcome.result === 'lose' ? s.loseBand : s.pushBand]}>
          <Text style={s.resultMain}>
            {outcome.result === 'win' ? '🎉 Kazandın!' : outcome.result === 'lose' ? '😔 Kaybettin!' : '🤝 Berabere'}
          </Text>
          <Text style={s.resultSub}>
            {outcome.delta > 0 ? `+${outcome.delta}₺` : outcome.delta < 0 ? `${outcome.delta}₺` : '±0₺'}
          </Text>
        </View>
      )}

      {/* Bahis seçimi */}
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
          <TouchableOpacity style={s.dealBtn} onPress={deal}>
            <Text style={s.dealTxt}>Dağıt</Text>
          </TouchableOpacity>
        </>
      )}

      {/* Oyun aksiyonları */}
      {phase === 'play' && (
        <View style={s.actionRow}>
          <TouchableOpacity style={[s.actionBtn, s.hitBtn]} onPress={hit}>
            <Text style={s.actionTxt}>Kart Al</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.standBtn]} onPress={stand}>
            <Text style={s.actionTxt}>Dur</Text>
          </TouchableOpacity>
          {playerCards.length === 2 && (
            <TouchableOpacity style={[s.actionBtn, s.doubleBtn]} onPress={doubleDown}>
              <Text style={s.actionTxt}>Çiftle</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sonuç aksiyonları */}
      {phase === 'result' && (
        <View style={s.actionRow}>
          <TouchableOpacity style={[s.actionBtn, s.dealBtn, { flex: 1, marginRight: 8 }]} onPress={reset}>
            <Text style={s.dealTxt}>Tekrar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.actionBtn, s.exitBtn, { flex: 1 }]} onPress={onExit}>
            <Text style={s.actionTxt}>Çık</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const cs = StyleSheet.create({
  card:       { width: 58, height: 84, backgroundColor: '#fff', borderRadius: 8, marginRight: 6, alignItems: 'center', justifyContent: 'center', elevation: 4, shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4 },
  cardHidden: { backgroundColor: '#1f6feb' },
  cardBack:   { fontSize: 40 },
  cardRank:   { fontSize: 22, fontWeight: '800', color: '#1a1a2e' },
  cardSuit:   { fontSize: 18, color: '#1a1a2e' },
  cardRed:    { color: '#c0392b' },
});

const s = StyleSheet.create({
  container:  { flex: 1, backgroundColor: '#0d3b2e', padding: 20, paddingTop: 60 },
  header:     { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  back:       { color: '#58a6ff', fontSize: 15 },
  title:      { color: '#fff', fontSize: 20, fontWeight: '800' },
  balance:    { color: '#3fb950', fontSize: 15, fontWeight: '700' },
  handArea:   { marginBottom: 16 },
  handLabel:  { color: '#adbdcc', fontSize: 13, marginBottom: 8, fontWeight: '600' },
  cards:      { flexDirection: 'row', flexWrap: 'wrap' },
  label:      { color: '#8b949e', fontSize: 13, fontWeight: '600', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 },
  row:        { flexDirection: 'row', gap: 8, marginBottom: 16 },
  stakeBtn:   { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#30363d', alignItems: 'center', backgroundColor: '#0b2d20' },
  stakeBtnOn: { borderColor: '#3fb950', backgroundColor: '#1a4731' },
  stakeTxt:   { color: '#8b949e', fontWeight: '700' },
  stakeTxtOn: { color: '#3fb950' },
  resultBand: { borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  winBand:    { backgroundColor: '#1a4731' },
  loseBand:   { backgroundColor: '#3a1f1f' },
  pushBand:   { backgroundColor: '#21262d' },
  resultMain: { color: '#fff', fontSize: 22, fontWeight: '800' },
  resultSub:  { color: '#e6edf3', fontSize: 18, marginTop: 4 },
  actionRow:  { flexDirection: 'row', gap: 10, marginTop: 8 },
  actionBtn:  { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  actionTxt:  { color: '#fff', fontSize: 15, fontWeight: '700' },
  dealBtn:    { backgroundColor: '#1f6feb', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  dealTxt:    { color: '#fff', fontSize: 17, fontWeight: '800' },
  hitBtn:     { backgroundColor: '#1f6feb' },
  standBtn:   { backgroundColor: '#6e3a3a' },
  doubleBtn:  { backgroundColor: '#5a3e1b' },
  exitBtn:    { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d' },
});
