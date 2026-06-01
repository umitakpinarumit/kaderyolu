import { playMinigame } from './game/MiniGame.js';
import { SceneManager } from './game/SceneManager.js';
import { GameState }    from './game/State.js';
import { Storage }      from './game/Storage.js';
import { getScenes }    from './scenes/index.js';
import { Conditions }   from './game/Conditions.js';
import { Effects }      from './game/Effects.js';
import { GOALS }        from './game/Goals.js';
import { createRng, randomClamped } from './game/Random.js';

/* ─── DOM referansları ─────────────────────────────────────────────────── */
const contentEl     = document.getElementById('content');
const choicesEl     = document.getElementById('choices');
const portraitEl    = document.getElementById('bg-portrait');
const goalHudEl     = document.getElementById('goal-hud');
const goalModalEl   = document.getElementById('goal-modal');
const goalListEl    = document.getElementById('goal-modal-list');
const notifsEl      = document.getElementById('notifs');
const feedbackLayer = document.getElementById('feedback-layer');
const themeToggleBtn = document.getElementById('themeToggle');
const newGameBtn     = document.getElementById('newGame');
const goalBtn        = document.getElementById('goalBtn');

/* ─── Sabitler ─────────────────────────────────────────────────────────── */
const STAT_LABELS = {
  health:'Sağlık', endurance:'Dayanıklılık', strength:'Güç', agility:'Çeviklik',
  intelligence:'Zekâ', creativity:'Yaratıcılık', discipline:'Disiplin', focus:'Odak',
  confidence:'Özgüven', charisma:'Karizma', empathy:'Empati', social:'Sosyal',
  happiness:'Mutluluk', luck:'Şans', money:'Para'
};

const TRAIT_LABELS = {
  babaSevgisi:'Baba Sevgisi', anneSevgisi:'Anne Sevgisi', sabirli:'Sabırlı',
  yatirimciAdayi:'Yatırımcı Adayı', vocElektrik:'Elektrik Teknikeri',
  vocBilisim:'Bilişim Teknikeri', vocMotor:'Motorcu', elektrikCirak:'Elektrik Çırağı',
  mobilyaCirak:'Mobilya Ustası Adayı', otoCirak:'Oto Tamir Ustası Adayı',
  mil_enlisted:'Er', mil_nco:'Uzman Çavuş', mil_officer:'Subay',
  mil_commando:'Komando', mil_special:'Özel Kuvvetler', athlete:'Sporcu',
  olympian:'Olimpiyatçı', englishB2:'İngilizce B2', multiDisciplinary:'Çok Alanlı',
  elBecerisi:'El Becerisi', techMerak:'Teknoloji Meraklısı'
};

const FLAG_PATH_LABELS = {
  startupTrack:'Girişim yolu açıldı', academiaTrack:'Akademi yolu açıldı',
  abroadAccepted:'Yurt dışı kabul alındı', startupFunded:'Girişim yatırımı alındı',
  savingsDiscipline:'Tasarruf disiplini kazanıldı'
};

