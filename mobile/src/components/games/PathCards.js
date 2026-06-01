import { useEffect, useRef, useState } from 'react';
import { Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

// Büyük dal seçimleri için renk/ikon haritası
const PATH_STYLES = {
  '🔬': { color: '#58a6ff', bg: '#0d2035', glyph: '🔬', label: 'Bilim' },
  '📖': { color: '#d29922', bg: '#2d2000', glyph: '📖', label: 'Eğitim' },
  '🔧': { color: '#e36209', bg: '#2d1500', glyph: '🔧', label: 'Teknik' },
  '🎨': { color: '#b392f0', bg: '#1e1535', glyph: '🎨', label: 'Sanat' },
  '🔨': { color: '#795548', bg: '#1a1008', glyph: '🔨', label: 'Usta' },
  '🎖️': { color: '#4caf50', bg: '#0d2a18', glyph: '🎖️', label: 'Askeri' },
  '🏢': { color: '#607d8b', bg: '#111820', glyph: '🏢', label: 'Kurumsal' },
  '🚀': { color: '#ff6b35', bg: '#2d1505', glyph: '🚀', label: 'Startup' },
  '🎓': { color: '#9c27b0', bg: '#1a0d2e', glyph: '🎓', label: 'Akademi' },
  '🌍': { color: '#00bcd4', bg: '#002028', glyph: '🌍', label: 'Yurt Dışı' },
  '⚙️': { color: '#78909c', bg: '#111820', glyph: '⚙️', label: 'Mühendis' },
  '💼': { color: '#8d6e63', bg: '#1a100a', glyph: '💼', label: 'İş' },
  '🏛️': { color: '#a1887f', bg: '#1a120f', glyph: '🏛️', label: 'Mimar' },
  '🏆': { color: '#ffc107', bg: '#2a1e00', glyph: '🏆', label: 'Spor' },
  '💰': { color: '#4db6ac', bg: '#002820', glyph: '💰', label: 'Servet' },
  '🏥': { color: '#ef5350', bg: '#2a0a0a', glyph: '🏥', label: 'Sağlık' },
  '✈️': { color: '#29b6f6', bg: '#001a2e', glyph: '✈️', label: 'Hava' },
  '🪖': { color: '#8bc34a', bg: '#102000', glyph: '🪖', label: 'Kara' },
  '⚓': { color: '#1565c0', bg: '#00113a', glyph: '⚓', label: 'Deniz' },
  '🌍': { color: '#26c6da', bg: '#002028', glyph: '🌍', label: 'Seyahat' },
};

function getStyle(label) {
  const emoji = label.match(/\p{Emoji_Presentation}/u)?.[0];
  return PATH_STYLES[emoji] || { color: '#58a6ff', bg: '#0d1117', glyph: '◆', label: '' };
}

function PathCard({ choice, index, selected, onPress }) {
  const st = getStyle(choice.label);
  const scaleAnim = useRef(new Animated.Value(0.85)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, delay: index * 100, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 350, delay: index * 100, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.82}>
      <Animated.View style={[
        pc.card,
        { backgroundColor: st.bg, borderColor: selected ? st.color : '#21262d', opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
          shadowColor: st.color, shadowOpacity: selected ? 0.5 : 0, shadowRadius: 10, elevation: selected ? 6 : 1,
        },
      ]}>
        <Text style={pc.glyph}>{st.glyph}</Text>
        <Text style={[pc.name, { color: st.color }]} numberOfLines={2}>{choice.label}</Text>
        {selected && (
          <View style={[pc.sel, { backgroundColor: st.color }]}>
            <Text style={pc.selTxt}>✓</Text>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function PathCards({ scene, gameState, onChoose, Conditions }) {
  const [selected, setSelected] = useState(null);
  const visibleChoices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));

  const handleSelect = (idx) => {
    if (selected === idx) {
      onChoose(visibleChoices[idx]);
    } else {
      setSelected(idx);
    }
  };

  return (
    <View style={p.container}>
      <Text style={p.hint}>
        {selected !== null ? 'Tekrar dokun → onayla' : 'Bir yol seç'}
      </Text>
      <View style={p.grid}>
        {visibleChoices.map((c, i) => (
          <PathCard
            key={i}
            choice={c}
            index={i}
            selected={selected === i}
            onPress={() => handleSelect(i)}
          />
        ))}
      </View>
      {selected !== null && (
        <View style={p.preview}>
          <Text style={p.previewTxt}>{visibleChoices[selected]?.label}</Text>
        </View>
      )}
    </View>
  );
}

const pc = StyleSheet.create({
  card: { width: (width - 52) / 3, height: 110, borderRadius: 16, borderWidth: 2, padding: 10, alignItems: 'center', justifyContent: 'center' },
  glyph:{ fontSize: 30, marginBottom: 6 },
  name: { fontSize: 11, fontWeight: '700', textAlign: 'center', lineHeight: 14 },
  sel:  { position: 'absolute', top: 6, right: 6, width: 20, height: 20, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  selTxt:{ color: '#fff', fontSize: 11, fontWeight: '800' },
});

const p = StyleSheet.create({
  container: { paddingTop: 4 },
  hint:      { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  preview:   { marginTop: 12, backgroundColor: '#161b22', borderRadius: 12, padding: 12, alignItems: 'center' },
  previewTxt:{ color: '#e6edf3', fontSize: 15, fontWeight: '700', textAlign: 'center' },
});
