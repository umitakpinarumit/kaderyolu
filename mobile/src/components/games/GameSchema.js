/**
 * GameSchema — Gelişmiş hayat ağacı haritası
 * Her düğümün etrafında seçenek balonları, hazırlanma durumu (✓/✗)
 * Lise sonrası 5 tamamen bağımsız iz
 */
import React, { useState } from 'react';
import {
  Dimensions, Modal, ScrollView, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const SW = Dimensions.get('window').width;

// ─── Tuval ────────────────────────────────────────────────────────────────────
const CW  = 1160;  // canvas genişliği (spor izi için genişletildi)
const CH  = 5000;  // canvas yüksekliği

// ─── Düğüm yarıçapları ────────────────────────────────────────────────────────
const BR = 32;   // büyük (başlangıç, kavşak)
const MR = 24;   // orta (sahne)
const SR = 17;   // küçük (yan dal)

// ─── Balon parametreleri ──────────────────────────────────────────────────────
const BLR  = 10;   // balon yarıçapı
const BLS  = 50;   // balonlar arası boşluk
const BLY  = 32;   // düğüm alt kenarından balon merkezine mesafe

// ─── Oyun durumu: g=2 ✓(yeşil), g=1 ~(sarı/partial), g=0 ✗(kırmızı) ─────────
// PATH/ENERGY/RISK/CharacterSelect → g=2, AutoChoose null → g=1, SwipeCards → g=0

// ─── Merkez x ─────────────────────────────────────────────────────────────────
const CX = 530;  // gövde merkezi

// ─── TÜM DÜĞÜMLER ─────────────────────────────────────────────────────────────
// [id, x, y, r, icon, label, year, color, type, desc, [[short,g],...]]
const NODES_RAW = [

  // ══ DOĞUM ══
  ['birth', CX,  65, BR, '🌱', 'DOĞUM', '2000', '#3fb950', 'start',
    'İstanbul\'da başlıyor. Doğuştan gelen özellikler rastgele belirlenir.', []],

  // ══ INTRO — BabyRaceGame ══
  ['intro', CX, 185, BR, '👶', 'Bebek\nYolculuğu', '2000-01', '#58a6ff', 'game',
    'BabyRaceGame oynanır. Anne/Baba/Dengeli seçimi karakteri şekillendirir.',
    [['Anne 👩', 2], ['Dengeli', 2], ['Baba 👨', 2]]],

  // ══ 2001 ANNE KOLU ══
  ['y2001_m',  140, 360, MR, '🏛️', '2001\nAnne Gezi 1', '2001', '#b392f0', 'choice',
    'ChoiceGameRouter — Müze/Kütüphane/Akraba. Her seçimde farklı mini-oyun.',
    [['Müze', 2], ['Kütüphane', 2], ['Akraba', 2]]],
  ['y2001_m2', 140, 490, MR, '🎨', '2001\nAnne Gezi 2', '2001', '#b392f0', 'choice',
    'ChoiceGameRouter — Resim kursu/Okuma saati/Aile pikniği.',
    [['Resim kursu', 2], ['Okuma saati', 2], ['Aile pikniği', 2]]],

  // ══ 2001 DENGELİ KOLU ══
  ['y2001_b',  CX,  360, MR, '🌳', '2001\nAile Gezi 1', '2001', '#3fb950', 'choice',
    'ChoiceGameRouter — Park/Toplu Etkinlik/Sinema.',
    [['Park', 2], ['Toplu etkinlik', 2], ['Sinema', 2]]],
  ['y2001_b2', CX,  490, MR, '🎮', '2001\nAile Gezi 2', '2001', '#3fb950', 'choice',
    'ChoiceGameRouter — Toplu oyun/Aile toplantısı/Alışveriş.',
    [['Toplu oyun', 2], ['Aile toplantısı', 2], ['Alışveriş', 2]]],

  // ══ 2001 BABA KOLU ══
  ['y2001_f',  920, 360, MR, '⚽', '2001\nBaba Gezi 1', '2001', '#58a6ff', 'choice',
    'ChoiceGameRouter — Stadyum/Tamirci/Bilgisayar fuarı.',
    [['Stadyum', 2], ['Tamirci', 2], ['Bilgisayar', 2]]],
  ['y2001_f2', 920, 490, MR, '🔧', '2001\nBaba Gezi 2', '2001', '#58a6ff', 'choice',
    'ChoiceGameRouter — Mahalle maçı/Şantiye/Atölye.',
    [['Mahalle maçı', 2], ['Şantiye', 2], ['Atölye', 2]]],

  // ══ MERGE 1 ══
  ['y20002006', CX, 620, BR, '🏠', 'Aile Gözetimi\n2000–2006', '2000-06', '#f0883e', 'merge',
    'Üç dal birleşir. ChoiceGameRouter — Eğitim/Oyun/Sağlık seçimi.',
    [['Okul öncesi eğt.', 2], ['Oyun & Sosyal', 2], ['Sağlık & Hareket', 2]]],

  // ══ ÇOCUKLUK GÖVDE ══
  ['y2004', CX, 735, MR, '🧩', 'Erken\nEtkinlikler', '2004', '#8b949e', 'choice',
    'ChoiceGameRouter — Yapboz/Sokak/Masal. Tüm seçimlere oyun hazır.',
    [['Yapboz/Zeka', 2], ['Sokak oyunu', 2], ['Masal saati', 2]]],
  ['y2005', CX, 840, MR, '⭐', 'İlk\nTercihler', '2005', '#8b949e', 'choice',
    'AutoChoose — Yaşam tercihleri, mini-oyun yok.',
    [['Düzenli rutin', 1], ['Sosyalleşme', 1], ['Aktif oyun', 1]]],
  ['y2006', CX, 945, MR, '📚', 'İlkokul\nBaşlangıcı', '2006', '#8b949e', 'choice',
    'AutoChoose — Alt sahneye yönlendirme (asıl oyunlar alt düğümlerde).',
    [['Düzenli çalış', 1], ['Kulüplere katıl', 1], ['Spor yap', 1]]],

  // ══ 2006 ALT SAHNELER ══
  ['y2006s',  260, 1055, MR, '📝', 'Okul Sonrası\nÇalışma', '2006', '#58a6ff', 'choice',
    'OdevOyunu(ödev) · CircuitPuzzle(deney) · AutoChoose(uyku).',
    [['Düzenli ödev', 2], ['Deney seti', 2], ['Erken uyku', 1]]],
  ['y2006c',  CX,  1055, MR, '🎭', 'Okul Sonrası\nKulüp', '2006', '#58a6ff', 'choice',
    'EtkinlikGame(tiyatro) · IzcilikGame · RobotikGame.',
    [['Tiyatro', 2], ['İzcilik', 2], ['Robotik', 2]]],
  ['y2006sp', 800, 1055, MR, '⚽', 'Okul Sonrası\nSpor', '2006', '#58a6ff', 'choice',
    'KosuGame · YuzmeGame · GuresGame. Tüm seçimlere oyun hazır.',
    [['Koşu', 2], ['Yüzme', 2], ['Güreş', 2]]],

  // ══ MERGE 2 ══
  ['y2008', CX, 1165, BR, '💰', 'Aile Finansı\n2008', '2008', '#f0883e', 'merge',
    'AutoChoose — Harcama / Baba destek / Aile dayanışması (yaşam tercihi).',
    [['Harcama kıs', 1], ['Baba destek', 1], ['Aile dayanışma', 1]]],
  ['y2008s',  260, 1265, SR, '🏦', 'Tasarruf\nPlanı', '2008', '#8b949e', 'choice',
    'KumbaraGame(kumbara) · AutoChoose(bütçe/hedef).',
    [['Kumbara', 2], ['Bütçe defteri', 1], ['Kısa hedef', 1]]],
  ['y2008su', CX,  1265, SR, '🤝', 'Destek\nKullanımı', '2008', '#8b949e', 'choice',
    'AutoChoose(eğitim/sağlık) · TopluOyunGame(aile etkinlik).',
    [['Eğitim malz.', 1], ['Sağlık-spor', 1], ['Aile etkinlik', 2]]],
  ['y2008r',  800, 1265, SR, '📊', 'Sorumluluk\nYolu', '2008', '#8b949e', 'choice',
    'AlisverisGame · TemizlikGame · AutoChoose(kardeş).',
    [['Alışveriş', 2], ['Temizlik', 2], ['Kardeş destek', 1]]],

  // ══ 2010 HOBİ ══
  ['y2010', CX, 1385, MR, '🎵', 'Hobi\nSeçimi', '2010', '#8b949e', 'choice',
    'MuzikGame(müzik) · AutoChoose(spor) · KodlamaGame(kodlama).',
    [['Müzik', 2], ['Spor', 1], ['Kodlama', 2]]],
  ['y2010m', 260, 1485, SR, '🎸', 'Müzik\nYolu', '2010', '#58a6ff', 'choice',
    'AutoChoose — Ders al / Grup kur / Evde çalış (strateji).',
    [['Ders al', 1], ['Grup kur', 1], ['Evde çalış', 1]]],
  ['y2010s', CX,  1485, SR, '⚽', 'Spor\nYolu', '2010', '#3fb950', 'choice',
    'AutoChoose — Takıma katıl / Bireysel plan / Antrenör bul.',
    [['Takıma katıl', 1], ['Bireysel plan', 1], ['Antrenör bul', 1]]],
  ['y2010c', 800, 1485, SR, '💻', 'Kodlama\nYolu', '2010', '#b392f0', 'choice',
    'AutoChoose — Online kurs / Mini proje / Hackathon.',
    [['Online kurs', 1], ['Mini proje', 1], ['Hackathon', 1]]],

  // ══ 2012-2013 ══
  ['y2012', CX, 1600, MR, '📝', 'Ortaokul\nSınavı', '2012', '#f0883e', 'merge',
    'AutoChoose — Çalışma stratejisi (yaşam tercihi, mini-oyun yok).',
    [['Planlı çalış', 1], ['Dengeli ilerle', 1], ['Rahat al', 1]]],
  ['y2013', CX, 1700, SR, '💭', 'Dinlen &\nDeğerlendir', '2013', '#8b949e', 'choice',
    'AutoChoose — Rutin kur / Keyfine bak (strateji tercihi).',
    [['Rutin kur', 1], ['Keyfine bak', 1]]],

  // ══ BÜYÜK DALLANMA ══
  ['y2015', CX, 1820, BR, '🏫', 'LİSE\nSEÇİMİ', '2015', '#e3b341', 'major',
    'PathCards — 5 farklı lise yolu. Bu noktadan sonra izler bağımsız devam eder.',
    [['Fen/Anadolu', 2], ['Meslek', 2], ['Sanat', 2], ['Askeri', 2], ['Çıraklık', 2]]],

  // ════════════════════════════════════════════════════════════════════
  // İZ 1 — Fen/Anadolu → Akademik (x=100)
  // ════════════════════════════════════════════════════════════════════
  ['t1_type', 100, 1975, MR, '🔬', 'Fen/Anadolu\nLisesi', '2015', '#3fb950', 'branch',
    'AutoChoose — Lise tipi seçimi (yol tercihi, mini-oyun yok).',
    [['Fen Lisesi', 1], ['Anadolu Lisesi', 1]]],
  ['t1_adapt', 100, 2105, SR, '📖', 'Lise\nAdaptasyon', '2015', '#3fb950', 'choice',
    'AutoChoose — İlk dönem yönelim seçimi.',
    [['Hızlı uyum', 1], ['Yavaş uyum', 1], ['Danışman ara', 1]]],
  ['t1_proj', 100, 2215, MR, '🔬', 'Lise\nProjeleri', '2016', '#3fb950', 'choice',
    'RobotikGame(bilim) · AkrabaGame(konsey) · PenaltyKick(spor) · EtkinlikGame(sanat).',
    [['Bilim proj.', 2], ['Konsey', 2], ['Spor', 2], ['Sanat', 2]]],
  ['t1_pjsub', 100, 2345, SR, '📋', 'Proje\nDetayı', '2016', '#3fb950', 'choice',
    'AutoChoose — Proje yürütme stratejisi.',
    [['Solo çalış', 1], ['Ekip kur', 1], ['Danışman', 1]]],
  ['t1_ue', 100, 2455, MR, '📝', 'YKS\nHazırlık', '2018', '#3fb950', 'choice',
    'AutoChoose — Sınav hazırlık yoğunluğu (strateji).',
    [['Yoğun hazırlık', 1], ['Dengeli', 1], ['Rahat', 1]]],
  ['t1_ueg', 100, 2575, SR, '🎯', 'Sınav\nSonucu', '2018', '#3fb950', 'choice',
    'AutoChoose — Puan değerlendirme ve tercih (strateji).',
    [['İstediğim bölüm', 1], ['Alternatif', 1], ['Gap year', 1]]],
  ['t1_us', 100, 2685, MR, '🎓', 'Üni\nBaşlangıcı', '2019', '#3fb950', 'choice',
    'AutoChoose — Bölüm seçimi (yol tercihi).',
    [['Mühendislik', 1], ['İktisat', 1], ['Mimarlık', 1], ['Sosyal bil.', 1]]],
  ['t1_ul', 100, 2815, MR, '🏛️', 'Üni\nHayatı', '2019', '#3fb950', 'choice',
    'AutoChoose — Kampüs yaşam stratejisi.',
    [['Akademik', 1], ['Sosyal', 1], ['Kariyer', 1], ['Dengeli', 1]]],
  ['t1_uck', 100, 2945, SR, '🔍', 'Üni\nKontrol', '2019', '#3fb950', 'choice',
    'AutoChoose — Bölüm değişikliği / ara yıl kararı.',
    [['Bölüm değiştir', 1], ['Ara yıl', 1], ['Devam et', 1]]],
  ['t1_pan', 100, 3055, MR, '😷', 'Pandemi\nDönemi', '2020', '#3fb950', 'choice',
    'AutoChoose — Pandemi dönemi strateji seçimi.',
    [['Yoğun çalış', 1], ['Dengeli', 1], ['Esnek', 1]]],
  ['t1_int', 100, 3175, SR, '💼', 'Staj/\nSertifika', '2021', '#3fb950', 'choice',
    'KodlamaGame(freelance) · AutoChoose(staj/sertifika).',
    [['Staj', 1], ['Sertifika', 1], ['Freelance', 2]]],
  ['t1_econ', 100, 3285, SR, '📊', 'Ekonomi\nYönetimi', '2022', '#3fb950', 'choice',
    'AutoChoose — Kişisel finans yönetimi (strateji).',
    [['Tasarruf opt.', 1], ['Yan iş kur', 1], ['Burs/destek', 1]]],

  // ════════════════════════════════════════════════════════════════════
  // İZ 2 — Meslek Lisesi → Ticaret (x=295)
  // ════════════════════════════════════════════════════════════════════
  ['t2_field', 295, 1975, MR, '🔧', 'Meslek\nLisesi', '2016', '#58a6ff', 'branch',
    'PathCards — Elektrik/Bilişim/Motor alanı seçimi.',
    [['Elektrik', 2], ['Bilişim', 2], ['Motor', 2]]],
  ['t2_year1', 295, 2105, SR, '📋', 'İlk\nYıl', '2016', '#58a6ff', 'choice',
    'AutoChoose — Pratik eğitim strateji seçimi.',
    [['Devam et', 1], ['Alan değiştir', 1], ['Yoğun çalış', 1]]],
  ['t2_prac', 295, 2215, MR, '🛠️', 'Meslek\nPratiği', '2017', '#58a6ff', 'choice',
    'AutoChoose — Staj/atölye tercihi.',
    [['Güvenli', 1], ['Dengeli', 1], ['Riskli', 1]]],
  ['t2_cert', 295, 2345, SR, '📜', 'Sertifika\nSüreci', '2018', '#58a6ff', 'choice',
    'AutoChoose — Mesleki sertifika kararı.',
    [['Sınav gir', 1], ['Staj uzat', 1], ['Hemen mezun', 1]]],
  ['t2_out', 295, 2455, SR, '🏅', 'Mezuniyet\nKararı', '2018', '#58a6ff', 'choice',
    'AutoChoose — Mezuniyet sonrası yol tercihi.',
    [['İş bul', 1], ['Girişim kur', 1], ['Devam oku', 1]]],
  ['t2_job', 295, 2565, MR, '🏪', 'İlk\nİş/Dükkan', '2019', '#58a6ff', 'choice',
    'AutoChoose — İlk iş stratejisi.',
    [['Çalışan kal', 1], ['Ortak ol', 1], ['Kendi işi', 1]]],
  ['t2_grow', 295, 2695, MR, '📈', 'Ticaret\nBüyümesi', '2020', '#58a6ff', 'choice',
    'AutoChoose — Ticaret büyüme hızı kararı.',
    [['Yavaş büyü', 1], ['Dengeli', 1], ['Hızlı genişle', 1]]],
  ['t2_cris', 295, 2825, SR, '⚡', 'Kriz\nYönetimi', '2022', '#58a6ff', 'choice',
    'AutoChoose — Ekonomik kriz strateji seçimi.',
    [['Küçül', 1], ['Pivot yap', 1], ['Sabit kal', 1]]],
  ['t2_scale', 295, 2935, MR, '🚀', 'Ölçekleme\n2024', '2024', '#58a6ff', 'choice',
    'RiskSlider — Franchise/E-ticaret/Dükkan zinciri.',
    [['Franchise', 2], ['E-ticaret', 2], ['Dükkan zinciri', 2]]],

  // ════════════════════════════════════════════════════════════════════
  // İZ 3 — Sanat / Tasarım (x=490)
  // ════════════════════════════════════════════════════════════════════
  ['t3_type', 490, 1975, MR, '🎨', 'Sanat/\nTasarım', '2015', '#b392f0', 'branch',
    'AutoChoose — Sanat türü seçimi (yol tercihi).',
    [['Güzel Sanatlar', 1], ['Grafik Tasarım', 1], ['Müzik', 1], ['Fotoğraf', 1]]],
  ['t3_port', 490, 2105, MR, '🖼️', 'Portfolyo\nHazırlık', '2016', '#b392f0', 'choice',
    'OdevOyunu(klasik) · EtkinlikGame(karma atölye) · AutoChoose(sokak perf.).',
    [['Klasik eğt.', 2], ['Karma atölye', 2], ['Sokak perf.', 1]]],
  ['t3_stage', 490, 2235, SR, '🎭', 'Sahne\nDeneyimi', '2017', '#b392f0', 'choice',
    'MuzikGame(küçük salon) · EtkinlikGame(festival/büyük sahne).',
    [['Küçük salon', 2], ['Yerel festival', 2], ['Büyük sahne', 2]]],
  ['t3_route', 490, 2345, MR, '🎨', 'Sanat\nYolu', '2018', '#b392f0', 'choice',
    'AutoChoose — Sanat kariyer rotası (strateji).',
    [['Serbest sanatçı', 1], ['Ajans/Stüdyo', 1], ['Eğitimci', 1]]],
  ['t3_proj1', 490, 2455, SR, '💡', 'İlk\nProfesyonel', '2019', '#b392f0', 'choice',
    'AutoChoose — İlk büyük proje/iş kararı.',
    [['Büyük proje', 1], ['Küçük işler', 1], ['Ortak çalış', 1]]],
  ['t3_pan', 490, 2565, SR, '😷', 'Pandemi &\nSanat', '2020', '#b392f0', 'choice',
    'AutoChoose — Pandemi döneminde sanat stratejisi.',
    [['Online geçiş', 1], ['Dijital eser', 1], ['Dur ve bekle', 1]]],
  ['t3_digital', 490, 2675, SR, '💻', 'Dijital/\nFiziksel', '2021', '#b392f0', 'choice',
    'AutoChoose — Platform seçimi.',
    [['NFT/Dijital', 1], ['Galeri', 1], ['Her ikisi', 1]]],
  ['t3_gallery', 490, 2785, MR, '🏛️', 'Galeri/\nAjans', '2022', '#b392f0', 'choice',
    'AutoChoose — Kurumsal sanat yolu seçimi.',
    [['Galeri sözleşme', 1], ['Ajans', 1], ['Bağımsız', 1]]],
  ['t3_intl', 490, 2895, SR, '🌍', 'Uluslararası\nFırsat', '2023', '#b392f0', 'choice',
    'AutoChoose — Yurt dışı sanat fırsatı tercihi.',
    [['Yurt dışına git', 1], ['Online sat', 1], ['Yerel kal', 1]]],

  // ════════════════════════════════════════════════════════════════════
  // İZ 4 — Askeri Okul (x=690)
  // ════════════════════════════════════════════════════════════════════
  ['t4_mil', 690, 1975, MR, '🎖️', 'Askeri\nKariyer', '2018', '#f0883e', 'branch',
    'PathCards — Er/Uzman/Subay/Komando seçimi.',
    [['Er', 2], ['Uzman Çavuş', 2], ['Subay', 2], ['Komando', 2]]],
  ['t4_branch', 690, 2105, MR, '✈️', 'Askeri\nBranş', '2018', '#f0883e', 'choice',
    'PathCards — Hava/Kara/Deniz kuvvetleri.',
    [['Hava Kuvvetleri', 2], ['Kara Kuvvetleri', 2], ['Deniz Kuvvetleri', 2]]],
  ['t4_train', 690, 2235, MR, '🏋️', 'Askeri\nEğitim', '2019', '#f0883e', 'choice',
    'AutoChoose — Askeri eğitim yoğunluk kararı.',
    [['Çok yoğun', 1], ['Standart', 1], ['Min. geçer', 1]]],
  ['t4_serv', 690, 2365, SR, '🛡️', 'Askerlik\nHizmeti', '2020', '#f0883e', 'choice',
    'AutoChoose — Görev yeri tercihi.',
    [['Sınır görevi', 1], ['Şehir görevi', 1], ['Teknik birim', 1]]],
  ['t4_ops', 690, 2475, SR, '🎯', 'Operasyon/\nGörev', '2021', '#f0883e', 'choice',
    'AutoChoose — Aktif görev kararı.',
    [['Gönüllü görev', 1], ['Standart', 1], ['İdari kal', 1]]],
  ['t4_out', 690, 2585, MR, '🏆', 'Askeri\nSonuç', '2022', '#f0883e', 'choice',
    'AutoChoose — Kariyer sürdürme veya ayrılma.',
    [['Muvazzaf devam', 1], ['İhtiyatçı ayrıl', 1], ['Erken ayrıl', 1]]],
  ['t4_civil', 690, 2695, SR, '💼', 'Sivil\nGeçiş', '2023', '#f0883e', 'choice',
    'AutoChoose — Sivil hayata geçiş stratejisi.',
    [['Savunma sektörü', 1], ['Güvenlik firması', 1], ['Sıfırdan başla', 1]]],

  // ════════════════════════════════════════════════════════════════════
  // İZ 5 — Çıraklık → Zanaat/Ticaret (x=880)
  // ════════════════════════════════════════════════════════════════════
  ['t5_start', 880, 1975, MR, '🔨', 'Çıraklık\nBaşlangıcı', '2015', '#ff7b72', 'branch',
    'ShantiyeGame(mobilya) · CircuitPuzzle(elektrik/oto). Tüm seçimlere oyun hazır.',
    [['Mobilya', 2], ['Elektrik', 2], ['Oto tamirci', 2]]],
  ['t5_prog', 880, 2105, MR, '⚒️', 'Çıraklık\nİlerlemesi', '2016', '#ff7b72', 'choice',
    'RiskSlider — Sertifika/Yan iş/Kendi dükkanını açma riski.',
    [['Sertifika al', 2], ['Yan iş kur', 2], ['Dükkan aç', 2]]],
  ['t5_side', 880, 2235, SR, '💡', 'Yan İş/\nSertifika', '2017', '#ff7b72', 'choice',
    'AutoChoose — Ek gelir/sertifika kararı.',
    [['Hafta sonu iş', 1], ['Online sat', 1], ['Derse devam', 1]]],
  ['t5_exam', 880, 2345, SR, '📋', 'Ustalık\nSınavı', '2018', '#ff7b72', 'choice',
    'AutoChoose — Kalfa/Usta sınavı kararı.',
    [['Sınava gir', 1], ['Daha bekle', 1], ['Yurt dışı sertifika', 1]]],
  ['t5_shop', 880, 2455, MR, '🏪', 'Kendi\nDükkanı', '2019', '#ff7b72', 'choice',
    'AutoChoose — Dükkan açılış stratejisi.',
    [['Kirala', 1], ['Satın al', 1], ['Ortak aç', 1]]],
  ['t5_grow', 880, 2585, MR, '📈', 'Büyüme\nStratejisi', '2020', '#ff7b72', 'choice',
    'AutoChoose — Zanaat büyüme hızı kararı.',
    [['Yavaş büyü', 1], ['Dengeli', 1], ['Hızlı genişle', 1]]],
  ['t5_cris', 880, 2715, SR, '⚡', 'Kriz\nDönemi', '2022', '#ff7b72', 'choice',
    'AutoChoose — Kriz yönetim stratejisi.',
    [['Küçül', 1], ['Pivot yap', 1], ['Yeni alan', 1]]],
  ['t5_scale', 880, 2825, MR, '🚀', 'Ölçekleme\n2024', '2024', '#ff7b72', 'choice',
    'RiskSlider — Zanaat zinciri veya e-ticaret.',
    [['Franchise', 2], ['E-ticaret', 2], ['Zanaat merkezi', 2]]],

  // ════════════════════════════════════════════════════════════════════
  // KARİYER KAVŞAĞI (büyük birleşme)
  // ════════════════════════════════════════════════════════════════════
  ['y2024', CX, 3070, BR, '💼', 'KARİYER\nKAVŞAĞI', '2024', '#e3b341', 'major',
    'PathCards — Tüm 5 iz burada birleşir. Kurumsal/Startup/Akademi.',
    [['Kurumsal', 2], ['Startup', 2], ['Akademik', 2]]],
  ['y2024co', 260, 3190, SR, '🏢', 'Kurumsal\nKariyer', '2024', '#8b949e', 'branch',
    'AutoChoose — Kurumsal kariyer strateji seçimi.',
    [['Maaş pazarlığı', 1], ['Yan iş kur', 1], ['Taşın-kazan', 1]]],
  ['y2024st', CX,  3190, SR, '🚀', 'Startup\nKurucusu', '2024', '#8b949e', 'branch',
    'AutoChoose — Startup strateji seçimi.',
    [['Pitch yap', 1], ['Ortak ara', 1], ['Ertele', 1]]],
  ['y2024ac', 800, 3190, SR, '🔬', 'Akademik\nYol', '2024', '#8b949e', 'branch',
    'AutoChoose — Akademik kariyer seçimi.',
    [['Araştırma gör.', 1], ['Yüksek lisans', 1], ['Doktora', 1]]],

  ['y2025', CX, 3310, MR, '⭐', '2025\nSonuç', '2025', '#f0883e', 'merge',
    'AutoChoose — Kariyer değerlendirme tercihi.',
    [['Devam et', 1], ['Pivotla', 1], ['Değiştir', 1]]],

  // ════════════════════════════════════════════════════════════════════
  // UZMANLAŞMA (5 bağımsız iz)
  // ════════════════════════════════════════════════════════════════════
  ['y2026', CX, 3430, BR, '🌟', 'UZMANLAŞMA\n2026', '2026', '#e3b341', 'major',
    'PathCards — 5 uzmanlık yolu: Mühendislik/Tıp/Mimarlık/Ticaret/Servet.',
    [['Mühendislik', 2], ['Tıp', 2], ['Mimarlık', 2], ['Ticaret', 2], ['Servet', 2]]],

  // — Mühendislik (x=100) —
  ['sp_e1', 100, 3580, MR, '⚙️', 'Müh.\nAlan Seçimi', '2026', '#58a6ff', 'branch',
    'PathCards — Yazılım/Elektrik/İnşaat/Endüstri.',
    [['Yazılım', 2], ['Elektrik', 2], ['İnşaat', 2], ['Endüstri', 2]]],
  ['sp_e2', 100, 3710, SR, '🏗️', 'İş\nDeneyimi', '2027', '#58a6ff', 'choice',
    'AutoChoose — Mühendislik deneyim tercihi.',
    [['Büyük proje', 1], ['Startup', 1], ['Danışmanlık', 1]]],
  ['sp_e3', 100, 3820, SR, '📋', 'İş\nTeklifi', '2029', '#58a6ff', 'choice',
    'AutoChoose — Kariyer teklifi kararı.',
    [['Kabul et', 1], ['Reddet', 1], ['Tekrar dene', 1]]],
  ['sp_e4', 100, 3930, MR, '🏆', 'Müh.\nSonuç 2030', '2030', '#58a6ff', 'choice',
    'AutoChoose — Mühendislik kariyer sonuç seçimi.',
    [['Uzman mühendis', 1], ['Yönetici', 1], ['Girişimci', 1]]],

  // — Tıp (x=295) —
  ['sp_m1', 295, 3580, MR, '🏥', 'TUS\nHazırlık', '2027', '#ff7b72', 'branch',
    'OdevOyunu — TUS hazırlık (soru bankası = ödev oyunu).',
    [['Çok yoğun', 2], ['Dengeli', 2], ['Min. yeterli', 1]]],
  ['sp_m2', 295, 3710, SR, '🔬', 'Klinik\nRotasyon', '2028', '#ff7b72', 'choice',
    'AutoChoose — Uzmanlık branşı seçimi.',
    [['Cerrahi', 1], ['Dahiliye', 1], ['Psikiyatri', 1]]],
  ['sp_m3', 295, 3820, MR, '🩺', 'Vaka\nYönetimi', '2028', '#ff7b72', 'choice',
    'AutoChoose — Tıbbi vaka kararları.',
    [['Agresif tedavi', 1], ['Standart', 1], ['Gözlemle', 1]]],
  ['sp_m4', 295, 3950, MR, '👨‍⚕️', 'Doktor\nSonuç 2030', '2030', '#ff7b72', 'choice',
    'AutoChoose — Doktor kariyer sonuç seçimi.',
    [['Uzman doktor', 1], ['Akademisyen', 1], ['Özel klinik', 1]]],

  // — Mimarlık (x=490) —
  ['sp_a1', 490, 3580, MR, '🏛️', 'Mim.\nGiriş', '2026', '#b392f0', 'branch',
    'AutoChoose — Mimarlık uzmanlık alanı seçimi.',
    [['Kentsel', 1], ['Peyzaj', 1], ['İç mimarlık', 1], ['Restorasyon', 1]]],
  ['sp_a2', 490, 3710, SR, '📐', 'Stüdyo\nÇalışması', '2027', '#b392f0', 'choice',
    'AutoChoose — Tasarım yaklaşımı tercihi.',
    [['Minimalist', 1], ['Sürdürülebilir', 1], ['Avant-garde', 1]]],
  ['sp_a3', 490, 3820, MR, '🏗️', 'Proje\nSüreçleri', '2028', '#b392f0', 'choice',
    'ShantiyeGame(gerçek inşaat) · AutoChoose(diğerleri).',
    [['Yarışma gir', 1], ['Gerçek inşaat', 2], ['Çizim sat', 1]]],
  ['sp_a4', 490, 3930, SR, '🏆', 'Mimar\nSonuç', '2029', '#b392f0', 'choice',
    'AutoChoose — Mimarlık kariyer sonuç seçimi.',
    [['Kendi ofis', 1], ['Büyük firma', 1], ['Öğretim görev.', 1]]],

  // — Ticaret (x=690) —
  ['sp_t1', 690, 3580, MR, '🌍', 'Ticaret\nGiriş', '2026', '#3fb950', 'branch',
    'AutoChoose — Ticaret uzmanlık alanı seçimi.',
    [['İthalat-İhracat', 1], ['E-ticaret', 1], ['Perakende', 1]]],
  ['sp_t2', 690, 3710, SR, '📦', 'Ticaret\nOps', '2027', '#3fb950', 'choice',
    'AutoChoose — Tedarik ve operasyon kararı.',
    [['Yeni pazar', 1], ['Mevcut güçlendir', 1], ['Dijital pivot', 1]]],
  ['sp_t3', 690, 3820, MR, '💹', 'Ticaret\nKriz/Büyüme', '2028', '#3fb950', 'choice',
    'AutoChoose — Kriz veya büyüme kararı.',
    [['Kriz yönet', 1], ['Büyüme fırs.', 1], ['Ortak al', 1]]],
  ['sp_t4', 690, 3930, SR, '🏆', 'Ticaret\nSonuç', '2029', '#3fb950', 'choice',
    'AutoChoose — Ticaret kariyer sonuç seçimi.',
    [['Global genişle', 1], ['Sabitle', 1], ['Sat & çık', 1]]],

  // — Servet (x=880) —
  ['sp_w1', 880, 3580, MR, '💎', 'Finansal\nStrateji', '2026', '#f0883e', 'branch',
    'PathCards — Kariyer büyütme/Yatırım/Kaldıraç.',
    [['Kariyer büyüt', 2], ['Yatırıma başla', 2], ['Şans Zarı Çek', 2]]],
  ['sp_w2', 880, 3710, MR, '📈', 'Yatırım\nRiski', '2027', '#f0883e', 'choice',
    'RiskSlider — Endeks/Fon/Kripto riski.',
    [['Güvenli endeks', 2], ['Dengeli fon', 2], ['Kripto risk', 2]]],
  ['sp_w3', 880, 3840, MR, '🏪', 'İş\nÖlçekleme', '2028', '#f0883e', 'choice',
    'RiskSlider — İşletme/Franchise/E-ticaret.',
    [['İşletme', 2], ['Franchise', 2], ['E-ticaret', 2]]],
  ['sp_w4', 880, 3970, MR, '💰', 'Vergi\nStratejisi', '2029', '#f0883e', 'choice',
    'RiskSlider — Tam uyum/Optimizasyon/Risk.',
    [['Tam uyum', 2], ['Optimizasyon', 2], ['Risk al', 2]]],

  // — Spor (sağa uzantı, x≈1070) —
  ['sp_sp1', 1070, 3580, MR, '🏃', 'Spor\nAntrenman', '2027', '#f85149', 'branch',
    'ChoiceGameRouter — KosuGame(antrenör/bireysel) · GuresGame(takım).',
    [['Antrenörle', 2], ['Bireysel', 2], ['Takımla', 2]]],
  ['sp_sp2', 1070, 3710, SR, '🥇', 'Milli\nSeçmeler', '2028', '#f85149', 'choice',
    'ChoiceGameRouter — GuresGame(seçme) · PenaltyKick(yerel lig) · KosuGame(kamp).',
    [['Seçmelere gir', 2], ['Yerel lig', 2], ['Antrenman kampı', 2]]],
  ['sp_sp3', 1070, 3840, MR, '🌍', 'Uluslar\narası Arena', '2029', '#f85149', 'choice',
    'ChoiceGameRouter — GuresGame(olimpiyat/turnuva) · PenaltyKick(ulusal).',
    [['Olimpiyat', 2], ['Ulusl. turnuva', 2], ['Ulusal şampiyon', 2]]],
  ['sp_sp4', 1070, 3970, SR, '🏆', 'Spor\nSonuç', '2030', '#f85149', 'choice',
    'AutoChoose — Spor kariyeri sonuç değerlendirmesi.',
    [['Milli sporcu', 1], ['Antrenör', 1], ['Emekli', 1]]],

  // ══ SON BİRLEŞME ══
  ['goal_eval', CX, 4150, BR, '🎯', 'HEDEF\nDEĞERLENDİRME', '2030', '#e3b341', 'major',
    'Tüm 5 uzmanlık izi + spor/girişim/akademi/seyahat izleri burada birleşir.', []],
  ['end', CX, 4290, BR, '🌟', 'HAYATINİN\nSEYRİ', '2030+', '#3fb950', 'end',
    'Oyun bitti. Seçimlerinin sonucu.', []],

  // ══ RASTGELE OLAYLAR ══
  ['rand_m', 960, 1385, 12, '🤝', 'Rastgele\nTanışma', '?', '#6b7280', 'random',
    '%10 ihtimalle tetiklenir. Beklenmedik tanışma.', []],
  ['rand_l', 960, 1510, 12, '🎰', 'Şans\nKazancı', '?', '#6b7280', 'random',
    '%10 ihtimalle tetiklenir. Para ödülü.', []],
  ['rand_i', 960, 1635, 12, '📜', 'Miras', '?', '#6b7280', 'random',
    '%10 ihtimalle tetiklenir. Beklenmedik miras.', []],
];

// ─── NODES nesnelere dönüştür ─────────────────────────────────────────────────
const NODES = NODES_RAW.map(
  ([id,x,y,r,icon,label,year,color,type,desc,rawC]) => ({
    id,x,y,r,icon,label,year,color,type,desc,
    choices: (rawC||[]).map(([s,g])=>({s,g})),
  })
);
const NODE_MAP = Object.fromEntries(NODES.map(n=>[n.id,n]));

// ─── KENARLAR ─────────────────────────────────────────────────────────────────
const EDGES = [
  ['birth','intro','#3fb950'],
  ['intro','y2001_m','#b392f0'],['intro','y2001_b','#3fb950'],['intro','y2001_f','#58a6ff'],
  ['y2001_m','y2001_m2','#b392f0'],['y2001_b','y2001_b2','#3fb950'],['y2001_f','y2001_f2','#58a6ff'],
  ['y2001_m2','y20002006','#b392f0'],['y2001_b2','y20002006','#3fb950'],['y2001_f2','y20002006','#58a6ff'],
  ['y20002006','y2004','#f0883e'],['y2004','y2005','#8b949e'],['y2005','y2006','#8b949e'],
  ['y2006','y2006s','#58a6ff'],['y2006','y2006c','#58a6ff'],['y2006','y2006sp','#58a6ff'],
  ['y2006s','y2008','#58a6ff'],['y2006c','y2008','#58a6ff'],['y2006sp','y2008','#58a6ff'],
  ['y2008','y2008s','#8b949e'],['y2008','y2008su','#8b949e'],['y2008','y2008r','#8b949e'],
  ['y2008s','y2010','#8b949e'],['y2008su','y2010','#8b949e'],['y2008r','y2010','#8b949e'],
  ['y2010','y2010m','#58a6ff'],['y2010','y2010s','#3fb950'],['y2010','y2010c','#b392f0'],
  ['y2010m','y2012','#58a6ff'],['y2010s','y2012','#3fb950'],['y2010c','y2012','#b392f0'],
  ['y2012','y2013','#f0883e'],['y2013','y2015','#8b949e'],
  // y2015 → 5 iz
  ['y2015','t1_type','#3fb950'],['y2015','t2_field','#58a6ff'],['y2015','t3_type','#b392f0'],
  ['y2015','t4_mil','#f0883e'],['y2015','t5_start','#ff7b72'],
  // İz 1
  ['t1_type','t1_adapt','#3fb950'],['t1_adapt','t1_proj','#3fb950'],['t1_proj','t1_pjsub','#3fb950'],
  ['t1_pjsub','t1_ue','#3fb950'],['t1_ue','t1_ueg','#3fb950'],['t1_ueg','t1_us','#3fb950'],
  ['t1_us','t1_ul','#3fb950'],['t1_ul','t1_uck','#3fb950'],['t1_uck','t1_pan','#3fb950'],
  ['t1_pan','t1_int','#3fb950'],['t1_int','t1_econ','#3fb950'],['t1_econ','y2024','#3fb950'],
  // İz 2
  ['t2_field','t2_year1','#58a6ff'],['t2_year1','t2_prac','#58a6ff'],['t2_prac','t2_cert','#58a6ff'],
  ['t2_cert','t2_out','#58a6ff'],['t2_out','t2_job','#58a6ff'],['t2_job','t2_grow','#58a6ff'],
  ['t2_grow','t2_cris','#58a6ff'],['t2_cris','t2_scale','#58a6ff'],['t2_scale','y2024','#58a6ff'],
  // İz 3
  ['t3_type','t3_port','#b392f0'],['t3_port','t3_stage','#b392f0'],['t3_stage','t3_route','#b392f0'],
  ['t3_route','t3_proj1','#b392f0'],['t3_proj1','t3_pan','#b392f0'],['t3_pan','t3_digital','#b392f0'],
  ['t3_digital','t3_gallery','#b392f0'],['t3_gallery','t3_intl','#b392f0'],['t3_intl','y2024','#b392f0'],
  // İz 4
  ['t4_mil','t4_branch','#f0883e'],['t4_branch','t4_train','#f0883e'],['t4_train','t4_serv','#f0883e'],
  ['t4_serv','t4_ops','#f0883e'],['t4_ops','t4_out','#f0883e'],['t4_out','t4_civil','#f0883e'],
  ['t4_civil','y2024','#f0883e'],
  // İz 5
  ['t5_start','t5_prog','#ff7b72'],['t5_prog','t5_side','#ff7b72'],['t5_side','t5_exam','#ff7b72'],
  ['t5_exam','t5_shop','#ff7b72'],['t5_shop','t5_grow','#ff7b72'],['t5_grow','t5_cris','#ff7b72'],
  ['t5_cris','t5_scale','#ff7b72'],['t5_scale','y2024','#ff7b72'],
  // Kariyer sonrası
  ['y2024','y2024co','#8b949e'],['y2024','y2024st','#8b949e'],['y2024','y2024ac','#8b949e'],
  ['y2024co','y2025','#8b949e'],['y2024st','y2025','#8b949e'],['y2024ac','y2025','#8b949e'],
  ['y2025','y2026','#f0883e'],
  // Uzmanlaşma → 5 iz + spor izi
  ['y2026','sp_e1','#58a6ff'],['y2026','sp_m1','#ff7b72'],['y2026','sp_a1','#b392f0'],
  ['y2026','sp_t1','#3fb950'],['y2026','sp_w1','#f0883e'],['y2026','sp_sp1','#f85149'],
  // Spor izi
  ['sp_sp1','sp_sp2','#f85149'],['sp_sp2','sp_sp3','#f85149'],['sp_sp3','sp_sp4','#f85149'],
  ['sp_sp4','goal_eval','#f85149'],
  // Mühendislik
  ['sp_e1','sp_e2','#58a6ff'],['sp_e2','sp_e3','#58a6ff'],['sp_e3','sp_e4','#58a6ff'],
  ['sp_e4','goal_eval','#58a6ff'],
  // Tıp
  ['sp_m1','sp_m2','#ff7b72'],['sp_m2','sp_m3','#ff7b72'],['sp_m3','sp_m4','#ff7b72'],
  ['sp_m4','goal_eval','#ff7b72'],
  // Mimarlık
  ['sp_a1','sp_a2','#b392f0'],['sp_a2','sp_a3','#b392f0'],['sp_a3','sp_a4','#b392f0'],
  ['sp_a4','goal_eval','#b392f0'],
  // Ticaret
  ['sp_t1','sp_t2','#3fb950'],['sp_t2','sp_t3','#3fb950'],['sp_t3','sp_t4','#3fb950'],
  ['sp_t4','goal_eval','#3fb950'],
  // Servet
  ['sp_w1','sp_w2','#f0883e'],['sp_w2','sp_w3','#f0883e'],['sp_w3','sp_w4','#f0883e'],
  ['sp_w4','goal_eval','#f0883e'],
  // Son
  ['goal_eval','end','#3fb950'],
  // Rastgele olaylar → gövdeye döner
  ['rand_m','y2012','#6b7280'],['rand_l','y2012','#6b7280'],['rand_i','y2013','#6b7280'],
];

// ─── Çizgi ────────────────────────────────────────────────────────────────────
function Line({ x1,y1,x2,y2,color='#444',w=1.5 }) {
  const dx=x2-x1, dy=y2-y1;
  const len=Math.sqrt(dx*dx+dy*dy);
  const ang=Math.atan2(dy,dx)*180/Math.PI;
  return (
    <View pointerEvents="none" style={{
      position:'absolute',
      left:(x1+x2)/2-len/2, top:(y1+y2)/2-w/2,
      width:len, height:w,
      backgroundColor:color, opacity:0.5,
      transform:[{rotate:`${ang}deg`}],
    }}/>
  );
}

// ─── Seçenek Balon ────────────────────────────────────────────────────────────
function Balloon({ bx,by,choice,nodeColor }) {
  const bg  = choice.g===2 ? '#0d2316' : choice.g===1 ? '#2a1f00' : '#1f0000';
  const bd  = choice.g===2 ? '#3fb950' : choice.g===1 ? '#d29922' : '#f85149';
  const ico = choice.g===2 ? '✓' : choice.g===1 ? '~' : '✗';
  const icc = bd;
  const shortLabel = choice.s.length > 9 ? choice.s.slice(0,8)+'…' : choice.s;
  return (
    <View style={{
      position:'absolute', left:bx-BLR, top:by-BLR,
      alignItems:'center',
    }}>
      <View style={{
        width:BLR*2, height:BLR*2, borderRadius:BLR,
        backgroundColor:bg, borderWidth:1.5, borderColor:bd,
        alignItems:'center', justifyContent:'center',
      }}>
        <Text style={{color:icc, fontSize:8, fontWeight:'900'}}>{ico}</Text>
      </View>
      <Text style={{
        color:'#c9d4df', fontSize:6.5, textAlign:'center',
        width:50, marginTop:1, lineHeight:8,
      }}>{shortLabel}</Text>
    </View>
  );
}

// ─── Düğüm + Balonlar ─────────────────────────────────────────────────────────
function NodeWithBalloons({ node, onPress, selected }) {
  const isSel = selected?.id === node.id;
  const choices = node.choices || [];
  const n = choices.length;

  // Balon konumları: düğüm altında yatay yayılım
  const balloonPositions = choices.map((_, i) => {
    const totalW = (n - 1) * BLS;
    const bx = node.x - totalW / 2 + i * BLS;
    const by = node.y + node.r + BLY;
    return { bx, by };
  });

  return (
    <>
      {/* Düğüm → balon çizgileri */}
      {balloonPositions.map(({bx,by},i) => (
        <Line key={`bl_${node.id}_${i}`}
          x1={node.x} y1={node.y + node.r}
          x2={bx} y2={by - BLR}
          color={node.color} w={1}
        />
      ))}
      {/* Balonlar */}
      {choices.map((c, i) => (
        <Balloon key={i} bx={balloonPositions[i].bx} by={balloonPositions[i].by}
          choice={c} nodeColor={node.color} />
      ))}
      {/* Ana düğüm */}
      <TouchableOpacity
        style={{
          position:'absolute',
          left:node.x-node.r, top:node.y-node.r,
          width:node.r*2, height:node.r*2, borderRadius:node.r,
          backgroundColor:node.color+(isSel?'ff':'28'),
          borderWidth:isSel?3:['major','start','end'].includes(node.type)?2.5:1.5,
          borderColor:node.color,
          alignItems:'center', justifyContent:'center',
          shadowColor:node.color, shadowOpacity:isSel?0.9:0.4,
          shadowRadius:isSel?12:4, elevation:isSel?8:2,
        }}
        onPress={()=>onPress(node)}
        activeOpacity={0.7}
      >
        <Text style={{fontSize:node.r>=BR?15:node.r>=MR?10:7}}>{node.icon}</Text>
      </TouchableOpacity>
      {/* Etiket — düğümün altında (balonlardan sonra) */}
      <NodeLabel node={node} hasBalloons={n>0} />
    </>
  );
}

function NodeLabel({ node, hasBalloons }) {
  const fs = node.r>=BR?9:node.r>=MR?8:7;
  const extraY = hasBalloons ? BLY + BLR*2 + 10 : node.r + 4;
  return (
    <View style={{
      position:'absolute',
      left:node.x-48, top:node.y+extraY,
      width:96, alignItems:'center',
    }}>
      {node.label.split('\n').map((l,i)=>(
        <Text key={i} style={{color:node.color,fontSize:fs,fontWeight:'700',textAlign:'center',lineHeight:fs+2}}>{l}</Text>
      ))}
      {node.year?<Text style={{color:'#6b7280',fontSize:6,marginTop:1}}>{node.year}</Text>:null}
    </View>
  );
}

// ─── Detay Modal ──────────────────────────────────────────────────────────────
const TYPE_LABEL = {
  start:'🌱 Başlangıç', game:'🎮 Oyun', choice:'🔵 Seçim',
  leaf:'🍃 Seçenek', branch:'🌿 Dal', merge:'🔴 Birleşme',
  major:'⭐ Büyük Kavşak', end:'🏁 Son', random:'🎲 Rastgele', side:'↪ Yan',
};
function DetailModal({ node, onClose }) {
  if (!node) return null;
  const ready = (node.choices||[]).filter(c=>c.g===2).length;
  const partial= (node.choices||[]).filter(c=>c.g===1).length;
  const missing= (node.choices||[]).filter(c=>c.g===0).length;
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={gs.modalBg} activeOpacity={1} onPress={onClose}>
        <View style={gs.modalBox}>
          <Text style={{fontSize:32,marginBottom:5}}>{node.icon}</Text>
          <Text style={[gs.mTitle,{color:node.color}]}>{node.label.replace('\n',' ')}</Text>
          <Text style={gs.mYear}>{TYPE_LABEL[node.type]||node.type}{node.year?` · ${node.year}`:''}</Text>
          <Text style={gs.mDesc}>{node.desc}</Text>
          {node.choices?.length>0&&(
            <View style={gs.mStats}>
              <Text style={{color:'#3fb950',fontSize:12}}>✓ Hazır: {ready}</Text>
              <Text style={{color:'#d29922',fontSize:12,marginLeft:10}}>~ Kısmi: {partial}</Text>
              <Text style={{color:'#f85149',fontSize:12,marginLeft:10}}>✗ Eksik: {missing}</Text>
            </View>
          )}
          <TouchableOpacity style={[gs.closeBtn,{backgroundColor:node.color}]} onPress={onClose}>
            <Text style={gs.closeTxt}>Kapat ✕</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

// ─── İstatistik satırı ────────────────────────────────────────────────────────
function StatsBar() {
  const allChoices = NODES.flatMap(n=>n.choices||[]);
  const total   = allChoices.length;
  const ready   = allChoices.filter(c=>c.g===2).length;
  const partial = allChoices.filter(c=>c.g===1).length;
  const missing = allChoices.filter(c=>c.g===0).length;
  const pct = total ? Math.round(ready/total*100) : 0;
  return (
    <View style={gs.statsBar}>
      <View style={gs.statsProgress}>
        <View style={[gs.statsFill,{width:`${pct}%`}]}/>
      </View>
      <Text style={gs.statsTxt}>
        <Text style={{color:'#3fb950'}}>✓{ready} </Text>
        <Text style={{color:'#d29922'}}>~{partial} </Text>
        <Text style={{color:'#f85149'}}>✗{missing} </Text>
        <Text style={{color:'#8b949e'}}>{pct}% hazır</Text>
      </Text>
    </View>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  return (
    <View style={gs.legend}>
      {[
        ['#e3b341','Büyük Kavşak'],['#f0883e','Birleşme'],
        ['#3fb950','✓ Oyun hazır'],['#d29922','~ Kısmi'],['#f85149','✗ Oyun yok'],
      ].map(([c,l],i)=>(
        <View key={i} style={gs.legItem}>
          <View style={[gs.legDot,{backgroundColor:c}]}/>
          <Text style={gs.legTxt}>{l}</Text>
        </View>
      ))}
    </View>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────
export default function GameSchema({ onBack }) {
  const [selected, setSelected] = useState(null);
  return (
    <View style={{flex:1,backgroundColor:'#050a14'}}>
      {/* Üst Bar */}
      <View style={gs.topBar}>
        <TouchableOpacity onPress={onBack} style={{position:'absolute',left:16,top:52}}>
          <Text style={{color:'#58a6ff',fontSize:15}}>← Geri</Text>
        </TouchableOpacity>
        <Text style={gs.topTitle}>Hayat Ağacı Şeması</Text>
        <Text style={gs.topSub}>{NODES.length} sahne · Dokunarak detay</Text>
      </View>
      <StatsBar/>
      <Legend/>
      {/* İki yönlü scroll */}
      <ScrollView horizontal bounces={false}>
        <ScrollView bounces={false} contentContainerStyle={{width:CW,height:CH+160}}>
          <View style={{width:CW,height:CH}}>
            {/* Kenarlar */}
            {EDGES.map(([a,b,c],i)=>{
              const na=NODE_MAP[a],nb=NODE_MAP[b];
              if(!na||!nb) return null;
              return <Line key={i} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} color={c}/>;
            })}
            {/* Düğümler + Balonlar */}
            {NODES.map(n=>(
              <NodeWithBalloons key={n.id} node={n} selected={selected} onPress={setSelected}/>
            ))}
          </View>
        </ScrollView>
      </ScrollView>
      <DetailModal node={selected} onClose={()=>setSelected(null)}/>
    </View>
  );
}

const gs = StyleSheet.create({
  topBar:   {paddingTop:48,paddingBottom:8,paddingHorizontal:16,backgroundColor:'#0d1117',borderBottomWidth:1,borderColor:'#21262d'},
  topTitle: {color:'#e6edf3',fontSize:16,fontWeight:'900',textAlign:'center',paddingTop:2},
  topSub:   {color:'#6b7280',fontSize:10,textAlign:'center',marginTop:2},
  statsBar: {backgroundColor:'#0d1117',paddingHorizontal:16,paddingVertical:5,borderBottomWidth:1,borderColor:'#21262d'},
  statsProgress:{height:4,backgroundColor:'#161b22',borderRadius:2,overflow:'hidden',marginBottom:3},
  statsFill:{height:'100%',backgroundColor:'#3fb950',borderRadius:2},
  statsTxt: {fontSize:10,color:'#8b949e'},
  legend:   {flexDirection:'row',flexWrap:'wrap',paddingHorizontal:12,paddingVertical:5,gap:7,backgroundColor:'#0d1117'},
  legItem:  {flexDirection:'row',alignItems:'center',gap:4},
  legDot:   {width:9,height:9,borderRadius:5},
  legTxt:   {color:'#8b949e',fontSize:9},
  modalBg:  {flex:1,backgroundColor:'rgba(0,0,0,0.75)',justifyContent:'center',alignItems:'center'},
  modalBox: {backgroundColor:'#161b22',borderRadius:20,padding:22,width:SW*0.82,alignItems:'center',borderWidth:1,borderColor:'#30363d'},
  mTitle:   {fontSize:18,fontWeight:'900',textAlign:'center',marginBottom:4},
  mYear:    {color:'#6b7280',fontSize:11,marginBottom:10},
  mDesc:    {color:'#c9d4df',fontSize:13,lineHeight:20,textAlign:'center',marginBottom:12},
  mStats:   {flexDirection:'row',marginBottom:16,flexWrap:'wrap',justifyContent:'center'},
  closeBtn: {paddingVertical:10,paddingHorizontal:28,borderRadius:12},
  closeTxt: {color:'#fff',fontSize:14,fontWeight:'800'},
});