const GOAL_META = {
  basariyaUlas: {
    title:'Başarıya Ulaş', emoji:'🏆',
    desc:'Yüksek zekâ, özgüven ve para ile başarının zirvesine ulaş.',
    getProgress(state){ const s=state.data.stats; const cur=s.intelligence+s.confidence+s.money/50; return {cur:Math.round(cur),max:180,key:[{l:'Zekâ+Özgüven',cur:Math.round(s.intelligence+s.confidence),need:130},{l:'Para',cur:Math.round(s.money),need:2500}]}; }
  },
  huzurluOlum: {
    title:'Huzurlu & Mutlu Ölüm', emoji:'☮️',
    desc:'Mutluluk, sağlık ve sosyal denge ile tatmin dolu bir ömür.',
    getProgress(state){ const s=state.data.stats; const cur=(s.happiness*1.2+s.health+s.social*0.6)/2; return {cur:Math.round(cur),max:100,key:[{l:'Mutluluk',cur:Math.round(s.happiness),need:75},{l:'Sağlık',cur:Math.round(s.health),need:65}]}; }
  },
  muhendisOl: {
    title:'Mühendis Ol', emoji:'⚙️',
    desc:'STEM bölümünde okuyarak mühendislik kariyerine adım at.',
    getProgress(state){ const s=state.data.stats; const hasStem=s.intelligence>=65&&state.data.flags.uniField==='stem'; const cur=s.intelligence+(hasStem?30:0)+s.confidence/2; return {cur:Math.round(cur),max:120,key:[{l:'Zekâ',cur:Math.round(s.intelligence),need:65},{l:'STEM Bölüm',cur:state.data.flags.uniField==='stem'?1:0,need:1,bool:true}]}; }
  },
  mimarOl: {
    title:'Mimar Ol', emoji:'🏛️',
    desc:'Tasarım ve teknik disiplinde uzmanlaş.',
    getProgress(state){ const s=state.data.stats; const hasArch=s.intelligence>=60&&state.data.flags.uniField==='design'; const cur=s.intelligence+s.happiness/2+(hasArch?30:0); return {cur:Math.round(cur),max:110,key:[{l:'Zekâ',cur:Math.round(s.intelligence),need:60},{l:'Yaratıcılık',cur:Math.round(s.creativity),need:55},{l:'Tasarım Bölüm',cur:state.data.flags.uniField==='design'?1:0,need:1,bool:true}]}; }
  },
  dunyayiGez: {
    title:'Dünyayı Gez', emoji:'🌍',
    desc:'Seyahat puanı ve mutlulukla dünyayı keşfet.',
    getProgress(state){ const t=state.data.travelCount??0; const s=state.data.stats; const cur=t*10+s.happiness/2+s.money/100; return {cur:Math.round(cur),max:120,key:[{l:'Seyahat',cur:t,need:8},{l:'Para',cur:Math.round(s.money),need:2000}]}; }
  }
};

/* ─── Tema ─────────────────────────────────────────────────────────────── */
function applyTheme(name) {
  const root = document.documentElement;
  if (name === 'light' || name === 'dark') { root.setAttribute('data-theme', name); Storage.saveTheme(name); }
  else root.removeAttribute('data-theme');
}
{
  const saved = Storage.loadTheme();
  applyTheme(saved || (window.matchMedia?.('(prefers-color-scheme: light)').matches ? 'light' : 'dark'));
}
themeToggleBtn?.addEventListener('click', () => {
  applyTheme((document.documentElement.getAttribute('data-theme') || 'dark') === 'dark' ? 'light' : 'dark');
});

/* ─── Portre ────────────────────────────────────────────────────────────── */
function getPortraitForScene(id) {
  if (!id) return null;
  if (id === 'intro' || id === 'goal_select' || id === 'y2000_2006_caretaking') return './assets/age1_baby.png';
  if (/^y200[1-9]_|^y201[01]_/.test(id) || ['y2006_primary_start','y2008_family_finance','y2010_hobby','y2011_savings'].includes(id)) return './assets/age2_child.png';
  if (/^y201[2-8]_/.test(id) || ['y2012_exam','y2013_reflect','y2015_high_school','y2016_voc_start','y2016_projects','y2016_artist_portfolio','y2015_apprenticeship_start','y2017_voc_progress','y2017_artist_stage','y2018_uni_exam','y2018_military_choice','y2018_mil_branch','y2018_apprenticeship_outcome'].includes(id)) return './assets/age3_teen.png';
  if (/^y201[9]_|^y202[0-4]_/.test(id)) return './assets/age4_young.png';
  if (/^y202[5-9]_|^y2030_|^rand_|^y2031/.test(id)) return './assets/age5_adult.png';
  return null;
}
function updatePortrait(id) {
  const url = getPortraitForScene(id);
  portraitEl.style.backgroundImage = url ? `url('${url}')` : 'none';
  portraitEl.style.opacity = url ? '0.82' : '0';
}

