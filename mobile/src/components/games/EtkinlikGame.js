/**
 * PianoGame (EtkinlikGame) — Düşen Nota Piyanosu
 * Notalar yukarıdan düşer, doğru tuşa basarak şarkıyı çal.
 * Gerçek piyano görünümü (8 beyaz + 5 siyah tuş, 1 oktav C4–C5).
 * Ses: npx expo install expo-av kurarak etkinleştirilebilir.
 * Bonus: creativity / focus / happiness
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet, Text,
  TouchableOpacity, Vibration, View,
} from 'react-native';

const { width: SW, height: SH } = Dimensions.get('window');

// ─── Piyano düzeni ────────────────────────────────────────────────────────────
// 8 beyaz tuş: C4 D4 E4 F4 G4 A4 B4 C5
const WHITE_KEYS = [
  { id: 0, note: 'C4', label: 'Do',  color: '#ef4444' },
  { id: 1, note: 'D4', label: 'Re',  color: '#f97316' },
  { id: 2, note: 'E4', label: 'Mi',  color: '#eab308' },
  { id: 3, note: 'F4', label: 'Fa',  color: '#22c55e' },
  { id: 4, note: 'G4', label: 'Sol', color: '#06b6d4' },
  { id: 5, note: 'A4', label: 'La',  color: '#3b82f6' },
  { id: 6, note: 'B4', label: 'Si',  color: '#a855f7' },
  { id: 7, note: 'C5', label: 'Do²', color: '#ec4899' },
];
// Siyah tuşlar: C#4 D#4 (mi-fa arası yok) F#4 G#4 A#4 (si-do arası yok)
const BLACK_KEYS = [
  { id: 8,  note: 'C#4', label: 'C#', between: [0,1] },
  { id: 9,  note: 'D#4', label: 'D#', between: [1,2] },
  { id: 10, note: 'F#4', label: 'F#', between: [3,4] },
  { id: 11, note: 'G#4', label: 'G#', between: [4,5] },
  { id: 12, note: 'A#4', label: 'A#', between: [5,6] },
];
const ALL_KEYS = [...WHITE_KEYS, ...BLACK_KEYS];

// ─── Şarkı verisi — Twinkle Twinkle Little Star (beyaz tuş indeksleri) ────────
// Her nota: [keyId, beatOffset (16th notes)]
const SONG_NOTES = [
  // C C G G A A G  — Twinkle twinkle little star
  [0,0],[0,2],[4,4],[4,6],[5,8],[5,10],[4,12],
  // F F E E D D C  — How I wonder what you are
  [3,16],[3,18],[2,20],[2,22],[1,24],[1,26],[0,28],
  // G G F F E E D  — Up above the world so high
  [4,32],[4,34],[3,36],[3,38],[2,40],[2,42],[1,44],
  // G G F F E E D  — Like a diamond in the sky
  [4,48],[4,50],[3,52],[3,54],[2,56],[2,58],[1,60],
  // C C G G A A G
  [0,64],[0,66],[4,68],[4,70],[5,72],[5,74],[4,76],
  // F F E E D D C
  [3,80],[3,82],[2,84],[2,86],[1,88],[1,90],[0,92],
];
const TOTAL_NOTES = SONG_NOTES.length;

// ─── Oyun parametreleri ───────────────────────────────────────────────────────
const PIANO_H    = 130;  // piyano yüksekliği
const HUD_H      = Platform.OS === 'android' ? 110 : 120;
const FALL_H     = SH - HUD_H - PIANO_H;  // düşme alanı yüksekliği
const FALL_SPEED = 2.2;  // daha yavaş → daha rahat
const TICK_MS    = 16;
const NOTE_W_PCT = 0.86; // tuşun %86'sı kadar geniş not → daha kolay vurulur
const NOTE_H_PX  = 60;   // daha uzun nota → hit penceresi daha geniş
const HIT_Y      = FALL_H - 65;   // isabet çizgisi Y
const HIT_WIN    = 90;   // çok geniş pencere → konforlu
const BPM        = 80;   // biraz yavaş tempo
const MS_PER_16  = (60000 / BPM) / 4; // 16th note ms

const calcBonus = (score, total) => {
  const p = total > 0 ? score / total : 0;
  return {
    creativity: p >= 0.8 ? 6 : p >= 0.6 ? 4 : p >= 0.4 ? 3 : p >= 0.2 ? 2 : 1,
    focus:      p >= 0.75? 4 : p >= 0.5 ? 3 : p >= 0.3 ? 2 : 1,
    happiness:  p >= 0.7 ? 3 : p >= 0.45? 2 : p >= 0.2 ? 1 : 0,
  };
};

// ─── Piano key dimensions ─────────────────────────────────────────────────────
const KEY_W       = (SW - 8) / 8;   // biraz daha geniş tuşlar
const BLACK_KEY_W = KEY_W * 0.58;
const BLACK_KEY_H = PIANO_H * 0.58;

function keyXCenter(keyId) {
  if (keyId < 8) {
    return 8 + keyId * KEY_W + KEY_W / 2;
  }
  const bk = BLACK_KEYS.find(b => b.id === keyId);
  if (!bk) return 0;
  const [l, r] = bk.between;
  return 8 + l * KEY_W + KEY_W + 0; // between white keys
}

// ─── Animasyon: tuş basma parlaması ──────────────────────────────────────────
function FlashKey({ keyId, color }) {
  const op = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.timing(op, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();
  }, []);
  const xc = keyXCenter(keyId);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute',
      left: xc - KEY_W * 0.4,
      top: HIT_Y - 20,
      width: KEY_W * 0.8,
      height: 40,
      borderRadius: 8,
      backgroundColor: color,
      opacity: op,
    }} />
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function EtkinlikGame({ choice, onComplete }) {
  const [notes,      setNotes]   = useState([]);   // { id, keyId, y, color }
  const [pressed,    setPressed] = useState([]);   // { keyId, color, ts }
  const [feedback,   setFeedback]= useState([]);   // { id, text, x, y, color }
  const [score,      setScore]   = useState(0);
  const [perfect,    setPerfect] = useState(0);
  const [misses,     setMisses]  = useState(0);
  const [noteIdx,    setNoteIdx] = useState(0);
  const [done,       setDone]    = useState(false);
  const [combo,      setCombo]   = useState(0);
  const [progress,   setProgress]= useState(0);

  const notesRef    = useRef([]);
  const noteIdxRef  = useRef(0);
  const nextNoteRef = useRef(null);   // timestamp when next note should spawn
  const doneRef     = useRef(false);
  const feedbackId  = useRef(0);
  const loopRef     = useRef(null);
  const startTime   = useRef(null);
  const comboRef    = useRef(0);
  const scoreRef    = useRef(0);
  const missRef     = useRef(0);
  const perfectRef  = useRef(0);

  const finish = useCallback(() => {
    if (doneRef.current) return;
    doneRef.current = true;
    clearInterval(loopRef.current);
    setDone(true);
  }, []);

  const spawnNote = useCallback(() => {
    if (noteIdxRef.current >= TOTAL_NOTES) return;
    const [keyId] = SONG_NOTES[noteIdxRef.current];
    const key = ALL_KEYS.find(k => k.id === keyId);
    const xc  = keyXCenter(keyId);
    const note = {
      id:    noteIdxRef.current,
      keyId,
      y:    -NOTE_H_PX,
      x:    xc - (KEY_W * NOTE_W_PCT) / 2,
      w:    KEY_W * NOTE_W_PCT,
      color: key?.color ?? '#58a6ff',
    };
    notesRef.current = [...notesRef.current, note];
    noteIdxRef.current++;
    // Schedule next note
    if (noteIdxRef.current < TOTAL_NOTES) {
      const beatDiff = SONG_NOTES[noteIdxRef.current][1] - SONG_NOTES[noteIdxRef.current - 1][1];
      nextNoteRef.current = (nextNoteRef.current ?? Date.now()) + beatDiff * MS_PER_16;
    } else {
      nextNoteRef.current = null;
    }
  }, []);

  useEffect(() => {
    const fallTime = FALL_H / (FALL_SPEED / TICK_MS * 1000); // ms to fall from top to HIT_Y
    // First note: appear so it hits HIT_Y at beat 0
    const firstDelay = HIT_Y / (FALL_SPEED * (1000 / TICK_MS)); // ms
    startTime.current = Date.now() + firstDelay;
    nextNoteRef.current = Date.now() - firstDelay * 0;

    // Spawn first note immediately
    setTimeout(() => {
      spawnNote();
      // Schedule remaining
      if (SONG_NOTES[1]) {
        const delay = (SONG_NOTES[1][1] - SONG_NOTES[0][1]) * MS_PER_16;
        nextNoteRef.current = Date.now() + delay;
      }
    }, 300);

    loopRef.current = setInterval(() => {
      if (doneRef.current) return;

      // Spawn next note if time
      if (nextNoteRef.current && Date.now() >= nextNoteRef.current && noteIdxRef.current < TOTAL_NOTES) {
        spawnNote();
      }

      // Move notes down
      const now = notesRef.current.map(n => ({ ...n, y: n.y + FALL_SPEED }));

      // Check missed notes (passed HIT_Y + HIT_WIN without being hit)
      const alive = [];
      let newMisses = 0;
      for (const n of now) {
        if (n.y > HIT_Y + HIT_WIN + NOTE_H_PX) {
          newMisses++;
          comboRef.current = 0;
          setCombo(0);
        } else {
          alive.push(n);
        }
      }
      if (newMisses > 0) {
        missRef.current += newMisses;
        setMisses(missRef.current);
      }

      notesRef.current = alive;
      setNotes([...alive]);
      setProgress(Math.min(1, noteIdxRef.current / TOTAL_NOTES));

      // Finish when all notes spawned and cleared
      if (noteIdxRef.current >= TOTAL_NOTES && alive.length === 0) {
        setTimeout(finish, 600);
      }
    }, TICK_MS);

    return () => clearInterval(loopRef.current);
  }, [spawnNote, finish]);

  const handleKey = (keyId, color) => {
    if (doneRef.current) return;

    // Haptic feedback
    Vibration.vibrate(20);

    // Find closest note in this column within hit window
    const candidates = notesRef.current.filter(n =>
      n.keyId === keyId && Math.abs((n.y + NOTE_H_PX / 2) - HIT_Y) < HIT_WIN + 20
    );

    if (candidates.length === 0) {
      // No note here — miss
      const fid = feedbackId.current++;
      setFeedback(prev => [...prev, { id: fid, text: '✗', x: keyXCenter(keyId) - 10, y: HIT_Y - 30, color: '#f85149' }]);
      setTimeout(() => setFeedback(prev => prev.filter(f => f.id !== fid)), 400);
      comboRef.current = 0;
      setCombo(0);
      return;
    }

    // Hit the closest note
    const target = candidates.reduce((a, b) =>
      Math.abs((a.y + NOTE_H_PX/2) - HIT_Y) < Math.abs((b.y + NOTE_H_PX/2) - HIT_Y) ? a : b
    );
    const dist = Math.abs((target.y + NOTE_H_PX / 2) - HIT_Y);
    const isPerfect = dist < HIT_WIN * 0.5;
    const pts = isPerfect ? 2 : 1;
    const label = isPerfect ? '⭐ Mükemmel!' : '✓ İyi!';

    // Remove hit note
    notesRef.current = notesRef.current.filter(n => n.id !== target.id);
    setNotes([...notesRef.current]);

    // Score
    comboRef.current++;
    const comboBonus = comboRef.current >= 5 ? 1 : 0;
    scoreRef.current += pts + comboBonus;
    setScore(scoreRef.current);
    setCombo(comboRef.current);
    if (isPerfect) { perfectRef.current++; setPerfect(perfectRef.current); }

    // Flash feedback
    const fid = feedbackId.current++;
    const col = isPerfect ? '#fbbf24' : '#4ade80';
    setFeedback(prev => [...prev, { id: fid, text: label, x: keyXCenter(keyId) - 40, y: HIT_Y - 45, color: col }]);
    setTimeout(() => setFeedback(prev => prev.filter(f => f.id !== fid)), 500);

    // Visual key press
    const pid = feedbackId.current++;
    setPressed(prev => [...prev, { id: pid, keyId, color }]);
    setTimeout(() => setPressed(prev => prev.filter(p => p.id !== pid)), 200);
  };

  // ── SONUÇ ───────────────────────────────────────────────────────────────────
  if (done) {
    const total = TOTAL_NOTES;
    const bonus = calcBonus(perfectRef.current + scoreRef.current * 0.5, total * 2);
    return (
      <View style={ps.center}>
        <Text style={{ fontSize: 60, marginBottom: 8 }}>
          {scoreRef.current >= total * 1.4 ? '🎹🏆' : scoreRef.current >= total ? '🎹' : '🎵'}
        </Text>
        <Text style={ps.resultTitle}>🎵 Twinkle Twinkle</Text>
        <Text style={[ps.resultTitle, { fontSize: 22, marginTop: -4 }]}>{scoreRef.current} Puan</Text>
        <Text style={ps.resultSub}>
          {perfectRef.current >= total * 0.7 ? 'Piyano virtüözü!'
            : scoreRef.current >= total ? 'Harika çalındı!'
            : 'Notalar biraz kaçtı, pratik yapalım!'}
        </Text>
        <View style={ps.statsRow}>
          <View style={ps.statBox}><Text style={ps.statVal}>{perfectRef.current}</Text><Text style={ps.statLbl}>⭐ Mükemmel</Text></View>
          <View style={ps.statBox}><Text style={ps.statVal}>{missRef.current}</Text><Text style={ps.statLbl}>✗ Kaçırma</Text></View>
        </View>
        <View style={ps.bonusBox}>
          <Text style={ps.bonusTitle}>🎹 Kazanılan bonuslar</Text>
          {bonus.creativity > 0 && <Text style={ps.bonusLine}>🎨 Yaratıcılık +{bonus.creativity}</Text>}
          {bonus.focus > 0      && <Text style={ps.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          {bonus.happiness > 0  && <Text style={ps.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
        </View>
        <TouchableOpacity style={ps.btn} onPress={() => onComplete(bonus)}>
          <Text style={ps.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={ps.screen}>
      {/* HUD */}
      <View style={ps.hud}>
        <View style={ps.hudTop}>
          <Text style={ps.hudTitle}>🎹 Twinkle Twinkle Little Star</Text>
          {combo >= 3 && <Text style={ps.combo}>{combo}x 🔥</Text>}
        </View>
        <View style={ps.hudRow}>
          <Text style={ps.hudScore}>⭐ {score}</Text>
          <View style={ps.progressBar}>
            <View style={[ps.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <Text style={ps.hudMiss}>✗ {misses}</Text>
        </View>
        <Text style={ps.hint}>Nota HIT çizgisine gelince doğru tuşa bas!</Text>
      </View>

      {/* Düşme alanı */}
      <View style={ps.fallArea}>
        {/* HIT çizgisi */}
        <View style={[ps.hitLine, { top: HIT_Y }]} />
        <Text style={[ps.hitLabel, { top: HIT_Y - 14 }]}>— HIT —</Text>

        {/* Düşen notalar */}
        {notes.map(n => (
          <View key={n.id} style={{
            position: 'absolute',
            left: n.x, top: n.y,
            width: n.w, height: NOTE_H_PX,
            borderRadius: 8,
            backgroundColor: n.color + 'cc',
            borderWidth: 2,
            borderColor: n.color,
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>
              {WHITE_KEYS.find(k => k.id === n.keyId)?.label ?? ''}
            </Text>
          </View>
        ))}

        {/* Tuş basma parlaması */}
        {pressed.map(p => <FlashKey key={p.id} keyId={p.keyId} color={p.color} />)}

        {/* Feedback metinleri */}
        {feedback.map(f => (
          <Text key={f.id} style={[ps.feedbackTxt, { left: f.x, top: f.y, color: f.color }]}>
            {f.text}
          </Text>
        ))}
      </View>

      {/* Piyano */}
      <View style={ps.piano}>
        {/* Beyaz tuşlar */}
        <View style={ps.whiteKeys}>
          {WHITE_KEYS.map(k => {
            const incoming = notes.some(n =>
              n.keyId === k.id && Math.abs((n.y + NOTE_H_PX / 2) - HIT_Y) < HIT_WIN + 40
            );
            const isPressed = pressed.some(p => p.keyId === k.id);
            return (
              <TouchableOpacity
                key={k.id}
                style={[ps.whiteKey,
                  incoming  && { backgroundColor: k.color + '28', borderColor: k.color, borderWidth: 2.5 },
                  isPressed && { backgroundColor: k.color + '66' },
                ]}
                onPress={() => handleKey(k.id, k.color)}
                activeOpacity={0.5}
              >
                {incoming && <View style={[ps.readyPulse, { backgroundColor: k.color }]} />}
                <View style={[ps.whiteKeyDot, { backgroundColor: k.color }]} />
                <Text style={[ps.whiteKeyLabel, { color: k.color }]}>{k.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {/* Siyah tuşlar */}
        <View style={ps.blackKeysLayer} pointerEvents="box-none">
          {BLACK_KEYS.map(k => {
            const [l] = k.between;
            const left = 8 + l * KEY_W + KEY_W - BLACK_KEY_W / 2;
            return (
              <TouchableOpacity
                key={k.id}
                style={[ps.blackKey, { left, width: BLACK_KEY_W, height: BLACK_KEY_H },
                  pressed.some(p=>p.keyId===k.id) && { backgroundColor: '#555' }]}
                onPress={() => handleKey(k.id, '#e2e8f0')}
                activeOpacity={0.7}
              >
                <Text style={ps.blackKeyLabel}>{k.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const ps = StyleSheet.create({
  screen:      { flex: 1, backgroundColor: '#07050f' },
  center:      { flex: 1, backgroundColor: '#07050f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:         { height: HUD_H, paddingTop: SAFE_TOP, paddingHorizontal: 14, backgroundColor: '#100d1f', borderBottomWidth: 1, borderColor: '#2a2040' },
  hudTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hudTitle:    { color: '#c4b5fd', fontSize: 12, fontWeight: '800', flex: 1 },
  combo:       { color: '#fbbf24', fontSize: 13, fontWeight: '900' },
  hudRow:      { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 3 },
  hudScore:    { color: '#fbbf24', fontSize: 13, fontWeight: '800', minWidth: 40 },
  progressBar: { flex: 1, height: 5, backgroundColor: '#2a2040', borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: '100%', backgroundColor: '#a855f7', borderRadius: 3 },
  hudMiss:     { color: '#f85149', fontSize: 13, fontWeight: '800', minWidth: 40, textAlign: 'right' },
  hint:        { color: '#6b7280', fontSize: 10, textAlign: 'center' },
  fallArea:    { height: FALL_H, position: 'relative', backgroundColor: '#0a0818', overflow: 'hidden' },
  hitLine:     { position: 'absolute', left: 0, right: 0, height: 3, backgroundColor: '#fbbf24', opacity: 0.7 },
  hitLabel:    { position: 'absolute', alignSelf: 'center', color: '#fbbf24', fontSize: 9, fontWeight: '800', opacity: 0.7 },
  feedbackTxt: { position: 'absolute', fontSize: 12, fontWeight: '900', zIndex: 20 },
  piano:       { height: PIANO_H, backgroundColor: '#1a1830', borderTopWidth: 2, borderColor: '#2a2040' },
  whiteKeys:   { flexDirection: 'row', height: PIANO_H, paddingHorizontal: 8 },
  whiteKey:    {
    flex: 1, height: PIANO_H - 4, backgroundColor: '#f8f5ff',
    borderRadius: 6, marginHorizontal: 1.5, borderWidth: 1, borderColor: '#ccc',
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 6,
    shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 4, elevation: 3,
  },
  readyPulse:  { position: 'absolute', top: 4, width: 10, height: 10, borderRadius: 5, opacity: 0.8 },
  whiteKeyDot:  { width: 8, height: 8, borderRadius: 4, marginBottom: 4 },
  whiteKeyLabel:{ fontSize: 9, fontWeight: '800' },
  blackKeysLayer:{ position: 'absolute', top: 2, left: 0, right: 0, height: BLACK_KEY_H },
  blackKey:    {
    position: 'absolute', top: 0,
    backgroundColor: '#1a1018',
    borderRadius: 5, borderWidth: 1, borderColor: '#444',
    alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 4,
    shadowColor: '#000', shadowOpacity: 0.8, shadowRadius: 6, elevation: 6,
    zIndex: 10,
  },
  blackKeyLabel:{ color: '#888', fontSize: 7, fontWeight: '700' },
  resultTitle:  { color: '#c4b5fd', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  resultSub:    { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  statsRow:     { flexDirection: 'row', gap: 16, marginBottom: 14 },
  statBox:      { backgroundColor: '#100d1f', borderRadius: 12, padding: 12, alignItems: 'center', minWidth: 90, borderWidth: 1, borderColor: '#2a2040' },
  statVal:      { color: '#e6edf3', fontSize: 22, fontWeight: '900' },
  statLbl:      { color: '#8b949e', fontSize: 10, marginTop: 2 },
  bonusBox:     { backgroundColor: '#100d1f', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a2040' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:    { color: '#c4b5fd', fontSize: 13, marginBottom: 2 },
  btn:          { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:       { color: '#fff', fontSize: 16, fontWeight: '800' },
});
