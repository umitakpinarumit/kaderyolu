/**
 * LibraryQuiz — "Kim Milyoner Olmak İster" tarzı bilgi yarışması
 * 8 soru, 4 şık (A/B/C/D), artan zorluk.
 * Jokerler: 50:50 ve Seyirci Yardımı (her biri 1 kez).
 * Soru başına 30 saniye. Yanlış/süre dolması → oyun biter.
 * Bonus: intelligence / focus / confidence.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

const TIME_S = 30;

const QUESTIONS = [
  // Easy
  { q: "Türkiye'nin başkenti neresidir?", opts: ['İstanbul', 'Ankara', 'İzmir', 'Bursa'], a: 1 },
  { q: 'Güneş sisteminde kaç gezegen vardır?', opts: ['7', '8', '9', '10'], a: 1 },
  { q: "Su'nun kimyasal formülü nedir?", opts: ['CO2', 'H2O', 'NaCl', 'O2'], a: 1 },
  // Medium
  { q: "Türkiye'nin en uzun nehri hangisidir?", opts: ['Nil', 'Fırat', 'Kızılırmak', 'Dicle'], a: 2 },
  { q: "Osmanlı İmparatorluğu'nun başkentlerinden biri değildir?", opts: ['Bursa', 'İznik', 'Edirne', 'İstanbul'], a: 1 },
  { q: "Işık hızı saniyede yaklaşık kaç km'dir?", opts: ['100.000', '300.000', '1.000.000', '3.000'], a: 1 },
  // Hard
  { q: "DNA'nın çift sarmal yapısını keşfeden bilim insanları kimlerdir?", opts: ['Darwin&Lamarck', 'Watson&Crick', 'Mendel&Morgan', 'Pasteur&Koch'], a: 1 },
  { q: "Hangi element periyodik tabloda 'Au' sembolü ile gösterilir?", opts: ['Gümüş', 'Platin', 'Altın', 'Bakır'], a: 2 },
];

const PRIZES = ['100', '200', '300', '500', '1K', '5K', '25K', '1M'];
const LETTERS = ['A', 'B', 'C', 'D'];

const calcBonus = (correctCount) => ({
  intelligence: correctCount >= 7 ? 6 : correctCount >= 5 ? 4 : correctCount >= 3 ? 2 : 1,
  focus:        correctCount >= 6 ? 4 : correctCount >= 4 ? 3 : correctCount >= 2 ? 1 : 0,
  confidence:   correctCount >= 8 ? 5 : correctCount >= 6 ? 3 : correctCount >= 4 ? 2 : 0,
});

/** Pick `n` random wrong option indices for the given question */
function pickWrong(question, n) {
  const wrong = [0, 1, 2, 3].filter(i => i !== question.a);
  for (let i = wrong.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = wrong[i]; wrong[i] = wrong[j]; wrong[j] = tmp;
  }
  return wrong.slice(0, n);
}

/** Audience distribution: correct gets ~60-70%, rest split remainder */
function audienceVotes(question, visible) {
  const votes = [0, 0, 0, 0];
  const correctPct = 60 + Math.floor(Math.random() * 11); // 60-70
  votes[question.a] = correctPct;
  let remaining = 100 - correctPct;
  const others = visible.filter(i => i !== question.a);
  others.forEach((idx, k) => {
    if (k === others.length - 1) votes[idx] = remaining;
    else {
      const v = Math.floor(Math.random() * (remaining - (others.length - 1 - k)));
      votes[idx] = v;
      remaining -= v;
    }
  });
  return votes;
}

