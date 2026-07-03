/**
 * ParkGame — Yanlış Hayvanı Bul! 🌳
 * Park görselinde 5 hayvan var; biri yanlış habitattadır.
 * Hangi hayvanın yanlış yerde olduğunu bul ve dokun!
 * Bonus: happiness / empathy / social
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, ImageBackground,
  Platform, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H  = Platform.OS === 'android' ? 100 : 110;
const BOT_H  = 130;
const PARK_H = SH - HUD_H - BOT_H;

// Habitat konumları (park.png üzerindeki % pozisyonlar)
const HABITATS = [
  { id: 'nest',   px: 0.56, py: 0.18, name: 'Kuş Yuvası',    icon: '🪺', hint: 'Ağaç tepesi' },
  { id: 'house',  px: 0.30, py: 0.36, name: 'Kuş Evi',        icon: '🏠', hint: 'Bahçe direği' },
  { id: 'pond',   px: 0.17, py: 0.56, name: 'Gölet',           icon: '💧', hint: 'Su kenarı' },
  { id: 'hollow', px: 0.80, py: 0.43, name: 'Ağaç Kovuğu',    icon: '🕳️', hint: 'Kuru ağaç' },
  { id: 'garden', px: 0.82, py: 0.65, name: 'Çiçek Bahçesi',  icon: '🌸', hint: 'Çiçek tarlası' },
];

// Her habitat için uygun hayvanlar
const ANIMALS_MAP = {
  nest:   [{ emoji: '🐦', name: 'Serçe' }, { emoji: '🦅', name: 'Kartal' }, { emoji: '🦢', name: 'Kuğu' }],
  house:  [{ emoji: '🦜', name: 'Papağan' }, { emoji: '🦉', name: 'Baykuş' }, { emoji: '🐤', name: 'Civciv' }],
  pond:   [{ emoji: '🐸', name: 'Kurbağa' }, { emoji: '🦆', name: 'Ördek' }, { emoji: '🐟', name: 'Balık' }],
  hollow: [{ emoji: '🐿️', name: 'Sincap' }, { emoji: '🦔', name: 'Kirpi' }, { emoji: '🐇', name: 'Tavşan' }],
  garden: [{ emoji: '🦋', name: 'Kelebek' }, { emoji: '🐝', name: 'Arı' }, { emoji: '🐞', name: 'Uğur Böceği' }],
};

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRound() {
  // Her habitattan bir hayvan seç
  const animals = HABITATS.map(h => ({
    ...pickRandom(ANIMALS_MAP[h.id]),
    habitatId: h.id,
    habitat: h,
  }));

  // Rastgele birini yanlış yere koy
  const misplacedIdx  = Math.floor(Math.random() * HABITATS.length);
  const wrongHabitat  = pickRandom(HABITATS.filter(h => h.id !== animals[misplacedIdx].habitatId));

  // Yanlış habitatın sahibi görüntülenmez (üst üste binmeyi engeller).
  // Sonuç: 4 hayvan — 3 doğru yerde + 1 yanlış yerde.
  const result = [];
  for (let i = 0; i < animals.length; i++) {
    if (animals[i].habitatId === wrongHabitat.id) continue; // sahibi çıkar
    result.push({
      ...animals[i],
      displayHabitat: i === misplacedIdx ? wrongHabitat : animals[i].habitat,
      isMisplaced:    i === misplacedIdx,
    });
  }
  return result;
}

const TOTAL_ROUNDS = 5;

const calcBonus = (score) => ({
  happiness: score >= 5 ? 5 : score >= 4 ? 4 : score >= 3 ? 3 : 2,
  empathy:   score >= 4 ? 4 : score >= 3 ? 3 : score >= 2 ? 2 : 1,
  social:    score >= 4 ? 3 : score >= 3 ? 2 : 1,
});

// ─── Hayvan token bileşeni ────────────────────────────────────────────────────
function AnimalToken({ animal, onPress, shake, correct, hint }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (shake) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -12, duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 12,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -7,  duration: 55, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0,   duration: 55, useNativeDriver: true }),
      ]).start();
    }
  }, [shake]);

  useEffect(() => {
    if (correct) {
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.8, friction: 4, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 0,   duration: 350, useNativeDriver: true }),
      ]).start();
    }
  }, [correct]);

  useEffect(() => {
    if (hint && animal.isMisplaced) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(glowAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(glowAnim, { toValue: 0, duration: 500, useNativeDriver: true }),
      ]));
      loop.start();
      return () => loop.stop();
    } else {
      glowAnim.setValue(0);
    }
  }, [hint, animal.isMisplaced]);

  const { px, py } = animal.displayHabitat;
  const left = px * SW - 32;
  const top  = py * PARK_H - 32;

  return (
    <Animated.View style={{
      position: 'absolute', left, top,
      alignItems: 'center',
      transform: [{ translateX: shakeAnim }, { scale: scaleAnim }],
    }}>
      {/* İpucu ışıması */}
      {hint && animal.isMisplaced && (
        <Animated.View style={[pg.hintRing, { opacity: glowAnim }]} />
      )}
      <TouchableOpacity style={pg.token} onPress={onPress} activeOpacity={0.75}>
        <Text style={pg.tokenEmoji}>{animal.emoji}</Text>
      </TouchableOpacity>
      <View style={pg.nameTag}>
        <Text style={pg.nameText}>{animal.name}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function ParkGame({ choice, onComplete }) {
  const [round,       setRound]      = useState(0);
  const [score,       setScore]      = useState(0);
  const [roundAnimals,setAnimals]    = useState(() => generateRound());
  const [shakeIdx,    setShakeIdx]   = useState(null);
  const [correctIdx,  setCorrectIdx] = useState(null);
  const [wrongCount,  setWrongCount] = useState(0);
  const [statusMsg,   setStatus]     = useState(null); // { text, ok }
  const [done,        setDone]       = useState(false);
  const [locked,      setLocked]     = useState(false);
  const scoreRef = useRef(0);

  const misplaced = roundAnimals.find(a => a.isMisplaced);

  const handleTap = useCallback((animal, idx) => {
    if (locked) return;

    if (animal.isMisplaced) {
      setLocked(true);
      setCorrectIdx(idx);
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setStatus({ text: `✓ Doğru! ${animal.name} burada değil — ${animal.habitat.name}'na ait!`, ok: true });

      setTimeout(() => {
        const next = round + 1;
        if (next >= TOTAL_ROUNDS) {
          setDone(true);
        } else {
          setRound(next);
          setAnimals(generateRound());
          setCorrectIdx(null);
          setShakeIdx(null);
          setWrongCount(0);
          setStatus(null);
          setLocked(false);
        }
      }, 1600);
    } else {
      setShakeIdx(idx);
      const wc = wrongCount + 1;
      setWrongCount(wc);
      setStatus({ text: 'Hayır! Bu hayvan doğru yerde. Başkasını dene!', ok: false });
      setTimeout(() => {
        setShakeIdx(null);
        setStatus(null);
      }, 900);
    }
  }, [locked, round, wrongCount]);

  // ── SONUÇ ──────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(scoreRef.current);
    const medal = scoreRef.current >= 5 ? '🏆' : scoreRef.current >= 4 ? '🥇' : scoreRef.current >= 3 ? '🥈' : '🌿';
    return (
      <View style={pg.center}>
        <Text style={{ fontSize: 70, marginBottom: 8 }}>{medal}</Text>
        <Text style={pg.resultTitle}>{scoreRef.current}/{TOTAL_ROUNDS} Bulunan!</Text>
        <Text style={pg.resultSub}>
          {scoreRef.current >= 5
            ? 'Harika! Tüm yanlış hayvanları buldun!'
            : scoreRef.current >= 3
            ? 'Çok iyi! Hayvan habitatlarını iyi biliyorsun.'
            : 'Biraz daha pratik yaparsan ustalaşırsın!'}
        </Text>
        <View style={pg.bonusBox}>
          <Text style={pg.bonusTitle}>🌳 Kazanılan Bonuslar</Text>
          {bonus.happiness > 0 && <Text style={pg.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
          {bonus.empathy   > 0 && <Text style={pg.bonusLine}>💚 Empati +{bonus.empathy}</Text>}
          {bonus.social    > 0 && <Text style={pg.bonusLine}>🤝 Sosyal +{bonus.social}</Text>}
        </View>
        <TouchableOpacity style={pg.btn} onPress={() => onComplete(bonus)}>
          <Text style={pg.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const showHint = wrongCount >= 3;

  return (
    <View style={pg.screen}>
      {/* HUD */}
      <View style={pg.hud}>
        <View style={pg.hudRow}>
          <Text style={pg.hudScore}>⭐ {score}/{TOTAL_ROUNDS}</Text>
          <Text style={pg.hudTitle}>🔍 Yanlış Hayvanı Bul!</Text>
          <Text style={pg.hudRound}>Tur {round + 1}/{TOTAL_ROUNDS}</Text>
        </View>
        <View style={pg.progressBar}>
          <View style={[pg.progressFill, { width: `${(round / TOTAL_ROUNDS) * 100}%` }]} />
        </View>
      </View>

      {/* Park alanı */}
      <ImageBackground
        source={require('../../../assets/park.png')}
        style={pg.park}
        resizeMode="cover"
      >
        <View style={pg.overlay} />

        {roundAnimals.map((animal, idx) => (
          <AnimalToken
            key={`${round}-${idx}`}
            animal={animal}
            onPress={() => handleTap(animal, idx)}
            shake={shakeIdx === idx}
            correct={correctIdx === idx}
            hint={showHint}
          />
        ))}
      </ImageBackground>

      {/* Alt panel */}
      <View style={pg.bottom}>
        {statusMsg ? (
          <Text style={[pg.statusText, { color: statusMsg.ok ? '#4ade80' : '#f87171' }]}>
            {statusMsg.text}
          </Text>
        ) : (
          <Text style={pg.question}>
            {showHint && misplaced
              ? `💡 İpucu: Yanlış hayvan ${misplaced.displayHabitat.name} bölgesinde görünüyor!`
              : 'Hangi hayvan yanlış yerde? Bul ve dokun! 🔍'}
          </Text>
        )}
        <Text style={pg.subHint}>5 hayvanın biri yanlış habitatta.</Text>
      </View>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const pg = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#050f07' },
  center:      { flex: 1, backgroundColor: '#050f07', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:         { height: HUD_H, paddingTop: SAFE_TOP, paddingHorizontal: 14, backgroundColor: 'rgba(4,12,6,0.95)', borderBottomWidth: 1, borderColor: '#14401c' },
  hudRow:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 },
  hudTitle:    { color: '#86efac', fontSize: 13, fontWeight: '900' },
  hudScore:    { color: '#fbbf24', fontSize: 13, fontWeight: '800', minWidth: 55 },
  hudRound:    { color: '#e6edf3', fontSize: 13, fontWeight: '800', minWidth: 55, textAlign: 'right' },
  progressBar: { height: 4, backgroundColor: '#14401c', borderRadius: 2, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: '#4ade80', borderRadius: 2 },
  park:        { flex: 1, position: 'relative' },
  overlay:     { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.10)' },
  token:       { width: 58, height: 58, borderRadius: 29, backgroundColor: 'rgba(0,0,0,0.55)', borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.35)', alignItems: 'center', justifyContent: 'center' },
  tokenEmoji:  { fontSize: 32 },
  nameTag:     { backgroundColor: 'rgba(0,0,0,0.72)', borderRadius: 8, paddingHorizontal: 5, paddingVertical: 1, marginTop: 2 },
  nameText:    { color: '#e6edf3', fontSize: 9, fontWeight: '700' },
  hintRing:    { position: 'absolute', width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: '#fbbf24', top: -7, left: -7 },
  bottom:      { height: BOT_H, backgroundColor: 'rgba(4,12,6,0.97)', borderTopWidth: 1.5, borderColor: '#14401c', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 18 },
  question:    { color: '#e6edf3', fontSize: 15, fontWeight: '800', textAlign: 'center', marginBottom: 6 },
  statusText:  { fontSize: 13, fontWeight: '800', textAlign: 'center', marginBottom: 6, lineHeight: 18 },
  subHint:     { color: '#4b5563', fontSize: 11, textAlign: 'center' },
  resultTitle: { color: '#86efac', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  bonusBox:    { backgroundColor: '#071409', borderRadius: 14, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#14401c' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#86efac', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#16a34a', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14, shadowColor: '#16a34a', shadowOpacity: 0.5, shadowRadius: 8 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
