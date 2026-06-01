import { useEffect, useRef, useState } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

const FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const STAKES = [50, 100, 200, 500];

export default function DiceGame({ gameState, onExit }) {
  const [phase, setPhase]       = useState('bet'); // bet | rolling | result
  const [bet, setBet]           = useState(null);  // 'odd' | 'even'
  const [stake, setStake]       = useState(100);
  const [faceIdx, setFaceIdx]   = useState(0);
  const [result, setResult]     = useState(null);  // { roll, win, delta }
  const balance = Math.round(gameState.data.stats.money);

  const scaleAnim  = useRef(new Animated.Value(1)).current;
  const shakeAnim  = useRef(new Animated.Value(0)).current;
  const fadeAnim   = useRef(new Animated.Value(0)).current;
  const rollTimer  = useRef(null);

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    return () => { if (rollTimer.current) clearInterval(rollTimer.current); };
  }, []);

  const rollDice = () => {
    if (!bet || phase !== 'bet') return;
    setPhase('rolling');

    // Sallama animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 1.3, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.9, duration: 120, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1.2, duration: 100, useNativeDriver: true }),
    ]).start();

    let count = 0;
    rollTimer.current = setInterval(() => {
      setFaceIdx(Math.floor(Math.random() * 6));
      count++;
      if (count >= 14) {
        clearInterval(rollTimer.current);
        const roll  = Math.floor(Math.random() * 6) + 1;
        const isOdd = roll % 2 === 1;
        const win   = (bet === 'odd' && isOdd) || (bet === 'even' && !isOdd);
        const delta = win ? stake : -stake;
        gameState.data.stats.money += delta;
        setFaceIdx(roll - 1);
        setResult({ roll, win, delta });

        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }).start();
        setPhase('result');
      }
    }, 80);
  };

  const reset = () => {
    setPhase('bet');
    setBet(null);
    setFaceIdx(0);
    setResult(null);
    Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
      Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    });
  };

  return (
    <Animated.View style={[s.container, { opacity: fadeAnim }]}>
      {/* Başlık */}
      <View style={s.header}>
        <TouchableOpacity onPress={onExit}><Text style={s.back}>← Çık</Text></TouchableOpacity>
        <Text style={s.title}>🎲 Zar Oyunu</Text>
        <Text style={s.balance}>{balance}₺</Text>
      </View>

      {/* Zar */}
      <View style={s.diceArea}>
        <Animated.Text style={[s.dice, { transform: [{ scale: scaleAnim }] }]}>
          {FACES[faceIdx]}
        </Animated.Text>
        {phase === 'result' && result && (
          <Animated.View style={s.resultBadge}>
            <Text style={s.resultBadgeText}>
              {result.roll} — {result.roll % 2 === 1 ? 'Tek' : 'Çift'}
            </Text>
          </Animated.View>
        )}
      </View>

      {/* Bahis Miktarı */}
      <Text style={s.label}>Bahis Miktarı</Text>
      <View style={s.row}>
        {STAKES.map(v => (
          <TouchableOpacity
            key={v}
            style={[s.stakeBtn, stake === v && s.stakeBtnOn]}
            onPress={() => phase === 'bet' && setStake(v)}
          >
            <Text style={[s.stakeTxt, stake === v && s.stakeTxtOn]}>{v}₺</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tahmin */}
      <Text style={s.label}>Tahminin</Text>
      <View style={s.row}>
        {['odd', 'even'].map(b => (
          <TouchableOpacity
            key={b}
            style={[s.betBtn, bet === b && (b === 'odd' ? s.betOddOn : s.betEvenOn)]}
            onPress={() => phase === 'bet' && setBet(b)}
          >
            <Text style={[s.betTxt, bet === b && s.betTxtOn]}>
              {b === 'odd' ? '🔵 Tek' : '🔴 Çift'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Sonuç Bandı */}
      {phase === 'result' && result && (
        <View style={[s.resultBand, result.win ? s.winBand : s.loseBand]}>
          <Text style={s.resultMain}>
            {result.win ? '🎉 Kazandın!' : '😔 Kaybettin!'}
          </Text>
          <Text style={s.resultSub}>
            {result.win ? `+${result.delta}₺` : `${result.delta}₺`}
          </Text>
        </View>
      )}

      {/* Aksiyonlar */}
      <View style={s.actions}>
        {phase === 'bet' && (
          <TouchableOpacity
            style={[s.actionBtn, s.rollBtn, (!bet) && s.disabledBtn]}
            onPress={rollDice}
            disabled={!bet}
          >
            <Text style={s.actionTxt}>Zar At!</Text>
          </TouchableOpacity>
        )}
        {phase === 'rolling' && (
          <View style={[s.actionBtn, s.disabledBtn]}>
            <Text style={s.actionTxt}>Atılıyor…</Text>
          </View>
        )}
        {phase === 'result' && (
          <View style={s.row}>
            <TouchableOpacity style={[s.actionBtn, s.rollBtn, { flex: 1, marginRight: 8 }]} onPress={reset}>
              <Text style={s.actionTxt}>Tekrar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.actionBtn, s.exitBtn, { flex: 1 }]} onPress={onExit}>
              <Text style={s.actionTxt}>Çık</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container:   { flex: 1, backgroundColor: '#0d1117', padding: 20, paddingTop: 60 },
  header:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  back:        { color: '#58a6ff', fontSize: 15 },
  title:       { color: '#e6edf3', fontSize: 20, fontWeight: '800' },
  balance:     { color: '#3fb950', fontSize: 15, fontWeight: '700' },
  diceArea:    { alignItems: 'center', justifyContent: 'center', marginVertical: 24, position: 'relative' },
  dice:        { fontSize: 110 },
  resultBadge: { marginTop: 8, backgroundColor: '#21262d', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 6 },
  resultBadgeText: { color: '#e6edf3', fontSize: 16, fontWeight: '700' },
  label:       { color: '#8b949e', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 4, textTransform: 'uppercase', letterSpacing: 1 },
  row:         { flexDirection: 'row', gap: 10, marginBottom: 16 },
  stakeBtn:    { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#30363d', alignItems: 'center', backgroundColor: '#161b22' },
  stakeBtnOn:  { borderColor: '#58a6ff', backgroundColor: '#1f3a5f' },
  stakeTxt:    { color: '#8b949e', fontWeight: '700' },
  stakeTxtOn:  { color: '#58a6ff' },
  betBtn:      { flex: 1, paddingVertical: 14, borderRadius: 12, borderWidth: 2, borderColor: '#30363d', alignItems: 'center', backgroundColor: '#161b22' },
  betOddOn:    { borderColor: '#58a6ff', backgroundColor: '#1f3a5f' },
  betEvenOn:   { borderColor: '#f85149', backgroundColor: '#3a1f1f' },
  betTxt:      { color: '#8b949e', fontSize: 16, fontWeight: '700' },
  betTxtOn:    { color: '#e6edf3' },
  resultBand:  { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 16 },
  winBand:     { backgroundColor: '#1a4731' },
  loseBand:    { backgroundColor: '#3a1f1f' },
  resultMain:  { color: '#e6edf3', fontSize: 22, fontWeight: '800' },
  resultSub:   { color: '#e6edf3', fontSize: 18, marginTop: 4 },
  actions:     { marginTop: 8 },
  actionBtn:   { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  rollBtn:     { backgroundColor: '#1f6feb' },
  exitBtn:     { backgroundColor: '#21262d', borderWidth: 1, borderColor: '#30363d' },
  disabledBtn: { backgroundColor: '#21262d', opacity: 0.5 },
  actionTxt:   { color: '#e6edf3', fontSize: 17, fontWeight: '800' },
});
