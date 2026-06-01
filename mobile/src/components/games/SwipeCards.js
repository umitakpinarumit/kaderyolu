import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

function ChoiceCard({ choice, index, onSelect, selected, disabled, statPreview }) {
  const slideAnim = useRef(new Animated.Value(60)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(slideAnim, { toValue: 0, delay: index * 80, useNativeDriver: true }),
      Animated.timing(fadeAnim,  { toValue: 1, duration: 300, delay: index * 80, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.95, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1,    useNativeDriver: true }),
    ]).start();
    onSelect();
  };

  const net = statPreview?.net || 0;
  const borderColor = selected
    ? '#58a6ff'
    : net > 3 ? '#3fb950' : net < -3 ? '#f85149' : '#30363d';
  const bgColor = selected
    ? 'rgba(31,111,235,0.18)'
    : net > 3 ? 'rgba(63,185,80,0.06)' : net < -3 ? 'rgba(248,81,73,0.06)' : 'rgba(22,27,34,0.95)';

  return (
    <Animated.View style={[
      s.card,
      { borderColor, backgroundColor: bgColor, opacity: fadeAnim, transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
      disabled && s.disabled,
    ]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.8} disabled={disabled}>
        <Text style={s.label}>{choice.label}</Text>
        {statPreview?.lines?.length > 0 && (
          <View style={s.previewRow}>
            {statPreview.lines.slice(0, 5).map((line, i) => {
              const isPlus = line.includes('+');
              const isMinus = line.includes('-') && !line.includes('+-');
              return (
                <View key={i} style={[s.chip, isPlus && s.chipPlus, isMinus && s.chipMinus]}>
                  <Text style={[s.chipTxt, isPlus && s.chipTxtPlus, isMinus && s.chipTxtMinus]}>{line}</Text>
                </View>
              );
            })}
          </View>
        )}
        {selected && (
          <View style={s.selectedBadge}>
            <Text style={s.selectedTxt}>✓ Seçildi — doğrula</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function SwipeCards({ scene, gameState, onChoose, buildStatPreview, Conditions }) {
  const [selected, setSelected] = useState(null);
  const confirmAnim = useRef(new Animated.Value(0)).current;

  const visibleChoices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));

  const handleSelect = (idx) => {
    if (selected === idx) {
      onChoose(visibleChoices[idx]);
    } else {
      setSelected(idx);
      Animated.timing(confirmAnim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    }
  };

  return (
    <View style={s.container}>
      {visibleChoices.map((c, i) => (
        <ChoiceCard
          key={i}
          choice={c}
          index={i}
          selected={selected === i}
          disabled={selected !== null && selected !== i}
          statPreview={buildStatPreview(c)}
          onSelect={() => handleSelect(i)}
        />
      ))}
      {selected !== null && (
        <Animated.View style={[s.hint, { opacity: confirmAnim }]}>
          <Text style={s.hintTxt}>Tekrar dokun → onayla</Text>
        </Animated.View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:    { gap: 10 },
  card:         { borderRadius: 14, borderWidth: 1.5, padding: 14 },
  disabled:     { opacity: 0.45 },
  label:        { color: '#e6edf3', fontSize: 16, fontWeight: '700', marginBottom: 8 },
  previewRow:   { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  chip:         { backgroundColor: 'rgba(255,255,255,0.07)', paddingVertical: 3, paddingHorizontal: 8, borderRadius: 8 },
  chipPlus:     { backgroundColor: 'rgba(63,185,80,0.15)' },
  chipMinus:    { backgroundColor: 'rgba(248,81,73,0.15)' },
  chipTxt:      { color: '#8b949e', fontSize: 12 },
  chipTxtPlus:  { color: '#3fb950' },
  chipTxtMinus: { color: '#f85149' },
  selectedBadge:{ marginTop: 8, backgroundColor: 'rgba(88,166,255,0.15)', borderRadius: 8, padding: 6, alignItems: 'center' },
  selectedTxt:  { color: '#58a6ff', fontSize: 13, fontWeight: '700' },
  hint:         { alignItems: 'center', marginTop: 4 },
  hintTxt:      { color: '#58a6ff', fontSize: 13 },
});
