/**
 * ResimKursuGame — Renk Atölyesi 🎨
 * Uzakta küçük bir hedef resim var. Yanındaki büyük tuvali boyayarak eşleştir.
 * Fırçayı alt paletten bir renge batır → tuvaldeki bölgeye dokun.
 * 4 resim × 4-5 bölge. Bonus: creativity / happiness / focus
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── Tuval boyutları (mantıksal birim: 300 × 210) ────────────────────────────
const LW = 300;
const LH = 210;
const CANVAS_W = Math.min(SW - 40, 340);
const CANVAS_H = Math.round(CANVAS_W * (LH / LW));
const SX = CANVAS_W / LW;
const SY = CANVAS_H / LH;
const REF_SCALE = 0.28; // hedef resim ölçeği

// ─── Renk paleti ──────────────────────────────────────────────────────────────
const C = {
  sky:   { hex: '#60a5fa', label: 'Gök Mavi',   emoji: '🔵' },
  sun:   { hex: '#fbbf24', label: 'Sarı',        emoji: '🟡' },
  orange:{ hex: '#f97316', label: 'Turuncu',     emoji: '🟠' },
  red:   { hex: '#ef4444', label: 'Kırmızı',     emoji: '🔴' },
  purple:{ hex: '#a855f7', label: 'Mor',         emoji: '🟣' },
  green: { hex: '#22c55e', label: 'Yeşil',       emoji: '🟢' },
  dgreen:{ hex: '#15803d', label: 'Koyu Yeşil',  emoji: '🌿' },
  brown: { hex: '#92400e', label: 'Kahverengi',  emoji: '🟤' },
  cyan:  { hex: '#22d3ee', label: 'Camgöbeği',   emoji: '🩵' },
  white: { hex: '#f1f5f9', label: 'Beyaz',       emoji: '⚪' },
  pink:  { hex: '#f472b6', label: 'Pembe',       emoji: '🩷' },
  yellow:{ hex: '#fde047', label: 'Açık Sarı',   emoji: '💛' },
};

// ─── Resimler ─────────────────────────────────────────────────────────────────
// Bölgeler alt→üst sırada (sonraki üste çizer)
// x,y,w,h: mantıksal (0-300, 0-210)  |  r: tüm köşe yarıçapı
// tl/tr/bl/br: köşe özelleştirme     |  ow: sadece kenarlık (outline)
const PAINTINGS = [
  {
    id: 'sunset', name: 'Günbatımı', emoji: '🌅',
    regions: [
      { id:'sky',    c:'orange', label:'Gökyüzü', x:0,   y:0,   w:300, h:130, r:0                         },
      { id:'sun',    c:'yellow', label:'Güneş',   x:108, y:12,  w:84,  h:84,  r:999                       },
      { id:'hills',  c:'purple', label:'Tepeler', x:0,   y:100, w:300, h:80,  tl:55, tr:55, bl:0, br:0    },
      { id:'ground', c:'green',  label:'Zemin',   x:0,   y:160, w:300, h:50,  r:0                         },
    ],
    palette: ['orange','yellow','purple','green','sky'],
  },
  {
    id: 'sea', name: 'Deniz Kenarı', emoji: '🏖️',
    regions: [
      { id:'sky',  c:'sky',   label:'Gökyüzü',    x:0,  y:0,   w:300, h:90,  r:0       },
      { id:'sun',  c:'sun',   label:'Güneş',       x:210,y:8,   w:68,  h:68,  r:999     },
      { id:'sea',  c:'cyan',  label:'Deniz',       x:0,  y:80,  w:300, h:90,  r:0       },
      { id:'sand', c:'brown', label:'Kum',         x:0,  y:158, w:300, h:52,  tl:14,tr:14,bl:0,br:0 },
    ],
    palette: ['sky','sun','cyan','brown','white'],
  },
  {
    id: 'forest', name: 'Orman', emoji: '🌲',
    regions: [
      { id:'sky',    c:'sky',    label:'Gökyüzü',   x:0,   y:0,   w:300, h:80,  r:0               },
      { id:'ground', c:'green',  label:'Zemin',     x:0,   y:170, w:300, h:40,  r:0               },
      { id:'trunk',  c:'brown',  label:'Gövde',     x:122, y:120, w:56,  h:90,  r:6               },
      { id:'canopy', c:'dgreen', label:'Yapraklar', x:20,  y:30,  w:260, h:130, tl:80,tr:80,bl:0,br:0 },
    ],
    palette: ['sky','green','brown','dgreen','sun'],
  },
  {
    id: 'flower', name: 'Çiçek Bahçesi', emoji: '🌺',
    regions: [
      { id:'bg',     c:'sky',   label:'Arkaplan',   x:0,   y:0,   w:300, h:210, r:0  },
      { id:'ground', c:'green', label:'Zemin',      x:0,   y:165, w:300, h:45,  r:0  },
      { id:'stem',   c:'dgreen',label:'Sap',        x:136, y:95,  w:28,  h:100, r:8  },
      { id:'petals', c:'red',   label:'Taç Yaprak', x:70,  y:15,  w:160, h:130, r:80 },
      { id:'center', c:'sun',   label:'Çiçek Göb.', x:116, y:55,  w:68,  h:68,  r:34 },
    ],
    palette: ['sky','green','dgreen','red','sun','pink'],
  },
];

const calcBonus = (score) => ({
  creativity: score >= 18 ? 6 : score >= 14 ? 5 : score >= 10 ? 4 : score >= 6 ? 3 : 2,
  happiness:  score >= 16 ? 4 : score >= 12 ? 3 : score >= 8  ? 2 : 1,
  focus:      score >= 14 ? 3 : score >= 10 ? 2 : score >= 6  ? 1 : 0,
});

// ─── Hedef / Tuval bölgesi ─────────────────────────────────────────────────────
function PaintRegion({ region, filled, onPress, isShaking, isFlashing, flashOk, scale = 1 }) {
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const fillAnim  = useRef(new Animated.Value(filled ? 1 : 0)).current;

  useEffect(() => {
    if (isShaking) {
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: -8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  8, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -4, duration: 50, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue:  0, duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, [isShaking]);

  useEffect(() => {
    if (filled) {
      Animated.spring(fillAnim, { toValue: 1, friction: 4, tension: 180, useNativeDriver: true }).start();
    }
  }, [filled]);

  const x = region.x * scale * SX;
  const y = region.y * scale * SY;
  const w = region.w * scale * SX;
  const h = region.h * scale * SY;

  const borderRadii = {
    borderRadius:            (region.r   || 0) * scale * SX,
    borderTopLeftRadius:     (region.tl  || region.r || 0) * scale * SX,
    borderTopRightRadius:    (region.tr  || region.r || 0) * scale * SX,
    borderBottomLeftRadius:  (region.bl  !== undefined ? region.bl : (region.r || 0)) * scale * SX,
    borderBottomRightRadius: (region.br  !== undefined ? region.br : (region.r || 0)) * scale * SX,
  };

  const bgColor = filled
    ? C[region.c]?.hex
    : isFlashing ? (flashOk ? '#14532d' : '#450a0a')
    : '#1a1a30';

  const borderColor = isFlashing ? (flashOk ? '#22c55e' : '#ef4444') : '#334155';

  const inner = (
    <Animated.View style={[
      {
        position: 'absolute',
        left: x, top: y, width: w, height: h,
        backgroundColor: bgColor,
        borderWidth: filled ? 0 : 1.5,
        borderColor,
        ...borderRadii,
        transform: [
          { translateX: shakeAnim },
          { scale: fillAnim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.04, 1] }) },
        ],
        overflow: 'hidden',
      },
    ]}>
      {!filled && (
        <Text style={[rk.regionLabel, { top: h / 2 - 7, width: w - 4, left: 2 }]} numberOfLines={1}>
          {region.label}
        </Text>
      )}
    </Animated.View>
  );

  // Referans için (scale < 1): dokunulamaz
  if (scale < 0.9) return inner;

  return (
    <TouchableOpacity
      style={{ position: 'absolute', left: x, top: y, width: w, height: h, zIndex: region.z || 1 }}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {inner}
    </TouchableOpacity>
  );
}

// ─── Boya paleti butonu ───────────────────────────────────────────────────────
function ColorBtn({ colorKey, selected, onPress }) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const wobble    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (selected) {
      const loop = Animated.loop(Animated.sequence([
        Animated.timing(wobble, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(wobble, { toValue:-1, duration: 400, useNativeDriver: true }),
      ]));
      loop.start();
      return () => { loop.stop(); wobble.setValue(0); };
    }
  }, [selected]);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.3, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.0, friction: 6, useNativeDriver: true }),
    ]).start();
    onPress(colorKey);
  };

  const color = C[colorKey];
  const rotate = wobble.interpolate({ inputRange: [-1, 1], outputRange: ['-12deg', '12deg'] });

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.8}>
      <Animated.View style={[rk.colorBtn, {
        backgroundColor: color?.hex,
        transform: [{ scale: scaleAnim }, { rotate: selected ? rotate : '0deg' }],
        borderWidth: selected ? 3 : 1.5,
        borderColor: selected ? '#fff' : color?.hex + '88',
        shadowColor: selected ? '#fff' : color?.hex,
        shadowOpacity: selected ? 0.9 : 0.3,
        shadowRadius: selected ? 10 : 4,
        elevation: selected ? 10 : 3,
      }]}>
        <Text style={{ fontSize: 18 }}>{color?.emoji}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Ana bileşen ──────────────────────────────────────────────────────────────
export default function ResimKursuGame({ choice, onComplete }) {
  const [paintIdx,  setPaintIdx] = useState(0);
  const [filled,    setFilled]   = useState({});     // regionId → true
  const [brush,     setBrush]    = useState(null);   // selected colorKey
  const [shakeId,   setShakeId]  = useState(null);
  const [flashInfo, setFlashInfo]= useState(null);   // {id, ok}
  const [score,     setScore]    = useState(0);
  const [done,      setDone]     = useState(false);
  const [completing,setComplete] = useState(false);  // painting complete animation

  const scoreRef   = useRef(0);
  const painting   = PAINTINGS[paintIdx];
  const totalFills = painting.regions.length;
  const doneCount  = painting.regions.filter(r => filled[r.id]).length;

  // Resim tamamlandı mı?
  useEffect(() => {
    if (doneCount === totalFills && totalFills > 0 && !completing) {
      setComplete(true);
      setTimeout(() => {
        setComplete(false);
        if (paintIdx < PAINTINGS.length - 1) {
          setPaintIdx(i => i + 1);
          setFilled({});
          setBrush(null);
        } else {
          setDone(true);
        }
      }, 1600);
    }
  }, [doneCount]);

  const pickColor = useCallback((colorKey) => {
    setBrush(prev => prev === colorKey ? null : colorKey);
  }, []);

  const tapRegion = useCallback((region) => {
    if (!brush || filled[region.id] || completing) return;
    if (brush === region.c) {
      // DOĞRU
      setFilled(prev => ({ ...prev, [region.id]: true }));
      scoreRef.current += 1;
      setScore(scoreRef.current);
      setFlashInfo({ id: region.id, ok: true });
      setTimeout(() => setFlashInfo(null), 600);
    } else {
      // YANLIŞ
      setShakeId(region.id);
      setFlashInfo({ id: region.id, ok: false });
      setTimeout(() => { setShakeId(null); setFlashInfo(null); }, 650);
    }
  }, [brush, filled, completing]);

  // ── SONUÇ ──────────────────────────────────────────────────────────────────
  if (done) {
    const maxScore = PAINTINGS.reduce((s, p) => s + p.regions.length, 0);
    const bonus = calcBonus(scoreRef.current);
    const pct   = scoreRef.current / maxScore;
    const medal = pct >= 0.9 ? '🏆' : pct >= 0.7 ? '🥇' : pct >= 0.5 ? '🥈' : '🎨';
    return (
      <View style={rk.center}>
        <Text style={{ fontSize: 70, marginBottom: 8 }}>{medal}</Text>
        <Text style={rk.resultTitle}>{scoreRef.current}/{maxScore} Bölge!</Text>
        <Text style={rk.resultSub}>
          {pct >= 0.9 ? 'Profesyonel bir ressam gibi boyadın!' :
           pct >= 0.7 ? 'Harika bir tuval çalışması!' :
           pct >= 0.5 ? 'Güzel bir başlangıç!' :
           'Pratik yaptıkça ustalaşırsın!'}
        </Text>
        <View style={rk.bonusBox}>
          <Text style={rk.bonusTitle}>🎨 Kazanılan Bonuslar</Text>
          {bonus.creativity > 0 && <Text style={rk.bonusLine}>🎨 Yaratıcılık +{bonus.creativity}</Text>}
          {bonus.happiness  > 0 && <Text style={rk.bonusLine}>😊 Mutluluk +{bonus.happiness}</Text>}
          {bonus.focus      > 0 && <Text style={rk.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
        </View>
        <TouchableOpacity style={rk.btn} onPress={() => onComplete(bonus)}>
          <Text style={rk.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={rk.screen}>
      {/* HUD */}
      <View style={rk.hud}>
        <View style={rk.hudRow}>
          <Text style={rk.hudStep}>Resim {paintIdx + 1}/{PAINTINGS.length}</Text>
          <Text style={rk.hudTitle}>🎨 {painting.name}</Text>
          <Text style={rk.hudScore}>⭐ {score}</Text>
        </View>
        {/* Tamamlanma çubuğu */}
        <View style={rk.progressBar}>
          <View style={[rk.progressFill, { width: `${(doneCount / totalFills) * 100}%` }]} />
        </View>
      </View>

      <View style={rk.body}>
        {/* Sol: Hedef resim */}
        <View style={rk.refBox}>
          <Text style={rk.refLabel}>🎯 HEDEF</Text>
          <View style={[rk.refFrame, {
            width:  CANVAS_W * REF_SCALE,
            height: CANVAS_H * REF_SCALE,
          }]}>
            {painting.regions.map(r => (
              <PaintRegion
                key={r.id}
                region={r}
                filled={true}
                scale={REF_SCALE}
                onPress={() => {}}
              />
            ))}
          </View>
        </View>

        {/* Sağ: Fırça göstergesi */}
        <View style={rk.brushBox}>
          <Text style={rk.brushEmoji}>🖌️</Text>
          <View style={[rk.brushColor, {
            backgroundColor: brush ? C[brush]?.hex : 'transparent',
            borderWidth: brush ? 0 : 2,
            borderColor: '#334155',
          }]}>
            {!brush && <Text style={{ color: '#4b5563', fontSize: 9 }}>Renk{'\n'}Seç</Text>}
          </View>
        </View>
      </View>

      {/* Tuval */}
      <View style={rk.canvasWrap}>
        {completing && (
          <View style={rk.completeOverlay}>
            <Text style={rk.completeEmoji}>{painting.emoji}</Text>
            <Text style={rk.completeTxt}>Harika! ✨</Text>
          </View>
        )}
        <View style={{ width: CANVAS_W, height: CANVAS_H, position: 'relative' }}>
          {painting.regions.map(r => (
            <PaintRegion
              key={r.id}
              region={r}
              filled={!!filled[r.id]}
              onPress={() => tapRegion(r)}
              isShaking={shakeId === r.id}
              isFlashing={flashInfo?.id === r.id}
              flashOk={flashInfo?.ok}
              scale={1}
            />
          ))}
        </View>
        {!brush && (
          <Text style={rk.canvasHint}>👆 Aşağıdan renk seç, sonra bölgeye dokun</Text>
        )}
        {brush && (
          <Text style={rk.canvasHint}>🖌️ {C[brush]?.label} seçili — bölgeye dokun!</Text>
        )}
      </View>

      {/* Palet */}
      <View style={rk.paletteWrap}>
        <Text style={rk.paletteLabel}>🎨 Boya Paleti</Text>
        <View style={rk.palette}>
          {painting.palette.map(ck => (
            <ColorBtn
              key={ck}
              colorKey={ck}
              selected={brush === ck}
              onPress={pickColor}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const rk = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#07050f' },
  center:       { flex: 1, backgroundColor: '#07050f', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:          { paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#0e0c1e', borderBottomWidth: 1, borderColor: '#2a1c44' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  hudTitle:     { color: '#c084fc', fontSize: 13, fontWeight: '900' },
  hudStep:      { color: '#8b949e', fontSize: 12, minWidth: 65 },
  hudScore:     { color: '#fbbf24', fontSize: 13, fontWeight: '800', minWidth: 55, textAlign: 'right' },
  progressBar:  { height: 4, backgroundColor: '#1e1433', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: '#a855f7', borderRadius: 2 },
  body:         { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: 12, paddingTop: 10, paddingBottom: 4 },
  refBox:       { flex: 1, alignItems: 'center' },
  refLabel:     { color: '#6b7280', fontSize: 9, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  refFrame:     { position: 'relative', backgroundColor: '#1a1a30', borderRadius: 6, borderWidth: 1, borderColor: '#334155', overflow: 'hidden' },
  brushBox:     { alignItems: 'center', paddingLeft: 10, paddingRight: 4 },
  brushEmoji:   { fontSize: 26, marginBottom: 3 },
  brushColor:   { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  canvasWrap:   { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, position: 'relative' },
  canvasHint:   { color: '#4b5563', fontSize: 11, textAlign: 'center', marginTop: 6 },
  completeOverlay: { position: 'absolute', zIndex: 99, top: 0, bottom: 0, left: 0, right: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(168,85,247,0.35)', borderRadius: 12 },
  completeEmoji:{ fontSize: 64 },
  completeTxt:  { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 8 },
  paletteWrap:  { paddingBottom: Platform.OS === 'android' ? 10 : 24, paddingTop: 6, backgroundColor: '#0e0c1e', borderTopWidth: 1, borderColor: '#2a1c44' },
  paletteLabel: { color: '#6b7280', fontSize: 9, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginBottom: 6 },
  palette:      { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', gap: 10, paddingHorizontal: 16 },
  colorBtn:     { width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  regionLabel:  { color: '#4b6080', fontSize: 9, fontWeight: '700', textAlign: 'center', position: 'absolute' },
  resultTitle:  { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:    { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14, lineHeight: 20 },
  bonusBox:     { backgroundColor: '#0e0c1e', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#2a1c44' },
  bonusTitle:   { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:    { color: '#c084fc', fontSize: 13, marginBottom: 2 },
  btn:          { backgroundColor: '#7c3aed', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14, shadowColor: '#7c3aed', shadowOpacity: 0.5, shadowRadius: 8 },
  btnTxt:       { color: '#fff', fontSize: 16, fontWeight: '800' },
});