/* ─── Bildirim (Toast) Sistemi ──────────────────────────────────────────── */
function showNotification(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `notif notif-${type}`;
  el.textContent = msg;
  notifsEl.appendChild(el);
  requestAnimationFrame(() => { requestAnimationFrame(() => el.classList.add('show')); });
  setTimeout(() => {
    el.classList.remove('show'); el.classList.add('fade');
    setTimeout(() => el.remove(), 350);
  }, 2800);
}

/* ─── Seçim Geri Bildirim (Chip animasyonu) ─────────────────────────────── */
function showChoiceFeedback(effects, buttonEl) {
  if (!Array.isArray(effects) || !effects.length) return;
  const rect = buttonEl.getBoundingClientRect();
  const burst = document.createElement('div');
  burst.className = 'feedback-burst';
  burst.style.left = `${rect.left}px`;
  burst.style.top  = `${rect.top - 10}px`;

  const chips = [];
  for (const eff of effects) {
    if (eff.statDelta) {
      for (const [k, v] of Object.entries(eff.statDelta)) {
        if (v === 0) continue;
        chips.push({ text: `${v > 0 ? '+' : ''}${v} ${STAT_LABELS[k] || k}`, cls: v > 0 ? 'pos' : 'neg' });
      }
    }
    if (eff.addTrait && TRAIT_LABELS[eff.addTrait]) {
      chips.push({ text: `✨ ${TRAIT_LABELS[eff.addTrait]}`, cls: 'pos' });
    }
    if (eff.numberDelta) {
      for (const [k, v] of Object.entries(eff.numberDelta)) {
        if (v === 0) continue;
        chips.push({ text: `${v > 0 ? '+' : ''}${v} ${STAT_LABELS[k] || k}`, cls: v > 0 ? 'pos' : 'neg' });
      }
    }
  }
  if (!chips.length) return;

  chips.forEach((c, i) => {
    const chip = document.createElement('span');
    chip.className = `fb-chip ${c.cls}`;
    chip.textContent = c.text;
    chip.style.animationDelay = `${i * 80}ms`;
    burst.appendChild(chip);
  });
  feedbackLayer.appendChild(burst);
  setTimeout(() => burst.remove(), 1400 + chips.length * 80);
}

/* ─── Effect sonrası bildirimler ────────────────────────────────────────── */
function notifyEffects(effects, prevTraits) {
  if (!Array.isArray(effects)) return;
  for (const eff of effects) {
    if (eff.addTrait) {
      const label = TRAIT_LABELS[eff.addTrait] || eff.addTrait;
      if (!prevTraits.includes(eff.addTrait)) showNotification(`✨ Özellik kazanıldı: ${label}`, 'trait');
    }
    if (eff.setFlag) {
      const [[k]] = Object.entries(eff.setFlag);
      if (FLAG_PATH_LABELS[k]) showNotification(`🛤️ ${FLAG_PATH_LABELS[k]}`, 'path');
    }
  }
}

/* ─── Hedef HUD ─────────────────────────────────────────────────────────── */
function renderGoalHud() {
  const goalKey = gameState.data.flags.goal;
  if (!goalKey) { goalHudEl.innerHTML = '<span class="goal-hud-label">Hedef seçilmedi —</span> <span style="color:var(--color-primary);cursor:pointer;" id="hudGoalPick">Seç</span>'; document.getElementById('hudGoalPick')?.addEventListener('click', openGoalModal); return; }

  const meta = GOAL_META[goalKey];
  if (!meta) { goalHudEl.innerHTML = ''; return; }

  const prog = meta.getProgress(gameState);
  const pct  = Math.min(100, Math.round((prog.cur / prog.max) * 100));

  const reqChips = prog.key.map(r => {
    const done  = r.bool ? r.cur >= r.need : r.cur >= r.need;
    const close = !done && (r.bool ? false : r.cur >= r.need * 0.75);
    const cls   = done ? 'done' : close ? 'close' : '';
    const val   = r.bool ? (r.cur >= r.need ? '✓' : '✗') : `${r.cur}/${r.need}`;
    return `<span class="goal-req-chip ${cls}"><span>${r.l}</span><span class="req-val">${val}</span></span>`;
  }).join('');

  goalHudEl.innerHTML = `
    <span class="goal-hud-label">Hedef:</span>
    <span class="goal-hud-name">${meta.emoji} ${meta.title}</span>
    <div class="goal-hud-reqs">${reqChips}</div>
    <span style="font-size:12px;color:var(--color-muted);white-space:nowrap;">${pct}%</span>
  `;
}

