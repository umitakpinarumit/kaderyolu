/**
 * MuseumQuiz — Müze mini-oyunu
 * Görsel kimlik testi: kategori başlığı + 6 sergi kartı (3×2 grid).
 * Soru SADECE yaygın adı gösterir (ör. "LALE"), kartlarda bilimsel ad yazar.
 * Oyuncu yaygın adı kartlardaki bilimsel ada eşler.
 * 5 doğru cevap hedefi (veya 90s süre dolana kadar).
 * Yanlış cevap → farklı kategoriye geç (ezberlemeyi engeller).
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const CARD_W = Math.floor((SW - 48) / 3);
const CARD_H = 110;
const TIME_S  = 90;
const GOAL    = 5;

// ── Kategori verisi ──────────────────────────────────────────────────────────
// Her item: emoji + scientific (kartta gösterilir) + common (soruda gösterilir)
// Her question: q = SADECE yaygın ad, a = doğru kart indeksi
const CATEGORIES = [
  {
    id: 'dinos', title: '🦕 Dinozorlar',
    items: [
      { emoji: '🦕', scientific: 'Diplodocus',    common: 'Uzun boyunlu' },
      { emoji: '🦖', scientific: 'Tyrannosaurus', common: 'Dev etçil' },
      { emoji: '🐊', scientific: 'Deinosuchus',   common: 'Timsah atası dinozor' },
      { emoji: '🦴', scientific: 'Triceratops',   common: '3 boynuzlu dinozor' },
      { emoji: '🐉', scientific: 'Velociraptor',  common: 'Hızlı avcı' },
      { emoji: '🥚', scientific: 'Oviraptor',     common: 'Yumurta koruyan' },
    ],
    questions: [
      { q: 'Timsah atası dinozor', a: 2 },
      { q: '3 boynuzlu dinozor',   a: 3 },
      { q: 'Hızlı avcı',           a: 4 },
    ],
  },
  {
    id: 'flowers', title: '🌸 Çiçekler',
    items: [
      { emoji: '🌻', scientific: 'Helianthus annuus', common: 'Ayçiçeği' },
      { emoji: '🌹', scientific: 'Rosa canina',        common: 'Kuşburnu' },
      { emoji: '🌷', scientific: 'Tulipa gesneriana',  common: 'Lale' },
      { emoji: '🌸', scientific: 'Prunus serrulata',   common: 'Kiraz çiçeği' },
      { emoji: '🌼', scientific: 'Chrysanthemum',      common: 'Kasımpatı' },
      { emoji: '🌺', scientific: 'Hibiscus',           common: 'Atatürk çiçeği' },
    ],
    questions: [
      { q: 'Ayçiçeği',  a: 0 },
      { q: 'Lale',      a: 2 },
      { q: 'Kuşburnu',  a: 1 },
      { q: 'Kasımpatı', a: 4 },
    ],
  },
  {
    id: 'planets', title: '🌍 Gezegenler',
    items: [
      { emoji: '🌍', scientific: 'Dünya',   common: '3. gezegen' },
      { emoji: '🔴', scientific: 'Mars',    common: 'Kızıl gezegen' },
      { emoji: '💛', scientific: 'Jüpiter', common: 'En büyük gezegen' },
      { emoji: '💍', scientific: 'Satürn',  common: 'Halkalı gezegen' },
      { emoji: '🔵', scientific: 'Neptün',  common: 'En uzak gezegen' },
      { emoji: '⚪', scientific: 'Merkür',  common: 'En küçük gezegen' },
    ],
    questions: [
      { q: 'En büyük gezegen', a: 2 },
      { q: 'Halkalı gezegen',  a: 3 },
      { q: 'En uzak gezegen',  a: 4 },
    ],
  },
  {
    id: 'birds', title: '🐦 Kuşlar',
    items: [
      { emoji: '🦅', scientific: 'Haliaeetus',    common: 'Kartal' },
      { emoji: '🦉', scientific: 'Bubo bubo',      common: 'Baykuş' },
      { emoji: '🦚', scientific: 'Pavo cristatus', common: 'Tavuskuşu' },
      { emoji: '🦜', scientific: 'Psittacus',      common: 'Papağan' },
      { emoji: '🐧', scientific: 'Aptenodytes',    common: 'Penguen' },
      { emoji: '🦩', scientific: 'Phoenicopterus', common: 'Flamingo' },
    ],
    questions: [
      { q: 'Baykuş',    a: 1 },
      { q: 'Tavuskuşu', a: 2 },
      { q: 'Flamingo',  a: 5 },
    ],
  },
  {
    id: 'elements', title: '⚗️ Elementler',
    items: [
      { emoji: '⚡', scientific: 'Fe', common: 'Demir' },
      { emoji: '✨', scientific: 'Au', common: 'Altın' },
      { emoji: '🫧', scientific: 'He', common: 'Helyum' },
      { emoji: '💧', scientific: 'H',  common: 'Hidrojen' },
      { emoji: '🔥', scientific: 'O',  common: 'Oksijen' },
      { emoji: '⬛', scientific: 'C',  common: 'Karbon' },
    ],
    questions: [
      { q: 'Altın',  a: 1 },
      { q: 'Demir',  a: 0 },
      { q: 'Helyum', a: 2 },
    ],
  },
  {
    id: 'insects', title: '🦋 Böcekler',
    items: [
      { emoji: '🦋', scientific: 'Lepidoptera',    common: 'Kelebek' },
      { emoji: '🐝', scientific: 'Apis mellifera', common: 'Bal arısı' },
      { emoji: '🪲', scientific: 'Coleoptera',      common: 'Kın kanatlı' },
      { emoji: '🦟', scientific: 'Culicidae',       common: 'Sivrisinek' },
      { emoji: '🐞', scientific: 'Coccinella',      common: 'Uğur böceği' },
      { emoji: '🪳', scientific: 'Blattodea',       common: 'Hamamböceği' },
    ],
    questions: [
      { q: 'Bal arısı',    a: 1 },
      { q: 'Uğur böceği',  a: 4 },
      { q: 'Kelebek',      a: 0 },
    ],
  },
];

/** Pick a random category index different from `exclude` */
function pickCategory(exclude) {
  let idx;
  do { idx = Math.floor(Math.random() * CATEGORIES.length); }
  while (idx === exclude);
  return idx;
}

