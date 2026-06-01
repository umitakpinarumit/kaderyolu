import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions, ScrollView } from 'react-native';
import BabyRaceGame from './BabyRaceGame';

const { width } = Dimensions.get('window');

// Sahne choices'daki label'larla birebir eşleşmeli
const CHARACTER_MAP = {
  'Babama daha yakınım': {
    emoji: '👨', name: 'Baba', color: '#1f6feb', bg: '#0d2035',
    trait: 'Pratik, güçlü, maceraperest'
  },
  'Anneme daha yakınım': {
    emoji: '👩', name: 'Anne', color: '#b392f0', bg: '#1e1535',
    trait: 'Şefkatli, anlayışlı, sanatsal'
  },
  'Her ikisiyle de dengeli': {
    emoji: '👨‍👩‍👦', name: 'Aile', color: '#3fb950', bg: '#0d2a18',
    trait: 'Dengeli, uyumlu, çok yönlü'
  },
};

function CharacterCard({ choice, selected, onPress, index }) {
  const char = CHARACTER_MAP[choice.label] || {
    emoji: '👤', name: choice.label, color: '#58a6ff', bg: '#0d2035', trait: ''
  };
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const fadeAnim  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, { toValue: 1, delay: index * 120, useNativeDriver: true }),
      Animated.timing(fadeAnim, { toValue: 1, duration: 400, delay: index * 120, useNativeDriver: true }),
    ]).start();
  }, []);

  const handlePress = () => {
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 0.9, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={[
      cs.card,
      { backgroundColor: char.bg, borderColor: selected ? char.color : '#ffffff22',
        opacity: fadeAnim, transform: [{ scale: scaleAnim }],
        shadowColor: char.color, shadowOpacity: selected ? 0.6 : 0, shadowRadius: 12, elevation: selected ? 8 : 2,
      },
    ]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.85}>
        <Text style={cs.emoji}>{char.emoji}</Text>
        <Text style={[cs.name, { color: char.color }]}>{char.name}</Text>
        <Text style={cs.trait}>{char.trait}</Text>
        {selected && (
          <View style={[cs.badge, { backgroundColor: char.color }]}>
            <Text style={cs.badgeTxt}>✓ Seçildi</Text>
          </View>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
}

// Sahne HTML metninden başlık ve paragrafları ayıkla
function parseSceneText(html) {
  if (!html) return { title: null, paragraphs: [] };
  const h2 = html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  const title = h2 ? h2[1].replace(/<[^>]+>/g, '').trim() : null;
  const pMatches = [...html.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi)];
  const paragraphs = pMatches.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
  return { title, paragraphs };
}

function isParentScene(scene) {
  if (!scene?.choices) return false;
  const labels = scene.choices.map(c => c.label).join(' ').toLowerCase();
  return labels.includes('baba') && labels.includes('anne');
}

export default function CharacterSelect({ scene, gameState, onChoose, Conditions, sceneText }) {
  const visibleChoices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));
  const parentScene    = isParentScene(scene);

  // Anne/Baba sahnelerinde doğrudan oyuna geç (kart seçimi kaldırıldı)
  const [mode, setMode]           = useState(parentScene ? 'race' : 'pick');
  const [selected, setSelected]   = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const parsed = parseSceneText(sceneText);

  const handleSelect = (idx) => {
    if (selected === idx && !confirmed) {
      setConfirmed(true);
      setTimeout(() => onChoose(visibleChoices[idx]), 400);
    } else {
      setSelected(idx);
    }
  };

  // BabyRaceGame bitti → label + bonus bonus istatistikler
  const handleRaceChoice = (label, bonus) => {
    const choice = visibleChoices.find(c => c.label === label) || visibleChoices[0];
    if (bonus && Object.values(bonus).some(v => v > 0)) {
      const enriched = {
        ...choice,
        effects: [...(choice.effects || []), { statDelta: bonus }],
      };
      onChoose(enriched);
    } else {
      onChoose(choice);
    }
  };

  if (mode === 'race') {
    return <BabyRaceGame onChoice={handleRaceChoice} sceneText={sceneText} />;
  }

  // Diğer karakter sahneleri için normal kart seçimi
  return (
    <ScrollView contentContainerStyle={cs.container}>
      {parsed.title ? <Text style={cs.sceneTitle}>{parsed.title}</Text> : null}
      {parsed.paragraphs.map((p, i) => (
        <Text key={i} style={cs.sceneBody}>{p}</Text>
      ))}
      <Text style={cs.question}>Kim ile daha yakınsın?</Text>
      <Text style={cs.hint}>Seç → tekrar dokun → onayla</Text>
      <View style={cs.row}>
        {visibleChoices.map((c, i) => (
          <CharacterCard
            key={i}
            choice={c}
            index={i}
            selected={selected === i}
            onPress={() => handleSelect(i)}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const cs = StyleSheet.create({
  container:  { flexGrow: 1, alignItems: 'center', paddingTop: 56, paddingHorizontal: 16, paddingBottom: 32 },
  sceneTitle: { color: '#ffffff', fontSize: 18, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  sceneBody:  { color: '#c9d4df', fontSize: 14, lineHeight: 20, textAlign: 'center', marginBottom: 6, paddingHorizontal: 8 },
  question:   { color: '#e6edf3', fontSize: 18, fontWeight: '700', marginTop: 20, marginBottom: 6, textAlign: 'center' },
  hint:       { color: '#8b949e', fontSize: 13, marginBottom: 20 },
  row:        { flexDirection: 'row', gap: 12, flexWrap: 'wrap', justifyContent: 'center' },
  card:       { width: (width - 72) / 3, borderRadius: 18, borderWidth: 2.5, padding: 14, alignItems: 'center', minWidth: 90 },
  emoji:      { fontSize: 48, marginBottom: 8 },
  name:       { fontSize: 15, fontWeight: '800', marginBottom: 4, textAlign: 'center' },
  trait:      { color: '#8b949e', fontSize: 11, textAlign: 'center', lineHeight: 16 },
  badge:      { marginTop: 8, borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  badgeTxt:   { color: '#fff', fontSize: 12, fontWeight: '700' },
});
