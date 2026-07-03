/**
 * CinemaGame — "Emojiden Filmi Tahmin Et" mini-oyunu
 * Emoji dizisi bir filmi temsil eder; oyuncu 4 şıktan doğru filmi seçer.
 * 8 soru, soru başına 30 saniye, 4 şık.
 * Bonus: creativity / happiness / social.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useEffect, useRef, useState } from 'react';
import {
  Platform, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

const TIME_S = 30;
const QUESTION_COUNT = 8;

const MOVIES = [
  { clue: '🦁👑🌅', opts: ['Aladdin', 'Aslan Kral', 'Tarzan', 'Moana'], a: 1 },
  { clue: '🕷️🏙️🦸', opts: ['Batman', 'Superman', 'Örümcek Adam', 'Iron Man'], a: 2 },
  { clue: '🐟🌊💙', opts: ['Şirin Balık', 'Kayıp Balık Nemo', 'Moby Dick', 'Deniz Kızı'], a: 1 },
  { clue: '⚡👦🏫🧙', opts: ['Narnia', 'Harry Potter', 'Yüzüklerin Efendisi', 'Hobbit'], a: 1 },
  { clue: '🦕🏝️🚁😱', opts: ['Kong Adası', 'Jurassic Park', 'Avatar', 'Titanic'], a: 1 },
  { clue: '🤖🚗🔧💥', opts: ['Wall-E', 'Cars', 'Transformers', 'Iron Man'], a: 2 },
  { clue: '👸❄️⛄🎵', opts: ['Sindirella', 'Frozen', 'Rapunzel', 'Pamuk Prenses'], a: 1 },
  { clue: '🐠🌊🐙🗺️', opts: ['Şirin Balık', 'Nemo', 'Moana', 'Su Altında'], a: 2 },
  { clue: '🦁🐘🦒🎪', opts: ['Zootopia', 'Madagaskar', 'Dumbo', 'Orman Çocuğu'], a: 1 },
  { clue: '⚽🐼🥋', opts: ['Kung Fu Panda', 'Kung Fu Hustle', 'Furious 5', 'Karate Kid'], a: 0 },
];

const LETTERS = ['A', 'B', 'C', 'D'];

const calcBonus = (score) => ({
  creativity: score >= 7 ? 5 : score >= 5 ? 4 : score >= 3 ? 2 : 1,
  happiness:  score >= 6 ? 4 : score >= 4 ? 3 : score >= 2 ? 1 : 0,
  social:     score >= 6 ? 3 : score >= 3 ? 2 : score >= 1 ? 1 : 0,
});

/** Shuffle MOVIES and take QUESTION_COUNT */
function pickQuestions() {
  const arr = [...MOVIES];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
  return arr.slice(0, QUESTION_COUNT);
}