export default function LibraryQuiz({ choice, onComplete }) {
  const [qIdx, setQIdx]         = useState(0);
  const [timeLeft, setTime]     = useState(TIME_S);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked]     = useState(false);   // answer being evaluated
  const [hidden, setHidden]     = useState([]);       // 50:50 removed indices
  const [used5050, setUsed5050] = useState(false);
  const [usedAud, setUsedAud]   = useState(false);
  const [votes, setVotes]       = useState(null);     // audience bar data
  const [phase, setPhase]       = useState('play');   // 'play' | 'over'
  const [won, setWon]           = useState(false);

  const timerRef   = useRef(null);
  const doneRef    = useRef(false);
  const correctRef = useRef(0);

  const question = QUESTIONS[qIdx];

  // Per-question countdown
  useEffect(() => {
    if (phase !== 'play') return;
    setTime(TIME_S);
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          endGame(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, phase]);

  const endGame = (didWin) => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    setWon(didWin);
    setPhase('over');
  };

  const handleAnswer = (idx) => {
    if (locked || selected !== null || hidden.includes(idx) || phase !== 'play') return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setLocked(true);

    const correct = idx === question.a;
    setTimeout(() => {
      if (!correct) {
        endGame(false);
        return;
      }
      correctRef.current += 1;
      // Next question or win
      setTimeout(() => {
        if (qIdx + 1 >= QUESTIONS.length) {
          endGame(true);
        } else {
          setSelected(null);
          setLocked(false);
          setHidden([]);
          setVotes(null);
          setQIdx(qIdx + 1);
        }
      }, 700);
    }, 1100);
  };

  const use5050 = () => {
    if (used5050 || locked || phase !== 'play') return;
    setUsed5050(true);
    setHidden(pickWrong(question, 2));
  };

  const useAudience = () => {
    if (usedAud || locked || phase !== 'play') return;
    setUsedAud(true);
    const visible = [0, 1, 2, 3].filter(i => !hidden.includes(i));
    setVotes(audienceVotes(question, visible));
  };

  // ── SONUÇ ─────────────────────────────────────────────────────────────────
  if (phase === 'over') {
    const cc = correctRef.current;
    const bonus = calcBonus(cc);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>{won ? '🏆📚' : cc >= 4 ? '📖' : '📕'}</Text>
        <Text style={s.resultTitle}>{won ? 'KAZANDIN!' : `${cc}/${QUESTIONS.length} Doğru`}</Text>
        <Text style={s.resultSub}>
          {won ? '1.000.000 Kitap Puanı! 🎉'
            : cc >= 6 ? 'Çok iyi bir okuyucusun!'
            : cc >= 3 ? 'Fena değil, okumaya devam!'
            : 'Daha çok kitap okumalısın!'}
        </Text>
        <Text style={s.prizeWon}>
          {cc > 0 ? `Kazanılan: ${PRIZES[cc - 1]} Kitap Puanı` : 'Puan kazanılamadı'}
        </Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={s.bonusBox}>
            <Text style={s.bonusTitle}>📚 Kazanılan bonuslar</Text>
            {bonus.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
            {bonus.focus > 0        && <Text style={s.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
            {bonus.confidence > 0   && <Text style={s.bonusLine}>💪 Özgüven +{bonus.confidence}</Text>}
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={() => onComplete(bonus)}>
          <Text style={s.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timerPct = (timeLeft / TIME_S) * 100;
  const lowTime  = timeLeft <= 10;

  return (
    <View style={s.screen}>
      {/* HUD */}
      <View style={s.hud}>
        <Text style={s.title}>📚 KİTAP YARIŞMASI</Text>
        <View style={s.hudRow}>
          <Text style={s.qNum}>Soru {qIdx + 1}/{QUESTIONS.length}</Text>
          <Text style={[s.timer, lowTime && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={s.timerTrack}>
          <View style={[s.timerFill, { width: `${timerPct}%`, backgroundColor: lowTime ? '#f85149' : '#fbbf24' }]} />
        </View>
      </View>

      <View style={s.body}>
        {/* Prize ladder */}
        <View style={s.ladder}>
          {PRIZES.map((p, i) => {
            const rung = QUESTIONS.length - 1 - i; // top = highest
            const isCurrent = rung === qIdx;
            const isPassed  = rung < qIdx;
            return (
              <View key={i} style={[s.rung, isCurrent && s.rungCurrent, isPassed && s.rungPassed]}>
                <Text style={[s.rungTxt, isCurrent && s.rungTxtCurrent]}>{rung + 1}. {p}</Text>
              </View>
            );
          })}
        </View>

        {/* Question + options */}
        <View style={s.main}>
          <View style={s.qBox}>
            <Text style={s.qText}>{question.q}</Text>
          </View>

          {/* Lifelines */}
          <View style={s.lifelines}>
            <TouchableOpacity
              style={[s.lifeBtn, used5050 && s.lifeBtnUsed]}
              onPress={use5050} disabled={used5050 || locked}
            >
              <Text style={[s.lifeTxt, used5050 && s.lifeTxtUsed]}>50:50</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.lifeBtn, usedAud && s.lifeBtnUsed]}
              onPress={useAudience} disabled={usedAud || locked}
            >
              <Text style={[s.lifeTxt, usedAud && s.lifeTxtUsed]}>👥 Seyirci</Text>
            </TouchableOpacity>
          </View>

          {/* Audience chart */}
          {votes && (
            <View style={s.chart}>
              {votes.map((v, i) => (
                hidden.includes(i) ? null : (
                  <View key={i} style={s.chartCol}>
                    <Text style={s.chartPct}>{v}%</Text>
                    <View style={s.chartBarTrack}>
                      <View style={[s.chartBar, { height: `${v}%` }]} />
                    </View>
                    <Text style={s.chartLabel}>{LETTERS[i]}</Text>
                  </View>
                )
              ))}
            </View>
          )}

          {/* Options */}
          {question.opts.map((opt, i) => {
            const isHidden  = hidden.includes(i);
            const isSel     = selected === i;
            const showRight = selected !== null && i === question.a;
            const showWrong = isSel && i !== question.a;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.opt,
                  isHidden && s.optHidden,
                  showRight && s.optCorrect,
                  showWrong && s.optWrong,
                ]}
                onPress={() => handleAnswer(i)}
                disabled={isHidden || locked}
                activeOpacity={0.8}
              >
                <Text style={s.optLetter}>{LETTERS[i]}</Text>
                <Text style={[s.optTxt, isHidden && { opacity: 0 }]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050a14' },
  center: { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud: {
    paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d',
  },
  title: { color: '#fbbf24', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  qNum: { color: '#8b949e', fontSize: 13, fontWeight: '700' },
  timer: { color: '#e6edf3', fontSize: 16, fontWeight: '900' },
  timerTrack: { width: '100%', height: 4, backgroundColor: '#21262d', borderRadius: 2, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 2 },
  body: { flex: 1, flexDirection: 'row', padding: 12, gap: 10 },
  ladder: { width: 70, justifyContent: 'center', gap: 4 },
  rung: { paddingVertical: 5, paddingHorizontal: 4, borderRadius: 6, backgroundColor: '#0d1117', borderWidth: 1, borderColor: '#21262d' },
  rungCurrent: { backgroundColor: '#3b2f05', borderColor: '#fbbf24' },
  rungPassed: { backgroundColor: '#052e16', borderColor: '#15803d' },
  rungTxt: { color: '#8b949e', fontSize: 10, fontWeight: '700', textAlign: 'center' },
  rungTxtCurrent: { color: '#fbbf24' },
  main: { flex: 1 },
  qBox: { backgroundColor: '#0d1117', borderRadius: 14, borderWidth: 2, borderColor: '#1e3a8a', padding: 14, marginBottom: 10, minHeight: 80, justifyContent: 'center' },
  qText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center', lineHeight: 21 },
  lifelines: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  lifeBtn: { flex: 1, backgroundColor: '#1e3a8a', borderRadius: 10, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: '#3b82f6' },
  lifeBtnUsed: { backgroundColor: '#1f2937', borderColor: '#374151', opacity: 0.5 },
  lifeTxt: { color: '#dbeafe', fontSize: 13, fontWeight: '800' },
  lifeTxtUsed: { color: '#6b7280' },
  chart: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 90, marginBottom: 10, paddingHorizontal: 8 },
  chartCol: { alignItems: 'center', flex: 1 },
  chartPct: { color: '#fbbf24', fontSize: 10, fontWeight: '700' },
  chartBarTrack: { width: 20, height: 60, justifyContent: 'flex-end', marginVertical: 2 },
  chartBar: { width: '100%', backgroundColor: '#fbbf24', borderRadius: 3 },
  chartLabel: { color: '#8b949e', fontSize: 11, fontWeight: '800' },
  opt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1e3a8a', borderRadius: 12, paddingVertical: 12, paddingHorizontal: 12, marginBottom: 8, borderWidth: 1, borderColor: '#3b82f6' },
  optHidden: { backgroundColor: '#1f2937', borderColor: '#374151', opacity: 0.4 },
  optCorrect: { backgroundColor: '#15803d', borderColor: '#22c55e' },
  optWrong: { backgroundColor: '#b91c1c', borderColor: '#ef4444' },
  optLetter: { color: '#fbbf24', fontSize: 15, fontWeight: '900', width: 24 },
  optTxt: { color: '#fff', fontSize: 14, fontWeight: '600', flex: 1 },
  resultTitle: { color: '#fbbf24', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub: { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 8 },
  prizeWon: { color: '#fbbf24', fontSize: 16, fontWeight: '800', marginBottom: 16 },
  bonusBox: { backgroundColor: '#0d1117', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#21262d' },
  bonusTitle: { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine: { color: '#fbbf24', fontSize: 13, marginBottom: 2 },
  btn: { backgroundColor: '#ca8a04', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
