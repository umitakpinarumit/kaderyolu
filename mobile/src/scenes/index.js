// Web sürümündeki geniş sahnelerin RN'e uyarlanmış hali
function getScenes() {
  return {
    
    intro: (state) => ({
      text: `
        <h2>2000 · İstanbul'da Doğum</h2>
        <p>İstanbul'da dünyaya geldin. İlk yıllar aile gözetiminde, güvenli ve sıcak bir ortamda geçiyor.</p>
        <p>Yakın çevren, kimle daha çok vakit geçirdiğine göre kişiliğini şekillendiriyor. Kiminle daha yakın hissettin?</p>
      `,
      choices: [
        { label: 'Babama daha yakınım', next: 'y2001_outing_father', effects: [ { addTrait: 'babaSevgisi' }, { setFlag: { babaDestek: true } }, { statDelta: { confidence: 5, happiness: 3 } } ] },
        { label: 'Anneme daha yakınım', next: 'y2001_outing_mother', effects: [ { addTrait: 'anneSevgisi' }, { setFlag: { anneDestek: true } }, { statDelta: { happiness: 6, social: 3 } } ] },
        { label: 'Her ikisiyle de dengeli', next: 'y2001_outing_both', effects: [ { statDelta: { happiness: 4, confidence: 2, social: 2 } } ] }
      ]
    }),
    // 2001: Ebeveyn ile ilk geziler (ardışık mini olaylar)
    y2001_outing_father: (state) => ({
      text: `
        <h2>2001 · Babayla Dışarı</h2>
        <p>Baban seni bir yere götürmek istiyor. Nereye gidelim?</p>
      `,
      choices: [
        { label: 'Stadyum', next: 'y2001_outing_father2', effects: [ { statDelta: { health: 1, confidence: 1 } } ] },
        { label: 'Tamirci dükkânı', next: 'y2001_outing_father2', effects: [ { statDelta: { intelligence: 1, discipline: 1 } }, { addTrait: 'elBecerisi' } ] },
        { label: 'Bilgisayar fuarı', next: 'y2001_outing_father2', effects: [ { statDelta: { intelligence: 2, focus: 1 } }, { addTrait: 'techMerak' } ] }
      ]
    }),
    y2001_outing_father2: (state) => ({
      text: `
        <h2>2001 · Baba Gününün Devamı</h2>
        <p>Günün ikinci kısmı için bir etkinlik daha.</p>
      `,
      choices: [
        { label: 'Mahalle maçı', next: 'y2000_2006_caretaking', effects: [ { statDelta: { agility: 1, social: 1 } } ] },
        { label: 'Şantiye gezisi', next: 'y2000_2006_caretaking', effects: [ { statDelta: { intelligence: 1, confidence: 1 } } ] },
        { label: 'Atölye denemesi', next: 'y2000_2006_caretaking', effects: [ { statDelta: { creativity: 1, discipline: 1 } } ] }
      ]
    }),
    y2001_outing_mother: (state) => ({
      text: `
        <h2>2001 · Anneyle Dışarı</h2>
        <p>Annen seni bir yere götürmek istiyor. Nereye gidelim?</p>
      `,
      choices: [
        { label: 'Müze', next: 'y2001_outing_mother2', effects: [ { statDelta: { creativity: 2, happiness: 1 } } ] },
        { label: 'Kütüphane', next: 'y2001_outing_mother2', effects: [ { statDelta: { intelligence: 2, focus: 1 } } ] },
        { label: 'Akraba ziyareti', next: 'y2001_outing_mother2', effects: [ { statDelta: { social: 2, empathy: 1 } } ] }
      ]
    }),
    y2001_outing_mother2: (state) => ({
      text: `
        <h2>2001 · Anne Gününün Devamı</h2>
        <p>Bir etkinlik daha seç.</p>
      `,
      choices: [
        { label: 'Resim kursu', next: 'y2000_2006_caretaking', effects: [ { statDelta: { creativity: 2 } } ] },
        { label: 'Okuma saati', next: 'y2000_2006_caretaking', effects: [ { statDelta: { focus: 1, intelligence: 1 } } ] },
        { label: 'Aile pikniği', next: 'y2000_2006_caretaking', effects: [ { statDelta: { happiness: 2, social: 1 } } ] }
      ]
    }),
    y2001_outing_both: (state) => ({
      text: `
        <h2>2001 · Ailece Dışarı</h2>
        <p>Herkesin keyif alacağı bir yer seç.</p>
      `,
      choices: [
        { label: 'Park', next: 'y2001_outing_both2', effects: [ { statDelta: { happiness: 1, health: 1 } } ] },
        { label: 'Toplu etkinlik', next: 'y2001_outing_both2', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Sinema', next: 'y2001_outing_both2', effects: [ { statDelta: { happiness: 2 } } ] }
      ]
    }),
    y2001_outing_both2: (state) => ({
      text: `
        <h2>2001 · Aile Etkinliği Devam</h2>
        <p>Günün son seçimi.</p>
      `,
      choices: [
        { label: 'Toplu oyun', next: 'y2000_2006_caretaking', effects: [ { statDelta: { social: 1, empathy: 1 } } ] },
        { label: 'Aile toplantısı', next: 'y2000_2006_caretaking', effects: [ { statDelta: { empathy: 1 } } ] },
        { label: 'Alışveriş', next: 'y2000_2006_caretaking', effects: [ { statDelta: { happiness: 1 } } ] }
      ]
    }),
    y2000_2006_caretaking: (state) => ({
      text: `
        <h2>2000–2006 · Aile Gözetiminde Büyüme</h2>
        <p>Okul öncesi dönem oyunlar, temel beceriler ve sosyal ilk adımlarla geçiyor.</p>
      `,
      choices: [
        { label: 'Okul öncesi eğitime ağırlık ver', next: 'y2004_early_activities', effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Oyun ve sosyalleşmeye odaklan', next: 'y2004_early_activities', effects: [ { statDelta: { social: 6, happiness: 4 } } ] },
        { label: 'Sağlık ve hareketi artır', next: 'y2004_early_activities', effects: [ { statDelta: { health: 6 } } ] }
      ]
    }),
    y2004_early_activities: (state) => ({
      text: `
        <h2>2004 · Erken Etkinlikler</h2>
        <p>Günlük oyun ve öğrenme arasında seçim.</p>
      `,
      choices: [
        { label: 'Yapboz/Zeka oyunları', next: 'y2005_child_choice', effects: [ { statDelta: { intelligence: 1, focus: 1 } } ] },
        { label: 'Sokak oyunları', next: 'y2005_child_choice', effects: [ { statDelta: { agility: 1, social: 1 } } ] },
        { label: 'Masal saati', next: 'y2005_child_choice', effects: [ { statDelta: { empathy: 1, happiness: 1 } } ] }
      ]
    }),
    y2005_child_choice: (state) => ({
      text: `
        <h2>2005 · İlk Tercihler</h2>
        <p>Hangi yönü güçlendirmek istersin?</p>
      `,
      choices: [
        { label: 'Düzenli rutin', next: 'y2006_primary_start', effects: [ { statDelta: { discipline: 1, focus: 1 } } ] },
        { label: 'Sosyalleşme', next: 'y2006_primary_start', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Aktif oyun', next: 'y2006_primary_start', effects: [ { statDelta: { health: 1, endurance: 1 } } ] }
      ]
    }),
    y2006_primary_start: (state) => ({
      text: `
        <h2>2006 · İlkokula Başlangıç</h2>
        <p>İlkokul başlıyor. Disiplin ve merak arasında denge kurman gerekecek.</p>
      `,
      choices: [
        { label: 'Düzenli çalış (temel kuvvetli olsun)', next: 'y2006_after_school_study', effects: [ { statDelta: { intelligence: 8, happiness: -2 } } ] },
        { label: 'Kulüplere katıl (sosyal çevre)', next: 'y2006_after_school_club', effects: [ { statDelta: { social: 8, confidence: 3 } } ] },
        { label: 'Spor yap (sağlık)', next: 'y2006_after_school_sport', effects: [ { statDelta: { health: 8, happiness: 2 } } ] }
      ]
    }),
    // 2006: okul sonrası ardışık seçenekler
    y2006_after_school_study: (state) => ({
      text: `
        <h2>2006 · Okul Sonrası (Çalışma)</h2>
        <p>Disiplini nasıl kurarsın?</p>
      `,
      choices: [
        { label: 'Düzenli ödev', next: 'y2008_family_finance', effects: [ { statDelta: { discipline: 2, focus: 1 } } ] },
        { label: 'Deney seti', next: 'y2008_family_finance', effects: [ { statDelta: { intelligence: 2, creativity: 1 } } ] },
        { label: 'Erken uyku', next: 'y2008_family_finance', effects: [ { statDelta: { health: 1, focus: 1 } } ] }
      ]
    }),
    y2006_after_school_club: (state) => ({
      text: `
        <h2>2006 · Okul Sonrası (Kulüp)</h2>
        <p>Hangi kulüp?</p>
      `,
      choices: [
        { label: 'Tiyatro', next: 'y2008_family_finance', effects: [ { statDelta: { social: 2, confidence: 1, charisma: 1 } } ] },
        { label: 'İzcilik', next: 'y2008_family_finance', effects: [ { statDelta: { endurance: 1, confidence: 1 } } ] },
        { label: 'Robotik', next: 'y2008_family_finance', effects: [ { statDelta: { intelligence: 2, focus: 1 } } ] }
      ]
    }),
    y2006_after_school_sport: (state) => ({
      text: `
        <h2>2006 · Okul Sonrası (Spor)</h2>
        <p>Hangi spor?</p>
      `,
      choices: [
        { label: 'Koşu', next: 'y2008_family_finance', effects: [ { statDelta: { health: 2, endurance: 1 } } ] },
        { label: 'Yüzme', next: 'y2008_family_finance', effects: [ { statDelta: { health: 2, agility: 1 } } ] },
        { label: 'Güreş', next: 'y2008_family_finance', effects: [ { statDelta: { strength: 2, confidence: 1 } } ] }
      ]
    }),
    y2008_family_finance: (state) => ({
      text: `
        <h2>2008 · Aile Ekonomisi</h2>
        <p>Aile bütçesinde dalgalanmalar hissediliyor. Harcamalar gözden geçiriliyor.</p>
      `,
      choices: [
        { label: 'Harcamaları kıs ve sabret', next: 'y2008_path_saving', effects: [ { statDelta: { happiness: -2, confidence: 2 } }, { setFlag: { savingsDiscipline: true } }, { addTrait: 'sabirli' } ] },
        { label: 'Baban destek oluyor', next: 'y2008_path_support', effects: [ { statDelta: { money: 200, happiness: 3 } } ] },
        { label: 'Aile içi dayanışma (evde sorumluluk al)', next: 'y2008_path_responsibility', effects: [ { statDelta: { social: 3, confidence: 3 } } ] }
      ]
    }),
    y2008_path_saving: (state) => ({
      text: `
        <h2>2008 · Tasarruf Planı</h2>
        <p>Tasarruf için bir yöntem seç.</p>
      `,
      choices: [
        { label: 'Kumbara', next: 'y2010_hobby', effects: [ { statDelta: { discipline: 1 } } ] },
        { label: 'Aylık bütçe defteri', next: 'y2010_hobby', effects: [ { statDelta: { focus: 1, discipline: 1 } } ] },
        { label: 'Kısa vadeli hedef', next: 'y2010_hobby', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2008_path_support: (state) => ({
      text: `
        <h2>2008 · Destek Kullanımı</h2>
        <p>Ek kaynağı nasıl değerlendirirsin?</p>
      `,
      choices: [
        { label: 'Eğitim malzemesi', next: 'y2010_hobby', effects: [ { statDelta: { intelligence: 1, focus: 1 } } ] },
        { label: 'Sağlık-spor', next: 'y2010_hobby', effects: [ { statDelta: { health: 1, happiness: 1 } } ] },
        { label: 'Ailecek etkinlik', next: 'y2010_hobby', effects: [ { statDelta: { social: 1, happiness: 1 } } ] }
      ]
    }),
    y2008_path_responsibility: (state) => ({
      text: `
        <h2>2008 · Sorumluluk</h2>
        <p>Ev içi görev seç.</p>
      `,
      choices: [
        { label: 'Alışveriş listesi', next: 'y2010_hobby', effects: [ { statDelta: { discipline: 1 } } ] },
        { label: 'Temizlik planı', next: 'y2010_hobby', effects: [ { statDelta: { discipline: 1, confidence: 1 } } ] },
        { label: 'Kardeşe destek', next: 'y2010_hobby', effects: [ { statDelta: { empathy: 1, social: 1 } } ] }
      ]
    }),
    y2010_hobby: (state) => ({
      text: `
        <h2>2010 · Hobi Edinme</h2>
        <p>Zamanını değerlendirirken bir hobiye odaklanabilirsin.</p>
      `,
      choices: [
        { label: 'Müzik', next: 'y2010_hobby_music', effects: [ { statDelta: { happiness: 5, social: 3 } } ] },
        { label: 'Spor', next: 'y2010_hobby_sport', effects: [ { statDelta: { health: 6, confidence: 3 } } ] },
        { label: 'Kodlama', next: 'y2010_hobby_coding', effects: [ { statDelta: { intelligence: 6, confidence: 2 } } ] }
      ]
    }),
    y2010_hobby_music: (state) => ({
      text: `
        <h2>2010 · Müzik Yolu</h2>
        <p>Hangi adımı atarsın?</p>
      `,
      choices: [
        { label: 'Ders al', next: 'y2012_exam', effects: [ { statDelta: { discipline: 1, confidence: 1 } } ] },
        { label: 'Grup kur', next: 'y2012_exam', effects: [ { statDelta: { social: 2, confidence: 1 } } ] },
        { label: 'Evde çalış', next: 'y2012_exam', effects: [ { statDelta: { focus: 1 } } ] }
      ]
    }),
    y2010_hobby_sport: (state) => ({
      text: `
        <h2>2010 · Spor Yolu</h2>
        <p>Nasıl ilerlersin?</p>
      `,
      choices: [
        { label: 'Takıma katıl', next: 'y2012_exam', effects: [ { statDelta: { endurance: 1, social: 1 } } ] },
        { label: 'Bireysel plan', next: 'y2012_exam', effects: [ { statDelta: { health: 1, discipline: 1 } } ] },
        { label: 'Antrenör bul', next: 'y2012_exam', effects: [ { statDelta: { health: 1, confidence: 1 } }, { numberDelta: { training: 1 } } ] }
      ]
    }),
    y2010_hobby_coding: (state) => ({
      text: `
        <h2>2010 · Kodlama Yolu</h2>
        <p>İlk adım?</p>
      `,
      choices: [
        { label: 'Online kurs', next: 'y2012_exam', effects: [ { statDelta: { intelligence: 1, focus: 1 } } ] },
        { label: 'Mini proje', next: 'y2012_exam', effects: [ { statDelta: { creativity: 1, confidence: 1 } } ] },
        { label: 'Hackathon dene', next: 'y2012_exam', effects: [ { statDelta: { confidence: 1, social: 1 } } ] }
      ]
    }),
    y2012_exam: (state) => ({
      text: `
        <h2>2012 · Sınavlara Hazırlık</h2>
        <p>Çalışma disiplini uzun vadeyi belirleyebilir.</p>
      `,
      choices: [
        { label: 'Planlı çalış', next: 'y2015_high_school', effects: [ { statDelta: { intelligence: 10, happiness: -3 } } ] },
        { label: 'Dengeli ilerle', next: 'y2015_high_school', effects: [ { statDelta: { intelligence: 5, social: 3 } } ] },
        { label: 'Rahat al', next: 'y2013_reflect', effects: [ { statDelta: { happiness: 4, intelligence: -4 } } ] }
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
    y2015_high_school: (state) => {
      const s = state.data.stats;
      const hint = s.intelligence >= 70
        ? '<p class="stat-note">⭐ Güçlü zekânla fen lisesi için çok uygun bir adaysın.</p>'
        : s.intelligence >= 55
        ? '<p class="stat-note">📊 Genel liseler sana açık. Meslek lisesi de somut kariyer kapısı.</p>'
        : '<p class="stat-note">📊 Akademik yol zorlu; pratik ve mesleki yollar daha hızlı kapı açar.</p>';
      return {
        text: `
          <h2>2015 · Büyük Kavşak — Lise Seçimi</h2>
          <p>Her yol farklı bir geleceğe çıkıyor. Seçiminin bedelleri de fırsatları kadar gerçek.</p>
          ${hint}
        `,
        choices: [
          { label: '🔬 Fen ağırlıklı lise',
            next: 'y2015_hs_fen',
            conditions: [ { statGte: { key: 'intelligence', value: 62 } } ],
            effects: [ { statDelta: { intelligence: 7, focus: 3, discipline: 2, social: -3, happiness: -2 } } ] },
          { label: '📖 Anadolu lisesi (dengeli)',
            next: 'y2015_hs_anadolu',
            effects: [ { statDelta: { social: 4, intelligence: 4, confidence: 2, focus: -1 } } ] },
          { label: '🔧 Meslek lisesi',
            next: 'y2016_voc_start',
            effects: [ { statDelta: { confidence: 4, discipline: 3, intelligence: -2, social: -1 } } ] },
          { label: '🎨 Güzel sanatlar lisesi',
            next: 'y2016_artist_portfolio',
            conditions: [ { statGte: { key: 'creativity', value: 45 } } ],
            effects: [ { statDelta: { creativity: 5, happiness: 4, intelligence: -2, discipline: -1 } } ] },
          { label: '🔨 Çıraklık (okul değil iş)',
            next: 'y2015_apprenticeship_start',
            effects: [ { statDelta: { confidence: 3, discipline: 3, money: 200, intelligence: -3, social: -2 } } ] },
          { label: '🎖️ Askerî yol',
            next: 'y2018_military_choice',
            conditions: [ { statGte: { key: 'health', value: 50 } } ],
            effects: [ { statDelta: { health: 3, discipline: 4, confidence: 2, happiness: -3, social: -2 } } ] },
        ]
      };
    },
    y2015_hs_fen: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2015 · Fen Lisesi — Odak Seçimi</h2>
          <p>Baskılı ortam ama güçlü mezunlar çıkar. Zamanını nasıl değerlendirirsin?</p>
          ${s.focus >= 55 ? '<p class="stat-note">📊 İyi odak seviyenle proje liderliğine uygunsun.</p>' : ''}
        `,
        choices: [
          { label: '🔬 Bilim olimpiyatları',
            next: 'y2016_projects',
            effects: [ { statDelta: { intelligence: 8, focus: 4, confidence: 3, social: -3, happiness: -2 } } ] },
          { label: '🧪 Laboratuvar ve proje çalışması',
            next: 'y2016_projects',
            effects: [ { statDelta: { intelligence: 5, discipline: 3, confidence: 2, happiness: -1 } } ] },
          { label: '📚 Özel ders (yoğun hazırlık)',
            next: 'y2016_projects',
            effects: [ { statDelta: { intelligence: 6, discipline: 3, happiness: -2, social: -2, money: -200 } } ] },
        ]
      };
    },
    y2015_hs_anadolu: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2015 · Anadolu Lisesi — Yönelim</h2>
          <p>Dengeli program; sosyal ve akademiyi bir arada yürütebilirsin.</p>
          ${s.social >= 55 ? '<p class="stat-note">📊 Güçlü sosyalliğinle kulüp ve konsey rolleri sana açık.</p>' : ''}
        `,
        choices: [
          { label: '🌍 Dil kulübü ve değişim programı',
            next: 'y2016_projects',
            effects: [ { statDelta: { social: 5, confidence: 3, intelligence: 2 } }, { numberDelta: { travelCount: 1 } } ] },
          { label: '🤝 Öğrenci konseyi & sosyal proje',
            next: 'y2016_projects',
            effects: [ { statDelta: { social: 8, charisma: 4, confidence: 3, intelligence: -2, focus: -2 } } ] },
          { label: '📖 Akademiye odaklan (üniversite hedefi)',
            next: 'y2016_projects',
            effects: [ { statDelta: { intelligence: 6, discipline: 3, social: -2, happiness: -1 } } ] },
        ]
      };
    },
    // Meslek lisesi akışı
    y2016_voc_start: (state) => ({
      text: `
        <h2>2016 · Meslek Lisesi — Alan Seçimi</h2>
        <p>Her alan farklı güçlü yönler geliştirir — ama farklı şeyleri feda eder.</p>
      `,
      choices: [
        { label: '⚡ Elektrik-Elektronik',
          next: 'y2017_voc_practice',
          effects: [ { setFlag: { vocField: 'elektrik' } }, { addTrait: 'vocElektrik' }, { statDelta: { intelligence: 3, focus: 2, confidence: -1 } } ] },
        { label: '🔧 Motorlu Araçlar',
          next: 'y2017_voc_practice',
          effects: [ { setFlag: { vocField: 'motor' } }, { addTrait: 'vocMotor' }, { statDelta: { strength: 2, confidence: 3, intelligence: -1, health: -1 } } ] },
        { label: '💻 Bilişim Teknolojileri',
          next: 'y2017_voc_practice',
          effects: [ { setFlag: { vocField: 'bilisim' } }, { addTrait: 'vocBilisim' }, { statDelta: { intelligence: 3, creativity: 2, health: -1, social: -1 } } ] },
      ]
    }),
    y2017_voc_practice: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2017–2018 · Staj ve Atölye</h2>
          <p>Pratik deneyim zamanı. Nasıl yaklaşıyorsun?</p>
          ${s.confidence >= 55 ? '<p class="stat-note">📊 Özgüvenin var — işyeri ortamında kendin olabilirsin.</p>' : ''}
        `,
        choices: [
          { label: '🏫 Okul atölyesinde derinleş',
            next: 'y2018_voc_outcome',
            effects: [ { statDelta: { intelligence: 2, discipline: 3, focus: 2, money: -50, social: -1 } } ] },
          { label: '🏭 İşyeri stajı (gerçek deneyim)',
            next: 'y2018_voc_outcome',
            effects: [ { statDelta: { confidence: 4, social: 2, money: 150, intelligence: -1 } } ] },
          { label: '💼 Çalış ve stajı paralel yürüt',
            next: 'y2018_voc_outcome',
            effects: [ { statDelta: { money: 300, confidence: 3, health: -2, focus: -1 } } ] },
        ]
      };
    },
    y2018_voc_outcome: (state) => ({
      text: `
        <h2>2018 · Mezuniyet — Yol Ayrımı</h2>
        <p>Alan: <strong>${state.data.flags.vocField || '—'}</strong>. Bundan sonra ne yapıyorsun?</p>
      `,
      choices: [
        { label: '💼 Hemen işe başla',
          next: 'y2019_trade_track',
          effects: [ { statDelta: { money: 500, confidence: 3, intelligence: -1 } } ] },
        { label: '🔧 Usta yanında çalış, kal',
          next: 'y2019_trade_track',
          effects: [ { statDelta: { confidence: 3, discipline: 3, money: -100 } } ] },
        { label: '📝 4 yıllık üniversite sınavı',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 3, discipline: 2, happiness: -2, money: -100 } } ] },
      ]
    }),
    // Askerî yol akışı
    y2018_military_choice: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2018 · Askerî Kariyer Kararı</h2>
          <p>Disiplinli, zorlu ama güvenceli bir yol. Hedefin?</p>
          ${s.health >= 70 ? '<p class="stat-note">💪 Güçlü sağlığınla yüksek rollere uygun adaysın.</p>' : ''}
        `,
        choices: [
          { label: '🔰 Kısa dönem / er',
            next: 'y2018_mil_branch',
            effects: [ { setFlag: { milPath: 'short' } }, { statDelta: { confidence: 2, discipline: 3, happiness: -2 } } ] },
          { label: '📋 Uzman çavuş sınavı',
            next: 'y2018_mil_branch',
            effects: [ { setFlag: { milPath: 'exam' } }, { statDelta: { intelligence: 3, discipline: 3, confidence: 1, happiness: -2, social: -1 } } ] },
          { label: '⭐ Subay hedefi',
            next: 'y2018_mil_branch',
            conditions: [ { statGte: { key: 'intelligence', value: 60 } } ],
            effects: [ { setFlag: { milPath: 'officer' } }, { statDelta: { intelligence: 3, confidence: 3, discipline: 2, happiness: -3, health: -1 } } ] },
          { label: '💥 Komando seçmesi',
            next: 'y2018_mil_branch',
            conditions: [ { statGte: { key: 'health', value: 65 } } ],
            effects: [ { setFlag: { milPath: 'commando' } }, { statDelta: { health: 4, endurance: 3, confidence: 3, happiness: -4, social: -2 } } ] },
        ]
      };
    },
    y2018_mil_branch: (state) => ({
      text: `
        <h2>2018 · Branş Seçimi</h2>
        <p>Her branş farklı beceriler — ve farklı bedeller.</p>
      `,
      choices: [
        { label: '✈️ Hava Kuvvetleri',
          next: 'y2019_military_training',
          effects: [ { setFlag: { milBranch: 'hava' } }, { statDelta: { intelligence: 2, focus: 2, social: -1 } } ] },
        { label: '🪖 Kara Kuvvetleri',
          next: 'y2019_military_training',
          effects: [ { setFlag: { milBranch: 'kara' } }, { statDelta: { strength: 2, endurance: 2, health: -1 } } ] },
        { label: '⚓ Deniz Kuvvetleri',
          next: 'y2019_military_training',
          effects: [ { setFlag: { milBranch: 'deniz' } }, { statDelta: { confidence: 2, agility: 2, happiness: -1 } } ] },
      ]
    }),
    y2019_military_training: (state) => ({
      text: `
        <h2>2019–2020 · Askerî Eğitim</h2>
        <p>Branş: <strong>${state.data.flags.milBranch || '—'}</strong>. Ne kadar itiyorsun?</p>
      `,
      choices: [
        { label: '🏃 Standart eğitim',
          next: 'y2020_military_service',
          effects: [ { statDelta: { health: 3, discipline: 3, happiness: -2 } } ] },
        { label: '📚 Branş kursu ekle',
          next: 'y2020_military_service',
          effects: [ { statDelta: { intelligence: 2, health: 2, discipline: 3, money: -100, social: -1 } } ] },
        { label: '💪 Yoğun kamp',
          next: 'y2020_military_service',
          effects: [ { statDelta: { health: 5, endurance: 4, happiness: -3 } } ] },
        { label: '👔 Sivil yola dön',
          next: 'y2024_career',
          effects: [ { statDelta: { confidence: -2, happiness: 2 } } ] },
      ]
    }),
    y2020_military_service: (state) => ({
      text: `
        <h2>2020–2021 · Görevlendirme</h2>
        <p>Branş: <strong>${state.data.flags.milBranch || '—'}</strong>. Görev türü seç.</p>
      `,
      choices: [
        { label: '🏠 Üs içi idari görev',
          next: 'y2022_military_outcome',
          effects: [ { statDelta: { confidence: 2, intelligence: 1, social: -1 } } ] },
        { label: '🛡️ Sınır görevi',
          next: 'y2022_military_outcome',
          effects: [ { statDelta: { health: 2, endurance: 2, confidence: 2, happiness: -2, social: -1 } } ] },
        { label: '📚 Uzmanlık kursu',
          next: 'y2022_military_outcome',
          effects: [ { statDelta: { intelligence: 3, discipline: 2, money: -100, social: -1 } } ] },
      ]
    }),
    y2022_military_outcome: (state) => ({
      text: `
        <h2>2022 · Askerî Kariyer Seçimi</h2>
        <p>Branş: <strong>${state.data.flags.milBranch || '—'}</strong>. Rütbe, uzmanlık ya da sektör değişikliği.</p>
      `,
      choices: [
        { label: '🎯 Görevde derinleş, uzman ol',
          next: 'y2026_growth',
          effects: [ { statDelta: { confidence: 3, discipline: 3, creativity: -1 } } ] },
        { label: '📚 Kurslar ve sertifikalar',
          next: 'y2026_growth',
          effects: [ { statDelta: { intelligence: 3, confidence: 2, money: -200, social: -1 } } ] },
        { label: '👔 Erken emekli, sivile geç',
          next: 'y2024_career',
          effects: [ { statDelta: { happiness: 2, confidence: -1 } } ] },
      ]
    }),
    // Sanat yolu
    y2016_artist_portfolio: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2016 · Güzel Sanatlar — Portföy</h2>
          <p>Hangi yönde ilerliyorsun?</p>
          ${s.creativity >= 65 ? '<p class="stat-note">🎨 Güçlü yaratıcılığın büyük sahne için iyi temel.</p>' : ''}
        `,
        choices: [
          { label: '🎼 Klasik eğitim (disiplinli)',
            next: 'y2017_artist_stage',
            effects: [ { statDelta: { discipline: 3, intelligence: 2, creativity: -1, happiness: -1 } } ] },
          { label: '🎭 Karma atölye & deneysel',
            next: 'y2017_artist_stage',
            effects: [ { statDelta: { creativity: 4, happiness: 4, confidence: 2, discipline: -2, money: -100 } } ] },
          { label: '🎪 Sokak performansı',
            next: 'y2017_artist_stage',
            effects: [ { statDelta: { confidence: 4, charisma: 3, happiness: 3, money: -50, discipline: -2 } } ] },
        ]
      };
    },
    y2017_artist_stage: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2017 · İlk Sahne Deneyimi</h2>
          <p>Sahneye çıkma fırsatı geldi.</p>
          ${s.confidence >= 60 ? '<p class="stat-note">📊 Özgüvenin yüksek — büyük sahneye cesaret edebilirsin.</p>' : ''}
        `,
        choices: [
          { label: '🎵 Küçük salon (güvenli)',
            next: 'y2018_artist_route',
            effects: [ { statDelta: { confidence: 3, happiness: 2, charisma: -1 } } ] },
          { label: '🎪 Yerel festival',
            next: 'y2018_artist_route',
            effects: [ { statDelta: { happiness: 4, confidence: 3, social: 2, money: -100 } } ] },
          { label: '🎭 Büyük sahne (yüksek risk)',
            next: 'y2018_artist_route',
            effects: [ { statDelta: { confidence: 5, charisma: 3, happiness: 2, health: -1, money: -200 } } ] },
          { label: '🎓 Güzel sanatlar üniversitesi',
            next: 'y2018_artist_route',
            conditions: [ { statGte: { key: 'creativity', value: 60 } } ],
            effects: [ { statDelta: { creativity: 3, money: -500 } } ] },
        ]
      };
    },
    y2018_artist_route: (state) => ({
      text: `
        <h2>2018 · Sanat Üniversitesi</h2>
        <p>Yaratıcı ortam. Nasıl finanse edersin?</p>
      `,
      choices: [
        { label: '🏆 Burs için portfolyo hazırla',
          next: 'y2019_uni_start',
          effects: [ { setFlag: { uniField: 'design' } }, { statDelta: { creativity: 4, confidence: 3, intelligence: 2, happiness: -2 } } ] },
        { label: '💰 Özel öde, tam özgürlük',
          next: 'y2019_uni_start',
          effects: [ { setFlag: { uniField: 'design' } }, { statDelta: { creativity: 5, happiness: 3, money: -1500 } } ] },
        { label: '📝 Üniversite sınavıyla gir',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 2, discipline: 2, happiness: -1 } } ] },
      ]
    }),
    // Çıraklık ve trade
    y2015_apprenticeship_start: (state) => ({
      text: `
        <h2>2015 · Çıraklık — Meslek Seçimi</h2>
        <p>Ustanın elinde öğreniyorsun. Hangi alan?</p>
      `,
      choices: [
        { label: '⚡ Elektrik tesisatı',
          next: 'y2016_apprenticeship_progress',
          effects: [ { addTrait: 'elektrikCirak' }, { statDelta: { intelligence: 3, confidence: 3, health: -1 } } ] },
        { label: '🪑 Mobilya & marangozluk',
          next: 'y2016_apprenticeship_progress',
          effects: [ { addTrait: 'mobilyaCirak' }, { statDelta: { creativity: 3, confidence: 3, discipline: 2, strength: -1 } } ] },
        { label: '🚗 Oto tamir & servis',
          next: 'y2016_apprenticeship_progress',
          effects: [ { addTrait: 'otoCirak' }, { statDelta: { strength: 3, confidence: 4, health: -2, intelligence: -1 } } ] },
      ]
    }),
    y2016_apprenticeship_progress: (state) => ({
      text: `
        <h2>2016–2018 · Ustalığa Doğru</h2>
        <p>Usta-çırak ilişkisi öğretici. Bir yol seç.</p>
      `,
      choices: [
        { label: '📜 Sertifika al, kalfalık belgesi hedefle',
          next: 'y2018_apprenticeship_outcome',
          effects: [ { statDelta: { confidence: 4, discipline: 3, money: -100 } } ] },
        { label: '💵 Yan iş al, para biriktir',
          next: 'y2018_apprenticeship_outcome',
          effects: [ { statDelta: { money: 350, health: -2, focus: -1 } } ] },
        { label: '🏪 Küçük dükkan denemesi',
          next: 'y2018_apprenticeship_outcome',
          effects: [ { setFlag: { smallBizTried: true } }, { statDelta: { money: -400, confidence: 5, happiness: -1 } } ] },
      ]
    }),
    y2018_apprenticeship_outcome: (state) => ({
      text: `
        <h2>2018 · Usta Yolunda İlerleme</h2>
        <p>Tecrübe ve güven gelişti. Şimdi ne yapıyorsun?</p>
      `,
      choices: [
        { label: '🔨 Meslekte devam, müşteri kazan',
          next: 'y2019_trade_track',
          effects: [ { statDelta: { money: 700, confidence: 3, intelligence: -1 } } ] },
        { label: '🏅 Ustalık belgesi için hazırlan',
          next: 'y2019_trade_track',
          effects: [ { statDelta: { confidence: 4, discipline: 2, money: -100 } } ] },
        { label: '🎓 Üniversiteye de hazırlan',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 2, money: -200 } } ] },
      ]
    }),
    y2019_trade_track: (state) => ({
      text: `
        <h2>2019 · Trade Kariyer</h2>
        <p>Müşteri, ekipman, dükkân.</p>
      `,
      choices: [
        { label: 'Usta yanında', next: 'y2020_trade_growth', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Ortaklık', next: 'y2020_trade_growth', effects: [ { statDelta: { money: -200, confidence: 2 } } ] },
        { label: 'Kendi dükkânın', next: 'y2020_trade_growth', effects: [ { statDelta: { money: -600, confidence: 3 } } ] }
      ]
    }),
    y2020_trade_growth: (state) => ({
      text: `
        <h2>2020 · Ticari Büyüme</h2>
        <p>Bakım, ekip ve yatırım.</p>
      `,
      choices: [
        { label: 'Kalite odaklı', next: 'y2022_trade_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Küçük ekip', next: 'y2022_trade_outcome', effects: [ { statDelta: { money: -200, social: 1 } } ] },
        { label: 'Büyük yatırım', next: 'y2022_trade_outcome', effects: [ { statDelta: { money: -1000, confidence: 2 } } ] }
      ]
    }),
    y2022_trade_outcome: (state) => ({
      text: `
        <h2>2022 · Trade Sonuç</h2>
        <p>İşin oturdu.</p>
      `,
      choices: [
        { label: 'Ölçekle', next: 'y2024_trade_scale', effects: [ { statDelta: { money: 1200, confidence: 2 } } ] },
        { label: 'Kurumsala geç', next: 'y2024_career' },
        { label: 'Yurt dışı ara', next: 'y2027_travel' }
      ]
    }),
    y2024_trade_scale: (state) => ({
      text: `
        <h2>2024 · Ölçekleme</h2>
        <p>Şube/E-ticaret/Marka.</p>
      `,
      choices: [
        { label: 'E-ticaret', next: 'y2025_outcome', effects: [ { statDelta: { money: 800 } } ] },
        { label: 'Küçük şube', next: 'y2025_outcome', effects: [ { statDelta: { money: -400, confidence: 2 } } ] },
        { label: 'Hızlı büyüme', next: 'y2025_outcome', effects: [ { statDelta: { money: -1500, confidence: 3 } } ] }
      ]
    }),
    y2016_projects: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2016–2018 · Lise Yılları</h2>
          <p>Hem akademik hem sosyal fırsatlar var. Zamanını nasıl şekillendirirsin?</p>
          ${s.focus >= 55 ? '<p class="stat-note">📊 İyi odak seviyenle proje liderliğine uygunsun.</p>' : ''}
        `,
        choices: [
          { label: '🔬 Bilim projesi ve olimpiyatlar',
            next: 'y2016_proj_science',
            effects: [ { statDelta: { intelligence: 8, focus: 4, confidence: 3, social: -3, happiness: -2 } } ] },
          { label: '🤝 Öğrenci konseyi & sosyal proje',
            next: 'y2016_proj_social',
            effects: [ { statDelta: { social: 8, charisma: 4, confidence: 3, intelligence: -2, focus: -2 } } ] },
          { label: '🏅 Spor takımı & turnuvalar',
            next: 'y2016_proj_sport',
            effects: [ { statDelta: { health: 8, endurance: 4, confidence: 3, intelligence: -2, focus: -1 } }, { numberDelta: { training: 1 } } ] },
          { label: '🎨 Sanat / tiyatro kulübü',
            next: 'y2018_uni_exam',
            conditions: [ { statGte: { key: 'creativity', value: 45 } } ],
            effects: [ { statDelta: { creativity: 7, social: 3, happiness: 4, discipline: -2, intelligence: -1 } } ] },
        ]
      };
    },
    y2016_proj_science: (state) => ({
      text: `
        <h2>2016 · Bilim Projesi</h2>
        <p>Hangi yönde derinleşiyorsun?</p>
      `,
      choices: [
        { label: '🧪 Deney tasarımı',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 4, discipline: 2, focus: 2, social: -1 } } ] },
        { label: '🎤 Sunum ve konferans',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { confidence: 4, charisma: 2, focus: 1, intelligence: -1 } } ] },
        { label: '👥 Uluslararası takım projesi',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { social: 3, intelligence: 2, confidence: 2, discipline: -1 } } ] },
      ]
    }),
    y2016_proj_social: (state) => ({
      text: `
        <h2>2016 · Sosyal Sorumluluk</h2>
        <p>Hangi alana odaklanıyorsun?</p>
      `,
      choices: [
        { label: '🌱 Çevre ve sürdürülebilirlik',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { empathy: 3, social: 3, happiness: 2, discipline: -1 } } ] },
        { label: '📚 Gönüllü eğitim ve öğretmenlik',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 2, social: 3, confidence: 2, empathy: 2 } } ] },
        { label: '🤲 Yardım kampanyaları',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { empathy: 4, social: 2, happiness: 3, money: -100 } } ] },
      ]
    }),
    y2016_proj_sport: (state) => ({
      text: `
        <h2>2016 · Spor Turnuvası</h2>
        <p>Sahada güçleniyorsun.</p>
      `,
      choices: [
        { label: '🏋️ Profesyonel antrenman',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { health: 4, endurance: 3, discipline: 2, intelligence: -1 } }, { numberDelta: { training: 2 } } ] },
        { label: '🧠 Taktik ve video analizi',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { intelligence: 2, focus: 2, confidence: 2 } }, { numberDelta: { training: 1 } } ] },
        { label: '🤝 Takım dayanışması',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { social: 3, confidence: 3, health: 2 } }, { numberDelta: { training: 1 } } ] },
      ]
    }),
    y2018_uni_exam: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2018 · Üniversite Sınavı</h2>
          <p>YKS hazırlık stratejin sıralamanda fark yaratacak.</p>
          ${s.intelligence >= 70
            ? '<p class="stat-note">📊 Güçlü zekânla yoğun çalışma çok verimli olur.</p>'
            : s.discipline >= 60
            ? '<p class="stat-note">📊 Disiplinin var — düzenli çalışma sistematik ilerleme sağlar.</p>'
            : '<p class="stat-note">📊 Denge kur — hem çalış hem kendine bak.</p>'}
        `,
        choices: [
          { label: '🔥 Yoğun çalış, üst hedef',
            next: 'y2019_uni_start',
            effects: [ { statDelta: { intelligence: 12, discipline: 5, happiness: -5, health: -3, social: -3 } } ] },
          { label: '⚖️ Dengeli hazırlan',
            next: 'y2019_uni_start',
            effects: [ { statDelta: { intelligence: 7, social: 2, happiness: -1, focus: -1 } } ] },
          { label: '😌 Kısıtlı çalış',
            next: 'y2019_uni_start',
            effects: [ { statDelta: { happiness: 3, social: 2, intelligence: -3, discipline: -2 } } ] },
          { label: '📅 Gap year (ara yıl)',
            next: 'y2018_gap_year',
            effects: [ { statDelta: { happiness: 3, confidence: 2, intelligence: -1 } } ] },
        ]
      };
    },
    y2018_gap_year: (state) => ({
      text: `
        <h2>2018 · Ara Yıl</h2>
        <p>Sınav baskısından uzak bir yıl. Nasıl kullanıyorsun?</p>
      `,
      choices: [
        { label: '✈️ Yurt dışı deneyimi',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { confidence: 4, social: 3, happiness: 4, money: -500 } }, { numberDelta: { travelCount: 1 } } ] },
        { label: '💼 Staj / çalışma',
          next: 'y2018_uni_exam',
          effects: [ { statDelta: { confidence: 4, money: 600, health: -1 } } ] },
        { label: '📚 Sadece hazırlan',
          next: 'y2019_uni_start',
          effects: [ { statDelta: { intelligence: 8, discipline: 4, happiness: -3, social: -2 } } ] },
      ]
    }),
    y2019_uni_start: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2019 · Üniversite — Bölüm Seçimi</h2>
          <p>Yeni şehir, yeni özgürlük. Her bölümün kazancı ve bedeli farklı.</p>
          ${s.intelligence >= 68
            ? '<p class="stat-note">📊 Güçlü zekânla teknik bölümler için çok uygun adaysın.</p>'
            : ''}
        `,
        choices: [
          { label: '⚙️ Mühendislik / Bilgisayar',
            next: 'y2019_uni_life',
            conditions: [ { statGte: { key: 'intelligence', value: 58 } } ],
            effects: [ { setFlag: { uniField: 'stem' } }, { statDelta: { intelligence: 5, focus: 3, social: -3, happiness: -2, money: -300 } } ] },
          { label: '📊 İktisat / İşletme',
            next: 'y2019_uni_life',
            effects: [ { setFlag: { uniField: 'econ' } }, { statDelta: { social: 4, confidence: 2, intelligence: -1, focus: -1 } } ] },
          { label: '🏛️ Mimarlık / Tasarım',
            next: 'y2019_uni_life',
            conditions: [ { statGte: { key: 'creativity', value: 48 } } ],
            effects: [ { setFlag: { uniField: 'design' } }, { statDelta: { creativity: 5, focus: 3, money: -400, happiness: -2 } } ] },
        ]
      };
    },
    y2019_uni_life: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2019 · Kampüs Yaşamı</h2>
          <p>Ders dışında zamanını nasıl şekillendirirsin?</p>
          ${s.discipline >= 60
            ? '<p class="stat-note">📊 Disiplinin güçlü — yoğun program sana ağır gelmez.</p>'
            : '<p class="stat-note">📊 Kampüs özgürlüğü dikkatini dağıtabilir; rutin kur.</p>'}
        `,
        choices: [
          { label: '📅 Yurt + katı çalışma planı',
            next: 'y2019_uni_check',
            effects: [ { statDelta: { discipline: 4, focus: 3, happiness: -2, social: -2 } } ] },
          { label: '💼 Part-time iş',
            next: 'y2019_uni_check',
            effects: [ { statDelta: { money: 500, confidence: 3, discipline: 1, happiness: -1, focus: -2 } } ] },
          { label: '🤝 Kulüpler & sosyal hayat',
            next: 'y2019_uni_check',
            effects: [ { statDelta: { social: 5, charisma: 2, happiness: 3, discipline: -2, focus: -2 } } ] },
        ]
      };
    },
    y2019_uni_check: (state) => ({
      text: `
        <h2>2019 · Kabul Kontrolü</h2>
        <p>Bölüm gereksinimlerine göre değerlendiriliyorsun…</p>
      `,
      choices: [
        { label: 'Sonucu gör',
          next: (state) => {
            const s = state.data.stats; const f = state.data.flags.uniField;
            let score = 0, threshold = 0;
            if (f === 'stem') { score = Math.round(s.intelligence*0.55 + s.focus*0.25 + s.discipline*0.2); threshold = 62; }
            else if (f === 'design') { score = Math.round(s.creativity*0.55 + s.confidence*0.25 + s.focus*0.2); threshold = 58; }
            else { score = Math.round(s.intelligence*0.4 + s.social*0.35 + s.confidence*0.25); threshold = 52; }
            return score >= threshold ? 'y2020_pandemic' : 'y2019_uni_prep';
          } },
        { label: '🔄 Bölüm değiştir',
          next: 'y2019_change_major' },
        { label: '📚 Hazırlık kampı (ücretli)',
          next: 'y2019_uni_prep',
          effects: [ { statDelta: { money: -400, focus: 2, discipline: 2, intelligence: 2 } } ] },
      ]
    }),
    y2019_change_major: (state) => ({
      text: `
        <h2>2019 · Bölüm Değiştirme</h2>
        <p>Yeteneklerine daha uygun bir alana yöneliyorsun.</p>
      `,
      choices: [
        { label: '⚙️ Mühendislik / STEM',
          next: 'y2019_uni_check',
          effects: [ { setFlag: { uniField: 'stem' } }, { addTrait: 'multiDisciplinary' }, { statDelta: { confidence: 1, intelligence: 1 } } ] },
        { label: '🎨 Tasarım / Sanat',
          next: 'y2019_uni_check',
          effects: [ { setFlag: { uniField: 'design' } }, { addTrait: 'multiDisciplinary' }, { statDelta: { happiness: 2, creativity: 1 } } ] },
        { label: '📊 İktisadi / İdari',
          next: 'y2019_uni_check',
          effects: [ { setFlag: { uniField: 'econ' } }, { addTrait: 'multiDisciplinary' }, { statDelta: { social: 1 } } ] },
      ]
    }),
    y2019_uni_prep: (state) => ({
      text: `
        <h2>2019 · Hazırlık Desteği</h2>
        <p>Eşiğin biraz altındasın. Ne yapıyorsun?</p>
      `,
      choices: [
        { label: '📖 Etüt ve mentorluk',
          next: 'y2020_pandemic',
          effects: [ { statDelta: { intelligence: 3, focus: 3, discipline: 2, money: -200, social: -1 } } ] },
        { label: '👥 Çalışma grubu',
          next: 'y2020_pandemic',
          effects: [ { statDelta: { social: 3, confidence: 2, focus: 2, intelligence: -1 } } ] },
        { label: '💪 Tek başıma hallederim',
          next: 'y2020_pandemic',
          effects: [ { statDelta: { confidence: 3, intelligence: 1, happiness: -1 } } ] },
      ]
    }),
    y2020_pandemic: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2020 · Pandemi — Herkes Evde</h2>
          <p>Dünya durdu. Uzaktan eğitim, belirsizlik. Nasıl geçiriyorsun?</p>
          ${s.discipline >= 60
            ? '<p class="stat-note">📊 Disiplinin güçlü — evde bile üretken kalabilirsin.</p>'
            : '<p class="stat-note">📊 Ev ortamı odaklanmayı zorlaştırıyor.</p>'}
        `,
        choices: [
          { label: '📅 Günlük rutin, üretken kal',
            next: 'y2020_pandemic_schedule',
            effects: [ { statDelta: { intelligence: 5, discipline: 4, confidence: 3, happiness: -3, social: -4 } } ] },
          { label: '👨‍👩‍👧 Aile bağlarını güçlendir',
            next: 'y2020_pandemic_family',
            effects: [ { statDelta: { happiness: 6, empathy: 3, social: 4, intelligence: -2, discipline: -2 } } ] },
          { label: '🤝 Gönüllülük ve topluma destek',
            next: 'y2020_pandemic_volunteer',
            effects: [ { statDelta: { social: 6, empathy: 4, confidence: 3, money: -200, health: -1 } } ] },
          { label: '🎨 Yeni beceri öğren (online)',
            next: 'y2021_remote_intern',
            effects: [ { statDelta: { creativity: 4, intelligence: 3, social: -3, happiness: -2 } } ] },
        ]
      };
    },
    y2020_pandemic_schedule: (state) => ({
      text: `
        <h2>2020 · Günlük Plan</h2>
        <p>Planı nasıl uygularsın?</p>
      `,
      choices: [
        { label: '🍅 Pomodoro tekniği',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { focus: 4, discipline: 2, happiness: -1 } } ] },
        { label: '👥 Online çalışma grubu',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { social: 3, confidence: 2, focus: 1 } } ] },
        { label: '🧘 Derin çalışma blokları',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { focus: 3, discipline: 3, intelligence: 2, social: -2 } } ] },
      ]
    }),
    y2020_pandemic_family: (state) => ({
      text: `
        <h2>2020 · Aile Zamanı</h2>
        <p>Evde birlikte ne yaparsınız?</p>
      `,
      choices: [
        { label: '🍳 Birlikte yemek ve sohbet',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { happiness: 3, empathy: 2, social: 2 } } ] },
        { label: '📚 Aile okuma/öğrenme saatleri',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { intelligence: 2, focus: 1, happiness: 2, empathy: 1 } } ] },
        { label: '🏠 Ev düzeni ve sorumluluk paylaşımı',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { discipline: 3, empathy: 2, confidence: 1, happiness: -1 } } ] },
      ]
    }),
    y2020_pandemic_volunteer: (state) => ({
      text: `
        <h2>2020 · Gönüllülük</h2>
        <p>Nerede katkı sağlarsın?</p>
      `,
      choices: [
        { label: '🚛 Lojistik ve dağıtım',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { endurance: 2, empathy: 2, confidence: 2, health: -1 } } ] },
        { label: '💻 Online mentorluk',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { social: 3, intelligence: 2, confidence: 2 } } ] },
        { label: '📣 Farkındalık kampanyası',
          next: 'y2021_remote_intern',
          effects: [ { statDelta: { social: 2, charisma: 2, confidence: 2, money: -50 } } ] },
      ]
    }),
    y2021_remote_intern: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2021 · İlk Profesyonel Adım</h2>
          <p>Pandemi sonrası fırsatlar geliyor. Ne yapıyorsun?</p>
          ${s.confidence >= 60
            ? '<p class="stat-note">📊 Özgüvenin güçlü — teklifi değerlendir.</p>'
            : ''}
        `,
        choices: [
          { label: '💼 Uzaktan stajı kabul et',
            next: 'y2021_branch_intern',
            effects: [ { statDelta: { confidence: 5, money: 600, health: -2, happiness: -1 } } ] },
          { label: '📜 Sertifika programı',
            next: 'y2021_branch_cert',
            effects: [ { statDelta: { intelligence: 6, confidence: 3, money: -300, social: -2 } } ] },
          { label: '💻 Freelance proje üstlen',
            next: 'y2021_branch_intern',
            effects: [ { statDelta: { money: 700, confidence: 4, creativity: 2, health: -2, social: -2 } } ] },
          { label: '🛌 Dinlen ve toparlan',
            next: 'y2021_branch_rest',
            effects: [ { addTrait: 'sabirli' }, { statDelta: { happiness: 5, health: 4, intelligence: -2, money: -200 } } ] },
        ]
      };
    },
    y2021_branch_intern: (state) => ({
      text: `
        <h2>2021 · Staj Süreci</h2>
        <p>Çalışma tarzını nasıl şekillendiriyorsun?</p>
      `,
      choices: [
        { label: '🧑‍🏫 Mentor bul, derin öğren',
          next: 'y2022_economy',
          effects: [ { statDelta: { social: 2, confidence: 3, intelligence: 2, money: -50 } } ] },
        { label: '🎯 Görev odaklı, sonuç getir',
          next: 'y2022_economy',
          effects: [ { statDelta: { discipline: 3, confidence: 2, focus: 2, happiness: -1 } } ] },
        { label: '🤝 Ağ kur, bağlantılar oluştur',
          next: 'y2022_economy',
          effects: [ { statDelta: { social: 4, charisma: 2, confidence: 2, focus: -1 } } ] },
      ]
    }),
    y2021_branch_cert: (state) => ({
      text: `
        <h2>2021 · Sertifika Programı</h2>
        <p>Hangi seviyede ilerliyorsun?</p>
      `,
      choices: [
        { label: '📗 Temel sertifika',
          next: 'y2022_economy',
          effects: [ { statDelta: { intelligence: 2, confidence: 1 } } ] },
        { label: '📘 Orta seviye uzmanlık',
          next: 'y2022_economy',
          effects: [ { statDelta: { intelligence: 4, focus: 2, money: -100 } } ] },
        { label: '📕 İleri uzmanlık (yoğun)',
          next: 'y2022_economy',
          effects: [ { statDelta: { intelligence: 6, discipline: 2, focus: 2, happiness: -2, money: -200 } } ] },
      ]
    }),
    y2021_branch_rest: (state) => ({
      text: `
        <h2>2021 · Öz Bakım Dönemi</h2>
        <p>Duraksadın. Nasıl değerlendiriyorsun?</p>
      `,
      choices: [
        { label: '🧘 Meditasyon ve nefes',
          next: 'y2022_economy',
          effects: [ { statDelta: { health: 4, happiness: 4, focus: 2, social: -1, intelligence: -1 } } ] },
        { label: '🏃 Spor rutini kur',
          next: 'y2022_economy',
          effects: [ { statDelta: { health: 6, endurance: 4, confidence: 3, intelligence: -1 } } ] },
        { label: '📚 Yeniden öğrenmeye başla',
          next: 'y2022_economy',
          effects: [ { statDelta: { intelligence: 4, confidence: 3, happiness: -2 } } ] },
      ]
    }),
    y2022_economy: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2022 · Enflasyon Gerçeği</h2>
          <p>Maliyetler tırmandı. Bütçe yönetimi artık bir beceri.</p>
          ${s.money >= 500
            ? '<p class="stat-note">💰 Birikiminle birkaç seçeneği değerlendirebilirsin.</p>'
            : '<p class="stat-note">📊 Sıkışık bütçeyle yaratıcı çözümler zorunlu.</p>'}
        `,
        choices: [
          { label: '✂️ Giderleri optimize et',
            next: 'y2022_path_optimize',
            effects: [ { statDelta: { discipline: 3, confidence: 2, happiness: -3, social: -2 } } ] },
          { label: '💼 Ek gelir kaynağı bul',
            next: 'y2022_path_freelance',
            effects: [ { statDelta: { money: 900, confidence: 4, health: -2, happiness: -2 } } ] },
          { label: '👨‍👩‍👧 Aile desteği al',
            next: 'y2022_path_support2',
            conditions: [ { traitIncludes: 'babaSevgisi' } ],
            effects: [ { statDelta: { money: 700, happiness: 3, confidence: -2 } } ] },
          { label: '📈 Birikimi değerlendir',
            next: 'y2023_volunteer',
            conditions: [ { flagEquals: { key: 'savingsDiscipline', value: true } } ],
            effects: [ { statDelta: { money: 600, confidence: 3, social: -1 } } ] },
        ]
      };
    },
    y2022_path_optimize: (state) => ({
      text: `
        <h2>2022 · Tasarruf Stratejisi</h2>
        <p>Hangi kalemleri kısıyorsun?</p>
      `,
      choices: [
        { label: '🏠 Paylaşımlı konut',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 300, social: 1, happiness: -1 } } ] },
        { label: '🚌 Ulaşım optimizasyonu',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 200, discipline: 2 } } ] },
        { label: '🛒 Gıda planlaması',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 150, discipline: 3, creativity: 1 } } ] },
      ]
    }),
    y2022_path_support2: (state) => ({
      text: `
        <h2>2022 · Aile Desteği</h2>
        <p>Destek kaynağını nasıl kullanıyorsun?</p>
      `,
      choices: [
        { label: '📚 Eğitim yatırımı',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { intelligence: 3, confidence: 1, money: -100 } } ] },
        { label: '🏥 Sağlık ve psikolojik destek',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { health: 3, happiness: 3, confidence: 2 } } ] },
        { label: '🤝 Sosyal aktiviteler',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { social: 3, happiness: 3, charisma: 1 } } ] },
      ]
    }),
    y2022_path_freelance: (state) => ({
      text: `
        <h2>2022 · Ek Gelir Stratejisi</h2>
        <p>Hangi tarz işler alıyorsun?</p>
      `,
      choices: [
        { label: '⚡ Kısa ve hızlı işler',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 400, agility: 1, focus: -1 } } ] },
        { label: '📋 Uzun vadeli kontrat',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 700, discipline: 2, focus: 1, happiness: -1 } } ] },
        { label: '🚀 Proje tabanlı, uzmanlık alanı',
          next: 'y2023_volunteer',
          effects: [ { statDelta: { money: 550, intelligence: 2, confidence: 2 } } ] },
      ]
    }),
    y2023_volunteer: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2023 · Dayanışma Yılı</h2>
          <p>Toplumsal kırılma. Katkı sağlamak istiyorsan, her yolun farklı bir bedeli var.</p>
          ${s.empathy >= 60
            ? '<p class="stat-note">📊 Yüksek empatinle sahada çok daha etkili olursun.</p>'
            : ''}
        `,
        choices: [
          { label: '🤲 Sahaya in, gönüllü çalış',
            next: 'y2023_path_vol',
            effects: [ { statDelta: { social: 7, empathy: 4, confidence: 4, happiness: 3, money: -200, health: -2 } } ] },
          { label: '💳 Maddi destek ver',
            next: 'y2023_path_donate',
            conditions: [ { statGte: { key: 'money', value: 200 } } ],
            effects: [ { statDelta: { happiness: 3, money: -250, social: -1 } } ] },
          { label: '💻 Uzaktan organizasyon',
            next: 'y2023_path_remote',
            effects: [ { statDelta: { intelligence: 3, social: 4, confidence: 2, happiness: -1, money: -50 } } ] },
        ]
      };
    },
    y2023_path_vol: (state) => ({
      text: `
        <h2>2023 · Sahada</h2>
        <p>Hangi görevde yer alıyorsun?</p>
      `,
      choices: [
        { label: '🚛 Lojistik ve dağıtım',
          next: 'y2024_career',
          effects: [ { statDelta: { endurance: 2, empathy: 2, confidence: 2, health: -1 } } ] },
        { label: '📋 Koordinasyon ve yönetim',
          next: 'y2024_career',
          effects: [ { statDelta: { social: 3, charisma: 2, confidence: 3, intelligence: 1 } } ] },
        { label: '🧠 Psikososyal destek',
          next: 'y2024_career',
          effects: [ { statDelta: { empathy: 4, social: 2, happiness: 2, health: -1 } } ] },
      ]
    }),
    y2023_path_donate: (state) => ({
      text: `
        <h2>2023 · Maddi Destek</h2>
        <p>Hangi alana katkı sağlıyorsun?</p>
      `,
      choices: [
        { label: '📚 Eğitim fonları',
          next: 'y2024_career',
          effects: [ { statDelta: { happiness: 2, intelligence: 1, money: -100 } } ] },
        { label: '🏥 Sağlık ve acil yardım',
          next: 'y2024_career',
          effects: [ { statDelta: { happiness: 3, empathy: 2, money: -150 } } ] },
        { label: '🏠 Barınma projeleri',
          next: 'y2024_career',
          effects: [ { statDelta: { happiness: 2, empathy: 2, social: 1, money: -100 } } ] },
      ]
    }),
    y2023_path_remote: (state) => ({
      text: `
        <h2>2023 · Uzaktan Organizasyon</h2>
        <p>Hangi rol üstleniyorsun?</p>
      `,
      choices: [
        { label: '📣 İletişim ve medya',
          next: 'y2024_career',
          effects: [ { statDelta: { social: 3, charisma: 2, creativity: 1 } } ] },
        { label: '📊 Kaynak planlama',
          next: 'y2024_career',
          effects: [ { statDelta: { intelligence: 2, focus: 2, discipline: 1 } } ] },
        { label: '💰 Bağış ve fon geliştirme',
          next: 'y2024_career',
          effects: [ { statDelta: { confidence: 2, social: 2, charisma: 1 } } ] },
      ]
    }),
    y2024_career: (state) => {
      const s = state.data.stats; const f = state.data.flags; const t = state.data.traits || [];
      const hint = f.uniField === 'stem' && s.intelligence >= 65
        ? '<p class="stat-note">⭐ STEM geçmişin + zekânla kurumsal teknik roller açık.</p>'
        : f.uniField === 'design'
        ? '<p class="stat-note">🎨 Tasarım geçmişin yaratıcı sektörlerde avantaj sağlıyor.</p>'
        : t.includes('sabirli')
        ? '<p class="stat-note">📊 Sabırlı yapın uzun vadeli kariyer yatırımlarına uygun.</p>'
        : '';
      return {
        text: `
          <h2>2024 · Kariyer Kavşağı</h2>
          <p>Birikimler ve deneyim şekillendi. Asıl yol başlıyor. Her seçenek farklı bir bedel taşıyor.</p>
          ${hint}
        `,
        choices: [
          { label: '🏢 Kurumsal şirkete gir',
            next: 'y2024_corp_path',
            effects: [ { statDelta: { money: 1800, discipline: 2, confidence: 2, creativity: -2, happiness: -2 } } ] },
          { label: '🚀 Start-up kur ya da katıl',
            next: 'y2024_startup_path',
            effects: [ { setFlag: { startupTrack: true } }, { statDelta: { confidence: 6, creativity: 3, money: -500, happiness: -1 } } ] },
          { label: '🎓 Akademiye yönel',
            next: 'y2024_acad_path',
            conditions: [ { statGte: { key: 'intelligence', value: 68 } } ],
            effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 4, confidence: 3, money: -1000 } } ] },
          { label: '🌍 Yurt dışı kariyer hedefle',
            next: 'y2024_corp_path',
            conditions: [ { statGte: { key: 'confidence', value: 60 } } ],
            effects: [ { setFlag: { abroadAccepted: true } }, { statDelta: { confidence: 4, social: 3, intelligence: 2, money: -800, happiness: -2 } } ] },
        ]
      };
    },
    y2024_corp_path: (state) => ({
      text: `
        <h2>2024 · Kurumsal Yol</h2>
        <p>İşe giriş stratejisi. Hangi avantajı öne çıkarıyorsun?</p>
      `,
      choices: [
        { label: '📄 CV + referans ağı',
          next: 'y2025_outcome',
          effects: [ { statDelta: { confidence: 2, social: 2, money: 1400 } } ] },
        { label: '🏅 Sertifika ile güçlendir',
          next: 'y2025_outcome',
          effects: [ { statDelta: { intelligence: 2, confidence: 2, money: 1000, happiness: -1 } } ] },
        { label: '🤝 Networking ve referans',
          next: 'y2025_outcome',
          effects: [ { statDelta: { social: 4, charisma: 2, confidence: 2, money: 1200 } } ] },
      ]
    }),
    y2024_startup_path: (state) => ({
      text: `
        <h2>2024 · Start-up Yolu</h2>
        <p>Ürün-piyasa uyumu. İlk adım nerede?</p>
      `,
      choices: [
        { label: '🛠️ Hızlı MVP çıkar, test et',
          next: 'y2025_outcome',
          effects: [ { statDelta: { confidence: 4, creativity: 3, intelligence: 2, money: -300, health: -2 } } ] },
        { label: '👥 Ortak bul, takım kur',
          next: 'y2025_outcome',
          effects: [ { statDelta: { social: 4, confidence: 3, creativity: -1, money: -100 } } ] },
        { label: '🏛️ İnkübasyon programına gir',
          next: 'y2025_outcome',
          effects: [ { statDelta: { intelligence: 3, confidence: 3, social: 2, money: 500 } } ] },
      ]
    }),
    y2024_acad_path: (state) => ({
      text: `
        <h2>2024 · Akademi Yolu</h2>
        <p>Araştırma, yayın, tez. Uzun yol — ama kalıcı etki.</p>
      `,
      choices: [
        { label: '📄 Yayın / konferans bildirisi',
          next: 'y2025_outcome',
          effects: [ { statDelta: { intelligence: 4, confidence: 3, social: -1 } } ] },
        { label: '🔬 Araştırma asistanlığı',
          next: 'y2025_outcome',
          effects: [ { statDelta: { intelligence: 3, money: 400, confidence: -1 } } ] },
        { label: '🌍 Yurt dışı yüksek lisans başvurusu',
          next: 'y2025_outcome',
          conditions: [ { statGte: { key: 'intelligence', value: 68 } } ],
          effects: [ { addTrait: 'englishB2' }, { statDelta: { confidence: 5, intelligence: 3, money: -600, happiness: -2 } } ] },
      ]
    }),
    y2025_outcome: (state) => {
      const s = state.data.stats; const f = state.data.flags; const t = state.data.traits || [];
      const pathNote = f.milBranch ? `🎖️ ${f.milBranch} kuvvetleri`
        : f.uniField === 'stem' ? '⚙️ Teknik / Mühendislik'
        : f.uniField === 'design' ? '🎨 Tasarım / Sanat'
        : f.startupFunded ? '🚀 Girişimci'
        : f.academiaTrack ? '🎓 Akademisyen'
        : t.includes('athlete') ? '🏅 Sporcu' : '🌿 Genel Kariyer';
      return {
        text: `
          <h2>2025 · 25 Yaşında</h2>
          <p>${pathNote} — beş yılı geride bıraktın.</p>
          <p class="muted">💰 Para: <strong>${s.money >= 0 ? '+' : ''}${s.money}₺</strong> ·
          🌍 Seyahat: <strong>${(state.data.numbers && state.data.numbers.travelCount) || 0}</strong> ·
          🏋️ Antrenman: <strong>${(state.data.numbers && state.data.numbers.training) || 0}</strong></p>
          <p><strong>Özellikler:</strong> ${t.length ? t.join(' · ') : '—'}</p>
        `,
        choices: [
          { label: '→ 2026–2030 dönemine geç', next: 'y2026_growth' },
          { label: '🔄 Yeniden başla', next: 'intro' },
        ]
      };
    },
    y2026_growth: (state) => {
      const s = state.data.stats; const f = state.data.flags; const t = state.data.traits || [];
      return {
        text: `
          <h2>2026 · Gelişim & Uzmanlaşma</h2>
          <p>Otuzlu yılların eşiğinde. Derinleşme zamanı — ama her yolun bedeli var.</p>
          ${s.health >= 68 ? '<p class="stat-note">💪 Sağlıklı bedeninle spor yolunda ciddi hedefler koyabilirsin.</p>' : ''}
          ${s.confidence >= 65 ? '<p class="stat-note">📊 Yüksek özgüvenin girişimcilik için uygun.</p>' : ''}
          ${s.intelligence >= 68 ? '<p class="stat-note">🎓 Güçlü zekânla akademi veya mühendislik yolunda ilerleyebilirsin.</p>' : ''}
        `,
        choices: [
          { label: '🏆 Spor — ulusal hedef',
            next: 'y2027_sports',
            conditions: [ { statGte: { key: 'health', value: 55 } } ],
            effects: [ { addTrait: 'athlete' }, { statDelta: { health: 3, confidence: 2, intelligence: -1, social: -1 } } ] },
          { label: '🚀 Girişim — MVP geliştir',
            next: 'y2027_startup',
            conditions: [ { statGte: { key: 'confidence', value: 55 } } ],
            effects: [ { setFlag: { startupTrack: true } }, { statDelta: { creativity: 2, money: -200 } } ] },
          { label: '🎓 Akademi — lisansüstü',
            next: 'y2027_academia',
            conditions: [ { statGte: { key: 'intelligence', value: 62 } } ],
            effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 3, social: -2, money: -300 } } ] },
          { label: '🌍 Dünyayı keşfet',
            next: 'y2027_travel',
            effects: [ { statDelta: { happiness: 4, social: 2, money: -300, discipline: -1 } } ] },
          { label: '💰 Servet yolu',
            next: 'y2026_wealth_intro' },
          { label: '🏥 Tıp yolu',
            next: 'y2026_med_intro',
            conditions: [ { statGte: { key: 'intelligence', value: 60 } } ] },
          { label: '⚙️ Mühendislik yolu',
            next: 'y2026_eng_intro',
            conditions: [ { statGte: { key: 'intelligence', value: 58 } } ] },
          { label: '🏛️ Mimarlık yolu',
            next: 'y2026_arch_intro',
            conditions: [ { statGte: { key: 'creativity', value: 50 } } ] },
          { label: '🌐 Dış Ticaret yolu',
            next: 'y2026_trade_intro' },
        ]
      };
    },
    // İthalat/İhracat hedefi
    y2026_trade_intro: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2026 · Dış Ticaret Planı</h2>
          <p>Pazar, tedarikçi ve teslim şekilleri.</p>
          ${s.intelligence >= 62 ? '<p class="stat-note">📊 Analitik zekânla piyasa araştırması güçlü silahın.</p>' : ''}
          ${s.social >= 60 ? '<p class="stat-note">🤝 Sosyal ağın tedarikçi ilişkilerinde avantaj sağlar.</p>' : ''}
        `,
        choices: [
          { label: '🔍 Pazar araştırması',
            next: 'y2027_trade_ops',
            effects: [ { statDelta: { intelligence: 3, focus: 2 } } ] },
          { label: '🤝 Tedarikçi ilişkileri kur',
            next: 'y2027_trade_ops',
            effects: [ { statDelta: { social: 3, confidence: 2 } } ] },
          { label: '💰 Finansman ve ihracat desteği',
            next: 'y2027_trade_ops',
            effects: [ { statDelta: { confidence: 2, intelligence: 1, money: 200 } } ] },
        ]
      };
    },
    y2027_trade_ops: (state) => ({
      text: `
        <h2>2027 · Operasyon</h2>
        <p>INCOTERMS ve ödeme yöntemi seç.</p>
      `,
      choices: [
        { label: '🟢 FOB + LC (güvenli)',
          next: 'y2028_trade_case',
          effects: [ { statDelta: { money: -500, discipline: 2 } } ] },
        { label: '🟡 CIF + CAD (dengeli)',
          next: 'y2028_trade_case',
          effects: [ { statDelta: { money: -300, confidence: 1 } } ] },
        { label: '🔴 EXW + TT (riskli)',
          next: 'y2028_trade_case',
          effects: [ { statDelta: { money: -200, confidence: 2 } } ] },
      ]
    }),
    y2028_trade_case: (state) => ({
      text: `
        <h2>Dış Ticaret Vaka</h2>
        <p>${(() => { try { const pool = require('./tradeCases').default; const idx = Math.floor(Math.random()*pool.length); const c = pool[idx]; state.data.numbers.tradeCaseIdx = idx; return c.stem; } catch(_) { return 'Vaka yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2028_trade_result', effects: [ { numberDelta: { tradeCaseChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2028_trade_result', effects: [ { numberDelta: { tradeCaseChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2028_trade_result', effects: [ { numberDelta: { tradeCaseChoice: 2 } } ] }
      ]
    }),
    y2028_trade_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>${(() => { try { const pool = require('./tradeCases').default; const c = pool[state.data.numbers.tradeCaseIdx || 0]; const ok = (state.data.numbers.tradeCaseChoice||0) === c.correct; const fx = Math.round((Math.random()*0.2 - 0.1) * 1000); const nav = Math.round((Math.random()*0.3 - 0.15)*800); const base = ok?600:-400; const delta = base + fx + nav; state.data.stats.money += delta; return (ok?'Doğru':'Yanlış') + ' · Kâr/Zarar: ' + delta; } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni vaka', next: 'y2028_trade_case' },
        { label: '2030 değerlendirme', next: 'y2030_outcome' },
        { label: 'Yol ayrımına dön', next: 'y2026_growth' }
      ]
    }),
    // Mimar ol hedefi
    y2026_arch_intro: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2026 · Mimarlık Planı</h2>
          <p>Kavramsal tasarım ve uygulama.</p>
          ${s.creativity >= 65 ? '<p class="stat-note">🏛️ Güçlü yaratıcılığın yarışma ve stüdyo için avantaj.</p>' : ''}
        `,
        choices: [
          { label: '🎨 Stüdyo projesi',
            next: 'y2027_arch_studio',
            effects: [ { statDelta: { creativity: 2, intelligence: 1 } } ] },
          { label: '🏗️ Şantiye deneyimi',
            next: 'y2027_arch_site',
            effects: [ { statDelta: { discipline: 2, confidence: 1 } } ] },
          { label: '🏆 Ulusal/uluslararası yarışma',
            next: 'y2027_arch_comp',
            effects: [ { statDelta: { creativity: 2, confidence: 1 } } ] },
        ]
      };
    },
    y2027_arch_studio: (state) => ({
      text: `
        <h2>2027 · Mimarlık Stüdyosu</h2>
        <p>Konsept belirliyorsun.</p>
      `,
      choices: [
        { label: '🌱 Sürdürülebilir tasarım',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { creativity: 3, intelligence: 2, social: 1 } } ] },
        { label: '◻️ Minimalist yaklaşım',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { focus: 3, discipline: 2, creativity: 1 } } ] },
        { label: '🖥️ Parametrik/dijital tasarım',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { intelligence: 3, creativity: 2, focus: 2 } } ] },
      ]
    }),
    y2027_arch_site: (state) => ({
      text: `
        <h2>2027 · Şantiye Deneyimi</h2>
        <p>Detay ve uygulama öğreniyorsun.</p>
      `,
      choices: [
        { label: '📐 Detay çizim ve teknik dokümantasyon',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { discipline: 3, intelligence: 2, focus: 2 } } ] },
        { label: '🧱 Malzeme seçimi ve tedarik',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { social: 2, intelligence: 2, confidence: 1 } } ] },
        { label: '📊 Keşif–metraj ve maliyet',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { intelligence: 3, discipline: 2 } } ] },
      ]
    }),
    y2027_arch_comp: (state) => ({
      text: `
        <h2>2027 · Tasarım Yarışması</h2>
        <p>Brief'e uygun tasarım sunuyorsun.</p>
      `,
      choices: [
        { label: '💡 Güçlü konsept odağı',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { creativity: 4, confidence: 2, focus: 1 } } ] },
        { label: '🤝 İşbirlikçi ekip tasarımı',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { social: 3, creativity: 2, confidence: 2 } } ] },
        { label: '🎤 Etkileyici sunum',
          next: 'y2028_arch_cases',
          effects: [ { statDelta: { confidence: 3, charisma: 2, social: 1 } } ] },
      ]
    }),
    y2028_arch_cases: (state) => ({
      text: `
        <h2>Mimarlık Vaka/Problem</h2>
        <p>${(() => { try { const pool = require('./archCases').default; const idx = Math.floor(Math.random()*pool.length); const c = pool[idx]; state.data.numbers.archCaseIdx = idx; return c.stem; } catch(_) { return 'Vaka yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2028_arch_cases_result', effects: [ { numberDelta: { archCaseChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2028_arch_cases_result', effects: [ { numberDelta: { archCaseChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2028_arch_cases_result', effects: [ { numberDelta: { archCaseChoice: 2 } } ] }
      ]
    }),
    y2028_arch_cases_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>${(() => { try { const pool = require('./archCases').default; const c = pool[state.data.numbers.archCaseIdx || 0]; const ok = (state.data.numbers.archCaseChoice||0) === c.correct; return (ok?'Doğru':'Yanlış'); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni problem', next: 'y2028_arch_cases', effects: [ (() => { const ok = (()=>{ try { const pool = require('./archCases').default; const c = pool[state.data.numbers.archCaseIdx || 0]; return (state.data.numbers.archCaseChoice||0) === c.correct; } catch(_) { return false } })(); return { statDelta: { confidence: ok?1:-1 } }; })() ] },
        { label: 'Yol ayrımına dön', next: 'y2026_growth' },
        { label: '2030 değerlendirme', next: 'y2030_outcome' }
      ]
    }),
    // Mühendis ol hedefi
    y2026_eng_intro: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2026 · Mühendislik Planı</h2>
          <p>Uzmanlaşma ve proje hedefi.</p>
          ${s.intelligence >= 70 ? '<p class="stat-note">⚙️ Güçlü zekânla ileri teknik rollere uygunsun.</p>' : ''}
        `,
        choices: [
          { label: '🔀 Alan seç (Yazılım/Elektrik/Mekanik)',
            next: 'y2026_eng_field' },
          { label: '💼 Staj / iş bul',
            next: 'y2027_eng_intern',
            effects: [ { statDelta: { confidence: 2, money: 300 } } ] },
          { label: '📜 Sertifika / konferans',
            next: 'y2027_eng_cert',
            effects: [ { statDelta: { intelligence: 2, focus: 1 } } ] },
        ]
      };
    },
    y2026_eng_field: (state) => ({
      text: `
        <h2>2026 · Mühendislik Alanı</h2>
        <p>Hangi alanda uzmanlaşıyorsun?</p>
      `,
      choices: [
        { label: '💻 Yazılım Mühendisliği',
          next: 'y2027_eng_intern',
          effects: [ { setFlag: { engField: 'soft' } }, { statDelta: { intelligence: 3, creativity: 2, social: -1 } } ] },
        { label: '⚡ Elektrik Mühendisliği',
          next: 'y2027_eng_intern',
          effects: [ { setFlag: { engField: 'elec' } }, { statDelta: { intelligence: 3, focus: 2, health: -1 } } ] },
        { label: '🔧 Mekanik Mühendisliği',
          next: 'y2027_eng_intern',
          effects: [ { setFlag: { engField: 'mech' } }, { statDelta: { strength: 2, intelligence: 2, discipline: 2 } } ] },
      ]
    }),
    y2027_eng_intern: (state) => ({
      text: `
        <h2>2027 · Staj / İş</h2>
        <p>Alan: <strong>${state.data.flags.engField || '—'}</strong>. Deneyim kazanıyorsun.</p>
      `,
      choices: [
        { label: '🏢 Kurumsal şirkette staj',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { confidence: 3, discipline: 2, money: 300 } } ] },
        { label: '🚀 Start-up ortamı',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { social: 2, creativity: 2, confidence: 2, money: 200 } } ] },
        { label: '🔬 Araştırma laboratuvarı',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { intelligence: 3, focus: 2, social: -1 } } ] },
      ]
    }),
    y2027_eng_cert: (state) => ({
      text: `
        <h2>2027 · Sertifika / Konferans</h2>
        <p>Alanına özel sertifika hedefin.</p>
      `,
      choices: [
        { label: '☁️ Bulut / DevOps (AWS, GCP)',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { intelligence: 3, confidence: 2, money: -400 } } ] },
        { label: '🔌 Gömülü / PCB tasarımı',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { intelligence: 3, focus: 2, money: -300 } } ] },
        { label: '🖥️ CAD / Simülasyon',
          next: 'y2028_eng_project',
          effects: [ { statDelta: { intelligence: 2, focus: 3, creativity: 1, money: -300 } } ] },
      ]
    }),
    y2028_eng_project: (state) => ({
      text: `
        <h2>2028 · Mühendislik Projesi</h2>
        <p>Alan: <strong>${state.data.flags.engField || '—'}</strong>. Alanına uygun bir proje tamamla.</p>
      `,
      choices: [
        { label: '🟢 Bilinen çözüm (güvenli)',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { confidence: 2, intelligence: 1 } } ] },
        { label: '🟡 Optimize et (dengeli)',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { intelligence: 3, focus: 2, confidence: 2 } } ] },
        { label: '🔴 Yeni yaklaşım (riskli)',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { confidence: 4, creativity: 3, intelligence: 2, health: -1 } } ] },
        { label: '📚 Uygulama sınavı çöz',
          next: 'y2028_eng_cases' },
      ]
    }),
    y2028_eng_cases: (state) => ({
      text: `
        <h2>Mühendislik Vaka/Problem</h2>
        <p>${(() => { try { const f = state.data.flags.engField || 'soft'; const pool = f==='soft'?require('./engCases_soft').default: f==='elec'?require('./engCases_elec').default: require('./engCases_civil').default; const idx = Math.floor(Math.random()*pool.length); const c = pool[idx]; state.data.numbers.engCaseIdx = idx; return c.stem; } catch(_) { return 'Vaka yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2028_eng_cases_result', effects: [ { numberDelta: { engCaseChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2028_eng_cases_result', effects: [ { numberDelta: { engCaseChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2028_eng_cases_result', effects: [ { numberDelta: { engCaseChoice: 2 } } ] }
      ]
    }),
    y2028_eng_cases_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>${(() => { try { const f = state.data.flags.engField || 'soft'; const pool = f==='soft'?require('./engCases_soft').default: f==='elec'?require('./engCases_elec').default: require('./engCases_civil').default; const c = pool[state.data.numbers.engCaseIdx || 0]; const ok = (state.data.numbers.engCaseChoice||0) === c.correct; return (ok?'Doğru':'Yanlış'); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni problem', next: 'y2028_eng_cases', effects: [ (() => { const ok = (()=>{ try { const f = state.data.flags.engField || 'soft'; const pool = f==='soft'?require('./engCases_soft').default: f==='elec'?require('./engCases_elec').default: require('./engCases_civil').default; const c = pool[state.data.numbers.engCaseIdx || 0]; return (state.data.numbers.engCaseChoice||0) === c.correct; } catch(_) { return false } })(); return { statDelta: { confidence: ok?1:-1 } }; })() ] },
        { label: 'Projeye dön', next: 'y2028_eng_project' },
        { label: 'Tekliflere geç', next: 'y2029_eng_offer' }
      ]
    }),
    y2029_eng_offer: (state) => ({
      text: `
        <h2>2029 · İş Teklifleri</h2>
        <p>Alan: <strong>${state.data.flags.engField || '—'}</strong>. İş görüşmeleri başlıyor.</p>
      `,
      choices: [
        { label: '🎯 Teknik mülakat',
          next: (state) => {
            const s = state.data.stats;
            const score = Math.round(s.intelligence*0.6 + s.focus*0.2 + s.confidence*0.2);
            return score >= 70 ? 'y2030_eng_eval' : 'y2029_eng_retry';
          } },
        { label: '🤝 Ağ üzerinden fırsat',
          next: 'y2030_eng_eval',
          effects: [ { statDelta: { social: 2, confidence: 2, money: 800 } } ] },
        { label: '🌍 Yurt dışı başvur',
          next: 'y2030_eng_eval',
          effects: [ { setFlag: { abroadAccepted: true } }, { statDelta: { confidence: 3, money: -200 } }, { numberDelta: { travelCount: 1 } } ] },
      ]
    }),
    y2029_eng_retry: (state) => ({
      text: `
        <h2>2029 · Tekrar Deneme</h2>
        <p>Mülakat başarısız. Eksik nerede?</p>
      `,
      choices: [
        { label: '🧮 Algoritma ve veri yapıları çalış',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { intelligence: 3, focus: 2 } } ] },
        { label: '🎤 Mock interview pratiği',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { confidence: 3, social: 1 } } ] },
        { label: '📁 Portföy ve GitHub güncelle',
          next: 'y2029_eng_offer',
          effects: [ { statDelta: { confidence: 2, creativity: 2 } } ] },
      ]
    }),
    y2030_eng_eval: (state) => ({
      text: `
        <h2>2030 · Mühendislik Kariyer Değerlendirmesi</h2>
        <p>Alan: <strong>${state.data.flags.engField || '—'}</strong> · Kariyer oturdu.</p>
      `,
      choices: [
        { label: '🎯 Hedefi değerlendir', next: 'goal_eval' },
        { label: '→ Final sahnesine geç', next: 'y2030_outcome' },
      ]
    }),
    // Doktor ol hedefi
    y2026_med_intro: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2026 · Tıp Yolculuğu</h2>
          <p>Hekimlikte ilerlemek için plan yap.</p>
          ${s.intelligence >= 72 ? '<p class="stat-note">🧠 Güçlü zekânla TUS başarısı için iyi zemin.</p>' : ''}
          ${s.empathy >= 65 ? '<p class="stat-note">❤️ Yüksek empatinle hasta iletişiminde öne çıkarsın.</p>' : ''}
        `,
        choices: [
          { label: '📚 TUS hazırlığı',
            next: 'y2027_tus_prep',
            effects: [ { statDelta: { intelligence: 3, discipline: 3, focus: 3, happiness: -2, social: -2 } } ] },
          { label: '🏥 Klinik rotasyonlar',
            next: 'y2027_clinical_rot',
            effects: [ { statDelta: { empathy: 3, confidence: 2, intelligence: 1 } } ] },
          { label: '🌍 Araştırma / gönüllülük',
            next: 'y2027_med_vol',
            effects: [ { statDelta: { intelligence: 2, social: 2, empathy: 2, money: -200 } } ] },
        ]
      };
    },
    y2027_tus_prep: (state) => ({
      text: `
        <h2>2027 · TUS Hazırlığı</h2>
        <p>Uzmanlık sınavı için iki yıl çalışma. Hazırlık yöntemi?</p>
      `,
      choices: [
        { label: '🎓 Kurs + soru bankası',
          next: 'y2028_tus_exam',
          effects: [ { statDelta: { money: -800, intelligence: 4, focus: 2, discipline: 2, happiness: -2 } } ] },
        { label: '👥 Çalışma grubu',
          next: 'y2028_tus_exam',
          effects: [ { statDelta: { social: 2, intelligence: 2, discipline: 2, focus: 1 } } ] },
        { label: '💪 Tek başıma yoğun çalış',
          next: 'y2028_tus_exam',
          effects: [ { statDelta: { intelligence: 3, discipline: 3, confidence: 1, social: -3, happiness: -2 } } ] },
      ]
    }),
    y2028_tus_exam: (state) => ({
      text: `
        <h2>2028 · TUS Sınavı</h2>
        <p>Uzmanlık sınavı günü geldi.</p>
      `,
      choices: [
        { label: '📝 Sonucu gör',
          next: (state) => {
            const s = state.data.stats;
            const score = Math.round(s.intelligence*0.5 + s.discipline*0.3 + s.focus*0.2);
            return score >= 75 ? 'y2029_residency_start' : 'y2028_tus_retry';
          } },
      ]
    }),
    y2028_tus_retry: (state) => ({
      text: `
        <h2>2028 · TUS Tekrar</h2>
        <p>İlk deneme yetmedi. Nasıl devam?</p>
      `,
      choices: [
        { label: '🔥 Yoğun tekrar (kurs)',
          next: 'y2028_tus_exam',
          effects: [ { statDelta: { intelligence: 3, discipline: 4, money: -500, happiness: -2 } } ] },
        { label: '🏥 Klinik deneyim kazan',
          next: 'y2027_clinical_rot',
          effects: [ { statDelta: { empathy: 2, confidence: 1 } } ] },
        { label: '🔄 Farklı bir yol seç',
          next: 'y2026_growth',
          effects: [ { statDelta: { confidence: -1, happiness: 2 } } ] },
      ]
    }),
    y2027_clinical_rot: (state) => ({
      text: `
        <h2>2027 · Klinik Rotasyonlar</h2>
        <p>Hangi birimde derinleşiyorsun?</p>
      `,
      choices: [
        { label: '🚨 Acil tıp',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { confidence: 3, health: -1, happiness: -1 } } ] },
        { label: '🩺 Dahiliye',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { intelligence: 2, discipline: 1, empathy: 1 } } ] },
        { label: '👶 Pediatri',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { empathy: 3, social: 2, happiness: 1 } } ] },
      ]
    }),
    y2027_med_vol: (state) => ({
      text: `
        <h2>2027 · Gönüllü Sağlık</h2>
        <p>Kaynak kısıtlı bölgede kısa görev.</p>
      `,
      choices: [
        { label: '🤲 Sahada yardım',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { empathy: 3, confidence: 2, health: -1 } } ] },
        { label: '📚 Sağlık eğitimi ver',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { social: 2, intelligence: 2, confidence: 1 } } ] },
        { label: '📦 Tıbbi malzeme organizasyonu',
          next: 'y2028_case_rng',
          effects: [ { statDelta: { social: 2, discipline: 2 } } ] },
      ]
    }),
    y2028_case_rng: (state) => ({
      text: `
        <h2>2028 · Vaka</h2>
        <p>Rastgele klinik vaka sonuçları.</p>
      `,
      choices: [
        { label: 'Vaka oluştur', next: 'y2028_case_present' }
      ]
    }),
    y2028_case_present: (state) => ({
      text: `
        <h2>Klinik Vaka</h2>
        <p>${(() => { try { const list = require('./medCases').default; const idx = Math.floor(Math.random()*list.length); const c = list[idx]; state.data.numbers.caseIdx = idx; return c.stem; } catch(_) { return 'Vaka yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Tanı koy', next: 'y2028_case_dx' },
        { label: 'Ek tetkik iste (riskli gecikme)', next: 'y2028_case_dx', effects: [ { statDelta: { confidence: -1 } } ] },
        { label: 'Kıdemliye danış', next: 'y2028_case_dx', effects: [ { statDelta: { social: 1 } } ] }
      ]
    }),
    y2028_case_dx: (state) => ({
      text: `
        <h2>Ön Tanı</h2>
        <p>${(() => { try { const list = require('./medCases').default; const c = list[state.data.numbers.caseIdx || 0]; return 'Seçenekler: ' + c.dxOps.join(', '); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2028_case_tx', effects: [ { numberDelta: { caseDxChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2028_case_tx', effects: [ { numberDelta: { caseDxChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2028_case_tx', effects: [ { numberDelta: { caseDxChoice: 2 } } ] }
      ]
    }),
    y2028_case_tx: (state) => ({
      text: `
        <h2>Tedavi</h2>
        <p>${(() => { try { const list = require('./medCases').default; const c = list[state.data.numbers.caseIdx || 0]; return 'Seçenekler: ' + c.txOps.join(', '); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek A', next: 'y2028_case_result', effects: [ { numberDelta: { caseTxChoice: 0 } } ] },
        { label: 'Seçenek B', next: 'y2028_case_result', effects: [ { numberDelta: { caseTxChoice: 1 } } ] },
        { label: 'Seçenek C', next: 'y2028_case_result', effects: [ { numberDelta: { caseTxChoice: 2 } } ] }
      ]
    }),
    y2028_case_result: (state) => ({
      text: `
        <h2>Vaka Sonucu</h2>
        <p>${(() => { try { const list = require('./medCases').default; const c = list[state.data.numbers.caseIdx || 0]; const dxOk = (state.data.numbers.caseDxChoice||0) === c.dxCorrect; const txOk = (state.data.numbers.caseTxChoice||0) === c.txCorrect; const s = state.data.stats; let pts = 0; if (dxOk) pts += 15; if (txOk) pts += 15; pts += Math.round(s.intelligence*0.2 + s.focus*0.1 + s.discipline*0.1 + s.empathy*0.1); state.data.numbers.lastCase = pts; return 'Skor: ' + pts + ' (Tanı ' + (dxOk?'doğru':'yanlış') + ', Tedavi ' + (txOk?'doğru':'yanlış') + ')'; } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni vaka', next: 'y2028_case_present', effects: [ (() => { const o = state.data.numbers.lastCase || 0; if (o >= 80) return { statDelta: { confidence: 2, happiness: 1 } }; if (o >= 60) return { statDelta: { confidence: 1 } }; return { statDelta: { happiness: -1 } }; })() ] },
        { label: 'TUS sınavına dön', next: 'y2028_tus_exam' },
        { label: 'Tıp yoluna dön', next: 'y2026_med_intro' }
      ]
    }),
    y2029_residency_start: (state) => ({
      text: `
        <h2>2029 · Uzmanlık Asistanlığı</h2>
        <p>Nöbet, etik ve eğitim dengesi. Nasıl öncelik kuruyorsun?</p>
      `,
      choices: [
        { label: '⏰ Nöbet ağırlıklı (daha fazla gelir)',
          next: 'y2030_med_eval',
          effects: [ { statDelta: { money: 1000, health: -3, happiness: -2 } } ] },
        { label: '📚 Eğitim ağırlıklı (uzmanlık)',
          next: 'y2030_med_eval',
          effects: [ { statDelta: { intelligence: 4, confidence: 3, money: -200 } } ] },
        { label: '⚖️ Dengeli yaklaşım',
          next: 'y2030_med_eval',
          effects: [ { statDelta: { confidence: 2, intelligence: 2, health: -1, money: 400 } } ] },
      ]
    }),
    y2030_med_eval: (state) => ({
      text: `
        <h2>2030 · Tıp Kariyer Değerlendirmesi</h2>
        <p>Uzman hekim yolundasın.</p>
      `,
      choices: [
        { label: '🎯 Hedefi değerlendir', next: 'goal_eval' },
        { label: '→ Final sahnesine geç', next: 'y2030_outcome' },
      ]
    }),
    // Servet hedefi yolu
    y2026_wealth_intro: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2026 · Servet Stratejisi</h2>
          <p>Yüksek servete ulaşmak için bir strateji belirlemelisin.</p>
          ${s.money >= 1000 ? '<p class="stat-note">💰 Mevcut birikiminle yatırım seçeneğin açık.</p>' : '<p class="stat-note">📊 Önce düzenli gelir oluştur, sonra yatır.</p>'}
        `,
        choices: [
          { label: '✂️ Bütçe disiplini',
            next: 'y2026_wealth_strategy',
            effects: [ { statDelta: { discipline: 3, focus: 2, happiness: -1 } } ] },
          { label: '💼 Kariyeri büyüt',
            next: 'y2027_wealth_career',
            effects: [ { statDelta: { confidence: 2, social: 1 } } ] },
          { label: '📈 Yatırıma başla',
            next: 'y2027_wealth_invest',
            effects: [ { statDelta: { intelligence: 2, focus: 1 } } ] },
        ]
      };
    },
    y2026_wealth_strategy: (state) => ({
      text: `
        <h2>2026 · Finansal Plan</h2>
        <p>İzlenecek ana yol?</p>
      `,
      choices: [
        { label: '💼 Kariyeri büyüt',
          next: 'y2027_wealth_career' },
        { label: '📈 Yatırıma başla',
          next: 'y2027_wealth_invest' },
        { label: '🎲 Şans Zarı Çek',
          next: (st) => { st.setFlag('returnScene', 'y2026_wealth_strategy'); return 'game_dice_intro'; } },
        { label: '🃏 21 Kart Oyunu',
          next: (st) => { st.setFlag('returnScene', 'y2026_wealth_strategy'); return 'game_bj_intro'; } },
        { label: '🃏 Pişti Oyna',
          next: (st) => { st.setFlag('returnScene', 'y2026_wealth_strategy'); return 'game_pisti_intro'; } },
      ]
    }),
    y2027_wealth_career: (state) => ({
      text: `
        <h2>2027 · Kariyer Büyütme</h2>
        <p>Geliri nasıl artırırsın?</p>
      `,
      choices: [
        { label: '🤝 Maaş pazarlığı',
          next: (state) => {
            const gain = state.data.stats.confidence >= 60 ? 800 : 400;
            state.data.stats.money += gain;
            state.data.stats.confidence += 1;
            return 'y2028_wealth_business';
          } },
        { label: '💻 Yan iş kur',
          next: 'y2028_wealth_business',
          effects: [ { statDelta: { money: 700, focus: -1, health: -1 } } ] },
        { label: '✈️ Taşın ve fırsat kovala',
          next: (state) => {
            const win = Math.random() < 0.5;
            state.data.stats.money += win ? 1200 : -600;
            state.data.stats.confidence += 2;
            state.data.stats.social += 1;
            return 'y2028_wealth_business';
          } },
        { label: '🏦 Kredi çek (kaldıraç)',
          next: 'y2027_wealth_credit' },
      ]
    }),
    y2027_wealth_credit: (state) => ({
      text: `
        <h2>2027 · Kredi</h2>
        <p>Kaldıraç için kredi kullanıyorsun. Geri ödeme planını yap.</p>
      `,
      choices: [
        { label: '🟢 Makul tutar',
          next: 'y2028_wealth_business',
          effects: [ { setFlag: { loanInterest: true } }, { statDelta: { money: 1000, discipline: 1 } } ] },
        { label: '🟡 Orta tutar',
          next: 'y2028_wealth_business',
          effects: [ { setFlag: { loanInterest: true } }, { statDelta: { money: 1600, happiness: -1 } } ] },
        { label: '🔴 Yüksek kaldıraç',
          next: 'y2028_wealth_business',
          effects: [ { setFlag: { loanInterest: true } }, { statDelta: { money: 2500, happiness: -2, health: -1 } } ] },
      ]
    }),
    y2027_wealth_invest: (state) => ({
      text: `
        <h2>2027 · Yatırım</h2>
        <p>Risk profilini seç. Şans faktörü devreye giriyor.</p>
      `,
      choices: [
        { label: '🟢 Güvenli (endeks/mevduat)',
          next: (state) => {
            const s = state.data.stats;
            const stake = Math.max(200, Math.round(s.money * 0.2));
            const pct = (Math.random() * 0.10 - 0.02) + (s.luck - 50) / 200;
            s.money += Math.round(stake * pct);
            return 'y2028_wealth_business';
          } },
        { label: '🟡 Dengeli (fon/gayrimenkul)',
          next: (state) => {
            const s = state.data.stats;
            const stake = Math.max(300, Math.round(s.money * 0.3));
            const pct = (Math.random() * 0.30 - 0.10) + (s.luck - 50) / 150;
            s.money += Math.round(stake * pct);
            return 'y2028_wealth_business';
          } },
        { label: '🔴 Riskli (kaldıraç/kripto)',
          next: (state) => {
            const s = state.data.stats;
            const stake = Math.max(400, Math.round(s.money * 0.4));
            const pct = (Math.random() * 1.00 - 0.40) + (s.luck - 50) / 100;
            const delta = Math.round(stake * pct);
            s.money += delta;
            s.happiness += delta >= 0 ? 1 : -2;
            return 'y2028_wealth_business';
          } },
      ]
    }),
    y2028_wealth_business: (state) => ({
      text: `
        <h2>2028 · İş Ölçekleme</h2>
        <p>Hangi yoldan büyürsün?</p>
      `,
      choices: [
        { label: '🏪 Küçük işletme',
          next: (state) => {
            const base = Math.max(300, Math.round(state.data.stats.money * 0.1));
            const delta = Math.round(base * (Math.random() * 0.40 - 0.10));
            state.data.stats.money += delta;
            if (delta > 0) state.data.stats.confidence += 1;
            return 'y2028_wealth_shocks';
          } },
        { label: '🏬 Franchise',
          next: (state) => {
            const gain = Math.random() < 0.7 ? 600 : 0;
            state.data.stats.money += -1200 + gain;
            return 'y2028_wealth_shocks';
          } },
        { label: '🛒 E-ticaret (riskli ölçek)',
          next: (state) => {
            const delta = 500 + Math.round((Math.random() * 2 - 0.8) * 800);
            state.data.stats.money += delta;
            return 'y2028_wealth_shocks';
          } },
        { label: '🛡️ Acil durum fonu ayır',
          next: 'y2028_wealth_emergency' },
      ]
    }),
    y2028_wealth_emergency: (state) => ({
      text: `
        <h2>2028 · Acil Durum Fonu</h2>
        <p>Beklenmedik giderlere karşı yastık oluştur.</p>
      `,
      choices: [
        { label: '🟢 3 aylık gider (500₺)',
          next: 'y2028_wealth_shocks',
          effects: [ { setFlag: { emergencyFund: true } }, { statDelta: { money: -500, discipline: 2 } } ] },
        { label: '🟡 6 aylık gider (900₺)',
          next: 'y2028_wealth_shocks',
          effects: [ { setFlag: { emergencyFund: true } }, { statDelta: { money: -900, confidence: 2, happiness: 1 } } ] },
        { label: '❌ Şimdi vazgeç',
          next: 'y2028_wealth_shocks' },
      ]
    }),
    y2028_wealth_shocks: (state) => ({
      text: `
        <h2>2028 · Piyasa Şokları</h2>
        <p>Piyasa dalgalandı. Durumunu değerlendir.</p>
      `,
      choices: [
        { label: '📊 Devam et (bekle)',
          next: (state) => {
            const swing = Math.round((Math.random() * 2 - 1) * 600);
            state.data.stats.money += swing;
            return 'y2029_wealth_tax';
          } },
        { label: '🛡️ Sigorta / hedge',
          next: 'y2029_wealth_tax',
          effects: [ { statDelta: { money: -200, confidence: 1 } } ] },
        { label: '🔥 Risk artır',
          next: (state) => {
            state.data.stats.money += Math.round((Math.random() - 0.4) * 1200);
            return 'y2029_wealth_tax';
          } },
      ]
    }),
    y2029_wealth_tax: (state) => ({
      text: `
        <h2>2029 · Vergi ve Uyum</h2>
        <p>Finansal yıl kapanışı. Vergi stratejin?</p>
      `,
      choices: [
        { label: '✅ Tam uyum',
          next: 'y2029_wealth_manage',
          effects: [ { statDelta: { money: -200, discipline: 1 } } ] },
        { label: '🧮 Yasal optimizasyon',
          next: 'y2029_wealth_manage',
          effects: [ { statDelta: { money: -100, confidence: 1, intelligence: 1 } } ] },
        { label: '⚠️ Kısayol dene (riskli)',
          next: (state) => {
            const win = Math.random() < 0.4;
            state.data.stats.money += win ? 400 : -600;
            state.data.stats.confidence -= 1;
            return 'y2029_wealth_manage';
          } },
      ]
    }),
    y2029_wealth_manage: (state) => ({
      text: `
        <h2>2029 · Servet Yönetimi</h2>
        <p>Portföy ve risk ayarı.</p>
      `,
      choices: [
        { label: '🏦 Borç yönetimi',
          next: (state) => {
            if (state.data.flags.loanInterest) state.data.stats.money -= 400;
            else state.data.stats.confidence += 1;
            return 'y2030_wealth_eval';
          } },
        { label: '🛡️ Sigorta ile koru',
          next: 'y2030_wealth_eval',
          effects: [ { setFlag: { insured: true } }, { statDelta: { money: -200, confidence: 2 } } ] },
        { label: '📊 Portföyü çeşitlendir',
          next: (state) => {
            state.data.stats.money += Math.round((Math.random() * 0.4 - 0.1) * 1000);
            return 'y2030_wealth_eval';
          } },
        { label: '🎰 Şüpheli yüksek getiri (risk)',
          next: (state) => {
            state.data.stats.money += Math.round((Math.random() * 2 - 1.2) * 1500);
            return 'y2030_wealth_eval';
          } },
      ]
    }),
    y2030_wealth_eval: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2030 · Servet Değerlendirmesi</h2>
          <p>Para: <strong>${s.money >= 0 ? '+' : ''}${s.money}₺</strong></p>
          <p>${s.money >= 5000 ? '🏆 Hedef çok yakın!' : s.money >= 2000 ? '📈 İyi ilerleme.' : '📊 Daha yol var.'}</p>
        `,
        choices: [
          { label: '🎯 Hedefi değerlendir', next: 'goal_eval' },
          { label: '→ Final sahnesine geç', next: 'y2030_outcome' },
          { label: '🔄 Başa dön', next: 'intro' },
        ]
      };
    },
    // Mini-oyun: Zar (tek/çift)
    game_dice_intro: (state) => ({
      text: `
        <h2>Zar Oyunu</h2>
        <p>Tek/Çift üzerine 100 birim bahis yap.</p>
      `,
      choices: [
        { label: 'Tek', next: 'game_dice_result', effects: [ { numberDelta: { diceBet: 1, diceStake: 100 } } ] },
        { label: 'Çift', next: 'game_dice_result', effects: [ { numberDelta: { diceBet: 0, diceStake: 100 } } ] },
        { label: 'Vazgeç', next: (st) => st.data.flags.returnScene || 'y2026_wealth_strategy' }
      ]
    }),
    game_dice_result: (state) => ({
      text: `
        <h2>Zar Sonucu</h2>
        <p>${(() => { const roll = Math.floor(Math.random()*6)+1; state.data.numbers.lastRoll = roll; return 'Atılan zar: ' + roll; })()}</p>
      `,
      choices: [
        { label: 'Kazanç/kayıp uygula', next: (st) => {
          const roll = st.data.numbers.lastRoll || 1; const odd = roll % 2; const bet = st.data.numbers.diceBet || 0; const stake = st.data.numbers.diceStake || 100;
          const win = (odd === bet); st.data.stats.money += win ? stake : -stake;
          return 'game_dice_after';
        } }
      ]
    }),
    game_dice_after: (state) => ({
      text: `
        <h2>Zar Oyunu</h2>
        <p>Devam etmek ister misin?</p>
      `,
      choices: [
        { label: 'Tekrar oyna', next: 'game_dice_intro' },
        { label: 'Çık', next: (st) => st.data.flags.returnScene || 'y2026_wealth_strategy' },
        { label: 'Servet planına dön', next: 'y2026_wealth_strategy' }
      ]
    }),

    // Mini-oyun: Blackjack (21)
    game_bj_intro: (state) => ({
      text: `
        <h2>Blackjack (21)</h2>
        <p>Bahis miktarını seç.</p>
      `,
      choices: [
        { label: '100', next: 'game_bj_deal', effects: [ { numberDelta: { bjBet: 100 } } ] },
        { label: '200', next: 'game_bj_deal', effects: [ { numberDelta: { bjBet: 200 } } ] },
        { label: '500', next: 'game_bj_deal', effects: [ { numberDelta: { bjBet: 500 } } ] }
      ]
    }),
    game_bj_deal: (state) => ({
      text: `
        <h2>Dağıtım</h2>
        <p>İlk kartlar dağıtılıyor…</p>
      `,
      choices: [
        { label: 'Devam', next: () => {
          // iki kart toplamlarını basitçe üret
          const draw = () => Math.max(2, Math.min(11, Math.floor(Math.random()*11)+1));
          const p = draw() + draw();
          const d = draw() + draw();
          state.data.numbers.bjPlayer = p;
          state.data.numbers.bjDealer = d;
          return 'game_bj_turn';
        } }
      ]
    }),
    game_bj_turn: (state) => ({
      text: `
        <h2>Blackjack</h2>
        <p>Oyuncu: ${state.data.numbers.bjPlayer || 0} · Dağıtıcı: ${Math.min(11, (state.data.numbers.bjDealer || 0))}+?</p>
      `,
      choices: [
        { label: 'Kart çek (Hit)', next: () => {
          const add = Math.max(1, Math.min(11, Math.floor(Math.random()*11)+1));
          const cur = state.data.numbers.bjPlayer || 0; const next = cur + add;
          state.data.numbers.bjPlayer = next;
          if (next > 21) return 'game_bj_result';
          return 'game_bj_turn';
        } },
        { label: 'Bekle (Stand)', next: () => {
          let d = state.data.numbers.bjDealer || 0;
          while (d < 17) { d += Math.max(1, Math.min(11, Math.floor(Math.random()*11)+1)); }
          state.data.numbers.bjDealer = d;
          return 'game_bj_result';
        } },
        { label: 'Çiftle (Double)', next: () => {
          // Bahsi iki katla, bir kart çek, sonucu değerlendir
          const bet = (state.data.numbers.bjBet || 100) * 2; state.data.numbers.bjBet = bet;
          const add = Math.max(1, Math.min(11, Math.floor(Math.random()*11)+1));
          state.data.numbers.bjPlayer = (state.data.numbers.bjPlayer || 0) + add;
          let d = state.data.numbers.bjDealer || 0;
          while (d < 17) { d += Math.max(1, Math.min(11, Math.floor(Math.random()*11)+1)); }
          state.data.numbers.bjDealer = d;
          return 'game_bj_result';
        } },
        { label: 'Çık', next: (st) => st.data.flags.returnScene || 'y2026_wealth_strategy' }
      ]
    }),
    game_bj_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>Oyuncu: ${state.data.numbers.bjPlayer || 0} · Dağıtıcı: ${state.data.numbers.bjDealer || 0}</p>
      `,
      choices: [
        { label: 'Kazancı uygula', next: (st) => {
          const p = st.data.numbers.bjPlayer || 0; const d = st.data.numbers.bjDealer || 0; const bet = st.data.numbers.bjBet || 100;
          let delta = 0;
          if (p > 21 && d > 21) delta = 0; else if (p > 21) delta = -bet; else if (d > 21) delta = bet; else if (p > d) delta = bet; else if (p < d) delta = -bet; else delta = 0;
          st.data.stats.money += delta;
          return 'game_bj_after';
        } }
      ]
    }),
    game_bj_after: (state) => ({
      text: `
        <h2>Blackjack</h2>
        <p>Devam?</p>
      `,
      choices: [
        { label: 'Tekrar oyna', next: 'game_bj_intro' },
        { label: 'Çık', next: (st) => st.data.flags.returnScene || 'y2026_wealth_strategy' }
      ]
    }),

    // Mini-oyun: Pişti (basit tek tur)
    game_pisti_intro: (state) => ({
      text: `
        <h2>Pişti</h2>
        <p>Bahis miktarını seç.</p>
      `,
      choices: [
        { label: '100', next: 'game_pisti_deal', effects: [ { numberDelta: { pistiBet: 100 } } ] },
        { label: '200', next: 'game_pisti_deal', effects: [ { numberDelta: { pistiBet: 200 } } ] },
        { label: '500', next: 'game_pisti_deal', effects: [ { numberDelta: { pistiBet: 500 } } ] }
      ]
    }),
    game_pisti_deal: (state) => ({
      text: `
        <h2>Pişti</h2>
        <p>Orta kart ve elin dağıtılıyor…</p>
      `,
      choices: [
        { label: 'Devam', next: () => {
          const ranks = [1,2,3,4,5,6,7,8,9,10,11,12,13];
          const top = ranks[Math.floor(Math.random()*ranks.length)];
          const hand = [ranks[Math.floor(Math.random()*ranks.length)], ranks[Math.floor(Math.random()*ranks.length)], ranks[Math.floor(Math.random()*ranks.length)]];
          state.data.numbers.pistiTop = top;
          state.data.numbers.pistiA = hand[0];
          state.data.numbers.pistiB = hand[1];
          state.data.numbers.pistiC = hand[2];
          return 'game_pisti_play';
        } }
      ]
    }),
    game_pisti_play: (state) => ({
      text: `
        <h2>Pişti</h2>
        <p>Orta: ${state.data.numbers.pistiTop || 0} · Elin: ${state.data.numbers.pistiA || 0}, ${state.data.numbers.pistiB || 0}, ${state.data.numbers.pistiC || 0}</p>
      `,
      choices: [
        { label: 'Kart 1 oyna', next: 'game_pisti_result', effects: [ { numberDelta: { pistiChoose: 1 } } ] },
        { label: 'Kart 2 oyna', next: 'game_pisti_result', effects: [ { numberDelta: { pistiChoose: 2 } } ] },
        { label: 'Kart 3 oyna', next: 'game_pisti_result', effects: [ { numberDelta: { pistiChoose: 3 } } ] }
      ]
    }),
    game_pisti_result: (state) => ({
      text: `
        <h2>Pişti</h2>
        <p>Sonuç hesaplanıyor…</p>
      `,
      choices: [
        { label: 'Kazancı uygula', next: (st) => {
          const top = st.data.numbers.pistiTop || 0; const bet = st.data.numbers.pistiBet || 100; const ch = st.data.numbers.pistiChoose || 1;
          const played = ch === 1 ? st.data.numbers.pistiA : ch === 2 ? st.data.numbers.pistiB : st.data.numbers.pistiC;
          const win = (played === top);
          st.data.stats.money += win ? bet*2 : -bet;
          return 'game_pisti_after';
        } }
      ]
    }),
    game_pisti_after: (state) => ({
      text: `
        <h2>Pişti</h2>
        <p>Devam?</p>
      `,
      choices: [
        { label: 'Tekrar oyna', next: 'game_pisti_intro' },
        { label: 'Çık', next: (st) => st.data.flags.returnScene || 'y2026_wealth_strategy' }
      ]
    }),
    // Girişim yolu
    y2027_startup: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2027 · Girişim — Fikir Testi</h2>
          <p>Bir sorunu çözmek istiyorsun. İlk adım hangisi?</p>
          ${s.charisma >= 60 ? '<p class="stat-note">📊 Yüksek karizman yatırımcıları ikna etmede avantaj sağlar.</p>' : ''}
        `,
        choices: [
          { label: '👥 Ortak bul, takım kur',
            next: 'y2028_startup_build',
            effects: [ { statDelta: { social: 4, confidence: 3, creativity: -1 } } ] },
          { label: '🛠️ Hızlı MVP yap, test et',
            next: 'y2028_startup_build',
            effects: [ { statDelta: { intelligence: 3, creativity: 3, confidence: 3, health: -2, money: -300 } } ] },
          { label: '🔍 Pazar araştır',
            next: 'y2028_startup_build',
            effects: [ { statDelta: { intelligence: 4, social: 2, confidence: -1 } } ] },
        ]
      };
    },
    y2028_startup_build: (state) => ({
      text: `
        <h2>2028 · Ürün Geliştirme</h2>
        <p>Takım kur, lansman planı yap.</p>
      `,
      choices: [
        { label: '👩‍💻 Küçük ama yetkin ekip',
          next: 'y2029_startup_pitch',
          effects: [ { statDelta: { social: 3, confidence: 2, money: -600 } } ] },
        { label: '💻 Freelance destek',
          next: 'y2029_startup_pitch',
          effects: [ { statDelta: { creativity: 2, intelligence: 1, money: -300 } } ] },
        { label: '🔥 Tek başına, tam odak',
          next: 'y2029_startup_pitch',
          effects: [ { statDelta: { confidence: 3, focus: 2, health: -2, social: -2 } } ] },
      ]
    }),
    y2029_startup_pitch: (state) => ({
      text: `
        <h2>2029 · Yatırım Sunumu</h2>
        <p>Pitch günü geldi. Sunum ve sorular.</p>
      `,
      choices: [
        { label: '🎤 Pitch yap',
          next: (state) => {
            const s = state.data.stats;
            const score = Math.round(s.confidence*0.4 + s.charisma*0.35 + s.focus*0.25) + Math.round((s.luck - 50) / 10);
            if (score >= 62) { state.setFlag('startupFunded', true); state.data.stats.money += 4000; }
            else { state.data.stats.money -= 200; }
            return score >= 62 ? 'y2030_startup_success' : 'y2030_startup_fail';
          } },
        { label: '⏳ Demo gününü ertele',
          next: 'y2028_startup_build',
          effects: [ { statDelta: { confidence: -1, intelligence: 2 } } ] },
        { label: '🤝 Stratejik ortak ara',
          next: 'y2030_startup_success',
          effects: [ { statDelta: { money: 1200, social: 3, confidence: 2 } } ] },
      ]
    }),
    y2030_startup_success: (state) => ({
      text: `
        <h2>2030 · Girişim Başarısı</h2>
        <p>Yatırımı aldın ve büyüyorsun.</p>
      `,
      choices: [
        { label: '🚀 Büyümeye devam et',
          next: 'y2030_outcome',
          effects: [ { statDelta: { money: 2000, confidence: 4, health: -1 } } ] },
        { label: '💵 Kısmi nakde çevir',
          next: 'y2030_outcome',
          effects: [ { statDelta: { money: 1500, happiness: 3 } } ] },
        { label: '🌍 Yurt dışına açıl',
          next: 'y2030_outcome',
          effects: [ { statDelta: { money: 800, social: 2, confidence: 2, happiness: 2 } }, { numberDelta: { travelCount: 1 } } ] },
      ]
    }),
    y2030_startup_fail: (state) => ({
      text: `
        <h2>2030 · Zor Dönem</h2>
        <p>Yatırım olmadı. Bu yolun sonu değil.</p>
      `,
      choices: [
        { label: '🔄 Pivot et ve yeniden sun',
          next: 'y2028_startup_build',
          effects: [ { statDelta: { confidence: -1, intelligence: 2 } } ] },
        { label: '💰 Gelire odaklan',
          next: 'y2030_outcome',
          effects: [ { statDelta: { money: 700, confidence: 2, creativity: -1 } } ] },
        { label: '🏢 Kurumsala dön',
          next: 'y2024_career',
          effects: [ { statDelta: { confidence: -1, happiness: 2 } } ] },
      ]
    }),
    // Akademi yolu
    y2027_academia: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2027 · Akademi Yolu</h2>
          <p>Araştırma, yayın, tez. Uzun bir yol — ama kalıcı bir etki.</p>
          ${s.focus >= 65 ? '<p class="stat-note">📊 Güçlü odağın derin araştırma için vazgeçilmez.</p>' : ''}
        `,
        choices: [
          { label: '🌍 Yurt dışı yüksek lisans',
            next: 'y2028_academia_apply',
            conditions: [ { statGte: { key: 'intelligence', value: 68 } } ],
            effects: [ { statDelta: { confidence: 4, intelligence: 3, money: -600, happiness: -2 } } ] },
          { label: '🇹🇷 Ülkede yüksek lisans',
            next: 'y2028_academia_apply',
            effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 4, focus: 3, money: -300, social: -1 } } ] },
          { label: '📝 Araştırma asistanlığı',
            next: 'y2028_academia_apply',
            effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 3, money: 400, confidence: -1 } } ] },
        ]
      };
    },
    y2028_academia_apply: (state) => ({
      text: `
        <h2>2028 · Yurt Dışı Başvuruları</h2>
        <p>IELTS, referanslar, niyet mektubu…</p>
      `,
      choices: [
        { label: '📄 Başvur',
          next: (state) => {
            const s = state.data.stats;
            const score = Math.round(s.intelligence*0.55 + s.focus*0.25 + s.discipline*0.2);
            return score >= 72 ? 'y2029_academia_accept' : 'y2029_academia_reject';
          } },
        { label: '⏳ Bir yıl daha hazırlan',
          next: 'y2027_academia',
          effects: [ { statDelta: { intelligence: 3, focus: 2, money: -100 } } ] },
      ]
    }),
    y2029_academia_accept: (state) => ({
      text: `
        <h2>2029 · Kabul Aldın</h2>
        <p>Program seni seçti. Nasıl ilerlersin?</p>
      `,
      choices: [
        { label: '✅ Programı tamamla',
          next: 'y2030_outcome',
          effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 4, confidence: 3, social: -1 } } ] },
        { label: '🏆 Burs görüşmesi yap',
          next: 'y2030_outcome',
          effects: [ { setFlag: { academiaTrack: true } }, { addTrait: 'englishB2' }, { statDelta: { money: 600, confidence: 3, intelligence: 2 } } ] },
        { label: '🌍 Yurt dışı araştırma fırsatı',
          next: 'y2030_outcome',
          effects: [ { setFlag: { abroadAccepted: true } }, { statDelta: { confidence: 5, intelligence: 3, happiness: -2, money: -400 } } ] },
      ]
    }),
    y2029_academia_reject: (state) => ({
      text: `
        <h2>2029 · Red Aldın</h2>
        <p>Kabul gelmedi. Bu yolun sonu değil.</p>
      `,
      choices: [
        { label: '🗣️ Dil kursu (B2)',
          next: 'y2030_outcome',
          effects: [ { addTrait: 'englishB2' }, { statDelta: { intelligence: 3, confidence: 3, money: -400, social: -1 } } ] },
        { label: '📖 Araştırma asistanlığı',
          next: 'y2030_outcome',
          effects: [ { setFlag: { academiaTrack: true } }, { statDelta: { intelligence: 4, money: 300, happiness: -1 } } ] },
        { label: '👔 İş piyasasına yönel',
          next: 'y2024_career',
          effects: [ { statDelta: { confidence: -1, happiness: 2 } } ] },
      ]
    }),
    // Seyahat yolu
    y2027_travel: (state) => ({
      text: `
        <h2>2027 · Dünyayı Keşfet</h2>
        <p>Haritalarda değil, ayaklarınla öğren.</p>
      `,
      choices: [
        { label: '🏔️ Balkanlar & Doğu Avrupa',
          next: 'y2028_travel_hop',
          effects: [ { statDelta: { happiness: 4, social: 2, money: -400, discipline: -1 } }, { numberDelta: { travelCount: 2 } } ] },
        { label: '🌅 Orta Doğu & Asya',
          next: 'y2028_travel_hop',
          effects: [ { statDelta: { happiness: 4, empathy: 2, money: -500, health: -1 } }, { numberDelta: { travelCount: 2 } } ] },
        { label: '🌊 Güney Amerika',
          next: 'y2028_travel_hop',
          effects: [ { statDelta: { happiness: 5, confidence: 2, money: -600, health: -1 } }, { numberDelta: { travelCount: 2 } } ] },
      ]
    }),
    y2028_travel_hop: (state) => {
      const n = state.data.numbers || {};
      return {
        text: `
          <h2>2028 · Yolculuk Genişliyor</h2>
          <p>Seyahat: <strong>${n.travelCount || 0}</strong>. Daha uzağa açılmak ister misin?</p>
        `,
        choices: [
          { label: '🌏 Uzak Doğu',
            next: 'y2029_travel_wrap',
            effects: [ { statDelta: { happiness: 5, creativity: 3, money: -700, health: -1 } }, { numberDelta: { travelCount: 3 } } ] },
          { label: '🌎 Kuzey Amerika',
            next: 'y2029_travel_wrap',
            effects: [ { statDelta: { happiness: 4, confidence: 3, money: -900, social: -1 } }, { numberDelta: { travelCount: 3 } } ] },
          { label: '💼 Kısa çalışma vizesi',
            next: 'y2029_travel_wrap',
            effects: [ { statDelta: { money: 400, confidence: 2, social: 2 } }, { numberDelta: { travelCount: 1 } } ] },
          { label: '🏠 Türkiye\'ye dön',
            next: 'y2024_career',
            effects: [ { statDelta: { confidence: 2, money: 400, happiness: -1 } } ] },
          { label: '📚 Seyahat sorusu çöz',
            next: 'y2028_travel_cases' },
        ]
      };
    },
    y2028_travel_cases: (state) => ({
      text: `
        <h2>Seyahat Sorusu</h2>
        <p>${(() => { try { const pool = require('./travelCases').default; const idx = Math.floor(Math.random()*pool.length); const c = pool[idx]; state.data.numbers.travelCaseIdx = idx; return c.stem; } catch(_) { return 'Soru yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2028_travel_cases_result', effects: [ { numberDelta: { travelCaseChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2028_travel_cases_result', effects: [ { numberDelta: { travelCaseChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2028_travel_cases_result', effects: [ { numberDelta: { travelCaseChoice: 2 } } ] }
      ]
    }),
    y2028_travel_cases_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>${(() => { try { const pool = require('./travelCases').default; const c = pool[state.data.numbers.travelCaseIdx || 0]; const ok = (state.data.numbers.travelCaseChoice||0) === c.correct; return (ok?'Doğru':'Yanlış'); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni soru', next: 'y2028_travel_cases', effects: [ (() => { const ok = (()=>{ try { const pool = require('./travelCases').default; const c = pool[state.data.numbers.travelCaseIdx || 0]; return (state.data.numbers.travelCaseChoice||0) === c.correct; } catch(_) { return false } })(); return { statDelta: { confidence: ok?1:-1 } }; })() ] },
        { label: 'Devam', next: 'y2029_travel_wrap' }
      ]
    }),
    y2029_travel_wrap: (state) => {
      const n = state.data.numbers || {};
      return {
        text: `
          <h2>2029 · Yolculuk Tamamlandı</h2>
          <p>Toplam seyahat: <strong>${n.travelCount || 0}</strong>. Yeni deneyimler kattın.</p>
        `,
        choices: [
          { label: '🎒 Seyahate devam et',
            next: 'y2030_outcome',
            effects: [ { statDelta: { happiness: 3, social: 2, creativity: 2, money: -300 } }, { numberDelta: { travelCount: 1 } } ] },
          { label: '📝 Gezi blogu / içerik üret',
            next: 'y2030_outcome',
            effects: [ { statDelta: { confidence: 2, creativity: 3, money: 300 } } ] },
          { label: '🏠 Türkiye\'ye dön, kariyer odaklan',
            next: 'y2024_career',
            effects: [ { statDelta: { confidence: 2, money: 400, happiness: -1 } } ] },
        ]
      };
    },
    y2030_outcome: (state) => {
      const s = state.data.stats; const f = state.data.flags; const t = state.data.traits || [];
      const n = state.data.numbers || {};
      const path = f.milBranch ? `🎖️ ${f.milBranch} kuvvetleri`
        : f.uniField === 'stem' ? '⚙️ Mühendislik/Teknik'
        : f.uniField === 'design' ? '🎨 Tasarım/Sanat'
        : f.startupFunded ? '🚀 Girişimci'
        : f.academiaTrack ? '🎓 Akademisyen'
        : t.includes('olympian') ? '🏅 Olimpiyatçı'
        : t.includes('athlete') ? '🏅 Sporcu'
        : f.engField ? `⚙️ ${f.engField} Mühendisi`
        : '🌿 Genel Kariyer';
      const emoji = s.happiness >= 70 ? '🌟' : s.happiness >= 55 ? '😊' : s.happiness >= 40 ? '🙂' : '😔';
      return {
        text: `
          <h2>2030 · 30 Yaşında — Hayatının Bilançosu</h2>
          <div style="text-align:center;font-size:2em">${emoji}</div>
          <p><strong>Yol:</strong> ${path}</p>
          <p>💰 Para: <strong>${s.money >= 0 ? '+' : ''}${s.money}₺</strong> ·
          🌍 Seyahat: <strong>${n.travelCount || 0}</strong> ·
          🏋️ Antrenman: <strong>${n.training || 0}</strong></p>
          <p><strong>Özellikler:</strong> ${t.length ? t.join(' · ') : '—'}</p>
        `,
        choices: [
          { label: '🎯 Hedefi değerlendir', next: 'goal_eval' },
          { label: '🔄 Yeni rota çiz', next: 'y2026_growth' },
          { label: '🔁 Yeni hayat başlat', next: 'intro' },
        ]
      };
    },
    goal_eval: (state) => ({
      text: `
        <h2>Hedef Değerlendirme</h2>
        <p>Hedef: ${state.data.flags.goal || '—'}</p>
        <p>${(() => {
          try { const { Goals } = require('../game/Goals'); return Goals.evaluate(state.data.flags.goal, state) ? 'Başarılı!' : 'Henüz değil.'; } catch (_) { return '' }
        })()}</p>
      `,
      choices: [
        { label: 'Devam', next: 'y2025_outcome' },
        { label: 'Yeniden dene', next: 'y2026_growth' },
        { label: 'Başa dön', next: 'intro' }
      ]
    }),
    y2027_sports: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2027 · Spor Yolu</h2>
          <p>Antrenman yoğunlaşıyor.</p>
          ${s.endurance >= 60 ? '<p class="stat-note">💪 Dayanıklılığın güçlü — uzun soluklu programlara uyumsun.</p>' : ''}
        `,
        choices: [
          { label: '🧑‍🏫 Profesyonel antrenör tut',
            next: 'y2028_sports_national',
            effects: [ { statDelta: { health: 9, endurance: 5, confidence: 3, money: -500 } }, { numberDelta: { training: 3 } } ] },
          { label: '🏃 Kendi programın',
            next: 'y2028_sports_national',
            effects: [ { statDelta: { health: 6, endurance: 3, focus: -1 } }, { numberDelta: { training: 1 } } ] },
          { label: '🤝 Takımla çalış',
            next: 'y2028_sports_national',
            effects: [ { statDelta: { health: 7, social: 3, endurance: 3, confidence: -1 } }, { numberDelta: { training: 2 } } ] },
        ]
      };
    },
    y2028_sports_national: (state) => ({
      text: `
        <h2>2028 · Milli Seçmeler</h2>
        <p>Antrenman puanın: <strong>${(state.data.numbers && state.data.numbers.training) || 0}</strong>. Seçmeler için ≥3 gerekli.</p>
      `,
      choices: [
        { label: '🥇 Seçmelere katıl',
          next: 'y2029_sports_international',
          conditions: [ { numberGte: { key: 'training', value: 3 } } ],
          effects: [ { statDelta: { confidence: 2, money: -200 } } ] },
        { label: '🏟️ Önce yerel ligde güçlen',
          next: 'y2030_outcome',
          effects: [ { statDelta: { health: 4, endurance: 2, confidence: 2, happiness: 3, money: 400 } }, { numberDelta: { training: 2 } } ] },
        { label: '🏕️ Yoğun antrenman kampı',
          next: 'y2029_sports_international',
          effects: [ { statDelta: { health: 5, endurance: 4, happiness: -2, money: -300 } }, { numberDelta: { training: 2 } } ] },
      ]
    }),
    y2029_sports_international: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2029 · Uluslararası Arena</h2>
          <p>Sağlık: <strong>${Math.round(s.health)}</strong> (olimpiyat için ≥85 gerekli).</p>
        `,
        choices: [
          { label: '🏅 Olimpiyat hedefi',
            next: 'y2030_outcome',
            conditions: [ { statGte: { key: 'health', value: 85 } } ],
            effects: [ { addTrait: 'olympian' }, { statDelta: { confidence: 8, happiness: 6, money: -500 } } ] },
          { label: '🌍 Uluslararası turnuva',
            next: 'y2030_outcome',
            effects: [ { statDelta: { health: 5, confidence: 5, money: -300, happiness: -1 } } ] },
          { label: '🇹🇷 Ulusal şampiyonluk',
            next: 'y2030_outcome',
            effects: [ { statDelta: { confidence: 4, happiness: 4, money: 300 } } ] },
          { label: '💰 Sponsor ara',
            next: 'y2030_outcome',
            effects: [ { statDelta: { money: 800, confidence: 2, charisma: 1 } } ] },
          { label: '📚 Taktik/strateji çalış',
            next: 'y2029_sport_cases' },
        ]
      };
    },
    y2029_sport_cases: (state) => ({
      text: `
        <h2>Strateji/Antrenman Sorusu</h2>
        <p>${(() => { try { const pool = require('./sportCases').default; const idx = Math.floor(Math.random()*pool.length); const c = pool[idx]; state.data.numbers.sportCaseIdx = idx; return c.stem; } catch(_) { return 'Soru yüklenemedi.' } })()}</p>
      `,
      choices: [
        { label: 'Seçenek 1', next: 'y2029_sport_cases_result', effects: [ { numberDelta: { sportCaseChoice: 0 } } ] },
        { label: 'Seçenek 2', next: 'y2029_sport_cases_result', effects: [ { numberDelta: { sportCaseChoice: 1 } } ] },
        { label: 'Seçenek 3', next: 'y2029_sport_cases_result', effects: [ { numberDelta: { sportCaseChoice: 2 } } ] }
      ]
    }),
    y2029_sport_cases_result: (state) => ({
      text: `
        <h2>Sonuç</h2>
        <p>${(() => { try { const pool = require('./sportCases').default; const c = pool[state.data.numbers.sportCaseIdx || 0]; const ok = (state.data.numbers.sportCaseChoice||0) === c.correct; return (ok?'Doğru':'Yanlış'); } catch(_) { return '' } })()}</p>
      `,
      choices: [
        { label: 'Yeni soru', next: 'y2029_sport_cases', effects: [ (() => { const ok = (()=>{ try { const pool = require('./sportCases').default; const c = pool[state.data.numbers.sportCaseIdx || 0]; return (state.data.numbers.sportCaseChoice||0) === c.correct; } catch(_) { return false } })(); return { statDelta: { confidence: ok?1:-1 } }; })() ] },
        { label: '2030 değerlendirme', next: 'y2030_outcome' },
        { label: 'Yol ayrımına dön', next: 'y2026_growth' }
      ]
    }),
    y2029_sports_injury: (state) => ({
      text: `
        <h2>2029 · Sakatlık</h2>
        <p>Yoğun antrenman bedelini verdi. Nasıl devam edersin?</p>
      `,
      choices: [
        { label: '🛌 Tam dinlenme',
          next: 'y2030_outcome',
          effects: [ { statDelta: { health: 5, endurance: -1, happiness: -1 } } ] },
        { label: '💊 Bandajla sahaya dön',
          next: 'y2030_outcome',
          effects: [ { statDelta: { confidence: 2, health: -2 } } ] },
        { label: '🏥 Fizyoterapi + uzman desteği',
          next: 'y2030_outcome',
          effects: [ { statDelta: { money: -300, health: 4, endurance: 1 } } ] },
      ]
    }),
    // Rastgele olaylar
    rand_meet: (state) => ({
      text: `
        <h2>Rastgele Karşılaşma</h2>
        <p>Yeni biriyle tanıştın. Sohbet eder misin?</p>
      `,
      choices: [
        { label: 'Sohbet et', next: (st) => st.data.flags.returnScene || 'y2026_growth', effects: [ { statDelta: { social: 2, happiness: 1, confidence: 1 } } ] },
        { label: 'Yoğunum', next: (st) => st.data.flags.returnScene || 'y2026_growth', effects: [ { statDelta: { happiness: -1 } } ] }
      ]
    }),
    rand_lottery: (state) => ({
      text: `
        <h2>Piyango</h2>
        <p>Bilet aldın. Şansını denedin!</p>
      `,
      choices: [
        { label: 'Sonucu gör', next: (st) => {
          const win = Math.random() < (st.data.stats.luck || 0) / 200;
          if (win) { st.data.stats.money += 2000; }
          return st.data.flags.returnScene || 'y2026_growth';
        } }
      ]
    }),
    rand_inheritance: (state) => ({
      text: `
        <h2>Miras</h2>
        <p>Uzak akrabadan bir miras çıktı.</p>
      `,
      choices: [
        { label: 'Kabul et', next: (st) => { const debt = Math.random() < 0.5; st.data.stats.money += debt ? -500 : 1500; return st.data.flags.returnScene || 'y2026_growth'; } },
        { label: 'Reddet', next: (st) => st.data.flags.returnScene || 'y2026_growth' }
      ]
    }),
    // Stat minimumları altına düşüşte başarısızlık sahnesi
    fail_random: (state) => ({
      text: `
        <h2>Oyun Bitti</h2>
        <p>${(() => {
          const events = [
            'Yolda yürürken başına saksı düştü.',
            'Soluk boruna yemek kaçtı, nefessiz kaldın.',
            'Ayağına paslı çivi battı, tetanoz oldun.',
            'Denizde akıntıya kapıldın.',
            'Araç seni görmedi, kaza geçirdin.',
            'Beklenmedik bir alerjik şok yaşadın.',
          ];
          const i = Math.floor(Math.random() * events.length);
          return events[i];
        })()}</p>
      `,
      choices: [
        { label: 'Başa dön', next: 'intro' }
      ]
    }),
    // ... RN dosyasında hacmi sınırlamak için kalan sahneler kısaltıldı ...
  };
}

const scenes = getScenes();
export default scenes;