/** Pick a random question index from category */
function pickQuestion(catIdx) {
  const cat = CATEGORIES[catIdx];
  return Math.floor(Math.random() * cat.questions.length);
}

export default function MuseumQuiz({ choice, onComplete }) {
  // Refs hold the authoritative cat/question/score so callbacks never go stale
  const catIdxRef = useRef(Math.floor(Math.random() * CATEGORIES.length));
  const qIdxRef   = useRef(0);
  const scoreRef  = useRef(0);
  const doneRef   = useRef(false);
  const timerRef  = useRef(null);

  // Mirror refs into state for rendering
  const [catIdx,   setCatIdx]   = useState(catIdxRef.current);
  const [qIdx,     setQIdx]     = useState(0);
  const [score,    setScore]    = useState(0);
  const [timeLeft, setTime]     = useState(TIME_S);
  const [selected, setSelected] = useState(null);  // tapped card index
  const [feedback, setFeedback] = useState(null);  // 'correct' | 'wrong'
  const [done,     setDone]     = useState(false);

  // Init first question
  useEffect(() => {
    const q = pickQuestion(catIdxRef.current);
    qIdxRef.current = q;
    setQIdx(q);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          if (!doneRef.current) { doneRef.current = true; setDone(true); }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTap = useCallback((cardIdx) => {
    if (selected !== null || feedback !== null || doneRef.current) return;

    const cat      = CATEGORIES[catIdxRef.current];
    const question = cat.questions[qIdxRef.current];
    const correct  = cardIdx === question.a;

    setSelected(cardIdx);
    setFeedback(correct ? 'correct' : 'wrong');

    if (correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }

    const delay = correct ? 900 : 1500;

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);

      if (scoreRef.current >= GOAL) {
        clearInterval(timerRef.current);
        doneRef.current = true;
        setDone(true);
        return;
      }

      if (correct) {
        // Stay in same category, pick a new question
        const newQ = pickQuestion(catIdxRef.current);
        qIdxRef.current = newQ;
        setQIdx(newQ);
      } else {
        // Switch to a different category
        const newCat = pickCategory(catIdxRef.current);
        const newQ   = pickQuestion(newCat);
        catIdxRef.current = newCat;
        qIdxRef.current   = newQ;
        setCatIdx(newCat);
        setQIdx(newQ);
      }
    }, delay);
  }, [selected, feedback]);

  const calcBonus = (sc) => ({
    intelligence: sc >= 5 ? 5 : sc >= 3 ? 3 : sc >= 2 ? 2 : 1,
    creativity:   sc >= 4 ? 3 : sc >= 2 ? 2 : 1,
    empathy:      sc >= 3 ? 2 : 1,
  });

  // ── SONUÇ ─────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(scoreRef.current);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>
          {scoreRef.current >= 5 ? '🏛️🏆' : scoreRef.current >= 3 ? '🏛️' : '📚'}
        </Text>
        <Text style={s.resultTitle}>{scoreRef.current}/{GOAL} Doğru!</Text>
        <Text style={s.resultSub}>
          {scoreRef.current >= 5
            ? 'Müze uzmanısın!'
            : scoreRef.current >= 3
            ? 'Fena değil, öğreniyorsun!'
            : 'Sergilere daha dikkatli bak!'}
        </Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={s.bonusBox}>
            <Text style={s.bonusTitle}>🏛️ Kazanılan bonuslar</Text>
            {bonus.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
            {bonus.creativity > 0   && <Text style={s.bonusLine}>🎨 Yaratıcılık +{bonus.creativity}</Text>}
            {bonus.empathy > 0      && <Text style={s.bonusLine}>💛 Empati +{bonus.empathy}</Text>}
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={() => onComplete(bonus)}>
          <Text style={s.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cat      = CATEGORIES[catIdx];
  const question = cat.questions[qIdx] || cat.questions[0];

  const timerPct = (timeLeft / TIME_S) * 100;

  return (
    <View style={s.screen}>
      {/* HUD */}
      <View style={s.hud}>
        <Text style={s.catTitle}>{cat.title}</Text>
        <View style={s.hudRow}>
          <Text style={s.hudScore}>✅ {score}/{GOAL}</Text>
          <Text style={[s.hudTimer, timeLeft <= 15 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={s.timerTrack}>
          <View style={[s.timerFill, {
            width: `${timerPct}%`,
            backgroundColor: timeLeft <= 15 ? '#f85149' : '#818cf8',
          }]} />
        </View>
      </View>

      {/* Question — SADECE yaygın ad + alt başlık */}
      <View style={s.questionBox}>
        <Text style={{ fontSize: 32, fontWeight: '900', color: '#fff', textAlign: 'center' }}>
          {question.q}
        </Text>
        <Text style={{ fontSize: 14, color: '#8b949e', textAlign: 'center', marginTop: 4 }}>
          Bilimsel adını bul!
        </Text>
      </View>

      {/* 3×2 card grid — emoji + bilimsel ad */}
      <View style={s.cardGrid}>
        {cat.items.map((item, idx) => {
          const isSelected = selected === idx;
          const isCorrect  = isSelected && feedback === 'correct';
          const isWrong    = isSelected && feedback === 'wrong';
          const isAnswer   = feedback === 'wrong' && idx === question.a;

          return (
            <TouchableOpacity
              key={idx}
              style={[
                s.card,
                { width: CARD_W, height: CARD_H },
                isCorrect && s.cardCorrect,
                isWrong   && s.cardWrong,
                isAnswer  && s.cardAnswer,
              ]}
              onPress={() => handleTap(idx)}
              activeOpacity={0.75}
              disabled={selected !== null}
            >
              <Text style={s.cardEmoji}>{item.emoji}</Text>
              <Text style={s.cardName} numberOfLines={2}>{item.scientific}</Text>
              {isAnswer && <Text style={s.cardHint}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Feedback strip */}
      {feedback && (
        <View style={[s.feedbackStrip, { backgroundColor: feedback === 'correct' ? '#052e16' : '#1a0707' }]}>
          <Text style={[s.feedbackText, { color: feedback === 'correct' ? '#4ade80' : '#f87171' }]}>
            {feedback === 'correct'
              ? `✅ Doğru! ${question.q} = ${cat.items[question.a].scientific}`
              : `❌ Yanlış! Doğrusu: ${cat.items[question.a].scientific}`}
          </Text>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#050a14' },
  center: { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:    {
    paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d',
  },
  catTitle: { color: '#818cf8', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  hudRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudScore: { color: '#4ade80', fontSize: 14, fontWeight: '700' },
  hudTimer: { color: '#e6edf3', fontSize: 16, fontWeight: '900' },
  timerTrack: { width: '100%', height: 4, backgroundColor: '#21262d', borderRadius: 2, overflow: 'hidden' },
  timerFill:  { height: '100%', borderRadius: 2 },
  questionBox: {
    paddingHorizontal: 20, paddingVertical: 18,
    backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d',
  },
  cardGrid: {
    flexDirection: 'row', flexWrap: 'wrap',
    justifyContent: 'center', gap: 8,
    padding: 16, flex: 1, alignContent: 'flex-start',
  },
  card: {
    backgroundColor: '#0d1117',
    borderRadius: 12, borderWidth: 2, borderColor: '#21262d',
    justifyContent: 'center', alignItems: 'center', padding: 6,
    ...(Platform.OS === 'android' ? { elevation: 2 } : { shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 4 }),
  },
  cardCorrect: { borderColor: '#22c55e', backgroundColor: '#0d2d16' },
  cardWrong:   { borderColor: '#ef4444', backgroundColor: '#2d0f0f' },
  cardAnswer:  { borderColor: '#22c55e', backgroundColor: '#0d2d16', borderWidth: 3 },
  cardEmoji:   { fontSize: 36, marginBottom: 6 },
  cardName:    { color: '#c9d4df', fontSize: 11, textAlign: 'center', fontWeight: '700', lineHeight: 14, fontStyle: 'italic' },
  cardHint:    { color: '#22c55e', fontSize: 16, fontWeight: '900', position: 'absolute', top: 4, right: 6 },
  feedbackStrip: {
    paddingVertical: 10, paddingHorizontal: 16,
    borderTopWidth: 1, borderColor: '#21262d',
    alignItems: 'center',
  },
  feedbackText:  { fontSize: 14, fontWeight: '700', textAlign: 'center' },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  bonusBox:    {
    backgroundColor: '#0d1117', borderRadius: 12, padding: 14, marginBottom: 18,
    width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#21262d',
  },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#818cf8', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#4f46e5', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