export default function CinemaGame({ choice, onComplete }) {
  const questionsRef = useRef(pickQuestions());
  const [qIdx, setQIdx]         = useState(0);
  const [timeLeft, setTime]     = useState(TIME_S);
  const [selected, setSelected] = useState(null);
  const [locked, setLocked]     = useState(false);
  const [score, setScore]       = useState(0);
  const [done, setDone]         = useState(false);

  const scoreRef = useRef(0);
  const doneRef  = useRef(false);
  const timerRef = useRef(null);

  const question = questionsRef.current[qIdx];

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    setDone(true);
  };

  const next = () => {
    if (qIdx + 1 >= questionsRef.current.length) { finish(); return; }
    setSelected(null);
    setLocked(false);
    setQIdx(qIdx + 1);
  };

  // Per-question timer
  useEffect(() => {
    if (done) return;
    setTime(TIME_S);
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          // time out — mark as wrong, advance
          if (!doneRef.current) {
            setLocked(true);
            setSelected(-1);
            setTimeout(next, 1100);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIdx, done]);

  const handleAnswer = (idx) => {
    if (locked || selected !== null) return;
    clearInterval(timerRef.current);
    setSelected(idx);
    setLocked(true);
    if (idx === question.a) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    setTimeout(next, 1100);
  };

  // ── SONUÇ ─────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(scoreRef.current);
    const total = questionsRef.current.length;
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>
          {scoreRef.current >= total - 1 ? '🎬🏆' : scoreRef.current >= total / 2 ? '🍿' : '🎥'}
        </Text>
        <Text style={s.resultTitle}>{scoreRef.current}/{total} Doğru!</Text>
        <Text style={s.resultSub}>
          {scoreRef.current >= total - 1 ? 'Gerçek bir sinema uzmanısın!'
            : scoreRef.current >= total / 2 ? 'İyi bir film izleyicisisin!'
            : 'Daha çok film izlemelisin!'}
        </Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={s.bonusBox}>
            <Text style={s.bonusTitle}>🎬 Kazanılan bonuslar</Text>
            {bonus.creativity > 0 && <Text style={s.bonusLine}>🎨 Yaratıcılık +{bonus.creativity}</Text>}
            {bonus.happiness > 0  && <Text style={s.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
            {bonus.social > 0     && <Text style={s.bonusLine}>🤝 Sosyallik +{bonus.social}</Text>}
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
      <View style={s.hud}>
        <Text style={s.title}>🎬 SİNEMA TAHMİN</Text>
        <View style={s.hudRow}>
          <Text style={s.qNum}>Soru {qIdx + 1}/{questionsRef.current.length}</Text>
          <Text style={s.hudScore}>✅ {score}</Text>
          <Text style={[s.timer, lowTime && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={s.timerTrack}>
          <View style={[s.timerFill, { width: `${timerPct}%`, backgroundColor: lowTime ? '#f85149' : '#a78bfa' }]} />
        </View>
      </View>

      <View style={s.clueBox}>
        <Text style={s.clueLabel}>Bu emojiler hangi filmi anlatıyor?</Text>
        <Text style={s.clue}>{question.clue}</Text>
      </View>

      <View style={s.opts}>
        {question.opts.map((opt, i) => {
          const showRight = selected !== null && i === question.a;
          const showWrong = selected === i && i !== question.a;
          return (
            <TouchableOpacity
              key={i}
              style={[s.opt, showRight && s.optCorrect, showWrong && s.optWrong]}
              onPress={() => handleAnswer(i)}
              disabled={locked}
              activeOpacity={0.8}
            >
              <Text style={s.optLetter}>{LETTERS[i]}</Text>
              <Text style={s.optTxt}>{opt}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#0a0614' },
  center: { flex: 1, backgroundColor: '#0a0614', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud: {
    paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: '#140a26', borderBottomWidth: 1, borderColor: '#3b1d6b',
  },
  title: { color: '#c4b5fd', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  hudRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  qNum: { color: '#8b949e', fontSize: 13, fontWeight: '700' },
  hudScore: { color: '#4ade80', fontSize: 14, fontWeight: '700' },
  timer: { color: '#e6edf3', fontSize: 15, fontWeight: '900' },
  timerTrack: { width: '100%', height: 4, backgroundColor: '#21262d', borderRadius: 2, overflow: 'hidden' },
  timerFill: { height: '100%', borderRadius: 2 },
  clueBox: { alignItems: 'center', paddingVertical: 30, paddingHorizontal: 20 },
  clueLabel: { color: '#8b949e', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  clue: { fontSize: 64, textAlign: 'center', letterSpacing: 4 },
  opts: { paddingHorizontal: 20, gap: 10 },
  opt: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#2e1065', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: '#7c3aed' },
  optCorrect: { backgroundColor: '#15803d', borderColor: '#22c55e' },
  optWrong: { backgroundColor: '#b91c1c', borderColor: '#ef4444' },
  optLetter: { color: '#c4b5fd', fontSize: 16, fontWeight: '900', width: 26 },
  optTxt: { color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 },
  resultTitle: { color: '#c4b5fd', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub: { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  bonusBox: { backgroundColor: '#140a26', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#3b1d6b' },
  bonusTitle: { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine: { color: '#c4b5fd', fontSize: 13, marginBottom: 2 },
  btn: { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