/* ─── Hedef Modal ───────────────────────────────────────────────────────── */
function openGoalModal() {
  goalListEl.innerHTML = '';
  const current = gameState.data.flags.goal;

  for (const [id, meta] of Object.entries(GOAL_META)) {
    const prog = meta.getProgress(gameState);
    const pct  = Math.min(100, Math.round((prog.cur / prog.max) * 100));

    const card = document.createElement('button');
    card.className = `goal-card ${id === current ? 'active' : ''}`;
    card.innerHTML = `
      <div class="goal-card-top">
        <span class="goal-card-name">${meta.emoji} ${meta.title}</span>
        <span class="goal-card-score">İlerleme: ${prog.cur} / ${prog.max}</span>
      </div>
      <p class="goal-card-desc">${meta.desc}</p>
      <div class="goal-progress-bar"><div class="goal-progress-fill" style="width:${pct}%"></div></div>
    `;
    card.addEventListener('click', () => {
      gameState.setFlag('goal', id);
      Storage.saveGame({ state: gameState, currentSceneId: sceneManager.currentSceneId });
      renderGoalHud();
      closeGoalModal();
      showNotification(`🎯 Hedef güncellendi: ${meta.title}`, 'goal');
    });
    goalListEl.appendChild(card);
  }
  goalModalEl.hidden = false;
}

function closeGoalModal() { goalModalEl.hidden = true; }

goalBtn?.addEventListener('click', openGoalModal);
document.getElementById('goalModalClose')?.addEventListener('click', closeGoalModal);
document.querySelector('.goal-modal-backdrop')?.addEventListener('click', closeGoalModal);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeGoalModal(); });

/* ─── Seçenekteki stat önizlemesi ───────────────────────────────────────── */
function buildChoicePreview(choice) {
  const items = [];
  for (const eff of choice.effects || []) {
    if (eff.statDelta) {
      for (const [k, v] of Object.entries(eff.statDelta)) {
        if (v === 0) continue;
        items.push(`<span class="choice-stat ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v} ${STAT_LABELS[k] || k}</span>`);
      }
    }
    if (eff.numberDelta) {
      for (const [k, v] of Object.entries(eff.numberDelta)) {
        if (v === 0) continue;
        items.push(`<span class="choice-stat ${v > 0 ? 'pos' : 'neg'}">${v > 0 ? '+' : ''}${v} ${STAT_LABELS[k] || k}</span>`);
      }
    }
    if (eff.addTrait && TRAIT_LABELS[eff.addTrait]) {
      items.push(`<span class="choice-stat neu">✨ ${TRAIT_LABELS[eff.addTrait]}</span>`);
    }
  }
  return items.length ? `<div class="choice-preview">${items.join('')}</div>` : '';
}

