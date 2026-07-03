/**
 * ChoiceGameRouter — Seçim + aktiviteye özel mini-oyun
 * 1. Sahne kartlarını gösterir, oyuncu seçim yapar
 * 2. Seçilen aktiviteye göre özel mini-oyun açılır
 * 3. Mini-oyun tamamlanınca bonus stats + seçim uygulanır
 */
import React, { useEffect, useState } from 'react';
import {
  Dimensions, StyleSheet, Text,
  TouchableOpacity, View, ScrollView,
} from 'react-native';

import { SAFE_TOP } from '../../utils/safeArea';
import ResimKursuGame  from './ResimKursuGame';
import OkumaSaatiGame  from './OkumaSaatiGame';
import BadmintonGame   from './BadmintonGame';
import PenaltyKick     from './PenaltyKick';
import CircuitPuzzle  from './CircuitPuzzle';
import MemoryGame     from './MemoryGame';
import MuseumQuiz     from './MuseumQuiz';
import LibraryQuiz    from './LibraryQuiz';
import AkrabaGame     from './AkrabaGame';
import ClassicGames   from './ClassicGames';
import ParkGame       from './ParkGame';
import CinemaGame     from './CinemaGame';
import EtkinlikGame   from './EtkinlikGame';
import TopluOyunGame  from './TopluOyunGame';
import AlisverisGame  from './AlisverisGame';
import ShantiyeGame   from './ShantiyeGame';
import SokakOyunuGame from './SokakOyunuGame';
import OdevOyunu      from './OdevOyunu';
import IzcilikGame    from './IzcilikGame';
import RobotikGame    from './RobotikGame';
import KosuGame       from './KosuGame';
import YuzmeGame      from './YuzmeGame';
import GuresGame      from './GuresGame';
import KumbaraGame    from './KumbaraGame';
import TemizlikGame   from './TemizlikGame';
import MuzikGame      from './MuzikGame';
import KodlamaGame    from './KodlamaGame';

/**
 * AutoChoose — used when an activity has no mini-game.
 * Calls onChoose in a useEffect to avoid "setState during render" error.
 */
function AutoChoose({ choice, onChoose }) {
  useEffect(() => { onChoose(choice); }, []);
  return <View style={{ flex: 1, backgroundColor: '#050a14' }} />;
}

const { width: SW } = Dimensions.get('window');

// Label → emoji
const LABEL_ICON = {
  // 2001 · Dışarı sahneleri
  'Stadyum': '🏟️',          'Tamirci dükkânı': '🔧',  'Bilgisayar fuarı': '💻',
  'Müze': '🏛️',             'Kütüphane': '📚',         'Akraba ziyareti': '👨‍👩‍👧',
  'Park': '🌳',              'Toplu etkinlik': '🎉',    'Sinema': '🎬',
  'Mahalle maçı': '⚽',      'Şantiye gezisi': '🏗️',   'Atölye denemesi': '🪚',
  'Resim kursu': '🎨',       'Okuma saati': '📖',       'Aile pikniği': '🏸',
  'Toplu oyun': '🎮',        'Aile toplantısı': '👨‍👩‍👧',  'Alışveriş': '🛒',
  // 2006 · İlkokul
  'Düzenli ödev': '📝',   'Deney seti': '🔬',  'Erken uyku': '🌙',
  'Tiyatro': '🎭',        'İzcilik': '🏕️',     'Robotik': '🤖',
  'Koşu': '🏃',           'Yüzme': '🏊',        'Güreş': '🤼',
  // 2000-2006 · Çocukluk sahneleri
  'Okul öncesi eğitime ağırlık ver': '📚',
  'Oyun ve sosyalleşmeye odaklan': '🎮',
  'Sağlık ve hareketi artır': '🏃',
  'Yapboz/Zeka oyunları': '🧩',
  'Sokak oyunları': '⚽',
  'Masal saati': '📖',
  'Düzenli rutin': '🗓️',
  'Sosyalleşme': '👫',
  'Aktif oyun': '🏃',
  // 2008 · Aile Ekonomisi
  'Harcamaları kıs ve sabret': '💰',
  'Baban destek oluyor': '👨',
  'Aile içi dayanışma (evde sorumluluk al)': '🏠',
  // 2008 · Alt sahneler
  'Kumbara': '🐷',
  'Aylık bütçe defteri': '📒',
  'Kısa vadeli hedef': '🎯',
  'Eğitim malzemesi': '📚',
  'Sağlık-spor': '🏃',
  'Ailecek etkinlik': '🎉',
  'Alışveriş listesi': '📝',
  'Temizlik planı': '🧹',
  'Kardeşe destek': '👫',
  // 2010 · Hobi
  'Müzik': '🎵',
  'Spor': '⚽',
  'Kodlama': '💻',
  // 2010 · Alt sahneler
  'Ders al': '📖',
  'Grup kur': '🎵',
  'Evde çalış': '🏠',
  'Takıma katıl': '⚽',
  'Bireysel plan': '🗓️',
  'Antrenör bul': '🏋️',
  'Online kurs': '💻',
  'Mini proje': '💡',
  'Hackathon dene': '🏆',
  // 2012-2013
  'Planlı çalış': '📊',
  'Dengeli ilerle': '⚖️',
  'Rahat al': '😌',
  'Rutin kur ve toparlan': '🔄',
  'Keyfine bak': '🎈',
  // 2027 · Spor antrenmanı
  '🧑‍🏫 Profesyonel antrenör tut': '🧑‍🏫',
  '🏃 Kendi programın':            '🏃',
  '🤝 Takımla çalış':              '🤝',
  // 2028 · Milli seçmeler
  '🥇 Seçmelere katıl':            '🥇',
  '🏟️ Önce yerel ligde güçlen':   '🏟️',
  '🏕️ Yoğun antrenman kampı':     '🏕️',
  // 2029 · Uluslararası arena
  '🏅 Olimpiyat hedefi':           '🏅',
  '🌍 Uluslararası turnuva':       '🌍',
  '🇹🇷 Ulusal şampiyonluk':       '🇹🇷',
  '💰 Sponsor ara':                '💰',
  '📚 Taktik/strateji çalış':     '📚',
};

