/**
 * BadmintonGame v3 — Aile Pikniği Badminton 🏸
 *
 * Kontroller:
 *  - Parmağı SOL/SAĞ sürükle → raketi konumla
 *  - Kapatağ rakete değdiğinde OTOMATİK vurulur
 *  - Gölge, kapatağın nereye düşeceğini gösterir
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Animated, Dimensions, Easing, PanResponder,
  StyleSheet, Text, TouchableOpacity, View,
} from 'react-native';
import { SAFE_TOP } from '../../utils/safeArea';

const { width: SW, height: SH } = Dimensions.get('window');

const HUD_H   = SAFE_TOP + 64;
const CTRL_H  = 96;
const COURT_H = SH - HUD_H - CTRL_H;

const RACKET_W  = 100;
const RACKET_H  = 20;
const SHUTTLE_R = 16;
const SHADOW_W  = 80;
const RCOLOR    = '#4ade80';
const HCOLOR    = '#fbbf24';

// Raket merkezi Y (mahkeme tepesinden)
const RACKET_BOT      = 32;
const RACKET_CENTER_Y = COURT_H - RACKET_BOT - RACKET_H / 2;

// Çarpışma toleransı (±px)
const HIT_TOL_Y = 30;
const HIT_TOL_X = RACKET_W * 0.60;

// Kapatağ gölge bölgesi
const HIT_Y_TOP = COURT_H * 0.74;

// Animasyon süreleri
const FALL_BASE = 2600;
const FALL_MIN  = 820;
const RISE_MS   = 820;
const RISE_END_Y = COURT_H * 0.06;

const GOAL  = 20;
const LIVES = 3;

const calcBonus = (hits) => ({
  agility: hits >= GOAL ? 6 : hits >= 15 ? 5 : hits >= 10 ? 4 : hits >= 5 ? 3 : hits >= 2 ? 2 : 1,
  focus:   hits >= GOAL ? 5 : hits >= 15 ? 4 : hits >= 10 ? 3 : hits >= 5 ? 2 : 1,
  health:  hits >= GOAL ? 4 : hits >= 12 ? 3 : hits >= 6  ? 2 : hits >= 2 ? 1 : 0,
});

// ─── Quad easing yardımcıları (JS taraflı konum hesabı) ─────────────────────
const easeInQuad  = t => t * t;
const easeOutQuad = t => 1 - (1 - t) * (1 - t);

// ─── Flash ────────────────────────────────────────────────────────────────────
function FlashOverlay({ color, trigger }) {
  const op = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!trigger) return;
    op.stopAnimation();
    Animated.sequence([
      Animated.timing(op, { toValue: 0.52, duration: 40,  useNativeDriver: true }),
      Animated.timing(op, { toValue: 0,    duration: 300, useNativeDriver: true }),
    ]).start();
  }, [trigger]);
  return (
    <Animated.View pointerEvents="none"
      style={[StyleSheet.absoluteFill, { backgroundColor: color, opacity: op }]} />
  );
}

// ─── Vuruş bölgesi nabzı ──────────────────────────────────────────────────────
function HitPulse({ active }) {
  const op    = useRef(new Animated.Value(0)).current;
  const loopR = useRef(null);
  useEffect(() => {
    if (active) {
      loopR.current = Animated.loop(
        Animated.sequence([
          Animated.timing(op, { toValue: 0.22, duration: 300, useNativeDriver: true }),
          Animated.timing(op, { toValue: 0.06, duration: 300, useNativeDriver: true }),
        ])
      );
      loopR.current.start();
    } else {
      loopR.current?.stop();
      Animated.timing(op, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [active]);
  return (
    <Animated.View pointerEvents="none"
      style={[g.hitOverlay, { opacity: op }]} />
  );
}

// ─── Ana bileşen ─────────────────────────────────────────────────────────────
export default function BadmintonGame({ choice, onComplete }) {
  const [phase,       setPhase]       = useState('ready');
  const [lives,       setLives]       = useState(LIVES);
  const [hits,        setHits]        = useState(0);
  const [inHitZone,   setInHitZone]   = useState(false);
  const [hitTrigger,  setHitTrigger]  = useState(0);
  const [missTrigger, setMissTrigger] = useState(0);
  const [result,      setResult]      = useState(null);
  const [trail,       setTrail]       = useState([]);

  // ── Animated değerler ──────────────────────────────────────────────────────
  const shuttleX   = useRef(new Animated.Value(SW / 2)).current;
  const shuttleY   = useRef(new Animated.Value(-SHUTTLE_R * 2)).current;
  const spinVal    = useRef(new Animated.Value(0)).current;
  const racketX    = useRef(new Animated.Value(SW / 2)).current;
  const swingAngle = useRef(new Animated.Value(0)).current;
  const shadowLeft  = useRef(new Animated.Value(SW / 2 - SHADOW_W / 2)).current;
  const shadowOpac  = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(0.2)).current;

  // ── Mutable ref'ler ────────────────────────────────────────────────────────
  const livesRef  = useRef(LIVES);
  const hitsRef   = useRef(0);
  const phaseRef  = useRef('ready');
  const rxRef     = useRef(SW / 2);   // raket X merkezi
  const sxRef     = useRef(SW / 2);   // kapatağ X (listener'dan)
  const hitLock   = useRef(false);    // çift vuruş koruması

  // Matematiksel Y takibi (addListener'a güvenmez)
  const yAnim = useRef({
    startTime: 0, startY: 0, endY: 0, dur: 0,
    mode: 'fall',           // 'fall' | 'rise_fall'
    riseEndY: 0, riseDur: 0,
  });

  // Animasyon ref'leri
  const fallAnimRef  = useRef(null);
  const driftAnimRef = useRef(null);
  const riseAnimRef  = useRef(null);
  const spinAnimRef  = useRef(null);
  const shadowAnimRef= useRef(null);
  const collideRef   = useRef(null);  // çarpışma interval
  const trailTimer   = useRef(null);

  // Fonksiyon ref'leri (closure güvenliği)
  const doHitRef  = useRef(null);
  const onMissRef = useRef(null);
  const spawnRef  = useRef(null);
  const returnRef = useRef(null);

  // ── Hesaplanan Y ──────────────────────────────────────────────────────────
  const calcY = useCallback(() => {
    const p = yAnim.current;
    const elapsed = Date.now() - p.startTime;
    if (p.mode === 'fall') {
      const t = Math.min(elapsed / p.dur, 1.0);
      return p.startY + (p.endY - p.startY) * easeInQuad(t);
    }
    // rise_fall
    if (elapsed < p.riseDur) {
      const t = elapsed / p.riseDur;
      return p.startY + (p.riseEndY - p.startY) * easeOutQuad(t);
    }
    const t = Math.min((elapsed - p.riseDur) / p.dur, 1.0);
    return p.riseEndY + (p.endY - p.riseEndY) * easeInQuad(t);
  }, []);

  // ── Tüm animasyonları durdur ───────────────────────────────────────────────
  const stopAll = useCallback(() => {
    fallAnimRef.current?.stop();
    driftAnimRef.current?.stop();
    riseAnimRef.current?.stop();
    spinAnimRef.current?.stop();
    shadowAnimRef.current?.stop();
    clearInterval(collideRef.current);
    clearInterval(trailTimer.current);
    shuttleX.removeAllListeners();
  }, []);

  // ── Spin ──────────────────────────────────────────────────────────────────
  const startSpin = useCallback((fast) => {
    spinAnimRef.current?.stop();
    spinVal.setValue(0);
    spinAnimRef.current = Animated.loop(
      Animated.timing(spinVal, {
        toValue: 1, duration: fast ? 320 : 700,
        easing: Easing.linear, useNativeDriver: true,
      })
    );
    spinAnimRef.current.start();
  }, []);

  // ── Çarpışma kontrol döngüsü ──────────────────────────────────────────────
  const startCollision = useCallback(() => {
    clearInterval(collideRef.current);
    let resolved = false;

    collideRef.current = setInterval(() => {
      if (resolved || phaseRef.current !== 'playing') return;

      const y = calcY();

      // Vuruş bölgesi göstergesi güncelle
      const inZone = y >= HIT_Y_TOP;
      setInHitZone(prev => prev !== inZone ? inZone : prev);

      // ── ÇARPIŞMA: kapatağ raket seviyesinde mi? ───────────────────────────
      if (y >= RACKET_CENTER_Y - HIT_TOL_Y && y <= RACKET_CENTER_Y + HIT_TOL_Y) {
        const dx = Math.abs(sxRef.current - rxRef.current);
        if (dx <= HIT_TOL_X) {
          resolved = true;
          clearInterval(collideRef.current);
          doHitRef.current?.();
        }
        // X hizası yok → topun düşmeye devam etmesine izin ver (onMiss animasyon bitişinde)
      }

      // Ekrandan çıktıysa interval'i kapat (animasyon zaten onMiss tetikleyecek)
      if (y >= yAnim.current.endY - 10) {
        resolved = true;
        clearInterval(collideRef.current);
      }
    }, 14);
  }, [calcY]);

  // ── İz ────────────────────────────────────────────────────────────────────
  const startTrail = useCallback(() => {
    clearInterval(trailTimer.current);
    trailTimer.current = setInterval(() => {
      const y = calcY();
      setTrail(prev => {
        const next = [...prev, { id: Date.now(), x: sxRef.current, y }];
        return next.slice(-7);
      });
    }, 75);
  }, [calcY]);

  // ── Servis (ilk kapatağ) ──────────────────────────────────────────────────
  const spawnShuttle = useCallback(() => {
    stopAll();
    hitLock.current = false;
    setInHitZone(false);
    setTrail([]);

    const startX = SW * 0.15 + Math.random() * SW * 0.70;
    const endX   = SW * 0.15 + Math.random() * SW * 0.70;
    const fallMs = Math.max(FALL_MIN, FALL_BASE / Math.max(1, phaseRef.current === 'playing' ? 1 : 1));

    sxRef.current = startX;
    shuttleX.setValue(startX);
    shuttleY.setValue(-SHUTTLE_R * 2);

    // X listener (drift takibi)
    shuttleX.addListener(({ value }) => { sxRef.current = value; });

    // Y matematik parametreleri
    yAnim.current = {
      startTime: Date.now(), startY: -SHUTTLE_R * 2,
      endY: COURT_H + SHUTTLE_R * 4,
      dur: fallMs, mode: 'fall',
    };

    // X animasyonu
    driftAnimRef.current = Animated.timing(shuttleX, {
      toValue: endX, duration: fallMs,
      easing: Easing.inOut(Easing.sin), useNativeDriver: true,
    });
    driftAnimRef.current.start();

    // Y animasyonu (görsel — native driver)
    fallAnimRef.current = Animated.timing(shuttleY, {
      toValue: COURT_H + SHUTTLE_R * 4, duration: fallMs,
      easing: Easing.in(Easing.quad), useNativeDriver: true,
    });
    fallAnimRef.current.start(({ finished }) => {
      if (finished && phaseRef.current === 'playing') onMissRef.current?.();
    });

    // Gölge
    shadowOpac.setValue(0); shadowScale.setValue(0.15);
    shadowLeft.setValue(startX - SHADOW_W / 2);
    shadowAnimRef.current = Animated.parallel([
      Animated.timing(shadowLeft,  { toValue: endX - SHADOW_W / 2, duration: fallMs, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      Animated.timing(shadowOpac,  { toValue: 0.6, duration: 380, useNativeDriver: false }),
      Animated.timing(shadowScale, { toValue: 1.0, duration: fallMs, easing: Easing.in(Easing.quad), useNativeDriver: false }),
    ]);
    shadowAnimRef.current.start();

    startSpin(false);
    startCollision();
    startTrail();
  }, [stopAll, startSpin, startCollision, startTrail]);

  // ── Vuruş sonrası dönüş ────────────────────────────────────────────────────
  const launchReturn = useCallback(() => {
    stopAll();
    hitLock.current = false;
    setInHitZone(false);
    setTrail([]);

    const curX   = sxRef.current;
    const endX   = SW * 0.15 + Math.random() * SW * 0.70;
    const fallMs = Math.max(FALL_MIN, FALL_BASE / speedRef.current * 0.88);
    const totalMs = RISE_MS + fallMs;

    shuttleX.addListener(({ value }) => { sxRef.current = value; });

    yAnim.current = {
      startTime: Date.now(), startY: RACKET_CENTER_Y,
      endY: COURT_H + SHUTTLE_R * 4,
      dur: fallMs, mode: 'rise_fall',
      riseEndY: RISE_END_Y, riseDur: RISE_MS,
    };

    // X drift
    driftAnimRef.current = Animated.timing(shuttleX, {
      toValue: endX, duration: totalMs,
      easing: Easing.inOut(Easing.quad), useNativeDriver: true,
    });
    driftAnimRef.current.start();

    // Y yüksel → düş
    shuttleY.setValue(RACKET_CENTER_Y);
    riseAnimRef.current = Animated.sequence([
      Animated.timing(shuttleY, {
        toValue: RISE_END_Y, duration: RISE_MS,
        easing: Easing.out(Easing.quad), useNativeDriver: true,
      }),
      Animated.timing(shuttleY, {
        toValue: COURT_H + SHUTTLE_R * 4, duration: fallMs,
        easing: Easing.in(Easing.quad), useNativeDriver: true,
      }),
    ]);
    riseAnimRef.current.start(({ finished }) => {
      if (finished && phaseRef.current === 'playing') onMissRef.current?.();
    });

    // Gölge
    shadowScale.setValue(1.0); shadowOpac.setValue(0.6);
    shadowLeft.setValue(curX - SHADOW_W / 2);
    shadowAnimRef.current = Animated.parallel([
      Animated.timing(shadowLeft, { toValue: endX - SHADOW_W / 2, duration: totalMs, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
      Animated.sequence([
        Animated.timing(shadowScale, { toValue: 0.1, duration: RISE_MS,  easing: Easing.out(Easing.quad), useNativeDriver: false }),
        Animated.timing(shadowScale, { toValue: 1.0, duration: fallMs,   easing: Easing.in(Easing.quad),  useNativeDriver: false }),
      ]),
      Animated.sequence([
        Animated.timing(shadowOpac, { toValue: 0.08, duration: RISE_MS, useNativeDriver: false }),
        Animated.timing(shadowOpac, { toValue: 0.6,  duration: fallMs,  useNativeDriver: false }),
      ]),
    ]);
    shadowAnimRef.current.start();

    startSpin(true);
    startCollision();
    startTrail();
  }, [stopAll, startSpin, startCollision, startTrail]);

  // speedRef launchReturn içinde kullanılıyor, dışarıda tut
  const speedRef = useRef(1.0);

  // ── Kaçırma ───────────────────────────────────────────────────────────────
  const onMiss = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    stopAll();
    livesRef.current -= 1;
    setLives(livesRef.current);
    setMissTrigger(t => t + 1);
    setInHitZone(false);
    setTrail([]);
    if (livesRef.current <= 0) {
      phaseRef.current = 'done';
      setPhase('done');
      setResult('lose');
    } else {
      setTimeout(() => { if (phaseRef.current === 'playing') spawnRef.current?.(); }, 950);
    }
  }, [stopAll]);

  // ── Vuruş ─────────────────────────────────────────────────────────────────
  const doHit = useCallback(() => {
    if (phaseRef.current !== 'playing') return;
    if (hitLock.current) return;
    hitLock.current = true;

    stopAll();
    hitsRef.current += 1;
    setHits(hitsRef.current);
    setHitTrigger(t => t + 1);
    setInHitZone(false);
    setTrail([]);

    // Raket sallama
    swingAngle.setValue(0);
    Animated.sequence([
      Animated.timing(swingAngle, { toValue: -26, duration: 65,  useNativeDriver: true }),
      Animated.timing(swingAngle, { toValue:  8,  duration: 85,  useNativeDriver: true }),
      Animated.spring(swingAngle, { toValue: 0, friction: 5, tension: 260, useNativeDriver: true }),
    ]).start();

    if (hitsRef.current >= GOAL) {
      phaseRef.current = 'done';
      setPhase('done');
      setResult('win');
      return;
    }

    if (hitsRef.current % 5 === 0) speedRef.current = Math.min(3.8, speedRef.current + 0.4);

    setTimeout(() => { if (phaseRef.current === 'playing') returnRef.current?.(); }, 160);
  }, [stopAll]);

  // Her render'dan sonra ref'leri güncelle
  useEffect(() => {
    doHitRef.current  = doHit;
    onMissRef.current = onMiss;
    spawnRef.current  = spawnShuttle;
    returnRef.current = launchReturn;
  });

  // ── Başlat ────────────────────────────────────────────────────────────────
  const launch = useCallback(() => {
    phaseRef.current   = 'playing';
    livesRef.current   = LIVES;
    hitsRef.current    = 0;
    speedRef.current   = 1.0;
    rxRef.current      = SW / 2;
    setPhase('playing');
    setLives(LIVES);
    setHits(0);
    setResult(null);
    racketX.setValue(SW / 2);
    swingAngle.setValue(0);
    spawnShuttle();
  }, [spawnShuttle]);

  // ── PanResponder: yalnızca yatay sürükleme ────────────────────────────────
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder:  () => true,
      onPanResponderGrant: (evt) => {
        const cx = Math.max(RACKET_W / 2, Math.min(SW - RACKET_W / 2, evt.nativeEvent.pageX));
        rxRef.current = cx;
        racketX.setValue(cx);
      },
      onPanResponderMove: (evt) => {
        const cx = Math.max(RACKET_W / 2, Math.min(SW - RACKET_W / 2, evt.nativeEvent.pageX));
        rxRef.current = cx;
        racketX.setValue(cx);
      },
    })
  ).current;

  useEffect(() => () => stopAll(), []);

  // ── Interpolasyon ─────────────────────────────────────────────────────────
  const spinRotate   = spinVal.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const racketRotate = swingAngle.interpolate({ inputRange: [-30, 0, 30], outputRange: ['-30deg', '0deg', '30deg'] });

  // ─── HAZIR ────────────────────────────────────────────────────────────────
  if (phase === 'ready') {
    return (
      <View style={g.center}>
        <Text style={{ fontSize: 76, marginBottom: 6 }}>🏸</Text>
        <Text style={g.bigTitle}>Badminton Rallisi</Text>
        <Text style={g.sub}>Kapatağı rakete değdir, ralliyi sürdür!</Text>
        <View style={g.rulesBox}>
          {[
            { icon: '👆', text: 'Parmağını SOL/SAĞ sürükle → raketi konumla' },
            { icon: '🎯', text: 'GÖLGE kapatağın nereye düşeceğini gösterir — tam altına gir' },
            { icon: '🏸', text: 'Kapatağ rakete değdiğinde OTOMATİK vurulur' },
            { icon: '⚡', text: `Her 5 vuruşta hız artar · ${GOAL} ralli = Zafer!` },
          ].map((r, i) => (
            <View key={i} style={g.ruleRow}>
              <Text style={g.ruleIcon}>{r.icon}</Text>
              <Text style={g.ruleText}>{r.text}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={g.startBtn} onPress={launch}>
          <Text style={g.startBtnTxt}>🚀  Başla!</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── SONUÇ ────────────────────────────────────────────────────────────────
  if (phase === 'done') {
    const won = result === 'win';
    const bonus = calcBonus(hitsRef.current);
    return (
      <View style={g.center}>
        <Text style={{ fontSize: 76, marginBottom: 6 }}>{won ? '🏆' : '💔'}</Text>
        <Text style={g.bigTitle}>{won ? 'Ustasın!' : 'Oyun Bitti'}</Text>
        <Text style={g.sub}>
          {won ? `${GOAL} ralli tamamlandı — harika!` : `${hitsRef.current} ralli yaptın.`}
        </Text>
        <View style={g.statsRow}>
          {[
            { v: hitsRef.current,                                        l: '🏸 Ralli' },
            { v: `${livesRef.current}/${LIVES}`,                          l: '❤️ Can'   },
            { v: `${Math.round(speedRef.current * 10) / 10}x`,            l: '⚡ Hız'   },
          ].map((s, i) => (
            <View key={i} style={g.statChip}>
              <Text style={g.statV}>{s.v}</Text>
              <Text style={g.statL}>{s.l}</Text>
            </View>
          ))}
        </View>
        <View style={g.bonusBox}>
          <Text style={g.bonusTitle}>🏸 Kazanılan Bonuslar</Text>
          {bonus.agility > 0 && <Text style={g.bonusLine}>🏃 Çeviklik +{bonus.agility}</Text>}
          {bonus.focus   > 0 && <Text style={g.bonusLine}>🎯 Odak +{bonus.focus}</Text>}
          {bonus.health  > 0 && <Text style={g.bonusLine}>💪 Sağlık +{bonus.health}</Text>}
        </View>
        <TouchableOpacity style={g.startBtn} onPress={() => onComplete(bonus)}>
          <Text style={g.startBtnTxt}>✓  Devam Et</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ─── OYUN ─────────────────────────────────────────────────────────────────
  return (
    <View style={g.screen}>
      {/* HUD */}
      <View style={g.hud}>
        <View style={g.hudRow}>
          <View>
            <Text style={g.hudLabel}>RALLİ</Text>
            <Text style={g.hudBig}>{hits} / {GOAL}</Text>
          </View>
          <View style={g.hudCenter}>
            <Text style={g.hudTitle}>🏸 Badminton</Text>
            <Text style={g.hudSpeed}>⚡ {Math.round(speedRef.current * 10) / 10}x Hız</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={g.hudLabel}>CAN</Text>
            <Text style={[g.hudBig, { fontSize: 16 }]}>
              {'❤️'.repeat(Math.max(0, lives))}{'🖤'.repeat(Math.max(0, LIVES - lives))}
            </Text>
          </View>
        </View>
        <View style={g.progressBar}>
          <View style={[g.progressFill, { width: `${(hits / GOAL) * 100}%` }]} />
        </View>
      </View>

      {/* Saha */}
      <View style={g.court} {...panResponder.panHandlers}>
        <Text style={[g.deco, { left: 8,  top: 52 }]}>🌳</Text>
        <Text style={[g.deco, { right: 8, top: 52 }]}>🌳</Text>
        <Text style={[g.deco, { left: 20, top: COURT_H * 0.38 }]}>🌿</Text>
        <Text style={[g.deco, { right: 20, top: COURT_H * 0.38 }]}>🌿</Text>
        <Text style={[g.deco, { left: '37%', top: COURT_H * 0.56 }]}>🧺</Text>
        <View style={g.floor} />

        {/* Vuruş bölgesi parlama */}
        <HitPulse active={inHitZone} />
        <View style={[g.hitLine, { top: HIT_Y_TOP }]}>
          {inHitZone && (
            <View style={g.hitLabelWrap}>
              <Text style={g.hitLabel}>🏸 VURUS BÖLGESİ</Text>
            </View>
          )}
        </View>

        {/* Kapatağ izi */}
        {trail.map(t => (
          <View key={t.id} style={[g.trailDot, { left: t.x - 5, top: t.y - 5 }]} />
        ))}

        {/* Gölge */}
        <Animated.View style={[g.shadow, {
          left: shadowLeft, opacity: shadowOpac,
          transform: [{ scaleX: shadowScale }],
        }]} />

        {/* Kapatağ */}
        <Animated.Text style={[g.shuttle, {
          transform: [
            { translateX: shuttleX },
            { translateY: shuttleY },
            { rotate: spinRotate },
          ],
        }]}>🏸</Animated.Text>

        {/* Raket */}
        <Animated.View style={[g.racketWrap, {
          transform: [
            { translateX: racketX },
            { rotate: racketRotate },
          ],
        }]}>
          <View style={[g.racketHead, inHitZone && g.racketGlow]} />
          <View style={g.racketHandle} />
          <View style={g.racketGrip} />
        </Animated.View>

        <FlashOverlay color="#22c55e" trigger={hitTrigger} />
        <FlashOverlay color="#ef4444" trigger={missTrigger} />
      </View>

      {/* Kontrol */}
      <View style={g.ctrl}>
        <Text style={[g.ctrlMain, inHitZone && { color: HCOLOR }]}>
          {inHitZone ? '🏸 Kapatağ geliyor — HAZIR OL!' : '← Sürükle, gölgenin üstüne gel →'}
        </Text>
        <Text style={g.ctrlSub}>Gölgeyi takip et · Raket kapatağa değince otomatik vurulur</Text>
      </View>
    </View>
  );
}