/* ─── Mini Oyun Lookup — sahne+seçenek → oyun konfigürasyonu ──────────── */
const MG = {
  'Babama daha yakındım': { mg:{ type:'door', label:'🔍 Saklambaç!', desc:'Baban 3 kapıdan birinde. Doğru kapıyı seç!', icons:['🚪','🚪','🚪'], labels:['1. Kapı','2. Kapı','3. Kapı'], winText:'Babayı buldun!', loseText:'Yanlış kapı — sevgi azalmaz.' }, lose:[{statDelta:{confidence:2,happiness:1}}] },
  'Anneme daha yakındım':  { mg:{ type:'memory', label:'🎴 Anneyle Kart', desc:'4 çifti eşleştir!', pairs:['💝','🌸','🍀','🌙'], winText:'Harika hafıza!', loseText:'Kucaklaşarak devam.' }, lose:[{statDelta:{happiness:3,social:1}}] },
  'Her ikisiyle dengeli':  { mg:{ type:'timing', label:'⚖️ Aile Dengesi', desc:"Bar'ı yeşil bölgede durdur!", zoneStart:36, zoneEnd:64, winText:'Mükemmel denge!', loseText:'Biraz dengesiz — sorun değil.' }, lose:[{statDelta:{happiness:2,confidence:1}}] },

  'Okul öncesi eğitim ağ': { mg:{ type:'sequence', label:'🔢 Dizi Bul', desc:'İki sayı dizisini tamamla!', questions:[{seq:[1,2,4,8],opts:[12,16,10],ans:16},{seq:[3,6,9,12],opts:[14,15,13],ans:15}], winText:'Zekice! Desen tanıma gelişiyor.', loseText:'Merak devam eder.' }, lose:[{statDelta:{intelligence:3,focus:1}}] },
  'Oyun ve arkadaşlık':    { mg:{ type:'door', label:'🏃 Saklambaç!', desc:'Arkadaşın saklandı — doğru yeri seç!', icons:['🌳','🪨','🏠'], labels:['Ağaç','Taş','Ev köşesi'], winText:'Buldun!', loseText:'Bulamadın — yine de güldünüz.' }, lose:[{statDelta:{social:3,happiness:2}}] },
  'Spor ve hareket':       { mg:{ type:'clickrace', label:'⏱️ Koş!', desc:'5sn\'de 12 kez tıkla!', target:12, time:5000, winText:'Harika sprint!', loseText:'Yoruldun — ama hareket güzeldi.' }, lose:[{statDelta:{health:4,endurance:1}}] },

  'Düzenli çalış, sağlam': { mg:{ type:'math', label:'➕ Matematik', desc:"3 sorudan 2'sini doğru yanıtla!", winText:'Aferin! Temel atılıyor.', loseText:'Biraz daha pratik gerekiyor.' }, lose:[{statDelta:{intelligence:4,discipline:1}}] },
  'Kulüplere katıl, arka':  { mg:{ type:'match', label:'🔗 Kulüp Eşleştir', desc:'Kulübü aktivitesiyle eşleştir!', pairs:[['🎭 Tiyatro','Sahne'],['🔬 Bilim','Deney'],['🎨 Resim','Tablo']], winText:'Sosyal çevren genişliyor!', loseText:'Biraz karıştı — kulüpler güzeldi.' }, lose:[{statDelta:{social:4,charisma:1}}] },
  'Spor takımına gir':      { mg:{ type:'penalty', label:'⚽ Penaltı!', desc:"3 penaltıdan 2'sini gol yap!", shots:3, needed:2, winText:'GOOOL! Takıma kabul!', loseText:'Olmadı — devam et!' }, lose:[{statDelta:{health:4,endurance:2}}] },

  'Harcamaları kıs, sabre': { mg:{ type:'budget', label:'💰 Bütçe', desc:'Zorunlu/Eğlence olarak ayır!', items:[{l:'Kira',c:'Zorunlu'},{l:'Sinema',c:'Eğlence'},{l:'Market',c:'Zorunlu'},{l:'Oyun salonu',c:'Eğlence'}], winText:'Bütçe dengelendi!', loseText:'Niyet güzeldi.' }, lose:[{statDelta:{discipline:1,confidence:1}}] },
  'Evde sorumluluk al':     { mg:{ type:'match', label:'🔗 Görev Paylaşımı', desc:'Aile görevlerini eşleştir!', pairs:[['🍳 Yemek','Anne'],['🔧 Tamir','Baba'],['🧹 Temizlik','Hepimiz']], winText:'Aile dayanışması!', loseText:'Biraz karıştı — iyi niyet var.' }, lose:[{statDelta:{empathy:2,social:2}}] },
  'Normal hayatına devam':  { mg:{ type:'dice', label:'🎲 Şans', desc:'4+ çıkarsa iyisin!', threshold:4, winText:'Şanslı gündeş!', loseText:'Bugün şans uzakta.' }, lose:[{statDelta:{happiness:2}}] },
  'Babandan maddi destek':  { mg:{ type:'cardguess', label:'🃏 Kart Tahmini', desc:"5 turdan 3'ünü doğru tahmin et!", rounds:5, needed:3, winText:'İyi sezgi!', loseText:'Piyasayı tahmin etmek zor.' }, lose:[{statDelta:{money:100,happiness:1}}] },

  'Müzik (ders + pratik)': { mg:{ type:'simon', label:'🎵 Nota Sırası', desc:'Renk dizisini izle ve tekrar et!', colors:['🔴','🟢','🔵','🟡'], length:4, winText:'Ritmin var!', loseText:'Kulak açıldı.' }, lose:[{statDelta:{creativity:2,happiness:2}}] },
  'Spor (kulüp)':          { mg:{ type:'penalty', label:'⚽ Penaltı', desc:"3'ten 2 gol yap!", shots:3, needed:2, winText:'Sporcu ruhu!', loseText:'Olmadı — koşmayı seviyorsun.' }, lose:[{statDelta:{health:3,endurance:2}}] },
  'Kodlama (kurslar)':     { mg:{ type:'sequence', label:'🔢 Kod Deseni', desc:'Fibonacci ve 2\'nin kuvvetleri!', questions:[{seq:[0,1,1,2,3],opts:[4,5,6],ans:5},{seq:[2,4,8,16],opts:[24,32,28],ans:32}], winText:'Mantığın güçlü!', loseText:'Pratik yapar mükemmelleştirir.' }, lose:[{statDelta:{intelligence:3,creativity:1}}] },
  'Birikimleri değerlendi': { mg:{ type:'cardguess', label:'📈 Piyasa Tahmini', desc:"5'ten 3 doğru!", rounds:5, needed:3, winText:'Yatırımcı sezgin açılıyor!', loseText:'Piyasa tahmin zordur.' }, lose:[{statDelta:{money:50,intelligence:1}}] },

  'Kumbara (nakit birikti': { mg:{ type:'timing', label:'⏱️ Para Sayımı', desc:"Bar'ı yeşil bölgede durdur!", zoneStart:40, zoneEnd:70, winText:'Kumbara doldu!', loseText:'Sayım hatalı — birikim var.' }, lose:[{statDelta:{money:100,discipline:1}}] },
  'Aylık bütçe defteri':    { mg:{ type:'budget', label:'📊 Harcama Planı', desc:'Zorunlu ve isteğe bağlı ayır!', items:[{l:'Kira',c:'Zorunlu'},{l:'Restoran',c:'Eğlence'},{l:'Fatura',c:'Zorunlu'},{l:'Kıyafet',c:'Eğlence'}], winText:'Bütçe mükemmel!', loseText:'Plan biraz bozuldu.' }, lose:[{statDelta:{focus:1,money:50}}] },
  'Kısa vadeli hedef koy':  { mg:{ type:'timing', label:'🎯 Hedefle', desc:"Geniş hedef bölgesini bul!", zoneStart:28, zoneEnd:72, speed:0.9, winText:'Hedefe ulaştın!', loseText:'Hedef kaçtı — deneme güçlendirdi.' }, lose:[{statDelta:{confidence:1,happiness:1}}] },

  'Yoğun çalış (yüksek h': { mg:{ type:'quiz', label:'📝 Sınav', desc:"5 sorudan 3'ünü doğru yanıtla!", questions:[{q:'Türkiye\'nin başkenti?',opts:['İstanbul','Ankara','İzmir'],ans:'Ankara'},{q:'Su\'nun formülü?',opts:['CO2','H2O','O2'],ans:'H2O'},{q:'1 km = kaç metre?',opts:['100','500','1000'],ans:'1000'},{q:'Dünya kaçıncı gezegen?',opts:['2.','3.','4.'],ans:'3.'},{q:'En büyük okyanus?',opts:['Atlas','Hint','Pasifik'],ans:'Pasifik'}], winText:'Sınav geçildi!', loseText:'Bazı sorular zorladı.' }, lose:[{statDelta:{intelligence:6,discipline:2}}] },
  'Dengeli ilerle':         { mg:{ type:'balance', label:'⚖️ Denge', desc:'Çubuğu 2.5s ortada tut!', zone:22, stableMs:2500, winText:'Dengeli çalışma sürdürülebilir!', loseText:'Biraz dengesiz — ama ilerliyor.' }, lose:[{statDelta:{intelligence:4,social:2}}] },
  'Rahat al, daha sonra':   { mg:{ type:'dice', label:'🎲 Şans Turu', desc:'3+ çıkarsa şanslısın!', threshold:3, winText:'Şansın yaver gitti!', loseText:'Bugün talih yoktu.' }, lose:[{statDelta:{happiness:3,social:2}}] },

  'Rutin kur, toparlan':    { mg:{ type:'sort', label:'📅 Günü Planla', desc:'4 aktiviteyi doğru sıraya diz!', items:['🌅 Kahvaltı','📚 Ders','⚽ Spor','🛌 Uyku'], winText:'Rutin kuruldu!', loseText:'Sıra bozuldu — niyet sağlam.' }, lose:[{statDelta:{discipline:2,intelligence:2}}] },
  'Biraz daha keyfine bak': { mg:{ type:'dice', label:'🎲 Özgür Zar', desc:'2+ çıkarsa tadını çıkardın!', threshold:2, winText:'Güzel dinlenme!', loseText:'Mola tam dinlendirmedi.' }, lose:[{statDelta:{happiness:2,social:1}}] },
};

