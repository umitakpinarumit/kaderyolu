/**
 * CircuitPuzzle — Görsel Tel Döndürme Bulmacası
 * 4×4 grid. Her hücreye dokunarak 90° CW döndür.
 * Kaynak 🔋 (0,0) → Hedef 💡 (3,3) arası yolu tamamla.
 * Süre: 90s. Tamamlama hızına göre bonus stat.
 */
import { SAFE_TOP } from '../../utils/safeArea';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Platform, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const { width: SW } = Dimensions.get('window');
const CELL_SIZE = Math.floor((SW - 32) / 4);
const HALF      = Math.floor(CELL_SIZE / 2);
const WIRE_W    = 6;
const TIME_S    = 90;

// ── Wire connection helpers ──────────────────────────────────────────────────
// Connections: [top, right, bottom, left]

const BASE_CONNECTIONS = {
  S: [false, true, false, true],  // straight (horizontal)
  C: [false, true, true, false],  // corner (right+bottom)
  D: [true, false, false, false], // dead end (top only)
};

function rotateCW(conn) {
  // [top,right,bottom,left] → [old_left, old_top, old_right, old_bottom]
  return [conn[3], conn[0], conn[1], conn[2]];
}

function getConnections(type, rotations) {
  if (type === 'src' || type === 'snk') return [true, true, true, true];
  let c = [...BASE_CONNECTIONS[type]];
  for (let i = 0; i < rotations; i++) c = rotateCW(c);
  return c;
}

// ── Puzzle definitions ───────────────────────────────────────────────────────
// Each cell: { type: 'src'|'snk'|'S'|'C'|'D', solutionRot: 0-3 }
const PUZZLES = [
  // Puzzle 1 — L-shape: right→right→right→down→down→down
  [
    [{ type: 'src', solutionRot: 0 }, { type: 'S', solutionRot: 0 }, { type: 'S', solutionRot: 0 }, { type: 'C', solutionRot: 1 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'S', solutionRot: 1 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'S', solutionRot: 1 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2  }, { type: 'snk', solutionRot: 0 }],
  ],
  // Puzzle 2 — S-curve: down→down→right→right→right→down
  [
    [{ type: 'src', solutionRot: 0 }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }],
    [{ type: 'S', solutionRot: 1  }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }],
    [{ type: 'C', solutionRot: 3  }, { type: 'S', solutionRot: 0 }, { type: 'S', solutionRot: 0 }, { type: 'C', solutionRot: 1 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }, { type: 'snk', solutionRot: 0 }],
  ],
  // Puzzle 3 — Zigzag
  [
    [{ type: 'src', solutionRot: 0 }, { type: 'S', solutionRot: 0 }, { type: 'C', solutionRot: 1 }, { type: 'D', solutionRot: 3 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2 }, { type: 'S', solutionRot: 1 }, { type: 'D', solutionRot: 2 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2 }, { type: 'C', solutionRot: 3 }, { type: 'C', solutionRot: 1 }],
    [{ type: 'D', solutionRot: 2  }, { type: 'D', solutionRot: 2 }, { type: 'D', solutionRot: 2 }, { type: 'snk', solutionRot: 0 }],
  ],
];

/** Initialize grid state from puzzle, randomizing non-src/snk rotations */
function initGrid(puzzle) {
  return puzzle.map(row =>
    row.map(cell => {
      if (cell.type === 'src' || cell.type === 'snk') return { ...cell, rot: 0 };
      // Pick a random rotation that is different from solutionRot
      let r = Math.floor(Math.random() * 4);
      // Try to avoid accidentally matching the solution
      if (r === cell.solutionRot) r = (r + 1 + Math.floor(Math.random() * 3)) % 4;
      return { ...cell, rot: r };
    })
  );
}

/** BFS from (0,0) to (3,3). Returns Set of powered cell keys "r,c". */
function bfs(grid) {
  const powered = new Set();
  const queue = [[0, 0]];
  powered.add('0,0');

  while (queue.length > 0) {
    const [r, c] = queue.shift();
    const conn = getConnections(grid[r][c].type, grid[r][c].rot);

    const neighbors = [
      { dr: -1, dc:  0, myEdge: 0, theirEdge: 2 }, // top
      { dr:  0, dc:  1, myEdge: 1, theirEdge: 3 }, // right
      { dr:  1, dc:  0, myEdge: 2, theirEdge: 0 }, // bottom
      { dr:  0, dc: -1, myEdge: 3, theirEdge: 1 }, // left
    ];

    for (const { dr, dc, myEdge, theirEdge } of neighbors) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr < 0 || nr > 3 || nc < 0 || nc > 3) continue;
      const key = `${nr},${nc}`;
      if (powered.has(key)) continue;
      if (!conn[myEdge]) continue;

      const neighborConn = getConnections(grid[nr][nc].type, grid[nr][nc].rot);
      if (!neighborConn[theirEdge]) continue;

      powered.add(key);
      queue.push([nr, nc]);
    }
  }

  return powered;
}

