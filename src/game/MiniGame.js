/* ─── Mini Oyun Motoru ──────────────────────────────────────────────── */

export function playMinigame(config) {
  return new Promise(resolve => {
    const modal   = document.getElementById('mg-modal');
    const content = document.getElementById('mg-content');
    document.getElementById('mg-title').textContent = config.label || 'Mini Oyun';
    document.getElementById('mg-desc').textContent  = config.desc  || '';
    content.innerHTML = '';
    modal.hidden = false;

    function finish(result) {
      const win = result === 'win';
      content.innerHTML = `
        <div class="mg-result ${win?'win':'lose'}">
          <div class="mg-result-emoji">${win ? '🏆' : '😔'}</div>
          <p class="mg-result-msg">${win ? (config.winText||'Başardın! Bonus kazandın.') : (config.loseText||'Bu sefer olmadı — devam!')}</p>
          <button class="btn btn-primary mg-close-btn" id="mg-close-btn">Devam →</button>
        </div>`;
      document.getElementById('mg-close-btn').onclick = () => {
        modal.hidden = true;
        resolve(result);
      };
    }

    const fn = GAMES[config.type];
    if (!fn) { finish('win'); return; }
    fn(content, config, finish);
  });
}

/* ─── Yardımcı ──────────────────────────────────────────────────────── */
function shuffle(arr) { return [...arr].sort(() => Math.random() - 0.5); }

