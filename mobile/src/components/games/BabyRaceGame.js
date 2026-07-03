/**
 * BabyRaceGame — Örüntü bazlı biberon runner
 * - 20 belirlenmiş örüntü: hiçbir zaman aynı şeritte biberon + DUR olamaz
 * - Tek döngü (tek setInterval) — race condition yok
 * - useInsertionEffect hatası: Animated callback içinde setState yok
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, PanResponder, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

// iOS: shadow props, Android: elevation
const shadow = (color, opacity, radius, elev) =>
  Platform.OS === 'android'
    ? { elevation: elev }
    : { shadowColor: color, shadowOpacity: opacity, shadowRadius: radius };

const { width: SW, height: SH } = Dimensions.get('window');
const HUD_H = SAFE_TOP + 60;
const CTRL_H  = 80;
const GAME_H  = SH - HUD_H - CTRL_H;
const LANE_H  = GAME_H / 3;
const CAR_X   = 74;
const CAR_W   = 54;
const OBJ_W   = 46;
const OBJ_H   = 46;
const GATE_W  = 64;
const GATE_H  = LANE_H * 0.70;
const SPEED   = 7.5;
const TICK    = 16;
// Kaç tick'te bir biberon spawn edilir (320ms / 16ms = 20 tick)
const SPAWN_TICKS = 20;
// Her 2. biberon spawn'ında DUR tabelası çıkar (diğer 2 şeride)
const STOP_EVERY  = 2;
const BOTTLE_GOAL = 300;
const BTL_PER_RWD = 10;
const COLLECT_X   = CAR_X + 34;

const laneY = (l) => l * LANE_H + LANE_H / 2;

const LANES = [
  { key: 'anne',     label: 'Anne',   icon: '👩', color: '#b392f0', bg: '#1e1035', dark: '#110828' },
  { key: 'continue', label: '›  ›  ›', icon: '▶', color: '#3fb950', bg: '#0d2316', dark: '#07150d' },
  { key: 'baba',    label: 'Baba',   icon: '👨', color: '#58a6ff', bg: '#0a1e32', dark: '#060f1c' },
];

const ANNE_STATS = [
  { ico: '😊', label: 'Mutluluk', key: 'happiness',  base: 12, ppt: 0.40 },
  { ico: '🤝', label: 'Sosyal',   key: 'social',     base: 10, ppt: 0.33 },
  { ico: '💜', label: 'Empati',   key: 'empathy',    base: 8,  ppt: 0.27 },
];
const BABA_STATS = [
  { ico: '💪', label: 'Özgüven',  key: 'confidence', base: 12, ppt: 0.40 },
  { ico: '🎯', label: 'Disiplin', key: 'discipline', base: 10, ppt: 0.33 },
  { ico: '⚡', label: 'Odak',     key: 'focus',      base: 8,  ppt: 0.27 },
];

// ─── 20 belirlenmiş örüntü ────────────────────────────────────────────────────
// Her adım: { b: biberon şeridi (0-2), n: kaç biberon sonra şerit değişir }
// DİĞER 2 şerit otomatik DUR tabelası alır — hiçbir zaman çakışma yok
const PATTERNS = [
  [{b:1,n:8 },{b:0,n:6 },{b:1,n:8 },{b:2,n:6 },{b:1,n:6 }],
  [{b:0,n:5 },{b:2,n:5 },{b:0,n:5 },{b:2,n:5 },{b:1,n:6 }],
  [{b:0,n:12},{b:1,n:5 },{b:2,n:8 },{b:1,n:5 }],
  [{b:2,n:12},{b:1,n:5 },{b:0,n:8 },{b:1,n:5 }],
  [{b:1,n:6 },{b:0,n:4 },{b:2,n:4 },{b:0,n:4 },{b:1,n:6 }],
  [{b:0,n:4 },{b:1,n:4 },{b:2,n:4 },{b:1,n:4 },{b:0,n:4 }],
  [{b:2,n:6 },{b:1,n:4 },{b:0,n:6 },{b:1,n:4 },{b:2,n:6 }],
  [{b:1,n:10},{b:0,n:3 },{b:1,n:10},{b:2,n:3 }],
  [{b:2,n:9 },{b:0,n:5 },{b:2,n:9 },{b:1,n:5 }],
  [{b:0,n:9 },{b:2,n:5 },{b:0,n:9 },{b:1,n:5 }],
  [{b:0,n:3 },{b:2,n:3 },{b:1,n:3 },{b:0,n:3 },{b:2,n:3 }],
  [{b:0,n:8 },{b:1,n:5 },{b:2,n:8 },{b:1,n:5 }],
  [{b:0,n:7 },{b:1,n:7 },{b:0,n:7 },{b:1,n:7 }],
  [{b:2,n:7 },{b:1,n:7 },{b:2,n:7 },{b:1,n:7 }],
  [{b:0,n:4 },{b:2,n:4 },{b:0,n:4 },{b:2,n:4 },{b:1,n:6 }],
  [{b:0,n:5 },{b:1,n:5 },{b:2,n:5 },{b:1,n:5 },{b:0,n:5 }],
  [{b:2,n:5 },{b:1,n:5 },{b:0,n:5 },{b:1,n:5 },{b:2,n:5 }],
  [{b:0,n:6 },{b:2,n:4 },{b:1,n:8 },{b:0,n:4 },{b:2,n:6 }],
  [{b:1,n:3 },{b:0,n:3 },{b:1,n:3 },{b:2,n:3 },{b:1,n:3 },{b:0,n:3 }],
  [{b:0,n:14},{b:2,n:14},{b:1,n:10}],
];

// ─── Hız çizgileri ───────────────────────────────────────────────────────────
const STREAKS = [
  { y:LANE_H*0.15,w:120,d:0,  t:650 }, { y:LANE_H*0.65,w:60, d:200,t:510 },
  { y:LANE_H*1.20,w:140,d:70, t:760 }, { y:LANE_H*1.70,w:80, d:330,t:590 },
  { y:LANE_H*2.20,w:110,d:120,t:700 }, { y:LANE_H*2.70,w:55, d:440,t:550 },
  { y:LANE_H*0.42,w:45, d:270,t:480 }, { y:LANE_H*1.50,w:95, d:380,t:630 },
];
const Streak = React.memo(({ y, w, d, t }) => {
  const x = useRef(new Animated.Value(SW + w)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(x, { toValue: -w, duration: t, delay: d, useNativeDriver: true, easing: Easing.linear })
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return (
    <Animated.View pointerEvents="none" style={{
      position: 'absolute', top: y, height: 1.5, width: w,
      backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 1,
      transform: [{ translateX: x }],
    }} />
  );
});

// ─── Bebek arabası ────────────────────────────────────────────────────────────
function BabyCarriage({ color = '#1f6feb' }) {
  return (
    <View style={{ alignItems: 'center', width: CAR_W }}>
      <View style={{ width: 20, height: 7, backgroundColor: color, borderRadius: 4, alignSelf: 'flex-end', marginRight: 7, marginBottom: 1, shadowColor: color, shadowOpacity: 0.8, shadowRadius: 4 }} />
      <View style={{ width: CAR_W, height: 28, backgroundColor: color, borderRadius: 10, justifyContent: 'center', alignItems: 'center', ...shadow(color, 0.9, 14, 8), borderWidth: 1.5, borderColor: '#ffffff33' }}>
        <Text style={{ fontSize: 14 }}>🍼</Text>
      </View>
      <View style={{ width: CAR_W - 4, height: 4, backgroundColor: color + '99', borderRadius: 2, marginTop: 1 }} />
      <View style={{ flexDirection: 'row', width: CAR_W - 4, justifyContent: 'space-between', marginTop: 1 }}>
        {[0, 1].map(i => (
          <View key={i} style={{ width: 14, height: 14, borderRadius: 7, backgroundColor: '#0d1117', borderWidth: 2.5, borderColor: color, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: color }} />
          </View>
        ))}
      </View>
    </View>
  );
}

// ─── DUR levhası (özel View) ──────────────────────────────────────────────────
function DurSign({ size }) {
  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      {/* Sekizgen efekti: döndürülmüş kare + normal kare */}
      <View style={{
        position: 'absolute', width: size * 0.82, height: size * 0.82,
        backgroundColor: '#b91c1c', borderRadius: size * 0.1,
        transform: [{ rotate: '22.5deg' }],
      }} />
      <View style={{
        position: 'absolute', width: size * 0.82, height: size * 0.82,
        backgroundColor: '#b91c1c', borderRadius: size * 0.1,
      }} />
      {/* Beyaz iç çerçeve */}
      <View style={{
        position: 'absolute', width: size * 0.65, height: size * 0.65,
        borderRadius: size * 0.08, borderWidth: 2.5, borderColor: '#ffffff',
        transform: [{ rotate: '22.5deg' }],
      }} />
      {/* DUR yazısı */}
      <Text style={{ color: '#ffffff', fontSize: size * 0.26, fontWeight: '900', letterSpacing: 2 }}>
        DUR
      </Text>
    </View>
  );
}

