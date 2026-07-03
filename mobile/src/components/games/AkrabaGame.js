/**
 * AkrabaGame — Akraba Tanıma Yarışması 👨‍👩‍👧
 * Aile ilişkilerini öğren: "Babamın erkek kardeşi kimdir?" tarzında sorular.
 * 4 şıklı çoktan seçmeli, 10 soru, 60 saniye.
 * Bonus: social / empathy / happiness
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── Sorular veri tabanı ──────────────────────────────────────────────────────
const ALL_QUESTIONS = [
  { q: 'Babamın erkek kardeşine ne derim?', correct: 'Amca',      opts: ['Amca',      'Dayı',       'Enişte',    'Kuzen']     },
  { q: 'Annemin erkek kardeşine ne derim?', correct: 'Dayı',      opts: ['Amca',      'Dayı',       'Enişte',    'Ağabey']    },
  { q: 'Babamın annesine ne derim?',        correct: 'Babaanne',  opts: ['Anneanne',  'Babaanne',   'Nine',      'Hala']      },
  { q: 'Annemin annesine ne derim?',        correct: 'Anneanne',  opts: ['Anneanne',  'Babaanne',   'Büyükanne', 'Nene']      },
  { q: 'Babamın babasına ne derim?',        correct: 'Dede',      opts: ['Dede',      'Büyükbaba',  'Amca',      'Dayı']      },
  { q: 'Annemin babasına ne derim?',        correct: 'Dede',      opts: ['Dede',      'Büyükbaba',  'Amca',      'Ağabey']    },
  { q: 'Babamın kız kardeşine ne derim?',   correct: 'Hala',      opts: ['Teyze',     'Hala',       'Yenge',     'Abla']      },
  { q: 'Annemin kız kardeşine ne derim?',   correct: 'Teyze',     opts: ['Teyze',     'Hala',       'Yenge',     'Abla']      },
  { q: 'Amcamın eşine ne derim?',           correct: 'Yenge',     opts: ['Yenge',     'Hala',       'Teyze',     'Abla']      },
  { q: 'Dayımın eşine ne derim?',           correct: 'Yenge',     opts: ['Yenge',     'Hala',       'Teyze',     'Enişte']    },
  { q: 'Halamın kocasına ne derim?',        correct: 'Enişte',    opts: ['Enişte',    'Amca',       'Dayı',      'Ağabey']    },
  { q: 'Teyzemi nasıl tarif ederim?',       correct: 'Annemin kız kardeşi', opts: ['Annemin kız kardeşi', 'Babamın kız kardeşi', 'Amcamın eşi', 'Dayımın eşi'] },
  { q: 'Halam kimin kız kardeşidir?',       correct: 'Babamın',   opts: ['Babamın',   'Annemin',    'Amcamın',   'Dayımın']   },
  { q: 'Dayım kimin erkek kardeşidir?',     correct: 'Annemin',   opts: ['Annemin',   'Babamın',    'Amcamın',   'Eniştenim'] },
  { q: 'Amcamın çocuğuna ne derim?',        correct: 'Kuzen',     opts: ['Kuzen',     'Yeğen',      'Torun',     'Kardeş']    },
  { q: 'Teyzemi çocuğuna ne derim?',        correct: 'Kuzen',     opts: ['Kuzen',     'Yeğen',      'Torun',     'Hısım']     },
  { q: 'Benim kardeşimin çocuğuna ne derim?', correct: 'Yeğen',   opts: ['Yeğen',     'Kuzen',      'Torun',     'Kayın']     },
  { q: 'Büyükanneme "torun" diyen kişi kimdir?', correct: 'Ben',  opts: ['Ben',       'Babam',      'Amcam',     'Dayım']     },
  { q: 'Babaannem benim babamın nesidir?',  correct: 'Annesi',    opts: ['Annesi',    'Kız kardeşi','Teyzesi',   'Halası']    },
  { q: 'Anneannemi kim ile paylaşırım?',    correct: 'Annemin kardeşleriyle', opts: ['Annemin kardeşleriyle', 'Babamın kardeşleriyle', 'Sadece kendim', 'Amcamın çocuklarıyla'] },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const TOTAL_Q  = 10;
const TIME_S   = 60;

const calcBonus = (score) => ({
  social:    score >= 9 ? 5 : score >= 7 ? 4 : score >= 5 ? 3 : score >= 3 ? 2 : 1,
  empathy:   score >= 8 ? 4 : score >= 6 ? 3 : score >= 4 ? 2 : 1,
  happiness: score >= 8 ? 3 : score >= 5 ? 2 : score >= 3 ? 1 : 0,
});

// ─── Cevap butonu ─────────────────────────────────────────────────────────────
function AnswerButton({ label, state, onPress, disabled }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'correct' || state === 'wrong') {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.06, friction: 4, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.0,  friction: 6, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);

  const bg    = state === 'correct' ? '#14532d' : state === 'wrong' ? '#450a0a' : '#0d1628';
  const bord  = state === 'correct' ? '#22c55e' : state === 'wrong' ? '#ef4444' : '#1c2e44';
  const color = state === 'correct' ? '#4ade80' : state === 'wrong' ? '#f87171' : '#c9d4df';
  const icon  = state === 'correct' ? '✓ ' : state === 'wrong' ? '✗ ' : '';

  return (
    <TouchableOpacity onPress={onPress} disabled={disabled || !!state} activeOpacity={0.75}>
      <Animated.View style={[ak.optBtn, { backgroundColor: bg, borderColor: bord, transform: [{ scale: scaleAnim }] }]}>
        <Text style={[ak.optTxt, { color }]}>{icon}{label}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function AkrabaGame({ choice, onComplete }) {
  const questions = useRef(shuffle(ALL_QUESTIONS).slice(0, TOTAL_Q));
  const [qIdx,      setQIdx]     = useState(0);
  const [score,     setScore]    = useState(0);
  const [timeLeft,  setTime]     = useState(TIME_S);
  const [selected,  setSelected] = useState(null); // seçilen şık index
  const [done,      setDone]     = useState(false);

  const doneRef  = useRef(false);
  const timerRef = useRef(null);
  const scoreRef = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    setDone(true);
  }, []);

  // Zamanlayıcı
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { finish(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finish]);

  const currentQ = questions.current[qIdx];

  const handleAnswer = useCallback((optLabel, optIdx) => {
    if (selected !== null || doneRef.current) return;
    setSelected(optIdx);

    const isCorrect = optLabel === currentQ.correct;
    if (isCorrect) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    // 1 saniye bekle, sonra ileri geç
    setTimeout(() => {
      const next = qIdx + 1;
      if (next >= TOTAL_Q) {
        finish();
      } else {
        setQIdx(next);
        setSelected(null);
      }
    }, 1000);
  }, [selected, currentQ, qIdx, finish]);

  // ── SONUÇ ─────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(scoreRef.current);
    const medal = scoreRef.current >= 9 ? '🏆' : scoreRef.current >= 7 ? '🥇' : scoreRef.current >= 5 ? '🥈' : '🎁';
    return (
      <View style={ak.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>{medal}</Text>
        <Text style={ak.resultTitle}>{scoreRef.current}/{TOTAL_Q} Doğru!</Text>
        <Text style={ak.resultSub}>
          {scoreRef.current >= 9 ? 'Akrabaları çok iyi tanıyorsun! Aile uzmanısın!' :
           scoreRef.current >= 7 ? 'Harika! Aile bağlarını güzel kuruyorsun.' :
           scoreRef.current >= 5 ? 'Fena değil! Biraz daha pratik yapar mısın?' :
           'Akrabaları biraz daha tanımalısın!'}
        </Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={ak.bonusBox}>
            <Text style={ak.bonusTitle}>👨‍👩‍👧 Kazanılan Bonuslar</Text>
            {bonus.social    > 0 && <Text style={ak.bonusLine}>🤝 Sosyallik +{bonus.social}</Text>}
            {bonus.empathy   > 0 && <Text style={ak.bonusLine}>💛 Empati +{bonus.empathy}</Text>}
            {bonus.happiness > 0 && <Text style={ak.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
          </View>
        )}
        <TouchableOpacity style={ak.btn} onPress={() => onComplete(bonus)}>
          <Text style={ak.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentQ) return null;

  // Hangi şıklar doğru/yanlış gösterilecek?
  const getOptState = (optLabel, i) => {
    if (selected === null) return null;
    if (optLabel === currentQ.correct) return 'correct';
    if (i === selected) return 'wrong';
    return null;
  };

  const progress = qIdx / TOTAL_Q;

  return (
    <View style={ak.screen}>
      {/* HUD */}
      <View style={ak.hud}>
        <View style={ak.hudRow}>
          <Text style={ak.hudScore}>🎁 {score}/{TOTAL_Q}</Text>
          <Text style={ak.hudTitle}>👨‍👩‍👧 Akraba Tanıma</Text>
          <Text style={[ak.hudTimer, timeLeft <= 10 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={ak.progressBar}>
          <View style={[ak.progressFill, { width: `${progress * 100}%` }]} />
        </View>
        <Text style={ak.qCounter}>Soru {qIdx + 1} / {TOTAL_Q}</Text>
      </View>

      {/* Soru kartı */}
      <View style={ak.qCard}>
        <Text style={ak.qText}>{currentQ.q}</Text>
      </View>

      {/* Şıklar */}
      <View style={ak.optsWrap}>
        {currentQ.opts.map((opt, i) => (
          <AnswerButton
            key={`${qIdx}-${i}`}
            label={opt}
            state={selected !== null ? getOptState(opt, i) : null}
            onPress={() => handleAnswer(opt, i)}
            disabled={selected !== null}
          />
        ))}
      </View>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const ak = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#050a14' },
  center:      { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:         { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d' },
  hudRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hudTitle:    { color: '#f0abfc', fontSize: 14, fontWeight: '900' },
  hudScore:    { color: '#4ade80', fontSize: 13, fontWeight: '700', minWidth: 55 },
  hudTimer:    { color: '#e6edf3', fontSize: 14, fontWeight: '900', minWidth: 55, textAlign: 'right' },
  progressBar: { height: 4, backgroundColor: '#21262d', borderRadius: 2, overflow: 'hidden', marginBottom: 3 },
  progressFill:{ height: '100%', backgroundColor: '#a855f7', borderRadius: 2 },
  qCounter:    { color: '#6b7280', fontSize: 10, textAlign: 'center' },
  qCard:       { margin: 16, backgroundColor: '#12082a', borderRadius: 18, padding: 24, borderWidth: 1.5, borderColor: '#3b1d52', minHeight: 120, justifyContent: 'center' },
  qText:       { color: '#e6edf3', fontSize: 19, fontWeight: '800', textAlign: 'center', lineHeight: 27 },
  optsWrap:    { paddingHorizontal: 16, gap: 10, flex: 1, justifyContent: 'center' },
  optBtn:      { borderRadius: 14, borderWidth: 2, paddingVertical: 14, paddingHorizontal: 18, alignItems: 'center' },
  optTxt:      { fontSize: 16, fontWeight: '700', textAlign: 'center' },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  bonusBox:    { backgroundColor: '#0d1117', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#21262d' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#f0abfc', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#a21caf', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
