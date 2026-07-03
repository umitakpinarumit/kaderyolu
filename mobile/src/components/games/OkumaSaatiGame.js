/**
 * OkumaSaatiGame — Okuma Saati 📖
 * Kısa bir hikaye okunur (typewriter), ardından 3 anlama sorusu sorulur.
 * 5 farklı hikaye rastgele seçilir. Bonus: intelligence / focus / empathy
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

// ─── Hikaye bankası ───────────────────────────────────────────────────────────
const STORIES = [
  {
    id: 'turtle',
    title: '🐢 Küçük Kaplumbağa',
    text:
      'Bir varmış bir yokmuş, deniz kenarında küçük bir kaplumbağa yaşarmış. ' +
      'Her gün kumların üzerinde yavaş yavaş yürür, güneşin ışığında ısınırmış. ' +
      'Bir gün yanına bir yengeç gelmiş ve "Neden bu kadar yavaş yürürsün?" diye sormuş. ' +
      'Kaplumbağa gülümseyerek cevap vermiş: "Çünkü etrafımdaki güzellikleri kaçırmak istemiyorum."',
    questions: [
      {
        q: 'Kaplumbağa nerede yaşıyordu?',
        correct: 'Deniz kenarında',
        opts: ['Dağda', 'Deniz kenarında', 'Ormanda', 'Bir mağarada'],
      },
      {
        q: 'Kaplumbağaya soruyu kim sordu?',
        correct: 'Yengeç',
        opts: ['Balık', 'Yengeç', 'Martı', 'Yunus'],
      },
      {
        q: 'Kaplumbağa neden yavaş yürüdüğünü nasıl açıkladı?',
        correct: 'Güzellikleri kaçırmamak için',
        opts: ['Çünkü yorgundu', 'Güzellikleri kaçırmamak için', 'Çünkü hastaydı', 'Çünkü ağırdı'],
      },
    ],
  },
  {
    id: 'cloud',
    title: '☁️ Küçük Bulut',
    text:
      'Gökyüzünde yaşayan küçük bir bulut vardı. Diğer bulutlar büyük ve gürültülüydü; ' +
      'onlar fırtına olup şimşek çakarlardı. Küçük bulut ise sadece yağmur yağdırmak isterdi. ' +
      'Bir yaz günü tarlalar susuzluktan kurumuştu. Küçük bulut tüm gücüyle topladı ve ' +
      'serin bir yağmur yağdırdı. Çiftçiler sevinçle dans etti.',
    questions: [
      {
        q: 'Küçük bulut ne yapmak istiyordu?',
        correct: 'Yağmur yağdırmak',
        opts: ['Şimşek çakmak', 'Yağmur yağdırmak', 'Fırtına olmak', 'Güneşin önünü kesmek'],
      },
      {
        q: 'Hikayede tarlalara ne olmuştu?',
        correct: 'Susuzluktan kurumuştu',
        opts: ['Su altında kalmıştı', 'Susuzluktan kurumuştu', 'Buz tutmuştu', 'Yanmıştı'],
      },
      {
        q: 'Yağmur yağınca çiftçiler ne yaptı?',
        correct: 'Dans etti',
        opts: ['Ağladı', 'Kaçtı', 'Dans etti', 'Uyudu'],
      },
    ],
  },
  {
    id: 'squirrel',
    title: '🐿️ Meraklı Sincap',
    text:
      'Ormanda meraklı bir sincap yaşıyordu. Her sabah ağaçtan ağaca atlayarak ' +
      'yeni şeyler keşfetmeye çalışırdı. Bir gün büyük bir fıstık buldu ama çok ağırdı, ' +
      'taşıyamıyordu. Arkadaşı tavşana seslendi: "Yardım eder misin?" Tavşan hemen koştu ' +
      've birlikte fıstığı yuvaya taşıdılar. O gece ikisi de tok uyudu.',
    questions: [
      {
        q: 'Sincap her sabah ne yapardı?',
        correct: 'Yeni şeyler keşfederdi',
        opts: ['Uyurdu', 'Yeni şeyler keşfederdi', 'Ağaç dikerdi', 'Balık tutardı'],
      },
      {
        q: 'Sincabın sorunu neydi?',
        correct: 'Fıstığı taşıyamıyordu',
        opts: ['Yolu şaşırdı', 'Aç kaldı', 'Fıstığı taşıyamıyordu', 'Yuvayı bulamadı'],
      },
      {
        q: 'Sincabın arkadaşı kimdi?',
        correct: 'Tavşan',
        opts: ['Kirpi', 'Ördek', 'Tavşan', 'Kaplumbağa'],
      },
    ],
  },
  {
    id: 'rain',
    title: '🌧️ Yağmur Damlası',
    text:
      'Küçük bir yağmur damlası buluttan yere düştü. Düşerken etrafını izledi: ' +
      'önce gökyüzünü, sonra uçan kuşları, ardından yeşil ağaçları gördü. ' +
      'Yere değince çiçeğin yapraklarına tutundu. Çiçek "Hoş geldin, seni bekliyordum!" dedi. ' +
      '"Sensiz büyüyemezdim." Damla o gün en güzel işi yaptığını hissetti.',
    questions: [
      {
        q: 'Yağmur damlası düşerken önce ne gördü?',
        correct: 'Gökyüzünü',
        opts: ['Çiçekleri', 'Gökyüzünü', 'Balıkları', 'Dağları'],
      },
      {
        q: 'Damla yere değince nereye tutundu?',
        correct: 'Çiçeğin yapraklarına',
        opts: ['Taşın üstüne', 'Çiçeğin yapraklarına', 'Ağacın kabuğuna', 'Toprağa'],
      },
      {
        q: 'Çiçek yağmur damlasına ne dedi?',
        correct: 'Sensiz büyüyemezdim',
        opts: ['Git buradan!', 'Neden geç kaldın?', 'Sensiz büyüyemezdim', 'Seni tanımıyorum'],
      },
    ],
  },
  {
    id: 'star',
    title: '⭐ Küçük Yıldız',
    text:
      'Geceleri gökyüzünde en küçük yıldız, diğerlerinin yanında pek ışık ' +
      'saçamadığını düşünürdü. "Ben çok küçüğüm, beni kimse görmüyor" diye üzülürdü. ' +
      'Bir gece bir çocuk annesine sordu: "Anne, şu köşedeki ufacık yıldız hangisi?" ' +
      'Annesi güldü: "O benim en sevdiğim yıldız. Ona her gece iyi geceler derim." ' +
      'Küçük yıldız artık sonuna kadar parlıyordu.',
    questions: [
      {
        q: 'Küçük yıldız neden üzülüyordu?',
        correct: 'Kimsenin onu görmediğini düşünüyordu',
        opts: ['Çok soğuktu', 'Kimsenin onu görmediğini düşünüyordu', 'Kaybolmuştu', 'Işığı sönüyordu'],
      },
      {
        q: 'Çocuk annesine ne sordu?',
        correct: 'Köşedeki küçük yıldızı sordu',
        opts: ['Ayı sordu', 'Güneşi sordu', 'Köşedeki küçük yıldızı sordu', 'Bulutları sordu'],
      },
      {
        q: 'Anne her gece küçük yıldıza ne yapardı?',
        correct: 'İyi geceler derdi',
        opts: ['Bakmak istemezdi', 'İyi geceler derdi', 'Şarkı söylerdi', 'Fotoğrafını çekerdi'],
      },
    ],
  },
];

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function shuffleOpts(question) {
  return { ...question, opts: shuffle(question.opts) };
}

const TIME_S    = 90;
const calcBonus = (score, max) => {
  const p = max > 0 ? score / max : 0;
  return {
    intelligence: p >= 0.9 ? 6 : p >= 0.7 ? 5 : p >= 0.5 ? 3 : p >= 0.3 ? 2 : 1,
    focus:        p >= 0.8 ? 4 : p >= 0.6 ? 3 : p >= 0.4 ? 2 : 1,
    empathy:      p >= 0.7 ? 3 : p >= 0.5 ? 2 : p >= 0.3 ? 1 : 0,
  };
};

// ─── Typewriter hook ───────────────────────────────────────────────────────────
function useTypewriter(text, speed, onDone) {
  const [shown, setShown] = useState('');
  const ref = useRef(null);
  useEffect(() => {
    setShown('');
    let i = 0;
    ref.current = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(ref.current); onDone?.(); }
    }, speed);
    return () => clearInterval(ref.current);
  }, [text]);
  // Skip to end
  const finish = () => { clearInterval(ref.current); setShown(text); onDone?.(); };
  return [shown, finish];
}

// ─── Cevap butonu ──────────────────────────────────────────────────────────────
function AnswerBtn({ label, state, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    if (state) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.05, friction: 4, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1.0,  friction: 6, useNativeDriver: true }),
      ]).start();
    }
  }, [state]);
  const bg   = state === 'correct' ? '#14532d' : state === 'wrong' ? '#450a0a' : '#0d1628';
  const bord = state === 'correct' ? '#22c55e' : state === 'wrong' ? '#ef4444' : '#1c3a5a';
  const clr  = state === 'correct' ? '#4ade80' : state === 'wrong' ? '#f87171' : '#c9d4df';
  return (
    <TouchableOpacity onPress={onPress} disabled={!!state} activeOpacity={0.78}>
      <Animated.View style={[ok.optBtn, { backgroundColor: bg, borderColor: bord, transform: [{ scale: scaleAnim }] }]}>
        <Text style={[ok.optTxt, { color: clr }]}>
          {state === 'correct' ? '✓  ' : state === 'wrong' ? '✗  ' : ''}{label}
        </Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function OkumaSaatiGame({ choice, onComplete }) {
  const stories   = useRef(shuffle(STORIES));
  const [sIdx,    setSIdx]     = useState(0);
  const [qIdx,    setQIdx]     = useState(-1);  // -1 = hikaye okunuyor
  const [selected,setSelected] = useState(null);
  const [score,   setScore]    = useState(0);
  const [maxScore,setMaxScore] = useState(0);
  const [timeLeft,setTime]     = useState(TIME_S);
  const [done,    setDone]     = useState(false);
  const [storyDone,setStoryDone]=useState(false);

  const timerRef  = useRef(null);
  const doneRef   = useRef(false);
  const scoreRef  = useRef(0);
  const maxRef    = useRef(0);

  const story     = stories.current[sIdx];
  const questions = useRef(story?.questions.map(shuffleOpts) ?? []);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(timerRef.current);
    setDone(true);
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => { if (t <= 1) { finish(); return 0; } return t - 1; });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [finish]);

  // Yeni hikayeye geçince sorular resetlenir
  useEffect(() => {
    if (sIdx < stories.current.length) {
      questions.current = stories.current[sIdx].questions.map(shuffleOpts);
      setStoryDone(false);
      setQIdx(-1);
      setSelected(null);
    }
  }, [sIdx]);

  const [shownText, skipText] = useTypewriter(
    story?.text ?? '',
    22,
    () => setStoryDone(true)
  );

  const startQuestions = () => {
    skipText();
    setQIdx(0);
    maxRef.current += (questions.current.length);
    setMaxScore(maxRef.current);
  };

  const handleAnswer = useCallback((opt) => {
    if (selected || doneRef.current) return;
    const q = questions.current[qIdx];
    setSelected(opt);
    if (opt === q.correct) {
      scoreRef.current += 1;
      setScore(scoreRef.current);
    }
    setTimeout(() => {
      const nextQ = qIdx + 1;
      if (nextQ < questions.current.length) {
        setQIdx(nextQ);
        setSelected(null);
      } else {
        // Hikaye bitti
        const nextS = sIdx + 1;
        if (nextS < stories.current.length && !doneRef.current) {
          setSIdx(nextS);
        } else {
          finish();
        }
      }
    }, 1000);
  }, [selected, qIdx, sIdx, finish]);

  // ── SONUÇ ──────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(scoreRef.current, maxRef.current || 1);
    const pct   = maxRef.current > 0 ? scoreRef.current / maxRef.current : 0;
    const medal = pct >= 0.9 ? '📚🏆' : pct >= 0.7 ? '📖✨' : pct >= 0.5 ? '📖' : '🔖';
    return (
      <View style={ok.center}>
        <Text style={{ fontSize: 60, marginBottom: 8 }}>{medal}</Text>
        <Text style={ok.resultTitle}>{scoreRef.current}/{maxRef.current} Doğru!</Text>
        <Text style={ok.resultSub}>
          {pct >= 0.9 ? 'Okuma kahramanısın! Her hikayeyi anladın.' :
           pct >= 0.7 ? 'Çok iyi! Hikayeleri güzel anladın.' :
           pct >= 0.5 ? 'Güzel! Biraz daha dikkatli okuyabilirsin.' :
           'Okurken dikkatini toplamayı dene!'}
        </Text>
        <View style={ok.bonusBox}>
          <Text style={ok.bonusTitle}>📖 Kazanılan Bonuslar</Text>
          {bonus.intelligence > 0 && <Text style={ok.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
          {bonus.focus        > 0 && <Text style={ok.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          {bonus.empathy      > 0 && <Text style={ok.bonusLine}>💛 Empati +{bonus.empathy}</Text>}
        </View>
        <TouchableOpacity style={ok.btn} onPress={() => onComplete(bonus)}>
          <Text style={ok.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const q = qIdx >= 0 ? questions.current[qIdx] : null;

  return (
    <View style={ok.screen}>
      {/* HUD */}
      <View style={ok.hud}>
        <View style={ok.hudRow}>
          <Text style={ok.hudScore}>✓ {score}/{maxScore}</Text>
          <Text style={ok.hudTitle}>{story?.title ?? '📖'}</Text>
          <Text style={[ok.hudTimer, timeLeft <= 15 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={ok.progressOuter}>
          {stories.current.slice(0, Math.min(stories.current.length, 5)).map((_, i) => (
            <View key={i} style={[ok.progressDot, {
              backgroundColor: i < sIdx ? '#22c55e' : i === sIdx ? '#60a5fa' : '#1c2e44'
            }]} />
          ))}
        </View>
      </View>

      {/* Hikaye alanı */}
      {qIdx === -1 && (
        <View style={ok.storyBox}>
          <Text style={ok.storyText}>{shownText}</Text>
          {!storyDone && (
            <TouchableOpacity style={ok.skipBtn} onPress={startQuestions}>
              <Text style={ok.skipTxt}>⏭  Hikayeyi Atla</Text>
            </TouchableOpacity>
          )}
          {storyDone && (
            <TouchableOpacity style={ok.startBtn} onPress={startQuestions}>
              <Text style={ok.startTxt}>Soruları Cevapla ›</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Sorular */}
      {q && (
        <View style={ok.questionArea}>
          <View style={ok.qCard}>
            <Text style={ok.qNum}>Soru {qIdx + 1} / {questions.current.length}</Text>
            <Text style={ok.qTxt}>{q.q}</Text>
          </View>
          <View style={ok.opts}>
            {q.opts.map((opt, i) => (
              <AnswerBtn
                key={`${sIdx}-${qIdx}-${i}`}
                label={opt}
                state={selected ? (opt === q.correct ? 'correct' : opt === selected ? 'wrong' : null) : null}
                onPress={() => handleAnswer(opt)}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const ok = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#050d1a' },
  center:      { flex: 1, backgroundColor: '#050d1a', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:         { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#0a1628', borderBottomWidth: 1, borderColor: '#1c3a5a' },
  hudRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudTitle:    { color: '#93c5fd', fontSize: 13, fontWeight: '900', textAlign: 'center', flex: 1 },
  hudScore:    { color: '#4ade80', fontSize: 12, fontWeight: '700', minWidth: 60 },
  hudTimer:    { color: '#e6edf3', fontSize: 14, fontWeight: '900', minWidth: 55, textAlign: 'right' },
  progressOuter:{ flexDirection: 'row', justifyContent: 'center', gap: 8 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  storyBox:    { flex: 1, padding: 20, justifyContent: 'space-between' },
  storyText:   { color: '#c9d4df', fontSize: 16, lineHeight: 26, flex: 1 },
  skipBtn:     { backgroundColor: '#1c2e44', borderRadius: 10, paddingVertical: 10, alignItems: 'center', marginTop: 14, borderWidth: 1, borderColor: '#2a4a6a' },
  skipTxt:     { color: '#8b949e', fontSize: 13, fontWeight: '700' },
  startBtn:    { backgroundColor: '#1f6feb', borderRadius: 12, paddingVertical: 13, alignItems: 'center', marginTop: 14 },
  startTxt:    { color: '#fff', fontSize: 15, fontWeight: '800' },
  questionArea:{ flex: 1, padding: 16 },
  qCard:       { backgroundColor: '#0a1628', borderRadius: 16, padding: 18, marginBottom: 14, borderWidth: 1.5, borderColor: '#1c3a5a' },
  qNum:        { color: '#6b7280', fontSize: 11, marginBottom: 6 },
  qTxt:        { color: '#e6edf3', fontSize: 17, fontWeight: '800', lineHeight: 24 },
  opts:        { gap: 10 },
  optBtn:      { borderRadius: 14, borderWidth: 2, paddingVertical: 13, paddingHorizontal: 16 },
  optTxt:      { fontSize: 14, fontWeight: '700' },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  bonusBox:    { backgroundColor: '#0a1628', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1c3a5a' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#93c5fd', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