// Seçim etiketi → mini-oyun bileşeni
// ─── Oyun Haritası — her oyun maksimum 2 seçenekle eşleşir ──────────────────
// Kural: Aynı oyunu farklı bağlamlarda tekrar göstermemek için
//        her oyun türü sadece en uygun 1-2 seçeneğe atanmış.
//        Listeye girmeyen seçenekler AutoChoose ile ilerler.
const GAME_MAP = {
  // 🏗️ ShantiyeGame → şantiye gezisi & atölye denemesi
  'Şantiye gezisi':  ShantiyeGame,
  'Atölye denemesi': ShantiyeGame,

  // ⚽ PenaltyKick → sadece stadyum & mahalle maçı
  'Stadyum':      PenaltyKick,
  'Mahalle maçı': PenaltyKick,

  // 🔌 CircuitPuzzle → sadece tamirci & deney seti
  'Tamirci dükkânı': CircuitPuzzle,
  'Deney seti':      CircuitPuzzle,

  // 🕹️ ClassicGames (Pac-Man/Breakout/Snake) → sadece bilgisayar fuarı
  'Bilgisayar fuarı': ClassicGames,

  // 🏛️ MuseumQuiz → sadece müze
  'Müze': MuseumQuiz,

  // 📚 LibraryQuiz → sadece kütüphane & masal saati
  'Kütüphane':   LibraryQuiz,
  'Masal saati': LibraryQuiz,

  // 📖 OkumaSaatiGame → sadece okuma saati
  'Okuma saati': OkumaSaatiGame,

  // 🏸 BadmintonGame → sadece aile pikniği
  'Aile pikniği': BadmintonGame,

  // 👨‍👩‍👧 AkrabaGame → sadece akraba ziyareti & aile toplantısı
  'Akraba ziyareti': AkrabaGame,
  'Aile toplantısı': AkrabaGame,

  // 🌳 ParkGame → sadece park
  'Park':        ParkGame,

  // 🎉 EtkinlikGame → sadece toplu etkinlik & tiyatro
  'Toplu etkinlik': EtkinlikGame,
  'Tiyatro':        EtkinlikGame,

  // 🎬 CinemaGame → sadece sinema
  'Sinema': CinemaGame,

  // 🎮 TopluOyunGame → sadece toplu oyun & ailecek etkinlik
  'Toplu oyun':     TopluOyunGame,
  'Ailecek etkinlik': TopluOyunGame,

  // 🛒 AlisverisGame → sadece alışveriş & alışveriş listesi
  'Alışveriş':      AlisverisGame,
  'Alışveriş listesi': AlisverisGame,

  // 🎨 ResimKursuGame → sadece resim kursu
  'Resim kursu':          ResimKursuGame,

  // 🧩 MemoryGame → sadece yapboz
  'Yapboz/Zeka oyunları': MemoryGame,

  // 🪢 SokakOyunuGame → sokak oyunları
  'Sokak oyunları': SokakOyunuGame,

  // 📚 OdevOyunu → düzenli ödev
  'Düzenli ödev': OdevOyunu,

  // 🧭 IzcilikGame → izcilik
  'İzcilik': IzcilikGame,

  // 🤖 RobotikGame → robotik
  'Robotik': RobotikGame,

  // 🏃 KosuGame → koşu
  'Koşu': KosuGame,

  // 🏊 YuzmeGame → yüzme
  'Yüzme': YuzmeGame,

  // 🤼 GuresGame → güreş
  'Güreş': GuresGame,

  // 🐷 KumbaraGame → kumbara
  'Kumbara': KumbaraGame,

  // 🧹 TemizlikGame → temizlik planı
  'Temizlik planı': TemizlikGame,

  // 🎵 MuzikGame → müzik (y2010 hobi)
  'Müzik': MuzikGame,

  // 💻 KodlamaGame → kodlama (y2010 hobi)
  'Kodlama': KodlamaGame,

  // ─── y2016 Lise Projeleri (mevcut oyunların yeniden kullanımı) ──────────────
  '🔬 Bilim projesi ve olimpiyatlar': RobotikGame,   // bilim = programlama/devre
  '🤝 Öğrenci konseyi & sosyal proje': AkrabaGame,   // sosyal proje = akraba/toplantı
  '🏅 Spor takımı & turnuvalar':       PenaltyKick,  // spor turnuvası = penaltı
  '🎨 Sanat / tiyatro kulübü':         EtkinlikGame, // sanat = etkinlik oyunu

  // y2016 Spor Turnuvası alt seçenekleri
  '🏋️ Profesyonel antrenman': KosuGame,   // antrenman = koşu

  // ─── y2016–2017 Sanat / Tiyatro yolu ────────────────────────────────────────
  '🎭 Karma atölye & deneysel':        EtkinlikGame,
  '🎵 Küçük salon (güvenli)':          MuzikGame,
  '🎪 Yerel festival':                  EtkinlikGame,
  '🎭 Büyük sahne (yüksek risk)':      EtkinlikGame,
  '🎼 Klasik eğitim (disiplinli)':     OdevOyunu,    // disiplinli çalışma = ödev oyunu

  // ─── y2015 Çıraklık başlangıcı ──────────────────────────────────────────────
  '⚡ Elektrik tesisatı':    CircuitPuzzle,  // elektrik = devre bulmacası
  '🪑 Mobilya & marangozluk': ShantiyeGame, // marangozluk = istif oyunu
  '🚗 Oto tamir & servis':   CircuitPuzzle, // mekanik = devre/tamir bulmacası

  // ─── y2021 İlk Profesyonel Adım ─────────────────────────────────────────────
  '💻 Freelance proje üstlen': KodlamaGame, // freelance = kod proje sıralama

  // ─── y2026 Gelişim & Uzmanlaşma ─────────────────────────────────────────────
  '🏆 Spor — ulusal hedef': GuresGame,    // ulusal spor = güreş/rekabet

  // ─── y2027 Spor Antrenmanı ────────────────────────────────────────────────
  '🧑‍🏫 Profesyonel antrenör tut': KosuGame,   // antrenör eşliğinde koşu programı
  '🏃 Kendi programın':            KosuGame,   // bireysel koşu/kondisyon
  '🤝 Takımla çalış':              GuresGame,  // takım içi rekabet = güreş

  // ─── y2028 Milli Seçmeler ────────────────────────────────────────────────
  '🥇 Seçmelere katıl':            GuresGame,  // seçme yarışması = rekabet
  '🏕️ Yoğun antrenman kampı':     KosuGame,   // kamp = koşu/kondisyon
  '🏟️ Önce yerel ligde güçlen':   PenaltyKick, // yerel lig = saha maçı

  // ─── y2029 Uluslararası Arena ────────────────────────────────────────────
  '🏅 Olimpiyat hedefi':           GuresGame,  // olimpiyat = en büyük rekabet
  '🌍 Uluslararası turnuva':       GuresGame,  // turnuva = güreş/rekabet
  '🇹🇷 Ulusal şampiyonluk':       PenaltyKick, // ulusal şampiyon = saha maçı

  // Diğer tüm seçenekler null → AutoChoose (hikaye ilerler, oyun çıkmaz)
};

