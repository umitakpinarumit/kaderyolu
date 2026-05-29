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
    y2015_high_school: (state) => ({
      text: `
        <h2>2015 · Lise Yolu</h2>
        <p>Okul seçimi: akademik, mesleki veya dengeli bir yol.</p>
      `,
      choices: [
        { label: 'Fen ağırlıklı lise', next: 'y2015_hs_fen', effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Anadolu lisesi (dengeli)', next: 'y2015_hs_anadolu', effects: [ { statDelta: { social: 3, intelligence: 3 } } ] },
        { label: 'Meslek lisesi', next: 'y2016_voc_start', effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'Güzel sanatlar lisesi', next: 'y2016_artist_portfolio', effects: [ { statDelta: { happiness: 3, confidence: 2 } } ] },
        { label: 'Okumak yerine çıraklık', next: 'y2015_apprenticeship_start', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Askerî yol', next: 'y2018_military_choice', effects: [ { statDelta: { health: 1, confidence: 1 } } ] }
      ]
    }),
    y2015_hs_fen: (state) => ({
      text: `
        <h2>2015 · Fen Lisesi Yolu</h2>
        <p>Hangi odak?</p>
      `,
      choices: [
        { label: 'Bilim olimpiyatları', next: 'y2016_projects', effects: [ { statDelta: { intelligence: 3, focus: 2, discipline: 1 } } ] },
        { label: 'Laboratuvar çalışmaları', next: 'y2016_projects', effects: [ { statDelta: { intelligence: 2, confidence: 1 } } ] },
        { label: 'Özel ders', next: 'y2016_projects', effects: [ { statDelta: { intelligence: 2 } }, { statDelta: { money: -200 } } ] }
      ]
    }),
    y2015_hs_anadolu: (state) => ({
      text: `
        <h2>2015 · Anadolu Lisesi Yolu</h2>
        <p>Hangi etkinlik?</p>
      `,
      choices: [
        { label: 'Dil kulübü', next: 'y2016_projects', effects: [ { statDelta: { social: 2, confidence: 1 } } ] },
        { label: 'Değişim programı', next: 'y2016_projects', effects: [ { statDelta: { confidence: 2, social: 1 } }, { numberDelta: { travelCount: 1 } } ] },
        { label: 'Öğrenci konseyi', next: 'y2016_projects', effects: [ { statDelta: { confidence: 2, charisma: 1 } } ] }
      ]
    }),
    // Meslek lisesi akışı
    y2016_voc_start: (state) => ({
      text: `
        <h2>2016 · Meslek Lisesi Başlangıç</h2>
        <p>Alan seçimi yapmalısın.</p>
      `,
      choices: [
        { label: 'Elektronik', next: 'y2017_voc_practice', effects: [ { setFlag: { vocField: 'elec' } }, { statDelta: { intelligence: 2, focus: 1 } } ] },
        { label: 'Otomotiv', next: 'y2017_voc_practice', effects: [ { setFlag: { vocField: 'auto' } }, { statDelta: { strength: 1, confidence: 1 } } ] },
        { label: 'Bilişim', next: 'y2017_voc_practice', effects: [ { setFlag: { vocField: 'it' } }, { statDelta: { intelligence: 2, creativity: 1 } } ] }
      ]
    }),
    y2017_voc_practice: (state) => ({
      text: `
        <h2>2017 · Atölye ve Staj</h2>
        <p>Pratik yaparak uzmanlaş.</p>
      `,
      choices: [
        { label: 'Usta yanında staj', next: 'y2018_voc_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Okul atölyesi', next: 'y2018_voc_outcome', effects: [ { statDelta: { discipline: 1, focus: 1 } } ] },
        { label: 'Freelance işler', next: 'y2018_voc_outcome', effects: [ { statDelta: { money: 200, confidence: 1 } } ] }
      ]
    }),
    y2018_voc_outcome: (state) => ({
      text: `
        <h2>2018 · Meslek Lisesi Çıktısı</h2>
        <p>Alanında başlangıç düzeyi yetkinlik edindin.</p>
      `,
      choices: [
        { label: 'Teknisyen olarak çalış', next: 'y2019_trade_track', effects: [ { statDelta: { money: 400, confidence: 1 } } ] },
        { label: 'Kalfalık + sertifika', next: 'y2019_trade_track', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Üniversiteye hazırlan', next: 'y2018_uni_exam', effects: [ { statDelta: { discipline: 1 } } ] }
      ]
    }),
    // Askerî yol akışı
    y2018_military_choice: (state) => ({
      text: `
        <h2>2018 · Askerî Yol</h2>
        <p>Hangi kuvvet?</p>
      `,
      choices: [
        { label: 'Kara', next: () => { state.data.flags.milBranch = 'land'; return 'y2019_military_training'; } },
        { label: 'Hava', next: () => { state.data.flags.milBranch = 'air'; return 'y2019_military_training'; } },
        { label: 'Deniz', next: () => { state.data.flags.milBranch = 'navy'; return 'y2019_military_training'; } }
      ]
    }),
    y2019_military_training: (state) => ({
      text: `
        <h2>2019 · Askerî Eğitim</h2>
        <p>Branşa göre yoğun eğitim.</p>
      `,
      choices: [
        { label: 'Eğitimi tamamla', next: (() => {
          const b = state.data.flags.milBranch; const s = state.data.stats;
          let thr = 65; if (b === 'air') thr = 70; if (b === 'navy') thr = 68;
          const score = Math.round(s.health*0.4 + s.endurance*0.3 + s.discipline*0.3);
          return score >= thr ? 'y2020_military_service' : 'y2019_military_retry';
        })() },
        { label: 'Destek birimi iste', next: 'y2020_military_service', effects: [ { statDelta: { confidence: -1 } } ] },
        { label: 'Sivil yola dön', next: 'y2024_career', effects: [ { statDelta: { confidence: -2 } } ] }
      ]
    }),
    y2019_military_retry: (state) => ({
      text: `
        <h2>2019 · Tekrar Deneme</h2>
        <p>İlk denemede zorluk yaşadın.</p>
      `,
      choices: [
        { label: 'Kondisyon çalış', next: 'y2019_military_training', effects: [ { statDelta: { health: 2, endurance: 2 } } ] },
        { label: 'Disiplin programı', next: 'y2019_military_training', effects: [ { statDelta: { discipline: 3 } } ] },
        { label: 'Vazgeç', next: 'y2024_career' }
      ]
    }),
    y2020_military_service: (state) => ({
      text: `
        <h2>2020 · Görev</h2>
        <p>Branşa göre görevler.</p>
      `,
      choices: [
        { label: 'Görev odaklı', next: 'y2022_military_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Uzmanlık kursu', next: 'y2022_military_outcome', effects: [ { statDelta: { intelligence: 2, discipline: 1 } } ] },
        { label: 'İzin ve aile', next: 'y2022_military_outcome', effects: [ { statDelta: { happiness: 2 } } ] }
      ]
    }),
    y2022_military_outcome: (state) => ({
      text: `
        <h2>2022 · Askerî Sonuç</h2>
        <p>Kariyer yönü.</p>
      `,
      choices: [
        { label: 'Uzman olarak devam', next: 'y2026_growth', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Sivil kariyer', next: 'y2024_career', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Akademi (subaylık)', next: 'y2027_academia', effects: [ { statDelta: { intelligence: 1, discipline: 2 } } ] }
      ]
    }),
    // Sanat yolu
    y2016_artist_portfolio: (state) => ({
      text: `
        <h2>2016 · Sanat Portföyü</h2>
        <p>Portföy oluşturmaya başlıyorsun.</p>
      `,
      choices: [
        { label: 'Klasik eğitim (güvenli)', next: 'y2017_artist_stage', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Karma atölye (dengeli)', next: 'y2017_artist_stage', effects: [ { statDelta: { happiness: 2, confidence: 1 } } ] },
        { label: 'Sokak performansı (riskli)', next: 'y2017_artist_stage', effects: [ { statDelta: { happiness: 3, confidence: 2 } } ] }
      ]
    }),
    y2017_artist_stage: (state) => ({
      text: `
        <h2>2017 · İlk Gösteri</h2>
        <p>Sahne şansı buldun.</p>
      `,
      choices: [
        { label: 'Küçük salon', next: 'y2018_artist_route', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Yerel festival', next: 'y2018_artist_route', effects: [ { statDelta: { happiness: 2, confidence: 2 } } ] },
        { label: 'Büyük sahne', next: 'y2018_artist_route', effects: [ { statDelta: { confidence: 4, happiness: 1 } } ] }
      ]
    }),
    // Çıraklık ve trade
    y2015_apprenticeship_start: (state) => ({
      text: `
        <h2>2015 · Çıraklık</h2>
        <p>Bir usta yanında başlıyorsun.</p>
      `,
      choices: [
        { label: 'Elektrik (güvenli)', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Mobilya (dengeli)', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Oto tamir (riskli)', next: 'y2016_apprenticeship_progress', effects: [ { statDelta: { health: -1, confidence: 3 } } ] }
      ]
    }),
    y2016_apprenticeship_progress: (state) => ({
      text: `
        <h2>2016 · Ustalığa Doğru</h2>
        <p>Tecrübe kazanıyorsun.</p>
      `,
      choices: [
        { label: 'Sertifika (güvenli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Yan iş (dengeli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { money: 200 } } ] },
        { label: 'Dükkan denemesi (riskli)', next: 'y2018_apprenticeship_outcome', effects: [ { statDelta: { money: -300, confidence: 2 } } ] }
      ]
    }),
    y2018_apprenticeship_outcome: (state) => ({
      text: `
        <h2>2018 · Ustalık Çıktısı</h2>
        <p>Meslekte ilerleme.</p>
      `,
      choices: [
        { label: 'Meslekte devam', next: 'y2019_trade_track', effects: [ { statDelta: { money: 400, confidence: 1 } } ] },
        { label: 'Ustalık belgesi', next: 'y2019_trade_track', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Üniversiteye hazırlan', next: 'y2018_uni_exam' }
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
    y2016_projects: (state) => ({
      text: `
        <h2>2016 · Projeler ve Kulüpler</h2>
        <p>Okulda proje/kulüp çalışmalarına katılma şansın var.</p>
      `,
      choices: [
        { label: 'Bilim projesi (güvenli)', next: 'y2016_proj_science', effects: [ { statDelta: { intelligence: 6, confidence: 3 } } ] },
        { label: 'Sosyal sorumluluk (dengeli)', next: 'y2016_proj_social', effects: [ { statDelta: { social: 6, happiness: 3 } } ] },
        { label: 'Spor turnuvası (riskli)', next: 'y2016_proj_sport', effects: [ { statDelta: { health: 6, confidence: 2 } } ] }
      ]
    }),
    y2016_proj_science: (state) => ({
      text: `
        <h2>2016 · Bilim Projesi</h2>
        <p>Proje türü seç.</p>
      `,
      choices: [
        { label: 'Deney tasarımı', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 2, discipline: 1 } } ] },
        { label: 'Sunum hazırlığı', next: 'y2018_uni_exam', effects: [ { statDelta: { confidence: 2, focus: 1 } } ] },
        { label: 'Takım projesi', next: 'y2018_uni_exam', effects: [ { statDelta: { social: 2, intelligence: 1 } } ] }
      ]
    }),
    y2016_proj_social: (state) => ({
      text: `
        <h2>2016 · Sosyal Sorumluluk</h2>
        <p>Odak alanı seç.</p>
      `,
      choices: [
        { label: 'Çevre', next: 'y2018_uni_exam', effects: [ { statDelta: { empathy: 1, social: 2 } } ] },
        { label: 'Eğitim', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 1, social: 1 } } ] },
        { label: 'Yoksullukla mücadele', next: 'y2018_uni_exam', effects: [ { statDelta: { empathy: 2 } } ] }
      ]
    }),
    y2016_proj_sport: (state) => ({
      text: `
        <h2>2016 · Spor Turnuvası</h2>
        <p>Hazırlık yöntemi.</p>
      `,
      choices: [
        { label: 'Düzenli antrenman', next: 'y2018_uni_exam', effects: [ { statDelta: { health: 1, endurance: 1 } }, { numberDelta: { training: 1 } } ] },
        { label: 'Taktik analizi', next: 'y2018_uni_exam', effects: [ { statDelta: { intelligence: 1, confidence: 1 } } ] },
        { label: 'Motivasyon', next: 'y2018_uni_exam', effects: [ { statDelta: { confidence: 2 } } ] }
      ]
    }),
    y2018_uni_exam: (state) => ({
      text: `
        <h2>2018 · Üniversite Sınavı</h2>
        <p>Sınav hazırlığı ve tercih süreci başlıyor.</p>
      `,
      choices: [
        { label: 'Yoğun çalış (hedef yüksek)', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 10, happiness: -4 } } ] },
        { label: 'Dengeli hazırla', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 6 } } ] },
        { label: 'Kısıtlı hazırlan', next: 'y2019_uni_start', effects: [ { statDelta: { intelligence: 2, happiness: 2 } } ] },
        { label: 'Ara ver (gap year)', next: 'y2018_gap_year', effects: [ { statDelta: { happiness: 2 } } ] }
      ]
    }),
    y2019_uni_start: (state) => ({
      text: `
        <h2>2019 · Üniversite</h2>
        <p>Üniversiteye başlıyorsun. Bölüm ve çevre hayatını şekillendiriyor.</p>
      `,
      choices: [
        { label: 'Mühendislik/BT alanı', next: 'y2019_uni_life', effects: [ { statDelta: { intelligence: 4, confidence: 2 } }, { setFlag: { uniField: 'stem' } } ] },
        { label: 'İktisadi/İdari bilimler', next: 'y2019_uni_life', effects: [ { statDelta: { social: 3 } }, { setFlag: { uniField: 'econ' } } ] },
        { label: 'Sanat/Tasarım', next: 'y2019_uni_life', effects: [ { statDelta: { happiness: 4, confidence: 2 } }, { setFlag: { uniField: 'design' } } ] }
      ]
    }),
    y2019_uni_life: (state) => ({
      text: `
        <h2>2019 · Kampüs Yaşamı</h2>
        <p>Kampüste ilk kararların.</p>
      `,
      choices: [
        { label: 'Yurt ve çalışma planı', next: 'y2019_uni_check', effects: [ { statDelta: { discipline: 2, focus: 2 } } ] },
        { label: 'Part-time iş', next: 'y2019_uni_check', effects: [ { statDelta: { money: 400, confidence: 1 } } ] },
        { label: 'Kulüplere ağırlık ver', next: 'y2019_uni_check', effects: [ { statDelta: { social: 2, happiness: 1 } } ] }
      ]
    }),
    y2019_uni_check: (state) => ({
      text: `
        <h2>2019 · Bölüm Kabul Kontrolü</h2>
        <p>Bölüm gereksinimlerine göre değerlendiriliyorsun.</p>
      `,
      choices: [
        { label: 'Değerlendir', next: (() => {
          const s = state.data.stats; const f = state.data.flags.uniField;
          let score = 0, threshold = 0;
          if (f === 'stem') { score = Math.round(s.intelligence*0.6 + s.focus*0.25 + s.discipline*0.15); threshold = 65; }
          else if (f === 'design') { score = Math.round(s.creativity*0.6 + s.confidence*0.2 + s.focus*0.2); threshold = 60; }
          else { score = Math.round(s.intelligence*0.4 + s.social*0.3 + s.confidence*0.3); threshold = 55; }
          return score >= threshold ? 'y2020_pandemic' : 'y2019_uni_prep';
        })() },
        { label: 'B planı: Bölüm değiştir', next: 'y2019_change_major' },
        { label: 'Hazırlık kampı (ücretli)', next: 'y2019_uni_prep', effects: [ { statDelta: { money: -400, focus: 2, discipline: 2 } } ] }
      ]
    }),
    y2019_change_major: (state) => ({
      text: `
        <h2>2019 · Bölüm Değiştirme</h2>
        <p>Yeteneklerine daha uygun bir alana yöneliyorsun.</p>
      `,
      choices: [
        { label: 'STEM seç', next: 'y2019_uni_check', effects: [ { setFlag: { uniField: 'stem' } }, { statDelta: { confidence: 1 } } ] },
        { label: 'Tasarım/Sanat seç', next: 'y2019_uni_check', effects: [ { setFlag: { uniField: 'design' } }, { statDelta: { happiness: 1 } } ] },
        { label: 'İktisadi/İdari seç', next: 'y2019_uni_check', effects: [ { setFlag: { uniField: 'econ' } } ] }
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
    y2020_pandemic: (state) => ({
      text: `
        <h2>2020 · Pandemi</h2>
        <p>Uzaktan eğitim ve belirsizlik.</p>
      `,
      choices: [
        { label: 'Program oluştur', next: 'y2020_pandemic_schedule', effects: [ { statDelta: { intelligence: 4, confidence: 3, happiness: 1 } } ] },
        { label: 'Aileyle vakit', next: 'y2020_pandemic_family', effects: [ { statDelta: { happiness: 4, social: 3 } } ] },
        { label: 'Gönüllülük', next: 'y2020_pandemic_volunteer', effects: [ { statDelta: { social: 5, confidence: 2 } } ] }
      ]
    }),
    y2020_pandemic_schedule: (state) => ({
      text: `
        <h2>2020 · Günlük Plan</h2>
        <p>Planı nasıl uygularsın?</p>
      `,
      choices: [
        { label: 'Pomodoro', next: 'y2021_remote_intern', effects: [ { statDelta: { focus: 2 } } ] },
        { label: 'Çalışma grubu', next: 'y2021_remote_intern', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Derin çalışma', next: 'y2021_remote_intern', effects: [ { statDelta: { focus: 2, discipline: 1 } } ] }
      ]
    }),
    y2020_pandemic_family: (state) => ({
      text: `
        <h2>2020 · Aile Zamanı</h2>
        <p>Birlikte yapılacaklar.</p>
      `,
      choices: [
        { label: 'Yemek yapma', next: 'y2021_remote_intern', effects: [ { statDelta: { happiness: 1, social: 1 } } ] },
        { label: 'Film gecesi', next: 'y2021_remote_intern', effects: [ { statDelta: { happiness: 1 } } ] },
        { label: 'Ev düzeni', next: 'y2021_remote_intern', effects: [ { statDelta: { discipline: 1 } } ] }
      ]
    }),
    y2020_pandemic_volunteer: (state) => ({
      text: `
        <h2>2020 · Gönüllülük</h2>
        <p>Nerede katkı sağlarsın?</p>
      `,
      choices: [
        { label: 'Lojistik', next: 'y2021_remote_intern', effects: [ { statDelta: { endurance: 1, empathy: 1 } } ] },
        { label: 'Online mentorluk', next: 'y2021_remote_intern', effects: [ { statDelta: { social: 1, intelligence: 1 } } ] },
        { label: 'Bağış toplama', next: 'y2021_remote_intern', effects: [ { statDelta: { social: 1, confidence: 1 } } ] }
      ]
    }),
    y2021_remote_intern: (state) => ({
      text: `
        <h2>2021 · Uzaktan Deneyim</h2>
        <p>Staj/part-time iş fırsatı.</p>
      `,
      choices: [
        { label: 'Stajı kabul et', next: 'y2021_branch_intern', effects: [ { statDelta: { confidence: 4, money: 500 } } ] },
        { label: 'Sertifika programı', next: 'y2021_branch_cert', effects: [ { statDelta: { intelligence: 5, confidence: 2 } } ] },
        { label: 'Dinlen', next: 'y2021_branch_rest', effects: [ { statDelta: { happiness: 4, health: 3 } } ] }
      ]
    }),
    y2021_branch_intern: (state) => ({
      text: `
        <h2>2021 · Staj</h2>
        <p>Staj sürecini nasıl değerlendirirsin?</p>
      `,
      choices: [
        { label: 'Mentor bul', next: 'y2022_economy', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Görev odaklı', next: 'y2022_economy', effects: [ { statDelta: { discipline: 1 } } ] },
        { label: 'Ağ kur', next: 'y2022_economy', effects: [ { statDelta: { social: 2 } } ] }
      ]
    }),
    y2021_branch_cert: (state) => ({
      text: `
        <h2>2021 · Sertifika</h2>
        <p>Hangi içerik?</p>
      `,
      choices: [
        { label: 'Temel', next: 'y2022_economy', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'Orta', next: 'y2022_economy', effects: [ { statDelta: { intelligence: 2, focus: 1 } } ] },
        { label: 'İleri', next: 'y2022_economy', effects: [ { statDelta: { intelligence: 3, discipline: 1 } } ] }
      ]
    }),
    y2021_branch_rest: (state) => ({
      text: `
        <h2>2021 · Dinlenme</h2>
        <p>Neye odaklanırsın?</p>
      `,
      choices: [
        { label: 'Aile', next: 'y2022_economy', effects: [ { statDelta: { happiness: 1, empathy: 1 } } ] },
        { label: 'Sağlık', next: 'y2022_economy', effects: [ { statDelta: { health: 2 } } ] },
        { label: 'Hobi', next: 'y2022_economy', effects: [ { statDelta: { happiness: 1, creativity: 1 } } ] }
      ]
    }),
    y2022_economy: (state) => ({
      text: `
        <h2>2022 · Bütçe</h2>
        <p>Maliyetler arttı, bütçe yönetimi.</p>
      `,
      choices: [
        { label: 'Giderleri optimize et', next: 'y2022_path_optimize', effects: [ { statDelta: { confidence: 2, happiness: -1 } } ] },
        { label: 'Aile desteği', next: 'y2022_path_support2', effects: [ { statDelta: { money: 600, happiness: 2 } } ] },
        { label: 'Freelance çalış', next: 'y2022_path_freelance', effects: [ { statDelta: { money: 800, confidence: 3, happiness: -1 } } ] }
      ]
    }),
    y2022_path_optimize: (state) => ({
      text: `
        <h2>2022 · Optimizasyon</h2>
        <p>Hangi kalemler?</p>
      `,
      choices: [
        { label: 'Barınma', next: 'y2023_volunteer', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Ulaşım', next: 'y2023_volunteer', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Gıda', next: 'y2023_volunteer', effects: [ { statDelta: { discipline: 1 } } ] }
      ]
    }),
    y2022_path_support2: (state) => ({
      text: `
        <h2>2022 · Destek</h2>
        <p>Kaynağı nasıl kullanırsın?</p>
      `,
      choices: [
        { label: 'Eğitim', next: 'y2023_volunteer', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'Sağlık', next: 'y2023_volunteer', effects: [ { statDelta: { health: 1 } } ] },
        { label: 'Sosyal', next: 'y2023_volunteer', effects: [ { statDelta: { social: 1 } } ] }
      ]
    }),
    y2022_path_freelance: (state) => ({
      text: `
        <h2>2022 · Freelance</h2>
        <p>Hangi tarz işler?</p>
      `,
      choices: [
        { label: 'Kısa işler', next: 'y2023_volunteer', effects: [ { statDelta: { money: 200 } } ] },
        { label: 'Uzun kontrat', next: 'y2023_volunteer', effects: [ { statDelta: { money: 500, focus: 1 } } ] },
        { label: 'Proje tabanlı', next: 'y2023_volunteer', effects: [ { statDelta: { money: 300, confidence: 1 } } ] }
      ]
    }),
    y2023_volunteer: (state) => ({
      text: `
        <h2>2023 · Dayanışma</h2>
        <p>Katkı sağlamak ister misin?</p>
      `,
      choices: [
        { label: 'Gönüllü çalış', next: 'y2023_path_vol', effects: [ { statDelta: { social: 6, confidence: 3, happiness: 2 } } ] },
        { label: 'Maddi destek', next: 'y2023_path_donate', effects: [ { statDelta: { money: -200, happiness: 2 } } ] },
        { label: 'Uzaktan organizasyon', next: 'y2023_path_remote', effects: [ { statDelta: { intelligence: 2, social: 3 } } ] }
      ]
    }),
    y2023_path_vol: (state) => ({
      text: `
        <h2>2023 · Sahada</h2>
        <p>Hangi görev?</p>
      `,
      choices: [
        { label: 'Lojistik', next: 'y2024_career', effects: [ { statDelta: { endurance: 1 } } ] },
        { label: 'Koordinasyon', next: 'y2024_career', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Psikososyal destek', next: 'y2024_career', effects: [ { statDelta: { empathy: 2 } } ] }
      ]
    }),
    y2023_path_donate: (state) => ({
      text: `
        <h2>2023 · Destek</h2>
        <p>Nereye bağış?</p>
      `,
      choices: [
        { label: 'Eğitim', next: 'y2024_career', effects: [ { statDelta: { happiness: 1 } } ] },
        { label: 'Sağlık', next: 'y2024_career', effects: [ { statDelta: { happiness: 1 } } ] },
        { label: 'Barınma', next: 'y2024_career', effects: [ { statDelta: { happiness: 1 } } ] }
      ]
    }),
    y2023_path_remote: (state) => ({
      text: `
        <h2>2023 · Uzaktan Organizasyon</h2>
        <p>Hangi rol?</p>
      `,
      choices: [
        { label: 'İletişim', next: 'y2024_career', effects: [ { statDelta: { social: 1 } } ] },
        { label: 'Planlama', next: 'y2024_career', effects: [ { statDelta: { intelligence: 1, focus: 1 } } ] },
        { label: 'Kaynak geliştirme', next: 'y2024_career', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2024_career: (state) => ({
      text: `
        <h2>2024 · Yol Ayrımı</h2>
        <p>Uzmanlaşma seçimleri.</p>
      `,
      choices: [
        { label: 'Kurumsal', next: 'y2024_corp_path', effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'Start-up', next: 'y2024_startup_path', effects: [ { statDelta: { confidence: 5 } } ] },
        { label: 'Akademi', next: 'y2024_acad_path', effects: [ { statDelta: { intelligence: 3, confidence: 2 } } ] }
      ]
    }),
    y2024_corp_path: (state) => ({
      text: `
        <h2>2024 · Kurumsal Yol</h2>
        <p>İşe giriş stratejisi.</p>
      `,
      choices: [
        { label: 'CV ve referans', next: 'y2025_outcome', effects: [ { statDelta: { confidence: 1, money: 1200 } } ] },
        { label: 'Sertifika ile güçlendir', next: 'y2025_outcome', effects: [ { statDelta: { intelligence: 1, money: 900 } } ] },
        { label: 'Networking', next: 'y2025_outcome', effects: [ { statDelta: { social: 2, money: 1000 } } ] }
      ]
    }),
    y2024_startup_path: (state) => ({
      text: `
        <h2>2024 · Start-up Yol</h2>
        <p>Ürün/market uyumu.</p>
      `,
      choices: [
        { label: 'MVP çıkar', next: 'y2025_outcome', effects: [ { statDelta: { confidence: 2, money: 800 } } ] },
        { label: 'Ön satış', next: 'y2025_outcome', effects: [ { statDelta: { social: 1, money: 1000 } } ] },
        { label: 'İnkübasyon', next: 'y2025_outcome', effects: [ { statDelta: { intelligence: 1, confidence: 1, money: 900 } } ] }
      ]
    }),
    y2024_acad_path: (state) => ({
      text: `
        <h2>2024 · Akademik Yol</h2>
        <p>Akademik hazırlık.</p>
      `,
      choices: [
        { label: 'Yayın/Poster', next: 'y2025_outcome', effects: [ { statDelta: { intelligence: 2, confidence: 1 } } ] },
        { label: 'Araştırma asistanlığı', next: 'y2025_outcome', effects: [ { statDelta: { intelligence: 1, money: 600 } } ] },
        { label: 'Dil skoru', next: 'y2025_outcome', effects: [ { statDelta: { focus: 1, confidence: 1 } } ] }
      ]
    }),
    y2025_outcome: (state) => ({
      text: `
        <h2>2025 · Sonuç</h2>
        <p>Devam ederek 2030 yoluna geçebilirsin. Hedef: ${state.data.flags.goal || '—'}</p>
      `,
      choices: [
        { label: 'Devam (2030)', next: 'y2026_growth' },
        { label: 'Başa dön', next: () => { state.data.flags.restart = true; return 'intro'; } }
      ]
    }),
    y2026_growth: (state) => ({
      text: `
        <h2>2026 · Gelişim Yılı</h2>
        <p>Önündeki fırsatlar: spor, girişim, akademi veya keşif.</p>
      `,
      choices: [
        { label: 'Spor', next: 'y2027_sports' },
        { label: 'Girişim', next: 'y2027_startup' },
        { label: 'Akademi', next: 'y2027_academia' },
        { label: 'Seyahat', next: 'y2027_travel' },
        { label: 'Servet yoluna gir', next: 'y2026_wealth_intro' },
        { label: 'Sağlık (Tıp) yoluna gir', next: 'y2026_med_intro' },
        { label: 'Mühendislik yoluna gir', next: 'y2026_eng_intro' },
        { label: 'Mimarlık yoluna gir', next: 'y2026_arch_intro' },
        { label: 'İthalat/İhracat yoluna gir', next: 'y2026_trade_intro' }
      ]
    }),
    // İthalat/İhracat hedefi
    y2026_trade_intro: (state) => ({
      text: `
        <h2>2026 · Dış Ticaret Planı</h2>
        <p>Pazar, tedarikçi ve teslim şekilleri.</p>
      `,
      choices: [
        { label: 'Pazar araştırması', next: 'y2027_trade_ops', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'Tedarikçi bul', next: 'y2027_trade_ops', effects: [ { statDelta: { social: 1 } } ] },
        { label: 'Finansman', next: 'y2027_trade_ops', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2027_trade_ops: (state) => ({
      text: `
        <h2>2027 · Operasyon</h2>
        <p>INCOTERMS ve ödeme yöntemleri.</p>
      `,
      choices: [
        { label: 'FOB + LC (güvenli)', next: 'y2028_trade_case', effects: [ { statDelta: { money: -500 } } ] },
        { label: 'CIF + CAD (dengeli)', next: 'y2028_trade_case', effects: [ { statDelta: { money: -300 } } ] },
        { label: 'EXW + TT (riskli)', next: 'y2028_trade_case', effects: [ { statDelta: { money: -200 } } ] }
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
    y2026_arch_intro: (state) => ({
      text: `
        <h2>2026 · Mimarlık Planı</h2>
        <p>Kavramsal tasarım ve uygulama.</p>
      `,
      choices: [
        { label: 'Stüdyo projesi', next: 'y2027_arch_studio' },
        { label: 'Şantiye deneyimi', next: 'y2027_arch_site' },
        { label: 'Yarışma', next: 'y2027_arch_comp' }
      ]
    }),
    y2027_arch_studio: (state) => ({
      text: `
        <h2>2027 · Stüdyo</h2>
        <p>Konsept belirle.</p>
      `,
      choices: [
        { label: 'Sürdürülebilir', next: 'y2028_arch_cases', effects: [ { statDelta: { creativity: 1 } } ] },
        { label: 'Minimal', next: 'y2028_arch_cases', effects: [ { statDelta: { focus: 1 } } ] },
        { label: 'Parametrik', next: 'y2028_arch_cases', effects: [ { statDelta: { intelligence: 1 } } ] }
      ]
    }),
    y2027_arch_site: (state) => ({
      text: `
        <h2>2027 · Şantiye</h2>
        <p>Detay ve uygulama öğren.</p>
      `,
      choices: [
        { label: 'Detay çizim', next: 'y2028_arch_cases', effects: [ { statDelta: { discipline: 1 } } ] },
        { label: 'Malzeme tedarik', next: 'y2028_arch_cases', effects: [ { statDelta: { social: 1 } } ] },
        { label: 'Keşif–metraj', next: 'y2028_arch_cases', effects: [ { statDelta: { intelligence: 1 } } ] }
      ]
    }),
    y2027_arch_comp: (state) => ({
      text: `
        <h2>2027 · Yarışma</h2>
        <p>Brief’e uygun tasarım.</p>
      `,
      choices: [
        { label: 'Konsept', next: 'y2028_arch_cases', effects: [ { statDelta: { creativity: 1 } } ] },
        { label: 'İşbirliği', next: 'y2028_arch_cases', effects: [ { statDelta: { social: 1 } } ] },
        { label: 'Sunum', next: 'y2028_arch_cases', effects: [ { statDelta: { confidence: 1 } } ] }
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
    y2026_eng_intro: (state) => ({
      text: `
        <h2>2026 · Mühendislik Planı</h2>
        <p>Uzmanlaşma ve proje hedefi.</p>
      `,
      choices: [
        { label: 'Alan seç (Yazılım/Elektrik/Mekanik)', next: 'y2026_eng_field' },
        { label: 'Staj/iş bul', next: 'y2027_eng_intern' },
        { label: 'Sertifika/konferans', next: 'y2027_eng_cert' }
      ]
    }),
    y2026_eng_field: (state) => ({
      text: `
        <h2>Alan Seçimi</h2>
        <p>Hangi alan?</p>
      `,
      choices: [
        { label: 'Yazılım', next: () => { state.data.flags.engField = 'soft'; return 'y2027_eng_intern'; } },
        { label: 'Elektrik', next: () => { state.data.flags.engField = 'elec'; return 'y2027_eng_intern'; } },
        { label: 'Mekanik', next: () => { state.data.flags.engField = 'mech'; return 'y2027_eng_intern'; } }
      ]
    }),
    y2027_eng_intern: (state) => ({
      text: `
        <h2>2027 · Staj</h2>
        <p>Deneyim kazan.</p>
      `,
      choices: [
        { label: 'Kurumsal', next: 'y2028_eng_project', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Start-up', next: 'y2028_eng_project', effects: [ { statDelta: { social: 1, confidence: 1 } } ] },
        { label: 'Araştırma lab', next: 'y2028_eng_project', effects: [ { statDelta: { intelligence: 1 } } ] }
      ]
    }),
    y2027_eng_cert: (state) => ({
      text: `
        <h2>2027 · Sertifika</h2>
        <p>Hangi sertifika?</p>
      `,
      choices: [
        { label: 'Bulut/DevOps', next: 'y2028_eng_project', effects: [ { statDelta: { intelligence: 1, confidence: 1 } } ] },
        { label: 'Gömülü/PCB', next: 'y2028_eng_project', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'CAD/Simülasyon', next: 'y2028_eng_project', effects: [ { statDelta: { intelligence: 1, focus: 1 } } ] }
      ]
    }),
    y2028_eng_project: (state) => ({
      text: `
        <h2>2028 · Proje</h2>
        <p>Alanına uygun bir proje tamamla.</p>
      `,
      choices: [
        { label: 'Güvenli: Bilinen çözüm', next: 'y2029_eng_offer', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dengeli: Optimize et', next: 'y2029_eng_offer', effects: [ { statDelta: { intelligence: 1, confidence: 1 } } ] },
        { label: 'Riskli: Yeni yaklaşım', next: 'y2029_eng_offer', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Uygulama sınavı (30 problem)', next: 'y2028_eng_cases' }
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
        <h2>2029 · Teklif</h2>
        <p>İş görüşmeleri.</p>
      `,
      choices: [
        { label: 'Teknik mülakat', next: () => { const s = state.data.stats; const score = Math.round(s.intelligence*0.6 + s.focus*0.2 + s.confidence*0.2); return score >= 70 ? 'y2030_eng_eval' : 'y2029_eng_retry'; } },
        { label: 'Ağ üzerinden fırsat', next: 'y2030_eng_eval', effects: [ { statDelta: { social: 1 } } ] },
        { label: 'Yurt dışı başvur', next: 'y2030_eng_eval', effects: [ { numberDelta: { travelCount: 1 } }, { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2029_eng_retry: (state) => ({
      text: `
        <h2>2029 · Tekrar Deneme</h2>
        <p>Biraz daha hazırlık.</p>
      `,
      choices: [
        { label: 'Algoritma çalış', next: 'y2029_eng_offer', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Mock interview', next: 'y2029_eng_offer', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Portföyü güçlendir', next: 'y2029_eng_offer', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2030_eng_eval: (state) => ({
      text: `
        <h2>2030 · Mühendislik Değerlendirmesi</h2>
        <p>Hedef kontrolü.</p>
      `,
      choices: [
        { label: 'Hedefi değerlendir', next: 'goal_eval' },
        { label: 'Devam', next: 'y2030_outcome' }
      ]
    }),
    // Doktor ol hedefi
    y2026_med_intro: (state) => ({
      text: `
        <h2>2026 · Tıp Yolculuğu</h2>
        <p>Hekimlikte ilerlemek için plan yap.</p>
      `,
      choices: [
        { label: 'TUS hazırlığı', next: 'y2027_tus_prep', effects: [ { statDelta: { intelligence: 2, discipline: 2, focus: 2 } } ] },
        { label: 'Klinik rotasyonlar', next: 'y2027_clinical_rot', effects: [ { statDelta: { empathy: 1, confidence: 1 } } ] },
        { label: 'Araştırma/gönüllülük', next: 'y2027_med_vol', effects: [ { statDelta: { intelligence: 1, social: 1 } } ] }
      ]
    }),
    y2027_tus_prep: (state) => ({
      text: `
        <h2>2027 · TUS Hazırlığı</h2>
        <p>Hazırlık yöntemi.</p>
      `,
      choices: [
        { label: 'Kurs (güvenli)', next: 'y2028_tus_exam', effects: [ { statDelta: { money: -800, intelligence: 2, focus: 1 } } ] },
        { label: 'Çalışma grubu (dengeli)', next: 'y2028_tus_exam', effects: [ { statDelta: { social: 1, discipline: 1 } } ] },
        { label: 'Tek başıma (riskli)', next: 'y2028_tus_exam', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2028_tus_exam: (state) => ({
      text: `
        <h2>2028 · TUS</h2>
        <p>Uzmanlık sınavı.</p>
      `,
      choices: [
        { label: 'Sonucu gör', next: () => {
          const s = state.data.stats; const score = Math.round(s.intelligence*0.5 + s.discipline*0.3 + s.focus*0.2);
          return score >= 75 ? 'y2029_residency_start' : 'y2028_tus_retry';
        } }
      ]
    }),
    y2028_tus_retry: (state) => ({
      text: `
        <h2>2028 · TUS Tekrar</h2>
        <p>İlk deneme yetmedi. Nasıl devam?</p>
      `,
      choices: [
        { label: 'Yoğun tekrar', next: 'y2028_tus_exam', effects: [ { statDelta: { intelligence: 1, discipline: 2 } } ] },
        { label: 'Klinik deneyim', next: 'y2027_clinical_rot', effects: [ { statDelta: { empathy: 1 } } ] },
        { label: 'Vazgeç ve farklı yol', next: 'y2026_growth' }
      ]
    }),
    y2027_clinical_rot: (state) => ({
      text: `
        <h2>2027 · Klinik Rotasyonlar</h2>
        <p>Hangi birim?</p>
      `,
      choices: [
        { label: 'Acil', next: 'y2028_case_rng', effects: [ { statDelta: { confidence: 1 } } ] },
        { label: 'Dahiliye', next: 'y2028_case_rng', effects: [ { statDelta: { intelligence: 1 } } ] },
        { label: 'Pediatri', next: 'y2028_case_rng', effects: [ { statDelta: { empathy: 1 } } ] }
      ]
    }),
    y2027_med_vol: (state) => ({
      text: `
        <h2>2027 · Gönüllü Sağlık</h2>
        <p>Kaynak kısıtlı bölgede kısa görev.</p>
      `,
      choices: [
        { label: 'Sahada yardım', next: 'y2028_case_rng', effects: [ { statDelta: { empathy: 2, confidence: 1 } } ] },
        { label: 'Eğitim ver', next: 'y2028_case_rng', effects: [ { statDelta: { social: 1, intelligence: 1 } } ] },
        { label: 'Kaynak toplama', next: 'y2028_case_rng', effects: [ { statDelta: { social: 1 } } ] }
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
        { label: 'TUS’a dön', next: 'y2028_tus_exam' },
        { label: 'Tıp yoluna dön', next: 'y2026_med_intro' }
      ]
    }),
    y2029_residency_start: (state) => ({
      text: `
        <h2>2029 · Asistanlık</h2>
        <p>Nöbet, etik ve eğitim dengesi.</p>
      `,
      choices: [
        { label: 'Nöbet ağırlıklı (gelir)', next: 'y2030_med_eval', effects: [ { statDelta: { money: 800, health: -2 } } ] },
        { label: 'Eğitim ağırlıklı (kariyer)', next: 'y2030_med_eval', effects: [ { statDelta: { intelligence: 2 } } ] },
        { label: 'Dengeli', next: 'y2030_med_eval', effects: [ { statDelta: { confidence: 1, health: -1 } } ] }
      ]
    }),
    y2030_med_eval: (state) => ({
      text: `
        <h2>2030 · Tıp Değerlendirmesi</h2>
        <p>Hedefi kontrol et.</p>
      `,
      choices: [
        { label: 'Hedefi değerlendir', next: 'goal_eval' },
        { label: 'Devam', next: 'y2030_outcome' }
      ]
    }),
    // Servet hedefi yolu
    y2026_wealth_intro: (state) => ({
      text: `
        <h2>2026 · Servet Stratejisi</h2>
        <p>Yüksek servete ulaşmak için bir strateji belirlemelisin.</p>
      `,
      choices: [
        { label: 'Bütçe disiplini', next: 'y2026_wealth_strategy', effects: [ { statDelta: { discipline: 2, focus: 1 } } ] },
        { label: 'Kariyeri büyüt', next: 'y2027_wealth_career', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Yatırıma başla', next: 'y2027_wealth_invest', effects: [ { statDelta: { intelligence: 1 } } ] }
      ]
    }),
    y2026_wealth_strategy: (state) => ({
      text: `
        <h2>2026 · Plan</h2>
        <p>İzlenecek ana yol?</p>
      `,
      choices: [
        { label: 'Kariyeri büyüt', next: 'y2027_wealth_career' },
        { label: 'Yatırıma başla', next: 'y2027_wealth_invest' },
        { label: 'Kumar oyna (zar oyunu)', next: () => { state.data.flags.returnScene = 'y2026_wealth_strategy'; return 'game_dice_intro'; } },
        { label: 'Blackjack (21) oyna', next: () => { state.data.flags.returnScene = 'y2026_wealth_strategy'; return 'game_bj_intro'; } },
        { label: 'Pişti oyna', next: () => { state.data.flags.returnScene = 'y2026_wealth_strategy'; return 'game_pisti_intro'; } }
      ]
    }),
    y2027_wealth_career: (state) => ({
      text: `
        <h2>2027 · Kariyer Büyütme</h2>
        <p>Geliri nasıl artırırsın?</p>
      `,
      choices: [
        { label: 'Maaş pazarlığı (güvenli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: (state.data.stats.confidence >= 60 ? 800 : 400), confidence: 1 } } ] },
        { label: 'Yan iş (dengeli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: 700, focus: -1 } } ] },
        { label: 'Taşın ve fırsat kovala (riskli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: (Math.random() < 0.5 ? 1200 : -600), confidence: 2, social: 1 } } ] },
        { label: 'Kredi çek (kaldıraç)', next: 'y2027_wealth_credit' }
      ]
    }),
    y2027_wealth_credit: (state) => ({
      text: `
        <h2>2027 · Kredi</h2>
        <p>İş/yaşam kaldıraç için kredi kullanıyorsun.</p>
      `,
      choices: [
        { label: 'Makul tutar (güvenli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: 1000 } }, { setFlag: { loanInterest: true } } ] },
        { label: 'Orta tutar (dengeli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: 1600 } }, { setFlag: { loanInterest: true } } ] },
        { label: 'Yüksek kaldıraç (riskli)', next: 'y2028_wealth_business', effects: [ { statDelta: { money: 2500 } }, { setFlag: { loanInterest: true } } ] }
      ]
    }),
    y2027_wealth_invest: (state) => ({
      text: `
        <h2>2027 · Yatırım</h2>
        <p>Risk profilini seç.</p>
      `,
      choices: [
        { label: 'Güvenli (endeks/mevduat)', next: 'y2028_wealth_business', effects: [ (() => {
          const s = state.data.stats; const money = s.money || 0; const stake = Math.max(200, Math.round(money * 0.2));
          const luck = s.luck || 50; const bias = (luck - 50) / 200; // -0.25..+0.25
          const pct = (Math.random() * 0.10 - 0.02) + bias; // ~ -2%..+8% biased
          const delta = Math.round(stake * pct);
          return { statDelta: { money: delta } };
        })() ] },
        { label: 'Dengeli (fon/gayrimenkul)', next: 'y2028_wealth_business', effects: [ (() => {
          const s = state.data.stats; const money = s.money || 0; const stake = Math.max(300, Math.round(money * 0.3));
          const luck = s.luck || 50; const bias = (luck - 50) / 150;
          const pct = (Math.random() * 0.30 - 0.10) + bias; // -10%..+20% biased
          const delta = Math.round(stake * pct);
          return { statDelta: { money: delta } };
        })() ] },
        { label: 'Riskli (kaldıraç/kripto)', next: 'y2028_wealth_business', effects: [ (() => {
          const s = state.data.stats; const money = s.money || 0; const stake = Math.max(400, Math.round(money * 0.4));
          const luck = s.luck || 50; const bias = (luck - 50) / 100;
          const pct = (Math.random() * 1.00 - 0.40) + bias; // -40%..+60% biased
          const delta = Math.round(stake * pct);
          return { statDelta: { money: delta, happiness: delta >= 0 ? 1 : -1 } };
        })() ] }
      ]
    }),
    y2028_wealth_business: (state) => ({
      text: `
        <h2>2028 · İş/Operasyon</h2>
        <p>Hangi yoldan ölçeklenir?</p>
      `,
      choices: [
        { label: 'Küçük işletme (dengeli)', next: 'y2028_wealth_shocks', effects: [ (() => {
          const s = state.data.stats; const base = Math.max(300, Math.round(s.money * 0.1));
          const pct = (Math.random() * 0.40 - 0.10); // -10%..+30%
          const delta = Math.round(base * pct);
          return { statDelta: { money: delta, confidence: delta > 0 ? 1 : 0 } };
        })() ] },
        { label: 'Franchise (güvenli maliyet, sınırlı kazanç)', next: 'y2028_wealth_shocks', effects: [ (() => {
          const cost = -1200; const gain = Math.random() < 0.7 ? 600 : 0; return { statDelta: { money: cost + gain } };
        })() ] },
        { label: 'E-ticaret (riskli ölçek)', next: 'y2028_wealth_shocks', effects: [ (() => {
          const base = 500; const swing = Math.round((Math.random() * 2 - 0.8) * 800); return { statDelta: { money: base + swing } };
        })() ] },
        { label: 'Acil durum fonu ayır', next: 'y2028_wealth_emergency' }
      ]
    }),
    y2028_wealth_emergency: (state) => ({
      text: `
        <h2>2028 · Acil Durum Fonu</h2>
        <p>Beklenmedik giderlere karşı yastık oluştur.</p>
      `,
      choices: [
        { label: '3 aylık gider', next: 'y2028_wealth_shocks', effects: [ { statDelta: { money: -500 } }, { setFlag: { emergencyFund: true } } ] },
        { label: '6 aylık gider', next: 'y2028_wealth_shocks', effects: [ { statDelta: { money: -900 } }, { setFlag: { emergencyFund: true } } ] },
        { label: 'Vazgeç', next: 'y2028_wealth_shocks' }
      ]
    }),
    y2028_wealth_shocks: (state) => ({
      text: `
        <h2>2028 · Piyasa Şokları</h2>
        <p>Piyasa dalgalandı. Durumunu değerlendir.</p>
      `,
      choices: [
        { label: 'Devam et', next: 'y2029_wealth_tax', effects: [ (() => {
          const swing = Math.round((Math.random() * 2 - 1) * 600); return { statDelta: { money: swing } };
        })() ] },
        { label: 'Sigorta/hedge', next: 'y2029_wealth_tax', effects: [ { statDelta: { money: -200 } } ] },
        { label: 'Risk artır', next: 'y2029_wealth_tax', effects: [ { statDelta: { money: Math.round((Math.random() - 0.4) * 1200) } } ] }
      ]
    }),
    y2029_wealth_tax: (state) => ({
      text: `
        <h2>2029 · Vergi ve Uyum</h2>
        <p>Finansal yıl kapanışı.</p>
      `,
      choices: [
        { label: 'Tam uyum (güvenli)', next: 'y2029_wealth_manage', effects: [ { statDelta: { money: -200 } } ] },
        { label: 'Optimizasyon (dengeli)', next: 'y2029_wealth_manage', effects: [ { statDelta: { money: -100, confidence: 1 } } ] },
        { label: 'Kısayol dene (riskli)', next: 'y2029_wealth_manage', effects: [ { statDelta: { money: Math.random() < 0.4 ? 400 : -600, confidence: -1 } } ] }
      ]
    }),
    y2029_wealth_manage: (state) => ({
      text: `
        <h2>2029 · Servet Yönetimi</h2>
        <p>Portföy ve risk ayarı.</p>
      `,
      choices: [
        { label: 'Borç yönetimi', next: 'y2030_wealth_eval', effects: [ (() => {
          if (state.data.flags.loanInterest) { return { statDelta: { money: -400 } }; } return { statDelta: { confidence: 1 } };
        })() ] },
        { label: 'Sigorta ile koru', next: 'y2030_wealth_eval', effects: [ { statDelta: { money: -200 } }, { setFlag: { insured: true } } ] },
        { label: 'Çeşitlendir', next: 'y2030_wealth_eval', effects: [ (() => {
          const swing = Math.round((Math.random()*0.4 - 0.1) * 1000); return { statDelta: { money: swing } };
        })() ] },
        { label: 'Şüpheli teklif (risk)', next: 'y2030_wealth_eval', effects: [ { statDelta: { money: Math.round((Math.random()*2 - 1.2) * 1500) } } ] }
      ]
    }),
    y2030_wealth_eval: (state) => ({
      text: `
        <h2>2030 · Servet Değerlendirmesi</h2>
        <p>Varlık durumunu gözden geçir.</p>
      `,
      choices: [
        { label: 'Hedefi değerlendir', next: 'goal_eval' },
        { label: 'Devam et', next: 'y2030_outcome' },
        { label: 'Başa dön', next: 'intro' }
      ]
    }),
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
    y2027_startup: (state) => ({
      text: `
        <h2>2027 · Girişim Yılı</h2>
        <p>Bir ürün fikrin var. Nasıl ilerlersin?</p>
      `,
      choices: [
        { label: 'Mentor bul (güvenli)', next: 'y2028_startup_build', effects: [ { statDelta: { social: 2, confidence: 1 } } ] },
        { label: 'Hızlı MVP (dengeli)', next: 'y2028_startup_build', effects: [ { statDelta: { intelligence: 2, focus: 2 } } ] },
        { label: 'Agresif yatırım (riskli)', next: 'y2028_startup_build', effects: [ { statDelta: { money: -800, confidence: 3 } } ] }
      ]
    }),
    y2028_startup_build: (state) => ({
      text: `
        <h2>2028 · Ürün Geliştirme</h2>
        <p>Takım kur, lansman planı yap.</p>
      `,
      choices: [
        { label: 'Küçük ama yetkin ekip', next: 'y2029_startup_pitch', effects: [ { statDelta: { money: -600, social: 2 } } ] },
        { label: 'Freelance destek', next: 'y2029_startup_pitch', effects: [ { statDelta: { money: -300 } } ] },
        { label: 'Tek başına devam', next: 'y2029_startup_pitch', effects: [ { statDelta: { confidence: 2 } } ] }
      ]
    }),
    y2029_startup_pitch: (state) => ({
      text: `
        <h2>2029 · Yatırım Sunumu</h2>
        <p>Pitch günü geldi. Sunum ve sorular.</p>
      `,
      choices: [
        { label: 'Pitch yap', next: () => {
          const s = state.data.stats;
          const score = Math.round(s.confidence*0.45 + s.social*0.3 + s.intelligence*0.25);
          return score >= 65 ? 'y2030_startup_success' : 'y2030_startup_fail';
        } },
        { label: 'Demo gününü ertele', next: 'y2028_startup_build', effects: [ { statDelta: { confidence: -1 } } ] },
        { label: 'Stratejik ortak ara', next: 'y2030_startup_success', effects: [ { statDelta: { money: 1200, social: 2 } } ] }
      ]
    }),
    y2030_startup_success: (state) => ({
      text: `
        <h2>2030 · Girişim Başarısı</h2>
        <p>Yatırımı aldın ve büyüyorsun.</p>
      `,
      choices: [
        { label: 'Devam büyüt', next: 'y2030_outcome', effects: [ { statDelta: { money: 2000, confidence: 4 } } ] },
        { label: 'Kısmi nakde çevir', next: 'y2030_outcome', effects: [ { statDelta: { money: 1200, happiness: 2 } } ] },
        { label: 'Yurtdışına açıl', next: 'y2030_outcome', effects: [ { statDelta: { money: 800, social: 2, confidence: 2 } }, { numberDelta: { travelCount: 1 } } ] }
      ]
    }),
    y2030_startup_fail: (state) => ({
      text: `
        <h2>2030 · Zor Dönem</h2>
        <p>Yatırım olmadı. Yolu yeniden düşün.</p>
      `,
      choices: [
        { label: 'Tekrar dene', next: 'y2027_startup', effects: [ { statDelta: { confidence: -2 } } ] },
        { label: 'Kurumsala dön', next: 'y2024_career', effects: [ { statDelta: { confidence: -1 } } ] },
        { label: 'Pivot et', next: 'y2028_startup_build', effects: [ { statDelta: { money: -200, confidence: 1 } } ] }
      ]
    }),
    // Akademi yolu
    y2027_academia: (state) => ({
      text: `
        <h2>2027 · Akademik Hedef</h2>
        <p>Yüksek lisans/doktora niyeti.</p>
      `,
      choices: [
        { label: 'Yoğun araştırma (güvenli)', next: 'y2028_academia_apply', effects: [ { statDelta: { intelligence: 3, focus: 3 } } ] },
        { label: 'Dengeli çalışma', next: 'y2028_academia_apply', effects: [ { statDelta: { intelligence: 2, social: 1 } } ] },
        { label: 'Sosyal ağı genişlet', next: 'y2028_academia_apply', effects: [ { statDelta: { social: 3, confidence: 1 } } ] }
      ]
    }),
    y2028_academia_apply: (state) => ({
      text: `
        <h2>2028 · Başvuru</h2>
        <p>Referans, yayın ve dil skoru.</p>
      `,
      choices: [
        { label: 'Başvur', next: () => {
          const s = state.data.stats;
          const score = Math.round(s.intelligence*0.55 + s.focus*0.25 + s.discipline*0.2);
          return score >= 72 ? 'y2029_academia_accept' : 'y2029_academia_reject';
        } }
      ]
    }),
    y2029_academia_accept: (state) => ({
      text: `
        <h2>2029 · Kabul</h2>
        <p>Programdan kabul aldın.</p>
      `,
      choices: [
        { label: 'Devam', next: 'y2030_outcome', effects: [ { statDelta: { intelligence: 2, confidence: 2 } } ] },
        { label: 'Burs görüşmesi', next: 'y2030_outcome', effects: [ { statDelta: { money: 600, confidence: 1 } } ] },
        { label: 'Ara ver', next: 'y2026_growth', effects: [ { statDelta: { happiness: 2 } } ] }
      ]
    }),
    y2029_academia_reject: (state) => ({
      text: `
        <h2>2029 · Red</h2>
        <p>Kabul gelmedi. Strateji değiş.</p>
      `,
      choices: [
        { label: 'Araştırmaya devam', next: 'y2027_academia', effects: [ { statDelta: { focus: 2 } } ] },
        { label: 'İş piyasası', next: 'y2024_career' },
        { label: 'Alan değiştir', next: 'y2027_academia', effects: [ { statDelta: { confidence: 1 } }, { addTrait: 'multiDisciplinary' } ] }
      ]
    }),
    // Seyahat yolu
    y2027_travel: (state) => ({
      text: `
        <h2>2027 · Seyahat Planı</h2>
        <p>Dünyayı tanıma isteği.</p>
      `,
      choices: [
        { label: 'Ucuz rota (güvenli)', next: 'y2028_travel_hop', effects: [ { numberDelta: { travelCount: 1 } }, { statDelta: { money: -300, happiness: 2 } } ] },
        { label: 'Dengeli rota', next: 'y2028_travel_hop', effects: [ { numberDelta: { travelCount: 2 } }, { statDelta: { money: -600, happiness: 3 } } ] },
        { label: 'Lüks rota (riskli)', next: 'y2028_travel_hop', effects: [ { numberDelta: { travelCount: 3 } }, { statDelta: { money: -1500, happiness: 4 } } ] }
      ]
    }),
    y2028_travel_hop: (state) => ({
      text: `
        <h2>2028 · Yeni Durak</h2>
        <p>Yeni ülke/şehir.</p>
      `,
      choices: [
        { label: 'Yerel etkinlik', next: 'y2029_travel_wrap', effects: [ { statDelta: { social: 2 } }, { numberDelta: { travelCount: 1 } } ] },
        { label: 'Kısa çalışma vizesi', next: 'y2029_travel_wrap', effects: [ { statDelta: { money: 400, confidence: 1 } } ] },
        { label: 'Turistik gezi', next: 'y2029_travel_wrap', effects: [ { statDelta: { happiness: 2 } } ] },
        { label: 'Vize/rota/lojistik sınavı (30 soru)', next: 'y2028_travel_cases' }
      ]
    }),
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
    y2029_travel_wrap: (state) => ({
      text: `
        <h2>2029 · Yolculuk</h2>
        <p>Yeni deneyimler kattın.</p>
      `,
      choices: [
        { label: 'Devam', next: 'y2030_outcome' },
        { label: 'Gezi blogu aç', next: 'y2030_outcome', effects: [ { statDelta: { confidence: 1, money: 200 } } ] },
        { label: 'Türkiye’ye dön ve iş bak', next: 'y2024_career', effects: [ { statDelta: { confidence: 1 } } ] }
      ]
    }),
    y2030_outcome: (state) => ({
      text: `
        <h2>2030 · Büyük Değerlendirme</h2>
        <p>Seçimler toplam sonucu belirledi.</p>
      `,
      choices: [
        { label: 'Hedefi değerlendir', next: 'goal_eval' },
        { label: 'Yeni rota çiz', next: 'y2026_growth' },
        { label: 'Başa dön', next: 'intro' }
      ]
    }),
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
    y2027_sports: (state) => ({
      text: `
        <h2>2027 · Spor</h2>
        <p>Antrenman planı seç.</p>
      `,
      choices: [
        { label: 'Antrenör ile çalış', next: 'y2028_sports_national', effects: [ { statDelta: { health: 6, confidence: 2 } } ] },
        { label: 'Kendi programın', next: 'y2028_sports_national', effects: [ { statDelta: { health: 4 } } ] },
        { label: 'Vazgeç ve geri dön', next: 'y2026_growth' }
      ]
    }),
    y2028_sports_national: (state) => ({
      text: `
        <h2>2028 · Seçmeler</h2>
        <p>Milli seçmelere katıl ya da yerel ligde kal.</p>
      `,
      choices: [
        { label: 'Seçmelere katıl', next: 'y2029_sports_international', effects: [ { statDelta: { confidence: 2 } } ] },
        { label: 'Yerel ligde kal', next: 'y2030_outcome', effects: [ { statDelta: { health: 1 } } ] },
        { label: 'Antrenman kampı', next: 'y2029_sports_international', effects: [ { statDelta: { health: 2, endurance: 2 } }, { numberDelta: { training: 1 } } ] }
      ]
    }),
    y2029_sports_international: (state) => ({
      text: `
        <h2>2029 · Uluslararası</h2>
        <p>Uluslararası turnuvaya katılıyorsun.</p>
      `,
      choices: [
        { label: 'Devam', next: 'y2030_outcome', effects: [ { statDelta: { confidence: 3 } } ] },
        { label: 'Taktik/strateji çalış (30 problem)', next: 'y2029_sport_cases' },
        { label: 'Sponsor ara', next: 'y2030_outcome', effects: [ { statDelta: { money: 800, confidence: 1 } } ] },
        { label: 'Zor antrenman (sakatlık riski)', next: 'y2029_sports_injury', effects: [ { statDelta: { health: -3, endurance: 2 } }, { numberDelta: { training: 1 } } ] }
      ]
    }),
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
        <p>Küçük bir sakatlık yaşadın. Rotanı ayarla.</p>
      `,
      choices: [
        { label: 'Dinlen', next: 'y2030_outcome', effects: [ { statDelta: { health: 4, endurance: -1 } } ] },
        { label: 'Bandajla devam', next: 'y2030_outcome', effects: [ { statDelta: { confidence: 1, health: -1 } } ] },
        { label: 'Fizyoterapi', next: 'y2030_outcome', effects: [ { statDelta: { money: -300, health: 2 } } ] }
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


