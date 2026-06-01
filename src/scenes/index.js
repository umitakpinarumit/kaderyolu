import { GOALS } from '../game/Goals.js';

/* ─── Yardımcılar ──────────────────────────────────────────────────────── */
const SL = {
  health:'Sağlık', endurance:'Dayanıklılık', strength:'Güç', agility:'Çeviklik',
  intelligence:'Zekâ', creativity:'Yaratıcılık', discipline:'Disiplin', focus:'Odak',
  confidence:'Özgüven', charisma:'Karizma', empathy:'Empati', social:'Sosyal',
  happiness:'Mutluluk', luck:'Şans', money:'Para ₺', training:'Antrenman', travelCount:'Seyahat'
};
const TRAIT_LABELS = {
  babaSevgisi:'Baba Sevgisi', anneSevgisi:'Anne Sevgisi', sabirli:'Sabırlı',
  yatirimciAdayi:'Yatırımcı Adayı', vocElektrik:'Elektrik Teknikeri',
  vocBilisim:'Bilişim Teknikeri', vocMotor:'Motorcu', elektrikCirak:'Elektrik Çırağı',
  mobilyaCirak:'Mobilya Ustası', otoCirak:'Oto Tamir Ustası',
  mil_enlisted:'Er', mil_nco:'Uzman Çavuş', mil_officer:'Subay',
  mil_commando:'Komando', mil_special:'Özel Kuvvetler', athlete:'Sporcu',
  olympian:'Olimpiyatçı', englishB2:'İngilizce B2'
};

function statsGrid(state) {
  const s = state.data.stats;
  return `<div class="stat-grid">
    ${Object.entries(s).filter(([k])=>k!=='luck').map(([k,v])=>`
      <div class="stat-cell ${k==='money'?(v>=2000?'high':v<0?'low':''):v>=70?'high':v<35?'low':''}">
        <div class="sc-label">${SL[k]||k}</div>
        <div class="sc-val">${k==='money'?(v>=0?'+':'')+v+'₺':Math.round(v)}</div>
      </div>`).join('')}
  </div>`;
}

function traitList(state) {
  if (!state.data.traits?.length) return '<em class="muted">Henüz özellik yok</em>';
  return state.data.traits.map(t=>`<span class="choice-stat neu">${TRAIT_LABELS[t]||t}</span>`).join(' ');
}

