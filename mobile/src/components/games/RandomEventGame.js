/**
 * RandomEventGame — İnteraktif Rastgele Olaylar
 * rand_lottery : Piyango bileti seç (12 bilet, biri büyük ikramiye)
 * rand_meet    : Yabancıyla ilk karşılaşma (3 seçenek)
 * rand_inheritance: Zarf seç — miras mı, borç mu?
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useRef, useState, useEffect } from 'react';
import {
  Animated, Dimensions, StyleSheet, Text,
  TouchableOpacity, View, Platform,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

// ─── PIYANGO ─────────────────────────────────────────────────────────────────

const TICKET_PRIZES = [
  { label: '🏆 Büyük İkramiye!', money: 5000,  prob: 0.05, color: '#f59e0b' },
  { label: '🎉 Orta İkramiye',   money: 1500,  prob: 0.10, color: '#3b82f6' },
  { label: '🎟️ Küçük Ödül',     money: 500,   prob: 0.20, color: '#22c55e' },
  { label: '😔 Kaybettiniz',     money: 0,     prob: 0.65, color: '#6b7280' },
];

function generateTickets(luckStat) {
  // Şans statı yüksekse büyük ikramiye şansı biraz artar
  const bonus = (luckStat || 50) / 1000; // max +0.1
  const tickets = [];
  for (let i = 0; i < 12; i++) {
    const r = Math.random();
    let cum = 0;
    let prize = TICKET_PRIZES[3]; // default: kaybettiniz
    for (const p of TICKET_PRIZES) {
      cum += (p === TICKET_PRIZES[0] ? p.prob + bonus : p.prob);
      if (r < cum) { prize = p; break; }
    }
    tickets.push({ ...prize, id: i, scratched: false });
  }
  return tickets;
}

function TicketCard({ ticket, onScratch }) {
  const flip   = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  const scratch = () => {
    if (done) return;
    setDone(true);
    Animated.spring(flip, { toValue: 1, friction: 5, tension: 200, useNativeDriver: true }).start();
    onScratch(ticket);
  };

  const frontOpacity = flip.interpolate({ inputRange: [0, 0.5], outputRange: [1, 0] });
  const backOpacity  = flip.interpolate({ inputRange: [0.5, 1], outputRange: [0, 1] });

  return (
    <TouchableOpacity onPress={scratch} activeOpacity={0.8} style={rs.ticketWrap}>
      {/* Arka (kazanılan) */}
      <Animated.View style={[rs.ticket, { backgroundColor: ticket.color + '22', borderColor: ticket.color, opacity: backOpacity, position: 'absolute' }]}>
        <Text style={rs.ticketResultIco}>{ticket.label.split(' ')[0]}</Text>
        {ticket.money > 0 && <Text style={[rs.ticketMoney, { color: ticket.color }]}>+{ticket.money}₺</Text>}
        <Text style={[rs.ticketResult, { color: ticket.color }]}>{ticket.label.replace(/^[^\s]+ /, '')}</Text>
      </Animated.View>
      {/* Ön (kazınacak) */}
      <Animated.View style={[rs.ticket, { backgroundColor: '#1c2a3a', borderColor: '#2d4060', opacity: frontOpacity }]}>
        <Text style={{ fontSize: 28 }}>🎟️</Text>
        <Text style={rs.ticketScratch}>Kazı!</Text>
      </Animated.View>
    </TouchableOpacity>
  );
}