// ─── Nesne görünümü ────────────────────────────────────────────────────────────
const ObjectView = React.memo(({ obj }) => {
  const isGate = obj.type.startsWith('gate_');
  if (isGate) {
    const idx = obj.type === 'gate_anne' ? 0 : obj.type === 'gate_continue' ? 1 : 2;
    const ld  = LANES[idx];
    return (
      <Animated.View style={{
        position: 'absolute',
        left: obj.x - GATE_W / 2, top: laneY(obj.lane) - GATE_H / 2,
        width: GATE_W, height: GATE_H,
        backgroundColor: ld.bg, borderRadius: 14,
        borderWidth: 3, borderColor: ld.color,
        justifyContent: 'center', alignItems: 'center',
        ...shadow(ld.color, 0.9, 16, 10),
        transform: [{ scale: obj.sc }],
      }}>
        <Text style={{ fontSize: 28 }}>{ld.icon}</Text>
        <Text style={{ color: ld.color, fontSize: 12, fontWeight: '800', marginTop: 3 }}>{ld.label}</Text>
      </Animated.View>
    );
  }
  if (obj.type === 'bottle') {
    return (
      <Animated.View style={{
        position: 'absolute',
        left: obj.x - OBJ_W / 2, top: laneY(obj.lane) - OBJ_H / 2,
        width: OBJ_W, height: OBJ_H,
        backgroundColor: '#1a3a5c', borderRadius: OBJ_W * 0.5,
        borderWidth: 2.5, borderColor: '#60a5fa',
        justifyContent: 'center', alignItems: 'center',
        ...shadow('#60a5fa', 0.85, 8, 6),
        transform: [{ scale: obj.sc }],
      }}>
        <Text style={{ fontSize: OBJ_W * 0.58 }}>🍼</Text>
      </Animated.View>
    );
  }
  // DUR tabelası
  return (
    <Animated.View style={{
      position: 'absolute',
      left: obj.x - OBJ_W / 2, top: laneY(obj.lane) - OBJ_H / 2,
      ...shadow('#ef4444', 0.9, 10, 8),
      transform: [{ scale: obj.sc }],
    }}>
      <DurSign size={OBJ_W} />
    </Animated.View>
  );
});