function getMG(label) {
  const key = Object.keys(MG).find(k => label.startsWith(k));
  return key ? MG[key] : null;
}

/* ─── Oyun kurulum ──────────────────────────────────────────────────────── */
const { stateData, sceneId } = Storage.loadGame();
const gameState = new GameState(stateData);

if (!stateData) {
  const seed = Date.now() % 2147483647;
  const rng  = createRng(seed);
  gameState.data.flags.seed = seed;
  const s = gameState.data.stats;
  s.health = randomClamped(rng); s.endurance = randomClamped(rng); s.strength = randomClamped(rng);
  s.agility = randomClamped(rng); s.intelligence = randomClamped(rng); s.creativity = randomClamped(rng);
  s.discipline = randomClamped(rng); s.focus = randomClamped(rng); s.confidence = randomClamped(rng);
  s.charisma = randomClamped(rng); s.empathy = randomClamped(rng); s.social = randomClamped(rng);
  s.happiness = randomClamped(rng); s.luck = randomClamped(rng, 50, 30, 25, 90);
}

const sceneRegistry = getScenes();

let sceneManager = new SceneManager({
  initialSceneId: sceneId || 'goal_select',
  sceneRegistry,
  gameState,
  onSceneChange: (newId, state) => {
    state.incrementVisit(newId);
    if (!['rand_meet','rand_lottery','rand_inheritance','rand_resume'].includes(newId)) {
      const roll = Math.random();
      if (roll < 0.06) {
        state.data.flags.returnScene = newId;
        sceneManager.currentSceneId = roll < 0.02 ? 'rand_lottery' : roll < 0.04 ? 'rand_inheritance' : 'rand_meet';
      }
    }
    Storage.saveGame({ state, currentSceneId: newId });
    render();
  }
});