/* ════════════════════════════════════════════════════════════════════════
   SAHNELER — Her seçenek gerçek bir bedel-kazanç dengesi taşır.
   Kazanç ne kadar büyükse bedel de o kadar anlamlıdır.
════════════════════════════════════════════════════════════════════════ */
export function getScenes() {
  return {

    /* ── HEDEF SEÇİMİ ───────────────────────────────────────────────── */
    goal_select: () => ({
      text: `
        <h2>🎯 Hayatının Hedefini Seç</h2>
        <p>Bu seçim oyunun tüm seyrini şekillendirir. Hedef yolculuk sırasında da değiştirilebilir.</p>
        <p class="muted">Her hedef farklı stat kombinasyonu gerektirir.</p>
      `,
      choices: [
        { label: '🏆 Başarıya Ulaş',        next:'intro', effects:[{setFlag:{goal:'basariyaUlas'}}] },
        { label: '☮️ Huzurlu & Mutlu Ölüm', next:'intro', effects:[{setFlag:{goal:'huzurluOlum'}}] },
        { label: '⚙️ Mühendis Ol',           next:'intro', effects:[{setFlag:{goal:'muhendisOl'}}] },
        { label: '🏛️ Mimar Ol',             next:'intro', effects:[{setFlag:{goal:'mimarOl'}}] },
        { label: '🌍 Bütün Dünyayı Gez',    next:'intro', effects:[{setFlag:{goal:'dunyayiGez'}}] },
      ]
    }),

    /* ── 2000 · DOĞUM ───────────────────────────────────────────────── */
    intro: (state) => {
      const s = state.data.stats;
      const dominant = [['intelligence',s.intelligence],['social',s.social],['health',s.health]]
        .sort(([,a],[,b])=>b-a)[0][0];
      const note = dominant==='intelligence'
        ? '<p class="stat-note">📊 Doğuştan yüksek zekân — öğrenmeye eğilimlisin.</p>'
        : dominant==='social'
        ? '<p class="stat-note">📊 Doğuştan sosyal zekan — insanlarla kolayca bağ kurarsın.</p>'
        : '<p class="stat-note">📊 Doğuştan güçlü fizik — hareket ve spor sana yakın.</p>';
      return {
        text: `
          <h2>2000 · İstanbul'da Doğum</h2>
          <p>Milyonluk şehirde bir gece doğdun. İlk yıllar sıcak bir yuva — ama kişiliğini kim şekillendiriyor?</p>
          ${note}
        `,
        choices: [
          // Baba: özgüven + mutluluk, bedel: empati düşer (pratik baba)
          { label:'Babama daha yakındım', next:'y2000_2006_caretaking',
            effects:[{addTrait:'babaSevgisi'},{setFlag:{babaDestek:true}},{statDelta:{confidence:6,happiness:3,empathy:-2}}] },
          // Anne: empati + sosyal, bedel: özgüven düşer (koruyucu annelik)
          { label:'Anneme daha yakındım', next:'y2000_2006_caretaking',
            effects:[{addTrait:'anneSevgisi'},{setFlag:{anneDestek:true}},{statDelta:{happiness:6,social:4,empathy:3,confidence:-2}}] },
          // Dengeli: ılımlı her şey, bedel: hiçbirinde uzmanlık yok (-focus)
          { label:'Her ikisiyle dengeli', next:'y2000_2006_caretaking',
            effects:[{statDelta:{happiness:4,confidence:3,social:3,focus:-1}}] },
        ]
      };
    },

    /* ── 2000–2006 · ERKEN ÇOCUKLUK ─────────────────────────────────── */
    y2000_2006_caretaking: (state) => ({
      text: `
        <h2>2000–2006 · Okul Öncesi Yıllar</h2>
        <p>${state.data.flags.babaDestek?'Baban pratik; merak uyandırır, soru sordurur.':state.data.flags.anneDestek?'Annen duygusal dayanak; empatin ve sosyal sezgin erken gelişiyor.':'Dengeli aile ortamı.'}</p>
        <p>Küçük beden, büyük merak. Neye ağırlık verirsin?</p>
      `,
      choices: [
        // Akademik: +zekâ+odak, bedel: sosyal gelişim ve mutluluk acı çeker
        { label:'📚 Okul öncesi eğitim ağırlığı', next:'y2006_primary_start',
          effects:[{statDelta:{intelligence:7,focus:3,social:-2,happiness:-1}}] },
        // Sosyal: +sosyal+mutluluk, bedel: zekâ gelişimi yavaşlar
        { label:'🤸 Oyun ve arkadaşlık', next:'y2006_primary_start',
          effects:[{statDelta:{social:7,happiness:5,empathy:2,intelligence:-2}}] },
        // Spor: +sağlık+dayanıklılık, bedel: zekâ ve odak eksik kalır
        { label:'⚽ Spor ve hareket', next:'y2006_primary_start',
          effects:[{statDelta:{health:8,endurance:3,agility:2,intelligence:-2,focus:-1}}] },
      ]
    }),

    /* ── 2006 · İLKOKUL ─────────────────────────────────────────────── */
    y2006_primary_start: (state) => ({
      text: `
        <h2>2006 · İlkokul Başlıyor</h2>
        <p>Sıra sıra masalar, ilk öğretmen. Disiplin ve merak arasında nasıl denge kurarsın?</p>
        ${state.data.stats.intelligence>=60?'<p class="stat-note">📊 Yüksek zekânla öğrenmek sana kolay geliyor; sosyal hayatı ihmal etme.</p>':''}
      `,
      choices: [
        // Çalışkan: +zekâ+disiplin, bedel: mutluluk ve sosyal hayat
        { label:'📖 Düzenli çalış, sağlam temel', next:'y2008_family_finance',
          effects:[{statDelta:{intelligence:9,discipline:4,happiness:-3,social:-2}}] },
        // Sosyal: +sosyal+karizama, bedel: zekâ ve odak
        { label:'🎭 Kulüplere katıl, arkadaş çevresi', next:'y2008_family_finance',
          effects:[{statDelta:{social:9,confidence:4,charisma:2,intelligence:-2,focus:-2}}] },
        // Sporcu: +sağlık+dayanıklılık+mutluluk, bedel: zekâ ve disiplin
        { label:'⚽ Spor takımına gir', next:'y2008_family_finance',
          effects:[{statDelta:{health:9,endurance:4,happiness:3,intelligence:-3,discipline:-1}}] },
      ]
    }),

    /* ── 2008 · AİLE EKONOMİSİ ──────────────────────────────────────── */
    y2008_family_finance: (state) => ({
      text: `
        <h2>2008 · Aile Ekonomisinde Fırtına</h2>
        <p>Küresel kriz herkesi etkiliyor. "Tasarruf" kelimesi evde daha sık duyuluyor.</p>
        ${state.data.stats.empathy>=55?'<p class="stat-note">📊 Empatik yapın ailenin sıkıntısını derinden hissettiriyor.</p>':''}
      `,
      choices: [
        // Tasarruf: +disiplin+özgüven (öz kontrol), bedel: mutluluk ve sosyal hayat
        { label:'✂️ Harcamaları kıs, sabret', next:'y2010_hobby',
          effects:[{statDelta:{discipline:3,confidence:2,happiness:-3,social:-2}},{setFlag:{savingsDiscipline:true}},{addTrait:'sabirli'}] },
        // Sorumluluk: +empati+sosyal, bedel: mutluluk ve odak (yorucu)
        { label:'🤝 Evde sorumluluk al', next:'y2010_hobby',
          effects:[{statDelta:{empathy:4,social:4,confidence:2,happiness:-2,focus:-1}}] },
        // Normal: +mutluluk, bedel: para biriktirilemiyor
        { label:'😊 Normal hayatına devam', next:'y2010_hobby',
          effects:[{statDelta:{happiness:3,money:-100}}] },
        // Baba desteği: +para+mutluluk, bedel: özgüven (bağımlılık)
        { label:'👔 Babandan maddi destek al', next:'y2010_hobby',
          conditions:[{traitIncludes:'babaSevgisi'}],
          effects:[{statDelta:{money:300,happiness:3,confidence:-2}}] },
      ]
    }),

    /* ── 2010 · HOBİ ────────────────────────────────────────────────── */
    y2010_hobby: (state) => ({
      text: `
        <h2>2010 · Bir Tutku Bul</h2>
        <p>Ortaokul öncesi boş zamanlar şekilleniyor. Hangi yöne yatırım yaparsın?</p>
        ${state.data.flags.savingsDiscipline?'<p class="stat-note">💡 Tasarruf alışkanlığın var — yatırım seçeneğin açık.</p>':''}
      `,
      choices: [
        // Müzik: +yaratıcılık+mutluluk+sosyal, bedel: disiplin (özgür ruh) ve para (dersler)
        { label:'🎵 Müzik (ders + pratik)', next:'y2012_exam',
          effects:[{statDelta:{creativity:5,happiness:5,social:2,discipline:-2,money:-150}}] },
        // Spor: +sağlık+dayanıklılık+özgüven, bedel: zekâ ve odak (zaman)
        { label:'⚽ Spor (kulüp)', next:'y2012_exam',
          effects:[{statDelta:{health:7,endurance:4,confidence:3,intelligence:-2,focus:-1}}] },
        // Kodlama: +zekâ+yaratıcılık+odak, bedel: sosyal ve mutluluk (ekran başı)
        { label:'💻 Kodlama (kurslar)', next:'y2012_exam',
          effects:[{statDelta:{intelligence:7,creativity:3,focus:3,social:-3,happiness:-1}}] },
        // Yatırım (koşullu): +para+zekâ, bedel: mutluluk ve sosyal (sıkıcı)
        { label:'💰 Birikimleri değerlendir', next:'y2011_savings',
          conditions:[{flagEquals:{key:'savingsDiscipline',value:true}}],
          effects:[{addTrait:'yatirimciAdayi'}] },
      ]
    }),

    /* ── 2011 · TASARRUF YÖNTEMİ ────────────────────────────────────── */
    y2011_savings: (state) => ({
      text: `
        <h2>2011 · İlk Yatırım Kararı</h2>
        <p>Kumbaradaki para hazır. Hangi yöntemi seçersin?</p>
        <p class="muted">Her seçeneğin farklı bir bedeli ve faydası var.</p>
      `,
      choices: [
        // Kumbara: en yüksek para birikimi + disiplin, bedel: mutluluk (sıkıcı, esnek değil)
        { label:'🪙 Kumbara (nakit biriktir)', next:'y2012_exam',
          effects:[{statDelta:{money:250,discipline:2,happiness:-2}}] },
        // Bütçe defteri: orta para + odak, bedel: sosyal (sayılarla uğraşmak izole eder)
        { label:'📓 Aylık bütçe defteri', next:'y2012_exam',
          effects:[{statDelta:{money:150,focus:2,discipline:1,social:-1}}] },
        // Kısa vadeli hedef: özgüven + mutluluk, bedel: disiplin (sürdürülebilir değil)
        { label:'🎯 Kısa vadeli hedef koy', next:'y2012_exam',
          effects:[{statDelta:{confidence:2,happiness:2,discipline:-1,money:100}}] },
      ]
    }),

    /* ── 2012 · SINAV HAZIRLIĞI ──────────────────────────────────────── */
    y2012_exam: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2012 · Ortaokul Sınavları</h2>
          <p>Lise tercihi yaklaşıyor. Önümüzdeki yılların temeli burada atılıyor.</p>
          ${s.discipline>=55?'<p class="stat-note">📊 Disiplinin güçlü — yoğun çalışma sana göre.</p>'
          :s.intelligence>=65?'<p class="stat-note">📊 Zekân yüksek ama disiplin olmadan verim düşer.</p>'
          :'<p class="stat-note">📊 Denge kur — hem çalış hem kendine bak.</p>'}
        `,
        choices: [
          // Yoğun: en yüksek zekâ+disiplin kazancı, bedel: mutluluk, sağlık, sosyal
          { label:'🔥 Yoğun çalış (yüksek hedef)', next:'y2015_high_school',
            effects:[{statDelta:{intelligence:12,discipline:5,happiness:-5,health:-2,social:-3}}] },
          // Dengeli: orta zekâ kazancı + sosyal korunur, bedel: hiçbiri zirveye ulaşamaz
          { label:'⚖️ Dengeli ilerle', next:'y2015_high_school',
            effects:[{statDelta:{intelligence:6,social:3,happiness:1,focus:-1}}] },
          // Rahat: +mutluluk+sosyal, bedel: zekâ ve disiplin geriler
          { label:'😎 Rahat al, daha sonra toparlarsın', next:'y2013_reflect',
            effects:[{statDelta:{happiness:5,social:3,intelligence:-5,discipline:-3}},{setFlag:{tookItEasy2012:true}}] },
        ]
      };
    },

    y2013_reflect: (state) => ({
      text: `
        <h2>2013 · Bir Mola</h2>
        <p>Tempoyu düşürdün. Biraz nefes aldın — ama lise kapıda. Nasıl devam edersin?</p>
      `,
      choices: [
        // Toparlan: +zekâ+disiplin+özgüven, bedel: mutluluk (yeniden grind)
        { label:'📖 Rutin kur, toparlan', next:'y2015_high_school',
          effects:[{statDelta:{intelligence:5,discipline:4,confidence:2,happiness:-2}}] },
        // Devam: +mutluluk, bedel: zekâ eksikliği devam eder
        { label:'🎮 Biraz daha keyfine bak', next:'y2015_high_school',
          effects:[{statDelta:{happiness:4,social:2,intelligence:-3}}] },
      ]
    }),

    /* ── 2015 · LİSE SEÇİMİ (ANA KAVŞAK) ───────────────────────────── */
    y2015_high_school: (state) => {
      const s = state.data.stats;
      const hint = s.intelligence>=70
        ? '<p class="stat-note">⭐ Güçlü zekânla fen lisesi için çok uygun bir adaysın.</p>'
        : s.intelligence>=55
        ? '<p class="stat-note">📊 Genel liseler sana açık. Meslek lisesi de somut kariyer kapısı.</p>'
        : '<p class="stat-note">📊 Akademik yol zorlu; pratik ve mesleki yollar daha hızlı kapı açar.</p>';
      return {
        text: `
          <h2>2015 · Büyük Kavşak — Lise Seçimi</h2>
          <p>Her yol farklı bir geleceğe çıkıyor. Seçiminin bedelleri de fırsatları kadar gerçek.</p>
          ${hint}
        `,
        choices: [
          // Fen: +zekâ+odak, bedel: sosyal hayat ve mutluluk (baskılı ortam)
          { label:'🔬 Fen Ağırlıklı Lise', next:'y2016_projects',
            conditions:[{statGte:{key:'intelligence',value:62}}],
            effects:[{statDelta:{intelligence:7,focus:3,discipline:2,social:-3,happiness:-2}}] },
          // Anadolu: dengeli, bedel: uzmanlaşma yok (her şeyde orta)
          { label:'📖 Anadolu Lisesi (dengeli)', next:'y2016_projects',
            effects:[{statDelta:{social:4,intelligence:4,confidence:2,focus:-1}}] },
          // Meslek: +özgüven+disiplin, bedel: sosyal statü ve zekâ gelişimi daha yavaş
          { label:'🔧 Meslek Lisesi', next:'y2016_voc_start',
            effects:[{statDelta:{confidence:4,discipline:3,intelligence:-2,social:-1}}] },
          // Güzel Sanatlar: +yaratıcılık+mutluluk, bedel: zekâ ve disiplin gelişimi
          { label:'🎨 Güzel Sanatlar Lisesi', next:'y2016_artist_portfolio',
            conditions:[{statGte:{key:'creativity',value:45}}],
            effects:[{statDelta:{creativity:5,happiness:4,intelligence:-2,discipline:-1}}] },
          // Çıraklık: +özgüven+disiplin+erkenden para, bedel: zekâ ve sosyal
          { label:'🔨 Çıraklık (okul değil iş)', next:'y2015_apprenticeship_start',
            effects:[{statDelta:{confidence:3,discipline:3,money:200,intelligence:-3,social:-2}}] },
          // Askerî: +sağlık+disiplin+özgüven, bedel: mutluluk ve özgürlük
          { label:'🎖️ Askerî Yol', next:'y2018_military_choice',
            conditions:[{statGte:{key:'health',value:50}}],
            effects:[{statDelta:{health:3,discipline:4,confidence:2,happiness:-3,social:-2}}] },
        ]
      };
    },

    /* ── FEN / ANADOLU LİSESİ ──────────────────────────────────────── */
    y2016_projects: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2016–2018 · Lise Yılları</h2>
          <p>Hem akademik hem sosyal fırsatlar var. Zamanını nasıl şekillendirirsin?</p>
          ${s.focus>=55?'<p class="stat-note">📊 İyi odak seviyenle proje liderliğine uygunsun.</p>':''}
        `,
        choices: [
          // Bilim: +zekâ+odak+özgüven, bedel: sosyal ve mutluluk (yalnız çalışma)
          { label:'🔬 Bilim projesi ve olimpiyatlar', next:'y2018_uni_exam',
            effects:[{statDelta:{intelligence:8,focus:4,confidence:3,social:-3,happiness:-2}}] },
          // Konsey: +sosyal+karizama+özgüven, bedel: zekâ ve odak
          { label:'🤝 Öğrenci konseyi & sosyal proje', next:'y2018_uni_exam',
            effects:[{statDelta:{social:8,charisma:4,confidence:3,intelligence:-2,focus:-2}}] },
          // Spor: +sağlık+dayanıklılık+özgüven, bedel: zekâ ve odak
          { label:'🏅 Spor takımı & turnuvalar', next:'y2018_uni_exam',
            effects:[{statDelta:{health:8,endurance:4,confidence:3,intelligence:-2,focus:-1}},{numberDelta:{training:1}}] },
          // Sanat: +yaratıcılık+mutluluk+sosyal, bedel: disiplin ve zekâ
          { label:'🎨 Sanat / tiyatro kulübü', next:'y2018_uni_exam',
            conditions:[{statGte:{key:'creativity',value:45}}],
            effects:[{statDelta:{creativity:7,social:3,happiness:4,discipline:-2,intelligence:-1}}] },
        ]
      };
    },

    /* ── MESLEK LİSESİ ──────────────────────────────────────────────── */
    y2016_voc_start: (state) => ({
      text: `
        <h2>2016 · Meslek Lisesi — Alan Seçimi</h2>
        <p>Her alan farklı güçlü yönler geliştirir — ama farklı şeyleri feda eder.</p>
      `,
      choices: [
        // Elektrik: +zekâ+odak, bedel: özgüven (sosyal değil, teknik)
        { label:'⚡ Elektrik-Elektronik', next:'y2017_voc_progress',
          effects:[{statDelta:{intelligence:3,focus:2,confidence:-1}},{setFlag:{vocField:'elektrik'}},{addTrait:'vocElektrik'}] },
        // Bilişim: +zekâ+yaratıcılık, bedel: sağlık (ekran başı) ve sosyal
        { label:'💻 Bilişim Teknolojileri', next:'y2017_voc_progress',
          effects:[{statDelta:{intelligence:3,creativity:2,health:-1,social:-1}},{setFlag:{vocField:'bilisim'}},{addTrait:'vocBilisim'}] },
        // Motor: +güç+özgüven, bedel: zekâ ve sağlık (ağır iş)
        { label:'🔧 Motorlu Araçlar', next:'y2017_voc_progress',
          effects:[{statDelta:{strength:2,confidence:3,intelligence:-1,health:-1}},{setFlag:{vocField:'motor'}},{addTrait:'vocMotor'}] },
      ]
    }),

    y2017_voc_progress: (state) => ({
      text: `
        <h2>2017–2018 · Staj ve Atölye</h2>
        <p>Pratik deneyim zamanı. Nasıl yaklaşıyorsun?</p>
      `,
      choices: [
        // Atölye: +zekâ+disiplin+odak, bedel: para (stajsız) ve sosyal
        { label:'🏫 Okul atölyesinde derinleş', next:'y2019_voc_outcome',
          effects:[{statDelta:{intelligence:2,discipline:3,focus:2,money:-50,social:-1}}] },
        // İşyeri: +özgüven+sosyal+para, bedel: zekâ (pratik ama az teorik)
        { label:'🏭 İşyeri stajı (gerçek deneyim)', next:'y2019_voc_outcome',
          effects:[{statDelta:{confidence:4,social:2,money:150,intelligence:-1}}] },
        // Paralel çalış: +para+özgüven, bedel: sağlık ve odak (yoğun tempo)
        { label:'💼 Çalış ve stajı paralel yürüt', next:'y2019_voc_outcome',
          effects:[{statDelta:{money:300,confidence:3,health:-2,focus:-1}}] },
      ]
    }),

    y2019_voc_outcome: (state) => ({
      text: `
        <h2>2019 · Mezuniyet — Yol Ayrımı</h2>
        <p>Alan: <strong>${state.data.flags.vocField||'—'}</strong>. Bundan sonra ne yapıyorsun?</p>
      `,
      choices: [
        // MYO: +zekâ+özgüven, bedel: 2 yıl para kazanılmıyor
        { label:'🎓 MYO — İki yıllık', next:'y2021_voc_myo',
          effects:[{statDelta:{intelligence:3,confidence:2,money:-200}}] },
        // İş: +para+özgüven, bedel: akademik gelişim durur
        { label:'💼 Hemen işe başla', next:'y2021_voc_job',
          effects:[{statDelta:{money:500,confidence:3,intelligence:-1}}] },
        // Üniversite sınavı: +zekâ+disiplin, bedel: zaman ve stres (para harcanır)
        { label:'📝 4 yıllık üniversite sınavı', next:'y2018_uni_exam',
          effects:[{statDelta:{intelligence:3,discipline:2,happiness:-2,money:-100}}] },
      ]
    }),

    y2021_voc_myo: (state) => ({
      text: `<h2>2021 · Meslek Yüksekokulu</h2><p>Uygulamalı eğitim. Ne yapıyorsun?</p>`,
      choices: [
        // Bitir+işe gir: +para+özgüven, bedel: kariyer tavanı (kısa eğitim)
        { label:'✅ Bitir, hemen işe gir', next:'y2024_career',
          effects:[{statDelta:{money:700,confidence:3,intelligence:-1}}] },
        // Dikey geçiş: +zekâ+özgüven, bedel: para ve zaman
        { label:'📈 Dikey geçiş için hazırlan', next:'y2018_uni_exam',
          effects:[{statDelta:{intelligence:3,confidence:2,money:-300}}] },
        // Kendi iş: +özgüven, bedel: büyük para riski
        { label:'🏢 Kendi işini kur', next:'y2024_trade_scale',
          effects:[{statDelta:{money:-600,confidence:4,happiness:-1}},{setFlag:{startupTrack:true}}] },
      ]
    }),

    y2021_voc_job: (state) => ({
      text: `<h2>2021 · Teknik İşe Başlama</h2><p>İlk yıllar tecrübe için kritik.</p>`,
      choices: [
        // Usta: +özgüven+disiplin, bedel: yavaş maaş artışı
        { label:'🔧 Usta yanında çalış, öğren', next:'y2022_trade_outcome',
          effects:[{statDelta:{confidence:3,discipline:3,money:-100}}] },
        // Sertifika: +zekâ+para, bedel: zaman ve enerji
        { label:'📜 Sertifika al ve iş değiştir', next:'y2022_trade_outcome',
          effects:[{statDelta:{intelligence:2,money:200,health:-1,happiness:-1}}] },
        // Kendi iş: +özgüven yüksek, bedel: büyük para riski + stres
        { label:'💡 Kendi işini aç', next:'y2024_trade_scale',
          effects:[{statDelta:{money:-900,confidence:4,happiness:-2}},{setFlag:{startupTrack:true}}] },
      ]
    }),

    /* ── ÇIRALIK ────────────────────────────────────────────────────── */
    y2015_apprenticeship_start: (state) => ({
      text: `<h2>2015 · Çıraklık — Meslek Seçimi</h2><p>Ustanın elinde öğreniyorsun. Hangi alan?</p>`,
      choices: [
        // Elektrik: +zekâ+özgüven, bedel: sağlık (elektrik riski)
        { label:'⚡ Elektrik tesisatı', next:'y2016_apprenticeship_progress',
          effects:[{statDelta:{intelligence:3,confidence:3,health:-1}},{addTrait:'elektrikCirak'}] },
        // Mobilya: +yaratıcılık+özgüven+disiplin, bedel: güç (ağır iş)
        { label:'🪑 Mobilya & marangozluk', next:'y2016_apprenticeship_progress',
          effects:[{statDelta:{creativity:3,confidence:3,discipline:2,strength:-1}},{addTrait:'mobilyaCirak'}] },
        // Oto: +güç+özgüven, bedel: sağlık (ağır iş) ve zekâ gelişimi
        { label:'🚗 Oto tamir & servis', next:'y2016_apprenticeship_progress',
          effects:[{statDelta:{strength:3,confidence:4,health:-2,intelligence:-1}},{addTrait:'otoCirak'}] },
      ]
    }),

    y2016_apprenticeship_progress: (state) => ({
      text: `<h2>2016–2018 · Ustalığa Doğru</h2><p>Usta-çırak ilişkisi öğretici. Bir yol seç.</p>`,
      choices: [
        // Sertifika: +özgüven+disiplin, bedel: para (zaman = fırsat maliyeti)
        { label:'📜 Sertifika al, kalfalık belgesi hedefle', next:'y2018_apprenticeship_outcome',
          effects:[{statDelta:{confidence:4,discipline:3,money:-100}}] },
        // Yan iş: +para, bedel: sağlık (yorucu) ve odak
        { label:'💵 Yan iş al, para biriktir', next:'y2018_apprenticeship_outcome',
          effects:[{statDelta:{money:350,health:-2,focus:-1}}] },
        // Kendi dükkan: +özgüven yüksek, bedel: büyük para riski
        { label:'🏪 Küçük dükkan denemesi', next:'y2018_apprenticeship_outcome',
          effects:[{statDelta:{money:-400,confidence:5,happiness:-1}},{setFlag:{smallBizTried:true}}] },
      ]
    }),

    y2018_apprenticeship_outcome: (state) => ({
      text: `<h2>2018 · Usta Yolunda İlerleme</h2><p>Tecrübe ve güven gelişti. Şimdi ne yapıyorsun?</p>`,
      choices: [
        // Devam: +para+özgüven, bedel: zekâ gelişimi yavaşlar
        { label:'🔨 Meslekte devam, müşteri kazan', next:'y2019_trade_track',
          effects:[{statDelta:{money:700,confidence:3,intelligence:-1}}] },
        // Ustalık: +özgüven+disiplin, bedel: zaman (para kazanılmıyor)
        { label:'🏅 Ustalık belgesi için hazırlan', next:'y2019_trade_track',
          effects:[{statDelta:{confidence:4,discipline:2,money:-100}}] },
        // Üniversite: zekâ yatırımı, bedel: ticaret deneyimi durur
        { label:'🎓 Üniversiteye de hazırlan', next:'y2018_uni_exam',
          effects:[{statDelta:{intelligence:2,money:-200}}] },
      ]
    }),

    /* ── TİCARET ────────────────────────────────────────────────────── */
    y2019_trade_track: (state) => ({
      text: `<h2>2019 · Ticaret Hattı</h2><p>Ustalık tecrübeni işe dökmek için üç yol.</p>`,
      choices: [
        // Usta yanı: +özgüven+disiplin, bedel: gelir yavaş büyür
        { label:'👨‍🏫 Usta yanında kal, bilgi derin', next:'y2020_trade_growth',
          effects:[{statDelta:{confidence:2,discipline:3,money:-100}}] },
        // Ortaklık: +sosyal+özgüven, bedel: para (ortaklık maliyeti)
        { label:'🤝 Ortaklık kur', next:'y2020_trade_growth',
          effects:[{statDelta:{social:3,confidence:3,money:-300}}] },
        // Kendi dükkan: +yüksek özgüven, bedel: büyük para riski + stres
        { label:'🏪 Kendi dükkânını aç', next:'y2020_trade_growth',
          effects:[{statDelta:{money:-700,confidence:5,happiness:-1}}] },
      ]
    }),

    y2020_trade_growth: (state) => ({
      text: `<h2>2020 · İşin Büyümesi</h2><p>Pandemi yılı bile işini etkilemedi. Yatırım stratejin?</p>`,
      choices: [
        // Kalite: +özgüven+sosyal, bedel: yavaş büyüme (para yatırılmıyor)
        { label:'✨ Kaliteye odaklan', next:'y2022_trade_outcome',
          effects:[{statDelta:{confidence:2,social:2,money:-50}}] },
        // Ekip: +sosyal+büyüme, bedel: para maliyeti + sağlık (yönetim stresi)
        { label:'👥 Küçük ekip kur', next:'y2022_trade_outcome',
          effects:[{statDelta:{social:3,confidence:2,money:-300,health:-1}}] },
        // Büyük yatırım: +yüksek özgüven, bedel: büyük para + stres + sağlık
        { label:'🏗️ Büyük yatırım — risk al', next:'y2022_trade_outcome',
          effects:[{statDelta:{money:-1200,confidence:4,health:-2,happiness:-1}}] },
      ]
    }),

    y2022_trade_outcome: (state) => ({
      text: `
        <h2>2022 · Ticari Olgunluk</h2>
        <p>İşin oturdu. Sırada ne var?</p>
        ${state.data.stats.confidence>=65?'<p class="stat-note">📊 Yüksek özgüvenin daha büyük hamleler için iyi zemin.</p>':''}
      `,
      choices: [
        // Ölçekle: +para+özgüven, bedel: sağlık ve zaman
        { label:'📦 E-ticarete ve markaya taşı', next:'y2024_trade_scale',
          effects:[{statDelta:{money:1400,confidence:3,health:-1}}] },
        // Kurumsal: farklı yol, bedel: girişimcilik tecrübesi durur
        { label:'🏢 Kurumsal sektöre geç', next:'y2024_career',
          effects:[{statDelta:{money:300,discipline:1,confidence:-1}}] },
        // Yurt dışı: +mutluluk+travelCount, bedel: para ve iş durağanlaşır
        { label:'✈️ Yurt dışı fırsat araştır', next:'y2027_travel',
          effects:[{statDelta:{happiness:3,money:-200}},{numberDelta:{travelCount:1}}] },
      ]
    }),

    y2024_trade_scale: (state) => ({
      text: `
        <h2>2024 · Ölçekleme Zamanı</h2>
        <p>Küçük işletmenden büyük bir marka yaratma yolundasın.</p>
        ${state.data.traits?.includes('yatirimciAdayi')?'<p class="stat-note">💰 Yatırımcı içgüdülerinle bu kararı daha akıllıca değerlendirebilirsin.</p>':''}
      `,
      choices: [
        // E-ticaret: +para+zekâ, bedel: sağlık (ekran başı yoğunluk)
        { label:'🛒 E-ticaret platformu kur', next:'y2025_outcome',
          effects:[{statDelta:{money:900,intelligence:2,health:-1}}] },
        // Şube: +özgüven+sosyal, bedel: büyük para + stres
        { label:'🏬 Şube aç', next:'y2025_outcome',
          effects:[{statDelta:{money:-500,confidence:3,social:2,happiness:-1}}] },
        // Agresif: +yüksek özgüven, bedel: büyük para + sağlık + mutluluk
        { label:'🚀 Agresif büyü, hızlı genişle', next:'y2025_outcome',
          effects:[{statDelta:{money:-1800,confidence:5,health:-2,happiness:-2}}] },
      ]
    }),

    /* ── SANAT YOLU ─────────────────────────────────────────────────── */
    y2016_artist_portfolio: (state) => ({
      text: `
        <h2>2016 · Güzel Sanatlar — Portföy</h2>
        <p>Hangi yönde ilerliyorsun?</p>
        ${state.data.stats.creativity>=65?'<p class="stat-note">🎨 Güçlü yaratıcılığın büyük sahne için iyi temel.</p>':''}
      `,
      choices: [
        // Klasik: +disiplin+zekâ, bedel: yaratıcılık ve mutluluk (kısıtlayıcı)
        { label:'🎼 Klasik eğitim al (disiplinli)', next:'y2017_artist_stage',
          effects:[{statDelta:{discipline:3,intelligence:2,creativity:-1,happiness:-1}}] },
        // Karma: +yaratıcılık+mutluluk, bedel: disiplin ve para
        { label:'🎭 Karma atölye & deneysel', next:'y2017_artist_stage',
          effects:[{statDelta:{creativity:4,happiness:4,confidence:2,discipline:-2,money:-100}}] },
        // Sokak: +özgüven+karizama+mutluluk, bedel: para ve disiplin
        { label:'🎪 Sokak performansı', next:'y2017_artist_stage',
          effects:[{statDelta:{confidence:4,charisma:3,happiness:3,money:-50,discipline:-2}}] },
      ]
    }),

    y2017_artist_stage: (state) => ({
      text: `
        <h2>2017 · İlk Sahne Deneyimi</h2>
        <p>Sahneye çıkma fırsatı geldi.</p>
        ${state.data.stats.confidence>=60?'<p class="stat-note">📊 Özgüvenin yüksek — büyük sahneye cesaret edebilirsin.</p>':''}
      `,
      choices: [
        // Küçük salon: +özgüven+mutluluk, bedel: kariyer ivmesi yavaş
        { label:'🎵 Küçük salon (güvenli)', next:'y2018_uni_exam',
          effects:[{statDelta:{confidence:3,happiness:2,charisma:-1}}] },
        // Festival: +mutluluk+özgüven+sosyal, bedel: para (seyahat masrafı)
        { label:'🎪 Yerel festival', next:'y2018_uni_exam',
          effects:[{statDelta:{happiness:4,confidence:3,social:2,money:-100}}] },
        // Büyük sahne: +yüksek özgüven+karizama, bedel: sağlık (stres) ve para
        { label:'🎭 Büyük sahne (yüksek risk)', next:'y2018_uni_exam',
          effects:[{statDelta:{confidence:5,charisma:3,happiness:2,health:-1,money:-200}}] },
        // Sanat üni: +yaratıcılık, bedel: para ve zekâ (spesifik alan)
        { label:'🎓 Güzel sanatlar üniversitesi', next:'y2018_artist_route',
          conditions:[{statGte:{key:'creativity',value:60}}],
          effects:[{statDelta:{creativity:3,money:-500}}] },
      ]
    }),

    y2018_artist_route: (state) => ({
      text: `<h2>2018 · Sanat Üniversitesi</h2><p>Yaratıcı ortam. Nasıl finanse edersin?</p>`,
      choices: [
        // Burs: +yaratıcılık+özgüven+zekâ, bedel: stres (portfolio baskısı)
        { label:'🏆 Burs için portfolyo hazırla', next:'y2019_uni_start',
          effects:[{statDelta:{creativity:4,confidence:3,intelligence:2,happiness:-2}},{setFlag:{uniField:'design'}}] },
        // Öz kaynak: +yaratıcılık+mutluluk, bedel: büyük para
        { label:'💰 Özel öde, tam özgürlük', next:'y2019_uni_start',
          effects:[{statDelta:{creativity:5,happiness:3,money:-1500}},{setFlag:{uniField:'design'}}] },
      ]
    }),

    /* ── ASKERİ YOL ─────────────────────────────────────────────────── */
    y2018_military_choice: (state) => ({
      text: `
        <h2>2018 · Askerî Kariyer Kararı</h2>
        <p>Disiplinli, zorlu ama güvenceli bir yol. Hedefin?</p>
        ${state.data.stats.health>=70?'<p class="stat-note">💪 Güçlü sağlığınla yüksek rollere uygun adaysın.</p>':''}
      `,
      choices: [
        // Kısa dönem: +disiplin+özgüven, bedel: mutluluk ve özgürlük
        { label:'🔰 Kısa dönem / er', next:'y2018_mil_branch',
          effects:[{statDelta:{confidence:2,discipline:3,happiness:-2}},{setFlag:{milPath:'short'}}] },
        // Uzman çavuş: +zekâ+disiplin+özgüven, bedel: mutluluk ve sosyal
        { label:'📋 Uzman çavuş sınavı', next:'y2018_mil_branch',
          effects:[{statDelta:{intelligence:3,discipline:3,confidence:1,happiness:-2,social:-1}},{setFlag:{milPath:'exam'}}] },
        // Subay: +yüksek zekâ+özgüven, bedel: yoğun hazırlık (mutluluk + sağlık)
        { label:'⭐ Subay hedefi', next:'y2018_mil_branch',
          conditions:[{statGte:{key:'intelligence',value:60}}],
          effects:[{statDelta:{intelligence:3,confidence:3,discipline:2,happiness:-3,health:-1}},{setFlag:{milPath:'officer'}}] },
        // Komando: +yüksek sağlık+özgüven, bedel: mutluluk ve ağır stres
        { label:'💥 Komando seçmesi', next:'y2018_mil_branch',
          conditions:[{statGte:{key:'health',value:65}}],
          effects:[{statDelta:{health:4,endurance:3,confidence:3,happiness:-4,social:-2}},{setFlag:{milPath:'commando'}}] },
      ]
    }),

    y2018_mil_branch: (state) => ({
      text: `<h2>2018 · Branş Seçimi</h2><p>Her branş farklı beceriler — ve farklı bedeller.</p>`,
      choices: [
        // Hava: +zekâ+odak, bedel: sosyal izolasyon
        { label:'✈️ Hava Kuvvetleri', next:'y2019_mil_role',
          effects:[{setFlag:{milBranch:'hava'}},{statDelta:{intelligence:2,focus:2,social:-1}}] },
        // Kara: +güç+dayanıklılık, bedel: sağlık (ağır koşullar)
        { label:'🪖 Kara Kuvvetleri', next:'y2019_mil_role',
          effects:[{setFlag:{milBranch:'kara'}},{statDelta:{strength:2,endurance:2,health:-1}}] },
        // Deniz: +özgüven+çeviklik, bedel: mutluluk (deniz yalnızlığı)
        { label:'⚓ Deniz Kuvvetleri', next:'y2019_mil_role',
          effects:[{setFlag:{milBranch:'deniz'}},{statDelta:{confidence:2,agility:2,happiness:-1}}] },
      ]
    }),

    y2019_mil_role: (state) => ({
      text: `<h2>2019 · Rol Belirleme</h2><p>Koşullu roller stat gerektirir.</p>`,
      choices: [
        { label:'🪖 Er (kısa dönem)', next:'y2020_mil_training',
          effects:[{addTrait:'mil_enlisted'},{statDelta:{discipline:2}}] },
        { label:'⭐ Uzman çavuş', next:'y2020_mil_training',
          conditions:[{statGte:{key:'health',value:58}}],
          effects:[{addTrait:'mil_nco'},{statDelta:{confidence:2,happiness:-1}}] },
        { label:'🎖️ Subay', next:'y2020_mil_training',
          conditions:[{statGte:{key:'intelligence',value:68}}],
          effects:[{addTrait:'mil_officer'},{statDelta:{confidence:3,intelligence:2,happiness:-2}}] },
        { label:'💥 Komando', next:'y2020_mil_training',
          conditions:[{statGte:{key:'health',value:68}}],
          effects:[{addTrait:'mil_commando'},{statDelta:{health:3,endurance:3,happiness:-2}}] },
      ]
    }),

    y2020_mil_training: (state) => ({
      text: `<h2>2020 · Askerî Eğitim</h2><p>Ne kadar itiyorsun?</p>`,
      choices: [
        // Standart: +sağlık+disiplin, bedel: mutluluk (monoton)
        { label:'🏃 Standart eğitim', next:'y2020_mil_check',
          effects:[{statDelta:{health:3,discipline:3,happiness:-2}}] },
        // Branş kursu: +zekâ+sağlık+disiplin, bedel: para (kurs ücret) ve sosyal
        { label:'📚 Branş kursu ekle', next:'y2020_mil_check',
          effects:[{statDelta:{intelligence:2,health:2,discipline:3,money:-100,social:-1}}] },
        // Yoğun kamp: +sağlık+dayanıklılık yüksek, bedel: mutluluk ve sağlık (aşırı yük)
        { label:'💪 Yoğun kamp', next:'y2020_mil_check',
          effects:[{statDelta:{health:6,endurance:4,happiness:-3,health:-1}}] },
      ]
    }),

    y2020_mil_check: (state) => ({
      text: `<h2>2020 · Performans Değerlendirmesi</h2><p>Seçtiğin rolle beklentileri karşılıyor musun?</p>`,
      choices: [{
        label:'Değerlendir',
        next: (state) => {
          const s = state.data.stats, t = state.data.traits||[];
          if (t.includes('mil_officer')&&!(s.intelligence>=68&&s.discipline>=55)) return 'y2020_mil_check_fail';
          if (t.includes('mil_commando')&&!(s.health>=72&&s.endurance>=62)) return 'y2020_mil_check_fail';
          return 'y2021_mil_assignment';
        }
      }]
    }),

    y2020_mil_check_fail: (state) => ({
      text: `<h2>2020 · Beklentilerin Altında</h2><p>Seçtiğin rol için istatistiklerin yeterli değil.</p>`,
      choices: [
        { label:'🪖 Er olarak devam', next:'y2021_mil_assignment',
          effects:[{removeTrait:'mil_officer'},{removeTrait:'mil_commando'},{addTrait:'mil_enlisted'}] },
        { label:'🏃 Daha fazla antrenman', next:'y2020_mil_training',
          effects:[{statDelta:{health:3,discipline:3,endurance:2,happiness:-1}}] },
      ]
    }),

    y2021_mil_assignment: (state) => ({
      text: `<h2>2021 · Görevlendirme</h2><p>Branş: <strong>${state.data.flags.milBranch||'—'}</strong>.</p>`,
      choices: [
        // Üs içi: +özgüven+zekâ, bedel: deneyim kazancı az
        { label:'🏠 Üs içi idari görev', next:'y2024_mil_career',
          effects:[{statDelta:{confidence:2,intelligence:1,social:-1}}] },
        // Sınır: +sağlık+özgüven, bedel: mutluluk ve sosyal (izole)
        { label:'🛡️ Sınır görevi', next:'y2024_mil_career',
          effects:[{statDelta:{health:2,endurance:2,confidence:2,happiness:-2,social:-1}}] },
        // Operasyonel: +yüksek sağlık+özgüven, bedel: büyük mutluluk kaybı
        { label:'⚔️ Operasyonel birlik', next:'y2024_mil_career',
          conditions:[{statGte:{key:'health',value:60}}],
          effects:[{statDelta:{health:3,endurance:3,confidence:3,happiness:-3,social:-2}}] },
      ]
    }),

    y2024_mil_career: (state) => ({
      text: `<h2>2024 · Askerî Kariyer Seçimi</h2><p>Rütbe, uzmanlık ya da sektör değişikliği.</p>`,
      choices: [
        // Mevcut: +özgüven+disiplin, bedel: yaratıcılık körleşir
        { label:'🎯 Görevde derinleş', next:'y2025_mil_outcome',
          effects:[{statDelta:{confidence:2,discipline:2,creativity:-1}}] },
        // Kurslar: +zekâ+özgüven, bedel: para ve sosyal
        { label:'📚 Kurslar ve sertifikalar', next:'y2025_mil_outcome',
          effects:[{statDelta:{intelligence:3,confidence:2,money:-200,social:-1}}] },
        // Özel kuvvet: +özgüven+sağlık, bedel: mutluluk ve sosyal
        { label:'🦅 Özel kuvvetlere geç', next:'y2025_mil_outcome',
          conditions:[{statGte:{key:'health',value:72}}],
          effects:[{addTrait:'mil_special'},{statDelta:{confidence:4,health:2,happiness:-2,social:-2}}] },
        // Sivil: farklı yol, bedel: askerî kariyer biter
        { label:'👔 Erken emekli, sivile geç', next:'y2024_career',
          effects:[{statDelta:{happiness:2,confidence:-1}}] },
      ]
    }),

    y2025_mil_outcome: (state) => ({
      text: `
        <h2>2025 · Askerî Kariyer Özeti</h2>
        <p>Branş: <strong>${state.data.flags.milBranch||'—'}</strong> · Rol: <strong>${(state.data.traits||[]).find(t=>t.startsWith('mil_'))||'—'}</strong></p>
        ${statsGrid(state)}
      `,
      choices: [
        { label:'→ 2026–2030 dönemine geç', next:'y2026_growth' },
        { label:'🎯 Hedef değiştir', next:'goal_select' },
      ]
    }),

    /* ── ÜNİVERSİTE ─────────────────────────────────────────────────── */
    y2018_uni_exam: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2018 · Üniversite Sınavı</h2>
          <p>YKS hazırlık stratejin sıralamanda fark yaratacak.</p>
          ${s.intelligence>=70?'<p class="stat-note">📊 Güçlü zekânla yoğun çalışma çok verimli olur.</p>'
          :s.discipline>=60?'<p class="stat-note">📊 Disiplinin var — düzenli çalışma sistematik ilerleme sağlar.</p>'
          :'<p class="stat-note">📊 Denge kur — hem çalış hem kendine bak.</p>'}
        `,
        choices: [
          // Yoğun: +zekâ+disiplin, bedel: mutluluk, sağlık, sosyal
          { label:'🔥 Yoğun çalış, üst hedef', next:'y2019_uni_start',
            effects:[{statDelta:{intelligence:12,discipline:5,happiness:-5,health:-3,social:-3}}] },
          // Dengeli: orta zekâ, bedel: hiçbirinde zirveye ulaşamaz
          { label:'⚖️ Dengeli hazırlan', next:'y2019_uni_start',
            effects:[{statDelta:{intelligence:7,social:2,happiness:-1,focus:-1}}] },
          // Kısıtlı: +mutluluk+sosyal, bedel: zekâ ve disiplin
          { label:'😌 Kısıtlı çalış', next:'y2019_uni_start',
            effects:[{statDelta:{happiness:3,social:2,intelligence:-3,discipline:-2}}] },
          // Gap year: +özgüven+mutluluk, bedel: bir yıl geç
          { label:'📅 Gap year', next:'y2018_gap_year',
            effects:[{statDelta:{happiness:3,confidence:2,intelligence:-1}}] },
        ]
      };
    },

    y2018_gap_year: (state) => ({
      text: `<h2>2018 · Ara Yıl</h2><p>Sınav baskısından uzak bir yıl. Nasıl kullanıyorsun?</p>`,
      choices: [
        // Yurt dışı: +özgüven+sosyal+mutluluk, bedel: para
        { label:'✈️ Yurt dışı deneyimi', next:'y2018_uni_exam',
          effects:[{statDelta:{confidence:4,social:3,happiness:4,money:-500}},{numberDelta:{travelCount:1}}] },
        // Staj: +özgüven+para, bedel: sağlık (çalışma stresi)
        { label:'💼 Staj / çalışma', next:'y2018_uni_exam',
          effects:[{statDelta:{confidence:4,money:600,health:-1}}] },
        // Sadece hazırlan: +zekâ+disiplin, bedel: mutluluk ve sosyal
        { label:'📚 Sadece hazırlan', next:'y2019_uni_start',
          effects:[{statDelta:{intelligence:8,discipline:4,happiness:-3,social:-2}}] },
      ]
    }),

    y2019_uni_start: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2019 · Üniversite — Bölüm Seçimi</h2>
          <p>Yeni şehir, yeni özgürlük. Her bölümün kazancı ve bedeli farklı.</p>
          ${s.intelligence>=68?'<p class="stat-note">📊 Güçlü zekânla teknik bölümler için çok uygun adaysın.</p>':''}
        `,
        choices: [
          // Mühendislik: +zekâ+odak, bedel: sosyal, mutluluk, para (yoğun program)
          { label:'⚙️ Mühendislik / Bilgisayar', next:'y2019_uni_check',
            conditions:[{statGte:{key:'intelligence',value:58}}],
            effects:[{statDelta:{intelligence:5,focus:3,social:-3,happiness:-2,money:-300}},{setFlag:{uniField:'stem'}}] },
          // İktisadi: +sosyal+özgüven, bedel: zekâ ve odak gelişimi daha yavaş
          { label:'📊 İktisat / İşletme', next:'y2019_uni_check',
            effects:[{statDelta:{social:4,confidence:2,intelligence:-1,focus:-1}},{setFlag:{uniField:'econ'}}] },
          // Mimarlık: +yaratıcılık+odak, bedel: para (malzeme), mutluluk (yoğun)
          { label:'🏛️ Mimarlık / Tasarım', next:'y2019_uni_check',
            conditions:[{statGte:{key:'creativity',value:48}}],
            effects:[{statDelta:{creativity:5,focus:3,money:-400,happiness:-2}},{setFlag:{uniField:'design'}}] },
        ]
      };
    },

    y2019_uni_check: (state) => ({
      text: `<h2>2019 · Kabul Kontrolü</h2><p>Bölüm gereksinimlerine göre değerlendiriliyorsun…</p>`,
      choices: [{
        label:'Sonucu gör',
        next: (state) => {
          const s=state.data.stats, f=state.data.flags.uniField;
          let score=0,threshold=0;
          if(f==='stem')   {score=Math.round(s.intelligence*0.55+s.focus*0.25+s.discipline*0.2);threshold=62;}
          else if(f==='design'){score=Math.round(s.creativity*0.55+s.confidence*0.25+s.focus*0.2);threshold=58;}
          else              {score=Math.round(s.intelligence*0.4+s.social*0.35+s.confidence*0.25);threshold=52;}
          return score>=threshold?'y2020_pandemic':'y2019_uni_prep';
        }
      }]
    }),

    y2019_uni_prep: (state) => ({
      text: `<h2>2019 · Hazırlık Desteği</h2><p>Eşiğin biraz altındasın. Ne yapıyorsun?</p>`,
      choices: [
        // Etüt: +zekâ+odak+disiplin, bedel: para ve sosyal
        { label:'📖 Etüt ve mentorluk', next:'y2020_pandemic',
          effects:[{statDelta:{intelligence:3,focus:3,discipline:2,money:-200,social:-1}}] },
        // Grup: +sosyal+özgüven+odak, bedel: zekâ gelişimi yavaş
        { label:'👥 Çalışma grubu', next:'y2020_pandemic',
          effects:[{statDelta:{social:3,confidence:2,focus:2,intelligence:-1}}] },
        // Tek başına: +özgüven, bedel: başarı garantisi yok (minimum gelişim)
        { label:'💪 Tek başıma olur', next:'y2020_pandemic',
          effects:[{statDelta:{confidence:3,intelligence:1,happiness:-1}}] },
      ]
    }),

    /* ── 2020–2024 ORTAK AKIŞ ───────────────────────────────────────── */
    y2020_pandemic: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2020 · Pandemi — Herkes Evde</h2>
          <p>Dünya durdu. Uzaktan eğitim, belirsizlik. Nasıl geçiriyorsun?</p>
          ${s.discipline>=60?'<p class="stat-note">📊 Disiplinin güçlü — evde bile üretken kalabilirsin.</p>'
          :'<p class="stat-note">📊 Ev ortamı odaklanmayı zorlaştırıyor.</p>'}
        `,
        choices: [
          // Rutin: +zekâ+disiplin+özgüven, bedel: mutluluk ve sosyal (izole)
          { label:'📅 Günlük rutin, üretken kal', next:'y2021_remote_intern',
            effects:[{statDelta:{intelligence:5,discipline:4,confidence:3,happiness:-3,social:-4}}] },
          // Aile: +mutluluk+empati+sosyal, bedel: zekâ ve disiplin
          { label:'👨‍👩‍👧 Aile bağlarını güçlendir', next:'y2021_remote_intern',
            effects:[{statDelta:{happiness:6,empathy:3,social:4,intelligence:-2,discipline:-2}}] },
          // Gönüllü: +sosyal+empati+özgüven, bedel: para ve sağlık
          { label:'🤝 Gönüllülük ve topluma destek', next:'y2021_remote_intern',
            effects:[{statDelta:{social:6,empathy:4,confidence:3,money:-200,health:-1}}] },
          // Beceri: +yaratıcılık+zekâ, bedel: sosyal ve mutluluk (ekran başı)
          { label:'🎨 Yeni beceri öğren (online)', next:'y2021_remote_intern',
            effects:[{statDelta:{creativity:4,intelligence:3,social:-3,happiness:-2}}] },
        ]
      };
    },

    y2021_remote_intern: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2021 · İlk Profesyonel Adım</h2>
          <p>Pandemi sonrası fırsatlar geliyor. Ne yapıyorsun?</p>
          ${s.confidence>=60?'<p class="stat-note">📊 Özgüvenin güçlü — teklifi değerlendir.</p>':''}
        `,
        choices: [
          // Staj: +özgüven+para, bedel: sağlık ve mutluluk (iş stresi)
          { label:'💼 Uzaktan stajı kabul et', next:'y2022_economy',
            effects:[{statDelta:{confidence:5,money:600,health:-2,happiness:-1}}] },
          // Sertifika: +zekâ+özgüven, bedel: para ve sosyal (kurs izolasyonu)
          { label:'📜 Sertifika programı', next:'y2022_economy',
            effects:[{statDelta:{intelligence:6,confidence:3,money:-300,social:-2}}] },
          // Freelance: +para+özgüven+yaratıcılık, bedel: sağlık ve sosyal
          { label:'💻 Freelance proje üstlen', next:'y2022_economy',
            effects:[{statDelta:{money:700,confidence:4,creativity:2,health:-2,social:-2}}] },
          // Dinlen: +mutluluk+sağlık, bedel: zekâ ve para (fırsat maliyeti)
          { label:'🛌 Dinlen ve toparlan', next:'y2021_self_care',
            effects:[{statDelta:{happiness:5,health:4,intelligence:-2,money:-200}},{addTrait:'sabirli'}] },
        ]
      };
    },

    y2021_self_care: (state) => ({
      text: `<h2>2021 · Öz Bakım Dönemi</h2><p>Duraksadın. Nasıl değerlendiriyorsun?</p>`,
      choices: [
        // Meditasyon: +mutluluk+sağlık+odak, bedel: sosyal ve zekâ
        { label:'🧘 Meditasyon ve nefes', next:'y2022_economy',
          effects:[{statDelta:{health:4,happiness:4,focus:2,social:-1,intelligence:-1}}] },
        // Spor: +sağlık+dayanıklılık+özgüven, bedel: zekâ
        { label:'🏃 Spor rutini kur', next:'y2022_economy',
          effects:[{statDelta:{health:6,endurance:4,confidence:3,intelligence:-1}}] },
        // Öğrenme: +zekâ+özgüven, bedel: mutluluk (baskı hissi)
        { label:'📚 Yeniden öğrenmeye başla', next:'y2022_economy',
          effects:[{statDelta:{intelligence:4,confidence:3,happiness:-2}}] },
      ]
    }),

    y2022_economy: (state) => {
      const s = state.data.stats;
      return {
        text: `
          <h2>2022 · Enflasyon Gerçeği</h2>
          <p>Maliyetler tırmandı. Bütçe yönetimi artık bir beceri.</p>
          ${s.money>=500?'<p class="stat-note">💰 Birikiminle birkaç seçeneği değerlendirebilirsin.</p>'
          :'<p class="stat-note">📊 Sıkışık bütçeyle yaratıcı çözümler zorunlu.</p>'}
        `,
        choices: [
          // Optimize: +disiplin+özgüven, bedel: mutluluk ve sosyal (kısıtlayıcı)
          { label:'✂️ Giderleri optimize et', next:'y2023_volunteer',
            effects:[{statDelta:{discipline:3,confidence:2,happiness:-3,social:-2}}] },
          // Ek gelir: +para+özgüven, bedel: sağlık ve mutluluk (iş yükü)
          { label:'💼 Ek gelir kaynağı bul', next:'y2023_volunteer',
            effects:[{statDelta:{money:900,confidence:4,health:-2,happiness:-2}}] },
          // Aile: +para+mutluluk, bedel: özgüven (bağımlılık)
          { label:'👨‍👩‍👧 Aile desteği al', next:'y2023_volunteer',
            conditions:[{traitIncludes:'babaSevgisi'}],
            effects:[{statDelta:{money:700,happiness:3,confidence:-2}}] },
          // Birikim: +para+özgüven, bedel: sosyal (zamanını para yönetimine harcıyorsun)
          { label:'📈 Birikimi değerlendir', next:'y2023_volunteer',
            conditions:[{flagEquals:{key:'savingsDiscipline',value:true}}],
            effects:[{statDelta:{money:600,confidence:3,social:-1}}] },
        ]
      };
    },

    y2023_volunteer: (state) => ({
      text: `
        <h2>2023 · Dayanışma Yılı</h2>
        <p>Toplumsal kırılma. Katkı sağlamak istiyorsan, her yolun farklı bir bedeli var.</p>
        ${state.data.stats.empathy>=60?'<p class="stat-note">📊 Yüksek empatinle sahada çok daha etkili olursun.</p>':''}
      `,
      choices: [
        // Saha: +sosyal+empati+özgüven+mutluluk, bedel: para ve sağlık (ağır iş)
        { label:'🤲 Sahaya in, gönüllü çalış', next:'y2024_career',
          effects:[{statDelta:{social:7,empathy:4,confidence:4,happiness:3,money:-200,health:-2}}] },
        // Maddi: +mutluluk, bedel: para (en az emek, en az bağ)
        { label:'💳 Maddi destek ver', next:'y2024_career',
          conditions:[{statGte:{key:'money',value:200}}],
          effects:[{statDelta:{happiness:3,money:-250,social:-1}}] },
        // Uzaktan: +zekâ+sosyal, bedel: mutluluk (katkısı az hissedilir) ve para
        { label:'💻 Uzaktan organizasyon', next:'y2024_career',
          effects:[{statDelta:{intelligence:3,social:4,confidence:2,happiness:-1,money:-50}}] },
      ]
    }),

    /* ── 2024 · KARİYER KAVŞAĞI ─────────────────────────────────────── */
    y2024_career: (state) => {
      const s=state.data.stats, f=state.data.flags, t=state.data.traits||[];
      const hint = f.uniField==='stem'&&s.intelligence>=65
        ?'<p class="stat-note">⭐ STEM geçmişin + zekânla kurumsal teknik roller açık.</p>'
        :f.uniField==='design'
        ?'<p class="stat-note">🎨 Tasarım geçmişin yaratıcı sektörlerde avantaj sağlıyor.</p>'
        :t.includes('sabirli')
        ?'<p class="stat-note">📊 Sabırlı yapın uzun vadeli kariyer yatırımlarına uygun.</p>'
        :'';
      return {
        text: `
          <h2>2024 · Kariyer Kavşağı</h2>
          <p>Birikimler ve deneyim şekillendi. Asıl yol başlıyor. Her seçenek farklı bir bedel taşıyor.</p>
          ${hint}
        `,
        choices: [
          // Kurumsal: +para+disiplin, bedel: yaratıcılık ve mutluluk (kurumsal baskı)
          { label:'🏢 Kurumsal şirkete gir', next:'y2025_outcome',
            effects:[{statDelta:{money:1800,discipline:2,confidence:2,creativity:-2,happiness:-2}}] },
          // Start-up: +özgüven+yaratıcılık, bedel: para riski ve güvensizlik
          { label:'🚀 Start-up kur ya da katıl', next:'y2025_outcome',
            effects:[{statDelta:{confidence:6,creativity:3,money:-500,happiness:-1}},{setFlag:{startupTrack:true}}] },
          // Akademi: +zekâ+özgüven, bedel: büyük para kaybı (düşük maaş)
          { label:'🎓 Akademiye yönel', next:'y2025_outcome',
            conditions:[{statGte:{key:'intelligence',value:68}}],
            effects:[{statDelta:{intelligence:4,confidence:3,money:-1000}},{setFlag:{academiaTrack:true}}] },
          // Yurt dışı: +özgüven+sosyal, bedel: para ve ilk dönem yalnızlık
          { label:'🌍 Yurt dışı kariyer hedefle', next:'y2025_outcome',
            conditions:[{statGte:{key:'confidence',value:60}}],
            effects:[{statDelta:{confidence:4,social:3,intelligence:2,money:-800,happiness:-2}},{setFlag:{abroadAccepted:true}}] },
        ]
      };
    },

    /* ── 2025 · ARA ÖZET ────────────────────────────────────────────── */
    y2025_outcome: (state) => {
      const s=state.data.stats, goalKey=state.data.flags.goal;
      const pathNote = state.data.flags.milBranch?`🎖️ ${state.data.flags.milBranch} kuvvetleri`
        :state.data.flags.uniField==='stem'?'⚙️ Teknik / Mühendislik'
        :state.data.flags.uniField==='design'?'🎨 Tasarım / Sanat'
        :state.data.flags.startupFunded?'🚀 Girişimci'
        :state.data.flags.academiaTrack?'🎓 Akademisyen'
        :(state.data.traits||[]).includes('athlete')?'🏅 Sporcu':'🌿 Genel Kariyer';
      return {
        text: `
          <h2>2025 · 25 Yaşında</h2>
          <p>${pathNote} — beş yılı geride bıraktın.</p>
          <div id="goalResult" class="muted"></div>
          ${statsGrid(state)}
          <p><strong>Özellikler:</strong> ${traitList(state)}</p>
          <p class="muted">Para: <strong>${s.money>=0?'+':''}${s.money}₺</strong> · Seyahat: <strong>${state.data.travelCount||0}</strong> · Antrenman: <strong>${state.data.training||0}</strong></p>
        `,
        choices: [
          { label:'→ 2026–2030 dönemine geç', next:'y2026_growth' },
          { label:'🎯 Hedef değiştir', next:'goal_select' },
        ]
      };
    },

    /* ── 2026–2030 EXPANSION ────────────────────────────────────────── */
    y2026_growth: (state) => {
      const s=state.data.stats;
      return {
        text: `
          <h2>2026 · Gelişim & Uzmanlaşma</h2>
          <p>Otuzlu yılların eşiğinde. Derinleşme zamanı — ama her yolun bedeli var.</p>
          ${s.health>=68?'<p class="stat-note">💪 Sağlıklı bedeninle spor yolunda ciddi hedefler koyabilirsin.</p>':''}
          ${s.confidence>=65?'<p class="stat-note">📊 Yüksek özgüvenin girişimcilik için uygun.</p>':''}
        `,
        choices: [
          // Spor: +sağlık+özgüven+antrenman, bedel: zekâ ve sosyal (spor odaklı yaşam)
          { label:'🏆 Spor — ulusal hedef', next:'y2027_sports',
            conditions:[{statGte:{key:'health',value:58}}],
            effects:[{addTrait:'athlete'},{statDelta:{health:5,confidence:3,intelligence:-1,social:-1}}] },
          // Girişim: +özgüven, bedel: para riski başlıyor
          { label:'🚀 Girişim — MVP geliştir', next:'y2027_startup',
            conditions:[{statGte:{key:'confidence',value:55}}],
            effects:[{setFlag:{startupTrack:true}},{statDelta:{creativity:2,money:-200}}] },
          // Akademi: +zekâ+odak, bedel: sosyal ve para
          { label:'🎓 Akademi — lisansüstü', next:'y2027_academia',
            conditions:[{statGte:{key:'intelligence',value:62}}],
            effects:[{setFlag:{academiaTrack:true}},{statDelta:{intelligence:4,social:-2,money:-300}}] },
          // Seyahat: +mutluluk+sosyal, bedel: para ve kariyer durağanlaşır
          { label:'🌍 Dünyayı keşfet', next:'y2027_travel',
            effects:[{statDelta:{happiness:4,social:2,money:-300,discipline:-1}}] },
        ]
      };
    },

    y2027_sports: (state) => ({
      text: `
        <h2>2027 · Spor Yolu</h2>
        <p>Antrenman yoğunlaşıyor.</p>
        ${state.data.stats.endurance>=60?'<p class="stat-note">💪 Dayanıklılığın güçlü — uzun soluklu programlara uyumsun.</p>':''}
      `,
      choices: [
        // Antrenör: +sağlık+dayanıklılık+özgüven+antrenman, bedel: büyük para
        { label:'🧑‍🏫 Profesyonel antrenör tut', next:'y2028_sports_national',
          effects:[{statDelta:{health:9,endurance:5,confidence:3,money:-500}},{numberDelta:{training:3}}] },
        // Kendi program: +sağlık+dayanıklılık, bedel: yavaş ilerleme (verim düşük)
        { label:'🏃 Kendi programın', next:'y2028_sports_national',
          effects:[{statDelta:{health:6,endurance:3,focus:-1}},{numberDelta:{training:1}}] },
        // Takım: +sağlık+sosyal, bedel: bireysel ilerleme yavaşlar
        { label:'🤝 Takımla çalış', next:'y2028_sports_national',
          effects:[{statDelta:{health:7,social:3,endurance:3,confidence:-1}},{numberDelta:{training:2}}] },
      ]
    }),

    y2028_sports_national: (state) => ({
      text: `<h2>2028 · Milli Seçmeler</h2><p>Antrenman puanın: <strong>${state.data.training||0}</strong>. Seçmeler için ≥3 gerekli.</p>`,
      choices: [
        { label:'🥇 Seçmelere katıl', next:'y2028_sports_check',
          conditions:[{numberGte:{key:'training',value:3}}],
          effects:[{statDelta:{confidence:2,money:-200}}] },
        { label:'🏟️ Önce yerel ligde güçlen', next:'y2029_sports_local',
          effects:[{statDelta:{health:4,endurance:2,confidence:-1}},{numberDelta:{training:2}}] },
      ]
    }),

    y2028_sports_check: (state) => ({
      text: `<h2>2028 · Performans Testi</h2><p>Değerlendirme yapılıyor…</p>`,
      choices: [{
        label:'Sonucu gör',
        next: (state) => {
          const s=state.data.stats;
          return Math.round(s.health*0.35+s.endurance*0.3+s.agility*0.2+s.discipline*0.15)>=68
            ?'y2029_sports_international':'y2028_sports_fail';
        }
      }]
    }),

    y2028_sports_fail: (state) => ({
      text: `<h2>2028 · Eşik Geçilemedi</h2><p>Şu an yeterli değilsin ama bu son değil.</p>`,
      choices: [
        { label:'🏃 Yerel ligde kal, antrenmanı artır', next:'y2029_sports_local',
          effects:[{numberDelta:{training:2}},{statDelta:{confidence:-1,health:3,money:-100}}] },
        { label:'🔄 Farklı bir yol seç', next:'y2026_growth',
          effects:[{statDelta:{confidence:-1}}] },
      ]
    }),

    y2029_sports_local: (state) => ({
      text: `<h2>2029 · Yerel Lig</h2><p>Sahada güçleniyorsun. Milli sahne hâlâ hedefinde mi?</p>`,
      choices: [
        { label:'🔝 Antrenmanı artır, tekrar dene', next:'y2029_sports_international',
          effects:[{numberDelta:{training:2}},{statDelta:{health:4,endurance:3,money:-200,happiness:-1}}] },
        { label:'🏅 Yerelde başarılı ol, yeter', next:'y2030_final',
          effects:[{statDelta:{confidence:2,happiness:3,money:400}}] },
      ]
    }),

    y2029_sports_international: (state) => {
      const s=state.data.stats;
      return {
        text: `<h2>2029 · Uluslararası Arena</h2><p>Sağlık: <strong>${Math.round(s.health)}</strong> (olimpiyat için ≥85 gerekli).</p>`,
        choices: [
          { label:'🏅 Olimpiyat hedefi', next:'y2030_final',
            conditions:[{statGte:{key:'health',value:85}}],
            effects:[{addTrait:'olympian'},{statDelta:{confidence:8,happiness:6,money:-500}}] },
          { label:'🌍 Uluslararası turnuva', next:'y2030_final',
            effects:[{statDelta:{health:5,confidence:5,money:-300,happiness:-1}}] },
          { label:'🇹🇷 Ulusal şampiyonluk', next:'y2030_final',
            effects:[{statDelta:{confidence:4,happiness:4,money:300}}] },
        ]
      };
    },

    y2027_startup: (state) => ({
      text: `
        <h2>2027 · Girişim — Fikir Testi</h2>
        <p>Bir sorunu çözmek istiyorsun. İlk adım hangisi?</p>
        ${state.data.stats.charisma>=60?'<p class="stat-note">📊 Yüksek karizman yatırımcıları ikna etmede avantaj sağlar.</p>':''}
      `,
      choices: [
        // Ortak: +sosyal+özgüven, bedel: yaratıcılık bölüşülür (fikir ortaklığı)
        { label:'👥 Ortak bul, takım kur', next:'y2028_startup_pitch',
          effects:[{statDelta:{social:4,confidence:3,creativity:-1}}] },
        // MVP: +zekâ+yaratıcılık+özgüven, bedel: sağlık (aşırı çalışma) ve para
        { label:'🛠️ Hızlı MVP yap, test et', next:'y2028_startup_pitch',
          effects:[{statDelta:{intelligence:3,creativity:3,confidence:3,health:-2,money:-300}}] },
        // Araştır: +zekâ+sosyal, bedel: özgüven (araştırma belirsizliği)
        { label:'🔍 Pazar araştır', next:'y2028_startup_pitch',
          effects:[{statDelta:{intelligence:4,social:2,confidence:-1}}] },
      ]
    }),

    y2028_startup_pitch: (state) => ({
      text: `<h2>2028 · Yatırımcı Sunumu</h2><p>Sahneye çıkma zamanı.</p>`,
      choices: [
        // Melek: +özgüven, bedel: para (sunum masrafları)
        { label:'👼 Melek yatırımcılara sun', next:'y2028_startup_check',
          effects:[{statDelta:{confidence:3,money:-100}}] },
        // Kitle: +sosyal+özgüven, bedel: zaman ve enerji
        { label:'🌐 Kitle fonlama kampanyası', next:'y2028_startup_check',
          effects:[{statDelta:{social:2,confidence:2,health:-1}}] },
        // Pivot: +zekâ, bedel: özgüven (geri adım atmak)
        { label:'🔄 Pivotla, yeniden dene', next:'y2029_startup_pivot',
          effects:[{statDelta:{intelligence:2,confidence:-1}}] },
      ]
    }),

    y2028_startup_check: (state) => ({
      text: `<h2>2028 · Sunum Sonucu</h2><p>Değerlendirme yapılıyor…</p>`,
      choices: [{
        label:'Sonucu öğren',
        action: (state) => {
          const s=state.data.stats;
          const score=Math.round(s.confidence*0.4+s.charisma*0.35+s.focus*0.25)+Math.round((s.luck-50)/10);
          if(score>=62){state.setFlag('startupFunded',true);s.money+=4000;}
          else{s.money-=200;}
        },
        next: (state) => {
          const s=state.data.stats;
          const score=Math.round(s.confidence*0.4+s.charisma*0.35+s.focus*0.25)+Math.round((s.luck-50)/10);
          return score>=62?'y2030_final':'y2028_startup_fail';
        }
      }]
    }),

    y2028_startup_fail: (state) => ({
      text: `<h2>2028 · Yatırım Gelmedi</h2><p>Sunum tutmadı. Bu yolun sonu değil.</p>`,
      choices: [
        { label:'🔄 Pivot et ve tekrar sun', next:'y2029_startup_pivot',
          effects:[{statDelta:{confidence:-1,intelligence:2}}] },
        { label:'💰 Gelire odaklan', next:'y2030_final',
          effects:[{statDelta:{money:700,confidence:2,creativity:-1}}] },
      ]
    }),

    y2029_startup_pivot: (state) => ({
      text: `<h2>2029 · Pivot</h2><p>Piyasadan öğrendin, yönünü değiştiriyorsun.</p>`,
      choices: [
        { label:'🚀 Yeni versiyonla sun', next:'y2030_final',
          conditions:[{statGte:{key:'intelligence',value:62}}],
          effects:[{setFlag:{startupFunded:true}},{statDelta:{money:3500,confidence:4,health:-1}}] },
        { label:'💼 Gelire odaklan', next:'y2030_final',
          effects:[{statDelta:{money:1000,confidence:2,creativity:-1}}] },
      ]
    }),

    y2027_academia: (state) => ({
      text: `
        <h2>2027 · Akademi Yolu</h2>
        <p>Araştırma, yayın, tez. Uzun bir yol — ama kalıcı bir etki.</p>
        ${state.data.stats.focus>=65?'<p class="stat-note">📊 Güçlü odağın derin araştırma için vazgeçilmez.</p>':''}
      `,
      choices: [
        // Yurt dışı: +zekâ+özgüven, bedel: büyük para ve ilk yalnızlık
        { label:'🌍 Yurt dışı yüksek lisans', next:'y2028_academia_abroad',
          conditions:[{statGte:{key:'intelligence',value:68}}],
          effects:[{statDelta:{confidence:4,intelligence:3,money:-600,happiness:-2}}] },
        // Ülke: +zekâ+odak, bedel: kariyer tavanı daha düşük
        { label:'🇹🇷 Ülkede yüksek lisans', next:'y2030_final',
          effects:[{statDelta:{intelligence:4,focus:3,money:-300,social:-1}},{setFlag:{academiaTrack:true}}] },
        // Araştırma asistan: +zekâ+para, bedel: kariyer yavaş ilerler
        { label:'📝 Araştırma asistanlığı', next:'y2030_final',
          effects:[{statDelta:{intelligence:3,money:400,confidence:-1}},{setFlag:{academiaTrack:true}}] },
      ]
    }),

    y2028_academia_abroad: (state) => ({
      text: `<h2>2028 · Yurt Dışı Başvuruları</h2><p>IELTS, referanslar, niyet mektubu…</p>`,
      choices: [
        { label:'✅ Kabul aldım — yola çık', next:'y2030_final',
          effects:[{setFlag:{abroadAccepted:true}},{addTrait:'englishB2'},{statDelta:{confidence:5,intelligence:3,happiness:-2,money:-400}}] },
        { label:'⏳ Bir yıl daha hazırlan', next:'y2029_academia_retry',
          effects:[{statDelta:{intelligence:3,money:-100}}] },
      ]
    }),

    y2029_academia_retry: (state) => ({
      text: `<h2>2029 · Tekrar Deneme</h2><p>Kendini güçlendir.</p>`,
      choices: [
        { label:'🗣️ Dil kursu (B2)', next:'y2030_final',
          effects:[{addTrait:'englishB2'},{statDelta:{intelligence:3,confidence:3,money:-400,social:-1}}] },
        { label:'📖 Araştırma asistanlığı', next:'y2030_final',
          effects:[{setFlag:{academiaTrack:true}},{statDelta:{intelligence:4,money:300,happiness:-1}}] },
      ]
    }),

    y2027_travel: (state) => ({
      text: `<h2>2027 · Dünyayı Keşfet</h2><p>Haritalarda değil, ayaklarınla öğren.</p>`,
      choices: [
        { label:'🏔️ Balkanlar & Doğu Avrupa', next:'y2028_travel_more',
          effects:[{statDelta:{happiness:4,social:2,money:-400,discipline:-1}},{numberDelta:{travelCount:2}}] },
        { label:'🌅 Orta Doğu & Asya', next:'y2028_travel_more',
          effects:[{statDelta:{happiness:4,empathy:2,money:-500,health:-1}},{numberDelta:{travelCount:2}}] },
        { label:'🌊 Güney Amerika', next:'y2028_travel_more',
          effects:[{statDelta:{happiness:5,confidence:2,money:-600,health:-1}},{numberDelta:{travelCount:2}}] },
      ]
    }),

    y2028_travel_more: (state) => ({
      text: `<h2>2028 · Yolculuk Genişliyor</h2><p>Seyahat: <strong>${state.data.travelCount||0}</strong>. Daha uzağa açılmak ister misin?</p>`,
      choices: [
        { label:'🌏 Uzak Doğu', next:'y2030_final',
          effects:[{statDelta:{happiness:5,creativity:3,money:-700,health:-1}},{numberDelta:{travelCount:3}}] },
        { label:'🌎 Kuzey Amerika', next:'y2030_final',
          effects:[{statDelta:{happiness:4,confidence:3,money:-900,social:-1}},{numberDelta:{travelCount:3}}] },
        { label:'🏠 Türkiye\'ye dön, kariyer odaklan', next:'y2024_career',
          effects:[{statDelta:{confidence:2,money:400,happiness:-1}}] },
      ]
    }),

    /* ── RASTGELE OLAYLAR ───────────────────────────────────────────── */
    rand_meet: (state) => ({
      text: `<h2>🎲 Rastgele Karşılaşma</h2><p>Beklenmedik bir tanışma. Sohbet et mi?</p>`,
      choices: [
        { label:'✅ Sohbet et', next:'rand_meet_result',
          effects:[{statDelta:{social:1}}] },
        { label:'❌ Yoğunum', next:state.data.flags.returnScene||'y2026_growth',
          effects:[{statDelta:{happiness:-1,focus:1}}] },
      ]
    }),

    rand_meet_result: (state) => ({
      text: `<h2>Karşılaşma Sonucu</h2>`,
      choices: [{
        label:'Gör',
        action: (state) => {
          const s=state.data.stats;
          const score=Math.round(s.charisma*0.45+s.confidence*0.35+(s.luck-50)/3);
          if(score>=58){s.happiness+=5;s.social+=3;s.confidence+=2;}
          else{s.happiness-=2;s.confidence-=1;}
        },
        next:'rand_resume'
      }]
    }),

    rand_lottery: (state) => ({
      text: `<h2>🎰 Piyango</h2><p>Bilet alıp şansını deniyor musun?</p>`,
      choices: [
        { label:'🎫 Bilet al (50₺)', next:'rand_lottery_result',
          effects:[{statDelta:{money:-50}}] },
        { label:'❌ İlgilenmiyorum', next:state.data.flags.returnScene||'y2026_growth',
          effects:[{statDelta:{discipline:1}}] },
      ]
    }),

    rand_lottery_result: (state) => ({
      text: `<h2>Piyango Sonucu</h2>`,
      choices: [{
        label:'Aç',
        action: (state) => {
          const win=(state.data.stats.luck+Math.random()*45)>88;
          if(win){state.data.stats.money+=5000;state.data.stats.happiness+=4;}
          else{state.data.stats.happiness-=1;}
        },
        next:'rand_resume'
      }]
    }),

    rand_inheritance: (state) => ({
      text: `<h2>📜 Miras</h2><p>Uzak akrabadan vasiyetsin. Kabul ediyor musun?</p>`,
      choices: [
        { label:'✅ Kabul et', next:'rand_inheritance_result' },
        { label:'❌ Reddet', next:'rand_resume',
          effects:[{statDelta:{happiness:1,confidence:1}}] },
      ]
    }),

    rand_inheritance_result: (state) => ({
      text: `<h2>Miras Detayları</h2>`,
      choices: [{
        label:'Öğren',
        action: (state) => {
          const debt=Math.random()<0.45;
          if(debt){state.data.stats.money-=900;state.data.stats.happiness-=2;}
          else{state.data.stats.money+=9000;state.data.stats.happiness+=3;}
        },
        next:'rand_resume'
      }]
    }),

    rand_resume: (state) => ({
      text: `<h2>Yola Devam</h2>`,
      choices: [{ label:'→ Devam', next:state.data.flags.returnScene||'y2026_growth' }]
    }),

    /* ── 2030 · GERÇEK BİTİŞ ────────────────────────────────────────── */
    y2030_final: (state) => {
      const s=state.data.stats, goalKey=state.data.flags.goal;
      const goal=GOALS[goalKey];
      const evalResult=goal?goal.evaluate(state):null;
      const achieved=evalResult?.achieved;
      const traits=state.data.traits||[];
      const path=state.data.flags.milBranch?`🎖️ ${state.data.flags.milBranch} kuvvetleri`
        :state.data.flags.uniField==='stem'?'⚙️ Mühendislik/Teknik'
        :state.data.flags.uniField==='design'?'🎨 Tasarım/Sanat'
        :state.data.flags.startupFunded?'🚀 Girişimci'
        :state.data.flags.academiaTrack?'🎓 Akademisyen'
        :traits.includes('olympian')?'🏅 Olimpiyatçı'
        :traits.includes('athlete')?'🏅 Sporcu':'🌿 Genel Yaşam';
      const emoji=achieved?(s.happiness>=70?'🌟':'🏆'):(s.happiness>=65?'😊':s.happiness>=45?'🙂':'😔');
      const verdict=evalResult
        ?(achieved?`<p>🏆 <strong>Hedefini başardın!</strong> Skor: ${evalResult.score}</p>`
          :`<p>📊 Hedefe ulaşılamadı. Güncel skor: ${evalResult.score}</p>`):'';
      return {
        text: `
          <h2>2030 · 30 Yaşında — Hayatının Bilançosu</h2>
          <div class="ending-banner">
            <span class="big-emoji">${emoji}</span>
            <p><strong>Yol:</strong> ${path}</p>
            <div id="goalResult" class="muted">${verdict}</div>
          </div>
          ${statsGrid(state)}
          <p><strong>Özellikler:</strong> ${traitList(state)}</p>
          <p class="muted">Seyahat: <strong>${state.data.travelCount||0}</strong> · Para: <strong>${s.money>=0?'+':''}${s.money}₺</strong></p>
        `,
        choices: [
          { label:'🔄 Yeni Hayat Başlat', next:'goal_select' },
        ]
      };
    },

  };
}