// Oyun ikonları & renkleri
const CARD_PALETTES = [
  { color: '#818cf8', bg: '#1e1b4b', text: '#c7d2fe' },
  { color: '#fb923c', bg: '#431407', text: '#fed7aa' },
  { color: '#4ade80', bg: '#052e16', text: '#bbf7d0' },
];

// Seçim metni ayrıştır
function parseTitle(html) {
  const m = html?.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i);
  return m ? m[1].replace(/<[^>]+>/g, '').trim() : null;
}
function parseBody(html) {
  const ms = [...(html?.matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [])];
  return ms.map(m => m[1].replace(/<[^>]+>/g, '').trim()).filter(Boolean);
}

export default function ChoiceGameRouter({ scene, gameState, onChoose, Conditions, sceneText, testChoice }) {
  const [selected, setSelected] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  const choices = scene.choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));
  const title   = parseTitle(sceneText);

  // Test modunda otomatik seçim
  useEffect(() => {
    if (!testChoice || selected) return;
    const auto = choices.find(c => c.label === testChoice);
    if (auto) {
      const t = setTimeout(() => {
        setSelected(auto);
        setTimeout(() => setConfirmed(true), 80);
      }, 120);
      return () => clearTimeout(t);
    }
  }, [testChoice]);
  const body    = parseBody(sceneText);

  const handlePick = (choice) => { setSelected(choice); };

  // Kart seçildikten sonra oyunu göster
  if (selected && confirmed) {
    const GameComponent = GAME_MAP[selected.label];

    if (!GameComponent) {
      // Bu aktivite için özel oyun yok — AutoChoose ile defer et
      return <AutoChoose choice={selected} onChoose={onChoose} />;
    }

    return (
      <GameComponent
        choice={selected}
        onComplete={(bonus) => {
          const enriched = {
            ...selected,
            effects: [
              ...(selected.effects || []),
              ...(bonus && Object.values(bonus).some(v => v > 0)
                ? [{ statDelta: bonus }] : []),
            ],
          };
          onChoose(enriched);
        }}
      />
    );
  }

  // ── Kart seçim ekranı ───────────────────────────────────────────────────
  return (
    <ScrollView contentContainerStyle={s.container}>
      {title && <Text style={s.sceneTitle}>{title}</Text>}
      {body.map((p, i) => <Text key={i} style={s.sceneBody}>{p}</Text>)}

      <Text style={s.pickLabel}>Nereye gidelim?</Text>
      <Text style={s.pickHint}>Seçeneğe dokun → Oyna veya Atla</Text>

      <View style={s.cards}>
        {choices.map((c, i) => {
          const pal     = CARD_PALETTES[i % 3];
          const icon    = LABEL_ICON[c.label] || '⭐';
          const isSel   = selected?.label === c.label;
          const GameCmp = GAME_MAP[c.label];
          const hasGame = !!GameCmp;

          return (
            <TouchableOpacity
              key={i}
              style={[s.card, { backgroundColor: pal.bg, borderColor: isSel ? pal.color : pal.color + '44' }]}
              onPress={() => handlePick(c)}
              activeOpacity={0.8}
            >
              <Text style={s.cardIcon}>{icon}</Text>
              <Text style={[s.cardLabel, { color: pal.text }]}>{c.label}</Text>
              {hasGame && (
                <View style={[s.gameBadge, { backgroundColor: pal.color + '33', borderColor: pal.color + '66' }]}>
                  <Text style={[s.gameBadgeText, { color: pal.color }]}>🎮 Mini oyun</Text>
                </View>
              )}
              {isSel && (
                <View style={{ gap: 6, width: '100%', marginTop: 4 }}>
                  <TouchableOpacity
                    style={[s.selBadge, { backgroundColor: pal.color }]}
                    onPress={() => setConfirmed(true)}
                  >
                    <Text style={s.selBadgeTxt}>🎮 Oyna</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[s.selBadge, { backgroundColor: '#21262d', borderWidth: 1, borderColor: pal.color + '55' }]}
                    onPress={() => onChoose(c)}
                  >
                    <Text style={[s.selBadgeTxt, { color: '#8b949e' }]}>⏭  Oyunu Atla</Text>
                  </TouchableOpacity>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container:  { flexGrow: 1, backgroundColor: '#050a14', alignItems: 'center', paddingTop: SAFE_TOP + 16, paddingHorizontal: 16, paddingBottom: 32 },
  sceneTitle: { color: '#ffffff', fontSize: 17, fontWeight: '800', marginBottom: 6, textAlign: 'center' },
  sceneBody:  { color: '#c9d4df', fontSize: 13, lineHeight: 19, textAlign: 'center', marginBottom: 5 },
  pickLabel:  { color: '#e6edf3', fontSize: 18, fontWeight: '800', marginTop: 18, marginBottom: 4, textAlign: 'center' },
  pickHint:   { color: '#6b7280', fontSize: 12, marginBottom: 20 },
  cards:      { width: '100%', gap: 12 },
  card:       { borderRadius: 16, borderWidth: 2, padding: 18, alignItems: 'center', gap: 8 },
  cardIcon:   { fontSize: 42 },
  cardLabel:  { fontSize: 16, fontWeight: '800', textAlign: 'center' },
  gameBadge:  { borderRadius: 20, borderWidth: 1, paddingVertical: 4, paddingHorizontal: 10 },
  gameBadgeText: { fontSize: 12, fontWeight: '700' },
  selBadge:   { borderRadius: 10, paddingVertical: 5, paddingHorizontal: 14, marginTop: 4 },
  selBadgeTxt:{ color: '#fff', fontSize: 13, fontWeight: '800' },
});