// ─── +1 popup ─────────────────────────────────────────────────────────────────
const Popup = React.memo(({ p }) => (
  <Animated.Text pointerEvents="none" style={{
    position: 'absolute', left: CAR_X + 38, top: laneY(p.lane) - 16,
    color: '#60a5fa', fontSize: 19, fontWeight: '900',
    opacity: p.opacity, transform: [{ translateY: p.ty }],
  }}>🍼 +1</Animated.Text>
));

// ─── Polis yanıp-sönen ışık ───────────────────────────────────────────────────
function PoliceFlash() {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, { toValue: 1, duration: 280, useNativeDriver: false }),
        Animated.timing(anim, { toValue: 0, duration: 280, useNativeDriver: false }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const bg = anim.interpolate({ inputRange: [0, 1], outputRange: ['#0a0000', '#2d0000'] });
  return <Animated.View style={[StyleSheet.absoluteFill, { backgroundColor: bg }]} pointerEvents="none" />;
}

// ─── Animasyon havuzu (useInsertionEffect hatasını önler) ────────────────────
// Animated.Value'ları render döngüsü dışında önceden oluşturuyoruz
function useAnimPool(size = 30) {
  return useRef(Array.from({ length: size }, () => new Animated.Value(0))).current;
}

// ─── Typewriter ───────────────────────────────────────────────────────────────
function TypewriterText({ text, speed = 18, style, onComplete }) {
  const [shown, setShown] = useState('');
  const idxRef = useRef(0);
  useEffect(() => {
    idxRef.current = 0;
    setShown('');
    const t = setInterval(() => {
      idxRef.current++;
      if (idxRef.current <= text.length) {
        setShown(text.slice(0, idxRef.current));
        if (idxRef.current === text.length) { clearInterval(t); onComplete?.(); }
      }
    }, speed);
    return () => clearInterval(t);
  }, [text]);
  return <Text style={style}>{shown}</Text>;
}

const BABY_STORY =
  '2001 yılı, İstanbul\'un kalabalık sokaklarından birinde...\n\n' +
  'Annen bir anlığına başka tarafa baktı. Meraklı gözlerinle dünyayı ' +
  'keşfetmek için bebek arabanla yola düştün!\n\n' +
  'Anne 👩 ve Baban 👨 park kapısında seni arıyor. ' +
  'Biberon toplayarak güçlen ve onlara ulaş!\n\n' +
  '⚠️  DUR tabelasına çarparsan polisler seni bulur — ödülsüz eve dönersin.';

