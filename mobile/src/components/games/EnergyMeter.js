import { useEffect, useRef, useState } from 'react';
import { Animated, PanResponder, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const BAR_W = width - 64;

// Yoğunluk seviyelerini renk + etiket ile eşleştir
function detectLevels(choices) {
  const labels = choices.map(c => c.label);
  const HIGH   = labels.findIndex(l => /yoğun|yoğun|hard|max|agresif/i.test(l));
  const MED    = labels.findIndex(l => /dengeli|balanced|orta/i.test(l));
  const LOW    = labels.findIndex(l => /rahat|kısıtlı|dinlen|easy|az/i.test(l));

  // Bulamazsa sıralı ata: büyük ilk = yüksek enerji
  const order = choices.map((_, i) => i);
  return {
    high: HIGH >= 0 ? HIGH : order[0],
    mid:  MED  >= 0 ? MED  : order[Math.floor(order.length / 2)],
    low:  LOW  >= 0 ? LOW  : order[order.length - 1],
  };
}

export default function EnergyMeter({ scene, gameState, onChoose, Conditions }) {
  const visibleChoices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));
  const levels = detectLevels(visibleChoices);

  const [filled, setFilled] = useState(0.5);   // 0..1
  const [selected, setSelected] = useState(null);
  const [locked, setLocked] = useState(false);
  const fillAnim = useRef(new Animated.Value(0.5 * BAR_W)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, { toValue: 1.04, duration: 700, useNativeDriver: true }),
        Animated.timing(pulseAnim, { toValue: 1,    duration: 700, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !locked,
      onMoveShouldSetPanResponder: () => !locked,
      onPanResponderGrant: (e) => updateFill(e.nativeEvent.locationX),
      onPanResponderMove: (e) => updateFill(e.nativeEvent.locationX),
      onPanResponderRelease: () => {},
    })
  ).current;

  const updateFill = (x) => {
    const clamped = Math.max(0, Math.min(BAR_W, x));
    const ratio = clamped / BAR_W;
    setFilled(ratio);
    Animated.timing(fillAnim, { toValue: clamped, duration: 0, useNativeDriver: false }).start();
    // Seçim belirle
    const idx = ratio > 0.66 ? levels.high : ratio > 0.33 ? levels.mid : levels.low;
    setSelected(idx);
  };

  const getBarColor = () => {
    if (filled > 0.66) return '#f85149';
    if (filled > 0.33) return '#d29922';
    return '#3fb950';
  };

  const getLevelLabel = () => {
    if (filled > 0.66) return '🔥 Yüksek';
    if (filled > 0.33) return '⚖️ Orta';
    return '😌 Düşük';
  };

  const confirm = () => {
    if (selected === null || locked) return;
    setLocked(true);
    setTimeout(() => onChoose(visibleChoices[selected]), 350);
  };

  const barColor = getBarColor();

  return (
    <View style={s.container}>
      <Text style={s.title}>Enerji Seviyeni Belirle</Text>
      <Text style={s.sub}>Çubuğu sürükle, sonra onayla</Text>

      {/* Seçilen karar */}
      {selected !== null && (
        <Animated.View style={[s.selectedBox, { borderColor: barColor, transform: [{ scale: pulseAnim }] }]}>
          <Text style={s.levelLabel}>{getLevelLabel()}</Text>
          <Text style={s.selectedLabel}>{visibleChoices[selected]?.label}</Text>
        </Animated.View>
      )}

      {/* Enerji çubuğu */}
      <View style={[s.trackWrap]} {...panResponder.panHandlers}>
        <View style={[s.track]}>
          <Animated.View style={[s.fill, { width: fillAnim, backgroundColor: barColor }]} />
          {/* İşaret noktaları */}
          {[0.33, 0.66].map((pct, i) => (
            <View key={i} style={[s.marker, { left: BAR_W * pct - 1 }]} />
          ))}
        </View>
        {/* Seviye etiketleri */}
        <View style={s.labels}>
          <Text style={[s.lvlTxt, { color: '#3fb950' }]}>😌 Düşük</Text>
          <Text style={[s.lvlTxt, { color: '#d29922' }]}>⚖️ Orta</Text>
          <Text style={[s.lvlTxt, { color: '#f85149' }]}>🔥 Yüksek</Text>
        </View>
      </View>

      {/* Seçenek listesi */}
      <View style={s.choiceList}>
        {visibleChoices.map((c, i) => (
          <TouchableOpacity
            key={i}
            style={[s.choiceItem, selected === i && { borderColor: barColor, backgroundColor: barColor + '15' }]}
            onPress={() => { setSelected(i); const pct = i === levels.low ? 0.16 : i === levels.mid ? 0.5 : 0.84; setFilled(pct); Animated.timing(fillAnim, { toValue: pct * BAR_W, duration: 300, useNativeDriver: false }).start(); }}
          >
            <Text style={[s.choiceTxt, selected === i && { color: '#e6edf3' }]}>{c.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity
        style={[s.confirmBtn, { backgroundColor: barColor }, (!selected !== null || locked) && s.disabled]}
        onPress={confirm}
        disabled={selected === null || locked}
      >
        <Text style={s.confirmTxt}>{locked ? 'Devam ediyor…' : '✓ Onayla'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container:    { paddingTop: 8 },
  title:        { color: '#e6edf3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:          { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  selectedBox:  { borderWidth: 2, borderRadius: 14, padding: 14, alignItems: 'center', marginBottom: 16 },
  levelLabel:   { color: '#e6edf3', fontSize: 13, marginBottom: 4 },
  selectedLabel:{ color: '#fff', fontSize: 16, fontWeight: '700', textAlign: 'center' },
  trackWrap:    { paddingHorizontal: 8, marginBottom: 12 },
  track:        { height: 28, backgroundColor: '#21262d', borderRadius: 14, overflow: 'hidden', position: 'relative', width: BAR_W },
  fill:         { position: 'absolute', top: 0, left: 0, bottom: 0, borderRadius: 14 },
  marker:       { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#0d1117' },
  labels:       { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6, width: BAR_W },
  lvlTxt:       { fontSize: 12, fontWeight: '600' },
  choiceList:   { gap: 8, marginBottom: 16 },
  choiceItem:   { borderRadius: 12, borderWidth: 1.5, borderColor: '#30363d', padding: 12 },
  choiceTxt:    { color: '#8b949e', fontSize: 15, fontWeight: '600' },
  confirmBtn:   { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  confirmTxt:   { color: '#fff', fontSize: 16, fontWeight: '800' },
  disabled:     { opacity: 0.5 },
});