/* ─── Render ─────────────────────────────────────────────────────────────── */
function render() {
  const factory = sceneManager.getCurrentScene();
  const scene   = typeof factory === 'function' ? factory(gameState) : factory;

  updatePortrait(sceneManager.currentSceneId);
  renderGoalHud();

  contentEl.innerHTML = '';
  choicesEl.innerHTML = '';

  const block = document.createElement('div');
  block.innerHTML = scene.text;
  block.className = 'content-block';
  contentEl.appendChild(block);

  const choices = scene.choices || [];
  const visible = choices.filter(c => Conditions.evaluateAll(c.conditions, gameState));

  if (visible.length) {
    for (const choice of visible) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-primary choice-btn';
      btn.innerHTML = `<span>${choice.label}</span>${buildChoicePreview(choice)}`;

      btn.addEventListener('click', async () => {
        try {
          const prevTraits = [...(gameState.data.traits || [])];
          const prevFlags  = { ...gameState.data.flags };
          const mgConfig   = getMG(choice.label);

          if (mgConfig) {
            // Oyunu oyna, sonuca göre efekt uygula
            const result = await playMinigame(mgConfig.mg);
            if (result === 'win') {
              if (Array.isArray(choice.effects)) {
                showChoiceFeedback(choice.effects, btn);
                Effects.applyEffects(choice.effects, gameState);
                notifyEffects(choice.effects, prevTraits);
              }
            } else {
              // Kaybettinde teselli efektleri
              if (Array.isArray(mgConfig.lose)) {
                showChoiceFeedback(mgConfig.lose, btn);
                Effects.applyEffects(mgConfig.lose, gameState);
              }
            }
          } else {
            // Mini-oyun yoksa direkt efekti uygula
            if (Array.isArray(choice.effects)) {
              showChoiceFeedback(choice.effects, btn);
              Effects.applyEffects(choice.effects, gameState);
              notifyEffects(choice.effects, prevTraits);
            }
          }

          if (typeof choice.action === 'function') {
            choice.action(gameState);
            for (const [k] of Object.entries(gameState.data.flags)) {
              if (prevFlags[k] === undefined && FLAG_PATH_LABELS[k]) {
                showNotification(`🛤️ ${FLAG_PATH_LABELS[k]}`, 'path');
              }
            }
          }

          const nextId = typeof choice.next === 'function' ? choice.next(gameState) : choice.next;
          sceneManager.transitionTo(nextId);
        } catch (err) {
          console.error(err);
        }
      });
      choicesEl.appendChild(btn);
    }
  } else {
    const btn = document.createElement('button');
    btn.className = 'btn btn-primary';
    btn.textContent = 'Yeniden Başla';
    btn.addEventListener('click', restartGame);
    choicesEl.appendChild(btn);
  }

  // Hedef değerlendirme (2025 ve 2030 sahnelerinde)
  const evalScenes = ['y2025_outcome', 'y2030_final'];
  if (evalScenes.includes(sceneManager.currentSceneId)) {
    const goalKey = gameState.data.flags.goal;
    const goal    = GOALS[goalKey];
    const resultEl = document.getElementById('goalResult');
    if (goal && resultEl) {
      const { achieved, score } = goal.evaluate(gameState);
      resultEl.className = achieved ? 'goal-result achieved' : 'goal-result';
      resultEl.innerHTML = achieved
        ? `<p>🏆 <strong>Hedef tamamlandı!</strong> Skor: ${score}</p>`
        : `<p>📊 Henüz hedefe ulaşılamadı. Güncel skor: ${score}</p>`;
    }
  }
}

/* ─── Yeniden Başlat ────────────────────────────────────────────────────── */
function restartGame() {
  Storage.clearGame();
  const seed = Date.now() % 2147483647;
  const rng  = createRng(seed);
  gameState.data = {
    visitCounts: {}, flags: { seed },
    stats: {
      health:       randomClamped(rng), endurance:    randomClamped(rng),
      strength:     randomClamped(rng), agility:      randomClamped(rng),
      intelligence: randomClamped(rng), creativity:   randomClamped(rng),
      discipline:   randomClamped(rng), focus:        randomClamped(rng),
      confidence:   randomClamped(rng), charisma:     randomClamped(rng),
      empathy:      randomClamped(rng), social:       randomClamped(rng),
      happiness:    randomClamped(rng), luck:         randomClamped(rng, 50, 30, 25, 90),
      money: 0,
    },
    traits: [], inventory: [], outfit: {}, travelCount: 0, training: 0,
  };
  sceneManager.transitionTo('goal_select');
}

newGameBtn?.addEventListener('click', restartGame);

/* ─── İlk render ─────────────────────────────────────────────────────────── */
if (!sceneId) {
  sceneManager.onSceneChange(sceneManager.currentSceneId, gameState);
} else {
  render();
}