function StoryScreen({ onDone }) {
  const [done, setDone] = useState(false);
  return (
    <View style={ss.container}>
      <Text style={ss.title}>👶 Bebek Yolculuğu</Text>
      <View style={ss.box}>
        <TypewriterText
          text={BABY_STORY}
          speed={18}
          style={ss.text}
          onComplete={() => setDone(true)}
        />
      </View>
      <TouchableOpacity
        style={[ss.btn, !done && ss.btnSecondary]}
        onPress={onDone}
      >
        <Text style={ss.btnTxt}>{done ? '🚀 Hazırım, Başla!' : '⏭  Atla'}</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function BabyRaceGame({ onChoice, sceneText }) {
  const [phase,      setPhase]      = useState('story');
  const [bottles,    setBottles]    = useState(0);
  const [rewards,    setRewards]    = useState(0);
  const [playerLane, setPlayerLane] = useState(1);
  const [objects,    setObjects]    = useState([]);
  const [popups,     setPopups]     = useState([]);
  const [result,     setResult]     = useState(null);

  // Animated
  const carY    = useRef(new Animated.Value(laneY(1))).current;
  const carTilt = useRef(new Animated.Value(0)).current;
  const carBob  = useRef(new Animated.Value(0)).current;
  const flashOp = useRef(new Animated.Value(1)).current;
  const shakeX  = useRef(new Animated.Value(0)).current;

  // Animasyon havuzu — setInterval içinde new Animated.Value() yaratmıyoruz
  const scPool   = useAnimPool(30);
  const scPoolI  = useRef(0);
  const getAnim  = useCallback(() => {
    const a = scPool[scPoolI.current % scPool.length];
    scPoolI.current++;
    a.setValue(0);
    Animated.spring(a, { toValue: 1, friction: 5, tension: 220, useNativeDriver: true }).start();
    return a;
  }, []);

  // Oyun durumu ref'leri
  const laneR      = useRef(1);
  const bottlesR   = useRef(0);
  const rewardsR   = useRef(0);
  const phaseR     = useRef('ready');
  const objsR      = useRef([]);
  const nextId     = useRef(0);
  const popupIdR   = useRef(0);
  const loopId      = useRef(null);
  const bobLoop     = useRef(null);
  const tickFnRef   = useRef(null);     // arguments.callee yerine — Hermes/Android uyumlu
  const lastLaneChg   = useRef(0);       // şerit değişim debounce
  const lastTriggerY   = useRef(null);   // son şerit değişiminin Y konumu
  // Örüntü durumu
  const patternI   = useRef(0);
  const stepI      = useRef(0);
  const stepCnt    = useRef(0);   // mevcut adımda kaç biberon çıktı
  const spawnCnt   = useRef(0);   // toplam spawn sayacı (DUR için)
  const spawnTick  = useRef(0);   // bir sonraki spawn'a kaç tick kaldı
  const gateMode   = useRef(false);
  // Uçtan-uca geçiş güvenliği: 0↔2 geçişinde ortada (lane 1) DUR yerine biberon
  const crossingCount = useRef(0); // kalan "güvenli" spawn sayısı

  const sceneTitle = (() => {
    const m = sceneText?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
    return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
  })();

  const startBob = () => {
    bobLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(carBob, { toValue: -5, duration: 260, useNativeDriver: true }),
        Animated.timing(carBob, { toValue: 0,  duration: 260, useNativeDriver: true }),
      ])
    );
    bobLoop.current.start();
  };

  const doFlash = () => {
    Animated.sequence([
      Animated.timing(flashOp, { toValue: 0.12, duration: 50, useNativeDriver: true }),
      Animated.timing(flashOp, { toValue: 1,    duration: 110, useNativeDriver: true }),
    ]).start();
    Animated.sequence([
      Animated.timing(shakeX, { toValue: -13, duration: 36, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  13, duration: 36, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:  -7, duration: 36, useNativeDriver: true }),
      Animated.timing(shakeX, { toValue:   0, duration: 36, useNativeDriver: true }),
    ]).start();
  };

  // Popup: Animated callback içinde setState YOK → useInsertionEffect hatası önlendi
  const addPopup = useCallback((lane) => {
    const id = popupIdR.current++;
    const op = new Animated.Value(1);
    const ty = new Animated.Value(0);
    setPopups(prev => [...prev, { id, lane, opacity: op, ty }]);
    Animated.parallel([
      Animated.timing(op, { toValue: 0, duration: 650, useNativeDriver: true }),
      Animated.timing(ty, { toValue: -50, duration: 650, useNativeDriver: true }),
    ]).start();
    // Animated callback yerine setTimeout kullan — useInsertionEffect güvenli
    setTimeout(() => setPopups(prev => prev.filter(x => x.id !== id)), 700);
  }, []);

  // Mevcut örüntü adımına göre biberon şeridini döndür
  const currentBottleLane = () => {
    const pat  = PATTERNS[patternI.current % PATTERNS.length];
    return pat[stepI.current % pat.length].b;
  };

  // Spawn: tek şeritte biberon, diğer 2 şeritte DUR
  // Uçtan-uca geçişlerde (lane 0↔2) ortada (lane 1) DUR yerine biberon koyar
  const doSpawn = useCallback(() => {
    if (gateMode.current) return;
    const bl = currentBottleLane();

    // Sonraki adımın biberon şeridini hesapla
    const pat     = PATTERNS[patternI.current % PATTERNS.length];
    const step    = pat[stepI.current % pat.length];
    const isLastPat = stepI.current >= pat.length - 1;
    const nextPat   = isLastPat
      ? PATTERNS[(patternI.current + 1) % PATTERNS.length]
      : pat;
    const nextStepIdx = isLastPat ? 0 : (stepI.current + 1) % pat.length;
    const nextBl    = nextPat[nextStepIdx].b;

    // 0↔2 geçişi → ortadan (lane 1) geçmek zorunlu
    const crossingNeeded = Math.abs(bl - nextBl) === 2;
    // Adımın son 3 biberon'unda geçiş güvenliği aktif et
    const nearEnd = stepCnt.current >= Math.max(0, step.n - 3);

    if (crossingNeeded && nearEnd && crossingCount.current <= 0) {
      crossingCount.current = 3; // geçiş sonrası da 3 spawn güvenli
    }
    if (crossingCount.current > 0) crossingCount.current--;

    const isCrossingSafe = (crossingNeeded && nearEnd) || crossingCount.current > 0;

    // Biberon
    objsR.current = [...objsR.current, {
      id: nextId.current++, lane: bl, x: SW + 60, type: 'bottle', sc: getAnim(),
    }];

    // DUR — her STOP_EVERY biberonda bir
    if (spawnCnt.current % STOP_EVERY === 0) {
      [0, 1, 2].filter(l => l !== bl).forEach(l => {
        if (l === 1 && isCrossingSafe) {
          // Geçiş anında lane 1'e DUR yerine biberon koy
          objsR.current = [...objsR.current, {
            id: nextId.current++, lane: 1, x: SW + 80, type: 'bottle', sc: getAnim(),
          }];
          return;
        }
        objsR.current = [...objsR.current, {
          id: nextId.current++, lane: l, x: SW + 60, type: 'stop', sc: getAnim(),
        }];
      });
    }

    spawnCnt.current++;
    stepCnt.current++;

    // Adım ilerleme
    if (stepCnt.current >= step.n) {
      stepCnt.current = 0;
      stepI.current   = (stepI.current + 1) % pat.length;
      if (stepI.current === 0) {
        patternI.current = (patternI.current + 1) % PATTERNS.length;
      }
    }
  }, [getAnim]);

  // Kapıları spawn et
  const spawnGates = useCallback(() => {
    gateMode.current = true;
    objsR.current = [];
    setTimeout(() => {
      objsR.current = [
        { id: nextId.current++, lane: 0, x: SW + 60,  type: 'gate_anne',     sc: getAnim() },
        { id: nextId.current++, lane: 1, x: SW + 100, type: 'gate_continue', sc: getAnim() },
        { id: nextId.current++, lane: 2, x: SW + 140, type: 'gate_baba',     sc: getAnim() },
      ];
    }, 400);
  }, [getAnim]);

  const launchGame = useCallback(() => {
    clearInterval(loopId.current);
    bobLoop.current?.stop?.();

    phaseR.current   = 'playing';
    laneR.current    = 1;
    bottlesR.current = 0;
    rewardsR.current = 0;
    objsR.current    = [];
    nextId.current   = 0;
    patternI.current = 0;
    stepI.current    = 0;
    stepCnt.current  = 0;
    spawnCnt.current = 0;
    spawnTick.current = 0;
    gateMode.current    = false;
    crossingCount.current = 0;
    scPoolI.current     = 0;

    setPhase('playing'); setPlayerLane(1);
    setBottles(0); setRewards(0);
    setObjects([]); setPopups([]);
    setResult(null);

    carY.setValue(laneY(1));
    carTilt.setValue(0); carBob.setValue(0); shakeX.setValue(0);

    startBob();

    // Callback'i ref'e kaydet → gate_continue'da arguments.callee olmadan yeniden kullanılır
    tickFnRef.current = () => {
      if (phaseR.current !== 'playing' && phaseR.current !== 'gates') return;

      // ── Spawn tick ──
      spawnTick.current++;
      if (spawnTick.current >= SPAWN_TICKS && phaseR.current === 'playing') {
        spawnTick.current = 0;
        doSpawn();
      }

      // ── Nesneleri ilerlet & ekran dışını sil ──
      objsR.current = objsR.current
        .map(o => ({ ...o, x: o.x - SPEED }))
        .filter(o => o.x > -90);

      // ── Çarpışma & toplama ──
      let crashed  = false;
      let gateHit  = null;
      let newBtl   = bottlesR.current;

      objsR.current = objsR.current.filter(o => {
        if (o.x > COLLECT_X || o.lane !== laneR.current) return true;
        if (o.type === 'bottle') {
          newBtl++;
          addPopup(o.lane);
          return false;
        }
        if (o.type === 'stop') {
          // Sadece arabanın ön yarısına çarparsa kaza
          // CAR_X = 74, ön sınırı = 74 - 8 = 66
          // Tabelanın X'i ≥ 66 ise ön → kaza; < 66 ise arka → geçiyor
          if (o.x > CAR_X - 8) crashed = true;
          return false;
        }
        if (o.type.startsWith('gate_')) {
          gateHit = o.type.replace('gate_', '');
          return false;
        }
        return true;
      });

      // Biberon sayısı değiştiyse güncelle
      if (newBtl !== bottlesR.current) {
        bottlesR.current = newBtl;
        const nr = Math.floor(newBtl / BTL_PER_RWD);
        if (nr !== rewardsR.current) { rewardsR.current = nr; setRewards(nr); }
        setBottles(newBtl);

        // 300 biberona ulaşıldı → kapılar
        if (newBtl >= BOTTLE_GOAL && phaseR.current === 'playing') {
          phaseR.current = 'gates';
          setPhase('gates');
          spawnGates();
        }
      }

      if (crashed) {
        clearInterval(loopId.current);
        bobLoop.current?.stop?.();
        doFlash();
        objsR.current = [];
        phaseR.current = 'crashed';
        setObjects([]);
        // 2 sn bekle — oyuncuya çarpışmayı göster
        setTimeout(() => setPhase('crashed'), 2000);
        return;
      }

      if (gateHit) {
        clearInterval(loopId.current);
        bobLoop.current?.stop?.();
        objsR.current = [];
        setObjects([]);

        if (gateHit === 'continue') {
          // Yeni tur — birikmiş ödüller korunur, biberon sıfırlanır
          bottlesR.current  = 0;
          // rewardsR sıfırlanmıyor — devam edince toplanmaya devam eder
          stepI.current     = 0;
          stepCnt.current   = 0;
          spawnTick.current = 0;
          gateMode.current  = false;
          patternI.current  = (patternI.current + 1) % PATTERNS.length;
          phaseR.current    = 'playing';
          setBottles(0);
          setPhase('playing');
          startBob();
          // arguments.callee yerine ref — Hermes/Android strict mode uyumlu
          loopId.current = setInterval(tickFnRef.current, TICK);
          return;
        }

        setResult(gateHit);
        phaseR.current = 'done';
        setPhase('done');
        return;
      }

      setObjects([...objsR.current]);
    };
    loopId.current = setInterval(tickFnRef.current, TICK);
  }, [doSpawn, spawnGates, addPopup]);

  useEffect(() => () => {
    clearInterval(loopId.current);
    bobLoop.current?.stop?.();
  }, []);

  const changeLane = useCallback((dir) => {
    if (phaseR.current !== 'playing' && phaseR.current !== 'gates') return;
    // Debounce: ardışık dokunuşlarda tek seferlik şerit değişimi (220ms)
    const now = Date.now();
    if (now - lastLaneChg.current < 220) return;
    lastLaneChg.current = now;
    const n = Math.max(0, Math.min(2, laneR.current + dir));
    if (n === laneR.current) return;
    laneR.current = n;
    setPlayerLane(n);
    Animated.spring(carY, { toValue: laneY(n), friction: 7, tension: 240, useNativeDriver: true }).start();
    Animated.sequence([
      Animated.timing(carTilt, { toValue: dir * -15, duration: 85, useNativeDriver: true }),
      Animated.spring(carTilt, { toValue: 0, friction: 4, useNativeDriver: true }),
    ]).start();
  }, []);

  // PanResponder — parmak ekranda tutulurken sürekli hareket algılar
  // Her ~16px dikey kayma = 1 şerit değişimi (bırakmadan da çalışır)
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  (_, gs) => Math.abs(gs.dy) > 4,
      onPanResponderGrant: (evt) => {
        lastTriggerY.current = evt.nativeEvent.pageY;
      },
      onPanResponderMove: (evt) => {
        if (phaseR.current !== 'playing' && phaseR.current !== 'gates') return;
        const curY  = evt.nativeEvent.pageY;
        const delta = curY - (lastTriggerY.current ?? curY);
        if (Math.abs(delta) < 16) return;
        lastTriggerY.current = curY;
        const now = Date.now();
        if (now - lastLaneChg.current < 180) return;
        lastLaneChg.current = now;
        const dir = delta > 0 ? 1 : -1;
        const n = Math.max(0, Math.min(2, laneR.current + dir));
        if (n === laneR.current) return;
        laneR.current = n;
        setPlayerLane(n);
        // Fizik: şerit değişiminde, yeni şeritte zaten arabanın gerisinde
        // kalan tabelalar (x ≤ CAR_X) geçilmiş sayılır — temizle
        objsR.current = objsR.current.filter(
          o => o.lane !== n || o.x > CAR_X
        );
        Animated.spring(carY, { toValue: laneY(n), friction: 12, tension: 90, useNativeDriver: true }).start();
        Animated.sequence([
          Animated.timing(carTilt, { toValue: dir * -15, duration: 85, useNativeDriver: true }),
          Animated.spring(carTilt, { toValue: 0, friction: 4, useNativeDriver: true }),
        ]).start();
      },
      onPanResponderRelease: () => { lastTriggerY.current = null; },
    })
  ).current;

  const calcBonus = (key, rwds) => {
    const stats = key === 'anne' ? ANNE_STATS : BABA_STATS;
    return Object.fromEntries(
      stats.map(st => [st.key, Math.min(st.base + 20, Math.round(st.base + rwds * st.ppt))])
    );
  };

  // ════════ HİKAYE ════════
  if (phase === 'story') {
    return <StoryScreen onDone={() => setPhase('ready')} />;
  }

  // ════════ HAZIR ════════
  if (phase === 'ready') {
    return (
      <View style={s.center}>
        {sceneTitle && <Text style={s.sceneTitle}>{sceneTitle}</Text>}
        <Text style={s.gameTitle}>Bebek Yolculuğu</Text>
        <Text style={s.gameSub}>300 biberon topla → aile şeridine gir!</Text>
        <View style={s.rewardTable}>
          {[{ ld: LANES[0], stats: ANNE_STATS }, { ld: LANES[2], stats: BABA_STATS }].map(({ ld, stats }, ri) => (
            <View key={ri} style={[s.rewardCol, { borderColor: ld.color + '55' }]}>
              <Text style={{ fontSize: 28 }}>{ld.icon}</Text>
              <Text style={[s.rewardColTitle, { color: ld.color }]}>{ld.label}</Text>
              {stats.map((r, i) => (
                <View key={i} style={s.rewardRow}>
                  <Text style={s.rewardIco}>{r.ico}</Text>
                  <Text style={s.rewardLbl}>{r.label}</Text>
                  <Text style={[s.rewardVal, { color: ld.color }]}>+{r.base}~{r.base+12}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
        <View style={s.rulesBox}>
          {['🍼  Biberon şeridinde kal → topla', '🛑  Diğer şeritte DUR tabelası var', '10 biberon = 1 ödül puanı (max 30)', '300 biberonda aile kapısı çıkar'].map((r, i) => (
            <Text key={i} style={s.ruleItem}>{r}</Text>
          ))}
        </View>
        <View style={s.ctrlHintRow}>
          {[['👈','Sol → Yukarı'],['🍼','Biberon topla!'],['👉','Sağ → Aşağı']].map(([ico,txt],i) => (
            <View key={i} style={s.ctrlHintBox}><Text style={s.ctrlHintIco}>{ico}</Text><Text style={s.ctrlHintTxt}>{txt}</Text></View>
          ))}
        </View>
        <TouchableOpacity style={s.startBtn} onPress={launchGame}>
          <Text style={s.startBtnTxt}>🚀  Başla!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ════════ POLİS UYARISI ════════
  if (phase === 'crashed') {
    return (
      <View style={s.policeScreen}>
        <PoliceFlash />
        <Text style={s.policeIcon}>🚔</Text>
        <Text style={s.policeTitle}>KAYIP BEBEK{'\n'}BULUNDU!</Text>
        <Text style={s.policeSub}>Bebek arabanız DUR tabelasına çarptı.</Text>
        <View style={s.policeStats}>
          <Text style={s.policeStat}>🍼 Toplanan biberon: {bottles}</Text>
          <Text style={s.policeStat}>🎁 Kazanılan ödül: {rewards} puan</Text>
        </View>
        <View style={s.policeBtns}>
          <TouchableOpacity style={s.policeSecBtn} onPress={() => { setResult('no_reward'); setPhase('done'); }}>
            <Text style={s.policeSecTxt}>Ödülsüz Devam</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.policePrimBtn} onPress={launchGame}>
            <Text style={s.policePrimTxt}>🔄 Tekrar Oyna</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ════════ SONUÇ ════════
  if (phase === 'done' && result) {
    if (result === 'no_reward') {
      return (
        <View style={s.center}>
          <Text style={{ fontSize: 44, marginBottom: 12 }}>👮‍♂️</Text>
          <Text style={s.gameTitle}>Ödülsüz Devam</Text>
          <Text style={s.gameSub}>Bu seferde ödül yok.</Text>
          <TouchableOpacity style={s.startBtn} onPress={() => onChoice('Her ikisiyle de dengeli', {})}>
            <Text style={s.startBtnTxt}>Devam Et</Text>
          </TouchableOpacity>
        </View>
      );
    }
    const ld    = LANES.find(l => l.key === result);
    const bonus = calcBonus(result, rewards);
    const labelMap = { anne: 'Anneme daha yakınım', baba: 'Babama daha yakınım' };
    return (
      <View style={[s.center, { backgroundColor: ld?.color + '18' }]}>
        <Text style={{ fontSize: 74, marginBottom: 8 }}>{ld?.icon}</Text>
        <Text style={[s.gameTitle, { color: ld?.color }]}>{ld?.label} yolunu seçtin!</Text>
        <View style={s.statRow}>
          {[['🍼', bottles, 'Biberon'], ['🎁', rewards, 'Ödül']].map(([ico, v, l], i) => (
            <View key={i} style={s.statBox}>
              <Text style={{ fontSize: 22 }}>{ico}</Text>
              <Text style={s.statVal}>{v}</Text>
              <Text style={s.statLbl}>{l}</Text>
            </View>
          ))}
        </View>
        <View style={s.bonusBox}>
          <Text style={s.bonusTitle}>🎁 Oyuna Yansıyan Bonuslar</Text>
          {Object.entries(bonus).map(([k, v]) => {
            const stat = [...ANNE_STATS, ...BABA_STATS].find(x => x.key === k);
            return stat ? <Text key={k} style={[s.bonusLine, { color: ld?.color }]}>{stat.ico} {stat.label} +{v}</Text> : null;
          })}
        </View>
        <TouchableOpacity style={[s.startBtn, { backgroundColor: ld?.color }]}
          onPress={() => onChoice(labelMap[result], bonus)}>
          <Text style={s.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ════════ OYUN ════════
  const activeLane = LANES[playerLane];
  const progress   = Math.min(1, bottles / BOTTLE_GOAL);
  const bl         = currentBottleLane();

  return (
    <View style={s.screen}>
      {/* HUD */}
      <View style={s.hud}>
        <View style={s.hudCell}>
          <Text style={s.hudBig}>{bottles}</Text>
          <Text style={s.hudSub}>🍼 Biberon</Text>
        </View>
        <View style={[s.hudCell, { flex: 2 }]}>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${progress * 100}%`, backgroundColor: activeLane.color }]} />
          </View>
          <Text style={[s.hudSub, { marginTop: 4 }]}>{bottles}/{BOTTLE_GOAL}</Text>
        </View>
        <View style={s.hudCell}>
          <Text style={s.hudBig}>{rewards}</Text>
          <Text style={s.hudSub}>🎁 Ödül</Text>
        </View>
      </View>

      {/* Oyun alanı — tüm dikey sürüklemeyi PanResponder yakalar */}
      <Animated.View style={[s.game, { opacity: flashOp }]} {...panResponder.panHandlers}>
        {LANES.map((ld, i) => (
          <View key={i} style={[s.laneView, {
            top: i * LANE_H, height: LANE_H,
            backgroundColor: playerLane === i ? ld.bg : ld.dark,
          }]}>
            <View style={[s.laneBar, { backgroundColor: playerLane === i ? ld.color : 'transparent' }]} />
            <View style={s.laneLeftTag}>
              <Text style={{ fontSize: 18 }}>{ld.icon}</Text>
              <Text style={[s.laneTagTxt, { color: ld.color }]}>{ld.label}</Text>
            </View>
            <View style={s.laneRightTag}>
              <Text style={{ fontSize: 15 }}>{ld.icon}</Text>
            </View>
            {/* Biberon şeridi göstergesi (küçük titreşen nokta) */}
            {bl === i && phase === 'playing' && (
              <View style={[s.btlDot, { borderColor: ld.color, backgroundColor: ld.color + '33' }]}>
                <Text style={{ fontSize: 9, color: ld.color }}>🍼</Text>
              </View>
            )}
          </View>
        ))}

        <View style={[s.divLine, { top: LANE_H }]} />
        <View style={[s.divLine, { top: LANE_H * 2 }]} />

        {STREAKS.map((sd, i) => <Streak key={i} {...sd} />)}

        {objects.map(o => <ObjectView key={o.id} obj={o} />)}
        {popups.map(p => <Popup key={p.id} p={p} />)}

        <Animated.View style={[s.carContainer, {
          transform: [
            { translateY: carY },
            { translateY: carBob },
            { rotate: carTilt.interpolate({ inputRange: [-20, 20], outputRange: ['-20deg', '20deg'] }) },
            { translateX: shakeX },
          ],
        }]}>
          <BabyCarriage color={activeLane.color} />
        </Animated.View>

        {phase === 'gates' && (
          <View style={s.gatesBanner}>
            <Text style={s.gatesBannerTxt}>🏁 Ailenle buluş! Şeride gir!</Text>
          </View>
        )}

      </Animated.View>

      {/* Kontroller */}
      <View style={s.controls}>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => changeLane(-1)}>
          <Text style={s.ctrlArrow}>▲</Text>
          <Text style={s.ctrlLbl}>Anne</Text>
        </TouchableOpacity>
        <View style={s.ctrlMid}>
          <Text style={[s.ctrlLaneName, { color: activeLane.color }]}>{activeLane.icon}  {activeLane.label}</Text>
          <Text style={s.ctrlLaneSub}>aktif şerit</Text>
        </View>
        <TouchableOpacity style={s.ctrlBtn} onPress={() => changeLane(1)}>
          <Text style={s.ctrlArrow}>▼</Text>
          <Text style={s.ctrlLbl}>Baba</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const ss = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 28 },
  title:     { color: '#e6edf3', fontSize: 22, fontWeight: '900', marginBottom: 18, textAlign: 'center' },
  box:       { backgroundColor: '#0d1628', borderRadius: 16, padding: 20, marginBottom: 28, width: '100%', borderWidth: 1, borderColor: '#1c2e44', minHeight: 180 },
  text:      { color: '#c9d4df', fontSize: 15, lineHeight: 24 },
  btn:       { backgroundColor: '#1f6feb', paddingVertical: 15, paddingHorizontal: 40, borderRadius: 14 },
  btnSecondary: { backgroundColor: '#161b22', borderWidth: 1, borderColor: '#30363d' },
  btnTxt:    { color: '#fff', fontSize: 16, fontWeight: '800', textAlign: 'center' },
});

const s = StyleSheet.create({
  screen:  { height: SH, backgroundColor: '#050a14' },
  center:  { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 20 },
  sceneTitle:  { color: '#8b949e', fontSize: 12, marginBottom: 5, textAlign: 'center' },
  gameTitle:   { color: '#e6edf3', fontSize: 21, fontWeight: '900', textAlign: 'center', marginBottom: 5 },
  gameSub:     { color: '#8b949e', fontSize: 12, textAlign: 'center', marginBottom: 14 },
  rewardTable: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12, width: '100%' },
  rewardCol:   { flex: 1, backgroundColor: '#0d1117', borderRadius: 12, padding: 10, alignItems: 'center', borderWidth: 1 },
  rewardColTitle: { fontSize: 13, fontWeight: '800', marginTop: 3, marginBottom: 5 },
  rewardRow:   { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3, width: '100%' },
  rewardIco:   { fontSize: 12 },
  rewardLbl:   { color: '#8b949e', fontSize: 11, flex: 1 },
  rewardVal:   { fontSize: 11, fontWeight: '700' },
  rulesBox:    { backgroundColor: '#0d1117', borderRadius: 12, padding: 11, marginBottom: 10, width: '100%', borderWidth: 1, borderColor: '#21262d' },
  ruleItem:    { color: '#8b949e', fontSize: 12, marginBottom: 3 },
  ctrlHintRow: { flexDirection: 'row', gap: 7, marginBottom: 14, width: '100%' },
  ctrlHintBox: { flex: 1, backgroundColor: '#0d1117', borderRadius: 10, padding: 8, alignItems: 'center', gap: 4, borderWidth: 1, borderColor: '#21262d' },
  ctrlHintIco: { fontSize: 19 },
  ctrlHintTxt: { color: '#8b949e', fontSize: 10, textAlign: 'center' },
  startBtn:    { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 34, borderRadius: 14, shadowColor: '#1f6feb', shadowOpacity: 0.5, shadowRadius: 10 },
  startBtnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
  policeScreen: { flex: 1, backgroundColor: '#0a0000', alignItems: 'center', justifyContent: 'center', padding: 24 },
  policeIcon:   { fontSize: 70, marginBottom: 10 },
  policeTitle:  { color: '#f85149', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  policeSub:    { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  policeStats:  { backgroundColor: '#161b22', borderRadius: 12, padding: 13, marginBottom: 18, width: '100%' },
  policeStat:   { color: '#e6edf3', fontSize: 13, marginBottom: 3 },
  policeBtns:   { flexDirection: 'row', gap: 10, width: '100%' },
  policeSecBtn: { flex: 1, backgroundColor: '#161b22', borderRadius: 12, paddingVertical: 13, alignItems: 'center', borderWidth: 1, borderColor: '#30363d' },
  policeSecTxt: { color: '#8b949e', fontSize: 13, fontWeight: '700' },
  policePrimBtn:{ flex: 1, backgroundColor: '#b91c1c', borderRadius: 12, paddingVertical: 13, alignItems: 'center' },
  policePrimTxt:{ color: '#fff', fontSize: 13, fontWeight: '800' },
  statRow:    { flexDirection: 'row', gap: 12, marginBottom: 12 },
  statBox:    { backgroundColor: '#161b22', borderRadius: 12, padding: 13, alignItems: 'center', minWidth: 88 },
  statVal:    { color: '#e6edf3', fontSize: 19, fontWeight: '800' },
  statLbl:    { color: '#8b949e', fontSize: 10, marginTop: 2 },
  bonusBox:   { backgroundColor: '#0d1117', borderRadius: 12, padding: 12, marginBottom: 16, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#21262d' },
  bonusTitle: { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 5 },
  bonusLine:  { fontSize: 13, marginBottom: 2 },
  hud:         { height: HUD_H, flexDirection: 'row', alignItems: 'center', paddingTop: SAFE_TOP + 4, paddingHorizontal: 12, backgroundColor: '#06101e', borderBottomWidth: 1, borderColor: '#0d1f36', gap: 8 },
  hudCell:     { alignItems: 'center', flex: 1 },
  hudBig:      { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudSub:      { color: '#4b5563', fontSize: 10, marginTop: 1 },
  progressBar: { width: '100%', height: 6, backgroundColor: '#161b22', borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: '100%', borderRadius: 3 },
  game:        { flex: 1, position: 'relative', overflow: 'hidden' },
  laneView:    { position: 'absolute', left: 0, right: 0 },
  laneBar:     { position: 'absolute', left: 0, width: 4, top: 0, bottom: 0, borderRadius: 2 },
  laneLeftTag: { position: 'absolute', left: 10, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 50 },
  laneRightTag:{ position: 'absolute', right: 10, top: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', width: 30 },
  laneTagTxt:  { fontSize: 10, fontWeight: '800', marginTop: 1 },
  btlDot:      { position: 'absolute', right: 50, top: '50%', marginTop: -10, width: 20, height: 20, borderRadius: 10, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  divLine:     { position: 'absolute', left: 0, right: 0, height: 1.5, backgroundColor: '#ffffff12' },
  carContainer:{ position: 'absolute', left: CAR_X - CAR_W / 2, top: -(CAR_W / 2 + 10), width: CAR_W },
  gatesBanner: { position: 'absolute', left: 0, right: 0, bottom: 18, alignItems: 'center', zIndex: 20 },
  gatesBannerTxt: { color: '#ffd700', fontSize: 15, fontWeight: '800', backgroundColor: '#000000cc', paddingHorizontal: 14, paddingVertical: 7, borderRadius: 12 },
  controls:    { height: CTRL_H, flexDirection: 'row', alignItems: 'center', backgroundColor: '#07101e', borderTopWidth: 1, borderColor: '#131d2e', paddingHorizontal: 12 },
  ctrlBtn:     { width: 84, height: 54, backgroundColor: '#0d1628', borderRadius: 14, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#1c2e44' },
  ctrlArrow:   { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  ctrlLbl:     { color: '#4b5563', fontSize: 10, marginTop: 1 },
  ctrlMid:     { flex: 1, alignItems: 'center' },
  ctrlLaneName:{ fontSize: 15, fontWeight: '800' },
  ctrlLaneSub: { color: '#4b5563', fontSize: 10, marginTop: 1 },
});