// ── Wire segment renderer ─────────────────────────────────────────────────────
function WireCell({ cell, powered, onPress }) {
  const conn  = getConnections(cell.type, cell.rot);
  const color = powered ? '#4ade80' : '#374151';
  const glow  = powered
    ? (Platform.OS === 'android' ? {} : { shadowColor: '#4ade80', shadowOpacity: 0.8, shadowRadius: 4 })
    : {};

  const isSource = cell.type === 'src';
  const isSink   = cell.type === 'snk';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        s.cell,
        { width: CELL_SIZE, height: CELL_SIZE },
        powered && s.cellPowered,
      ]}
    >
      {/* Top wire */}
      {conn[0] && (
        <View style={[s.wireTop, { backgroundColor: color }, glow]} />
      )}
      {/* Right wire */}
      {conn[1] && (
        <View style={[s.wireRight, { backgroundColor: color }, glow]} />
      )}
      {/* Bottom wire */}
      {conn[2] && (
        <View style={[s.wireBottom, { backgroundColor: color }, glow]} />
      )}
      {/* Left wire */}
      {conn[3] && (
        <View style={[s.wireLeft, { backgroundColor: color }, glow]} />
      )}
      {/* Center dot — shown if 2+ connections */}
      {conn.filter(Boolean).length >= 2 && (
        <View style={[s.wireDot, { backgroundColor: color }]} />
      )}
      {/* Source / Sink label */}
      {isSource && <Text style={s.nodeEmoji}>🔋</Text>}
      {isSink   && <Text style={s.nodeEmoji}>💡</Text>}
    </TouchableOpacity>
  );
}