// ─── Stiller ──────────────────────────────────────────────────────────────────
const g = StyleSheet.create({
  screen:  { flex: 1, backgroundColor: '#06150a' },
  center:  { flex: 1, backgroundColor: '#06150a', alignItems: 'center', justifyContent: 'center', padding: 24 },

  hud:          { height: HUD_H, paddingTop: SAFE_TOP + 6, paddingHorizontal: 16, backgroundColor: '#081a0c', borderBottomWidth: 1, borderBottomColor: '#1e4a28' },
  hudRow:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 7 },
  hudLabel:     { color: '#3a6b47', fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },
  hudBig:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  hudCenter:    { alignItems: 'center' },
  hudTitle:     { color: RCOLOR, fontSize: 14, fontWeight: '900' },
  hudSpeed:     { color: HCOLOR, fontSize: 11, marginTop: 2 },
  progressBar:  { height: 5, backgroundColor: '#1e4a28', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: RCOLOR, borderRadius: 3 },

  court:    { flex: 1, backgroundColor: '#0b2010', overflow: 'hidden', position: 'relative' },
  floor:    { position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, backgroundColor: '#1e4a2888' },
  deco:     { position: 'absolute', fontSize: 28, opacity: 0.3 },

  hitOverlay:   { position: 'absolute', left: 0, right: 0, top: HIT_Y_TOP, bottom: 0, backgroundColor: HCOLOR },
  hitLine:      { position: 'absolute', left: 0, right: 0, height: 2, backgroundColor: HCOLOR + '55' },
  hitLabelWrap: { alignItems: 'center', marginTop: 5 },
  hitLabel:     { color: HCOLOR, fontSize: 12, fontWeight: '900', letterSpacing: 0.5,
                  textShadowColor: '#000', textShadowOffset: { width: 0, height: 1 }, textShadowRadius: 3 },

  trailDot: { position: 'absolute', width: 10, height: 10, borderRadius: 5, backgroundColor: RCOLOR + '77' },

  shadow: {
    position: 'absolute',
    bottom: RACKET_BOT + RACKET_H + 6,
    width: SHADOW_W, height: 14, borderRadius: 7,
    backgroundColor: '#000000',
  },

  shuttle: {
    position: 'absolute',
    fontSize: SHUTTLE_R * 2,
    marginLeft: -SHUTTLE_R,
    marginTop: -SHUTTLE_R,
  },

  racketWrap: {
    position: 'absolute',
    bottom: RACKET_BOT,
    left: 0,
    marginLeft: -RACKET_W / 2,
    alignItems: 'center',
  },
  racketHead: {
    width: RACKET_W, height: RACKET_H,
    borderRadius: RACKET_H / 2,
    backgroundColor: '#15803d',
    borderWidth: 2.5, borderColor: RCOLOR,
  },
  racketGlow: {
    backgroundColor: '#16a34a', borderColor: '#bbf7d0',
    shadowColor: HCOLOR, shadowOpacity: 1, shadowRadius: 16, elevation: 14,
  },
  racketHandle: { width: 9, height: 18, backgroundColor: '#78350f', borderRadius: 4, marginTop: 2 },
  racketGrip:   { width: 13, height: 10, backgroundColor: '#451a03', borderRadius: 3, marginTop: 1 },

  ctrl:     { height: CTRL_H, backgroundColor: '#081a0c', borderTopWidth: 1, borderTopColor: '#1e4a28', justifyContent: 'center', alignItems: 'center', gap: 5 },
  ctrlMain: { color: '#e6edf3', fontSize: 14, fontWeight: '800', textAlign: 'center' },
  ctrlSub:  { color: '#3a6b47', fontSize: 11, textAlign: 'center' },

  bigTitle:    { color: '#e6edf3', fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 8 },
  sub:         { color: '#8b949e', fontSize: 14, textAlign: 'center', marginBottom: 20, lineHeight: 20 },
  rulesBox:    { backgroundColor: '#081a0c', borderRadius: 18, padding: 18, marginBottom: 26, width: '100%', gap: 12, borderWidth: 1, borderColor: '#1e4a28' },
  ruleRow:     { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  ruleIcon:    { fontSize: 20, width: 28, textAlign: 'center', marginTop: 1 },
  ruleText:    { color: '#c9d4df', fontSize: 13, flex: 1, lineHeight: 19 },
  startBtn:    { backgroundColor: '#15803d', paddingVertical: 16, paddingHorizontal: 52, borderRadius: 18, shadowColor: RCOLOR, shadowOpacity: 0.55, shadowRadius: 14 },
  startBtnTxt: { color: '#fff', fontSize: 18, fontWeight: '900' },
  statsRow:    { flexDirection: 'row', gap: 10, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' },
  statChip:    { backgroundColor: '#081a0c', borderRadius: 14, padding: 14, alignItems: 'center', minWidth: 82, borderWidth: 1, borderColor: '#1e4a28' },
  statV:       { color: '#e6edf3', fontSize: 20, fontWeight: '900' },
  statL:       { color: '#3a6b47', fontSize: 10, marginTop: 3 },
  bonusBox:    { backgroundColor: '#081a0c', borderRadius: 14, padding: 14, marginBottom: 20, width: '100%', alignItems: 'center', borderWidth: 1, borderColor: '#1e4a28' },
  bonusTitle:  { color: '#e6edf3', fontSize: 13, fontWeight: '700', marginBottom: 6 },
  bonusLine:   { color: RCOLOR, fontSize: 14, marginBottom: 3 },
});
