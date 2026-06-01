import { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

const RISK_COLORS = ['#3fb950', '#d29922', '#f85149'];
const RISK_LABELS = ['🟢 Güvenli', '🟡 Dengeli', '🔴 Riskli'];
const RISK_GLYPHS = ['🛡️', '⚖️', '🎰'];
const RISK_DESCS  = [
  'Düşük kazanç, düşük kayıp',
  'Orta kazanç, orta risk',
  'Yüksek kazanç, yüksek kayıp',
];

function detectRiskIndex(label) {
  const l = label.toLowerCase();
  if (/güvenli|safe|conservative|düşük|az/i.test(l)) return 0;
  if (/dengeli|balanced|orta|medium/i.test(l)) return 1;
  if (/riskli|risky|agresif|yüksek|büyük/i.test(l)) return 2;
  return 1;
}

export default function RiskSlider({ scene, gameState, onChoose, Conditions }) {
  const visibleChoices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));
  const [selected, setSelected] = useState(null);
  const pulseAnims = [useRef(new Animated.Value(1)).current, useRef(new Animated.Value(1)).current, useRef(new Animated.Value(1)).current];
  const fadeAnim   = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (selected !== null) {
      const anim = pulseAnims[selected % 3];
      Animated.loop(
        Animated.sequence([
          Animated.spring(anim, { toValue: 1.06, useNativeDriver: true }),
          Animated.spring(anim, { toValue: 1,    useNativeDriver: true }),
        ])
      ).start();
    }
  }, [selected]);

  const handleSelect = (idx) => {
    if (selected === idx) {
      onChoose(visibleChoices[idx]);
    } else {
      setSelected(idx);
    }
  };

  // Risk seviyelerini belirle
  const riskIdxMap = visibleChoices.map(c => detectRiskIndex(c.label));

  return (
    <Animated.View style={[rs.container, { opacity: fadeAnim }]}>
      <Text style={rs.title}>Risk Profilini Seç</Text>
      <Text style={rs.sub}>
        {selected !== null ? 'Tekrar dokun → onayla' : 'Hangi riski alıyorsun?'}
      </Text>

      {/* Risk göstergesi barı */}
      <View style={rs.barWrap}>
        {['Düşük', 'Orta', 'Yüksek'].map((lbl, i) => (
          <View key={i} style={[rs.barSeg, { backgroundColor: RISK_COLORS[i] + '33', borderColor: RISK_COLORS[i] + '55' }]}>
            <Text style={[rs.barTxt, { color: RISK_COLORS[i] }]}>{lbl}</Text>
          </View>
        ))}
      </View>

      {/* Seçenek kartları */}
      <View style={rs.cards}>
        {visibleChoices.map((c, i) => {
          const ri    = riskIdxMap[i] % 3;
          const color = RISK_COLORS[ri];
          const sel   = selected === i;
          return (
            <TouchableOpacity key={i} onPress={() => handleSelect(i)} activeOpacity={0.8}>
              <Animated.View style={[
                rs.card,
                { borderColor: sel ? color : '#21262d', backgroundColor: sel ? color + '18' : '#161b22',
                  transform: [{ scale: sel ? pulseAnims[ri] : new Animated.Value(1) }],
                  shadowColor: color, shadowOpacity: sel ? 0.4 : 0, shadowRadius: 8, elevation: sel ? 5 : 1,
                },
              ]}>
                <Text style={rs.glyph}>{RISK_GLYPHS[ri]}</Text>
                <Text style={[rs.riskBadge, { color, backgroundColor: color + '22' }]}>
                  {RISK_LABELS[ri]}
                </Text>
                <Text style={rs.choiceLbl} numberOfLines={2}>{c.label}</Text>
                <Text style={[rs.desc, { color: color + 'cc' }]}>{RISK_DESCS[ri]}</Text>
                {sel && (
                  <View style={[rs.selDot, { backgroundColor: color }]}>
                    <Text style={rs.selDotTxt}>✓</Text>
                  </View>
                )}
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
}

const rs = StyleSheet.create({
  container: { paddingTop: 4 },
  title:     { color: '#e6edf3', fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: 4 },
  sub:       { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 14 },
  barWrap:   { flexDirection: 'row', gap: 4, marginBottom: 16 },
  barSeg:    { flex: 1, borderRadius: 8, borderWidth: 1, paddingVertical: 6, alignItems: 'center' },
  barTxt:    { fontSize: 11, fontWeight: '700' },
  cards:     { gap: 10 },
  card:      { borderRadius: 14, borderWidth: 1.5, padding: 14, position: 'relative' },
  glyph:     { fontSize: 28, marginBottom: 6 },
  riskBadge: { alignSelf: 'flex-start', borderRadius: 8, paddingVertical: 3, paddingHorizontal: 10, fontSize: 12, fontWeight: '700', marginBottom: 6 },
  choiceLbl: { color: '#e6edf3', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  desc:      { fontSize: 12 },
  selDot:    { position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  selDotTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },
});