// ── Main component ───────────────────────────────────────────────────────────
export default function CircuitPuzzle({ choice, onComplete }) {
  const puzzleIdx = useRef(Math.floor(Math.random() * PUZZLES.length)).current;
  const [grid,      setGrid]    = useState(() => initGrid(PUZZLES[puzzleIdx]));
  const [powered,   setPowered] = useState(() => bfs(initGrid(PUZZLES[puzzleIdx])));
  const [timeLeft,  setTime]    = useState(TIME_S);
  const [won,       setWon]     = useState(false);
  const [done,      setDone]    = useState(false);
  const timerRef    = useRef(null);
  const winFlashOp  = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTime(t => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setDone(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const handleTap = useCallback((r, c) => {
    if (won || done) return;
    const cell = grid[r][c];
    if (cell.type === 'src' || cell.type === 'snk') return;

    const newGrid = grid.map((row, ri) =>
      row.map((cell2, ci) => {
        if (ri === r && ci === c) {
          return { ...cell2, rot: (cell2.rot + 1) % 4 };
        }
        return cell2;
      })
    );

    const newPowered = bfs(newGrid);
    setGrid(newGrid);
    setPowered(newPowered);

    if (newPowered.has('3,3')) {
      clearInterval(timerRef.current);
      setWon(true);
      winFlashOp.setValue(0.6);
      Animated.timing(winFlashOp, { toValue: 0, duration: 1000, useNativeDriver: true }).start(() => {
        setDone(true);
      });
    }
  }, [grid, won, done]);

  const calcBonus = (remaining, solved) => {
    if (!solved) return { intelligence: 1, discipline: 0, focus: 0 };
    return {
      intelligence: remaining > 60 ? 5 : remaining > 40 ? 4 : remaining > 20 ? 3 : 2,
      discipline:   remaining > 60 ? 3 : remaining > 40 ? 2 : remaining > 20 ? 1 : 1,
      focus:        remaining > 45 ? 2 : 1,
    };
  };

  // ── SONUÇ ─────────────────────────────────────────────────────────────────
  if (done) {
    const bonus = calcBonus(timeLeft, won);
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 64, marginBottom: 10 }}>
          {won ? '⚡🏆' : '🔧'}
        </Text>
        <Text style={s.resultTitle}>
          {won ? 'Devre Tamamlandı!' : 'Süre Doldu!'}
        </Text>
        <Text style={s.resultSub}>
          {won
            ? `${TIME_S - timeLeft}s'de çözdün!`
            : 'Bir dahaki sefere daha hızlı olacaksın!'}
        </Text>
        {Object.values(bonus).some(v => v > 0) && (
          <View style={s.bonusBox}>
            <Text style={s.bonusTitle}>🔧 Kazanılan bonuslar</Text>
            {bonus.intelligence > 0 && <Text style={s.bonusLine}>🧠 Zekâ +{bonus.intelligence}</Text>}
            {bonus.discipline > 0   && <Text style={s.bonusLine}>🎯 Disiplin +{bonus.discipline}</Text>}
            {bonus.focus > 0        && <Text style={s.bonusLine}>⚡ Odak +{bonus.focus}</Text>}
          </View>
        )}
        <TouchableOpacity style={s.btn} onPress={() => onComplete(bonus)}>
          <Text style={s.btnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const timerPct = (timeLeft / TIME_S) * 100;

  return (
    <View style={s.screen}>
      {/* Win flash */}
      <Animated.View pointerEvents="none"
        style={[StyleSheet.absoluteFill, { backgroundColor: '#4ade80', opacity: winFlashOp }]} />

      {/* HUD */}
      <View style={s.hud}>
        <Text style={s.hudTitle}>⚡ Devre Bulmacası</Text>
        <View style={s.hudRow}>
          <Text style={s.hudSub}>🔋 → 💡 yolunu tamamla</Text>
          <Text style={[s.hudTimer, timeLeft <= 15 && { color: '#f85149' }]}>⏱ {timeLeft}s</Text>
        </View>
        <View style={s.timerTrack}>
          <View style={[s.timerFill, { width: `${timerPct}%`, backgroundColor: timeLeft <= 15 ? '#f85149' : '#4ade80' }]} />
        </View>
        <Text style={s.hudHint}>Hücrelere dokun → 90° döndür</Text>
      </View>

      {/* Grid */}
      <View style={s.gridContainer}>
        {grid.map((row, r) => (
          <View key={r} style={s.gridRow}>
            {row.map((cell, c) => (
              <WireCell
                key={c}
                cell={cell}
                powered={powered.has(`${r},${c}`)}
                onPress={() => handleTap(r, c)}
              />
            ))}
          </View>
        ))}
      </View>

      {/* Legend */}
      <View style={s.legend}>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: '#4ade80' }]} />
          <Text style={s.legendTxt}>Güçlü</Text>
        </View>
        <View style={s.legendItem}>
          <View style={[s.legendDot, { backgroundColor: '#374151' }]} />
          <Text style={s.legendTxt}>Güçsüz</Text>
        </View>
        <Text style={s.legendTxt}>Bulmaca {puzzleIdx + 1}/3</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen:   { flex: 1, backgroundColor: '#050a14' },
  center:   { flex: 1, backgroundColor: '#050a14', alignItems: 'center', justifyContent: 'center', padding: 24 },
  hud:      {
    paddingTop: SAFE_TOP, paddingHorizontal: 16, paddingBottom: 10,
    backgroundColor: '#0d1117', borderBottomWidth: 1, borderColor: '#21262d',
  },
  hudTitle: { color: '#4ade80', fontSize: 17, fontWeight: '900', textAlign: 'center', marginBottom: 4 },
  hudRow:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  hudSub:   { color: '#8b949e', fontSize: 13 },
  hudTimer: { color: '#e6edf3', fontSize: 16, fontWeight: '900' },
  timerTrack: { width: '100%', height: 4, backgroundColor: '#21262d', borderRadius: 2, overflow: 'hidden', marginBottom: 4 },
  timerFill:  { height: '100%', borderRadius: 2 },
  hudHint:  { color: '#6b7280', fontSize: 11, textAlign: 'center' },
  gridContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 16 },
  gridRow:  { flexDirection: 'row' },
  cell: {
    backgroundColor: '#0d1117',
    borderWidth: 1,
    borderColor: '#21262d',
    position: 'relative',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellPowered: { backgroundColor: '#071a07', borderColor: '#166534' },
  // Wire segments — absolute positioned relative to cell
  wireTop: {
    position: 'absolute',
    left: HALF - Math.floor(WIRE_W / 2),
    top: 0,
    width: WIRE_W,
    height: HALF,
    borderRadius: 2,
  },
  wireBottom: {
    position: 'absolute',
    left: HALF - Math.floor(WIRE_W / 2),
    top: HALF,
    width: WIRE_W,
    height: HALF,
    borderRadius: 2,
  },
  wireLeft: {
    position: 'absolute',
    top: HALF - Math.floor(WIRE_W / 2),
    left: 0,
    height: WIRE_W,
    width: HALF,
    borderRadius: 2,
  },
  wireRight: {
    position: 'absolute',
    top: HALF - Math.floor(WIRE_W / 2),
    left: HALF,
    height: WIRE_W,
    width: HALF,
    borderRadius: 2,
  },
  wireDot: {
    position: 'absolute',
    left: HALF - Math.floor(WIRE_W / 2),
    top: HALF - Math.floor(WIRE_W / 2),
    width: WIRE_W,
    height: WIRE_W,
    borderRadius: WIRE_W / 2,
  },
  nodeEmoji: { fontSize: 20, position: 'absolute', zIndex: 10 },
  legend:   { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20, paddingVertical: 10, borderTopWidth: 1, borderColor: '#21262d', backgroundColor: '#0d1117' },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendDot:  { width: 10, height: 10, borderRadius: 5 },
  legendTxt:  { color: '#6b7280', fontSize: 12 },
  resultTitle: { color: '#e6edf3', fontSize: 26, fontWeight: '900', textAlign: 'center', marginBottom: 6 },
  resultSub:   { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 14 },
  bonusBox:    {
    backgroundColor: '#071a0c', borderRadius: 12, padding: 14, marginBottom: 18,
    width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#166534',
  },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: '#4ade80', fontSize: 13, marginBottom: 2 },
  btn:         { backgroundColor: '#15803d', paddingVertical: 14, paddingHorizontal: 36, borderRadius: 14 },
  btnTxt:      { color: '#fff', fontSize: 16, fontWeight: '800' },
});
