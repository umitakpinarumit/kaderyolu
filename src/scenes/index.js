    // Meslek lisesi akışı
    y2016_voc_start: (state) => ({
      text: `
        <h2>2016 · Meslek Lisesi</h2>
        <p>Alan seçimi zamanı.</p>
      `,
      choices: [
        { label: 'Güvenli: Elektrik-Elektronik', next: 'y2017_voc_progress', effects: [ { addTrait: 'voc_elektrik' } ] },
        { label: 'Dengeli: Makine', next: 'y2017_voc_progress', effects: [ { addTrait: 'voc_makine' } ] },
        { label: 'Riskli: Otomotiv', next: 'y2017_voc_progress', effects: [ { addTrait: 'voc_oto' } ] }
      ]
    }),
    y2017_voc_progress: (state) => ({
      text: `
        <h2>2017 · Staj ve Uygulama</h2>
        <p>Atölye ve işletmede staj dönemi.</p>
      `,
      choices: [
        { label: 'Güvenli: Okul atölyesi', next: 'y2018_voc_outcome', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'Dengeli: İşletme stajı', next: 'y2018_voc_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Riskli: Kendi projem', next: 'y2018_voc_outcome', effects: [ { statDelta: { confidence: 2, money: -100 } } ] }
      ]
    }),
    y2018_voc_outcome: (state) => ({
      text: `
        <h2>2018 · Meslek Lisesi Sonuç</h2>
        <p>Mezuniyet sonrası yol ayrımı.</p>
      `,
      choices: [
        { label: 'Güvenli: MYO', next: 'y2019_voc_myo', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli: Çalışmaya başla', next: 'y2019_trade_track', effects: [ { statDelta: { money: 400 } } ] },
        { label: 'Riskli: Kendi işini kur', next: 'y2019_trade_track', effects: [ { statDelta: { money: -500, confidence: 2 } } ] }
      ]
    }),
    y2019_voc_myo: (state) => ({
      text: `
        <h2>2019 · Meslek Yüksekokulu</h2>
        <p>Uygulamalı program ve bölüm dersleri.</p>
      `,
      choices: [
        { label: 'Güvenli: Staj + dersler', next: 'y2021_voc_bachelor', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli: Çalış+Oku', next: 'y2021_voc_bachelor', effects: [ { statDelta: { money: 200, confidence: 1 } } ] },
        { label: 'Riskli: Girişim projesi', next: 'y2021_voc_bachelor', effects: [ { statDelta: { confidence: 2 } }, { setFlag: { startupTrack: true } } ] }
      ]
    }),
    y2021_voc_bachelor: (state) => ({
      text: `
        <h2>2021 · Lisans Tamamlama</h2>
        <p>DGS/Geçiş ile lisans tamamlama şansı.</p>
      `,
      choices: [
        { label: 'Güvenli: DGS çalış', next: 'y2022_voc_result', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli: İş deneyimi', next: 'y2022_voc_result', effects: [ { statDelta: { money: 200 } } ] },
        { label: 'Riskli: Kendi markam', next: 'y2022_voc_result', effects: [ { statDelta: { confidence: 2 } } ] }
      ]
    }),
    y2022_voc_result: (state) => ({
      text: `
        <h2>2022 · Mesleki Yol Sonuç</h2>
        <p>Uzmanlaştığın alanda konumunu güçlendirdin.</p>
      `,
      choices: [
        { label: 'Devam (trade/kurumsal)', next: 'y2024_trade_scale' },
        { label: 'Kurumsal sektöre geç', next: 'y2024_career' },
        { label: 'Yurt dışı iş arayışı', next: 'y2027_travel', effects: [ { numberDelta: { travelCount: 1 } } ] }
      ]
    }),
    // Meslek lisesi ayrık akış
    y2016_voc_start: (state) => ({
      text: `
        <h2>2016 · Meslek Lisesi</h2>
        <p>Alan seçimi: elektrik, bilişim, motor, muhasebe.</p>
      `,
      choices: [
        { label: 'Güvenli: Elektrik', next: 'y2017_voc_progress', effects: [ { statDelta: { intelligence: 2 } }, { addTrait: 'vocElektrik' } ] },
        { label: 'Dengeli: Bilişim', next: 'y2017_voc_progress', effects: [ { statDelta: { intelligence: 2, confidence: 1 } }, { addTrait: 'vocBilisim' } ] },
        { label: 'Riskli: Motor', next: 'y2017_voc_progress', effects: [ { statDelta: { health: -1, confidence: 2 } }, { addTrait: 'vocMotor' } ] }
      ]
    }),
    y2017_voc_progress: (state) => ({
      text: `
        <h2>2017 · Staj ve Uygulama</h2>
        <p>İşyeri stajı, uygulamalı dersler.</p>
      `,
      choices: [
        { label: 'Güvenli: Dönem içi staj', next: 'y2019_voc_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Yaz stajı', next: 'y2019_voc_outcome', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Riskli: Çalış + staj', next: 'y2019_voc_outcome', effects: [ { statDelta: { money: 200, health: -1 } } ] }
      ]
    }),
    y2019_voc_outcome: (state) => ({
      text: `
        <h2>2019 · Meslek Lisesi Çıktısı</h2>
        <p>Mezuniyet sonrası yol: MYO, işe başlama veya sınavsız dikey geçiş planları.</p>
      `,
      choices: [
        { label: 'Güvenli: MYO (iki yıllık)', next: 'y2021_voc_myo', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli: Hemen işe başla', next: 'y2021_voc_job', effects: [ { statDelta: { money: 400, confidence: 1 } } ] },
        { label: 'Riskli: Sınavla 4 yıllık', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 2 } } ] }
      ]
    }),
    y2021_voc_myo: (state) => ({
      text: `
        <h2>2021 · MYO</h2>
        <p>Uygulamalı eğitim, kısa sürede iş bulma odaklı.</p>
      `,
      choices: [
        { label: 'Güvenli: Bitir ve işe gir', next: 'y2024_career', effects: [ { statDelta: { money: 600 } } ] },
        { label: 'Dengeli: Dikey geçişe hazırlan', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 2, confidence: 1 } } ] },
        { label: 'Riskli: Kendi işini kur', next: 'y2024_trade_scale', effects: [ { statDelta: { money: -500, confidence: 2 } } ] }
      ]
    }),
    y2021_voc_job: (state) => ({
      text: `
        <h2>2021 · İşe Başlama</h2>
        <p>Uygulamalı alanda tam zamanlı çalışmaya başlıyorsun.</p>
      `,
      choices: [
        { label: 'Güvenli: Usta yanında çalış', next: 'y2022_trade_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Sertifika + iş', next: 'y2022_trade_outcome', effects: [ { statDelta: { intelligence: 1, money: 100 } } ] },
        { label: 'Riskli: Kendi işin', next: 'y2024_trade_scale', effects: [ { statDelta: { money: -800, confidence: 3 } } ] }
      ]
    }),
    // 2015 — Çıraklık yolu
    y2015_apprenticeship_start: (state) => ({
      text: `
        <h2>2015 · Çıraklık</h2>
        <p>Bir ustanın yanında çıraklığa başlıyorsun. Hangi alana yönelirsin?</p>
      `,
      choices: [
        { label: 'Güvenli: Elektrik', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { intelligence: 2, confidence: 2 } }, { addTrait: 'elektrikCirak' } ] },
        { label: 'Dengeli: Mobilya', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { confidence: 3 } }, { addTrait: 'mobilyaCirak' } ] },
        { label: 'Riskli: Oto tamir', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { health: -2, confidence: 4 } }, { addTrait: 'otoCirak' } ] }
      ]
    }),
    y2016_apprenticeship_progress: (state) => ({
      text: `
        <h2>2016 · Ustalığa Doğru</h2>
        <p>Tecrübe kazanıyorsun. Sertifika alıp iş kurma planı yapabilirsin.</p>
      `,
      choices: [
        { label: 'Sertifika (güvenli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Yan iş/ustadan öğren (dengeli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { money: 200 } } ] },
        { label: 'Kendi dükkanını dene (riskli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { money: -300, confidence: 3 } }, { setFlag: { smallBizTried: true } } ] }
      ]
    }),
    y2018_apprenticeship_outcome: (state) => ({
      text: `
        <h2>2018 · Ustalık Çıktısı</h2>
        <p>Ustalığa bir adım daha yaklaştın. Gelir ve özgüvenin etkileniyor.</p>
      `,
      choices: [
        { label: 'Meslekte devam et (trade)', next: 'y2019_trade_track', effects: [ { statDelta: { money: 600, confidence: 2 } } ] },
        { label: 'Ustalık belgesi için hazırlan', next: 'y2019_trade_track', effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'İstersen üniversiteye de hazırlan', next: 'y2018_uni_exam' }
      ]
    }),
    y2019_trade_track: (state) => ({
      text: `
        <h2>2019 · Trade Kariyer Hattı</h2>
        <p>Ustalık ve iş geliştirme: müşteri, ekipman, dükkân.</p>
      `,
      choices: [
        { label: 'Güvenli: Usta yanında kal', next: 'y2020_trade_growth', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Ortaklık kur', next: 'y2020_trade_growth', effects: [ { statDelta: { money: -200, confidence: 2 } } ] },
        { label: 'Riskli: Kendi dükkânın', next: 'y2020_trade_growth', effects: [ { statDelta: { money: -600, confidence: 3 } } ] }
      ]
    }),
    y2020_trade_growth: (state) => ({
      text: `
        <h2>2020 · Ticari Büyüme</h2>
        <p>Müşteri memnuniyeti ve ekipman yatırımları.</p>
      `,
      choices: [
        { label: 'Güvenli: Bakım ve kalite', next: 'y2022_trade_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Küçük ekip kur', next: 'y2022_trade_outcome', effects: [ { statDelta: { money: -200, social: 1 } } ] },
        { label: 'Riskli: Büyük yatırım', next: 'y2022_trade_outcome', effects: [ { statDelta: { money: -1000, confidence: 2 } } ] }
      ]
    }),
    y2022_trade_outcome: (state) => ({
      text: `
        <h2>2022 · Trade Sonuç</h2>
        <p>İşin oturdu. Gelir/itibar arttı.</p>
      `,
      choices: [
        { label: 'Devam et', next: 'y2024_trade_scale', effects: [ { statDelta: { money: 1200, confidence: 2 } } ] },
        { label: 'Kurumsala geç', next: 'y2024_career' },
        { label: 'Yurtdışı fırsat ara', next: 'y2027_travel', effects: [ { numberDelta: { travelCount: 1 } } ] }
      ]
    }),
    y2024_trade_scale: (state) => ({
      text: `
        <h2>2024 · Trade Ölçekleme</h2>
        <p>Şube açma, e-ticaret, yerel marka olma fırsatları.</p>
      `,
      choices: [
        { label: 'Güvenli: E-ticaret', next: 'y2025_outcome', effects: [ { statDelta: { money: 800 } } ] },
        { label: 'Dengeli: Küçük şube', next: 'y2025_outcome', effects: [ { statDelta: { money: -400, confidence: 2 } } ] },
        { label: 'Riskli: Hızlı büyüme', next: 'y2025_outcome', effects: [ { statDelta: { money: -1500, confidence: 3 } } ] }
      ]
    }),

    // Sanat yolu
    y2016_artist_portfolio: (state) => ({
      text: `
        <h2>2016 · Sanat Portföyü</h2>
        <p>Portföy oluşturmaya başlıyorsun: resim, müzik ya da sahne.</p>
      `,
      choices: [
        { label: 'Güvenli: Klasik eğitim', next: 'y2017_artist_stage', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli: Karma atölye', next: 'y2017_artist_stage', effects: [ { statDelta: { happiness: 2, confidence: 1 } } ] },
        { label: 'Riskli: Sokak performansı', next: 'y2017_artist_stage', effects: [ { statDelta: { happiness: 3, confidence: 2, money: -50 } } ] }
      ]
    }),
    y2017_artist_stage: (state) => ({
      text: `
        <h2>2017 · İlk Gösteri</h2>
        <p>Sahneye çıkma şansı doğdu. Nasıl ilerlersin?</p>
      `,
      choices: [
        { label: 'Güvenli: Küçük salon', next: 'y2018_uni_exam', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Dengeli: Yerel festival', next: 'y2018_uni_exam', effects: [ { statDelta: { happiness: 2, confidence: 2 } } ] },
        { label: 'Riskli: Büyük sahne', next: 'y2018_uni_exam', effects: [ { statDelta: { confidence: 4, happiness: 1 } } ] }
      ]
    }),

    // Askerî yol
    y2018_military_choice: (state) => ({
      text: `
        <h2>2018 · Askerî Yol</h2>
        <p>Askerî kariyer düşünüyor musun?</p>
      `,
      choices: [
        { label: 'Güvenli: Kısa dönem düşün', next: 'y2018_mil_branch', effects: [ { statDelta: { confidence: 1 } }, { setFlag: { milPath: 'short' } } ] },
        { label: 'Dengeli: Sınavlara hazırlan', next: 'y2018_mil_branch', effects: [ { statDelta: { intelligence: 2 } }, { setFlag: { milPath: 'exam' } } ] },
        { label: 'Riskli: Komando hedefi', next: 'y2018_mil_branch', effects: [ { statDelta: { health: 3, confidence: 2 } }, { setFlag: { milPath: 'commando' } } ] }
      ]
    }),
    y2018_mil_branch: (state) => ({
      text: `
        <h2>2018 · Branş Seçimi</h2>
        <p>Hangi kuvvet?</p>
      `,
      choices: [
        { label: 'Hava (güvenli)', next: 'y2019_mil_role', effects: [ { setFlag: { milBranch: 'hava' } }, { statDelta: { intelligence: 1 } } ] },
        { label: 'Kara (dengeli)', next: 'y2019_mil_role', effects: [ { setFlag: { milBranch: 'kara' } }, { statDelta: { health: 1 } } ] },
        { label: 'Deniz (riskli)', next: 'y2019_mil_role', effects: [ { setFlag: { milBranch: 'deniz' } }, { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2019_mil_role: (state) => ({
      text: `
        <h2>2019 · Rol Seçimi</h2>
        <p>Rolüne karar ver.</p>
      `,
      choices: [
        { label: 'Er/Kısa dönem (güvenli)', next: 'y2020_mil_training', effects: [ { addTrait: 'mil_enlisted' } ] },
        { label: 'Uzman çavuş (dengeli)', next: 'y2020_mil_training', conditions: [ { statGte: { key: 'health', value: 55 } } ], effects: [ { addTrait: 'mil_nco' }, { statDelta: { confidence: 1 } } ] },
        { label: 'Subay (koşullu/riskli)', next: 'y2020_mil_training', conditions: [ { statGte: { key: 'intelligence', value: 65 } } ], effects: [ { addTrait: 'mil_officer' }, { statDelta: { confidence: 2 } } ] },
        { label: 'Komando (riskli)', next: 'y2020_mil_training', conditions: [ { statGte: { key: 'health', value: 65 } } ], effects: [ { addTrait: 'mil_commando' }, { statDelta: { health: 2 } } ] }
      ]
    }),
    y2020_mil_training: (state) => ({
      text: `
        <h2>2020 · Eğitim</h2>
        <p>Temel eğitim ve branşa özgü hazırlık.</p>
      `,
      choices: [
        { label: 'Güvenli: Standart eğitim', next: 'y2020_mil_check', effects: [ { statDelta: { health: 2, discipline: 1 } } ] },
        { label: 'Dengeli: Branş kursu', next: 'y2020_mil_check', effects: [ { statDelta: { intelligence: 1, health: 2, discipline: 1 } } ] },
        { label: 'Riskli: Yoğun kamp', next: 'y2020_mil_check', effects: [ { statDelta: { health: 4, happiness: -1, endurance: 2 } } ] }
      ]
    }),
    y2020_mil_check: (state) => ({
      text: `
        <h2>2020 · Rol Uygunluk Kontrolü</h2>
        <p>Seçtiğin role göre performans değerlendiriliyor.</p>
      `,
      choices: [
        { label: 'Değerlendir', next: (() => {
          const s = state.data.stats;
          const traits = state.data.traits || [];
          const isOfficer = traits.includes('mil_officer');
          const isCommando = traits.includes('mil_commando');
          let pass = true;
          if (isOfficer) pass = (s.intelligence >= 65 && s.confidence >= 60 && s.discipline >= 55);
          if (isCommando) pass = (s.health >= 70 && s.endurance >= 65 && s.discipline >= 60);
          return pass ? 'y2021_mil_assignment' : 'y2021_mil_assignment';
        })() }
      ]
    }),
    y2021_mil_assignment: (state) => ({
      text: `
        <h2>2021 · Görevlendirme</h2>
        <p>Birliğe katılım ve görev yeri.</p>
      `,
      choices: [
        { label: 'Güvenli: Üs içi görev', next: 'y2024_mil_career', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Sınır görevi', next: 'y2024_mil_career', effects: [ { statDelta: { health: 1, confidence: 1 } } ] },
        { label: 'Riskli: Operasyonel birlik', next: 'y2024_mil_career', effects: [ { statDelta: { health: 2 } } ] }
      ]
    }),
    y2024_mil_career: (state) => ({
      text: `
        <h2>2024 · Askerî Kariyer</h2>
        <p>Rütbe, uzmanlaşma ve terfi olanakları.</p>
      `,
      choices: [
        { label: 'Güvenli: Mevcut görevde derinleş', next: 'y2025_mil_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Kurslar ve sertifikalar', next: 'y2025_mil_outcome', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Riskli: Özel birlik/komando', next: 'y2025_mil_outcome', conditions: [ { statGte: { key: 'health', value: 70 } } ], effects: [ { addTrait: 'mil_special' }, { statDelta: { confidence: 2 } } ] }
      ]
    }),
    y2025_mil_outcome: (state) => ({
      text: `
        <h2>2025 · Askerî Sonuç</h2>
        <p>Branş: <strong>${state.data.flags.milBranch || '—'}</strong> · Rol: <strong>${state.data.traits?.find(t=>t.startsWith('mil_')) || '—'}</strong></p>
      `,
      choices: [
        { label: 'Devam (2030 hedeflerine)', next: 'y2026_growth' },
        { label: 'Başa dön', next: 'goal_select' }
      ]
    }),
export function getScenes() {
  return {
    // Hedef seçimi
    goal_select: (state) => ({
      text: `
        <h2>Hedefini Seç</h2>
        <p>Hayat yolculuğuna bir niyetle başla. Bu hedef 2025'te değerlendirilecek.</p>
      `,
      choices: [
        { label: 'Başarıya ulaş', next: 'intro', effects: [ { setFlag: { goal: 'basariyaUlas' } } ] },
        { label: 'Huzurlu ve mutlu ölümü hedefle', next: 'intro', effects: [ { setFlag: { goal: 'huzurluOlum' } } ] },
        { label: 'Mühendis ol', next: 'intro', effects: [ { setFlag: { goal: 'muhendisOl' } } ] },
        { label: 'Mimar ol', next: 'intro', effects: [ { setFlag: { goal: 'mimarOl' } } ] },
        { label: 'Bütün dünyayı gez', next: 'intro', effects: [ { setFlag: { goal: 'dunyayiGez' } } ] }
      ]
    }),

    // 2000 — Doğum ve ilk bağlar
    intro: (state) => ({
      text: `
        <h2>2000 · İstanbul'da Doğum</h2>
        <p>İstanbul'da dünyaya geldin. İlk yıllar aile gözetiminde, güvenli ve sıcak bir ortamda geçiyor.</p>
        <p>Yakın çevren, kimle daha çok vakit geçirdiğine göre kişiliğini şekillendiriyor. Kiminle daha yakın hissettin?</p>
      `,
      choices: [
        {
          label: 'Babama daha yakınım',
          next: 'y2000_2006_caretaking',
          effects: [
            { addTrait: 'babaSevgisi' },
            { setFlag: { babaDestek: true } },
            { statDelta: { confidence: 5, happiness: 3 } }
          ]
        },
        {
          label: 'Anneme daha yakınım',
          next: 'y2000_2006_caretaking',
          effects: [
            { addTrait: 'anneSevgisi' },
            { setFlag: { anneDestek: true } },
            { statDelta: { happiness: 6, social: 3 } }
          ]
        },
        {
          label: 'Her ikisiyle de dengeli',
          next: 'y2000_2006_caretaking',
          effects: [ { statDelta: { happiness: 4, confidence: 2, social: 2 } } ]
        }
      ]
    }),

    // 2000–2006 — Erken çocukluk
    y2000_2006_caretaking: (state) => ({
      text: `
        <h2>2000–2006 · Aile Gözetiminde Büyüme</h2>
        <p>Okul öncesi dönem oyunlar, temel beceriler ve sosyal ilk adımlarla geçiyor.</p>
        <p class="muted">${state.data.flags.babaDestek ? 'Baban maddi/manevi konularda net şekilde destekçi.' : state.data.flags.anneDestek ? 'Annen duygusal olarak güçlü bir dayanak.' : 'Aile desteği dengeli.'}</p>
      `,
      choices: [
        { label: 'Okul öncesi eğitime ağırlık ver', next: 'y2006_primary_start', effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Oyun ve sosyalleşmeye odaklan', next: 'y2006_primary_start', effects: [ { statDelta: { social: 6, happiness: 4 } } ] },
        { label: 'Sağlık ve hareketi artır', next: 'y2006_primary_start', effects: [ { statDelta: { health: 6 } } ] }
      ]
    }),

    // 2006 — İlkokul başlangıcı
    y2006_primary_start: (state) => ({
      text: `
        <h2>2006 · İlkokula Başlangıç</h2>
        <p>İlkokul başlıyor. Disiplin ve merak arasında denge kurman gerekecek.</p>
      `,
      choices: [
        { label: 'Düzenli çalış (temel kuvvetli olsun)', next: 'y2008_family_finance', effects: [ { statDelta: { intelligence: 8, happiness: -2 } } ] },
        { label: 'Kulüplere katıl (sosyal çevre)', next: 'y2008_family_finance', effects: [ { statDelta: { social: 8, confidence: 3 } } ] },
        { label: 'Spor yap (sağlık)', next: 'y2008_family_finance', effects: [ { statDelta: { health: 8, happiness: 2 } } ] }
      ]
    }),

    // 2008 — Aile ekonomisi ve destek
    y2008_family_finance: (state) => ({
      text: `
        <h2>2008 · Aile Ekonomisi</h2>
        <p>Aile bütçesinde dalgalanmalar hissediliyor. Harcamalar gözden geçiriliyor.</p>
      `,
      choices: [
        { label: 'Harcamaları kıs ve sabret', next: 'y2010_hobby', effects: [ { statDelta: { happiness: -2, confidence: 2 } }, { setFlag: { savingsDiscipline: true } }, { addTrait: 'sabirli' } ] },
        { label: 'Baban destek oluyor', next: 'y2010_hobby', conditions: [ { traitIncludes: 'babaSevgisi' } ], effects: [ { statDelta: { money: 200, happiness: 3 } } ] },
        { label: 'Aile içi dayanışma (evde sorumluluk al)', next: 'y2010_hobby', effects: [ { statDelta: { social: 3, confidence: 3 } } ] }
      ]
    }),

    // 2010 — Hobi ve beceriler
    y2010_hobby: (state) => ({
      text: `
        <h2>2010 · Hobi Edinme</h2>
        <p>Zamanını değerlendirirken bir hobiye odaklanabilirsin.</p>
      `,
      choices: [
        { label: 'Müzik', next: 'y2012_exam', effects: [ { statDelta: { happiness: 5, social: 3 } } ] },
        { label: 'Spor', next: 'y2012_exam', effects: [ { statDelta: { health: 6, confidence: 3 } } ] },
        { label: 'Kodlama', next: 'y2012_exam', effects: [ { statDelta: { intelligence: 6, confidence: 2 } } ] },
        { label: 'Küçük birikimleri değerlendir', next: 'y2011_savings', conditions: [ { flagEquals: { key: 'savingsDiscipline', value: true } } ], effects: [ { addTrait: 'yatirimciAdayi' } ] }
      ]
    }),
    y2011_savings: (state) => ({
      text: `
        <h2>2011 · Birikimleri Değerlendirme</h2>
        <p>Küçük birikimlerini nasıl değerlendireceksin?</p>
      `,
      choices: [
        { label: 'Mevduat (güvenli)', next: 'y2012_exam', effects: [ { statDelta: { money: 200, confidence: 1 } } ] },
        { label: 'Altın (dengeli)', next: 'y2012_exam', effects: [ { statDelta: { money: 250 } } ] },
        { label: 'Borsa (risk)', next: 'y2012_exam', effects: [ { statDelta: { money: 400, happiness: -2 } } ] }
      ]
    }),

    // 2012 — Ortaokul/sınav dönemi
    y2012_exam: (state) => ({
      text: `
        <h2>2012 · Sınavlara Hazırlık</h2>
        <p>Çalışma disiplini uzun vadeyi belirleyebilir.</p>
      `,
      choices: [
        { label: 'Planlı çalış', next: 'y2015_high_school', effects: [ { statDelta: { intelligence: 10, happiness: -3 } } ] },
        { label: 'Dengeli ilerle', next: 'y2015_high_school', effects: [ { statDelta: { intelligence: 5, social: 3 } } ] },
        { label: 'Rahat al', next: 'y2013_reflect', effects: [ { statDelta: { happiness: 4, intelligence: -4 } }, { setFlag: { tookItEasy2012: true } } ] }
      ]
    }),
    y2013_reflect: (state) => ({
      text: `
        <h2>2013 · Dinlen ve Değerlendir</h2>
        <p>Bir süre tempoyu düşürdün. Nasıl devam edersin?</p>
      `,
      choices: [
        { label: 'Rutin kur ve toparlan', next: 'y2015_high_school', effects: [ { statDelta: { intelligence: 4, confidence: 2 } } ] },
        { label: 'Keyfine bak', next: 'y2015_high_school', effects: [ { statDelta: { happiness: 3, intelligence: -2 } } ] }
      ]
    }),

    // 2015 — Lise seçimi
    y2015_high_school: (state) => ({
      text: `
        <h2>2015 · Lise Yolu</h2>
        <p>Okul seçimi: akademik, mesleki veya dengeli bir yol.</p>
      `,
      choices: [
        { label: 'Fen ağırlıklı lise', next: 'y2016_projects', conditions: [ { statGte: { key: 'intelligence', value: 60 } } ], effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Anadolu lisesi (dengeli)', next: 'y2016_projects', effects: [ { statDelta: { social: 3, intelligence: 3 } } ] },
        { label: 'Meslek lisesi', next: 'y2016_voc_start', effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'Güzel sanatlar lisesi', next: 'y2016_artist_portfolio', effects: [ { statDelta: { happiness: 3, confidence: 2 } } ], },
        { label: 'Okumak yerine çıraklık', next: 'y2015_apprenticeship_start', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Askerî yol', next: 'y2018_military_choice', effects: [ { statDelta: { health: 1, confidence: 1 } } ] }
      ]
    }),

    // 2016 — Projeler
    y2016_projects: (state) => ({
      text: `
        <h2>2016 · Projeler ve Kulüpler</h2>
        <p>Okulda proje/kulüp çalışmalarına katılma şansın var.</p>
      `,
      choices: [
        { label: 'Bilim projesi (güvenli)', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 6, confidence: 3 } } ] },
        { label: 'Sosyal sorumluluk (dengeli)', next: 'y2018_uni_exam', effects: [ { statDelta: { social: 6, happiness: 3 } } ] },
        { label: 'Spor turnuvası (riskli)', next: 'y2018_uni_exam', effects: [ { statDelta: { health: 6, confidence: 2 } } ] }
      ]
    }),

    // 2018 — Üniversite sınavı
    y2018_uni_exam: (state) => ({
      text: `
        <h2>2018 · Üniversite Sınavı</h2>
        <p>Sınav hazırlığı ve tercih süreci başlıyor.</p>
      `,
      choices: [
        { label: 'Yoğun çalış (hedef yüksek)', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 10, happiness: -4 } } ] },
        { label: 'Dengeli hazırla', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Kısıtlı hazırlan', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 2, happiness: 2 } } ] }
      ]
    }),

    // 2019 — Üniversite başlangıcı
    y2019_uni_start: (state) => ({
      text: `
        <h2>2019 · Üniversite</h2>
        <p>Üniversiteye başlıyorsun. Bölüm ve çevre hayatını şekillendiriyor.</p>
      `,
      choices: [
        { label: 'Mühendislik/BT alanı', next: 'y2019_uni_check', conditions: [ { statGte: { key: 'intelligence', value: 55 } } ], effects: [ { statDelta: { intelligence: 4, confidence: 2 } }, { setFlag: { uniField: 'stem' } } ] },
        { label: 'İktisadi/İdari bilimler', next: 'y2019_uni_check', effects: [ { statDelta: { social: 3 } }, { setFlag: { uniField: 'econ' } } ] },
        { label: 'Sanat/Tasarım', next: 'y2019_uni_check', effects: [ { statDelta: { happiness: 4, confidence: 2 } }, { setFlag: { uniField: 'design' } } ] }
      ]
    }),
    y2019_uni_check: (state) => ({
      text: `
        <h2>2019 · Bölüm Kabul Kontrolü</h2>
        <p>Bölüm gereksinimlerine göre değerlendiriliyorsun.</p>
      `,
      choices: [
        { label: 'Değerlendir', next: (() => {
          const s = state.data.stats;
          const f = state.data.flags.uniField;
          let score = 0, threshold = 0;
          if (f === 'stem') { score = Math.round(s.intelligence*0.6 + s.focus*0.25 + s.discipline*0.15); threshold = 65; }
          else if (f === 'design') { score = Math.round(s.creativity*0.6 + s.confidence*0.2 + s.focus*0.2); threshold = 60; }
          else { score = Math.round(s.intelligence*0.4 + s.social*0.3 + s.confidence*0.3); threshold = 55; }
          return score >= threshold ? 'y2020_pandemic' : 'y2019_uni_prep';
        })() }
      ]
    }),
    y2019_uni_prep: (state) => ({
      text: `
        <h2>2019 · Hazırlık ve Destek</h2>
        <p>Gereksinimler için ek hazırlık yapman gerekiyor.</p>
      `,
      choices: [
        { label: 'Güvenli: Etüt ve danışmanlık', next: 'y2020_pandemic', effects: [ { statDelta: { intelligence: 2, focus: 2, discipline: 2 } } ] },
        { label: 'Dengeli: Kulüp ve çalışma grubu', next: 'y2020_pandemic', effects: [ { statDelta: { social: 2, confidence: 1, focus: 1 } } ] },
        { label: 'Riskli: Tek başıma denerim', next: 'y2020_pandemic', effects: [ { statDelta: { confidence: 2 } } ] }
      ]
    }),

    // 2020 — Pandemi dönemi
    y2020_pandemic: (state) => ({
      text: `
        <h2>2020 · Pandemi</h2>
        <p>Uzaktan eğitim, kısıtlamalar ve belirsizlik. Sağlık ve psikoloji önemli.</p>
      `,
      choices: [
        { label: 'Düzenli program oluştur', next: 'y2021_remote_intern', effects: [ { statDelta: { intelligence: 4, confidence: 3, happiness: 1 } } ] },
        { label: 'Aileyle vakit (ev içi destek)', next: 'y2021_remote_intern', effects: [ { statDelta: { happiness: 4, social: 3 } } ] },
        { label: 'Komşulara yardım/ gönüllülük', next: 'y2021_remote_intern', effects: [ { statDelta: { social: 5, confidence: 2 } } ] }
      ]
    }),

    // 2021 — Uzaktan staj/iş
    y2021_remote_intern: (state) => ({
      text: `
        <h2>2021 · Uzaktan Deneyim</h2>
        <p>Uzaktan staj/part-time iş fırsatı buldun.</p>
      `,
      choices: [
        { label: 'Stajı kabul et (deneyim)', next: 'y2022_economy', effects: [ { statDelta: { confidence: 4, money: 500 } } ] },
        { label: 'Sertifika programı', next: 'y2022_economy', effects: [ { statDelta: { intelligence: 5, confidence: 2 } } ] },
        { label: 'Dinlen ve toparlan', next: 'y2021_self_care', effects: [ { statDelta: { happiness: 4, health: 3 } }, { addTrait: 'sabirli' } ] }
      ]
    }),
    y2021_self_care: (state) => ({
      text: `
        <h2>2021 · Öz Bakım</h2>
        <p>Ritmini dengeledin. Küçük alışkanlıklarla devam.</p>
      `,
      choices: [
        { label: 'Nefes/meditasyon', next: 'y2022_economy', effects: [ { statDelta: { health: 3, happiness: 2 } } ] },
        { label: 'Spora başla', next: 'y2022_economy', effects: [ { statDelta: { health: 4, confidence: 2 } } ] }
      ]
    }),

    // 2022 — Ekonomi ve bütçe
    y2022_economy: (state) => ({
      text: `
        <h2>2022 · Bütçe Yönetimi</h2>
        <p>Artan maliyetler bütçeni zorluyor. Nasıl yönetirsin?</p>
      `,
      choices: [
        { label: 'Giderleri optimize et', next: 'y2023_volunteer', effects: [ { statDelta: { confidence: 2, happiness: -1 } } ] },
        { label: 'Aile desteği al', next: 'y2023_volunteer', conditions: [ { traitIncludes: 'babaSevgisi' } ], effects: [ { statDelta: { money: 600, happiness: 2 } } ] },
        { label: 'Freelance çalış', next: 'y2023_volunteer', effects: [ { statDelta: { money: 800, confidence: 3, happiness: -1 } } ] },
        { label: 'Birikimleri değerlendir', next: 'y2023_volunteer', conditions: [ { flagEquals: { key: 'savingsDiscipline', value: true } } ], effects: [ { statDelta: { money: 500, confidence: 2 } } ] }
      ]
    }),

    // 2023 — Gönüllülük ve toplumsal dayanışma
    y2023_volunteer: (state) => ({
      text: `
        <h2>2023 · Dayanışma</h2>
        <p>Toplumsal dayanışma çalışmaları gündemde. Katkı sağlamak ister misin?</p>
      `,
      choices: [
        { label: 'Gönüllü çalışmalara katıl', next: 'y2024_career', effects: [ { statDelta: { social: 6, confidence: 3, happiness: 2 } } ] },
        { label: 'Maddi destek ver', next: 'y2024_career', conditions: [ { statGte: { key: 'money', value: 200 } } ], effects: [ { statDelta: { money: -200, happiness: 2 } } ] },
        { label: 'Uzaktan destek/organizasyon', next: 'y2024_career', effects: [ { statDelta: { intelligence: 2, social: 3 } } ] }
      ]
    }),

    // 2024 — Kariyer yolu ve uzmanlaşma
    y2024_career: (state) => ({
      text: `
        <h2>2024 · Yol Ayrımı</h2>
        <p>Uzmanlaşma ve iş seçenekleri arasında karar zamanı.</p>
      `,
      choices: [
        { label: 'Kurumsal şirkete gir', next: 'y2025_outcome', effects: [ { statDelta: { money: 1500, confidence: 3 } } ] },
        { label: 'Start-up dene', next: 'y2025_outcome', effects: [ { statDelta: { confidence: 5 } }, { setFlag: { startupTrack: true } } ] },
        { label: 'Akademik yol', next: 'y2025_outcome', conditions: [ { statGte: { key: 'intelligence', value: 65 } } ], effects: [ { statDelta: { intelligence: 3, confidence: 2 } }, { setFlag: { academiaTrack: true } } ] }
      ]
    }),

    // 2025 — Çıktılar
    y2025_outcome: (state) => ({
      text: `
        <h2>2025 · İstanbul'da Sen</h2>
        <p>Çocukluktan genç yetişkinliğe uzanan hikâyen biçimlendi.</p>
        ${(() => {
          const goalKey = state.data.flags.goal;
          if (!goalKey) return '<p class="muted">Bir hedef seçilmedi.</p>';
          return `<p>Hedefin: <strong>${goalKey}</strong></p>`;
        })()}
        <ul>
          <li>Mutluluk: <strong>${state.data.stats.happiness}</strong></li>
          <li>Sağlık: <strong>${state.data.stats.health}</strong></li>
          <li>Zekâ: <strong>${state.data.stats.intelligence}</strong></li>
          <li>Sosyal: <strong>${state.data.stats.social}</strong></li>
          <li>Özgüven: <strong>${state.data.stats.confidence}</strong></li>
          <li>Para: <strong>${state.data.stats.money}</strong></li>
          <li>Özellikler: <strong>${Array.isArray(state.data.traits) && state.data.traits.length ? state.data.traits.join(', ') : '—'}</strong></li>
        </ul>
        <div id="goalResult" class="muted"></div>
        <p class="muted">İstersen baştan başlayıp farklı seçimler deneyebilirsin.</p>
      `,
      choices: [
        { label: 'Başa dön (2000)', next: 'goal_select' },
        { label: 'Devam et (2030 hedefleri)', next: 'y2026_growth' }
      ]
    })
    ,
    // 2026–2030 genişleme (ana yol devamı ve dallar)
    y2026_growth: (state) => ({
      text: `
        <h2>2026 · Gelişim Yılı</h2>
        <p>Önündeki fırsatları değerlendir: spor, girişim, akademi veya keşif.</p>
      `,
      choices: [
        { label: 'Spor disiplinine gir', next: 'y2027_sports', conditions: [ { statGte: { key: 'health', value: 60 } } ], effects: [ { addTrait: 'athlete' }, { statDelta: { health: 6, confidence: 2 } } ] },
        { label: 'Girişim fikrine odaklan', next: 'y2027_startup', conditions: [ { statGte: { key: 'confidence', value: 55 } } ], effects: [ { setFlag: { startupTrack: true } } ] },
        { label: 'Akademik hazırlık', next: 'y2027_academia', conditions: [ { statGte: { key: 'intelligence', value: 60 } } ], effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 4 } } ] },
        { label: 'Seyahat planla', next: 'y2027_travel', effects: [ { statDelta: { happiness: 2 } } ] }
      ]
    }),
    y2027_sports: (state) => ({
      text: `
        <h2>2027 · Spor Yolu</h2>
        <p>Performans artıyor. Yerel yarışmalara katılabilir, antrenör bulabilirsin.</p>
      `,
      choices: [
        { label: 'Antrenör ile çalış', next: 'y2028_sports_national', effects: [ { statDelta: { health: 8, confidence: 3 } }, { numberDelta: { training: 3 } } ] },
        { label: 'Kendi programın', next: 'y2028_sports_national', effects: [ { statDelta: { health: 5 } }, { numberDelta: { training: 1 } } ] }
      ]
    }),
    y2028_sports_national: (state) => ({
      text: `
        <h2>2028 · Milli Seçmeler</h2>
        <p>Milli takım seçmeleri için başvur.</p>
      `,
      choices: [
        { label: 'Seçmelere katıl', next: 'y2028_sports_check', conditions: [ { numberGte: { key: 'training', value: 3 } } ], effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Önce yerel ligde kal', next: 'y2029_sports_local', effects: [ { statDelta: { health: 3 } }, { numberDelta: { training: 1 } } ] }
      ]
    }),
    y2028_sports_check: (state) => ({
      text: `
        <h2>2028 · Performans Kontrolü</h2>
        <p>Seçme günü. Sağlık, dayanıklılık, çeviklik ve disiplin değerlendiriliyor.</p>
      `,
      choices: [
        { label: 'Değerlendir', next: (() => {
          const s = state.data.stats;
          const score = Math.round(s.health * 0.35 + s.endurance * 0.3 + s.agility * 0.2 + s.discipline * 0.15);
          return score >= 70 ? 'y2029_sports_international' : 'y2028_sports_fail';
        })() }
      ]
    }),
    y2028_sports_fail: (state) => ({
      text: `
        <h2>2028 · Seçme Başarısız</h2>
        <p>Eşik geçilemedi. Daha fazla antrenman ve hazırlık gerek.</p>
      `,
      choices: [
        { label: 'Yerel ligde kal ve hazırlan', next: 'y2029_sports_local', effects: [ { numberDelta: { training: 1 } }, { statDelta: { confidence: -1 } } ] },
        { label: 'Başka dal dene', next: 'y2026_growth' }
      ]
    }),
    y2029_sports_local: (state) => ({
      text: `
        <h2>2029 · Yerel Lig</h2>
        <p>Yerel ligde güçleniyorsun. Tekrar denemek ister misin?</p>
      `,
      choices: [
        { label: 'Antrenmanı artır ve tekrar dene', next: 'y2029_sports_international', effects: [ { numberDelta: { training: 1 } }, { statDelta: { health: 3 } } ] },
        { label: 'Yerelde kal', next: 'y2030_outcome', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2029_sports_international: (state) => ({
      text: `
        <h2>2029 · Uluslararası Arenaya Çıkış</h2>
        <p>Uluslararası turnuvalarda deneyim kazanma şansı.</p>
      `,
      choices: [
        { label: 'Uluslararası turnuvaya katıl', next: 'y2030_outcome', conditions: [ { statGte: { key: 'health', value: 85 } } ], effects: [ { addTrait: 'olympian' }, { statDelta: { confidence: 6 } } ] },
        { label: 'Bölgesel turnuvalar', next: 'y2030_outcome', effects: [ { statDelta: { health: 4 } } ] }
      ]
    }),
    y2027_startup: (state) => ({
      text: `
        <h2>2027 · Girişim Yolu</h2>
        <p>MVP geliştir, pitch hazırla, yatırım ara.</p>
      `,
      choices: [
        { label: 'MVP çıkar', next: 'y2028_startup_pitch', effects: [ { statDelta: { confidence: 4, intelligence: 2 } } ] },
        { label: 'Pazarı doğrula', next: 'y2028_startup_pitch', effects: [ { statDelta: { social: 4, confidence: 2 } } ] }
      ]
    }),
    y2028_startup_pitch: (state) => ({
      text: `
        <h2>2028 · Pitch ve Sponsor</h2>
        <p>Yatırımcılara sunum yap.</p>
      `,
      choices: [
        { label: 'Melek yatırımcılara sun', next: 'y2028_startup_check', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Kitle fonlama', next: 'y2028_startup_check', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Bekle ve pivot ara', next: 'y2029_startup_pivot', effects: [ { statDelta: { intelligence: 1 } } ] }
      ]
    }),
    y2028_startup_check: (state) => ({
      text: `
        <h2>2028 · Pitch Sonucu</h2>
        <p>Sunum kabul edildi mi?</p>
      `,
      choices: [
        { label: 'Sonucu gör', next: (() => {
          const s = state.data.stats;
          const base = Math.round(s.confidence*0.45 + s.charisma*0.3 + s.focus*0.25);
          const luck = state.data.stats.luck;
          const score = base + Math.round((luck - 50)/10);
          if (score >= 65) {
            state.setFlag('startupFunded', true);
            s.money += 4000;
            return 'y2030_outcome';
          }
          return 'y2028_startup_fail';
        })() }
      ]
    }),
    y2028_startup_fail: (state) => ({
      text: `
        <h2>2028 · Pitch Başarısız</h2>
        <p>Yatırım alamadın. Alternatif yollar mümkün.</p>
      `,
      choices: [
        { label: 'Pivot et ve tekrar dene', next: 'y2029_startup_pivot' },
        { label: 'Gelire odaklan', next: 'y2030_outcome', effects: [ { statDelta: { money: 600 } } ] }
      ]
    }),
    y2029_startup_pivot: (state) => ({
      text: `
        <h2>2029 · Pivot</h2>
        <p>Pazar geri bildirimine göre yönünü netleştir.</p>
      `,
      choices: [
        { label: 'Pivot et ve tekrar sun', next: 'y2030_outcome', conditions: [ { statGte: { key: 'intelligence', value: 60 } } ], effects: [ { setFlag: { startupFunded: true } }, { statDelta: { money: 3000, confidence: 3 } } ] },
        { label: 'Gelire odaklan', next: 'y2030_outcome', effects: [ { statDelta: { money: 800 } } ] }
      ]
    }),
    y2027_academia: (state) => ({
      text: `
        <h2>2027 · Akademi Yolu</h2>
        <p>Lisansüstü başvurularına hazırlan, yayın ve referans biriktir.</p>
      `,
      choices: [
        { label: 'Yurtdışı başvurusu yap', next: 'y2028_academia_abroad', conditions: [ { statGte: { key: 'intelligence', value: 70 } } ], effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'Ülkede yüksek lisans', next: 'y2030_outcome', effects: [ { statDelta: { intelligence: 3 } } ] }
      ]
    }),
    y2028_academia_abroad: (state) => ({
      text: `
        <h2>2028 · Yurt Dışı Kabul</h2>
        <p>IELTS/TOEFL ve referanslarla başvurular sonuçlanıyor.</p>
      `,
      choices: [
        { label: 'Kabul aldın', next: 'y2030_outcome', effects: [ { setFlag: { abroadAccepted: true } }, { addTrait: 'englishB2' }, { statDelta: { confidence: 4 } } ] },
        { label: 'Bekle ve yeniden dene', next: 'y2029_academia_retry', effects: [ { statDelta: { intelligence: 2 } } ] }
      ]
    }),
    y2029_academia_retry: (state) => ({
      text: `
        <h2>2029 · Tekrar Deneme</h2>
        <p>Kendini güçlendirip yeniden başvurabilirsin.</p>
      `,
      choices: [
        { label: 'Dil kursu (B2)', next: 'y2030_outcome', effects: [ { addTrait: 'englishB2' }, { statDelta: { intelligence: 2, confidence: 2 } } ] },
        { label: 'Araştırma asistanlığı', next: 'y2030_outcome', effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 3 } } ] }
      ]
    }),
    y2027_travel: (state) => ({
      text: `
        <h2>2027 · Keşif</h2>
        <p>Yakın ülkelere kısa geziler planlıyorsun.</p>
      `,
      choices: [
        { label: 'Balkanlar turu', next: 'y2028_travel_more', effects: [ { statDelta: { happiness: 3 } }, { numberDelta: { travelCount: 1 } } ] },
        { label: 'Orta Doğu turu', next: 'y2028_travel_more', effects: [ { statDelta: { happiness: 3 } }, { numberDelta: { travelCount: 1 } } ] }
      ]
    }),
    y2028_travel_more: (state) => ({
      text: `
        <h2>2028 · Daha Fazla Seyahat</h2>
        <p>Uzak destinasyonlara açılıyorsun.</p>
      `,
      choices: [
        { label: 'Uzak Doğu', next: 'y2030_outcome', effects: [ { statDelta: { happiness: 3 } }, { numberDelta: { travelCount: 2 } } ] },
        { label: 'Amerika', next: 'y2030_outcome', effects: [ { statDelta: { happiness: 3 } }, { numberDelta: { travelCount: 2 } } ] }
      ]
    }),
    y2030_outcome: (state) => ({
      text: `
        <h2>2030 · Ara Değerlendirme</h2>
        <p>Hedeflerin doğrultusunda nereye geldin?</p>
        <div id="goalResult" class="muted"></div>
      `,
      choices: [
        { label: 'Başa dön', next: 'goal_select' },
        { label: 'Devam', next: 'y2026_growth' }
      ]
    })
    ,
    // Rastgele olaylar
    rand_meet: (state) => ({
      text: `
        <h2>Rastgele Karşılaşma</h2>
        <p>Birisi seninle tanışmak istiyor. Kabul eder misin?</p>
      `,
      choices: [
        { label: 'Kabul et', next: 'rand_meet_result' },
        { label: 'Reddet ve devam et', next: (state.data.flags.returnScene || 'y2026_growth') }
      ]
    }),
    rand_meet_result: (state) => ({
      text: `
        <h2>Görüşme</h2>
        <p>İlk izlenim nasıl?</p>
      `,
      choices: [
        { label: 'Sonucu gör', next: (() => {
          const s = state.data.stats;
          const score = Math.round(s.charisma*0.5 + s.confidence*0.3 + (s.luck-50)/2);
          if (score >= 60) {
            // aşık olma etkisi
            s.happiness += 4; s.social += 2; s.confidence += 1;
            return 'rand_resume';
          }
          // olumsuz sonuç
          s.happiness -= 2; s.confidence -= 1;
          return 'rand_resume';
        })() }
      ]
    }),
    rand_lottery: (state) => ({
      text: `
        <h2>Piyango</h2>
        <p>Bilet alıp şansını denemek ister misin?</p>
      `,
      choices: [
        { label: 'Bilet al (50₺)', next: 'rand_lottery_result', effects: [ { statDelta: { money: -50 } } ] },
        { label: 'Alma, devam et', next: (state.data.flags.returnScene || 'y2026_growth') }
      ]
    }),
    rand_lottery_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>Çekiliş sonucu açıklanıyor…</p>
      `,
      choices: [
        { label: 'Göster', next: (() => {
          const s = state.data.stats;
          const luck = s.luck;
          const win = (luck + Math.random()*50) > 85;
          if (win) { s.money += 5000; s.happiness += 3; }
          else { s.happiness -= 1; }
          return 'rand_resume';
        })() }
      ]
    }),
    rand_inheritance: (state) => ({
      text: `
        <h2>Uzak Akraba</h2>
        <p>Uzak bir akrabadan miras var. Kabul eder misin?</p>
      `,
      choices: [
        { label: 'Kabul et', next: 'rand_inheritance_result' },
        { label: 'Reddet', next: 'rand_resume' }
      ]
    }),
    rand_inheritance_result: (state) => ({
      text: `
        <h2>Miras Sonucu</h2>
        <p>Beklenmedik detaylar ortaya çıkıyor…</p>
      `,
      choices: [
        { label: 'Göster', next: (() => {
          const s = state.data.stats;
          const debt = Math.random() < 0.5;
          if (debt) { s.money -= 800; s.happiness -= 1; }
          else { s.money += 8000; s.happiness += 2; }
          return 'rand_resume';
        })() }
      ]
    }),
    rand_resume: (state) => ({
      text: `
        <h2>Yola Devam</h2>
        <p>Rastgele olay tamamlandı.</p>
      `,
      choices: [
        { label: 'Devam et', next: (() => state.data.flags.returnScene || 'y2026_growth')() }
      ]
    })
  };
}