/* ─── OYUN TİPLERİ ──────────────────────────────────────────────────── */
const GAMES = {

  /* 1 ── KAPI (Saklambaç) ─────────────────────────────────────────── */
  door(el, cfg, done) {
    const correct = Math.floor(Math.random() * 3);
    const icons   = cfg.icons   || ['🚪','🚪','🚪'];
    const labels  = cfg.labels  || ['1. Kapı','2. Kapı','3. Kapı'];
    el.innerHTML = `
      <p class="mg-sub">${cfg.question || '3 kapıdan doğru olanı seç!'}</p>
      <div class="mg-door-row">
        ${[0,1,2].map(i=>`
          <button class="mg-door-btn btn" data-i="${i}">
            <span class="mg-door-icon">${icons[i]}</span>
            <span class="mg-door-label">${labels[i]}</span>
          </button>`).join('')}
      </div>`;
    el.querySelectorAll('.mg-door-btn').forEach(btn => {
      btn.onclick = () => {
        const pick = +btn.dataset.i;
        el.querySelectorAll('.mg-door-btn').forEach((b, i) => {
          b.disabled = true;
          b.querySelector('.mg-door-icon').textContent = i === correct ? '✅' : '❌';
        });
        setTimeout(() => done(pick === correct ? 'win' : 'lose'), 900);
      };
    });
  },

  /* 2 ── HAFIZA KARTLARI ───────────────────────────────────────────── */
  memory(el, cfg, done) {
    const pairs  = cfg.pairs || ['🐶','🐱','🐭','🐹'];
    const cards  = shuffle([...pairs, ...pairs]);
    let first = null, locked = false, matched = 0;

    el.innerHTML = `
      <p class="mg-sub">Eşleşen kartları bul!</p>
      <div class="mg-mem-grid" id="mg-mem-grid"></div>`;
    const grid = document.getElementById('mg-mem-grid');

    cards.forEach((val, idx) => {
      const btn = document.createElement('button');
      btn.className = 'btn mg-card';
      btn.dataset.val = val; btn.dataset.idx = idx;
      btn.textContent = '?';
      btn.onclick = () => {
        if (locked || btn.dataset.open) return;
        btn.textContent = val; btn.dataset.open = '1';
        btn.classList.add('flipped');
        if (!first) { first = btn; return; }
        locked = true;
        const second = btn;
        if (first.dataset.val === second.dataset.val) {
          first.classList.add('matched'); second.classList.add('matched');
          matched++; first = null; locked = false;
          if (matched === pairs.length) setTimeout(() => done('win'), 400);
        } else {
          setTimeout(() => {
            [first, second].forEach(b => { b.textContent='?'; delete b.dataset.open; b.classList.remove('flipped'); });
            first = null; locked = false;
          }, 900);
        }
      };
      grid.appendChild(btn);
    });
  },

  /* 3 ── PENALTI ───────────────────────────────────────────────────── */
  penalty(el, cfg, done) {
    const total  = cfg.shots  || 3;
    const needed = cfg.needed || 2;
    let scored = 0, attempt = 0;

    function render() {
      el.innerHTML = `
        <p class="mg-sub">⚽ ${scored} gol / ${attempt} atış &nbsp;|&nbsp; Hedef: ${needed} gol</p>
        <div class="mg-penalty-dirs">
          <button class="btn btn-primary" data-d="0">⬅️ Sol</button>
          <button class="btn btn-primary" data-d="1">⬆️ Orta</button>
          <button class="btn btn-primary" data-d="2">➡️ Sağ</button>
        </div>
        <div class="mg-msg" id="mg-pen-msg"></div>`;
      el.querySelectorAll('[data-d]').forEach(btn => {
        btn.onclick = () => {
          const goalie = Math.floor(Math.random() * 3);
          const isGoal = +btn.dataset.d !== goalie;
          const msg = document.getElementById('mg-pen-msg');
          if (isGoal) { scored++; msg.textContent = '⚽ GOL!'; msg.className='mg-msg pos'; }
          else { msg.textContent = '🧤 Kurtardı!'; msg.className='mg-msg neg'; }
          attempt++;
          setTimeout(() => {
            if (attempt >= total) done(scored >= needed ? 'win' : 'lose');
            else render();
          }, 800);
        };
      });
    }
    render();
  },

  /* 4 ── SİMON SAYS ───────────────────────────────────────────────── */
  simon(el, cfg, done) {
    const colors = cfg.colors || ['🔴','🟢','🔵','🟡'];
    const len    = cfg.length || 4;
    const seq    = Array.from({length:len}, ()=>Math.floor(Math.random()*colors.length));
    let playerIdx = 0;

    el.innerHTML = `
      <p class="mg-sub" id="mg-sim-msg">Diziyi izle…</p>
      <div class="mg-simon-grid">
        ${colors.map((c,i)=>`<button class="btn mg-sim-btn" data-i="${i}">${c}</button>`).join('')}
      </div>`;
    const btns = el.querySelectorAll('.mg-sim-btn');
    btns.forEach(b => b.disabled = true);

    let i = 0;
    function showNext() {
      if (i >= seq.length) {
        document.getElementById('mg-sim-msg').textContent = 'Şimdi sen tekrar et!';
        btns.forEach(b => { b.disabled = false; b.style.opacity = '1'; });
        btns.forEach(b => b.onclick = () => {
          if (+b.dataset.i === seq[playerIdx]) {
            b.classList.add('flash-pos');
            setTimeout(() => b.classList.remove('flash-pos'), 300);
            playerIdx++;
            if (playerIdx >= seq.length) done('win');
          } else {
            b.classList.add('flash-neg');
            setTimeout(() => done('lose'), 400);
          }
        });
        return;
      }
      const active = btns[seq[i]];
      active.classList.add('flash-pos');
      setTimeout(() => { active.classList.remove('flash-pos'); i++; setTimeout(showNext, 350); }, 600);
    }
    setTimeout(showNext, 600);
  },

  /* 5 ── MATEMATİK ────────────────────────────────────────────────── */
  math(el, cfg, done) {
    const qs = cfg.questions || genMath(3);
    let idx = 0, correct = 0;
    function show() {
      if (idx >= qs.length) { done(correct >= Math.ceil(qs.length*0.6) ? 'win' : 'lose'); return; }
      const q = qs[idx];
      el.innerHTML = `
        <p class="mg-sub">Soru ${idx+1}/${qs.length} &nbsp; Doğru: ${correct}</p>
        <p class="mg-question">${q.q}</p>
        <div class="mg-opts">
          ${q.opts.map(o=>`<button class="btn" data-a="${o}">${o}</button>`).join('')}
        </div>`;
      el.querySelectorAll('[data-a]').forEach(b => b.onclick = () => {
        const ok = +b.dataset.a === q.ans;
        b.classList.add(ok ? 'flash-pos' : 'flash-neg');
        if (ok) correct++;
        idx++;
        setTimeout(show, 700);
      });
    }
    show();
  },

  /* 6 ── TİMİNG BAR ───────────────────────────────────────────────── */
  timing(el, cfg, done) {
    const zS = cfg.zoneStart || 35, zE = cfg.zoneEnd || 65;
    let pos = 0, dir = 1, raf, stopped = false;
    el.innerHTML = `
      <p class="mg-sub">Yeşil bölgede DUR!</p>
      <div class="mg-track">
        <div class="mg-zone" style="left:${zS}%;width:${zE-zS}%"></div>
        <div class="mg-cursor" id="mg-cursor"></div>
      </div>
      <button class="btn btn-primary mg-big-btn" id="mg-stop-btn">DUR!</button>`;
    const cursor = document.getElementById('mg-cursor');
    const speed  = cfg.speed || 1.4;
    let last = performance.now();
    function frame(now) {
      const dt = (now - last) / 16;
      last = now;
      pos += dir * speed * dt;
      if (pos >= 90 || pos <= 0) dir *= -1;
      cursor.style.left = pos + '%';
      if (!stopped) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);
    document.getElementById('mg-stop-btn').onclick = () => {
      if (stopped) return;
      stopped = true; cancelAnimationFrame(raf);
      const win = pos >= zS && pos <= zE - 10;
      cursor.style.background = win ? 'var(--color-pos)' : 'var(--color-neg)';
      setTimeout(() => done(win ? 'win' : 'lose'), 500);
    };
  },

  /* 7 ── HIZLI TIKLA ──────────────────────────────────────────────── */
  clickrace(el, cfg, done) {
    const target = cfg.target || 12;
    const ms     = cfg.time   || 5000;
    let count = 0, active = true;
    el.innerHTML = `
      <p class="mg-sub">${ms/1000}s içinde ${target} kez tıkla!</p>
      <div class="mg-count" id="mg-cr-count">0</div>
      <div class="mg-timer" id="mg-cr-timer">${(ms/1000).toFixed(1)}s</div>
      <button class="btn btn-primary mg-big-btn" id="mg-cr-btn">TIKLA!</button>`;
    const countEl = document.getElementById('mg-cr-count');
    const timerEl = document.getElementById('mg-cr-timer');
    const btn     = document.getElementById('mg-cr-btn');
    const start   = Date.now();
    const iv = setInterval(() => {
      const left = Math.max(0, ms - (Date.now()-start));
      timerEl.textContent = (left/1000).toFixed(1)+'s';
      if (left <= 0) { clearInterval(iv); active = false; btn.disabled = true; setTimeout(()=>done(count>=target?'win':'lose'),300); }
    }, 50);
    btn.onclick = () => {
      if (!active) return;
      count++; countEl.textContent = count;
      if (count >= target) { clearInterval(iv); active=false; btn.disabled=true; setTimeout(()=>done('win'),200); }
    };
  },

  /* 8 ── ZAR ──────────────────────────────────────────────────────── */
  dice(el, cfg, done) {
    const thr   = cfg.threshold || 4;
    const faces = ['⚀','⚁','⚂','⚃','⚄','⚅'];
    let rolled  = false;
    el.innerHTML = `
      <p class="mg-sub">${thr}+ çıkarsa kazanırsın!</p>
      <div class="mg-dice-face" id="mg-dice-face">🎲</div>
      <button class="btn btn-primary mg-big-btn" id="mg-roll-btn">Zar At!</button>`;
    document.getElementById('mg-roll-btn').onclick = () => {
      if (rolled) return; rolled = true;
      const face = document.getElementById('mg-dice-face');
      let n = 0;
      const iv = setInterval(() => { face.textContent = faces[Math.floor(Math.random()*6)]; if(++n>12){clearInterval(iv); const r=Math.floor(Math.random()*6)+1; face.textContent=faces[r-1]; setTimeout(()=>done(r>=thr?'win':'lose'),600);} }, 80);
    };
  },

  /* 9 ── YÜKSEK/ALÇAK ─────────────────────────────────────────────── */
  cardguess(el, cfg, done) {
    const rounds = cfg.rounds || 5;
    const needed = cfg.needed || 3;
    let r = 0, correct = 0;
    function next() {
      if (r >= rounds) { done(correct>=needed?'win':'lose'); return; }
      const n = Math.floor(Math.random()*10)+1;
      el.innerHTML = `
        <p class="mg-sub">Tur ${r+1}/${rounds} · Doğru: ${correct}</p>
        <div class="mg-card-num">${n}</div>
        <p style="text-align:center;color:var(--color-muted)">5'ten yüksek mi, alçak mı?</p>
        <div class="mg-two-btns">
          <button class="btn btn-primary" data-ans="high">Yüksek ⬆️</button>
          <button class="btn btn-primary" data-ans="low">Alçak ⬇️</button>
        </div>`;
      el.querySelectorAll('[data-ans]').forEach(b => b.onclick = () => {
        const ok = (b.dataset.ans==='high') === (n>5);
        b.classList.add(ok?'flash-pos':'flash-neg');
        if(ok) correct++;
        r++;
        setTimeout(next, 700);
      });
    }
    next();
  },

  /* 10 ── BÜTÇE KATEGORİZE ────────────────────────────────────────── */
  budget(el, cfg, done) {
    const items = cfg.items || [
      {l:'Kira',c:'Zorunlu'},{l:'Sinema',c:'Eğlence'},
      {l:'Market',c:'Zorunlu'},{l:'Cafe',c:'Eğlence'}
    ];
    const cats = [...new Set(items.map(x=>x.c))];
    const placements = {};
    el.innerHTML = `
      <p class="mg-sub">Her kalemi doğru kategoriye tıklayarak ata:</p>
      <div class="mg-item-pool" id="mg-pool">
        ${items.map((it,i)=>`<button class="btn mg-item-btn" data-i="${i}">${it.l}</button>`).join('')}
      </div>
      <div class="mg-cats">
        ${cats.map(c=>`<div class="mg-cat-box" data-cat="${c}"><div class="mg-cat-label">${c}</div><div class="mg-cat-drop" id="mg-drop-${c}"></div></div>`).join('')}
      </div>
      <button class="btn btn-primary" id="mg-bud-ok" style="margin-top:.8rem;width:100%">Kontrol Et</button>`;
    let selected = null;
    el.querySelectorAll('.mg-item-btn').forEach(b => {
      b.onclick = () => { selected=+b.dataset.i; el.querySelectorAll('.mg-item-btn').forEach(x=>x.classList.remove('sel')); b.classList.add('sel'); };
    });
    el.querySelectorAll('.mg-cat-box').forEach(box => {
      box.onclick = () => {
        if (selected===null) return;
        placements[selected]=box.dataset.cat;
        const drop=document.getElementById('mg-drop-'+box.dataset.cat);
        const it=items[selected];
        drop.innerHTML=`${drop.innerHTML}<span class="mg-placed">${it.l}</span>`;
        el.querySelectorAll('.mg-item-btn').forEach(b=>{ if(+b.dataset.i===selected){b.disabled=true;b.style.opacity='.4';} });
        selected=null;
      };
    });
    document.getElementById('mg-bud-ok').onclick = () => {
      const ok = items.every((_,i)=>placements[i]===items[i].c);
      done(ok?'win':'lose');
    };
  },

  /* 11 ── SIRALAMA ────────────────────────────────────────────────── */
  sort(el, cfg, done) {
    const correct = cfg.items || ['🌅 Kahvaltı','📚 Ders','⚽ Spor','🛌 Uyku'];
    let order = shuffle([...correct]);
    function render() {
      el.innerHTML = `
        <p class="mg-sub">İki öğeye tıkla → yerlerini değiştirir. Doğru sırayla diz:</p>
        <div class="mg-sort-list" id="mg-sort">
          ${order.map((it,i)=>`<div class="btn mg-sort-item" data-i="${i}">${it}</div>`).join('')}
        </div>
        <button class="btn btn-primary" id="mg-sort-ok" style="margin-top:.8rem;width:100%">Kontrol Et</button>`;
      let sel = null;
      el.querySelectorAll('.mg-sort-item').forEach(d => {
        d.onclick = () => {
          if (!sel) { sel=d; d.classList.add('sel'); }
          else {
            const ai=+sel.dataset.i, bi=+d.dataset.i;
            [order[ai],order[bi]]=[order[bi],order[ai]];
            sel.classList.remove('sel'); sel=null; render();
          }
        };
      });
      document.getElementById('mg-sort-ok').onclick = () => done(JSON.stringify(order)===JSON.stringify(correct)?'win':'lose');
    }
    render();
  },

  /* 12 ── EŞLEŞTİRME ─────────────────────────────────────────────── */
  match(el, cfg, done) {
    const pairs   = cfg.pairs || [['🎵 Müzik','Yaratıcılık'],['⚽ Spor','Sağlık'],['📚 Okuma','Zekâ']];
    const rights  = shuffle(pairs.map(p=>p[1]));
    let selLeft   = null, matched = 0;
    function render() {
      el.innerHTML = `
        <p class="mg-sub">Sol ile sağı eşleştir (tıkla):</p>
        <div class="mg-match-grid">
          <div class="mg-match-col">
            ${pairs.map((p,i)=>`<button class="btn mg-left" data-i="${i}" ${matched>i&&p._done?'disabled style="opacity:.4"':''}>${p[0]}</button>`).join('')}
          </div>
          <div class="mg-match-col">
            ${rights.map((r,i)=>`<button class="btn mg-right" data-i="${i}" ${rights._done?.includes(i)?'disabled style="opacity:.4"':''}>${r}</button>`).join('')}
          </div>
        </div>`;
      el.querySelectorAll('.mg-left').forEach(b => b.onclick = () => {
        el.querySelectorAll('.mg-left').forEach(x=>x.classList.remove('sel'));
        selLeft=+b.dataset.i; b.classList.add('sel');
      });
      el.querySelectorAll('.mg-right').forEach(b => b.onclick = () => {
        if (selLeft===null) return;
        const ok = rights[+b.dataset.i] === pairs[selLeft][1];
        b.classList.add(ok?'flash-pos':'flash-neg');
        if (ok) { pairs[selLeft]._done=true; matched++; selLeft=null; if(matched>=pairs.length){setTimeout(()=>done('win'),400);return;} }
        else selLeft=null;
        setTimeout(render, 700);
      });
    }
    render();
  },

  /* 13 ── DİZİ TAMAMLA ────────────────────────────────────────────── */
  sequence(el, cfg, done) {
    const qs = cfg.questions || [
      {seq:[2,4,8,16],opts:[24,32,20],ans:32},
      {seq:[1,3,6,10],opts:[15,13,14],ans:15},
    ];
    let idx=0,correct=0;
    function show() {
      if(idx>=qs.length){done(correct>=qs.length?'win':'lose');return;}
      const q=qs[idx];
      el.innerHTML=`
        <p class="mg-sub">Soru ${idx+1}/${qs.length}: Sıradaki nedir?</p>
        <div class="mg-seq">${q.seq.join(' → ')} → <strong>?</strong></div>
        <div class="mg-opts">
          ${q.opts.map(o=>`<button class="btn" data-a="${o}">${o}</button>`).join('')}
        </div>`;
      el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
        const ok=+b.dataset.a===q.ans; b.classList.add(ok?'flash-pos':'flash-neg');
        if(ok)correct++; idx++; setTimeout(show,700);
      });
    }
    show();
  },

  /* 14 ── QUIZ ────────────────────────────────────────────────────── */
  quiz(el, cfg, done) {
    const qs=cfg.questions||[{q:'Türkiye\'nin başkenti?',opts:['İstanbul','Ankara','İzmir'],ans:'Ankara'}];
    let idx=0,correct=0;
    function show() {
      if(idx>=qs.length){done(correct>=Math.ceil(qs.length*0.6)?'win':'lose');return;}
      const q=qs[idx];
      el.innerHTML=`
        <p class="mg-sub">Soru ${idx+1}/${qs.length} · Doğru: ${correct}</p>
        <p class="mg-question">${q.q}</p>
        <div class="mg-opts">
          ${q.opts.map(o=>`<button class="btn" data-a="${o}">${o}</button>`).join('')}
        </div>`;
      el.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{
        const ok=b.dataset.a===q.ans; b.classList.add(ok?'flash-pos':'flash-neg');
        if(ok)correct++; idx++; setTimeout(show,700);
      });
    }
    show();
  },

  /* 15 ── DENGE ───────────────────────────────────────────────────── */
  balance(el, cfg, done) {
    const zoneH = cfg.zone || 20;
    const need  = cfg.stableMs || 2500;
    let pos=50,vel=0,stable=0,raf,over=false;
    el.innerHTML=`
      <p class="mg-sub">Çubuğu ortada tut! ← Sol | Sağ →</p>
      <div class="mg-track" style="margin:1rem 0">
        <div class="mg-zone" style="left:${50-zoneH/2}%;width:${zoneH}%"></div>
        <div class="mg-cursor" id="mg-bal-cur"></div>
      </div>
      <div class="mg-stable-info" id="mg-stable-info">Ortala!</div>
      <div class="mg-two-btns" style="margin-top:.5rem">
        <button class="btn btn-primary" id="mg-bl" style="font-size:1.3rem">⬅</button>
        <button class="btn btn-primary" id="mg-br" style="font-size:1.3rem">➡</button>
      </div>`;
    const cur=document.getElementById('mg-bal-cur');
    const info=document.getElementById('mg-stable-info');
    let lH=false,rH=false;
    const L=document.getElementById('mg-bl'),R=document.getElementById('mg-br');
    L.onmousedown=L.ontouchstart=()=>lH=true; L.onmouseup=L.ontouchend=()=>lH=false;
    R.onmousedown=R.ontouchstart=()=>rH=true; R.onmouseup=R.ontouchend=()=>rH=false;
    let last=performance.now();
    function frame(now){
      const dt=Math.min((now-last)/16,3); last=now;
      if(lH)vel-=0.4*dt; if(rH)vel+=0.4*dt;
      vel+=(Math.random()-.5)*0.15*dt; vel*=0.92;
      pos=Math.max(2,Math.min(98,pos+vel));
      cur.style.left=pos+'%';
      const inZone=Math.abs(pos-50)<zoneH/2;
      if(inZone){stable+=now-last+16;info.textContent=`Dengede: ${(stable/1000).toFixed(1)}s / ${(need/1000).toFixed(1)}s`;info.style.color='var(--color-pos)'}
      else{stable=Math.max(0,stable-30);info.textContent='Ortala!';info.style.color='var(--color-muted)';}
      if(!over&&stable>=need){over=true;cancelAnimationFrame(raf);done('win');}
      else if(!over) raf=requestAnimationFrame(frame);
    }
    raf=requestAnimationFrame(frame);
    setTimeout(()=>{if(!over){over=true;cancelAnimationFrame(raf);done(Math.abs(pos-50)<zoneH/2?'win':'lose');}},12000);
  },

};

/* ─── Yardımcı: Matematik soruları üret ────────────────────────────── */
function genMath(n) {
  return Array.from({length:n},()=>{
    const a=Math.floor(Math.random()*12)+2, b=Math.floor(Math.random()*12)+2;
    const op=['+','-','×'][Math.floor(Math.random()*3)];
    const ans=op==='+'?a+b:op==='-'?Math.abs(a-b):a*b;
    const wrong=[ans+Math.floor(Math.random()*4)+1,ans-Math.floor(Math.random()*4)-1].filter(x=>x!==ans&&x>0);
    return {q:`${op==='-'?Math.max(a,b):a} ${op} ${op==='-'?Math.min(a,b):b} = ?`, ans, opts:shuffle([ans,...wrong.slice(0,2)])};
  });
}
