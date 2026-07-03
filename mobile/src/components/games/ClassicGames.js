/**
 * ClassicGames — Bilgisayar fuarı arcade seçici + 6 klasik oyun
 * Seçim ekranı → seçilen oyun → sonuç ekranı → onComplete(bonus).
 * Oyunlar: Duck Hunt, Snake, Space Invaders, Pong, Breakout, Pac-Man.
 * Her oyun skoruna göre confidence/intelligence/focus bonusu verir.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useEffect, useRef, useState } from 'react';
import {
  Dimensions, Platform, StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');

const GAMES = [
  { id: 'duck',    name: 'Duck Hunt',      icon: '🦆', desc: 'Ördekleri vur!' },
  { id: 'snake',   name: 'Snake',          icon: '🐍', desc: 'Elma topla, büyü!' },
  { id: 'invaders',name: 'Space Invaders', icon: '👾', desc: 'Uzaylıları yok et!' },
  { id: 'pong',    name: 'Pong',           icon: '🏓', desc: 'Topu sektir!' },
  { id: 'breakout',name: 'Breakout',       icon: '🧱', desc: 'Tuğlaları kır!' },
  { id: 'pacman',  name: 'Pac-Man',        icon: '🟡', desc: 'Noktaları ye!' },
];

const bonusFromScore = (score, maxScore) => {
  const pct = maxScore > 0 ? Math.min(1, score / maxScore) : 0;
  return {
    confidence:   Math.round(pct * 5),
    intelligence: Math.round(pct * 4),
    focus:        Math.round(pct * 3),
  };
};

// ════════════════════════════ DPAD (shared) ════════════════════════════════
function DPad({ onDir }) {
  return (
    <View style={d.wrap}>
      <TouchableOpacity style={d.btn} onPress={() => onDir('up')}><Text style={d.txt}>↑</Text></TouchableOpacity>
      <View style={d.row}>
        <TouchableOpacity style={d.btn} onPress={() => onDir('left')}><Text style={d.txt}>←</Text></TouchableOpacity>
        <TouchableOpacity style={d.btn} onPress={() => onDir('right')}><Text style={d.txt}>→</Text></TouchableOpacity>
      </View>
      <TouchableOpacity style={d.btn} onPress={() => onDir('down')}><Text style={d.txt}>↓</Text></TouchableOpacity>
    </View>
  );
}
const d = StyleSheet.create({
  wrap: { alignItems: 'center', gap: 6, paddingVertical: 10 },
  row: { flexDirection: 'row', gap: 50 },
  btn: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#1f2937', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#374151' },
  txt: { color: '#e6edf3', fontSize: 24, fontWeight: '900' },
});

function Header({ title, score, timeLeft, onBack }) {
  return (
    <View style={c.gHud}>
      <TouchableOpacity onPress={onBack}><Text style={c.back}>‹ Geri</Text></TouchableOpacity>
      <Text style={c.gTitle}>{title}</Text>
      <Text style={c.gScore}>{score != null ? `⭐${score}` : ''} {timeLeft != null ? `⏱${timeLeft}` : ''}</Text>
    </View>
  );
}

// ════════════════════════════ 1. DUCK HUNT ═════════════════════════════════
function DuckHunt({ onDone, onBack }) {
  const TOTAL = 15;
  const [duck, setDuck] = useState(null);
  const [shot, setShot] = useState(0);
  const [spawned, setSpawned] = useState(0);
  const [time, setTime] = useState(45);
  const sRef = useRef(0), dRef = useRef(false), hideRef = useRef(null), tRef = useRef(null);

  const finish = () => { if (dRef.current) return; dRef.current = true; clearTimeout(hideRef.current); clearInterval(tRef.current); onDone(shotCnt.current, TOTAL); };
  const shotCnt = useRef(0);

  const next = () => {
    if (dRef.current) return;
    if (sRef.current >= TOTAL) { finish(); return; }
    sRef.current += 1; setSpawned(sRef.current);
    setDuck({ x: 20 + Math.random() * (SW - 100), y: 60 + Math.random() * 320 });
    hideRef.current = setTimeout(() => { setDuck(null); setTimeout(next, 300); }, 2000);
  };
  useEffect(() => {
    const st = setTimeout(next, 400);
    tRef.current = setInterval(() => setTime(t => { if (t <= 1) { finish(); return 0; } return t - 1; }), 1000);
    return () => { clearTimeout(st); clearTimeout(hideRef.current); clearInterval(tRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const hit = () => { clearTimeout(hideRef.current); shotCnt.current += 1; setShot(shotCnt.current); setDuck(null); setTimeout(next, 250); };

  return (
    <View style={c.gScreen}>
      <Header title="🦆 Duck Hunt" score={`${shot}/${TOTAL}`} timeLeft={time} onBack={onBack} />
      <View style={c.field}>
        {duck && (
          <TouchableOpacity style={[c.abs, { left: duck.x, top: duck.y }]} onPress={hit} activeOpacity={0.6}>
            <Text style={{ fontSize: 48 }}>🦆</Text>
          </TouchableOpacity>
        )}
      </View>
      <Text style={c.gFoot}>Ördeklere dokun! {spawned}/{TOTAL} çıktı</Text>
    </View>
  );
}

// ════════════════════════════ 2. SNAKE ═════════════════════════════════════
function SnakeGame({ onDone, onBack }) {
  const COLS = 12, ROWS = 16, CELL = Math.floor((SW - 24) / COLS);
  const [snake, setSnake] = useState([{ x: 6, y: 8 }]);
  const [apple, setApple] = useState({ x: 9, y: 8 });
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(60);
  const dirRef = useRef({ x: 1, y: 0 });
  const snakeRef = useRef([{ x: 6, y: 8 }]);
  const appleRef = useRef({ x: 9, y: 8 });
  const overRef = useRef(false);
  const scoreRef = useRef(0);

  const finish = () => { if (overRef.current) return; overRef.current = true; onDone(scoreRef.current, 20); };
  const randApple = (body) => { let a; do { a = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; } while (body.some(b => b.x === a.x && b.y === a.y)); return a; };

  useEffect(() => {
    const mv = setInterval(() => {
      if (overRef.current) return;
      const dir = dirRef.current;
      const head = { x: snakeRef.current[0].x + dir.x, y: snakeRef.current[0].y + dir.y };
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS || snakeRef.current.some(b => b.x === head.x && b.y === head.y)) { finish(); clearInterval(mv); return; }
      let body = [head, ...snakeRef.current];
      if (head.x === appleRef.current.x && head.y === appleRef.current.y) {
        scoreRef.current += 1; setScore(scoreRef.current);
        appleRef.current = randApple(body); setApple(appleRef.current);
      } else body = body.slice(0, -1);
      snakeRef.current = body; setSnake(body);
    }, 300);
    const tm = setInterval(() => setTime(t => { if (t <= 1) { finish(); clearInterval(mv); clearInterval(tm); return 0; } return t - 1; }), 1000);
    return () => { clearInterval(mv); clearInterval(tm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const turn = (dir) => {
    const cur = dirRef.current;
    if (dir === 'up' && cur.y !== 1) dirRef.current = { x: 0, y: -1 };
    if (dir === 'down' && cur.y !== -1) dirRef.current = { x: 0, y: 1 };
    if (dir === 'left' && cur.x !== 1) dirRef.current = { x: -1, y: 0 };
    if (dir === 'right' && cur.x !== -1) dirRef.current = { x: 1, y: 0 };
  };

  return (
    <View style={c.gScreen}>
      <Header title="🐍 Snake" score={score} timeLeft={time} onBack={onBack} />
      <View style={[c.board, { width: COLS * CELL, height: ROWS * CELL }]}>
        {snake.map((seg, i) => <View key={i} style={{ position: 'absolute', left: seg.x * CELL, top: seg.y * CELL, width: CELL - 1, height: CELL - 1, backgroundColor: i === 0 ? '#4ade80' : '#22c55e', borderRadius: 2 }} />)}
        <View style={{ position: 'absolute', left: apple.x * CELL, top: apple.y * CELL, width: CELL - 1, height: CELL - 1, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: CELL - 4 }}>🍎</Text></View>
      </View>
      <DPad onDir={turn} />
    </View>
  );
}

// ════════════════════════════ 3. SPACE INVADERS ════════════════════════════
function Invaders({ onDone, onBack }) {
  const COLS = 4, ROWS = 3, CELL = Math.floor((SW - 40) / COLS);
  const buildInv = () => { const g = []; for (let r = 0; r < ROWS; r++) for (let cc = 0; cc < COLS; cc++) g.push({ r, c: cc, alive: true }); return g; };
  const [inv, setInv] = useState(buildInv());
  const [px, setPx] = useState(1);
  const [bullet, setBullet] = useState(null);
  const [shift, setShift] = useState(0);
  const [rowOff, setRowOff] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(90);
  const invRef = useRef(inv), pxRef = useRef(1), bRef = useRef(null), shiftRef = useRef(0), rowRef = useRef(0), overRef = useRef(false), scoreRef = useRef(0);

  const finish = (win) => { if (overRef.current) return; overRef.current = true; onDone(scoreRef.current, COLS * ROWS); };

  useEffect(() => {
    const bm = setInterval(() => {
      if (overRef.current || !bRef.current) return;
      const nb = { x: bRef.current.x, y: bRef.current.y - 1 };
      const hitIdx = invRef.current.findIndex(v => v.alive && v.c + shiftRef.current === nb.x && v.r + rowRef.current === nb.y);
      if (hitIdx >= 0) {
        const cp = [...invRef.current]; cp[hitIdx] = { ...cp[hitIdx], alive: false }; invRef.current = cp; setInv(cp);
        scoreRef.current += 1; setScore(scoreRef.current); bRef.current = null; setBullet(null);
        if (!cp.some(v => v.alive)) { finish(true); }
      } else if (nb.y < 0) { bRef.current = null; setBullet(null); }
      else { bRef.current = nb; setBullet(nb); }
    }, 120);
    const im = setInterval(() => {
      if (overRef.current) return;
      if (shiftRef.current >= COLS) { rowRef.current += 1; shiftRef.current = 0; setRowOff(rowRef.current); }
      else { shiftRef.current += 1; setShift(shiftRef.current); }
      if (rowRef.current + ROWS >= 9) finish(false); // reached player row
    }, 2000);
    const tm = setInterval(() => setTime(t => { if (t <= 1) { finish(false); return 0; } return t - 1; }), 1000);
    return () => { clearInterval(bm); clearInterval(im); clearInterval(tm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = (dir) => { if (dir === 'left') { pxRef.current = Math.max(0, pxRef.current - 1); setPx(pxRef.current); } if (dir === 'right') { pxRef.current = Math.min(COLS - 1, pxRef.current + 1); setPx(pxRef.current); } };
  const fire = () => { if (!bRef.current) { bRef.current = { x: pxRef.current, y: 8 }; setBullet(bRef.current); } };

  return (
    <View style={c.gScreen}>
      <Header title="👾 Invaders" score={score} timeLeft={time} onBack={onBack} />
      <View style={[c.board, { width: COLS * CELL, height: 9 * CELL, backgroundColor: '#02040a' }]}>
        {inv.map((v, i) => v.alive ? <Text key={i} style={{ position: 'absolute', left: (v.c + shift) * CELL, top: (v.r + rowOff) * CELL, fontSize: CELL - 8 }}>👾</Text> : null)}
        {bullet && <Text style={{ position: 'absolute', left: bullet.x * CELL + CELL / 3, top: bullet.y * CELL, fontSize: CELL - 8, color: '#fbbf24', fontWeight: '900' }}>|</Text>}
        <Text style={{ position: 'absolute', left: px * CELL, top: 8 * CELL, fontSize: CELL - 8 }}>🚀</Text>
      </View>
      <View style={c.ctrlRow}>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('left')}><Text style={c.ctrlTxt}>←</Text></TouchableOpacity>
        <TouchableOpacity style={[c.ctrlBtn, c.fireBtn]} onPress={fire}><Text style={c.ctrlTxt}>ATEŞ</Text></TouchableOpacity>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('right')}><Text style={c.ctrlTxt}>→</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ════════════════════════════ 4. PONG ══════════════════════════════════════
function Pong({ onDone, onBack }) {
  const BW = SW - 24, BH = 400, PW = 80, PH = 12, R = 12;
  const [ball, setBall] = useState({ x: BW / 2, y: BH / 2 });
  const [px, setPx] = useState(BW / 2 - PW / 2);
  const [aiX, setAiX] = useState(BW / 2 - PW / 2);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(60);
  const bRef = useRef({ x: BW / 2, y: BH / 2 }), vRef = useRef({ x: 2.5, y: 3.5 }), pxRef = useRef(BW / 2 - PW / 2), aiRef = useRef(BW / 2 - PW / 2);
  const overRef = useRef(false), scoreRef = useRef(0), livesRef = useRef(3);

  const finish = () => { if (overRef.current) return; overRef.current = true; onDone(scoreRef.current, 10); };
  const reset = (dir) => { bRef.current = { x: BW / 2, y: BH / 2 }; vRef.current = { x: 2.5 * (Math.random() > 0.5 ? 1 : -1), y: 3.5 * dir }; };

  useEffect(() => {
    const lp = setInterval(() => {
      if (overRef.current) return;
      let b = bRef.current, v = vRef.current;
      let nx = b.x + v.x, ny = b.y + v.y;
      if (nx <= R || nx >= BW - R) v.x = -v.x;
      // AI tracks ball
      const target = b.x - PW / 2; aiRef.current += (target - aiRef.current) * 0.08; aiRef.current = Math.max(0, Math.min(BW - PW, aiRef.current)); setAiX(aiRef.current);
      // top (AI) collision
      if (ny <= PH + R && b.x >= aiRef.current && b.x <= aiRef.current + PW) { v.y = Math.abs(v.y); }
      else if (ny <= 0) { scoreRef.current += 1; setScore(scoreRef.current); reset(1); bRef.current = { x: BW / 2, y: BH / 2 }; return; }
      // bottom (player) collision
      if (ny >= BH - PH - R && b.x >= pxRef.current && b.x <= pxRef.current + PW) { v.y = -Math.abs(v.y); }
      else if (ny >= BH) { livesRef.current -= 1; setLives(livesRef.current); if (livesRef.current <= 0) { finish(); clearInterval(lp); return; } reset(-1); bRef.current = { x: BW / 2, y: BH / 2 }; return; }
      vRef.current = v; bRef.current = { x: nx, y: ny }; setBall(bRef.current);
    }, 16);
    const tm = setInterval(() => setTime(t => { if (t <= 1) { finish(); clearInterval(lp); clearInterval(tm); return 0; } return t - 1; }), 1000);
    return () => { clearInterval(lp); clearInterval(tm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = (dir) => { const step = 36; if (dir === 'left') pxRef.current = Math.max(0, pxRef.current - step); else pxRef.current = Math.min(BW - PW, pxRef.current + step); setPx(pxRef.current); };

  return (
    <View style={c.gScreen}>
      <Header title="🏓 Pong" score={score} timeLeft={time} onBack={onBack} />
      <Text style={c.gFoot}>{'❤️'.repeat(Math.max(0, lives))}</Text>
      <View style={[c.board, { width: BW, height: BH, backgroundColor: '#02040a' }]}>
        <View style={{ position: 'absolute', top: 0, left: aiX, width: PW, height: PH, backgroundColor: '#f87171', borderRadius: 4 }} />
        <View style={{ position: 'absolute', left: ball.x - R, top: ball.y - R, width: R * 2, height: R * 2, borderRadius: R, backgroundColor: '#fbbf24' }} />
        <View style={{ position: 'absolute', bottom: 0, left: px, width: PW, height: PH, backgroundColor: '#4ade80', borderRadius: 4 }} />
      </View>
      <View style={c.ctrlRow}>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('left')}><Text style={c.ctrlTxt}>←</Text></TouchableOpacity>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('right')}><Text style={c.ctrlTxt}>→</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ════════════════════════════ 5. BREAKOUT ══════════════════════════════════
function Breakout({ onDone, onBack }) {
  const BW = SW - 24, BH = 420, PW = 76, PH = 12, R = 9, BR = 4, BC = 6;
  const BRICK_W = BW / BC, BRICK_H = 22, COLORS = ['#f87171', '#fb923c', '#fbbf24', '#4ade80'];
  const build = () => { const g = []; for (let r = 0; r < BR; r++) for (let cc = 0; cc < BC; cc++) g.push({ r, c: cc, alive: true }); return g; };
  const [bricks, setBricks] = useState(build());
  const [ball, setBall] = useState({ x: BW / 2, y: BH - 40 });
  const [px, setPx] = useState(BW / 2 - PW / 2);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [time, setTime] = useState(90);
  const brRef = useRef(bricks), bRef = useRef({ x: BW / 2, y: BH - 40 }), vRef = useRef({ x: 2.5, y: -3 }), pxRef = useRef(BW / 2 - PW / 2);
  const overRef = useRef(false), scoreRef = useRef(0), livesRef = useRef(3);

  const finish = () => { if (overRef.current) return; overRef.current = true; onDone(scoreRef.current, BR * BC); };

  useEffect(() => {
    const lp = setInterval(() => {
      if (overRef.current) return;
      let b = bRef.current, v = vRef.current;
      let nx = b.x + v.x, ny = b.y + v.y;
      if (nx <= R || nx >= BW - R) v.x = -v.x;
      if (ny <= R) v.y = -v.y;
      // brick collision
      const col = Math.floor(nx / BRICK_W), row = Math.floor(ny / BRICK_H);
      const idx = brRef.current.findIndex(bk => bk.alive && bk.c === col && bk.r === row);
      if (idx >= 0 && ny < BR * BRICK_H + 4) {
        const cp = [...brRef.current]; cp[idx] = { ...cp[idx], alive: false }; brRef.current = cp; setBricks(cp);
        v.y = -v.y; scoreRef.current += 1; setScore(scoreRef.current);
        if (!cp.some(bk => bk.alive)) { finish(); clearInterval(lp); return; }
      }
      // paddle
      if (ny >= BH - PH - R && b.x >= pxRef.current && b.x <= pxRef.current + PW) v.y = -Math.abs(v.y);
      else if (ny >= BH) { livesRef.current -= 1; setLives(livesRef.current); if (livesRef.current <= 0) { finish(); clearInterval(lp); return; } bRef.current = { x: BW / 2, y: BH - 40 }; vRef.current = { x: 2.5, y: -3 }; return; }
      vRef.current = v; bRef.current = { x: nx, y: ny }; setBall(bRef.current);
    }, 16);
    const tm = setInterval(() => setTime(t => { if (t <= 1) { finish(); clearInterval(lp); clearInterval(tm); return 0; } return t - 1; }), 1000);
    return () => { clearInterval(lp); clearInterval(tm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = (dir) => { const step = 36; if (dir === 'left') pxRef.current = Math.max(0, pxRef.current - step); else pxRef.current = Math.min(BW - PW, pxRef.current + step); setPx(pxRef.current); };

  return (
    <View style={c.gScreen}>
      <Header title="🧱 Breakout" score={score} timeLeft={time} onBack={onBack} />
      <Text style={c.gFoot}>{'❤️'.repeat(Math.max(0, lives))}</Text>
      <View style={[c.board, { width: BW, height: BH, backgroundColor: '#02040a' }]}>
        {bricks.map((bk, i) => bk.alive ? <View key={i} style={{ position: 'absolute', left: bk.c * BRICK_W + 1, top: bk.r * BRICK_H + 1, width: BRICK_W - 2, height: BRICK_H - 2, backgroundColor: COLORS[bk.r % COLORS.length], borderRadius: 3 }} /> : null)}
        <View style={{ position: 'absolute', left: ball.x - R, top: ball.y - R, width: R * 2, height: R * 2, borderRadius: R, backgroundColor: '#fff' }} />
        <View style={{ position: 'absolute', bottom: 0, left: px, width: PW, height: PH, backgroundColor: '#60a5fa', borderRadius: 4 }} />
      </View>
      <View style={c.ctrlRow}>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('left')}><Text style={c.ctrlTxt}>←</Text></TouchableOpacity>
        <TouchableOpacity style={c.ctrlBtn} onPress={() => move('right')}><Text style={c.ctrlTxt}>→</Text></TouchableOpacity>
      </View>
    </View>
  );
}

// ════════════════════════════ 6. PAC-MAN ═══════════════════════════════════
function PacMan({ onDone, onBack }) {
  const COLS = 8, ROWS = 10, CELL = Math.floor((SW - 24) / COLS);
  const initDots = () => { const set = {}; for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) set[`${x},${y}`] = true; delete set['4,5']; delete set['1,1']; return set; };
  const [dots, setDots] = useState(initDots());
  const [pac, setPac] = useState({ x: 4, y: 5 });
  const [ghost, setGhost] = useState({ x: 1, y: 1 });
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(90);
  const pacRef = useRef({ x: 4, y: 5 }), ghostRef = useRef({ x: 1, y: 1 }), dotsRef = useRef(initDots());
  const overRef = useRef(false), scoreRef = useRef(0), totalRef = useRef(COLS * ROWS - 2);

  const finish = () => { if (overRef.current) return; overRef.current = true; onDone(scoreRef.current, totalRef.current); };

  useEffect(() => {
    const gm = setInterval(() => {
      if (overRef.current) return;
      const g = ghostRef.current, p = pacRef.current;
      const ng = { ...g };
      if (Math.abs(p.x - g.x) >= Math.abs(p.y - g.y)) ng.x += p.x > g.x ? 1 : p.x < g.x ? -1 : 0;
      else ng.y += p.y > g.y ? 1 : p.y < g.y ? -1 : 0;
      ghostRef.current = ng; setGhost(ng);
      if (ng.x === p.x && ng.y === p.y) { finish(); clearInterval(gm); }
    }, 600);
    const tm = setInterval(() => setTime(t => { if (t <= 1) { finish(); clearInterval(gm); clearInterval(tm); return 0; } return t - 1; }), 1000);
    return () => { clearInterval(gm); clearInterval(tm); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const move = (dir) => {
    if (overRef.current) return;
    const p = { ...pacRef.current };
    if (dir === 'up') p.y -= 1; if (dir === 'down') p.y += 1; if (dir === 'left') p.x -= 1; if (dir === 'right') p.x += 1;
    if (p.x < 0 || p.x >= COLS || p.y < 0 || p.y >= ROWS) return;
    pacRef.current = p; setPac(p);
    const key = `${p.x},${p.y}`;
    if (dotsRef.current[key]) { const cp = { ...dotsRef.current }; delete cp[key]; dotsRef.current = cp; setDots(cp); scoreRef.current += 1; setScore(scoreRef.current); if (Object.keys(cp).length === 0) finish(); }
    if (p.x === ghostRef.current.x && p.y === ghostRef.current.y) finish();
  };

  return (
    <View style={c.gScreen}>
      <Header title="🟡 Pac-Man" score={score} timeLeft={time} onBack={onBack} />
      <View style={[c.board, { width: COLS * CELL, height: ROWS * CELL, backgroundColor: '#02040a' }]}>
        {Object.keys(dots).map((k) => { const [x, y] = k.split(',').map(Number); return <View key={k} style={{ position: 'absolute', left: x * CELL + CELL / 2 - 2, top: y * CELL + CELL / 2 - 2, width: 4, height: 4, borderRadius: 2, backgroundColor: '#fde68a' }} />; })}
        <Text style={{ position: 'absolute', left: pac.x * CELL, top: pac.y * CELL, fontSize: CELL - 4 }}>🟡</Text>
        <Text style={{ position: 'absolute', left: ghost.x * CELL, top: ghost.y * CELL, fontSize: CELL - 4 }}>👻</Text>
      </View>
      <DPad onDir={move} />
    </View>
  );
}

// ════════════════════════════ ROOT ═════════════════════════════════════════
const GAME_COMPONENTS = { duck: DuckHunt, snake: SnakeGame, invaders: Invaders, pong: Pong, breakout: Breakout, pacman: PacMan };

export default function ClassicGames({ choice, onComplete }) {
  const [active, setActive] = useState(null);     // game id
  const [result, setResult] = useState(null);     // { score, max, bonus }

  if (result) {
    const { score, max, bonus } = result;
    return (
      <View style={c.center}>
        <Text style={{ fontSize: 60, marginBottom: 10 }}>🕹️🏆</Text>
        <Text style={c.rTitle}>Skor: {score}</Text>
        <Text style={c.rSub}>Klasik oyun tamamlandı!</Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={c.bonusBox}>
            <Text style={c.bonusTitle}>🕹️ Kazanılan bonuslar</Text>
            {bonus.confidence > 0   && <Text style={c.bonusLine}>💪 Özgüven +{bonus.confidence}</Text>}
            {bonus.intelligence > 0 && <Text style={c.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
            {bonus.focus > 0        && <Text style={c.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          </View>
        )}
        <TouchableOpacity style={c.btn} onPress={() => onComplete(bonus)}>
          <Text style={c.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (active) {
    const GameCmp = GAME_COMPONENTS[active];
    return (
      <GameCmp
        onBack={() => setActive(null)}
        onDone={(score, max) => setResult({ score, max, bonus: bonusFromScore(score, max) })}
      />
    );
  }

  // Selection screen
  return (
    <View style={c.selScreen}>
      <Text style={c.selTitle}>💻 Bilgisayar Fuarı</Text>
      <Text style={c.selSub}>Bir klasik oyun seç!</Text>
      <View style={c.selGrid}>
        {GAMES.map((g) => (
          <TouchableOpacity key={g.id} style={c.selCard} onPress={() => setActive(g.id)} activeOpacity={0.8}>
            <Text style={c.selIcon}>{g.icon}</Text>
            <Text style={c.selName}>{g.name}</Text>
            <Text style={c.selDesc}>{g.desc}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const c = StyleSheet.create({
  // root / selection
  selScreen: { flex: 1, backgroundColor: '#050a14', paddingTop: SAFE_TOP, paddingHorizontal: 14 },
  selTitle: { color: '#60a5fa', fontSize: 22, fontWeight: '900', textAlign: 'center' },
  selSub: { color: '#8b949e', fontSize: 13, textAlign: 'center', marginBottom: 16 },
  selGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 12 },
  selCard: { width: (SW - 40) / 2, backgroundColor: '#0d1117', borderRadius: 16, borderWidth: 1, borderColor: '#21262d', padding: 16, alignItems: 'center', marginBottom: 12, ...(Platform.OS === 'android' ? { elevation: 3 } : { shadowColor: '#000', shadowOpacity: 0.4, shadowRadius: 6 }) },
  selIcon: { fontSize: 44 },
  selName: { color: '#e6edf3', fontSize: 15, fontWeight: '800', marginTop: 6 },
  selDesc: { color: '#8b949e', fontSize: 11, textAlign: 'center', marginTop: 2 },
  // shared game chrome
  gScreen: { flex: 1, backgroundColor: '#050a14', alignItems: 'center' },
  gHud: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SAFE_TOP, paddingHorizontal: 14, paddingBottom: 8, backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d' },
  back: { color: '#60a5fa', fontSize: 15, fontWeight: '700' },
  gTitle: { color: '#e6edf3', fontSize: 16, fontWeight: '900' },
  gScore: { color: '#fbbf24', fontSize: 13, fontWeight: '700' },
  field: { flex: 1, width: '100%', position: 'relative' },
  abs: { position: 'absolute' },
  gFoot: { color: '#8b949e', fontSize: 13, textAlign: 'center', paddingVertical: 8 },
  board: { marginTop: 12, backgroundColor: '#0a0f1a', borderWidth: 1, borderColor: '#21262d', position: 'relative', alignSelf: 'center' },
  ctrlRow: { flexDirection: 'row', gap: 14, paddingVertical: 14, justifyContent: 'center' },
  ctrlBtn: { paddingVertical: 12, paddingHorizontal: 28, backgroundColor: '#1f2937', borderRadius: 12, borderWidth: 1, borderColor: '#374151' },
  fireBtn: { backgroundColor: '#b91c1c', borderColor: '#ef4444' },
  ctrlTxt: { color: '#e6edf3', fontSize: 18, fontWeight: '900' },
  // result
  center: { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  rTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', marginBottom: 4 },
  rSub: { color: '#8b949e', fontSize: 14, marginBottom: 14 },
  bonusBox: { backgroundColor: '#0d1117', borderRadius: 12, padding: 14, marginBottom: 18, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#21262d' },
  bonusTitle: { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine: { color: '#60a5fa', fontSize: 13, marginBottom: 2 },
  btn: { backgroundColor: '#2563eb', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
