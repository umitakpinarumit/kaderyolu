/**
 * GuresGame — Güreş 🤼
 * Hızlı dokun, rakibi yık! 3 tur, 2 kazanma = şampiyonluk.
 * Oyuncu hızlı basar, AI otomatik yavaş basar.
 * İlk yüzde 100'e ulaşan turu kazanır.
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Easing, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const HUD_H    = SAFE_TOP + 56;
const ROUNDS   = 3;
const WIN_SET  = 2;     // tur kazanmak için
const LIVES    = WIN_SET;
const GOAL_PCT = 100;
const AI_SPEED = 1.2;   // saniyede %AI_SPEED artar

const RCOLOR = '#f43f5e';

const calcBonus = (wins) => ({
  strength:  wins >= WIN_SET ? 5 : wins >= 1 ? 3 : 1,
  endurance: wins >= WIN_SET ? 4 : wins >= 1 ? 3 : 1,
  confidence:wins >= WIN_SET ? 4 : wins >= 1 ? 2 : 1,
});

function Flash({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.45, duration: 40,  useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,    duration: 300, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />;
}

export default function GuresGame({ choice, onComplete }) {
  const [phase,       setPhase]      = useState('ready');
  const [playerPct,   setPlayerPct]  = useState(0);
  const [aiPct,       setAiPct]      = useState(0);
  const [playerWins,  setPlayerWins] = useState(0);
  const [aiWins,      setAiWins]     = useState(0);
  const [round,       setRound]      = useState(1);
  const [roundMsg,    setRoundMsg]   = useState('');
  const [hitTrigger,  setHitTrigger] = useState(0);
  const [missTrigger, setMissTrigger]= useState(0);
  const [result,      setResult]     = useState(null);

  const playerPctRef = useRef(0);
  const aiPctRef     = useRef(0);
  const playerWinsRef= useRef(0);
  const aiWinsRef    = useRef(0);
  const roundRef     = useRef(1);
  const phaseRef     = useRef('ready');
  const aiTimer      = useRef(null);
  const lockRef      = useRef(false);

  const playerAnim = useRef(new Animated.Value(0)).current;
  const aiAnim     = useRef(new Animated.Value(0)).current;

  const stopAll = useCallback(() => { clearInterval(aiTimer.current); }, []);

  const endRound = useCallback((playerWon) => {
    lockRef.current = true;
    clearInterval(aiTimer.current);
    if (playerWon) {
      setHitTrigger(t => t + 1);
      playerWinsRef.current += 1;
      setPlayerWins(playerWinsRef.current);
      setRoundMsg('🏆 Turu Kazandın!');
    } else {
      setMissTrigger(t => t + 1);
      aiWinsRef.current += 1;
      setAiWins(aiWinsRef.current);
      setRoundMsg('😤 Rakip Kazandı!');
    }

    setTimeout(() => {
      if (playerWinsRef.current >= WIN_SET) {
        phaseRef.current = 'done'; setPhase('done'); setResult('win'); return;
      }
      if (aiWinsRef.current >= WIN_SET) {
        phaseRef.current = 'done'; setPhase('done'); setResult('lose'); return;
      }
      // Sonraki tur
      const next = roundRef.current + 1;
      roundRef.current = next;
      setRound(next);
      playerPctRef.current = 0; aiPctRef.current = 0;
      setPlayerPct(0); setAiPct(0);
      playerAnim.setValue(0); aiAnim.setValue(0);
      setRoundMsg('');
      lockRef.current = false;
      startAI();
    }, 1200);
  }, []);

  const startAI = useCallback(() => {
    clearInterval(aiTimer.current);
    aiTimer.current = setInterval(() => {
      if (phaseRef.current !== 'playing' || lockRef.current) return;
      aiPctRef.current = Math.min(GOAL_PCT, aiPctRef.current + AI_SPEED * 0.25);
      setAiPct(Math.round(aiPctRef.current));
      Animated.timing(aiAnim, {
        toValue: aiPctRef.current / GOAL_PCT,
        duration: 250, easing: Easing.linear, useNativeDriver: false,
      }).start();
      if (aiPctRef.current >= GOAL_PCT) endRound(false);
    }, 250);
  }, [endRound]);

  const handleTap = useCallback(() => {
    if (phaseRef.current !== 'playing' || lockRef.current) return;
    playerPctRef.current = Math.min(GOAL_PCT, playerPctRef.current + 4.5);
    setPlayerPct(Math.round(playerPctRef.current));
    setHitTrigger(t => t + 1);
    Animated.timing(playerAnim, {
      toValue: playerPctRef.current / GOAL_PCT,
      duration: 100, easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();
    if (playerPctRef.current >= GOAL_PCT) endRound(true);
  }, [endRound]);

  const launch = useCallback(() => {
    phaseRef.current = 'playing';
    playerPctRef.current = 0; aiPctRef.current = 0;
    playerWinsRef.current = 0; aiWinsRef.current = 0;
    roundRef.current = 1; lockRef.current = false;
    setPhase('playing'); setPlayerPct(0); setAiPct(0);
    setPlayerWins(0); setAiWins(0); setRound(1);
    setResult(null); setRoundMsg('');
    playerAnim.setValue(0); aiAnim.setValue(0);
    startAI();
  }, [startAI]);

  useEffect(() => () => stopAll(), []);

  if (phase === 'ready') return (
    <View style={s.center}>
      <Text style={{ fontSize: 72, marginBottom: 8 }}>🤼</Text>
      <Text style={s.bigTitle}>Güreş Maçı</Text>
      <Text style={s.sub}>Hızlı bas, rakibi yık! {WIN_SET} tur kazan.</Text>
      <View style={s.rulesBox}>
        {[
          { icon: '👆', text: 'Büyük butona olabildiğince hızlı bas' },
          { icon: '🤖', text: 'Rakip otomatik dolduruyor — sen daha hızlı olmalısın' },
          { icon: '🏆', text: `${WIN_SET} tur kazan → Şampiyon!` },
          { icon: '🔄', text: `Toplam ${ROUNDS} tur` },
        ].map((r, i) => (
          <View key={i} style={s.ruleRow}>
            <Text style={s.ruleIcon}>{r.icon}</Text>
            <Text style={s.ruleText}>{r.text}</Text>
          </View>
        ))}
      </View>
      <TouchableOpacity style={s.startBtn} onPress={launch}>
        <Text style={s.startBtnTxt}>🤼  Güreş!</Text>
      </TouchableOpacity>
    </View>
  );

  if (phase === 'done') {
    const won = result === 'win';
    const b   = calcBonus(playerWinsRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 72, marginBottom: 8 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={s.bigTitle}>{won ? 'Güreş Şampiyonu!' : 'Oyun Bitti'}</Text>
        <Text style={s.sub}>{won ? `${WIN_SET}-${aiWinsRef.current} tur farkıyla kazandın!` : `${playerWinsRef.current}-${aiWinsRef.current} yenildin.`}</Text>
        <View style={s.statsRow}>
          <View style={s.statChip}><Text style={s.statV}>{playerWinsRef.current}/{ROUNDS}</Text><Text style={s.statL}>🤼 Tur</Text></View>
          <View style={s.statChip}><Text style={s.statV}>{aiWinsRef.current}</Text><Text style={s.statL}>🤖 Rakip</Text></View>
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🤼 Kazanılan Bonuslar</Text>
          {b.strength   > 0 && <Text style={s.bonusLine}>💪 Güç +{b.strength}</Text>}
          {b.endurance  > 0 && <Text style={s.bonusLine}>🏃 Dayanıklılık +{b.endurance}</Text>}
          {b.confidence > 0 && <Text style={s.bonusLine}>⚡ Güven +{b.confidence}</Text>}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={() => onComplete(b)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.hud}>
        <View style={s.hudRow}>
          <View><Text style={s.hudLabel}>TUR</Text><Text style={s.hudBig}>{round}/{ROUNDS}</Text></View>
          <View style={s.hudCenter}><Text style={s.hudTitle}>🤼 Güreş</Text></View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.hudLabel}>SKOR</Text>
            <Text style={s.hudBig}>{playerWins} — {aiWins}</Text>
          </View>
        </View>
      </View>

      <View style={s.court}>
        {/* Güç çubukları */}
        <View style={s.barsSection}>
          {/* Oyuncu */}
          <View style={s.barWrap}>
            <Text style={s.barLabel}>SEN 🟢</Text>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, s.playerBar, {
                width: playerAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={s.barPct}>{playerPct}%</Text>
          </View>

          {/* VS */}
          <Text style={s.vsText}>VS</Text>

          {/* Rakip */}
          <View style={s.barWrap}>
            <Text style={s.barLabel}>🔴 RAKİP</Text>
            <View style={s.barTrack}>
              <Animated.View style={[s.barFill, s.aiBar, {
                width: aiAnim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }),
              }]} />
            </View>
            <Text style={s.barPct}>{aiPct}%</Text>
          </View>
        </View>

        {/* Tur mesajı */}
        {roundMsg ? <Text style={s.roundMsg}>{roundMsg}</Text> : null}

        {/* Güreş butonu */}
        <TouchableOpacity
          style={[s.tapBtn, lockRef.current && { opacity: 0.5 }]}
          onPress={handleTap}
          activeOpacity={0.7}
        >
          <Text style={s.tapBtnText}>🤼</Text>
          <Text style={s.tapBtnLabel}>GÜREŞ!</Text>
        </TouchableOpacity>

        <Flash color="#22c55e" trigger={hitTrigger} />
        <Flash color="#ef4444" trigger={missTrigger} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#1a0510' },
  center:       { flex: 1, backgroundColor: '#1a0510', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 4, paddingHorizontal: 16, backgroundColor: '#220a15', borderBottomWidth: 1, borderBottomColor: '#5a1a2a' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudLabel:     { color: '#8a3a4a', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  court:        { flex: 1, backgroundColor: '#1c0610', alignItems: 'center', justifyContent: 'space-evenly', padding: 20 },
  barsSection:  { width: '100%', gap: 10, alignItems: 'center' },
  barWrap:      { width: '100%', gap: 6 },
  barLabel:     { color: '#e6edf3', fontSize: 13, fontWeight: '800' },
  barTrack:     { height: 28, backgroundColor: '#2a0d18', borderRadius: 14, overflow: 'hidden', borderWidth: 1, borderColor: '#5a1a2a' },
  barFill:      { height: '100%', borderRadius: 14 },
  playerBar:    { backgroundColor: '#22c55e' },
  aiBar:        { backgroundColor: RCOLOR },
  barPct:       { color: '#8b949e', fontSize: 11, fontWeight: '700', textAlign: 'right' },
  vsText:       { color: '#e6edf3', fontSize: 28, fontWeight: '900' },
  roundMsg:     { color: '#fbbf24', fontSize: 20, fontWeight: '900', textAlign: 'center' },
  tapBtn:       { width: 180, height: 180, borderRadius: 90, backgroundColor: RCOLOR, alignItems: 'center', justifyContent: 'center', shadowColor: RCOLOR, shadowOpacity: 0.7, shadowRadius: 20, elevation: 12 },
  tapBtnText:   { fontSize: 64 },
  tapBtnLabel:  { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 2 },
  bigTitle:     { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 18, lineHeight: 19 },
  rulesBox:     { backgroundColor: '#220a15', borderRadius: 16, padding: 16, marginBottom: 24, width: '100%', gap: 10, borderWidth: 1, borderColor: '#5a1a2a' },
  ruleRow:      { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  ruleIcon:     { fontSize: 18, width: 26, textAlign: 'center' },
  ruleText:     { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:     { backgroundColor: '#be123c', paddingVertical: 15, paddingHorizontal: 48, borderRadius: 16, shadowColor: RCOLOR, shadowOpacity: 0.6, shadowRadius: 12 },
  startBtnTxt:  { color: '#fff', fontSize: 17, fontWeight: '900' },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statChip:     { backgroundColor: '#220a15', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 85, borderWidth: 1, borderColor: '#5a1a2a' },
  statV:        { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:        { color: '#8a3a4a', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#220a15', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#5a1a2a' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:    { color: RCOLOR, fontSize: 13, marginBottom: 2 },
});