function LotteryScreen({ luck, onResult }) {
  const [tickets]   = useState(() => generateTickets(luck));
  const [scratched, setScratched] = useState([]);
  const [totalWin,  setTotalWin]  = useState(0);
  const [phase,     setPhase]     = useState('pick'); // pick | reveal

  const handleScratch = (ticket) => {
    const next = [...scratched, ticket.id];
    setScratched(next);
    setTotalWin(w => w + ticket.money);
    if (next.length >= 3) setPhase('reveal'); // 3 bilet hakkı
  };

  if (phase === 'reveal') {
    return (
      <View style={rs.center}>
        <Text style={{ fontSize: 60, marginBottom: 8 }}>
          {totalWin >= 2000 ? '🏆' : totalWin >= 500 ? '🎉' : '😔'}
        </Text>
        <Text style={rs.title}>Piyango Sonucu</Text>
        <View style={rs.resultBox}>
          <Text style={rs.resultMoney}>{totalWin > 0 ? `+${totalWin}₺` : 'Kazanma yok'}</Text>
          <Text style={rs.resultSub}>{totalWin >= 2000 ? 'İnanılmaz şans! Büyük ikramiye!' : totalWin >= 500 ? 'Lumsum kâr!' : 'Bu sefer olmadı...'}</Text>
        </View>
        <TouchableOpacity style={rs.btn} onPress={() => onResult({ money: totalWin })}>
          <Text style={rs.btnTxt}>✓ Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={rs.screen}>
      <View style={rs.hud}>
        <Text style={rs.hudTitle}>🎟️ Piyango Çekilişi</Text>
        <Text style={rs.hudSub}>Şans biletlerinden {3 - scratched.length} tanesini seç ve kaz!</Text>
      </View>
      <View style={rs.ticketGrid}>
        {tickets.map(t => (
          <TicketCard
            key={t.id}
            ticket={t}
            onScratch={handleScratch}
          />
        ))}
      </View>
      <View style={rs.hudBottom}>
        <Text style={rs.scratchCount}>Kazınan: {scratched.length}/3  •  Kazanılan: {totalWin}₺</Text>
      </View>
    </View>
  );
}

// ─── TANIŞ ──────────────────────────────────────────────────────────────────

const MEET_PEOPLE = [
  { emoji: '🧑‍💼', name: 'Girişimci',  desc: 'Bana iş teklifi var diyor. İlgi çekici...', bonus: { social: 3, confidence: 2 }, label: 'Sohbet et' },
  { emoji: '🎨',   name: 'Sanatçı',    desc: 'Sergisine davet ediyor. Güzel sohbet.', bonus: { happiness: 3, creativity: 2 }, label: 'Daveyi kabul et' },
  { emoji: '🏋️',  name: 'Sporcu',     desc: 'Takıma katılmamı öneriyor.', bonus: { health: 2, social: 2 }, label: 'Birlikte antrenman' },
  { emoji: '👩‍🔬', name: 'Araştırmacı', desc: 'Projesi hakkında anlatıyor. Dikkat çekici.', bonus: { intelligence: 3, focus: 1 }, label: 'Dinle ve sor' },
  { emoji: '🧑‍🍳', name: 'Şef',       desc: 'Yemek tarifini paylaşıyor.', bonus: { happiness: 2, social: 1 }, label: 'Tarifi al' },
];

function MeetScreen({ onResult }) {
  const [person] = useState(() => MEET_PEOPLE[Math.floor(Math.random() * MEET_PEOPLE.length)]);
  const [phase, setPhase] = useState('intro'); // intro|choice|result
  const slideIn = useRef(new Animated.Value(SW)).current;

  useEffect(() => {
    Animated.spring(slideIn, { toValue: 0, friction: 7, tension: 180, useNativeDriver: true }).start();
  }, []);

  if (phase === 'result') {
    return (
      <View style={rs.center}>
        <Text style={{ fontSize: 56, marginBottom: 8 }}>{person.emoji}</Text>
        <Text style={rs.title}>Güzel Bir Tanışma!</Text>
        <View style={rs.resultBox}>
          {Object.entries(person.bonus).map(([k, v]) => (
            <Text key={k} style={rs.bonusLine}>+{v} {k === 'social' ? 'Sosyal' : k === 'confidence' ? 'Özgüven' : k === 'happiness' ? 'Mutluluk' : k === 'creativity' ? 'Yaratıcılık' : k === 'health' ? 'Sağlık' : k === 'intelligence' ? 'Zeka' : k === 'focus' ? 'Odak' : k}</Text>
          ))}
        </View>
        <TouchableOpacity style={rs.btn} onPress={() => onResult(person.bonus)}>
          <Text style={rs.btnTxt}>✓ Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={rs.screen}>
      <View style={rs.hud}>
        <Text style={rs.hudTitle}>🤝 Rastgele Karşılaşma!</Text>
        <Text style={rs.hudSub}>Beklenmedik biriyle karşılaştın.</Text>
      </View>
      <Animated.View style={[rs.personCard, { transform: [{ translateX: slideIn }] }]}>
        <Text style={rs.personEmoji}>{person.emoji}</Text>
        <Text style={rs.personName}>{person.name}</Text>
        <Text style={rs.personDesc}>"{person.desc}"</Text>
        <View style={rs.bonusPreview}>
          {Object.entries(person.bonus).map(([k, v]) => (
            <View key={k} style={rs.bonusPill}>
              <Text style={rs.bonusPillTxt}>+{v} {k === 'social' ? 'Sosyal' : k === 'confidence' ? 'Özgüven' : k === 'happiness' ? 'Mutluluk' : k === 'creativity' ? 'Yaratıcılık' : k === 'health' ? 'Sağlık' : k === 'intelligence' ? 'Zeka' : k === 'focus' ? 'Odak' : k}</Text>
            </View>
          ))}
        </View>
      </Animated.View>
      <View style={rs.choices}>
        <TouchableOpacity style={[rs.choiceBtn, { borderColor: '#3b82f6' }]} onPress={() => setPhase('result')}>
          <Text style={rs.choiceTxt}>💬 {person.label}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[rs.choiceBtn, { borderColor: '#6b7280' }]} onPress={() => onResult({ happiness: -1 })}>
          <Text style={[rs.choiceTxt, { color: '#6b7280' }]}>🚶 Yoğunum, devam et</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── MİRAS ──────────────────────────────────────────────────────────────────

const ENVELOPES = [
  { emoji: '📨', result: 'miras',  money: 2000, label: 'Nakit Miras',  desc: '2.000₺ banka transferi' },
  { emoji: '📩', result: 'miras',  money: 800,  label: 'Küçük Miras',  desc: 'Bazı eşyalar ve 800₺' },
  { emoji: '📪', result: 'borç',   money: -500, label: 'Borç Çıktı!',  desc: 'Akraba borcu — 500₺ sorumlusun' },
];

function InheritanceScreen({ onResult }) {
  const [selected,  setSelected]  = useState(null);
  const [revealed,  setRevealed]  = useState(false);
  const [envelopes] = useState(() => {
    const e = [...ENVELOPES];
    // Karıştır
    for (let i = e.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [e[i], e[j]] = [e[j], e[i]];
    }
    return e;
  });

  const scales = ENVELOPES.map(() => useRef(new Animated.Value(1)).current);

  const pick = (idx) => {
    if (revealed) return;
    setSelected(idx);
    Animated.spring(scales[idx], { toValue: 1.15, friction: 5, useNativeDriver: true }).start();
    setTimeout(() => {
      setRevealed(true);
    }, 600);
  };

  const envelope = selected !== null ? envelopes[selected] : null;

  if (revealed && envelope) {
    return (
      <View style={rs.center}>
        <Text style={{ fontSize: 56, marginBottom: 8 }}>{envelope.emoji}</Text>
        <Text style={rs.title}>{envelope.label}</Text>
        <View style={[rs.resultBox, { borderColor: envelope.money > 0 ? '#22c55e' : '#ef4444' }]}>
          <Text style={[rs.resultMoney, { color: envelope.money > 0 ? '#22c55e' : '#ef4444' }]}>
            {envelope.money > 0 ? `+${envelope.money}₺` : `${envelope.money}₺`}
          </Text>
          <Text style={rs.resultSub}>{envelope.desc}</Text>
        </View>
        <TouchableOpacity style={rs.btn} onPress={() => onResult({ money: envelope.money })}>
          <Text style={rs.btnTxt}>✓ Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={rs.screen}>
      <View style={rs.hud}>
        <Text style={rs.hudTitle}>📬 Uzak Akraba Mirası</Text>
        <Text style={rs.hudSub}>Sana üç zarf bırakmış. Birini seç!</Text>
        <Text style={[rs.hudSub, { color: '#f85149', marginTop: 2 }]}>⚠️ İçlerinden biri borç zarfı...</Text>
      </View>
      <View style={rs.envelopeRow}>
        {envelopes.map((e, i) => (
          <TouchableOpacity key={i} onPress={() => pick(i)} activeOpacity={0.75}>
            <Animated.View style={[rs.envelope, { transform: [{ scale: scales[i] }], borderColor: selected === i ? '#f59e0b' : '#2d4060' }]}>
              <Text style={{ fontSize: 52 }}>{selected === i && revealed ? e.emoji : '📬'}</Text>
              <Text style={rs.envLabel}>Zarf {i + 1}</Text>
              {selected === i && !revealed && <Text style={rs.envSelect}>Seçildi ✓</Text>}
            </Animated.View>
          </TouchableOpacity>
        ))}
      </View>
      {selected === null && (
        <Text style={rs.envHint}>Bir zarfa dokunarak seç</Text>
      )}
    </View>
  );
}

// ─── ANA BILEŞEN ─────────────────────────────────────────────────────────────

export default function RandomEventGame({ eventId, gameState, onComplete }) {
  const luck = gameState?.data?.stats?.luck || 50;

  const handleResult = useCallback((bonusDelta) => {
    onComplete(bonusDelta);
  }, [onComplete]);

  if (eventId === 'rand_lottery') {
    return <LotteryScreen luck={luck} onResult={handleResult} />;
  }
  if (eventId === 'rand_meet') {
    return <MeetScreen onResult={handleResult} />;
  }
  if (eventId === 'rand_inheritance') {
    return <InheritanceScreen onResult={handleResult} />;
  }
  return null;
}

// ─── STİLLER ─────────────────────────────────────────────────────────────────
const rs = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: '#070d18' },
  center:       { flex: 1, backgroundColor: '#070d18', alignItems: 'center', justifyContent: 'center', padding: 28 },
  hud:          { paddingTop: SAFE_TOP, paddingHorizontal: 18, paddingBottom: 12, backgroundColor: '#0d1525', borderBottomWidth: 1, borderColor: '#1c2e44' },
  hudTitle:     { color: '#e6edf3', fontSize: 18, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  hudSub:       { color: '#8b949e', fontSize: 12, textAlign: 'center' },
  hudBottom:    { padding: 12, backgroundColor: '#0d1525', borderTopWidth: 1, borderColor: '#1c2e44', alignItems: 'center' },
  scratchCount: { color: '#c9d4df', fontSize: 13, fontWeight: '700' },
  ticketGrid:   { flex: 1, flexDirection: 'row', flexWrap: 'wrap', padding: 12, gap: 8, justifyContent: 'center', alignContent: 'center' },
  ticketWrap:   { width: (SW - 64) / 3, height: 95 },
  ticket:       { width: '100%', height: '100%', borderRadius: 12, borderWidth: 2, alignItems: 'center', justifyContent: 'center', padding: 4, gap: 2 },
  ticketScratch:{ color: '#58a6ff', fontSize: 11, fontWeight: '800' },
  ticketResultIco:{ fontSize: 22 },
  ticketMoney:  { fontSize: 12, fontWeight: '900' },
  ticketResult: { fontSize: 9, fontWeight: '700', textAlign: 'center' },
  personCard:   { margin: 20, backgroundColor: '#0d1525', borderRadius: 20, padding: 24, alignItems: 'center', borderWidth: 1.5, borderColor: '#1c2e44' },
  personEmoji:  { fontSize: 64, marginBottom: 8 },
  personName:   { color: '#e6edf3', fontSize: 20, fontWeight: '900', marginBottom: 6 },
  personDesc:   { color: '#8b949e', fontSize: 13, textAlign: 'center', lineHeight: 19, marginBottom: 12 },
  bonusPreview: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, justifyContent: 'center' },
  bonusPill:    { backgroundColor: '#1c2e44', borderRadius: 10, paddingVertical: 4, paddingHorizontal: 10 },
  bonusPillTxt: { color: '#4ade80', fontSize: 12, fontWeight: '700' },
  choices:      { padding: 20, gap: 10 },
  choiceBtn:    { backgroundColor: '#0d1525', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, borderWidth: 1.5, alignItems: 'center' },
  choiceTxt:    { color: '#e6edf3', fontSize: 14, fontWeight: '700' },
  envelopeRow:  { flexDirection: 'row', justifyContent: 'center', gap: 16, padding: 24, flex: 1, alignItems: 'center' },
  envelope:     { width: (SW - 80) / 3, aspectRatio: 0.75, backgroundColor: '#0d1525', borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center', gap: 6 },
  envLabel:     { color: '#8b949e', fontSize: 11, fontWeight: '700' },
  envSelect:    { color: '#f59e0b', fontSize: 10, fontWeight: '800' },
  envHint:      { color: '#6b7280', fontSize: 12, textAlign: 'center', paddingBottom: 20 },
  title:        { color: '#e6edf3', fontSize: 24, fontWeight: '900', textAlign: 'center', marginBottom: 10 },
  resultBox:    { backgroundColor: '#0d1525', borderRadius: 14, padding: 18, marginBottom: 20, width: '100%', alignItems: 'center', borderWidth: 1.5, borderColor: '#22c55e' },
  resultMoney:  { fontSize: 28, fontWeight: '900', marginBottom: 4 },
  resultSub:    { color: '#8b949e', fontSize: 13, textAlign: 'center' },
  bonusLine:    { color: '#4ade80', fontSize: 14, fontWeight: '700', marginBottom: 3 },
  btn:          { backgroundColor: '#1f6feb', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:       { color: '#fff', fontSize: 16, fontWeight: '800' },
});
